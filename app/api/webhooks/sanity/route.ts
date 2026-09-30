import { NextResponse, after, type NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { parseBody } from "next-sanity/webhook";
import { notifyIndexNow } from "@/lib/integrations/indexnow";

/**
 * Sanity → this app on publish (create/update/delete of published documents),
 * so editing content shows up within seconds without a full redeploy
 * (ARCHITECTURE.md §8, "on-demand ISR"). The webhook has no projection, so the
 * body is the whole document. Also tells search engines via IndexNow which
 * public pages changed (after responding; a failure is only logged).
 */

type WebhookBody = { _type?: string; slug?: { current?: string }; category?: string; publishedAt?: string };

/** Public pages a change to this document affects, or none. */
function changedPaths(body: WebhookBody): string[] {
  const slug = body.slug?.current;
  if (body._type === "article" && slug && body.category) {
    // A future-dated article isn't live yet (its URL 404s), so it's left to the sitemap.
    if (body.publishedAt && new Date(body.publishedAt).getTime() > Date.now()) return [];
    return [`/${body.category}/${slug}`, `/${body.category}`, "/"];
  }
  if (body._type === "legalPage" && slug) return [`/${slug}`];
  return [];
}
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[api/webhooks/sanity] SANITY_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Sanity webhook is not configured yet" }, { status: 501 });
  }

  const { isValidSignature, body } = await parseBody<WebhookBody>(request, secret);
  if (!isValidSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  if (!body?._type) {
    return NextResponse.json({ error: "Missing document type in payload" }, { status: 400 });
  }

  // Coarse-grained for now: revalidate by document type. Once real content
  // types exist, this can narrow to exact paths (e.g. the specific
  // article/category route) via `revalidatePath`.
  revalidateTag(body._type);
  if (body.slug?.current) {
    revalidatePath(`/${body.slug.current}`);
  }

  const paths = changedPaths(body);
  after(() =>
    notifyIndexNow(paths).catch((err) => console.error("[api/webhooks/sanity] IndexNow notify failed:", err)),
  );

  return NextResponse.json({ revalidated: true, type: body._type });
}
