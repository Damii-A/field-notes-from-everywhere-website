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

/** A book-level descriptor tag (e.g. "dark fantasy", "brutal") — see sanity/schemaTypes/tag.ts. */
export interface TagRef {
  label: string;
  slug: string;
}

/** The user's own 9-group taxonomy (2026-09-23) — replaces pub_hub.md §5–12's original 8 named sections, see DECISIONS.md. */
export type CollectionGroup =
  | "genre"
  | "tone"
  | "mood"
  | "trope"
  | "character-archetype"
  | "relationship"
  | "setting"
  | "world-elements"
  | "opening-style";

/** An article-level theme — one of the "Browse Our Collections" groupings (CollectionGroup). Deliberately a separate vocabulary from TagRef — see sanity/schemaTypes/theme.ts and DECISIONS.md, 2026-09-23. */
export interface ThemeRef {
  label: string;
  slug: string;
  group: CollectionGroup;
}

export interface BookEntry {
  rank?: number; // derived from array position for ranked (Shortlist) categories — never authored directly, see lib/content/index.ts
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
  /** The article's meta description (search results, link previews, hub lead card). Falls back to the methodology sentence when not written yet. */
  description: string;
  /** `position` is a CSS object-position from the Studio hotspot, so every crop of the image keeps its focal point in view. */
  heroImage?: { url: string; alt: string; position?: string };
  /** Which of the 8 "Browse Our Collections" groupings this article belongs to (pub_hub.md §5–12). Not rendered by any page yet — those hub sections are still V1 backlog — captured at authoring time so nothing needs revisiting once they're built. */
  themes?: ThemeRef[];
}

export interface IntroSegment {
  text: string;
  href?: string;
}

export interface Article extends ArticleSummary {
  author: string;
  publishedAt: string; // ISO date
  methodologySentence: string;
  /** Each paragraph is a run of text segments; a segment with `href` is a link (internal "/..." or external). */
  introParagraphs: IntroSegment[][];
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
  readingRoomPriceCopy: string; // e.g. "7 days free, no credit card. $7/month after that."
}
