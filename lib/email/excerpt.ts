/**
 * Shortens a book blurb for a Reading Room issue email: full publisher blurbs
 * on 30+ books push the email past Gmail's ~102 KB clip limit (Kit estimated a
 * test issue at 133 KB), so the email shows the start and the book's
 * /find-it page shows the rest (user's choice, DECISIONS.md, 2026-10-02).
 *
 * Paragraphs and line breaks are joined into one run of text. If it's longer
 * than `max`, it's cut at the last sentence end that leaves at least `min`
 * characters, otherwise at the last word before `max`, and "…" is added.
 */
export function blurbExcerpt(text: string, max = 220, min = 100): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;

  const window = flat.slice(0, max);
  let cut = -1;
  for (const m of window.matchAll(/[.!?…]["'”’)]?(?=\s)/g)) {
    const end = m.index + m[0].length;
    if (end >= min) cut = end;
  }
  const head = cut > 0 ? window.slice(0, cut) : window.slice(0, window.lastIndexOf(" "));
  // "perfect." + "…" reads oddly, so a trailing full stop/comma/colon gives way to the ellipsis.
  return `${head.replace(/[.,;:]+$/, "")}…`;
}
