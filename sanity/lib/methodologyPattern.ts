/**
 * Draft "How we made this list" sentences, one pattern per column/format
 * (DECISIONS.md, 2026-10-26: the Shortlist and Book Club patterns are the
 * user's own live sentences; the three What to Read When patterns were
 * approved by the user). Since 2026-11-03 every column has formats (the tool's formulas,
 * sanity/lib/formats.ts); they reuse these approved sentences, no new wording: every
 * Shortlist format → the Shortlist one, every third-column format → the Book Club one,
 * Comparison → "books like", Seasonal → seasonal, the other What to Read When formats →
 * the "trope or feeling" one. [Bracketed] parts are for the editor to fill in;
 * the methodology field refuses to publish while any remain.
 *
 * Pure (no Sanity access) so the wording can be checked in isolation.
 */

export interface PatternInput {
  category?: string;
  format?: string;
  /** The ranking's name, e.g. "Thriller"; null when no ranking is set. */
  rankingName: string | null;
  /** How many books the ranking holds; null when no ranking is set. */
  rankingSize: number | null;
  /**
   * Every valid reader recommendation behind the ranking, sent from the internal tool
   * (DECISIONS.md, 2026-10-28); null until the ranking has been sent, so [number] stays to fill in.
   */
  recommendationCount?: number | null;
  /** How many books the article currently has. */
  bookCount: number;
}

/** True while a sentence still has [bracketed] parts to fill in. */
export function hasPlaceholders(text: string | undefined): boolean {
  return !!text && /\[[^\]]*\]/.test(text);
}

/** The draft sentence for this article, or a reason it can't be drafted yet. */
export function methodologyPattern(input: PatternInput): { sentence: string } | { problem: string } {
  const recs = input.recommendationCount ? input.recommendationCount.toLocaleString("en-US") : "[number]";
  const n = input.bookCount > 0 ? String(input.bookCount) : "[number of books]";
  const top = input.rankingSize ? String(input.rankingSize) : "[ranking size]";
  // Bracketed even when known: only the editor knows the natural phrasing ("thriller" → "thrillers").
  const theme = `[${input.rankingName ? input.rankingName.trim().toLowerCase() : "theme"}]`;
  const opening = `To create this article, we analysed ${recs} reader recommendations for ${theme}.`;
  const pulled = `We pulled the ${n} books on this list from a larger list of the top ${top} most-recommended books`;

  switch (input.category) {
    case "the-shortlist":
      return {
        sentence: `To create this article, we analysed ${recs} reader recommendations. The books on this list were the most frequently recommended.`,
      };
    case "book-club-book-picks":
      return {
        sentence: `To create this article, we analysed ${recs} book recommendations from real reader discussions. We pulled the ${n} books on this list from a larger list of the top ${top} most-recommended books in those discussions.`,
      };
    case "what-to-read-when":
      switch (input.format) {
        case "comparison":
          return { sentence: `${opening} ${pulled}, picking the ones that have the most in common with [book title].` };
        case "mood":
        case "intensity":
        case "pace":
        case "blend":
        case "series":
          return { sentence: `${opening} ${pulled}, picking the ones [with a small-town setting / most likely to …].` };
        case "seasonal":
          return { sentence: `${opening} ${pulled}, picking the ones we think are perfect for [season or occasion].` };
        default:
          return { problem: "Choose this article's Format first, then click again." };
      }
    default:
      return { problem: "Set the article's Category first, then click again." };
  }
}
