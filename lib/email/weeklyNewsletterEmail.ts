import { CATEGORIES } from "@/lib/content/categories";
import { splitParagraphs } from "@/lib/content/paragraphs";
import type { CategorySlug } from "@/lib/content/types";
import { SITE_URL } from "@/lib/siteUrl";
import { COLOURS } from "./bookListEmail";
import { BODY, DISPLAY, INK, INK_MUTED, INK_SOFT, MONO, esc } from "./shared";
import { withUtm } from "./utm";

/**
 * The weekly newsletter, laid out as a digest (user, 2026-10-05; DECISIONS.md):
 * logo + date, greeting and intro, then one card per article in its column's
 * colours (image, column pill, title, summary, "Some recommendations from this
 * article" with three same-size covers in one row, "Read this article"
 * button), then the sign-off and Resend's unsubscribe link. Sent as a Resend
 * Broadcast, so `{{{contact.first_name|there}}}` and `{{{RESEND_UNSUBSCRIBE_URL}}}`
 * are filled in by Resend per recipient. No page background (as the welcome
 * email); the cards carry the colour.
 */

export interface NewsletterArticle {
  slug: string;
  category: CategorySlug;
  title: string;
  summary: string;
  heroUrl?: string;
  heroAlt?: string;
  books: { title: string; coverUrl?: string }[];
}

export interface NewsletterEmail {
  sendDate: string; // YYYY-MM-DD
  intro: string;
  articles: NewsletterArticle[];
  signOff: string;
}

// Every cover is cropped to the same 2:3 size by Sanity's image API, so the
// row lines up whatever shape the uploaded cover is (user, 2026-10-05).
const COVER_W = 84;
const COVER_H = 126;
const coverSrc = (url: string) => `${url}${url.includes("?") ? "&" : "?"}w=${COVER_W * 2}&h=${COVER_H * 2}&fit=crop`;
const heroSrc = (url: string) => `${url}${url.includes("?") ? "&" : "?"}w=1104`;

/** "2026-10-14" → "October 14, 2026" (no timezone shift: it's a calendar date). */
export function newsletterDateLabel(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" });
}

function articleCard(a: NewsletterArticle, campaignKey: string): string {
  const c = COLOURS[a.category];
  const url = withUtm(`${SITE_URL}/${a.category}/${a.slug}`, "weekly_newsletter", campaignKey);
  const hero = a.heroUrl
    ? `<tr><td style="padding:0;"><a href="${esc(url)}"><img src="${esc(heroSrc(a.heroUrl))}" alt="${esc(a.heroAlt || "")}" width="552" style="display:block;width:100%;height:auto;border:0;border-radius:15px 15px 0 0;" /></a></td></tr>`
    : "";
  const books = a.books.slice(0, 3);
  const covers = books
    .map((b) => {
      const img = b.coverUrl
        ? `<img src="${esc(coverSrc(b.coverUrl))}" alt="${esc(b.title)}" width="${COVER_W}" height="${COVER_H}" style="display:block;width:${COVER_W}px;height:${COVER_H}px;border:0;border-radius:3px 6px 6px 3px;" />`
        : `<div style="width:${COVER_W}px;height:${COVER_H}px;background:${c.tagBorder};border-radius:3px 6px 6px 3px;"></div>`;
      return `<td width="33%" valign="top" style="padding:0 10px 0 0;">${img}<p style="margin:8px 0 0;width:${COVER_W}px;font:600 12px/1.35 ${BODY};color:${INK_SOFT};">${esc(b.title)}</p></td>`;
    })
    .join("");
  const recs = books.length
    ? `<p style="margin:20px 0 12px;font:600 11px/1.4 ${MONO};letter-spacing:1.5px;text-transform:uppercase;color:${INK_MUTED};">Some recommendations from this article</p>
       <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${covers}</tr></table>`
    : "";
  const summary = splitParagraphs(a.summary)
    .map((p) => `<p style="margin:0 0 10px;font:15px/1.6 ${BODY};color:${INK_SOFT};">${esc(p)}</p>`)
    .join("");

  return `<tr><td style="padding:0 0 24px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${c.pageBg};border:1px solid ${c.tagBorder};border-radius:16px;">
    ${hero}
    <tr><td style="padding:20px 20px 24px;">
      <span style="display:inline-block;padding:4px 12px;border-radius:999px;background:${c.title};font:600 12px/1.4 ${BODY};color:${c.buttonText};">${esc(CATEGORIES[a.category].name)}</span>
      <h2 style="margin:12px 0 10px;font:700 22px/1.25 ${DISPLAY};"><a href="${esc(url)}" style="color:${c.title};text-decoration:none;">${esc(a.title)}</a></h2>
      ${summary}
      ${recs}
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:22px;"><tr><td style="border-radius:999px;background:${c.button};">
        <a href="${esc(url)}" style="display:inline-block;padding:13px 26px;font:700 15px/1 ${DISPLAY};color:${c.buttonText};text-decoration:none;">Read this article</a>
      </td></tr></table>
    </td></tr>
  </table>
</td></tr>`;
}

export function weeklyNewsletterHtml(n: NewsletterEmail): string {
  const home = withUtm(SITE_URL, "weekly_newsletter", n.sendDate);
  const intro = splitParagraphs(n.intro)
    .map((p) => `<p style="margin:0 0 14px;font:16px/1.6 ${BODY};color:${INK};">${esc(p).replace(/\n/g, "<br/>")}</p>`)
    .join("");
  const signOff = n.signOff.trim().split(/\r?\n/).map(esc).join("<br/>");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@700&family=Nunito:wght@400;600&display=swap" rel="stylesheet"/>
<title>Weekly newsletter</title></head>
<body style="margin:0;padding:0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:28px 12px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
    <tr><td align="center" style="padding:0 0 6px;">
      <a href="${esc(home)}" style="text-decoration:none;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="padding:0 10px 0 0;"><img src="${esc(SITE_URL)}/images/logo-ghost.png" alt="" width="44" height="44" style="display:block;border:0;" /></td>
          <td style="font:700 17px/1.1 ${DISPLAY};color:${INK_SOFT};">Field Notes<br/>From Everywhere</td>
        </tr></table>
      </a>
    </td></tr>
    <tr><td align="center" style="padding:6px 0 26px;font:600 11px/1.4 ${MONO};letter-spacing:1.5px;text-transform:uppercase;color:${INK_MUTED};">Weekly newsletter &middot; ${esc(newsletterDateLabel(n.sendDate))}</td></tr>
    <tr><td style="padding:0 24px 18px;">
      <p style="margin:0 0 14px;font:16px/1.6 ${BODY};color:${INK};">Hi {{{contact.first_name|there}}},</p>
      ${intro}
    </td></tr>
    <tr><td style="padding:0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${n.articles.map((a) => articleCard(a, n.sendDate)).join("")}</table></td></tr>
    <tr><td style="padding:4px 24px 0;">
      <p style="margin:0;font:16px/1.6 ${BODY};color:${INK};">${signOff}</p>
      <p style="margin-top:32px;padding-top:16px;border-top:1px solid #e3e0ce;font:12px/1.5 ${BODY};color:${INK_MUTED};">You&rsquo;re getting this because you joined the Field Notes From Everywhere email list. <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:${INK_MUTED};">Unsubscribe</a></p>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
}

/** Plain-text version, for email apps that don't show HTML. */
export function weeklyNewsletterText(n: NewsletterEmail): string {
  const articles = n.articles
    .map((a) => {
      const url = withUtm(`${SITE_URL}/${a.category}/${a.slug}`, "weekly_newsletter", n.sendDate);
      const books = a.books.slice(0, 3).map((b) => `- ${b.title}`).join("\n");
      return `${CATEGORIES[a.category].name.toUpperCase()}\n${a.title}\n\n${splitParagraphs(a.summary).join("\n\n")}${books ? `\n\nSome recommendations from this article:\n${books}` : ""}\n\nRead this article: ${url}`;
    })
    .join("\n\n---\n\n");
  return `Hi {{{contact.first_name|there}}},

${splitParagraphs(n.intro).join("\n\n")}

${articles}

${n.signOff.trim()}

You're getting this because you joined the Field Notes From Everywhere email list. Unsubscribe: {{{RESEND_UNSUBSCRIBE_URL}}}`;
}
