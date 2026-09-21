import { defineField, defineType } from "sanity";

/**
 * The single taxonomy shared across Publication articles and (later)
 * Reading Room issues — ARCHITECTURE.md §6. `group` is the 8 groupings
 * named in pub_hub.md / rr_subscriber.md ("Browse our Collections").
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
    defineField({
      name: "group",
      title: "Group",
      type: "string",
      options: {
        list: ["genre", "character", "relationship", "trope", "mood", "theme", "setting", "experience"],
      },
    }),
  ],
});
