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

type WebhookBody = {
  _type?: string;
  slug?: { current?: string };
  category?: string;
  publishedAt?: string;
  bookEntries?: { book?: { _ref?: string } }[];
};

const PROJECT_ID =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID || process.env.SANITY_API_PROJECT_ID;
const DATASET =
  process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_STUDIO_DATASET || process.env.SANITY_API_DATASET || "production";
const TOKEN = process.env.SANITY_API_TOKEN || process.env.SANITY_API_READ_TOKEN;

/**
 * "Where to read" pages a change affects (DECISIONS.md, 2026-10-02): a live
 * article's books (their pages list the article), or an edited book itself.
 * The webhook body only has book ids, so their slugs are looked up.
 */
async function whereToReadPaths(body: WebhookBody): Promise<string[]> {
  if (body._type === "book") return body.slug?.current ? [`/where-to-read/${body.slug.current}`] : [];
  if (body._type !== "article" || changedPaths(body).length === 0) return [];
  const ids = (body.bookEntries ?? []).map((e) => e.book?._ref).filter((id): id is string => !!id);
  if (ids.length === 0 || !PROJECT_ID || !TOKEN) return [];
  const url = new URL(`https://${PROJECT_ID}.api.sanity.io/v2025-02-19/data/query/${DATASET}`);
  url.searchParams.set("query", `*[_type == "book" && _id in $ids && defined(slug.current)].slug.current`);
  url.searchParams.set("$ids", JSON.stringify(ids));
  url.searchParams.set("perspective", "published");
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` }, cache: "no-store" });
  if (!res.ok) throw new Error(`Sanity book-slug lookup failed: ${res.status}`);
  const { result } = (await res.json()) as { result: string[] };
  return result.map((slug) => `/where-to-read/${slug}`);
}

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
  after(async () => {
    try {
      await notifyIndexNow([...paths, ...(await whereToReadPaths(body))]);
    } catch (err) {
      console.error("[api/webhooks/sanity] IndexNow notify failed:", err);
    }
  });

  return NextResponse.json({ revalidated: true, type: body._type });
}
