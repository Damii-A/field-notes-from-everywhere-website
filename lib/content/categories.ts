import type { CategoryDef, CategorySlug } from "./types";

export const CATEGORIES: Record<CategorySlug, CategoryDef> = {
  "the-shortlist": {
    slug: "the-shortlist",
    name: "The Shortlist",
    description:
      "Our shortlists are ranked collections of books built around a specific genre, theme or reader request. We analyse real reader discussions to uncover the books recommended most often, then distill those recommendations into ranked lists.",
    ranked: true,
    identity: { pageBg: "var(--sage-100)", accent: "var(--sage-700)" },
  },
  "what-to-read-when": {
    slug: "what-to-read-when",
    name: "What to Read When",
    description:
      "This is where you’ll find book lists for whatever you’re craving. A feeling, a trope, a time of year, or more books like one you couldn’t put down: every list starts with the books real readers recommend most, then brings together the ones that fit.",
    ranked: false,
    identity: { pageBg: "var(--oat-200)", accent: "var(--clay-700)" },
  },
  "book-club-book-picks": {
    slug: "book-club-book-picks",
    name: "Book Club Book Picks",
    description:
      "This is the column for book clubs looking for their next read. We start with the books real readers recommend most for a genre or theme, then pick out the ones that give a group the most to talk about.",
    ranked: false,
    identity: { pageBg: "var(--paper-100)", accent: "var(--slate-600)" },
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);
