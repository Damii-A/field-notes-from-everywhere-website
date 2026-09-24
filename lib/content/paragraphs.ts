/**
 * Splits plain text with blank-line paragraph breaks (e.g. book blurbs from
 * the spreadsheet import) into paragraphs. Single line breaks inside a
 * paragraph are kept as "\n" — render them with `white-space: pre-line`
 * (or <br> in email). Client-safe: no server-only imports.
 */
export function splitParagraphs(text: string | undefined): string[] {
  return (text ?? "")
    .replace(/\r\n?/g, "\n")
    .split(/\n[ \t]*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
