import { defineField, defineType } from "sanity";

/** Shared Terms / Privacy & Cookies / Disclosures template — utility_pages.md §2. */
export default defineType({
  name: "legalPage",
  title: "Legal page",
  type: "document",
  fields: [
    defineField({
      name: "slug",
      title: "Slug",
      type: "string",
      options: { list: ["terms", "privacy-and-cookies", "disclosures"] },
      validation: (r) => r.required(),
    }),
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "body", title: "Body", type: "array", of: [{ type: "block" }], validation: (r) => r.required() }),
  ],
  preview: { select: { title: "title" } },
});
