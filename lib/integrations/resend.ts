/**
 * Resend — transactional email only (the "send this list to me" flow). See
 * DECISIONS.md "Recommend adding Resend as a transactional-email provider".
 * Not yet configured (no RESEND_API_KEY) — see CURRENT_STATE.md.
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

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
