/**
 * SEO checks for Shortlist articles, shown in the Studio as warnings on the
 * field they concern (never blocking publish). Each Shortlist article targets
 * a focus keyword, by convention "<ranking theme> book recommendations"
 * (e.g. "thriller book recommendations"). A check passes when every
 * meaningful word of the keyword appears in the field, in any order and
 * singular or plural — "15 Thriller Books ... Reader Recommendations"
 * satisfies "thriller book recommendations". Pure functions; the schema
 * wiring is in sanity/schemaTypes/article.ts.
 */

/** Google typically shows about this many characters of a title before cutting it off. */
export const TITLE_MAX_CHARS = 60;

const STOPWORDS = new Set(["a", "an", "and", "the", "of", "for", "to", "in", "on", "with", "when", "you", "your", "that"]);

function normalize(word: string): string {
  // crude singular: "books" -> "book", "recommendations" -> "recommendation"; leaves short words ("is", "gas") alone
  return word.length > 3 && word.endsWith("s") && !word.endsWith("ss") ? word.slice(0, -1) : word;
}

function words(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map(normalize);
}

/** The focus keyword's meaningful words (as typed, lowercased) that don't appear in `text`. */
export function missingKeywordWords(keyword: string, text: string): string[] {
  const present = new Set(words(text));
  return keyword
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w && !STOPWORDS.has(w))
    .filter((w) => !present.has(normalize(w)));
}

/** A warning message if `text` is missing any of the keyword's words, else null. */
export function keywordWarning(where: string, keyword: string, text: string | undefined): string | null {
  if (!text?.trim()) return null; // empty fields are flagged by their own required/other rules
  const missing = missingKeywordWords(keyword, text);
  if (missing.length === 0) return null;
  return `SEO: the ${where} doesn't mention ${missing.map((w) => `"${w}"`).join(", ")} from your focus keyword "${keyword}".`;
}

export function suggestedFocusKeyword(rankingName: string): string {
  return `${rankingName.trim().toLowerCase()} book recommendations`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Block = { _type?: string; children?: { text?: string }[] } | any;

/** Plain text of the first paragraph of a portable-text field. */
export function firstParagraphText(blocks: Block[] | undefined): string {
  const first = blocks?.find((b: Block) => b?._type === "block");
  return (first?.children ?? []).map((c: { text?: string }) => c.text ?? "").join("");
}
