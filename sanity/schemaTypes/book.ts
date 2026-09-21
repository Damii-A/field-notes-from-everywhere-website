import { defineField, defineType } from "sanity";

/**
 * Canonical book record — ARCHITECTURE.md §6. Referenced by an article's
 * bookEntries (with a per-article blurb override) and, later, the Reading
 * Room Books catalogue, which dedupes against this document.
 */
export default defineType({
  name: "book",
  title: "Book",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "author", title: "Author", type: "string", validation: (r) => r.required() }),
    defineField({ name: "coverImage", title: "Cover image", type: "image", options: { hotspot: true } }),
    defineField({ name: "canonicalBlurb", title: "Canonical blurb", type: "text", rows: 3 }),
    defineField({ name: "tags", title: "Tags", type: "array", of: [{ type: "reference", to: [{ type: "tag" }] }] }),
  ],
  preview: { select: { title: "title", subtitle: "author", media: "coverImage" } },
});
