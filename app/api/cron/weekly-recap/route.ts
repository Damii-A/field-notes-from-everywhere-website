import { NextResponse, type NextRequest } from "next/server";
import { sendNewsletterDraftNotice } from "@/lib/integrations/resend";
import { sanityQuery } from "@/lib/sanity/serverApi";
import { SITE_URL } from "@/lib/siteUrl";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

/**
 * Weekly newsletter — triggered by Vercel Cron on Tuesdays at 14:00 UTC (see
 * vercel.json). Emails the user a link that opens a new `weeklyNewsletter` in
 * the Studio, already filled in with the past 7 days' articles (the schema's
 * initialValue does that with the user's own Studio login, so this server
 * needs no write access). The user edits it, presses "Create Resend draft" and
 * sends or schedules it in Resend for Wednesday; nothing is sent to readers
 * from here (DECISIONS.md, 2026-10-05). A week with nothing new gets a "no
 * newsletter this week" note instead.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Keyed to the Wednesday it's meant for (the day after this run).
  const sendDate = new Date(Date.now() + DAY_MS).toISOString().slice(0, 10);
  const count = await sanityQuery<number>(
    `count(*[_type == "article" && publishedAt <= now() && dateTime(publishedAt) >= dateTime($since)])`,
    { since: new Date(Date.now() - WEEK_MS).toISOString() },
    "published",
  );

  if (count === 0) {
    await sendNewsletterDraftNotice(sendDate, { empty: true });
    return NextResponse.json({ notified: true, articleCount: 0 });
  }
  await sendNewsletterDraftNotice(sendDate, { studioUrl: `${SITE_URL}/studio/intent/create/type=weeklyNewsletter`, articleCount: Math.min(count, 10) });
  return NextResponse.json({ notified: true, articleCount: count });
}
