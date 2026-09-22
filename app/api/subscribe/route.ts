import { NextResponse } from "next/server";
import { addToSegment, sendBookListEmail, ResendNotConfiguredError } from "@/lib/integrations/resend";
import { getArticleBySlug } from "@/lib/content";
import type { CategorySlug } from "@/lib/content";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SubscribeBody {
  name: string;
  email: string;
  source: "send-list" | "newsletter";
  articleSlug?: string;
  category?: CategorySlug;
}

/**
 * Powers both free-list email capture points from pub_article.md §6.4 —
 * the article "send this list to me" popup — and, more generally, any
 * future free-list signup point. Resend's own contacts hold the free list,
 * tagged by segment (`RESEND_NEWSLETTER_SEGMENT_ID` /
 * `RESEND_SEND_LIST_SEGMENT_ID`) so the two entry points are distinguishable
 * — Kit is not involved at all (see DECISIONS.md, "Move the free list from
 * Kit to Resend contacts"). Resend also sends the one-off list email for
 * "send-list" requests specifically. See ARCHITECTURE.md §9.
 */
export async function POST(request: Request) {
  let body: SubscribeBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, email, source, articleSlug, category } = body;
  if (!name || !name.trim()) {
    return NextResponse.json({ error: "A name is required" }, { status: 400 });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
  }
  if (source !== "send-list" && source !== "newsletter") {
    return NextResponse.json({ error: "Invalid source" }, { status: 400 });
  }

  try {
    const segmentId = source === "send-list" ? process.env.RESEND_SEND_LIST_SEGMENT_ID : process.env.RESEND_NEWSLETTER_SEGMENT_ID;
    if (!segmentId) throw new ResendNotConfiguredError();
    await addToSegment(email, name, segmentId);
  } catch (err) {
    console.error("[api/subscribe] Resend subscribe failed:", err);
    return NextResponse.json(
      { error: "Couldn't subscribe you right now. This service isn't fully configured yet — see CURRENT_STATE.md." },
      { status: 502 },
    );
  }

  if (source === "send-list") {
    if (!articleSlug || !category) {
      return NextResponse.json({ error: "articleSlug and category are required for source=send-list" }, { status: 400 });
    }
    const article = await getArticleBySlug(category, articleSlug);
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }
    try {
      await sendBookListEmail(email, article);
    } catch (err) {
      console.error("[api/subscribe] Resend send failed:", err);
      // The segment subscribe above already succeeded — don't report total
      // failure, since the reader IS on the list now, just tell the truth
      // about the one-off email.
      return NextResponse.json(
        { subscribed: true, listEmailSent: false, warning: "Subscribed, but couldn't send the list email right now." },
        { status: 207 },
      );
    }
  }

  return NextResponse.json({ subscribed: true, listEmailSent: source === "send-list" });
}
