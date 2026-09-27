import { NextResponse, type NextRequest } from "next/server";
import { getFeedArticles } from "@/lib/content";
import { sendWeeklyNewsletter } from "@/lib/integrations/resend";

const RECAP_HIGHLIGHT_COUNT = 10; // publishing volume can exceed 20/week — a digest, not a full listing
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Weekly newsletter (the "weekly recap") — triggered by Vercel Cron on Sundays
 * (see vercel.json). Sends up to `RECAP_HIGHLIGHT_COUNT` of the articles
 * published in the past 7 days, as a Resend Broadcast to everyone on the free
 * email list (see `sendWeeklyNewsletter`). A week with nothing new sends
 * nothing: the email promises a roundup of that week's lists.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const since = Date.now() - WEEK_MS;
  const articles = (await getFeedArticles(RECAP_HIGHLIGHT_COUNT)).filter((a) => new Date(a.publishedAt).getTime() >= since);

  if (articles.length === 0) {
    return NextResponse.json({ sent: false, reason: "no articles published in the past 7 days" });
  }

  const weekKey = new Date().toISOString().slice(0, 10);
  const result = await sendWeeklyNewsletter(articles, weekKey);

  return NextResponse.json({ ...result, articleCount: articles.length, reason: result.sent ? undefined : "already sent this week" });
}
