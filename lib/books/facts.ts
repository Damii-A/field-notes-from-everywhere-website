/**
 * A book's "Page count: 336 · Est. reading time: 6 hours" row (user's labels, 2026-11-03),
 * shown below the author wherever a book shows with its tags. Both numbers come from the
 * internal tool (`book.pageCount`, `book.readingHours`); the site only words them.
 * No page count = no row.
 */
export interface BookFacts {
  pageCount?: number;
  readingHours?: number;
}

export function bookFactLabels(facts: BookFacts): string[] {
  if (!facts.pageCount || facts.pageCount < 1) return [];
  const labels = [`Page count: ${facts.pageCount.toLocaleString("en-US")}`];
  if (facts.readingHours && facts.readingHours >= 1) {
    labels.push(`Est. reading time: ${facts.readingHours} ${facts.readingHours === 1 ? "hour" : "hours"}`);
  }
  return labels;
}
