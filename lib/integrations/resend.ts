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

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
