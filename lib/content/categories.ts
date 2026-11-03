import type { CategoryDef, CategorySlug } from "./types";

export const CATEGORIES: Record<CategorySlug, CategoryDef> = {
  "the-shortlist": {
    slug: "the-shortlist",
    name: "The Shortlist",
    description:
      "The Shortlist is where we gather the books readers recommend most for a particular genre, theme or reading request. Each article turns thousands of recommendations from real reader discussions into a shorter list of the books that came up most often.",
    ranked: true,
    identity: { pageBg: "var(--sage-100)", accent: "var(--sage-700)" },
  },
  "what-to-read-when": {
    slug: "what-to-read-when",
    name: "What to Read When",
    description:
      "What to Read When is a collection of book lists built around the kind of reading experience you’re looking for. Each article starts with a particular mood, craving, feeling, season or favourite book and brings together books that fit it.",
    ranked: false,
    identity: { pageBg: "var(--oat-200)", accent: "var(--clay-700)" },
  },
  "up-next": {
    slug: "up-next",
    name: "Up Next",
    description:
      "Up Next is a collection of guided reading lists that tell you what to read next, from your book club’s next pick to a year-long reading challenge. Browse curated book lists for different genres, themes, and group reading experiences.",
    ranked: false,
    identity: { pageBg: "var(--paper-100)", accent: "var(--slate-600)" },
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);
