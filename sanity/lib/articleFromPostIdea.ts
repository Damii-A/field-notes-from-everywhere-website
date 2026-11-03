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
  timing?: { scheduleFor?: string };
  books?: { book?: { _ref: string }; tagsShown?: { _ref: string }[] }[];
}

/** What to Read When needs a Format; formulas with no matching one leave it for the editor. */
const WTRW_FORMAT_BY_FORMULA: Record<string, string> = {
  comparison: "books-like",
  seasonal: "seasonal",
  mood: "trope-or-feeling",
  intensity: "trope-or-feeling",
  pace: "trope-or-feeling",
  blend: "trope-or-feeling",
};

const ref = (id: string) => ({ _type: "reference", _ref: id });

/** The new article's fields, or a reason the idea can't become one yet. */
export function articleFromPostIdea(
  idea: PostIdeaDoc,
  randomKey: () => string,
  now: Date,
): { fields: Record<string, unknown> } | { problem: string } {
  if (!idea.title?.trim()) return { problem: "This idea has no title yet. Pick one in the internal tool and send it again." };
  if (!idea.column) return { problem: "This idea has no column. Set one in the internal tool and send it again." };
  const books = (idea.books ?? []).filter((b) => b.book?._ref);
  if (books.length === 0) return { problem: "This idea has no books." };

  const format = idea.column === "what-to-read-when" && idea.formula ? WTRW_FORMAT_BY_FORMULA[idea.formula] : undefined;
  // Seasonal ideas: schedule for their date, 10am US Eastern in summer (14:00 UTC), if it's still ahead.
  const scheduleFor = idea.timing?.scheduleFor ? new Date(`${idea.timing.scheduleFor}T14:00:00Z`) : null;
  const publishedAt = scheduleFor && scheduleFor > now ? scheduleFor.toISOString() : undefined;

  return {
    fields: {
      _type: "article",
      title: idea.title.trim(),
      category: idea.column,
      ...(format ? { format } : {}),
      author: "The FNFE Team",
      ...(publishedAt ? { publishedAt } : {}),
      ...(idea.ranking?._ref ? { ranking: ref(idea.ranking._ref) } : {}),
      ...(idea.evidenceLine?.trim() ? { methodologySentence: idea.evidenceLine.trim() } : {}),
      postIdea: { ...ref(idea._id), _weak: true },
      bookEntries: books.map((b) => ({
        _type: "bookEntry",
        _key: randomKey(),
        book: ref(b.book!._ref),
        ...(b.tagsShown?.length ? { tags: b.tagsShown.map((t) => ({ ...ref(t._ref), _key: randomKey() })) } : {}),
      })),
    },
  };
}
