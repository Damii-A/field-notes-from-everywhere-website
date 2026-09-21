/**
 * Content access layer. Every page reads through here, never through Sanity
 * directly — that's what keeps every page decoupled from exactly how
 * content is fetched. Backed by real Sanity GROQ queries (see
 * lib/sanity/groqFetch.ts); CURRENT_STATE.md tracks what's been authored in
 * the Studio so far (as of this writing: nothing — see the empty-state
 * handling below and in the pages that call these functions).
 */
import { groqFetch } from "@/lib/sanity/groqFetch";
import { portableTextToHtml, portableTextToParagraphs } from "./portableText";
import type { Article, ArticleSummary, BookEntry, CategorySlug, LegalPage, SiteSettings, TagRef } from "./types";

export { CATEGORIES, CATEGORY_LIST } from "./categories";
export type { Article, ArticleSummary, BookEntry, CategoryDef, CategorySlug, LegalPage, TagRef } from "./types";

export const HUB_INITIAL_COUNT = 9;
export const HUB_PAGE_INCREMENT = 6;

function formatMeta(bookCount: number, publishedAt: string): string {
  const date = new Date(publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${bookCount} book${bookCount === 1 ? "" : "s"} · ${date}`;
}

// ---------------------------------------------------------------------------
// Raw Sanity response shapes (only the fields each GROQ projection selects).
// ---------------------------------------------------------------------------

interface RawImage {
  url: string;
  alt?: string;
}

interface RawArticleSummary {
  slug: string;
  category: CategorySlug;
  title: string;
  bookCount: number;
  publishedAt: string;
  heroImage: RawImage | null;
}

interface RawTag {
  label: string;
  slug: string;
  group?: TagRef["group"];
}

interface RawBookEntry {
  rank?: number;
  blurb?: string;
  tagOverrides: RawTag[] | null;
  refBook: {
    title: string;
    author: string;
    canonicalBlurb?: string;
    coverImage: RawImage | null;
    tags: RawTag[] | null;
  } | null;
}

interface RawArticle extends RawArticleSummary {
  author: string;
  methodologySentence: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  introText: any[] | undefined;
  bookEntries: RawBookEntry[] | null;
  whatToReadNext: RawArticleSummary[] | null;
}

function toArticleSummary(raw: RawArticleSummary): ArticleSummary {
  return {
    slug: raw.slug,
    category: raw.category,
    title: raw.title,
    meta: formatMeta(raw.bookCount, raw.publishedAt),
    heroImage: raw.heroImage ? { url: raw.heroImage.url, alt: raw.heroImage.alt ?? raw.title } : undefined,
  };
}

function toBookEntry(raw: RawBookEntry): BookEntry | null {
  if (!raw.refBook) return null; // dangling reference — skip rather than crash on bad CMS data
  const tags = raw.tagOverrides && raw.tagOverrides.length > 0 ? raw.tagOverrides : raw.refBook.tags ?? undefined;
  return {
    rank: raw.rank,
    title: raw.refBook.title,
    author: raw.refBook.author,
    blurb: raw.blurb || raw.refBook.canonicalBlurb || "",
    tags: tags?.map((t) => ({ label: t.label, slug: t.slug, group: t.group })),
    coverImage: raw.refBook.coverImage ? { url: raw.refBook.coverImage.url, alt: raw.refBook.title } : undefined,
  };
}

function toArticle(raw: RawArticle): Article {
  return {
    ...toArticleSummary(raw),
    author: raw.author,
    publishedAt: raw.publishedAt,
    methodologySentence: raw.methodologySentence,
    introParagraphs: portableTextToParagraphs(raw.introText),
    books: (raw.bookEntries ?? []).map(toBookEntry).filter((b): b is BookEntry => b !== null),
    whatToReadNext: (raw.whatToReadNext ?? []).map(toArticleSummary),
  };
}

const SUMMARY_PROJECTION = `{
  "slug": slug.current,
  category,
  title,
  "bookCount": count(bookEntries),
  publishedAt,
  heroImage{ "url": asset->url, alt }
}`;

const FULL_ARTICLE_PROJECTION = `{
  "slug": slug.current,
  category,
  title,
  "bookCount": count(bookEntries),
  publishedAt,
  heroImage{ "url": asset->url, alt },
  author,
  methodologySentence,
  introText,
  bookEntries[]{
    rank,
    blurb,
    "tagOverrides": tags[]->{ "label": name, "slug": slug.current, group },
    "refBook": book->{
      title,
      author,
      canonicalBlurb,
      "coverImage": coverImage{ "url": asset->url },
      "tags": tags[]->{ "label": name, "slug": slug.current, group }
    }
  },
  "whatToReadNext": whatToReadNext[]->${SUMMARY_PROJECTION}
}`;

export async function getLatestArticle(category: CategorySlug): Promise<Article | null> {
  const raw = await groqFetch<RawArticle | null>(
    `*[_type == "article" && category == $category] | order(publishedAt desc)[0]${FULL_ARTICLE_PROJECTION}`,
    { category },
    { tags: ["article", "book", "tag"], revalidate: 300 },
  );
  return raw ? toArticle(raw) : null;
}

export interface HubPage {
  /** The category's newest article, shown as the hub's featured lead card.
   * `null` when nothing has been published to this category yet — pages
   * must render an empty state rather than assume this exists. */
  latest: Article | null;
  /** Every other article in the category, newest first — "See more" reveals
   * more of this client-side rather than a fresh request (pub_hub.md §13:
   * "does not [navigate] to a separate archive page"). Fine at this content
   * volume; revisit with real pagination if a category's archive grows into
   * the thousands. */
  articles: ArticleSummary[];
}

export async function getHubArticles(category: CategorySlug): Promise<HubPage> {
  const raws = await groqFetch<RawArticleSummary[]>(
    `*[_type == "article" && category == $category] | order(publishedAt desc)${SUMMARY_PROJECTION}`,
    { category },
    { tags: ["article"], revalidate: 300 },
  );
  if (raws.length === 0) return { latest: null, articles: [] };

  const [latestSummary, ...rest] = raws;
  const latest = await getArticleBySlug(category, latestSummary!.slug);
  return { latest, articles: rest.map(toArticleSummary) };
}

export async function getArticleBySlug(category: CategorySlug, slug: string): Promise<Article | null> {
  const raw = await groqFetch<RawArticle | null>(
    `*[_type == "article" && category == $category && slug.current == $slug][0]${FULL_ARTICLE_PROJECTION}`,
    { category, slug },
    { tags: ["article", "book", "tag"], revalidate: 300 },
  );
  return raw ? toArticle(raw) : null;
}

const LEGAL_PAGE_FALLBACK_TITLE: Record<LegalPage["slug"], string> = {
  terms: "Terms",
  "privacy-and-cookies": "Privacy & Cookies",
  disclosures: "Disclosures",
};

export async function getLegalPage(slug: LegalPage["slug"]): Promise<LegalPage> {
  const raw = await groqFetch<{ title: string; body: unknown[] } | null>(
    `*[_type == "legalPage" && slug == $slug][0]{ title, body }`,
    { slug },
    { tags: ["legalPage"], revalidate: 300 },
  );
  if (raw) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { slug, title: raw.title, bodyHtml: portableTextToHtml(raw.body as any) };
  }
  // No legalPage document authored for this slug yet in Sanity — real legal
  // copy is a known open item (CURRENT_STATE.md), not a bug in this function.
  return {
    slug,
    title: LEGAL_PAGE_FALLBACK_TITLE[slug],
    bodyHtml: `<p>This page has not been published in the CMS yet. Add a "${LEGAL_PAGE_FALLBACK_TITLE[slug]}" Legal page document in the Sanity Studio (/studio).</p>`,
  };
}

const SITE_SETTINGS_FALLBACK: SiteSettings = {
  contactEmail: "hello@fieldnotesfromeverywhere.com",
  socialLinks: {},
  readingRoomPriceCopy: "7 days free, no credit card. $5/month after that.",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const raw = await groqFetch<SiteSettings | null>(
    `*[_type == "siteSettings"][0]{ contactEmail, socialLinks, readingRoomPriceCopy }`,
    {},
    { tags: ["siteSettings"], revalidate: 300 },
  );
  // No siteSettings singleton authored yet — fall back rather than crash
  // every page that reads it (Footer, About, Contact, Reading Room).
  return raw ?? SITE_SETTINGS_FALLBACK;
}

export interface HomeShowcase {
  when: ArticleSummary[];
  shortlist: ArticleSummary[];
  clubPairs: [ArticleSummary, ArticleSummary][];
}

async function latestSummaries(category: CategorySlug, count: number): Promise<ArticleSummary[]> {
  const raws = await groqFetch<RawArticleSummary[]>(
    `*[_type == "article" && category == $category] | order(publishedAt desc)[0...$count]${SUMMARY_PROJECTION}`,
    { category, count },
    { tags: ["article"], revalidate: 300 },
  );
  return raws.map(toArticleSummary);
}

export async function getHomeShowcase(): Promise<HomeShowcase> {
  const [when, shortlist, clubItems] = await Promise.all([
    latestSummaries("what-to-read-when", 5),
    latestSummaries("the-shortlist", 5),
    latestSummaries("book-club-book-picks", 6),
  ]);

  const clubPairs: [ArticleSummary, ArticleSummary][] = [];
  for (let i = 0; i + 1 < clubItems.length; i += 2) {
    clubPairs.push([clubItems[i]!, clubItems[i + 1]!]);
  }

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

/** Shared `generateMetadata` body for the three `[category]/[slug]` article pages. */
export function articleMetadata(article: Article | null) {
  if (!article) return { title: "Article not found" };
  return {
    title: article.title,
    description: article.methodologySentence,
    openGraph: {
      title: article.title,
      description: article.methodologySentence,
      images: article.heroImage ? [{ url: article.heroImage.url, alt: article.heroImage.alt }] : undefined,
    },
  };
}
