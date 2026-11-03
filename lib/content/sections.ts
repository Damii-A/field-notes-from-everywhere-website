/**
 * Section headings in a book list (DECISIONS.md, 2026-11-03): a heading shows above
 * the first book of each run of entries sharing a section label; "January (Winter,
 * New Year)" shows as "January" with "Winter, New Year" smaller beneath.
 */
export function sectionHeading(label: string): { title: string; note?: string } {
  const m = label.match(/^(.*?)\s*\((.+)\)\s*$/);
  const title = m?.[1]?.trim();
  const note = m?.[2]?.trim();
  return title && note ? { title, note } : { title: label.trim() };
}

/** The section heading to show before entry `i`, or null if it continues the previous section (or has none). */
export function sectionStartingAt(books: { section?: string }[], i: number): string | null {
  const s = books[i]?.section;
  return s && (i === 0 || books[i - 1]?.section !== s) ? s : null;
}
