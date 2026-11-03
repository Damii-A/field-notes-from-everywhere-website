import { defineField, defineType } from "sanity";
import { CATEGORY_LIST } from "../../lib/content/categories";

/**
 * One post idea, sent from the internal tool's "Post ideas" screen (DECISIONS.md,
 * 2026-11-03). The tool is the only place ideas are edited, so the whole document
 * is view-only here; a resend replaces it (id `postIdea-<toolIdeaId>`). "Start
 * article" turns it into a draft article, which from then on belongs to the Studio.
 */

/** The tool's formula codes, with the names shown here. An unknown code shows as sent. */
export const FORMULA_NAMES: Record<string, string> = {
  authority: "Authority",
  ultimate: "Ultimate list",
  year: "Year",
  mood: "Mood",
  intensity: "Intensity",
  pace: "Pace",
  blend: "Blend",
  comparison: "Comparison (if you loved…)",
  seasonal: "Seasonal",
  series: "Series",
  bookclub: "Book club",
  challenge: "Challenge",
};

const formulaName = (code?: string) => (code ? (FORMULA_NAMES[code] ?? code) : "No formula");
// "book-club-book-picks": the third column's code before its "Up Next" rename (2026-11-03).
const columnName = (slug?: string) =>
  CATEGORY_LIST.find((c) => c.slug === (slug === "book-club-book-picks" ? "up-next" : slug))?.name ?? slug ?? "No column";

export default defineType({
  name: "postIdea",
  title: "Post idea",
  type: "document",
  readOnly: true,
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "otherTitles", title: "Other title options", type: "array", of: [{ type: "string" }] }),
    defineField({
      name: "formula",
      title: "Formula",
      type: "string",
      options: { list: Object.entries(FORMULA_NAMES).map(([value, title]) => ({ value, title })) },
    }),
    defineField({
      name: "column",
      title: "Column",
      type: "string",
      options: { list: CATEGORY_LIST.map((c) => ({ value: c.slug, title: c.name })) },
    }),
    defineField({
      name: "introText",
      title: "Intro text",
      description: "\"Start article\" puts this in the article's intro (plain text; add links in the article).",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "metaDescription",
      title: "Meta description",
      description: "\"Start article\" copies this to the article.",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "slug",
      title: "Slug",
      description: "The article's web address. \"Start article\" copies this to the article.",
      type: "string",
    }),
    defineField({
      name: "focusKeyword",
      title: "Focus keyword",
      description: "\"Start article\" copies this to Shortlist articles (the only column with the field).",
      type: "string",
    }),
    defineField({ name: "ranking", title: "Ranking", type: "reference", to: [{ type: "ranking" }] }),
    defineField({ name: "whyItQualifies", title: "Why it qualifies", type: "text", rows: 2 }),
    defineField({
      name: "evidenceLine",
      title: "Evidence line",
      description: "\"Start article\" puts this in the article's \"How we made this list\" box.",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "timing",
      title: "Timing",
      description: "Seasonal ideas: the occasion, its window and the date to schedule the post for. Year ideas: the year.",
      type: "object",
      fields: [
        defineField({ name: "occasion", title: "Occasion", type: "string" }),
        defineField({ name: "window", title: "Window", type: "string" }),
        defineField({ name: "scheduleFor", title: "Schedule the post for", type: "date" }),
        defineField({ name: "year", title: "Year", type: "number" }),
      ],
    }),
    defineField({
      name: "anchorBook",
      title: "Anchor book",
      description: "Comparison ideas: the book this list is \"like\".",
      type: "reference",
      to: [{ type: "book" }],
    }),
    defineField({
      name: "books",
      title: "Books, in order",
      type: "array",
      of: [
        {
          type: "object",
          name: "postIdeaBook",
          fields: [
            defineField({ name: "book", title: "Book", type: "reference", to: [{ type: "book" }] }),
            defineField({
              name: "tagsShown",
              title: "Tags that put it in this idea",
              description: "\"Start article\" makes these the article entry's \"Tags shown here\".",
              type: "array",
              of: [{ type: "reference", to: [{ type: "tag" }] }],
            }),
          ],
          preview: {
            select: { title: "book.title", author: "book.author", media: "book.coverImage", t0: "tagsShown.0.name", t1: "tagsShown.1.name", t2: "tagsShown.2.name" },
            prepare: ({ title, author, media, t0, t1, t2 }) => ({
              title,
              subtitle: [author, [t0, t1, t2].filter(Boolean).join(", ")].filter(Boolean).join(" · "),
              media,
            }),
          },
        },
      ],
    }),
    defineField({
      name: "sharedTags",
      title: "Shared tags",
      description: "Up to 8 tags most of the books share (for a future \"Why you'll love these\" box).",
      type: "array",
      of: [{ type: "reference", to: [{ type: "tag" }] }],
    }),
    defineField({
      name: "groups",
      title: "Groups",
      description: "For layouts beyond one flat list, e.g. a 12-month reading path's steps. Not on the website yet; \"Start article\" uses the flat book list.",
      type: "array",
      of: [
        {
          type: "object",
          name: "postIdeaGroup",
          fields: [
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({ name: "books", title: "Books", type: "array", of: [{ type: "reference", to: [{ type: "book" }] }] }),
          ],
          preview: {
            select: { title: "label", books: "books" },
            prepare: ({ title, books }) => ({ title, subtitle: `${books?.length ?? 0} books` }),
          },
        },
      ],
    }),
    defineField({ name: "notes", title: "Notes", type: "text", rows: 3 }),
    defineField({ name: "toolIdeaId", title: "Internal tool idea ID", type: "number" }),
    defineField({ name: "sentAt", title: "Last sent from the tool", type: "datetime" }),
  ],
  orderings: [{ title: "Last sent, newest first", name: "sentAtDesc", by: [{ field: "sentAt", direction: "desc" }] }],
  preview: {
    select: { title: "title", formula: "formula", column: "column", books: "books" },
    prepare: ({ title, formula, column, books }) => ({
      title: title || "Untitled idea",
      subtitle: `${formulaName(formula)} · ${columnName(column)} · ${books?.length ?? 0} books`,
    }),
  },
});
