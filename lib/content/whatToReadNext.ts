/**
 * Picks each article's "What to read next" (user, 2026-11-04; DECISIONS.md, same date).
 * Any articles chosen by hand in the Studio come first, and the rest are filled in, so
 * every article shows WHAT_TO_READ_NEXT_COUNT whenever that many others are live.
 *
 * Best match: same ranking first, then the most books in common, then newest. Picks go
 * round all the articles one slot at a time, skipping any article already recommended
 * MAX_RECOMMENDATIONS times while another choice is left, so the links spread across
 * the site rather than piling onto the longest lists. Everything is worked out from the
 * live articles, so older articles start pointing at new ones without any editing.
 */

export const WHAT_TO_READ_NEXT_COUNT = 3;
export const MAX_RECOMMENDATIONS = 4;

export interface NextCandidate {
  id: string;
  ranking?: string | null;
  publishedAt: string;
  books?: (string | null)[] | null;
  handPicked?: (string | null)[] | null;
}

const sharedBooks = (a: NextCandidate, b: NextCandidate) => {
  const books = new Set(a.books ?? []);
  return new Set((b.books ?? []).filter((id) => id && books.has(id))).size;
};

/** Best match first; ties broken by id so a page never changes between renders. */
function byBestMatch(article: NextCandidate, candidates: NextCandidate[]) {
  const sameRanking = (c: NextCandidate) => Number(!!article.ranking && c.ranking === article.ranking);
  return [...candidates].sort(
    (a, b) =>
      sameRanking(b) - sameRanking(a) ||
      sharedBooks(article, b) - sharedBooks(article, a) ||
      b.publishedAt.localeCompare(a.publishedAt) ||
      a.id.localeCompare(b.id),
  );
}

/** Each article's id → the ids to show, in order. */
export function pickWhatToReadNext(articles: NextCandidate[]): Map<string, string[]> {
  const byId = new Map(articles.map((a) => [a.id, a]));
  const count = new Map<string, number>();
  const add = (id: string) => count.set(id, (count.get(id) ?? 0) + 1);

  const picks = new Map<string, string[]>();
  for (const article of articles) {
    const chosen = [...new Set(article.handPicked ?? [])]
      .filter((id): id is string => !!id && id !== article.id && byId.has(id))
      .slice(0, WHAT_TO_READ_NEXT_COUNT);
    chosen.forEach(add);
    picks.set(article.id, chosen);
  }

  // A fixed order, so a page never changes between renders.
  const order = [...articles].sort((a, b) => a.publishedAt.localeCompare(b.publishedAt) || a.id.localeCompare(b.id));
  for (let slot = 0; slot < WHAT_TO_READ_NEXT_COUNT; slot++) {
    for (const article of order) {
      const chosen = picks.get(article.id)!;
      if (chosen.length > slot) continue;
      const open = byBestMatch(
        article,
        articles.filter((c) => c.id !== article.id && !chosen.includes(c.id)),
      );
      const pick = open.find((c) => (count.get(c.id) ?? 0) < MAX_RECOMMENDATIONS) ?? open[0];
      if (!pick) continue;
      chosen.push(pick.id);
      add(pick.id);
    }
  }
  return picks;
}
