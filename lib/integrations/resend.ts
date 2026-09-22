/**
 * Resend — transactional email (the "send this list to me" flow) and, as of
 * 2026-09-22, the Reading Room trial's daily-catalogue/sales sequence via
 * Resend Automations (see DECISIONS.md, "Move the Reading Room trial
 * sequence from Kit to Resend Automations"). Kit remains the free-list/
 * weekly-recap/membership-tag system; Resend now owns all actual sending
 * except the weekly recap broadcast.
 */
import { Resend } from "resend";
import { articlePath, CATEGORIES, type Article, type FeedArticle } from "@/lib/content";
import { SITE_URL } from "@/lib/siteUrl";

export class ResendNotConfiguredError extends Error {
  constructor() {
    super("RESEND_API_KEY is not set — Resend is not configured yet. See CURRENT_STATE.md.");
    this.name = "ResendNotConfiguredError";
  }
}

const FROM_ADDRESS = "Field Notes From Everywhere <hello@fieldnotesfromeverywhere.com>";

export async function sendBookListEmail(to: string, article: Article): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new ResendNotConfiguredError();

  const resend = new Resend(apiKey);
  const bookListHtml = article.books
    .map(
      (b) =>
        `<li><strong>${escapeHtml(b.rank ? `${b.rank}. ${b.title}` : b.title)}</strong> — ${escapeHtml(b.author)}<br/>${escapeHtml(b.blurb)}</li>`,
    )
    .join("");

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: article.title,
    html: `<p>Here's the list you asked for:</p><ol>${bookListHtml}</ol><p>— Field Notes From Everywhere</p>`,
  });
  if (error) throw new Error(`Resend send failed: ${error.message}`);
}

/** Kit's own event name for automations — matches whatever trigger is configured on the Reading Room trial automation in Resend's dashboard. */
export const READING_ROOM_TRIAL_EVENT = "reading_room_trial_started";

/**
 * Fires a Resend Automations event to start the Reading Room trial sequence
 * (7 days of daily catalogue emails + the trial sales sequence). The
 * automation itself — content and timing — is configured in Resend's
 * dashboard, triggered on this event name; this call only starts it.
 */
export async function triggerReadingRoomTrialEvent(email: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new ResendNotConfiguredError();

  const resend = new Resend(apiKey);
  const { error } = await resend.events.send({ event: READING_ROOM_TRIAL_EVENT, email });
  if (error) throw new Error(`Resend event send failed: ${error.message}`);
}

const BATCH_SIZE = 100; // Resend's own limit per batch call

/**
 * Sends the weekly Publication recap to every given recipient, via Resend
 * Batch (see DECISIONS.md, "Build the weekly recap ourselves via Resend" —
 * Kit's RSS-to-email is Creator-plan-only, so this replaces it). Recipients
 * come from Kit (`listActiveSubscriberEmails`, still the free-list source of
 * truth); this function only composes and sends. Chunked into batches of
 * `BATCH_SIZE` with a deterministic idempotency key per chunk, keyed by
 * `weekKey` (e.g. an ISO week string) — Vercel Cron's delivery is
 * best-effort and can invoke the same scheduled run more than once, so a
 * repeat run within the same week must not double-send (see
 * DECISIONS.md/Vercel's own cron-idempotency guidance).
 */
export async function sendWeeklyRecap(recipients: string[], articles: FeedArticle[], weekKey: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new ResendNotConfiguredError();
  if (recipients.length === 0) return;

  const resend = new Resend(apiKey);
  const subject = `This week on Field Notes From Everywhere: ${articles.length} new list${articles.length === 1 ? "" : "s"}`;
  const itemsHtml = articles
    .map((a) => {
      const url = `${SITE_URL}${articlePath(a)}`;
      return `<li><strong>${escapeHtml(CATEGORIES[a.category].name)}:</strong> <a href="${escapeHtml(url)}">${escapeHtml(a.title)}</a><br/>${escapeHtml(a.methodologySentence)}</li>`;
    })
    .join("");
  const html = `<p>Here's what's new on Field Notes From Everywhere this week:</p><ul>${itemsHtml}</ul><p>— Field Notes From Everywhere</p>`;

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const chunk = recipients.slice(i, i + BATCH_SIZE);
    const payload = chunk.map((to) => ({ from: FROM_ADDRESS, to, subject, html }));
    const { error } = await resend.batch.send(payload, { idempotencyKey: `weekly-recap-${weekKey}-${i / BATCH_SIZE}` });
    if (error) throw new Error(`Resend weekly-recap batch send failed: ${error.message}`);
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
