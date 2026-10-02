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
    defineField({
      name: "slug",
      title: "Web address",
      description:
        "The end of this book's \"Where to read\" page address (fieldnotesfromeverywhere.com/where-to-read/…). Click Generate after filling in the title and author. Avoid changing it once the book is in a published list: old links would stop working.",
      type: "slug",
      options: { source: (doc) => `${doc.title ?? ""} ${doc.author ?? ""}`, maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "coverImage", title: "Cover image", type: "image", options: { hotspot: true } }),
    defineField({ name: "canonicalBlurb", title: "Canonical blurb", type: "text", rows: 3 }),
    defineField({ name: "tags", title: "Tags", type: "array", of: [{ type: "reference", to: [{ type: "tag" }] }] }),
  ],
  preview: { select: { title: "title", subtitle: "author", media: "coverImage" } },
});
