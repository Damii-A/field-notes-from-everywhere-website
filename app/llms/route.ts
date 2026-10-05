import { CATEGORY_LIST, articlePath, getFeedArticles } from "@/lib/content";
import { SITE_DESCRIPTION } from "@/lib/metadata";
import { SITE_URL } from "@/lib/siteUrl";

/**
 * /llms.txt (llmstxt.org): a Markdown overview of the site for AI tools,
 * built from published content so new articles appear automatically.
 * Served at /llms.txt through a rewrite (next.config.mjs), for the same
 * reason /feed.xml is: a dotted route folder name 404'd on Vercel (see
 * app/rss/route.ts). Wording comes from the site's own copy only.
 */
const ARTICLE_LIMIT = 1000;

export async function GET() {
  const articles = await getFeedArticles(ARTICLE_LIMIT);

  const columns = CATEGORY_LIST.map((cat) => {
    const list = articles
      .filter((a) => a.category === cat.slug)
      .map((a) => `- [${a.title}](${SITE_URL}${articlePath(a)}): ${a.description}`);
    return [`## ${cat.name}`, "", cat.description, "", `- [${cat.name}](${SITE_URL}/${cat.slug}): all articles in this column`, ...list].join("\n");
  });

  const text = [
    "# Field Notes From Everywhere",
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    "The Publication is free and has three columns of reading lists, below. The books in each list come from reader recommendations gathered across real reader discussions.",
    "",
    `- [How we find the books](${SITE_URL}/about#how-we-find-the-books): the research method behind every list`,
    `- [About](${SITE_URL}/about)`,
    "",
    ...columns.flatMap((c) => [c, ""]),
    "## The Reading Room",
    "",
    `- [The Reading Room](${SITE_URL}/the-reading-room): 30 themed book recommendations, every Tuesday, Thursday and Saturday. $7/month, cancel anytime.`,
    "",
    "## Optional",
    "",
    `- [Contact](${SITE_URL}/contact)`,
    `- [Terms](${SITE_URL}/terms)`,
    `- [Privacy & Cookies](${SITE_URL}/privacy-and-cookies)`,
    `- [Disclosures](${SITE_URL}/disclosures)`,
    `- [RSS feed](${SITE_URL}/feed.xml)`,
    "",
  ].join("\n");

  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=300",
    },
  });
}
