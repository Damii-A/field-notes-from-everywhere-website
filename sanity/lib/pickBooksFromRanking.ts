/**
 * Chooses books from a theme's reader-recommendation ranking — the rule behind
 * the Studio's "Fill books from ranking" action: the ranking's top `count`
 * books, in rank order. Used by The Shortlist and Reading Room issues only;
 * What to Read When and Book Club Book Picks articles are hand-picked with
 * "Choose books from ranking" (DECISIONS.md, 2026-10-26, which replaced the
 * earlier "top 5 + books not in sibling articles" rule for those columns).
 *
 * Pure (no Sanity access) so the rule can be checked in isolation.
 */
export interface PickResult {
  bookIds: string[];
  /** How many books were asked for but the ranking ran out of. */
  shortBy: number;
}

export function pickTopBooks(ranking: string[], count: number): PickResult {
  const bookIds = ranking.slice(0, count);
  return { bookIds, shortBy: count - bookIds.length };
}
