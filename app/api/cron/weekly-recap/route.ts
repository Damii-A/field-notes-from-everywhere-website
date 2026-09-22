import { NextResponse, type NextRequest } from "next/server";
import { getFeedArticles } from "@/lib/content";
import { listActiveSubscriberEmails } from "@/lib/integrations/kit";
import { sendWeeklyRecap } from "@/lib/integrations/resend";

const RECAP_WINDOW_DAYS = 7;
const FEED_FETCH_LIMIT = 50; // generous upper bound on a week's worth of articles

/**
 * Weekly Publication recap — replaces Kit's RSS-to-email (Creator-plan-only,
 * see DECISIONS.md "Build the weekly recap ourselves via Resend"). Triggered
 * by Vercel Cron (see vercel.json); Kit stays the subscriber-list source of
 * truth, Resend does the actual sending.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const cutoff = Date.now() - RECAP_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const recent = await getFeedArticles(FEED_FETCH_LIMIT);
  const articles = recent.filter((a) => new Date(a.publishedAt).getTime() >= cutoff);

  if (articles.length === 0) {
    return NextResponse.json({ sent: false, reason: "no articles published in the last 7 days" });
  }

  const recipients = await listActiveSubscriberEmails();
  const weekKey = new Date().toISOString().slice(0, 10);
  await sendWeeklyRecap(recipients, articles, weekKey);

  return NextResponse.json({ sent: true, articleCount: articles.length, recipientCount: recipients.length });
}
