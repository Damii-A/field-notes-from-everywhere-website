/**
 * Content shapes, matching the Sanity schema proposed in ARCHITECTURE.md §6.
 * Until a Sanity project exists (see CURRENT_STATE.md), `lib/content/index.ts`
 * serves these shapes from local mock data instead of GROQ queries — every
 * page reads through that one module, so wiring in real Sanity queries later
 * is a change in one place, not a rewrite of every page.
 */

export type CategorySlug = "the-shortlist" | "what-to-read-when" | "book-club-book-picks";

export interface CategoryDef {
  slug: CategorySlug;
  name: string;
  /** Short description shown on the hub's category-identity band and homepage showcase. */
  description: string;
  /** Ranked lists are visibly numbered (The Shortlist only) — pub_article.md §10.1. */
  ranked: boolean;
  /** Per-category visual identity — DESIGN_PROJECT_BUILD_NOTES.md "Per-category colour identity". Frontend-owned, not CMS content. */
  identity: {
    pageBg: string; // CSS var() reference for the page background
    accent: string; // CSS var() reference for headings/rank numerals/accents
  };
}

export interface TagRef {
  label: string;
  slug: string;
  /** The 8 groupings from pub_hub.md / rr_subscriber.md. */
  group?:
    | "genre"
    | "character"
    | "relationship"
    | "trope"
    | "mood"
    | "theme"
    | "setting"
    | "experience";
}

export interface BookEntry {
  rank?: number; // present only for ranked (Shortlist) entries
  title: string;
  author: string;
  /** Article-specific blurb — pub_article.md §5 ("Blurb"), overrides any canonical book blurb. */
  blurb: string;
  tags?: TagRef[];
  /** BookCover accepts a solid "spine" colour when there's no real cover image yet. */
  spine?: string;
  coverImage?: {
    url: string;
    alt: string;
  };
}

export interface ArticleSummary {
  slug: string;
  category: CategorySlug;
  title: string;
  meta: string; // e.g. "18 books · Sep 4, 2026" as shown on hub cards
  heroImage?: { url: string; alt: string };
}

export interface Article extends ArticleSummary {
  author: string;
  publishedAt: string; // ISO date
  methodologySentence: string;
  introParagraphs: string[];
  books: BookEntry[];
  whatToReadNext: ArticleSummary[];
}

export interface LegalPageSlug {
  slug: "terms" | "privacy-and-cookies" | "disclosures";
  title: string;
}

export interface LegalPage extends LegalPageSlug {
  bodyHtml: string;
}

export interface SiteSettings {
  contactEmail: string;
  socialLinks: { pinterest?: string; reddit?: string };
  readingRoomPriceCopy: string; // e.g. "7 days free, no credit card. $5/month after that."
}
