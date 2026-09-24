import { defineField, defineType, type RuleDef, type ValidationContext } from "sanity";
import { TITLE_MAX_CHARS, firstParagraphText, keywordWarning, suggestedFocusKeyword } from "../lib/seoChecks";

interface SeoDoc {
  category?: string;
  focusKeyword?: string;
  ranking?: { _ref: string };
}

/** Shortlist-only SEO warning: does this field mention the article's focus keyword? See sanity/lib/seoChecks.ts. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function keywordCheck<T, R extends RuleDef<R, any> = any>(r: R, where: string, toText: (value: T | undefined) => string | undefined): R {
  return r
    .custom((value: unknown, context: ValidationContext) => {
      const doc = context.document as SeoDoc | undefined;
      if (doc?.category !== "the-shortlist" || !doc.focusKeyword?.trim()) return true;
      return keywordWarning(where, doc.focusKeyword.trim(), toText(value as T | undefined)) ?? true;
    })
    .warning();
}

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
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => [
        r.required(),
        keywordCheck<string>(r, "title", (v) => v),
        r
          .custom((value: string | undefined, context) =>
            (context.document as SeoDoc | undefined)?.category === "the-shortlist" && value && value.length > TITLE_MAX_CHARS
              ? `SEO: ${value.length} characters. Google usually cuts titles off after about ${TITLE_MAX_CHARS}, so put the keyword early.`
              : true,
          )
          .warning(),
      ],
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (r) => [r.required(), keywordCheck<{ current?: string }>(r, "slug", (v) => v?.current)],
    }),
    defineField({
      name: "metaDescription",
      title: "Meta description",
      description:
        "The summary shown under the title in Google results and link previews, and on the hub page when this is the newest article. Aim for 120-160 characters.",
      type: "text",
      rows: 3,
      validation: (r) => [
        r.required(),
        r.min(70).warning("Short for a search result: aim for 120-160 characters."),
        r.max(160).warning("Google usually cuts off descriptions past about 160 characters."),
        keywordCheck<string>(r, "meta description", (v) => v),
      ],
    }),
    defineField({
      name: "focusKeyword",
      title: "Focus keyword (SEO)",
      description:
        "The search term this article targets, usually the theme + \"book recommendations\" (e.g. \"thriller book recommendations\"). The title, slug, meta description and first intro paragraph get a warning if they don't mention it. \"Fill books from ranking\" fills this in if it's empty.",
      type: "string",
      hidden: ({ document }) => document?.category !== "the-shortlist",
      validation: (r) =>
        r
          .custom(async (value: string | undefined, context) => {
            const doc = context.document as SeoDoc | undefined;
            if (doc?.category !== "the-shortlist" || value?.trim()) return true;
            const rankingName = doc.ranking?._ref
              ? await context
                  .getClient({ apiVersion: "2025-01-01" })
                  .fetch<string | null>(`*[_id == $id][0].name`, { id: doc.ranking._ref })
              : null;
            return rankingName
              ? `Add a focus keyword to turn on the SEO checks, e.g. "${suggestedFocusKeyword(rankingName)}".`
              : "Add a focus keyword to turn on the SEO checks.";
          })
          .warning(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: { list: ["the-shortlist", "what-to-read-when", "book-club-book-picks"] },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "themes",
      title: "Themes (genre, mood, trope, etc.)",
      description:
        "pub_hub.md §5–12 — which of the 8 \"Browse Our Collections\" groupings this WHOLE ARTICLE belongs to (an article can belong to several, e.g. both a Genre and a Mood theme). Picks from Themes, NOT Tags — a separate, smaller vocabulary for hub navigation, distinct from the descriptive tags on individual books. This isn't built into the hub pages yet, but set it now so nothing needs revisiting once it is.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "theme" }] }],
    }),
    defineField({ name: "author", title: "Author", type: "string", initialValue: "The FNFE Team" }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      description:
        "When this article goes live, in US Eastern time (the site's timezone). Set a future date/time to schedule it: you can hit Publish now, and it stays hidden from the site until this moment, then appears on its own (within about 5 minutes).",
      type: "datetime",
      options: { displayTimeZone: "America/New_York", allowTimeZoneSwitch: false }, // keep in sync with SITE_TIME_ZONE, lib/content/dates.ts
      validation: (r) => r.required(),
    }),
    defineField({ name: "heroImage", title: "Hero image", type: "image", options: { hotspot: true }, fields: [{ name: "alt", type: "string", title: "Alt text" }] }),
    defineField({
      name: "methodologySentence",
      title: "Methodology sentence",
      description: 'The one sentence shown in the "How we made this list" box — pub_article.md §4.',
      type: "text",
      rows: 2,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "introText",
      title: "Intro text",
      type: "array",
      of: [{ type: "block" }],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      validation: (r) => keywordCheck<any[]>(r, "first paragraph of the intro", (v) => firstParagraphText(v)),
    }),
    defineField({
      name: "ranking",
      title: "Ranking",
      description:
        "Which theme ranking this article's books come from. Set this and \"How many books\", then use \"Fill books from ranking\" (in the menu next to the Publish button) to fill the book list automatically.",
      type: "reference",
      to: [{ type: "ranking" }],
    }),
    defineField({
      name: "rankingCount",
      title: "How many books",
      description:
        "The Shortlist: how many of the ranking's top books to include (10 = ranks 1-10). What to Read When / Book Club Book Picks: how many books to add ALONGSIDE the ranking's top 5 (7 = 12 books total), skipping books already used by this theme's other articles.",
      type: "number",
      validation: (r) => r.integer().min(1),
    }),
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
