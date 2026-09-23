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
    defineField({
      name: "collectionTags",
      title: "Collections (genre, mood, trope, etc.)",
      description:
        "pub_hub.md §5–12 — which of the 8 \"Browse Our Collections\" groupings this WHOLE ARTICLE belongs to (an article can belong to several, e.g. both a Genre and a Mood). This isn't built into the hub pages yet, but tag it now so nothing needs revisiting once it is. Separate from the tags on individual books within this article.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "tag" }] }],
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
      description:
        "pub_article.md §5. Drag entries into the order you want them to appear — for The Shortlist, that order IS the rank (1, 2, 3…), shown automatically. There's no separate number to set or keep in sync.",
      type: "array",
      of: [
        {
          type: "object",
          name: "bookEntry",
          fields: [
            defineField({ name: "book", title: "Book", type: "reference", to: [{ type: "book" }], validation: (r) => r.required() }),
            defineField({ name: "blurb", title: "Blurb (overrides the book's canonical blurb)", type: "text", rows: 3 }),
            defineField({
              name: "tags",
              title: "Tags shown here (overrides the book's own tags)",
              description:
                "Leave empty to show all of this book's own tags. Fill in just the ones relevant to THIS list to show only those instead — e.g. a book tagged dark fantasy, brutal, and emotionally devastating on its own record can show just \"dark fantasy\" here if that's the only one relevant to this particular article.",
              type: "array",
              of: [{ type: "reference", to: [{ type: "tag" }] }],
            }),
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
