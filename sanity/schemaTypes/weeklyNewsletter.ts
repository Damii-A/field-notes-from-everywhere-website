import { defineArrayMember, defineField, defineType } from "sanity";
import { NewsletterHowTo } from "../components/NewsletterHowTo";

/**
 * One weekly newsletter (the free list's Wednesday email). The Tuesday cron
 * (app/api/cron/weekly-recap) emails the user a link that creates one,
 * pre-filled with the past week's articles (initialValue below); the user
 * edits it here, then "Create Resend draft"
 * (sanity/actions/CreateResendDraftAction.tsx) saves the finished email
 * in Resend as a draft broadcast, which they send or schedule there. Nothing
 * is sent from the site. DECISIONS.md, 2026-10-05.
 */
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_ARTICLES = 10; // a digest, not a full listing

/** The coming Wednesday (today, if it's Wednesday), as YYYY-MM-DD in US Eastern, the site's timezone. */
function nextWednesday(now = new Date()): string {
  const eastern = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  eastern.setDate(eastern.getDate() + ((3 - eastern.getDay() + 7) % 7));
  return `${eastern.getFullYear()}-${String(eastern.getMonth() + 1).padStart(2, "0")}-${String(eastern.getDate()).padStart(2, "0")}`;
}

export default defineType({
  name: "weeklyNewsletter",
  title: "Weekly newsletter",
  type: "document",
  // A new newsletter starts filled in with the past 7 days' published
  // articles (up to 10, newest first), fetched with the editor's own Studio
  // login, so the server needs no write access (DECISIONS.md, 2026-10-05).
  initialValue: async (_params: unknown, context: { getClient: (o: { apiVersion: string }) => { fetch: <T>(q: string, p: Record<string, unknown>) => Promise<T> } }) => {
    const articles = await context
      .getClient({ apiVersion: "2025-01-01" })
      .fetch<{ _id: string; summary: string | null }[]>(
        `*[_type == "article" && !(_id in path("drafts.**")) && publishedAt <= now() && dateTime(publishedAt) >= dateTime($since)] | order(publishedAt desc)[0...$limit]{
          _id, "summary": coalesce(metaDescription, methodologySentence)
        }`,
        { since: new Date(Date.now() - WEEK_MS).toISOString(), limit: MAX_ARTICLES },
      );
    const n = articles.length;
    return {
      sendDate: nextWednesday(),
      subject: `Field Notes From Everywhere: ${n} new reading list${n === 1 ? "" : "s"}`,
      intro: "Here's what we've published this week on Field Notes From Everywhere.",
      articles: articles.map((a, i) => ({
        _key: `a${i}${a._id.slice(-6).replace(/[^a-zA-Z0-9]/g, "")}`,
        _type: "newsletterArticle",
        article: { _type: "reference", _ref: a._id },
        summary: a.summary ?? "",
      })),
      signOff: "Happy reading,\nThe FNFE Team",
    };
  },
  fields: [
    defineField({
      name: "howTo",
      title: "How to send this newsletter",
      type: "string",
      readOnly: true,
      components: { input: NewsletterHowTo },
    }),
    defineField({
      name: "sendDate",
      title: "Send date",
      description: "The Wednesday this newsletter is meant for. Shown at the top of the email.",
      type: "date",
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
      description: "The grey line shown after the subject in most inboxes. Optional.",
      type: "string",
      validation: (r) => r.max(140).warning("Inboxes usually show about 90-140 characters of this."),
    }),
    defineField({
      name: "intro",
      title: "1. Intro",
      description: "Comes straight after \"Hi {first name},\" (added automatically; \"Hi there,\" when there's no name). Leave a blank line between paragraphs.",
      type: "text",
      rows: 4,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "articles",
      title: "2. Articles",
      description:
        "Each shows as a card: image, column, title, the summary below, three of its books (\"Some recommendations from this article\") and a \"Read this article\" button. Drag to reorder.",
      type: "array",
      of: [
        defineArrayMember({
          name: "newsletterArticle",
          title: "Article",
          type: "object",
          fields: [
            defineField({ name: "article", title: "Article", type: "reference", to: [{ type: "article" }], validation: (r) => r.required() }),
            defineField({
              name: "summary",
              title: "Summary",
              description: "What the card says about the article. Leave empty to use the article's meta description.",
              type: "text",
              rows: 3,
            }),
          ],
          preview: {
            select: { title: "article.title", subtitle: "summary", media: "article.heroImage" },
          },
        }),
      ],
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: "signOff",
      title: "3. Sign-off",
      description: "Each line shows as its own line.",
      type: "text",
      rows: 2,
      initialValue: "Happy reading,\nThe FNFE Team",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "resendBroadcastId",
      title: "Resend draft",
      description:
        "Filled in by \"Create Resend draft\". While the Resend email is still a draft, pressing the button again updates it instead of making a new one.",
      type: "string",
      readOnly: true,
    }),
  ],
  orderings: [{ title: "Send date, newest first", name: "sendDateDesc", by: [{ field: "sendDate", direction: "desc" }] }],
  preview: {
    select: { date: "sendDate", subject: "subject", articles: "articles" },
    prepare: ({ date, subject, articles }) => ({
      title: date ? `Newsletter for ${date}` : "Undated newsletter",
      subtitle: `${articles?.length ?? 0} articles${subject ? ` · ${subject}` : ""}`,
    }),
  },
});
