import { NextResponse, type NextRequest } from "next/server";
import { getFeedArticles } from "@/lib/content";
import { listSegmentContacts, sendWeeklyRecap, ResendNotConfiguredError, type ResendContactInfo } from "@/lib/integrations/resend";

const RECAP_HIGHLIGHT_COUNT = 10; // publishing volume can exceed 20/week — a digest, not a full listing

/**
 * Weekly Publication recap — replaces Kit's RSS-to-email (Creator-plan-only,
 * see DECISIONS.md "Build the weekly recap ourselves via Resend"). Triggered
 * by Vercel Cron (see vercel.json). Recipients are everyone in either
 * free-list Resend segment (newsletter signup or send-list opt-in) — Kit is
 * not involved at all (see DECISIONS.md, "Move the free list from Kit to
 * Resend contacts"). Sends the most recent `RECAP_HIGHLIGHT_COUNT` articles
 * as a digest with a link to see everything else, not every article
 * published that week — at 20+ articles/week that would make the email
 * unreadable.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const articles = await getFeedArticles(RECAP_HIGHLIGHT_COUNT);

  if (articles.length === 0) {
    return NextResponse.json({ sent: false, reason: "no articles published yet" });
  }

  const newsletterSegmentId = process.env.RESEND_NEWSLETTER_SEGMENT_ID;
  const sendListSegmentId = process.env.RESEND_SEND_LIST_SEGMENT_ID;
  if (!newsletterSegmentId || !sendListSegmentId) throw new ResendNotConfiguredError();

  const [newsletterContacts, sendListContacts] = await Promise.all([
    listSegmentContacts(newsletterSegmentId),
    listSegmentContacts(sendListSegmentId),
  ]);
  const byEmail = new Map<string, ResendContactInfo>();
  for (const c of [...newsletterContacts, ...sendListContacts]) byEmail.set(c.email, c);
  const recipients = [...byEmail.values()];

  const weekKey = new Date().toISOString().slice(0, 10);
  await sendWeeklyRecap(recipients, articles, weekKey);

  return NextResponse.json({ sent: true, articleCount: articles.length, recipientCount: recipients.length });
}
