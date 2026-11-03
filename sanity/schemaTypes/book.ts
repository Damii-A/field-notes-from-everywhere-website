import { defineField, defineType } from "sanity";

/**
 * Canonical book record — ARCHITECTURE.md §6. Referenced by an article's
 * bookEntries (with a per-article blurb override) and, later, the Reading
 * Room Books catalogue, which dedupes against this document.
 *
 * View-only in the Studio (user, 2026-11-03; DECISIONS.md): books are edited only
 * in the internal tool and arrive by its "Send books to Studio". They can't be
 * created, edited, duplicated or deleted here (sanity.config.ts). An article's own
 * blurb and "Tags shown here" stay editable on the article.
 */
export default defineType({
  name: "book",
  title: "Book",
  type: "document",
  readOnly: true,
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
    defineField({
      name: "goodreadsUrl",
      title: "Goodreads link",
      description:
        "This book's own Goodreads page, for the Goodreads button on its \"Where to read\" page. Filled in automatically on import (the top title match by this author); paste a different goodreads.com/book/show/… link to correct it. Empty = a Goodreads title search instead.",
      type: "url",
      validation: (r) =>
        r.custom((v: string | undefined) => (!v || /^https:\/\/www\.goodreads\.com\/book\/show\//.test(v) ? true : "Use a goodreads.com/book/show/… link")),
    }),
    defineField({ name: "coverImage", title: "Cover image", type: "image", options: { hotspot: true } }),
    defineField({ name: "canonicalBlurb", title: "Canonical blurb", type: "text", rows: 3 }),
    defineField({ name: "tags", title: "Tags", type: "array", of: [{ type: "reference", to: [{ type: "tag" }] }] }),
    defineField({
      name: "pageCount",
      title: "Page count",
      description: "Set by \"Send books to Studio\" in the internal tool. Shown under the author as \"Page count: …\".",
      type: "number",
      readOnly: true,
    }),
    defineField({
      name: "readingHours",
      title: "Estimated reading time (hours)",
      description: "The internal tool's estimate from the page count, sent with it. Shown as \"Est. reading time: … hours\".",
      type: "number",
      readOnly: true,
    }),
    // Publication year and series (DECISIONS.md, 2026-11-03): sent by the internal tool, stored only (not shown on the site yet).
    defineField({
      name: "publishedYear",
      title: "Publication year",
      description: "Set by \"Send books to Studio\". Stored only; not shown on the site yet.",
      type: "number",
    }),
    defineField({
      name: "series",
      title: "Series",
      description: "Set by \"Send books to Studio\" once confirmed in the tool. Stored only; not shown on the site yet.",
      type: "object",
      fields: [
        defineField({
          name: "status",
          title: "Status",
          type: "string",
          options: { list: [{ value: "standalone", title: "Standalone" }, { value: "finished", title: "Finished series" }, { value: "ongoing", title: "Ongoing series" }] },
        }),
        defineField({ name: "name", title: "Series name", type: "string" }),
        defineField({ name: "number", title: "Number in the series", type: "number" }),
        defineField({ name: "total", title: "Books in the series", type: "number" }),
      ],
    }),
    defineField({
      name: "toolBookId",
      title: "Internal tool book ID",
      description:
        "Set by \"Send to website\" in the internal tool: which tool book this is, so a resend updates this book instead of making a copy. Empty for books never sent.",
      type: "number",
      readOnly: true,
    }),
  ],
  preview: { select: { title: "title", subtitle: "author", media: "coverImage" } },
});
