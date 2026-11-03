import { isFormatForColumn } from "./formats";

/**
 * What "Start article" puts in a new draft article from a post idea (DECISIONS.md,
 * 2026-11-03). Pure (no Sanity access) so it can be checked in isolation.
 */

export interface PostIdeaDoc {
  _id: string;
  title?: string;
  formula?: string;
  column?: string;
  ranking?: { _ref: string };
  evidenceLine?: string;
  introText?: string;
  metaDescription?: string;
  slug?: string;
  focusKeyword?: string;
  timing?: { scheduleFor?: string };
  books?: { book?: { _ref: string }; tagsShown?: { _ref: string }[] }[];
  anchorBook?: { _ref: string };
  groups?: { label?: string; books?: { _ref: string }[] }[];
}

const ref = (id: string) => ({ _type: "reference", _ref: id });

/** The new article's fields, or a reason the idea can't become one yet. */
export function articleFromPostIdea(
  idea: PostIdeaDoc,
  randomKey: () => string,
  now: Date,
): { fields: Record<string, unknown> } | { problem: string } {
  if (!idea.title?.trim()) return { problem: "This idea has no title yet. Pick one in the internal tool and send it again." };
  // The third column was renamed "Up Next" (2026-11-03); ideas sent before the tool switched still say the old code.
  const column = idea.column === "book-club-book-picks" ? "up-next" : idea.column;
  if (!column) return { problem: "This idea has no column. Set one in the internal tool and send it again." };
  const books = (idea.books ?? []).filter((b) => b.book?._ref);
  if (books.length === 0) return { problem: "This idea has no books." };

  // Formats are the tool's formula codes; a formula that isn't one of the column's formats is left for the editor.
  const format = isFormatForColumn(column, idea.formula) ? idea.formula : undefined;
  // Seasonal ideas: schedule for their date, 10am US Eastern in summer (14:00 UTC), if it's still ahead.
  const scheduleFor = idea.timing?.scheduleFor ? new Date(`${idea.timing.scheduleFor}T14:00:00Z`) : null;
  const publishedAt = scheduleFor && scheduleFor > now ? scheduleFor.toISOString() : undefined;

  // The tool's article text (sent from 2026-11-03; older ideas have none). Plain text: a blank line
  // starts a new paragraph.
  const intro = (idea.introText ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .map((text) => ({
      _type: "block",
      _key: randomKey(),
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", _key: randomKey(), text, marks: [] }],
    }));
  // Groups (e.g. a month-by-month path's months) become each entry's "Section" (DECISIONS.md, 2026-11-03).
  const sectionOf = new Map<string, string>();
  for (const g of idea.groups ?? []) {
    const label = g.label?.trim();
    if (label) for (const b of g.books ?? []) if (b._ref && !sectionOf.has(b._ref)) sectionOf.set(b._ref, label);
  }
  const metaDescription = idea.metaDescription?.trim();
  const slug = idea.slug?.trim();
  // The focus keyword field only shows (and is only checked) on Shortlist articles.
  const focusKeyword = column === "the-shortlist" ? idea.focusKeyword?.trim() : undefined;

  return {
    fields: {
      _type: "article",
      title: idea.title.trim(),
      category: column,
      ...(format ? { format } : {}),
      author: "The FNFE Team",
      ...(publishedAt ? { publishedAt } : {}),
      ...(idea.ranking?._ref ? { ranking: ref(idea.ranking._ref) } : {}),
      ...(slug ? { slug: { _type: "slug", current: slug } } : {}),
      ...(metaDescription ? { metaDescription } : {}),
      ...(focusKeyword ? { focusKeyword } : {}),
      ...(intro.length ? { introText: intro } : {}),
      ...(idea.evidenceLine?.trim() ? { methodologySentence: idea.evidenceLine.trim() } : {}),
      postIdea: { ...ref(idea._id), _weak: true },
      ...(format === "comparison" && idea.anchorBook?._ref ? { anchorBook: ref(idea.anchorBook._ref) } : {}),
      bookEntries: books.map((b) => ({
        _type: "bookEntry",
        _key: randomKey(),
        book: ref(b.book!._ref),
        ...(sectionOf.has(b.book!._ref) ? { section: sectionOf.get(b.book!._ref) } : {}),
        ...(b.tagsShown?.length ? { tags: b.tagsShown.map((t) => ({ ...ref(t._ref), _key: randomKey() })) } : {}),
      })),
    },
  };
}
