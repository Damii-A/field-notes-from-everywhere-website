import { NextResponse } from "next/server";
import { subscribeToKit } from "@/lib/integrations/kit";
import { sendBookListEmail } from "@/lib/integrations/resend";
import { getArticleBySlug } from "@/lib/content";
import type { CategorySlug } from "@/lib/content";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SubscribeBody {
  email: string;
  source: "send-list" | "newsletter";
  articleSlug?: string;
  category?: CategorySlug;
}

/**
 * Powers both free-list email capture points from pub_article.md §6.4 —
 * the article "send this list to me" popup — and, more generally, any
 * future free-list signup point. Kit gets every subscriber (the ongoing
 * list relationship); Resend sends the one-off list email for "send-list"
 * requests specifically. See ARCHITECTURE.md §9.
 */
export async function POST(request: Request) {
  let body: SubscribeBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { email, source, articleSlug, category } = body;
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
  }
  if (source !== "send-list" && source !== "newsletter") {
    return NextResponse.json({ error: "Invalid source" }, { status: 400 });
  }

  try {
    await subscribeToKit({ email, tagId: process.env.KIT_PUBLICATION_FORM_ID });
  } catch (err) {
    console.error("[api/subscribe] Kit subscribe failed:", err);
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
      // The Kit subscribe above already succeeded — don't report total
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
