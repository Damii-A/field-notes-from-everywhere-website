import { defineField, defineType } from "sanity";

/**
 * Book-level descriptor vocabulary — how an individual book is characterized
 * (e.g. "dark fantasy", "brutal", "emotionally devastating"), shown as tag
 * pills under a book within an article (`article.bookEntries[].tags`, an
 * optional per-article display override of a book's own `tags`). Deliberately
 * NOT the mechanism for hub-page "Browse Our Collections" grouping — that's
 * `theme` (see theme.ts), a separate, smaller, curated vocabulary. A tag and
 * a theme may share a name without being the same record — see DECISIONS.md,
 * 2026-09-23.
 *
 * Scoped to the Publication only — the future Reading Room archive/catalogue
 * (still out of V1 scope) will have its own book/tag model, not this one.
 */
export default defineType({
  name: "tag",
  title: "Tag",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name" },
      validation: (r) => r.required(),
    }),
  ],
});
