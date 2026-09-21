import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { parseBody } from "next-sanity/webhook";

/**
 * Sanity → this app on publish, so editing content shows up within seconds
 * without a full redeploy (ARCHITECTURE.md §8, "on-demand ISR"). Not yet
 * configured — no Sanity project/webhook exists yet, see CURRENT_STATE.md.
 * Configure the webhook in Sanity's project settings to POST here with a
 * signature computed from SANITY_WEBHOOK_SECRET once that project exists.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[api/webhooks/sanity] SANITY_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Sanity webhook is not configured yet" }, { status: 501 });
  }

  const { isValidSignature, body } = await parseBody<{ _type?: string; slug?: { current?: string } }>(request, secret);
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

  return NextResponse.json({ revalidated: true, type: body._type });
}
