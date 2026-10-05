/**
 * Resend — transactional email (the "send this list to me" flow) and, as of
 * 2026-09-22, the Reading Room trial's daily-catalogue/sales sequence via
 * Resend Automations (see DECISIONS.md, "Move the Reading Room trial
 * sequence from Kit to Resend Automations"). Kit remains the free-list/
 * weekly-recap/membership-tag system; Resend now owns all actual sending
 * except the weekly recap broadcast.
 */
import { Resend } from "resend";
import type { Article } from "@/lib/content";
import { unsubscribeHeaders, unsubscribePageUrl } from "@/lib/unsubscribe";
import { bookListEmailHtml, bookListEmailSubject, bookListEmailText } from "@/lib/email/bookListEmail";
import { WELCOME_EMAIL_SUBJECT, welcomeEmailHtml, welcomeEmailText } from "@/lib/email/welcomeEmail";
import { READING_ROOM_WELCOME_SUBJECT, readingRoomWelcomeHtml, readingRoomWelcomeText } from "@/lib/email/readingRoomWelcomeEmail";

export class ResendNotConfiguredError extends Error {
  constructor() {
    super("RESEND_API_KEY is not set — Resend is not configured yet. See CURRENT_STATE.md.");
    this.name = "ResendNotConfiguredError";
  }
}

const FROM_ADDRESS = "Field Notes From Everywhere <hello@fieldnotesfromeverywhere.com>";
/** The site's own inbox (Zoho), for notices meant for the user. */
const CONTACT_ADDRESS = "hello@fieldnotesfromeverywhere.com";

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

/** The welcome email for new footer newsletter signups; its layout lives in lib/email/welcomeEmail.ts. */
export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new ResendNotConfiguredError();

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: WELCOME_EMAIL_SUBJECT,
    html: welcomeEmailHtml(name, unsubscribeFooterHtml(to)),
    text: welcomeEmailText(name, unsubscribePageUrl(to)),
    headers: unsubscribeHeaders(to),
    tags: [{ name: "email_type", value: "welcome" }],
  });
  if (error) throw new Error(`Resend send failed: ${error.message}`);
}

/**
 * The welcome email for a new Reading Room member (layout in
 * lib/email/readingRoomWelcomeEmail.ts), sent by the Paddle webhook. The
 * idempotency key (one per subscription) stops Paddle's retries or repeat
 * deliveries sending it twice (Resend keeps keys for 24 hours).
 */
export async function sendReadingRoomWelcomeEmail(to: string, name: string, subscriptionId: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new ResendNotConfiguredError();

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send(
    {
      from: FROM_ADDRESS,
      to,
      subject: READING_ROOM_WELCOME_SUBJECT,
      html: readingRoomWelcomeHtml(name),
      text: readingRoomWelcomeText(name),
      tags: [{ name: "email_type", value: "reading_room_welcome" }],
    },
    { idempotencyKey: `reading-room-welcome/${subscriptionId}` },
  );
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
export async function addToSegment(email: string, firstName: string, segmentId: string): Promise<{ newToList: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new ResendNotConfiguredError();
  // The whole-list segment the weekly newsletter Broadcast is sent to. If it's
  // missing from the environment, still sign them up (just log it): a config
  // slip shouldn't turn away subscribers.
  const emailListSegmentId = process.env.RESEND_EMAIL_LIST_SEGMENT_ID;
  if (!emailListSegmentId) console.error("[resend] RESEND_EMAIL_LIST_SEGMENT_ID is not set; contact not added to the newsletter list.");

  const resend = new Resend(apiKey);
  const newToList = await isNewToList(resend, email, emailListSegmentId);
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
  return { newToList };
}

/**
 * True when this signup puts them on the newsletter list: no contact yet, an
 * unsubscribed one, or one not in the whole-list segment (e.g. a Reading Room
 * member the Paddle webhook created). contacts.create() answers the same for
 * new and existing contacts, so this has to be checked first. If the check
 * itself fails, assume not new: a missed welcome beats a repeated one.
 */
async function isNewToList(resend: Resend, email: string, emailListSegmentId: string | undefined): Promise<boolean> {
  const { data: contact, error } = await resend.contacts.get(email);
  if (error) return /not.?found/i.test(error.message);
  if (!contact) return true;
  if (contact.unsubscribed) return true;
  if (!emailListSegmentId) return false;
  const { data: segments, error: segError } = await resend.contacts.segments.list({ email });
  if (segError || !segments) return false;
  return !segments.data.some((s) => s.id === emailListSegmentId);
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

/**
 * Saves the weekly newsletter (built in the Studio, see
 * sanity/schemaTypes/weeklyNewsletter.ts) as a **draft** Resend Broadcast to
 * the whole-list segment; the user sends or schedules it in Resend. Nothing is
 * sent from here (DECISIONS.md, 2026-10-05). Updates the existing draft when
 * `existingId` is still a draft; refuses if that one was already sent or
 * scheduled (pressing again must never lead to a second send); makes a new one
 * if it was deleted. A Broadcast gets its own delivered / open / click /
 * unsubscribe stats in Resend (DECISIONS.md, 2026-09-27, "Email analytics").
 */
export class NewsletterAlreadySentError extends Error {}

export async function saveNewsletterDraft(opts: { existingId?: string; name: string; subject: string; previewText?: string; html: string; text: string }): Promise<{ id: string; created: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  const segmentId = process.env.RESEND_EMAIL_LIST_SEGMENT_ID;
  if (!apiKey || !segmentId) throw new ResendNotConfiguredError();
  const resend = new Resend(apiKey);
  const content = { name: opts.name, subject: opts.subject, previewText: opts.previewText || undefined, html: opts.html, text: opts.text };

  if (opts.existingId) {
    const { data: existing } = await resend.broadcasts.get(opts.existingId);
    if (existing && existing.status !== "draft") {
      throw new NewsletterAlreadySentError("This newsletter has already been sent or scheduled in Resend, so it wasn't changed.");
    }
    if (existing) {
      const { error } = await resend.broadcasts.update(opts.existingId, { ...content, segmentId, from: FROM_ADDRESS });
      if (error) throw new Error(`Resend update-broadcast failed: ${error.message}`);
      return { id: opts.existingId, created: false };
    }
  }
  const { data, error } = await resend.broadcasts.create({ ...content, segmentId, from: FROM_ADDRESS, send: false });
  if (error || !data) throw new Error(`Resend create-broadcast failed: ${error?.message}`);
  return { id: data.id, created: true };
}

/**
 * Tells the user (at the site's own inbox) it's time for this week's
 * newsletter, with a link that opens it in the Studio already filled in, or
 * that nothing was published this week. One per week: the idempotency key
 * stops a repeated cron run emailing twice.
 */
export async function sendNewsletterDraftNotice(weekKey: string, outcome: { studioUrl: string; articleCount: number } | { empty: true }): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new ResendNotConfiguredError();

  const resend = new Resend(apiKey);
  const link = (href: string, label: string) => `<a href="${escapeHtml(href)}" style="color:#8F5F3C;">${label}</a>`;
  let subject: string;
  let lines: string[];
  if ("studioUrl" in outcome) {
    const n = outcome.articleCount;
    subject = "This week's newsletter is ready to edit";
    lines = [
      `${link(outcome.studioUrl, "Open this week's newsletter in the Studio")}. It opens already filled in with the ${n} article${n === 1 ? "" : "s"} published in the past 7 days. (Open it once: each click starts a new newsletter.)`,
      `Edit anything you like, publish it, then press <strong>Create Resend draft</strong> (in the menu next to Publish). It then waits in ${link("https://resend.com/broadcasts", "Resend &rarr; Broadcasts")} for you to send or schedule for Wednesday 10am Eastern. Nothing goes out until you do.`,
    ];
  } else {
    subject = "No newsletter this week";
    lines = ["Nothing was published on the site in the past 7 days, so there's no newsletter to make this week."];
  }
  const html = lines.map((t) => `<p style="margin:0 0 14px;font:16px/1.6 Nunito,Arial,sans-serif;color:#302B24;">${t}</p>`).join("");
  const text = lines.map((l) => l.replace(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g, "$2 ($1)").replace(/<[^>]+>/g, "").replace("&rarr;", "→")).join("\n\n");
  const { error } = await resend.emails.send(
    { from: FROM_ADDRESS, to: CONTACT_ADDRESS, subject, html, text, tags: [{ name: "email_type", value: "newsletter_draft_notice" }] },
    { idempotencyKey: `newsletter-draft-notice/${weekKey}` },
  );
  if (error) throw new Error(`Resend send failed: ${error.message}`);
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
