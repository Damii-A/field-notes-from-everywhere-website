import { SITE_URL } from "@/lib/siteUrl";
import { BODY, DISPLAY, INK, INK_SOFT, esc, firstName } from "./shared";
import { withUtm } from "./utm";

/**
 * The welcome email for footer newsletter signups (user's copy, 2026-10-05;
 * DECISIONS.md). Only "newsletter" signups who are new to the list get it:
 * "send this list to me" signups already hear about the newsletter in the
 * book-list email's P.P.S.
 */

const PAGE_BG = "#ECEEDF"; // --paper-100, the site's page colour (--surface-page)

export const WELCOME_EMAIL_SUBJECT = "You're signed up for the FNFE newsletter";

/**
 * When their first newsletter is due. The cron sends Wednesdays 14:00 UTC
 * (vercel.json); the weekday is read in US Eastern, the site's timezone.
 */
export function firstNewsletterWhen(now: Date = new Date()): "today" | "this" | "next" {
  const weekday = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short" }).format(now);
  if (weekday === "Sun" || weekday === "Mon" || weekday === "Tue") return "this";
  if (weekday === "Wed" && now.getUTCDay() === 3 && now.getUTCHours() < 14) return "today";
  return "next";
}

function copy(when: ReturnType<typeof firstNewsletterWhen>) {
  const start = when === "today" ? "Starting today" : when === "this" ? "Starting this Wednesday" : "Starting next Wednesday";
  return {
    lines: [
      "You’re officially signed up for the Field Notes From Everywhere newsletter!",
      `${start}, we’ll send you a weekly roundup of the latest book lists we’ve published, so you can catch up on anything you might have missed.`,
      when === "today" ? "See you later today!" : "See you Wednesday!",
    ],
    signOff: "The FNFE Team",
  };
}

export function welcomeEmailHtml(name: string, footerHtml: string, now: Date = new Date()): string {
  const hi = firstName(name);
  const home = withUtm(SITE_URL, "welcome");
  const { lines, signOff } = copy(firstNewsletterWhen(now));
  const paragraphs = lines
    .map((l) => `<p style="margin:0 0 14px;font:16px/1.6 ${BODY};color:${INK};">${esc(l)}</p>`)
    .join("");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@700&family=Nunito:wght@400;600&display=swap" rel="stylesheet"/>
<title>${esc(WELCOME_EMAIL_SUBJECT)}</title></head>
<body style="margin:0;padding:0;background:${PAGE_BG};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAGE_BG};"><tr><td align="center" style="padding:28px 12px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
    <tr><td align="center" style="padding:0 0 20px;">
      <a href="${esc(home)}" style="text-decoration:none;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="padding:0 10px 0 0;"><img src="${esc(SITE_URL)}/images/logo-ghost.png" alt="" width="44" height="44" style="display:block;border:0;" /></td>
          <td style="font:700 17px/1.1 ${DISPLAY};color:${INK_SOFT};">Field Notes<br/>From Everywhere</td>
        </tr></table>
      </a>
    </td></tr>
    <tr><td style="padding:8px 28px 32px;">
      <p style="margin:0 0 14px;font:16px/1.6 ${BODY};color:${INK};">${hi ? `Hi ${esc(hi)},` : "Hi there,"}</p>
      ${paragraphs}
      <p style="margin:4px 0 0;font:16px/1.6 ${BODY};color:${INK};">${esc(signOff)}</p>
    </td></tr>
    <tr><td style="padding:4px 16px 0;">${footerHtml}</td></tr>
  </table>
</td></tr></table>
</body></html>`;
}

/** Plain-text version, for email apps that don't show HTML (and better deliverability). */
export function welcomeEmailText(name: string, unsubscribeUrl: string, now: Date = new Date()): string {
  const hi = firstName(name);
  const { lines, signOff } = copy(firstNewsletterWhen(now));
  return `${hi ? `Hi ${hi},` : "Hi there,"}

${lines.join("\n\n")}

${signOff}

You're getting this because you joined the Field Notes From Everywhere email list. Unsubscribe: ${unsubscribeUrl}`;
}
