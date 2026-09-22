import { defineField, defineType } from "sanity";

/** Singleton — contact email, social links, Reading Room price copy. ARCHITECTURE.md §6. */
export default defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({ name: "contactEmail", title: "Contact email", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "socialLinks",
      title: "Social links",
      type: "object",
      fields: [
        { name: "pinterest", type: "url", title: "Pinterest" },
        { name: "reddit", type: "url", title: "Reddit" },
      ],
    }),
    defineField({
      name: "readingRoomPriceCopy",
      title: "Reading Room price copy",
      description: 'e.g. "7 days free, no credit card. $7/month after that."',
      type: "string",
    }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});
