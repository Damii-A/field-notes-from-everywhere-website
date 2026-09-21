import type { CategoryDef, CategorySlug } from "./types";

export const CATEGORIES: Record<CategorySlug, CategoryDef> = {
  "the-shortlist": {
    slug: "the-shortlist",
    name: "The Shortlist",
    description:
      "One researched reader interest at a time, and the books that rose to the top of the recommendations we analysed. Ranked, numbered, and kept deliberately short.",
    ranked: true,
    identity: { pageBg: "var(--sage-100)", accent: "var(--sage-700)" },
  },
  "what-to-read-when": {
    slug: "what-to-read-when",
    name: "What to Read When",
    description:
      "For the moments when you already know how you want a book to make you feel. A mood, a situation, a very particular craving, and the books readers recommend for it.",
    ranked: false,
    identity: { pageBg: "var(--oat-200)", accent: "var(--clay-700)" },
  },
  "book-club-book-picks": {
    slug: "book-club-book-picks",
    name: "Book Club Book Picks",
    description:
      "Books chosen with a group in mind. The ones worth reading together, arguing about, and coming back to at the next meeting.",
    ranked: false,
    identity: { pageBg: "var(--paper-100)", accent: "var(--slate-600)" },
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);
