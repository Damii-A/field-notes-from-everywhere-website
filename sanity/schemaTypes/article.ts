import { defineField, defineType } from "sanity";

/**
 * Shared Publication article — one schema for all three categories
 * (pub_article.md §1: "not three different page structures ... three
 * category templates applied to the same ... system"). `category` tells the
 * frontend which template/identity to apply; visual identity itself stays
 * frontend-owned (see lib/content/categories.ts), not modeled here.
 */
export default defineType({
  name: "article",
  title: "Article",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: { list: ["the-shortlist", "what-to-read-when", "book-club-book-picks"] },
      validation: (r) => r.required(),
    }),
    defineField({ name: "author", title: "Author", type: "string", initialValue: "The FNFE Team" }),
    defineField({ name: "publishedAt", title: "Published at", type: "datetime", validation: (r) => r.required() }),
    defineField({ name: "heroImage", title: "Hero image", type: "image", options: { hotspot: true }, fields: [{ name: "alt", type: "string", title: "Alt text" }] }),
    defineField({
      name: "methodologySentence",
      title: "Methodology sentence",
      description: 'The one sentence shown in the "How we made this list" box — pub_article.md §4.',
      type: "text",
      rows: 2,
      validation: (r) => r.required(),
    }),
    defineField({ name: "introText", title: "Intro text", type: "array", of: [{ type: "block" }] }),
    defineField({
      name: "bookEntries",
      title: "Book entries",
      description: "pub_article.md §5 — rank is used for The Shortlist only.",
      type: "array",
      of: [
        {
          type: "object",
          name: "bookEntry",
          fields: [
            defineField({ name: "book", title: "Book", type: "reference", to: [{ type: "book" }], validation: (r) => r.required() }),
            defineField({ name: "blurb", title: "Blurb (overrides the book's canonical blurb)", type: "text", rows: 3 }),
            defineField({ name: "tags", title: "Tags (overrides the book's own tags)", type: "array", of: [{ type: "reference", to: [{ type: "tag" }] }] }),
            defineField({ name: "rank", title: "Rank (The Shortlist only)", type: "number" }),
          ],
          preview: { select: { title: "book.title", subtitle: "book.author" } },
        },
      ],
    }),
    defineField({
      name: "whatToReadNext",
      title: "What to read next",
      description: "pub_article.md §6.5 — editorially chosen, up to 3.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "article" }] }],
      validation: (r) => r.max(3),
    }),
  ],
  preview: { select: { title: "title", subtitle: "category" } },
});
