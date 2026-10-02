import { defineField, defineType } from "sanity";
import { bookEntry } from "./article";

const PARAGRAPHS_HINT = "Leave a blank line between paragraphs.";

/**
 * One Reading Room issue (the members' Tuesday/Thursday/Saturday email). Its
 * fields follow the user's email layout in order (DECISIONS.md, 2026-10-02):
 * greeting (automatic) → intro sentence → the theme → what to expect → transition
 * sentence → the book list. "Create Kit draft" (sanity/actions/CreateKitDraftAction.tsx)
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
      name: "introSentence",
      title: "1. Intro sentence",
      description: "Comes straight after \"Hi {first name},\" (added automatically; \"Hi there,\" when Kit has no name).",
      type: "text",
      rows: 2,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "themeHeading",
      title: "2. Theme section heading",
      description: "The small heading on the theme box.",
      type: "string",
      initialValue: "About this theme",
    }),
    defineField({
      name: "themeExplanation",
      title: "2. Explaining the theme",
      description: PARAGRAPHS_HINT,
      type: "text",
      rows: 6,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "expectHeading",
      title: "3. \"What to expect\" section heading",
      description: "The small heading on the what-to-expect box.",
      type: "string",
      initialValue: "What to expect",
    }),
    defineField({
      name: "whatToExpect",
      title: "3. What to expect from these books",
      description: `What readers will find in this list, so they know whether it sounds like their thing. ${PARAGRAPHS_HINT}`,
      type: "text",
      rows: 6,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "transitionSentence",
      title: "4. Transition to the book list",
      type: "text",
      rows: 2,
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
      title: "5. Book list",
      description: "Shown in this order. Drag to reorder.",
      type: "array",
      of: [bookEntry],
      validation: (r) => [r.required().min(1), r.min(30).warning("The Reading Room promises 30+ books per issue.")],
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
