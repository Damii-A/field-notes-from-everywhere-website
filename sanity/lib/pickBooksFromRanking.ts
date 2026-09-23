/**
 * Chooses an article's books from a theme's reader-recommendation ranking —
 * the rules behind the Studio's "Fill books from ranking" action (DECISIONS.md,
 * 2026-09-23). Each theme gets one article per column:
 *
 * - The Shortlist: the ranking's top `count` books, in rank order.
 * - What to Read When: the top 5, plus `count` more books not already in that
 *   theme's Shortlist article.
 * - Book Club Book Picks: the top 5, plus `count` more books not already in
 *   that theme's Shortlist or What to Read When article.
 *
 * "More books" continue down the ranking. The two unranked columns are
 * shuffled so the top 5 don't sit at the top and read as a ranking
 * (pub_article.md §10.2–10.3: unranked, not numbered).
 *
 * Pure (no Sanity access) so the rules can be checked in isolation.
 */
export type ArticleCategory = "the-shortlist" | "what-to-read-when" | "book-club-book-picks";

export const TOP_N_SHARED = 5;

/** Which sibling columns' books must not be reused by an article in `category`. */
export const EXCLUDED_SIBLING_CATEGORIES: Record<ArticleCategory, ArticleCategory[]> = {
  "the-shortlist": [],
  "what-to-read-when": ["the-shortlist"],
  "book-club-book-picks": ["the-shortlist", "what-to-read-when"],
};

export interface PickResult {
  bookIds: string[];
  /** How many "more" books were asked for but the ranking ran out of. */
  shortBy: number;
}

export function pickBooksFromRanking(
  category: ArticleCategory,
  ranking: string[],
  count: number,
  usedBySiblings: Set<string>,
  random: () => number = Math.random,
): PickResult {
  if (category === "the-shortlist") {
    const bookIds = ranking.slice(0, count);
    return { bookIds, shortBy: count - bookIds.length };
  }

  const top = ranking.slice(0, TOP_N_SHARED);
  const extra = ranking
    .slice(TOP_N_SHARED)
    .filter((id) => !usedBySiblings.has(id))
    .slice(0, count);
  return { bookIds: shuffle([...top, ...extra], random), shortBy: count - extra.length };
}

function shuffle<T>(items: T[], random: () => number): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j]!, items[i]!];
  }
  return items;
}
