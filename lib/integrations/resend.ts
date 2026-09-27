/**
 * Resend — transactional email (the "send this list to me" flow) and, as of
 * 2026-09-22, the Reading Room trial's daily-catalogue/sales sequence via
 * Resend Automations (see DECISIONS.md, "Move the Reading Room trial
 * sequence from Kit to Resend Automations"). Kit remains the free-list/
 * weekly-recap/membership-tag system; Resend now owns all actual sending
 * except the weekly recap broadcast.
 */
import { Resend } from "resend";
import { articlePath, type Article, type FeedArticle } from "@/lib/content";
import { SITE_URL } from "@/lib/siteUrl";
import { unsubscribeHeaders, unsubscribePageUrl } from "@/lib/unsubscribe";
import { bookListEmailHtml, bookListEmailSubject, bookListEmailText } from "@/lib/email/bookListEmail";
import { withUtm } from "@/lib/email/utm";

export class ResendNotConfiguredError extends Error {
  constructor() {
    super("RESEND_API_KEY is not set — Resend is not configured yet. See CURRENT_STATE.md.");
    this.name = "ResendNotConfiguredError";
  }
}

const FROM_ADDRESS = "Field Notes From Everywhere <hello@fieldnotesfromeverywhere.com>";

/** Footer on every free-list email: why they're getting it, and a way out (see lib/unsubscribe.ts). */
function unsubscribeFooterHtml(email: string): string {
  return `<p style="margin-top:32px;padding-top:16px;border-top:1px solid #e3e0ce;font-family:'Nunito',Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#736858;">You're getting this because you joined the Field Notes From Everywhere email list. <a href="${escapeHtml(unsubscribePageUrl(email))}" style="color:#736858;">Unsubscribe</a></p>`;
}

/** The "send this list to me" email; its layout lives in lib/email/bookListEmail.ts. */
export async function sendBookListEmail(to: string, name: string, article: Article): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new ResendNotConfiguredError();

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: bookListEmailSubject(article),
    html: bookListEmailHtml(article, name, unsubscribeFooterHtml(to)),
    text: bookListEmailText(article, name, unsubscribePageUrl(to)),
    headers: unsubscribeHeaders(to),
    // Labels for per-article reporting (DECISIONS.md, 2026-09-27, "Email analytics").
    tags: [
      { name: "email_type", value: "book_list" },
      { name: "category", value: article.category },
      { name: "article", value: article.slug.slice(0, 256) },
    ],
  });
  if (error) throw new Error(`Resend send failed: ${error.message}`);
}

/** Resend's own event name for automations — matches whatever trigger is configured on the Reading Room trial automation in Resend's dashboard. */
export const READING_ROOM_TRIAL_EVENT = "reading_room_trial_started";

/** Creates the contact in Resend if it doesn't already exist. Duplicate-email errors are expected and ignored — the subsequent segment-add call addresses the contact by email regardless of whether this call created it. */
async function upsertContact(resend: Resend, email: string, firstName: string): Promise<void> {
  await resend.contacts.create({ email, firstName });
}

/**
 * Adds someone to a Resend contact segment (Resend's replacement for
 * Audiences — contacts are global, not owned by one audience — see
 * DECISIONS.md, "Move the free list from Kit to Resend contacts"). Used for
 * free-list source attribution (`RESEND_NEWSLETTER_SEGMENT_ID` /
 * `RESEND_SEND_LIST_SEGMENT_ID`).
 */
export async function addToSegment(email: string, firstName: string, segmentId: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new ResendNotConfiguredError();
  // The whole-list segment the weekly newsletter Broadcast is sent to. If it's
  // missing from the environment, still sign them up (just log it): a config
  // slip shouldn't turn away subscribers.
  const emailListSegmentId = process.env.RESEND_EMAIL_LIST_SEGMENT_ID;
  if (!emailListSegmentId) console.error("[resend] RESEND_EMAIL_LIST_SEGMENT_ID is not set; contact not added to the newsletter list.");

  const resend = new Resend(apiKey);
  await upsertContact(resend, email, firstName);
  for (const id of emailListSegmentId ? [segmentId, emailListSegmentId] : [segmentId]) {
    const { error } = await resend.contacts.segments.add({ email, segmentId: id });
    if (error) throw new Error(`Resend add-to-segment failed: ${error.message}`);
  }
  // Signing up again is a fresh opt-in, so it clears an earlier unsubscribe,
  // and the name just typed replaces an older one (create() leaves an
  // existing contact untouched; the weekly recap greets by this name).
  const { error: resubError } = await resend.contacts.update({ email, unsubscribed: false, firstName });
  if (resubError) throw new Error(`Resend re-subscribe failed: ${resubError.message}`);
}

/** Marks a contact unsubscribed (the weekly recap skips them — see `listSegmentContacts`). Used by /api/unsubscribe. */
export async function unsubscribeContact(email: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new ResendNotConfiguredError();

  const resend = new Resend(apiKey);
  const { error } = await resend.contacts.update({ email, unsubscribed: true });
  // An address that was never a contact has nothing to stop sending to.
  if (error && !/not.?found/i.test(error.message)) throw new Error(`Resend unsubscribe failed: ${error.message}`);
}

/**
 * Resend contact property (number, 0/1 — Resend contact properties only
 * support string/number, no boolean) mirroring Kit's `KIT_READING_ROOM_TAG_ID`
 * tag: 1 while someone has a confirmed, active Reading Room relationship
 * (trialing-and-converted or paying), 0 otherwise. Set by the Paddle webhook
 * alongside the Kit tag (see `app/api/webhooks/paddle/route.ts`) — this is
 * the conversion signal the trial automation's post-trial branch reads via a
 * `condition` step in Resend's own automation builder (checked before each
 * further email, per ARCHITECTURE.md §9), since nothing previously told
 * Resend when someone actually converted. The property itself
 * (`reading_room_member`, type `number`, fallback `0`) was created directly
 * via `resend.contactProperties.create()` against the real account, the same
 * pattern as the free-list Segments — see DECISIONS.md.
 */
const READING_ROOM_MEMBER_PROPERTY = "reading_room_member";

export async function setReadingRoomMemberProperty(email: string, active: boolean, firstName?: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new ResendNotConfiguredError();

  const resend = new Resend(apiKey);
  // Someone can reach Paddle checkout without ever having started a trial
  // (the landing page's "Subscribe" CTA skips straight to the checkout page),
  // so they may not already be a Resend contact — upsert first, same
  // duplicate-tolerant pattern as `upsertContact`/`addToSegment` above.
  await resend.contacts.create({ email, firstName: firstName || undefined });
  const { error } = await resend.contacts.update({
    email,
    properties: { [READING_ROOM_MEMBER_PROPERTY]: active ? 1 : 0 },
  });
  if (error) throw new Error(`Resend contact-property update failed: ${error.message}`);
}

/**
 * Unused while the free trial is paused (DECISIONS.md 2026-09-27); kept for
 * when it returns, since the Resend automation is still keyed to this event.
 * Fires a Resend Automations event to start the Reading Room trial sequence
 * (welcome, 7 days of trial catalogue content, then a conversion push). The
 * automation itself — content and timing — is configured in Resend's
 * dashboard, triggered on this event name; this call only starts it. `name`
 * is passed through in the event payload so the automation's emails can be
 * personalized ("Hi {{name}}") — see DECISIONS.md, name collection added
 * 2026-09-22.
 */
export async function triggerReadingRoomTrialEvent(email: string, name: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new ResendNotConfiguredError();

  const resend = new Resend(apiKey);
  const { error } = await resend.events.send({ event: READING_ROOM_TRIAL_EVENT, email, payload: { name } });
  if (error) throw new Error(`Resend event send failed: ${error.message}`);
}

const COVER_WIDTH = 90;

/** One article's block: heading (linked), summary, first-3-covers row — per the format specified 2026-09-22. */
function articleBlockHtml(a: FeedArticle, weekKey: string): string {
  const url = withUtm(`${SITE_URL}${articlePath(a)}`, "weekly_newsletter", weekKey);
  const coversHtml = a.books
    .map((b) =>
      b.coverImage
        ? `<td style="padding:0 6px 0 0;"><img src="${escapeHtml(b.coverImage.url)}" alt="${escapeHtml(b.coverImage.alt)}" width="${COVER_WIDTH}" style="display:block;width:${COVER_WIDTH}px;height:auto;border-radius:4px;" /></td>`
        : `<td style="padding:0 6px 0 0;"><div style="width:${COVER_WIDTH}px;height:${Math.round(COVER_WIDTH * 1.5)}px;background:#d8d0c4;border-radius:4px;color:#3a352c;font-size:11px;line-height:1.3;padding:6px;box-sizing:border-box;">${escapeHtml(b.title)}</div></td>`,
    )
    .join("");

  return `
    <tr><td style="padding:20px 0 0;">
      <a href="${escapeHtml(url)}" style="font-size:18px;font-weight:700;color:#1a1a1a;text-decoration:none;">${escapeHtml(a.title)}</a>
      <p style="margin:6px 0 12px;font-size:15px;line-height:1.5;color:#3a352c;">${escapeHtml(a.description)}</p>
      ${coversHtml ? `<table role="presentation" cellpadding="0" cellspacing="0"><tr>${coversHtml}</tr></table>` : ""}
    </td></tr>`;
}

/**
 * Sends the weekly newsletter (a digest of the week's articles) as a Resend
 * **Broadcast** to the whole-list segment, so each issue gets its own
 * delivered / open / click / unsubscribe stats in Resend's Broadcasts page
 * (DECISIONS.md, 2026-09-27, "Email analytics"; previously one batch email per
 * recipient, which Resend can only report on account-wide). Resend fills in
 * each contact's first name and a per-recipient unsubscribe link (which sets
 * the same `unsubscribed` flag as our own /unsubscribe), and skips
 * unsubscribed contacts itself.
 *
 * Vercel Cron can run the same schedule more than once, so an issue is named
 * after its date and not sent again if a Broadcast with that name exists.
 */
export async function sendWeeklyNewsletter(articles: FeedArticle[], weekKey: string): Promise<{ sent: boolean; broadcastId?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const segmentId = process.env.RESEND_EMAIL_LIST_SEGMENT_ID;
  if (!apiKey || !segmentId) throw new ResendNotConfiguredError();

  const resend = new Resend(apiKey);
  const name = `Weekly newsletter ${weekKey}`;
  const { data: existing, error: listError } = await resend.broadcasts.list({ limit: 100 });
  if (listError) throw new Error(`Resend list-broadcasts failed: ${listError.message}`);
  if (existing?.data.some((b) => b.name === name)) return { sent: false };

  const subject = `Field Notes From Everywhere: ${articles.length} new reading list${articles.length === 1 ? "" : "s"}`;
  const home = withUtm(SITE_URL, "weekly_newsletter", weekKey);
  const html = `
    <p>Hi {{{contact.first_name|there}}},</p>
    <p>Here's what we've published this week on Field Notes From Everywhere.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">${articles.map((a) => articleBlockHtml(a, weekKey)).join("")}</table>
    <p style="margin-top:28px;">
      <a href="${escapeHtml(home)}" style="display:inline-block;padding:12px 24px;background:#1a1a1a;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;">Go to the site</a>
    </p>
    <p>— Field Notes From Everywhere</p>
    <p style="margin-top:32px;padding-top:16px;border-top:1px solid #e3e0ce;font-family:'Nunito',Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#736858;">You're getting this because you joined the Field Notes From Everywhere email list. <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#736858;">Unsubscribe</a></p>`;

  const { data, error } = await resend.broadcasts.create({ name, segmentId, from: FROM_ADDRESS, subject, html, send: true });
  if (error) throw new Error(`Resend weekly-newsletter broadcast failed: ${error.message}`);
  return { sent: true, broadcastId: data?.id };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
