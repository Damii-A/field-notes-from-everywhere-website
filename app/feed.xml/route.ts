import { CATEGORIES, articlePath, getFeedArticles } from "@/lib/content";

/**
 * RSS feed of the most recent Publication articles across all three
 * categories — built specifically so Kit's RSS-to-email automation can turn
 * new entries into the weekly recap newsletter automatically (see
 * CURRENT_STATE.md, "Email/subscriber architecture"). Point that Kit
 * automation at `<site-url>/feed.xml`.
 */
const SITE_URL = process.env.SITE_URL || "http://localhost:3000";
const FEED_ITEM_LIMIT = 30;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const articles = await getFeedArticles(FEED_ITEM_LIMIT);

  const items = articles
    .map((article) => {
      const url = `${SITE_URL}${articlePath(article)}`;
      const category = CATEGORIES[article.category].name;
      return `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
      <category>${escapeXml(category)}</category>
      <description>${escapeXml(article.methodologySentence)}</description>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Field Notes From Everywhere — Publication</title>
    <link>${SITE_URL}</link>
    <description>New reader-recommendation reading lists from The Shortlist, What to Read When, and Book Club Book Picks.</description>
    <language>en-us</language>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=300",
    },
  });
}
