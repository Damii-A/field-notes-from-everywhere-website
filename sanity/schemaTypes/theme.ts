import { defineField, defineType } from "sanity";

/**
 * Article-level classification for the Publication's future "Browse Our
 * Collections" hub sections (pub_hub.md §5–12) and a possible future
 * glossary — a small, curated vocabulary describing what a WHOLE ARTICLE is
 * about, deliberately separate from `tag` (which describes individual
 * books, and can grow large/granular without that mattering here). A theme
 * and a tag may share a name (e.g. both called "Dark Fantasy") without
 * being the same record — see DECISIONS.md, 2026-09-23.
 *
 * Scoped to the Publication only — the future Reading Room archive/catalogue
 * (still out of V1 scope) will have its own book/tag model and is not
 * expected to reuse this, per the user's direction 2026-09-23.
 */
export default defineType({
  name: "theme",
  title: "Theme",
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
    defineField({
      name: "group",
      title: "Group",
      description: "Which of the 8 \"Browse Our Collections\" sections this theme belongs to — pub_hub.md §5–12.",
      type: "string",
      options: {
        list: ["genre", "character", "relationship", "trope", "mood", "theme", "setting", "experience"],
      },
      validation: (r) => r.required(),
    }),
  ],
});
