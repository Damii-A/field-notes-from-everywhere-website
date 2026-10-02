import { defineField, defineType } from "sanity";
import { bookEntry } from "./article";

/**
 * One Reading Room issue (the members' Tuesday/Thursday/Saturday email). Its
 * fields follow the user's email layout in order (DECISIONS.md, 2026-10-02):
 * greeting (automatic) → "About this issue" box → the book list → closing
 * sentence + sign-off. "Create Kit draft" (sanity/actions/CreateKitDraftAction.tsx)
 * turns it into a draft broadcast in Kit for members; nothing is sent from here.
 * Shares the Publication's book records for now (user's choice, 2026-10-02).
 */
export default defineType({
  name: "readingRoomIssue",
  title: "Reading Room issue",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Theme",
      description: "What this issue is about, e.g. \"Found family\". Names the issue here in the Studio (and later in Past Issues).",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "subject",
      title: "Email subject line",
      type: "string",
      validation: (r) => [r.required(), r.max(80).warning("Long subject lines get cut off in most inboxes (aim for under ~60 characters).")],
    }),
    defineField({
      name: "previewText",
      title: "Preview text",
      description: "The grey line shown after the subject in most inboxes.",
      type: "string",
      validation: (r) => [r.required(), r.max(140).warning("Inboxes usually show about 90-140 characters of this.")],
    }),
    defineField({
      name: "aboutThisIssue",
      title: "1. About this issue",
      description:
        "Everything you want to say before the books: the theme, what readers can expect, anything else. Shown in a box headed \"About this issue\", straight after \"Hi {first name},\" (added automatically; \"Hi there,\" when Kit has no name). Leave a blank line between paragraphs.",
      type: "text",
      rows: 10,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "ranking",
      title: "Ranking",
      description:
        "Which ranking this issue's books come from. Set this and \"How many books\", then use \"Fill books from ranking\" (in the menu next to the Publish button).",
      type: "reference",
      to: [{ type: "ranking" }],
    }),
    defineField({
      name: "rankingCount",
      title: "How many books",
      description: "The ranking's top books, in rank order (30 = ranks 1-30).",
      type: "number",
      initialValue: 30,
      validation: (r) => r.integer().min(1),
    }),
    defineField({
      name: "bookEntries",
      title: "2. Book list",
      description: "Shown in this order. Drag to reorder.",
      type: "array",
      of: [bookEntry],
      validation: (r) => [r.required().min(1), r.min(30).warning("The Reading Room promises 30+ books per issue.")],
    }),
    defineField({
      name: "closingSentence",
      title: "3. Closing sentence",
      description: "Comes after the last book.",
      type: "text",
      rows: 2,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "signOff",
      title: "4. Sign-off",
      description: "Each line shows as its own line.",
      type: "text",
      rows: 2,
      initialValue: "Happy reading,\nThe FNFE Team",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "kitBroadcastId",
      title: "Kit draft",
      description:
        "Filled in by \"Create Kit draft\". While the Kit email is still a draft, pressing the button again updates it instead of making a new one.",
      type: "number",
      readOnly: true,
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "subject", books: "bookEntries" },
    prepare: ({ title, subtitle, books }) => ({
      title: title || "Untitled issue",
      subtitle: `${books?.length ?? 0} books${subtitle ? ` · ${subtitle}` : ""}`,
    }),
  },
});
