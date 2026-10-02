/**
 * Content access layer. Every page reads through here, never through Sanity
 * directly — that's what keeps every page decoupled from exactly how
 * content is fetched. Backed by real Sanity GROQ queries (see
 * lib/sanity/groqFetch.ts); CURRENT_STATE.md tracks what's been authored in
 * the Studio so far (as of this writing: nothing — see the empty-state
 * handling below and in the pages that call these functions).
 */
import { groqFetch } from "@/lib/sanity/groqFetch";
import { pageMetadata } from "@/lib/metadata";
import { portableTextToHtml, portableTextToParagraphs } from "./portableText";
import { CATEGORIES } from "./categories";
import { formatArticleDate } from "./dates";
import type { Article, ArticleSummary, BookEntry, CategorySlug, LegalPage, SiteSettings, ThemeRef, WhereToReadBook } from "./types";

export { CATEGORIES, CATEGORY_LIST } from "./categories";
export type { Article, ArticleSummary, BookEntry, IntroSegment, CategoryDef, CategorySlug, LegalPage, TagRef, ThemeRef, WhereToReadBook } from "./types";

export { HUB_INITIAL_COUNT, HUB_PAGE_INCREMENT } from "./hubPaging";

function formatMeta(bookCount: number, publishedAt: string): string {
  const date = formatArticleDate(publishedAt, "short");
  return `${bookCount} book${bookCount === 1 ? "" : "s"} · ${date}`;
}

// ---------------------------------------------------------------------------
// Raw Sanity response shapes (only the fields each GROQ projection selects).
// ---------------------------------------------------------------------------

interface RawImage {
  url: string;
  alt?: string;
}

/** A Studio image with its editor-set crop and hotspot (fractions of the full image) — hero images only. */
interface RawHeroImage extends RawImage {
  hotspot?: { x: number; y: number } | null;
  crop?: { top: number; bottom: number; left: number; right: number } | null;
  dimensions?: { width: number; height: number } | null;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Honours the Studio's crop and hotspot. The crop is applied by Sanity's
 * image service (`rect`); the hotspot becomes a CSS object-position, so each
 * placement's own crop (12:5 article hero, 4:5 homepage rail, 3:2 cards…)
 * keeps the focal point in view instead of always cropping from the centre.
 */
function toHeroImage(raw: RawHeroImage | null, fallbackAlt: string): ArticleSummary["heroImage"] {
  if (!raw?.url) return undefined;
  let url = raw.url;
  let x = raw.hotspot?.x ?? 0.5;
  let y = raw.hotspot?.y ?? 0.5;
  const c = raw.crop;
  const d = raw.dimensions;
  const cropped = !!(c && d && (c.top || c.bottom || c.left || c.right));
  if (cropped && c && d) {
    const w = 1 - c.left - c.right;
    const h = 1 - c.top - c.bottom;
    url += `?rect=${Math.round(c.left * d.width)},${Math.round(c.top * d.height)},${Math.round(w * d.width)},${Math.round(h * d.height)}`;
    x = (x - c.left) / w;
    y = (y - c.top) / h;
  }
  return {
    url,
    alt: raw.alt ?? fallbackAlt,
    position: raw.hotspot || cropped ? `${(clamp01(x) * 100).toFixed(1)}% ${(clamp01(y) * 100).toFixed(1)}%` : undefined,
  };
}

interface RawTag {
  label: string;
  slug: string;
}

interface RawTheme {
  label: string;
  slug: string;
  group: ThemeRef["group"];
}

interface RawArticleSummary {
  slug: string;
  category: CategorySlug;
  title: string;
  bookCount: number;
  publishedAt: string;
  metaDescription?: string;
  methodologySentence?: string;
  heroImage: RawHeroImage | null;
  /** pub_hub.md §5–12 "Browse Our Collections" groupings this article belongs to — not consumed by any page yet (those hub sections are still V1 backlog), but captured now so authored articles don't need revisiting later. See DECISIONS.md. */
  themes: RawTheme[] | null;
}

interface RawBookEntry {
  blurb?: string;
  tagOverrides: RawTag[] | null;
  refBook: {
    title: string;
    author: string;
    slug: string | null;
    canonicalBlurb?: string;
    coverImage: RawImage | null;
    tags: RawTag[] | null;
  } | null;
}

interface RawArticle extends RawArticleSummary {
  author: string;
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
    description: raw.metaDescription || raw.methodologySentence || "",
    heroImage: toHeroImage(raw.heroImage, raw.title),
    themes: raw.themes?.map((t) => ({ label: t.label, slug: t.slug, group: t.group })),
  };
}

/**
 * `rank` is never stored in Sanity — it's the book's position within the
 * article's `bookEntries` array (the order the author drags entries into),
 * only surfaced for categories that actually display ranks (The Shortlist).
 * A hand-entered rank number used to exist and could silently drift out of
 * sync with the actual displayed order if an author reordered the array
 * without also updating it — see DECISIONS.md.
 */
function toBookEntry(raw: RawBookEntry, rank: number | undefined): BookEntry | null {
  if (!raw.refBook) return null; // dangling reference — skip rather than crash on bad CMS data
  const tags = raw.tagOverrides && raw.tagOverrides.length > 0 ? raw.tagOverrides : raw.refBook.tags ?? undefined;
  return {
    rank,
    title: raw.refBook.title,
    author: raw.refBook.author,
    blurb: raw.blurb || raw.refBook.canonicalBlurb || "",
    slug: raw.refBook.slug ?? undefined,
    tags: tags?.map((t) => ({ label: t.label, slug: t.slug })),
    coverImage: raw.refBook.coverImage ? { url: raw.refBook.coverImage.url, alt: raw.refBook.title } : undefined,
  };
}

function toArticle(raw: RawArticle): Article {
  const isRanked = CATEGORIES[raw.category].ranked;
  return {
    ...toArticleSummary(raw),
    author: raw.author,
    publishedAt: raw.publishedAt,
    methodologySentence: raw.methodologySentence ?? "",
    introParagraphs: portableTextToParagraphs(raw.introText),
    books: (raw.bookEntries ?? [])
      .map((entry, i) => toBookEntry(entry, isRanked ? i + 1 : undefined))
      .filter((b): b is BookEntry => b !== null),
    whatToReadNext: (raw.whatToReadNext ?? []).map(toArticleSummary),
  };
}

/**
 * Scheduling: an article is only visible once its `publishedAt` time has
 * passed, so an author can publish in the Studio with a future date and it
 * goes live on its own (DECISIONS.md, 2026-09-23). Every article query below
 * includes this. Go-live lag is bounded by the 300s revalidate window — the
 * Sanity publish webhook fires at publish time, not at the scheduled time.
 */
const RELEASED = `(publishedAt <= now() || $includeScheduled)`; // $includeScheduled: set by groqFetch, true only in Studio preview

const SUMMARY_PROJECTION = `{
  "slug": slug.current,
  category,
  title,
  "bookCount": count(bookEntries),
  publishedAt,
  metaDescription,
  methodologySentence,
  heroImage{ "url": asset->url, alt, hotspot, crop, "dimensions": asset->metadata.dimensions },
  "themes": themes[]->{ "label": name, "slug": slug.current, group }
}`;

const FULL_ARTICLE_PROJECTION = `{
  "slug": slug.current,
  category,
  title,
  "bookCount": count(bookEntries),
  publishedAt,
  metaDescription,
  methodologySentence,
  heroImage{ "url": asset->url, alt, hotspot, crop, "dimensions": asset->metadata.dimensions },
  "themes": themes[]->{ "label": name, "slug": slug.current, group },
  author,
  introText[]{
    ...,
    markDefs[]{
      ...,
      _type == "internalLink" => {
        "href": select(
          reference->publishedAt <= now() || $includeScheduled => "/" + reference->category + "/" + reference->slug.current
        )
      }
    }
  },
  bookEntries[]{
    blurb,
    "tagOverrides": tags[]->{ "label": name, "slug": slug.current },
    "refBook": book->{
      title,
      author,
      "slug": slug.current,
      canonicalBlurb,
      "coverImage": coverImage{ "url": asset->url },
      "tags": tags[]->{ "label": name, "slug": slug.current }
    }
  },
  "whatToReadNext": whatToReadNext[@->publishedAt <= now() || $includeScheduled]->${SUMMARY_PROJECTION}
}`;

export async function getLatestArticle(category: CategorySlug): Promise<Article | null> {
  const raw = await groqFetch<RawArticle | null>(
    `*[_type == "article" && category == $category && ${RELEASED}] | order(publishedAt desc)[0]${FULL_ARTICLE_PROJECTION}`,
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
    `*[_type == "article" && category == $category && ${RELEASED}] | order(publishedAt desc)${SUMMARY_PROJECTION}`,
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
    `*[_type == "article" && category == $category && slug.current == $slug && ${RELEASED}][0]${FULL_ARTICLE_PROJECTION}`,
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
  const raw = await groqFetch<{ title: string; body: unknown[]; updatedOn: string | null } | null>(
    `*[_type == "legalPage" && slug == $slug][0]{ title, body, updatedOn }`,
    { slug },
    { tags: ["legalPage"], revalidate: 300 },
  );
  if (raw) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { slug, title: raw.title, bodyHtml: portableTextToHtml(raw.body as any), updatedOn: raw.updatedOn ?? undefined };
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
  socialLinks: {
    pinterest: "https://www.pinterest.com/fieldnotesfromeverywhere/",
    reddit: "https://www.reddit.com/r/Fieldnotesfromew/",
  },
  readingRoomPriceCopy: "$7/month. Cancel anytime.",
};

type RawSiteSettings = {
  contactEmail: string | null;
  socialLinks: { pinterest?: string | null; reddit?: string | null } | null;
  readingRoomPriceCopy: string | null;
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const raw = await groqFetch<RawSiteSettings | null>(
    `*[_type == "siteSettings"][0]{ contactEmail, socialLinks, readingRoomPriceCopy }`,
    {},
    { tags: ["siteSettings"], revalidate: 300 },
  );
  // No siteSettings singleton authored yet (or a field left blank) — fall back
  // per field rather than crash every page that reads it (Footer, About,
  // Contact, Reading Room).
  const fb = SITE_SETTINGS_FALLBACK;
  return {
    contactEmail: raw?.contactEmail || fb.contactEmail,
    socialLinks: {
      pinterest: raw?.socialLinks?.pinterest || fb.socialLinks.pinterest,
      reddit: raw?.socialLinks?.reddit || fb.socialLinks.reddit,
    },
    readingRoomPriceCopy: raw?.readingRoomPriceCopy || fb.readingRoomPriceCopy,
  };
}

export interface HomeShowcase {
  when: ArticleSummary[];
  shortlist: ArticleSummary[];
  /** Book Club articles in pairs; an odd one out sits alone (second slot undefined). */
  clubPairs: [ArticleSummary, ArticleSummary | undefined][];
}

async function latestSummaries(category: CategorySlug, count: number): Promise<ArticleSummary[]> {
  const raws = await groqFetch<RawArticleSummary[]>(
    `*[_type == "article" && category == $category && ${RELEASED}] | order(publishedAt desc)[0...$count]${SUMMARY_PROJECTION}`,
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

  const clubPairs: [ArticleSummary, ArticleSummary | undefined][] = [];
  for (let i = 0; i < clubItems.length; i += 2) {
    clubPairs.push([clubItems[i]!, clubItems[i + 1]]);
  }

  return { when, shortlist, clubPairs };
}

export interface FeedArticleBook {
  title: string;
  coverImage?: { url: string; alt: string };
}

export interface FeedArticle {
  slug: string;
  category: CategorySlug;
  title: string;
  publishedAt: string;
  methodologySentence: string;
  /** Meta description, falling back to the methodology sentence — the article's summary in RSS and the weekly recap. */
  description: string;
  /** First 3 books in the article's list — used by the weekly recap email's cover-row treatment. */
  books: FeedArticleBook[];
}

interface RawFeedArticle {
  slug: string;
  category: CategorySlug;
  title: string;
  publishedAt: string;
  methodologySentence: string;
  metaDescription?: string;
  books: { title: string; coverImage: RawImage | null }[];
}

/** Most recent articles across every category, newest first — feeds app/rss/route.ts and the weekly recap cron job. */
export async function getFeedArticles(limit: number): Promise<FeedArticle[]> {
  const raws = await groqFetch<RawFeedArticle[]>(
    `*[_type == "article" && ${RELEASED}] | order(publishedAt desc)[0...$limit]{
      "slug": slug.current, category, title, publishedAt, methodologySentence, metaDescription,
      "books": bookEntries[0...3].book->{ title, "coverImage": coverImage{ "url": asset->url } }
    }`,
    { limit },
    { tags: ["article", "book"], revalidate: 300 },
  );
  return raws.map((r) => ({
    ...r,
    description: r.metaDescription || r.methodologySentence,
    books: r.books.map((b) => ({ title: b.title, coverImage: b.coverImage ? { url: b.coverImage.url, alt: b.title } : undefined })),
  }));
}

export interface CoverBook {
  title: string;
  author: string;
  coverUrl: string;
}

interface RawWhereToRead {
  slug: string;
  title: string;
  author: string;
  coverUrl: string | null;
  goodreadsUrl: string | null;
  canonicalBlurb: string | null;
  tags: (string | null)[] | null;
  lists: {
    title: string;
    slug: string;
    category: CategorySlug;
    entries: { id: string | null; blurb: string | null; book: { slug: string | null; title: string; author: string; coverUrl: string | null } | null }[] | null;
  }[];
}

const RELATED_LIMIT = 6;

/**
 * A book's "Where to read" page data (DECISIONS.md, 2026-10-02): the book, the
 * published articles featuring it (with its rank on ranked columns), and other
 * books from those lists. Null for an unknown slug. Every book has a page; only
 * featured ones (`lists.length > 0`) are indexed — see getWhereToReadSlugs.
 */
export async function getWhereToReadBook(slug: string): Promise<WhereToReadBook | null> {
  const raw = await groqFetch<(RawWhereToRead & { _id: string }) | null>(
    `*[_type == "book" && slug.current == $slug][0]{
      _id, "slug": slug.current, title, author, "coverUrl": coverImage.asset->url, goodreadsUrl, canonicalBlurb,
      "tags": tags[]->name,
      "lists": *[_type == "article" && ${RELEASED} && references(^._id)] | order(publishedAt desc){
        title, "slug": slug.current, category,
        "entries": bookEntries[]{ "id": book._ref, blurb, "book": book->{ "slug": slug.current, title, author, "coverUrl": coverImage.asset->url } }
      }
    }`,
    { slug },
    { tags: ["book", "article"], revalidate: 300 },
  );
  if (!raw) return null;

  const lists = raw.lists.map((a) => {
    const entries = a.entries ?? [];
    const pos = entries.findIndex((e) => e.id === raw._id);
    return {
      title: a.title,
      href: articlePath({ category: a.category, slug: a.slug }),
      category: a.category,
      rank: CATEGORIES[a.category].ranked && pos >= 0 ? pos + 1 : undefined,
      bookCount: entries.length,
      ownBlurb: pos >= 0 ? entries[pos]!.blurb?.trim() || undefined : undefined,
    };
  });

  // "Books like": the books right after this one in each list (wrapping round),
  // taken from the lists in turn. Neighbours in a list are its closest peers, and
  // starting from each book's own position means every book gets linked from
  // others' pages; starting every page at the top linked the same 17 of 34.
  const queues = raw.lists.map((a) => {
    const entries = a.entries ?? [];
    const pos = entries.findIndex((e) => e.id === raw._id);
    return [...entries.slice(pos + 1), ...entries.slice(0, Math.max(pos, 0))];
  });
  const seen = new Set([raw.slug]);
  const related: WhereToReadBook["related"] = [];
  while (related.length < RELATED_LIMIT && queues.some((q) => q.length > 0)) {
    for (const q of queues) {
      const b = q.shift()?.book;
      if (!b?.slug || seen.has(b.slug) || related.length === RELATED_LIMIT) continue;
      seen.add(b.slug);
      related.push({ slug: b.slug, title: b.title, author: b.author, coverUrl: b.coverUrl ?? undefined });
    }
  }

  return {
    slug: raw.slug,
    title: raw.title,
    author: raw.author,
    coverUrl: raw.coverUrl ?? undefined,
    goodreadsUrl: raw.goodreadsUrl ?? undefined,
    blurb: lists.find((l) => l.ownBlurb)?.ownBlurb ?? raw.canonicalBlurb ?? undefined,
    tags: (raw.tags ?? []).filter((t): t is string => !!t),
    // A ranking ("#1 of 15") is the strongest reason to read it, so ranked lists lead; otherwise newest first.
    lists: [...lists].sort((x, y) => Number(!!y.rank) - Number(!!x.rank)).map((l) => ({ title: l.title, href: l.href, category: l.category, rank: l.rank, bookCount: l.bookCount })),
    related,
  };
}

/** Books featured in at least one published article: the indexable "Where to read" pages, for the sitemap. */
export async function getWhereToReadSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
  return groqFetch<{ slug: string; updatedAt: string }[]>(
    `*[_type == "book" && defined(slug.current) && count(*[_type == "article" && ${RELEASED} && references(^._id)]) > 0]{
      "slug": slug.current, "updatedAt": _updatedAt
    }`,
    {},
    { tags: ["book", "article"], revalidate: 300 },
  );
}

/** One book by id: its slug, for the old /find-it/<id> address to forward to /where-to-read/<slug>. Null if it doesn't exist. */
export async function getBookById(id: string): Promise<{ slug?: string } | null> {
  const raw = await groqFetch<{ slug: string | null } | null>(
    `*[_type == "book" && _id == $id][0]{ "slug": slug.current }`,
    { id },
    { tags: ["book"], revalidate: 300 },
  );
  return raw ? { slug: raw.slug ?? undefined } : null;
}

/**
 * Real covers of books recommended in published articles (newest articles
 * first, each book once, only books that have a cover) — the Reading Room
 * page's drifting hero covers and "A few of the books we've recommended so
 * far" shelf. Empty until something with covers is published; the page then
 * falls back to its placeholder titles.
 */
export async function getRecommendedCovers(limit: number): Promise<CoverBook[]> {
  const raws = await groqFetch<{ books: ({ _id: string; title: string; author: string; coverUrl: string | null } | null)[] | null }[]>(
    `*[_type == "article" && ${RELEASED}] | order(publishedAt desc){
      "books": bookEntries[].book->{ _id, title, author, "coverUrl": coverImage.asset->url }
    }`,
    {},
    { tags: ["article", "book"], revalidate: 300 },
  );
  const seen = new Set<string>();
  const out: CoverBook[] = [];
  for (const a of raws) {
    for (const b of a.books ?? []) {
      if (!b?.coverUrl || seen.has(b._id)) continue;
      seen.add(b._id);
      out.push({ title: b.title, author: b.author, coverUrl: b.coverUrl });
      if (out.length === limit) return out;
    }
  }
  return out;
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
  return pageMetadata({
    title: article.title,
    description: article.description,
    path: articlePath(article),
    image: article.heroImage ? { url: article.heroImage.url, alt: article.heroImage.alt } : undefined,
    publishedTime: article.publishedAt,
  });
}
