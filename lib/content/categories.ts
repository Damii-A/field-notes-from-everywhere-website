import type { CategoryDef, CategorySlug } from "./types";

export const CATEGORIES: Record<CategorySlug, CategoryDef> = {
  "the-shortlist": {
    slug: "the-shortlist",
    name: "The Shortlist",
    description:
      "The Shortlist is where we rank the books readers recommend most for a particular genre, theme or reading request. Each article turns thousands of recommendations from real reader discussions into a shorter, ranked list of the books that came up most often.",
    ranked: true,
    identity: { pageBg: "var(--sage-100)", accent: "var(--sage-700)" },
  },
  "what-to-read-when": {
    slug: "what-to-read-when",
    name: "What to Read When",
    description:
      "What to Read When is a collection of book lists built around the kind of reading experience you’re looking for. Each article starts with a particular mood, craving or feeling and brings together books that fit it.",
    ranked: false,
    identity: { pageBg: "var(--oat-200)", accent: "var(--clay-700)" },
  },
  "book-club-book-picks": {
    slug: "book-club-book-picks",
    name: "Book Club Book Picks",
    description:
      "Book Club Book Picks is a collection of book recommendations for your next book club read. Browse curated book lists for different genres, themes, and group reading experiences.",
    ranked: false,
    identity: { pageBg: "var(--paper-100)", accent: "var(--slate-600)" },
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);
