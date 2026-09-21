/**
 * Content access layer. Every page reads through here, never through
 * `mock-data.ts` directly — that's what makes swapping this module's
 * internals for real Sanity GROQ queries (once a project exists, see
 * CURRENT_STATE.md) a change in one file instead of a rewrite of every page.
 * All functions are `async` now even though the mock implementation doesn't
 * need to be, so call sites already match what the Sanity-backed versions
 * will look like.
 */
import type { Article, ArticleSummary, CategorySlug, LegalPage, SiteSettings } from "./types";
import { LEAD_BY_CATEGORY, POOL_BY_CATEGORY, slugify } from "./mock-data";

export { CATEGORIES, CATEGORY_LIST } from "./categories";
export type { Article, ArticleSummary, BookEntry, CategoryDef, CategorySlug, LegalPage, TagRef } from "./types";

export const HUB_INITIAL_COUNT = 9;
export const HUB_PAGE_INCREMENT = 6;

export async function getLatestArticle(category: CategorySlug): Promise<Article> {
  return LEAD_BY_CATEGORY[category];
}

export interface HubPage {
  latest: Article;
  /** Every article in the category, newest first — "See more" reveals more
   * of this client-side rather than a fresh request (pub_hub.md §13: "does
   * not [navigate] to a separate archive page"). Fine at this content
   * volume; revisit with real pagination if a category's archive grows
   * into the thousands. */
  articles: ArticleSummary[];
}

export async function getHubArticles(category: CategorySlug): Promise<HubPage> {
  const pool = POOL_BY_CATEGORY[category];
  const articles: ArticleSummary[] = pool.map((p) => ({
    slug: slugify(p.title),
    category,
    title: p.title,
    meta: p.meta,
  }));
  return { latest: LEAD_BY_CATEGORY[category], articles };
}

/**
 * Only the category's lead article has hand-authored content right now (see
 * mock-data.ts). Any other pool slug resolves to a synthesized placeholder
 * that reuses the lead's book list/intro — clearly not real content, but
 * enough to keep every hub-card link functional instead of 404ing until
 * Sanity is populated with real articles.
 */
export async function getArticleBySlug(category: CategorySlug, slug: string): Promise<Article | null> {
  const lead = LEAD_BY_CATEGORY[category];
  if (slug === lead.slug) return lead;

  const pool = POOL_BY_CATEGORY[category];
  const match = pool.find((p) => slugify(p.title) === slug);
  if (!match) return null;

  return {
    ...lead,
    slug,
    title: match.title,
    meta: match.meta,
    whatToReadNext: [
      { slug: lead.slug, category: lead.category, title: lead.title, meta: lead.meta },
      ...lead.whatToReadNext.slice(0, 1),
    ],
  };
}

export async function getLegalPage(slug: LegalPage["slug"]): Promise<LegalPage> {
  const titles: Record<LegalPage["slug"], string> = {
    terms: "Terms",
    "privacy-and-cookies": "Privacy & Cookies",
    disclosures: "Disclosures",
  };
  const bodies: Record<LegalPage["slug"], string> = {
    terms:
      "<p>This page holds the Field Notes From Everywhere terms of use. Real legal copy has not been supplied yet — see CURRENT_STATE.md.</p>",
    "privacy-and-cookies":
      "<p>This page holds the Field Notes From Everywhere privacy and cookies policy. Real legal copy has not been supplied yet — see CURRENT_STATE.md.</p>",
    disclosures:
      "<p>This page holds the Field Notes From Everywhere disclosures: how advertising, sponsorship and affiliate relationships work, and how they are kept separate from the research that determines which books we recommend. Real legal copy has not been supplied yet — see CURRENT_STATE.md.</p>",
  };
  return { slug, title: titles[slug], bodyHtml: bodies[slug] };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return {
    contactEmail: "hello@fieldnotesfromeverywhere.com",
    socialLinks: {},
    readingRoomPriceCopy: "7 days free, no credit card. $5/month after that.",
  };
}

export interface HomeShowcase {
  when: ArticleSummary[];
  shortlist: ArticleSummary[];
  clubPairs: [ArticleSummary, ArticleSummary][];
}

export async function getHomeShowcase(): Promise<HomeShowcase> {
  const when = POOL_BY_CATEGORY["what-to-read-when"].slice(0, 5).map((p) => ({
    slug: slugify(p.title),
    category: "what-to-read-when" as CategorySlug,
    title: p.title,
    meta: p.meta,
  }));
  const shortlist = POOL_BY_CATEGORY["the-shortlist"].slice(0, 5).map((p) => ({
    slug: slugify(p.title),
    category: "the-shortlist" as CategorySlug,
    title: p.title,
    meta: p.meta,
  }));
  const clubItems = POOL_BY_CATEGORY["book-club-book-picks"].slice(0, 6).map((p) => ({
    slug: slugify(p.title),
    category: "book-club-book-picks" as CategorySlug,
    title: p.title,
    meta: p.meta,
  }));
  const clubPairs: [ArticleSummary, ArticleSummary][] = [
    [clubItems[0]!, clubItems[1]!],
    [clubItems[2]!, clubItems[3]!],
    [clubItems[4]!, clubItems[5]!],
  ];
  return { when, shortlist, clubPairs };
}

export function categoryPath(category: CategorySlug): string {
  return `/${category}`;
}

export function articlePath(article: Pick<Article, "category" | "slug">): string {
  return `/${article.category}/${article.slug}`;
}

export function categoryHref(category: CategorySlug): string {
  return categoryPath(category);
}
