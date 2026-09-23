import { defineField, defineType } from "sanity";

/**
 * A reader-recommendation ranking for one theme (e.g. "Thriller") — the
 * research data behind the site's lists, kept independently of any article
 * (DECISIONS.md, 2026-09-23). Rank is each book's position in `books`, the
 * same derived-from-order rule as article bookEntries: there's no rank number
 * to store or keep in sync. A book can appear in any number of rankings, at a
 * different position in each; the `book` record itself stays shared.
 *
 * Not read by the site yet — this preserves the ranking so lists can be built
 * from it, rather than it existing only in a spreadsheet.
 */
export default defineType({
  name: "ranking",
  title: "Ranking",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      description: 'What these books are ranked for, e.g. "Thriller" or "Small Town Mystery".',
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "name" }, validation: (r) => r.required() }),
    defineField({
      name: "books",
      title: "Books, in ranked order",
      description: "Top = #1. Drag to reorder — the order IS the ranking. A book can only appear once per ranking.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "book" }] }],
      validation: (r) => r.unique(),
    }),
  ],
  preview: {
    select: { title: "name", books: "books" },
    prepare: ({ title, books }) => ({ title, subtitle: `${books?.length ?? 0} ranked books` }),
  },
});
