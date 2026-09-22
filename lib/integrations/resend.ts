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
import type { KitSubscriberInfo } from "@/lib/integrations/kit";
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

/** Resend's own event name for automations — matches whatever trigger is configured on the Reading Room trial automation in Resend's dashboard. */
export const READING_ROOM_TRIAL_EVENT = "reading_room_trial_started";

/**
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

const BATCH_SIZE = 100; // Resend's own limit per batch call

const COVER_WIDTH = 90;

/** One article's block: heading (linked), summary, first-3-covers row — per the format specified 2026-09-22. */
function articleBlockHtml(a: FeedArticle): string {
  const url = `${SITE_URL}${articlePath(a)}`;
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
      <p style="margin:6px 0 12px;font-size:15px;line-height:1.5;color:#3a352c;">${escapeHtml(a.methodologySentence)}</p>
      ${coversHtml ? `<table role="presentation" cellpadding="0" cellspacing="0"><tr>${coversHtml}</tr></table>` : ""}
    </td></tr>`;
}

/**
 * Sends the weekly Publication recap (a fixed-size digest of the most recent
 * articles, not a full listing — see DECISIONS.md, "Build the weekly recap
 * ourselves via Resend") to every given recipient, via Resend Batch.
 * Personalized per recipient with their first name (falls back to "there" if
 * Kit has none on file). Chunked into batches of `BATCH_SIZE` with a
 * deterministic idempotency key per chunk, keyed by `weekKey` — Vercel
 * Cron's delivery is best-effort and can invoke the same scheduled run more
 * than once, so a repeat run within the same week must not double-send (see
 * Vercel's own cron-idempotency guidance).
 */
export async function sendWeeklyRecap(recipients: KitSubscriberInfo[], articles: FeedArticle[], weekKey: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new ResendNotConfiguredError();
  if (recipients.length === 0) return;

  const resend = new Resend(apiKey);
  const subject = `Field Notes From Everywhere: ${articles.length} new reading list${articles.length === 1 ? "" : "s"}`;
  const articlesHtml = articles.map(articleBlockHtml).join("");

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const chunk = recipients.slice(i, i + BATCH_SIZE);
    const payload = chunk.map((r) => {
      const greetingName = r.firstName?.trim() || "there";
      const html = `
        <p>Hi ${escapeHtml(greetingName)},</p>
        <p>Here's what we've published this week on Field Notes From Everywhere.</p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">${articlesHtml}</table>
        <p style="margin-top:28px;">
          <a href="${escapeHtml(SITE_URL)}" style="display:inline-block;padding:12px 24px;background:#1a1a1a;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;">Go to the site</a>
        </p>
        <p>— Field Notes From Everywhere</p>`;
      return { from: FROM_ADDRESS, to: r.email, subject, html };
    });
    const { error } = await resend.batch.send(payload, { idempotencyKey: `weekly-recap-${weekKey}-${i / BATCH_SIZE}` });
    if (error) throw new Error(`Resend weekly-recap batch send failed: ${error.message}`);
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
