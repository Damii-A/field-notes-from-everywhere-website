import { articlePath, type Article, type CategorySlug } from "@/lib/content";
import { CATEGORIES } from "@/lib/content/categories";
import { splitParagraphs } from "@/lib/content/paragraphs";
import { SITE_URL } from "@/lib/siteUrl";
import { BODY, DISPLAY, INK, INK_MUTED, INK_SOFT, MONO, RULE, esc, firstName, sized } from "./shared";
import { withUtm } from "./utm";

/**
 * The "send this list to me" email (pub_article.md §6.4), laid out like the
 * article it came from: logo, greeting, article image + title + methodology
 * box, then every book with cover, author, tags and blurb, on the article's
 * own category colour (no white card; user, 2026-09-27). Email clients can't read the site's CSS variables,
 * so the colours below are the hex values of the tokens ArticleView uses
 * (styles/tokens). Tables + inline styles throughout, for email clients.
 */

// methodBg: the "How we made this list" box, one shade off the page colour (as on the site).
const COLOURS: Record<CategorySlug, { pageBg: string; methodBg: string; title: string; tagBorder: string; methodBorder: string; button: string; buttonText: string }> = {
  "the-shortlist": { pageBg: "#E5EAD8", methodBg: "#F5F7EE", title: "#657455", tagBorder: "#B4C09E", methodBorder: "#8B9C71", button: "#657455", buttonText: "#F5F7EE" },
  "what-to-read-when": { pageBg: "#ECEEDF", methodBg: "#F5F7EE", title: "#8F5F3C", tagBorder: "#CFAB8D", methodBorder: "#B98E6B", button: "#8F5F3C", buttonText: "#F5F7EE" },
  "book-club-book-picks": { pageBg: "#F5F7EE", methodBg: "#ECEEDF", title: "#3F606B", tagBorder: "#8FC4D2", methodBorder: "#5C9FB2", button: "#3F606B", buttonText: "#F5F7EE" },
};

const COVER_WIDTH = 96;

export function bookListEmailSubject(article: Article): string {
  return `Your book list: ${article.title}`;
}

export function bookListEmailHtml(article: Article, name: string, footerHtml: string): string {
  const c = COLOURS[article.category];
  const url = withUtm(`${SITE_URL}${articlePath(article)}`, "book_list", article.slug);
  const home = withUtm(SITE_URL, "book_list", article.slug);
  const readingRoom = withUtm(`${SITE_URL}/the-reading-room`, "book_list", article.slug);
  const hi = firstName(name);

  const books = article.books
    .map((b, i) => {
      const cover = b.coverImage
        ? `<img src="${esc(sized(b.coverImage.url, COVER_WIDTH * 2))}" alt="${esc(b.coverImage.alt || b.title)}" width="${COVER_WIDTH}" style="display:block;width:${COVER_WIDTH}px;height:auto;border-radius:3px 6px 6px 3px;border:0;" />`
        : `<div style="width:${COVER_WIDTH}px;height:${Math.round(COVER_WIDTH * 1.5)}px;background:${c.tagBorder};border-radius:3px 6px 6px 3px;"></div>`;
      const tags = (b.tags ?? [])
        .map((t) => `<span style="display:inline-block;margin:0 4px 6px 0;padding:3px 10px;border:1px solid ${c.tagBorder};border-radius:999px;font:12px/1.4 ${BODY};color:${INK_SOFT};">${esc(t.label)}</span>`)
        .join("");
      const blurb = splitParagraphs(b.blurb)
        .map((p) => `<p style="margin:0 0 12px;font:15px/1.6 ${BODY};color:${INK_SOFT};">${esc(p).replace(/\n/g, "<br/>")}</p>`)
        .join("");
      const rank = b.rank ? `<div style="font:700 26px/1 ${DISPLAY};color:${c.title};margin:0 0 10px;">${b.rank}</div>` : "";
      return `
        <tr><td style="padding:24px 0;${i > 0 ? `border-top:1px solid ${RULE};` : ""}">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td class="fnfe-cover" width="${COVER_WIDTH}" valign="top" style="padding:0 18px 0 0;">${rank}${cover}</td>
            <td class="fnfe-text" valign="top">
              <h2 style="margin:0 0 4px;font:700 20px/1.25 ${DISPLAY};color:${c.title};">${esc(b.title)}</h2>
              <p style="margin:0 0 10px;font:600 14px/1.4 ${BODY};color:${INK};">${esc(b.author)}</p>
              ${tags ? `<div style="margin:0 0 8px;">${tags}</div>` : ""}
              ${blurb}
            </td>
          </tr></table>
        </td></tr>`;
    })
    .join("");

  const hero = article.heroImage
    ? `<tr><td style="padding:0 0 24px;"><img src="${esc(sized(article.heroImage.url, 1120))}" alt="${esc(article.heroImage.alt || "")}" width="560" style="display:block;width:100%;max-width:560px;height:auto;border-radius:12px;border:0;" /></td></tr>`
    : "";

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@700&family=Nunito:wght@400;600&display=swap" rel="stylesheet"/>
<title>${esc(article.title)}</title>
<style>
  /* Phones: cover above the book's text, as on the site (clients without media-query support keep the side-by-side layout). */
  @media (max-width: 480px) {
    .fnfe-cover, .fnfe-text { display: block !important; width: 100% !important; }
    .fnfe-cover { padding: 0 0 14px !important; }
    .fnfe-card { padding: 4px 12px 24px !important; }
  }
</style></head>
<body style="margin:0;padding:0;background:${c.pageBg};">
<div style="display:none;max-height:0;overflow:hidden;">Here's the list you asked for. Enjoy!</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${c.pageBg};"><tr><td align="center" style="padding:28px 12px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
    <tr><td align="center" style="padding:0 0 20px;">
      <a href="${esc(home)}" style="text-decoration:none;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="padding:0 10px 0 0;"><img src="${esc(SITE_URL)}/images/logo-ghost.png" alt="" width="44" height="44" style="display:block;border:0;" /></td>
          <td style="font:700 17px/1.1 ${DISPLAY};color:${INK_SOFT};">Field Notes<br/>From Everywhere</td>
        </tr></table>
      </a>
    </td></tr>
    <tr><td class="fnfe-card" style="padding:8px 28px 32px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="padding:0 0 24px;">
          <p style="margin:0 0 14px;font:16px/1.6 ${BODY};color:${INK};">${hi ? `Hi ${esc(hi)},` : "Hi there,"}</p>
          <p style="margin:0 0 14px;font:16px/1.6 ${BODY};color:${INK};">Here&rsquo;s the list you asked for. Enjoy!</p>
          <p style="margin:0;font:15px/1.6 ${BODY};color:${INK_SOFT};"><strong>P.S.</strong> In case you didn&rsquo;t know, we have a fun little community called The Reading Room. We send members a themed book list of 30+ recommendations every Tuesday, Thursday and Saturday. Feel free to <a href="${esc(readingRoom)}" style="color:${c.title};">check it out here</a>.</p>
        </td></tr>
        ${hero}
        <tr><td style="padding:0 0 8px;">
          <span style="display:inline-block;padding:4px 12px;border-radius:999px;background:${c.title};font:600 12px/1.4 ${BODY};color:#F5F7EE;">${esc(CATEGORIES[article.category].name)}</span>
        </td></tr>
        <tr><td style="padding:6px 0 20px;">
          <a href="${esc(url)}" style="text-decoration:none;"><h1 style="margin:0;font:700 26px/1.2 ${DISPLAY};color:${c.title};">${esc(article.title)}</h1></a>
        </td></tr>
        ${article.methodologySentence ? `<tr><td style="padding:0 0 8px;">
          <div style="background:${c.methodBg};border-left:3px solid ${c.methodBorder};border-radius:8px;padding:14px 18px;">
            <div style="font:600 11px/1.4 ${MONO};letter-spacing:1.5px;text-transform:uppercase;color:${INK_MUTED};margin:0 0 6px;">How we made this list</div>
            <div style="font:14px/1.55 ${BODY};color:${INK_SOFT};">${esc(article.methodologySentence)}</div>
          </div>
        </td></tr>` : ""}
        ${books}
        <tr><td align="center" style="padding:12px 0 8px;border-top:1px solid ${RULE};">
          <a href="${esc(url)}" style="display:inline-block;margin-top:20px;padding:14px 28px;border-radius:999px;background:${c.button};font:700 15px/1 ${DISPLAY};color:${c.buttonText};text-decoration:none;">Read it on the site</a>
        </td></tr>
        <tr><td style="padding:24px 0 0;">
          <p style="margin:0 0 18px;font:16px/1.6 ${BODY};color:${INK};">Happy reading,<br/>The FNFE Team</p>
          <p style="margin:0;font:15px/1.6 ${BODY};color:${INK_SOFT};"><strong>P.P.S.</strong> You&rsquo;ll also be getting our free weekly newsletter, which is pretty much a roundup of the book lists we&rsquo;ve published on the site that week. We think you&rsquo;ll love it, but you can unsubscribe at any time using the unsubscribe link at the bottom of every email.</p>
        </td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:4px 16px 0;">${footerHtml}</td></tr>
  </table>
</td></tr></table>
</body></html>`;
}

/** Plain-text version, for email apps that don't show HTML (and better deliverability). */
export function bookListEmailText(article: Article, name: string, unsubscribeUrl: string): string {
  const hi = firstName(name);
  const books = article.books
    .map((b) => `${b.rank ? `${b.rank}. ` : "- "}${b.title} by ${b.author}\n${splitParagraphs(b.blurb).join("\n\n")}`)
    .join("\n\n");
  return `${hi ? `Hi ${hi},` : "Hi there,"}

Here's the list you asked for. Enjoy!

P.S. In case you didn't know, we have a fun little community called The Reading Room. We send members a themed book list of 30+ recommendations every Tuesday, Thursday and Saturday. Feel free to check it out here: ${withUtm(`${SITE_URL}/the-reading-room`, "book_list", article.slug)}

${article.title}
${article.methodologySentence}

${books}

Read it on the site: ${withUtm(`${SITE_URL}${articlePath(article)}`, "book_list", article.slug)}

Happy reading,
The FNFE Team

P.P.S. You'll also be getting our free weekly newsletter, which is pretty much a roundup of the book lists we've published on the site that week. We think you'll love it, but you can unsubscribe at any time using the unsubscribe link at the bottom of every email.

You're getting this because you joined the Field Notes From Everywhere email list. Unsubscribe: ${unsubscribeUrl}`;
}
