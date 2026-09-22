import { NextResponse, type NextRequest } from "next/server";
import { getFeedArticles } from "@/lib/content";
import { listActiveSubscribers } from "@/lib/integrations/kit";
import { sendWeeklyRecap } from "@/lib/integrations/resend";

const RECAP_HIGHLIGHT_COUNT = 10; // publishing volume can exceed 20/week — a digest, not a full listing

/**
 * Weekly Publication recap — replaces Kit's RSS-to-email (Creator-plan-only,
 * see DECISIONS.md "Build the weekly recap ourselves via Resend"). Triggered
 * by Vercel Cron (see vercel.json); Kit stays the subscriber-list source of
 * truth, Resend does the actual sending. Sends the most recent
 * `RECAP_HIGHLIGHT_COUNT` articles as a digest with a link to see everything
 * else, not every article published that week — at 20+ articles/week that
 * would make the email unreadable.
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

  const recipients = await listActiveSubscribers();
  const weekKey = new Date().toISOString().slice(0, 10);
  await sendWeeklyRecap(recipients, articles, weekKey);

  return NextResponse.json({ sent: true, articleCount: articles.length, recipientCount: recipients.length });
}
