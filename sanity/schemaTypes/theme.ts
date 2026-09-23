import { defineField, defineType } from "sanity";

/**
 * Article-level classification for the Publication's future "Browse Our
 * Collections" hub sections and a possible future glossary — a small,
 * curated vocabulary describing what a WHOLE ARTICLE is about, deliberately
 * separate from `tag` (which describes individual books, and can grow
 * large/granular without that mattering here). A theme and a tag may share a
 * name (e.g. both called "Dark Fantasy") without being the same record —
 * see DECISIONS.md, 2026-09-23.
 *
 * The `group` list below is the user's own 9-group taxonomy (2026-09-23),
 * which intentionally replaces pub_hub.md §5–12's original 8 named sections
 * — a deliberate product-direction change from the mirrored spec, recorded
 * in DECISIONS.md per CLAUDE.md's rule on divergence from governing sources.
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
      description:
        "Which \"Browse Our Collections\" grouping this theme belongs to. This is the user's own 9-group list (2026-09-23), replacing pub_hub.md §5–12's original 8 named sections (Genre/Character/Relationship/Trope/Mood/Theme/Setting/Experience) — see DECISIONS.md.",
      type: "string",
      options: {
        list: [
          { title: "Genre", value: "genre" },
          { title: "Tone", value: "tone" },
          { title: "Mood", value: "mood" },
          { title: "Trope", value: "trope" },
          { title: "Character Archetype", value: "character-archetype" },
          { title: "Relationship", value: "relationship" },
          { title: "Setting", value: "setting" },
          { title: "World Elements", value: "world-elements" },
          { title: "Opening Style", value: "opening-style" },
        ],
      },
      validation: (r) => r.required(),
    }),
  ],
});
