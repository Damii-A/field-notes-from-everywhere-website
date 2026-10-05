import { SITE_URL } from "@/lib/siteUrl";
import { BODY, DISPLAY, INK, INK_SOFT, esc, firstName } from "./shared";
import { ISSUE_PALETTES } from "./readingRoomIssueEmail";

/**
 * The welcome email for new Reading Room members (user's copy, 2026-10-05;
 * DECISIONS.md), sent by the Paddle webhook on subscription.activated. In the
 * Reading Room issues' sage palette (the user's pick), so it looks like the
 * issues that follow. No unsubscribe link: it's about a paid membership, and
 * the free list's unsubscribe wouldn't stop the issues (those come from Kit).
 */

const C = ISSUE_PALETTES.sage;
const CONTACT_EMAIL = "hello@fieldnotesfromeverywhere.com";

export const READING_ROOM_WELCOME_SUBJECT = "Welcome to The Reading Room!";
export const READING_ROOM_WELCOME_PREVIEW = "A quick hello, and a few things to know before your first issue arrives.";

/** The copy, in order. `heading` lines are the numbered points, shown in bold. */
type Block = { text: string; heading?: boolean; email?: boolean };
const BLOCKS: Block[] = [
  { text: "Welcome to The Reading Room!" },
  { text: "My name is Dami, and I’m the founder behind Field Notes From Everywhere. I just wanted to quickly pop in to say thank you for trusting us with your book recommendations and do a little bit of housekeeping before your first issue arrives." },
  { text: "A few things to know:" },
  { text: "1. New Reading Room issues go out every Tuesday, Thursday and Saturday at 10am Eastern Time (US).", heading: true },
  { text: "Depending on when you signed up, your first issue should be landing in your inbox pretty soon." },
  { text: "2. Keep an eye on your other inbox folders.", heading: true },
  { text: "We do our best to make sure every Reading Room issue lands in your primary inbox, but unfortunately, that doesn’t always happen. If you don’t see your next issue there, please check your other folders and your spam." },
  { text: "And if you do find us in spam, please mark the email as safe so future issues have a better chance of landing in the right place." },
  { text: "3. You can always reply to me.", heading: true },
  { text: "If you ever have a question, run into a problem, or just want to share some feedback, you can reach me at {email}. I read and respond to every email.", email: true },
  { text: "And that’s about it!" },
  { text: "Have a lovely day, and happy reading." },
];
const SIGNATURE = ["Dami", "Founder, Field Notes From Everywhere"];

export function readingRoomWelcomeHtml(name: string): string {
  const hi = firstName(name);
  const mail = `<a href="mailto:${CONTACT_EMAIL}" style="color:${C.link};">${CONTACT_EMAIL}</a>`;
  const blocks = BLOCKS.map((b) => {
    const text = b.email ? esc(b.text).replace("{email}", mail) : esc(b.text);
    return b.heading
      ? `<p style="margin:26px 0 10px;font:700 17px/1.45 ${DISPLAY};color:${C.title};">${text}</p>`
      : `<p style="margin:0 0 14px;font:16px/1.6 ${BODY};color:${INK};">${text}</p>`;
  }).join("");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@700&family=Nunito:wght@400;600&display=swap" rel="stylesheet"/>
<title>${esc(READING_ROOM_WELCOME_SUBJECT)}</title></head>
<body style="margin:0;padding:0;background:${C.page};">
<div style="display:none;max-height:0;overflow:hidden;">${esc(READING_ROOM_WELCOME_PREVIEW)}${"&#847;&zwnj;&nbsp;".repeat(60)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.page};"><tr><td align="center" style="padding:28px 12px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
    <tr><td align="center" style="padding:0 0 20px;">
      <a href="${esc(SITE_URL)}" style="text-decoration:none;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="padding:0 10px 0 0;"><img src="${esc(SITE_URL)}/images/logo-ghost.png" alt="" width="44" height="44" style="display:block;border:0;" /></td>
          <td style="font:700 17px/1.1 ${DISPLAY};color:${INK_SOFT};">Field Notes<br/>From Everywhere</td>
        </tr></table>
      </a>
    </td></tr>
    <tr><td style="padding:8px 28px 32px;">
      <p style="margin:0 0 14px;font:16px/1.6 ${BODY};color:${INK};">${hi ? `Hi ${esc(hi)},` : "Hi there,"}</p>
      ${blocks}
      <p style="margin:18px 0 0;font:16px/1.6 ${BODY};color:${INK};">${SIGNATURE.map(esc).join("<br/>")}</p>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
}

/** Plain-text version, for email apps that don't show HTML (and better deliverability). */
export function readingRoomWelcomeText(name: string): string {
  const hi = firstName(name);
  const body = BLOCKS.map((b) => b.text.replace("{email}", CONTACT_EMAIL)).join("\n\n");
  return `${hi ? `Hi ${hi},` : "Hi there,"}\n\n${body}\n\n${SIGNATURE.join("\n")}`;
}
