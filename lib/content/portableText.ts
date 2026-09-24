/**
 * Sanity portable text (the `type: "block"` array used by `article.introText`
 * and `legalPage.body`) has two different consumers on the frontend, so it
 * needs two different renderings — see ARCHITECTURE.md §6 and the comment on
 * LegalPageBody's `dangerouslySetInnerHTML`.
 */
import { toHTML } from "@portabletext/to-html";

import type { IntroSegment } from "./types";

interface PortableTextSpan {
  _type: "span";
  text: string;
  marks?: string[];
}

interface PortableTextBlock {
  _type: string;
  children?: PortableTextSpan[];
  /** Link annotations. `href` is resolved in GROQ for internal article links — null when the target isn't live. */
  markDefs?: { _key: string; href?: string | null }[];
}

/**
 * ArticleView renders intro copy as plain `<p>` paragraphs (the built
 * design's intro treatment): one portable text block becomes one paragraph.
 * Links are kept, as segments with an `href`, so intros can carry internal
 * links (SEO — see DECISIONS.md, 2026-09-24); other inline marks (bold,
 * italic) are still flattened to plain text, matching the design. A link
 * whose target isn't resolvable (e.g. an unpublished article) renders as
 * plain text rather than a dead link.
 */
export function portableTextToParagraphs(blocks: PortableTextBlock[] | undefined): IntroSegment[][] {
  if (!blocks) return [];
  return blocks
    .filter((b) => b._type === "block")
    .map((b) => {
      const hrefs = new Map((b.markDefs ?? []).filter((d) => d.href).map((d) => [d._key, d.href as string]));
      const segments: IntroSegment[] = [];
      for (const child of b.children ?? []) {
        const href = child.marks?.map((m) => hrefs.get(m)).find(Boolean);
        const last = segments[segments.length - 1];
        if (last && last.href === href) last.text += child.text;
        else segments.push(href ? { text: child.text, href } : { text: child.text });
      }
      return segments;
    })
    .filter((segments) => segments.some((s) => s.text.trim().length > 0));
}

/** Legal pages need real rich-text structure (headings, lists, links) — rendered as trusted HTML, see LegalPageBody. */
export function portableTextToHtml(blocks: PortableTextBlock[] | undefined): string {
  if (!blocks || blocks.length === 0) return "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return toHTML(blocks as any);
}
