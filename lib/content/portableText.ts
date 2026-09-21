/**
 * Sanity portable text (the `type: "block"` array used by `article.introText`
 * and `legalPage.body`) has two different consumers on the frontend, so it
 * needs two different renderings — see ARCHITECTURE.md §6 and the comment on
 * LegalPageBody's `dangerouslySetInnerHTML`.
 */
import { toHTML } from "@portabletext/to-html";

interface PortableTextSpan {
  _type: "span";
  text: string;
}

interface PortableTextBlock {
  _type: string;
  children?: PortableTextSpan[];
}

/**
 * ArticleView renders intro copy as plain `<p>` tags with no inline
 * formatting (matches the built design's actual intro-paragraph treatment —
 * see pub_article.md and the ArticleView component). One portable text block
 * becomes one paragraph string; inline marks (bold/links) are flattened to
 * plain text, which is a deliberate match to that plain-paragraph design,
 * not a shortcut.
 */
export function portableTextToParagraphs(blocks: PortableTextBlock[] | undefined): string[] {
  if (!blocks) return [];
  return blocks
    .filter((b) => b._type === "block")
    .map((b) => (b.children ?? []).map((c) => c.text).join(""))
    .filter((text) => text.trim().length > 0);
}

/** Legal pages need real rich-text structure (headings, lists, links) — rendered as trusted HTML, see LegalPageBody. */
export function portableTextToHtml(blocks: PortableTextBlock[] | undefined): string {
  if (!blocks || blocks.length === 0) return "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return toHTML(blocks as any);
}
