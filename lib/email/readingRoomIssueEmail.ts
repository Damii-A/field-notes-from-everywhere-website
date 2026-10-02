import { splitParagraphs } from "@/lib/content/paragraphs";
import { INK, INK_SOFT, RULE, esc, sized } from "./shared";

/**
 * A Reading Room issue's email body, saved to Kit as a draft broadcast
 * (lib/integrations/kit.ts). Kit's "Text only" template wraps it and adds the
 * unsubscribe footer, so this is a body fragment, not a whole document.
 * Order is the user's (DECISIONS.md, 2026-10-02): greeting, intro sentence,
 * the theme and what to expect (each a boxed section with a heading),
 * transition sentence, then every book (cover, ranking position,
 * title, author, tags, blurb, a "Find this book" link — the same book row as the book-list email),
 * on the Reading Room's colours. Tables + inline styles, for email clients.
 *
 * Size matters: Gmail clips emails over ~102 KB and an issue has 30+ books.
 * So the font and ink colour are set once on the wrapper (inherited), the
 * repeated styles are kept short, and layout whitespace is stripped.
 */

export interface IssueEmailBook {
  title: string;
  author: string;
  blurb?: string;
  coverUrl?: string;
  tags: string[];
  /** Position in the issue's ranking (1 = most recommended); omitted when the book isn't in it. */
  rank?: number;
  /** The book's /find-it page (where to get it). */
  findUrl: string;
}

export interface IssueEmail {
  introSentence: string;
  themeHeading: string;
  themeExplanation: string;
  expectHeading: string;
  whatToExpect: string;
  transitionSentence: string;
  books: IssueEmailBook[];
}

// Short font stacks: an email body in Kit can't load the site's web fonts, so
// readers get the fallbacks anyway, and each style here repeats per book.
const BODY = "Nunito,Arial,sans-serif";
const DISPLAY = "Comfortaa,Arial,sans-serif";
const MONO = "'Courier New',monospace";

const PAGE_BG = "#F5F7EE"; // --paper-050, the Reading Room page
const TITLE = "#3F606B"; // --slate-600
const SECTION_BG = "#FFFFFF"; // --paper-000
const TAG_BG = "#F6E7C8"; // --ochre-100, the Reading Room highlight
const TAG_BORDER = "#BC9143"; // --ochre-600
const COVER_STANDIN = "#D9E4E8"; // --slate-100
const COVER_WIDTH = 96;

const TEXT = "margin:0 0 14px;font-size:16px;line-height:1.6;";
// Set on the book's text cell (inherited) so each blurb paragraph only carries its margin.
const BOOK_TEXT = `font-size:15px;line-height:1.6;color:${INK_SOFT};`;
const BLURB = "margin:0 0 10px;";
// Tags are a main thing readers scan for (user, 2026-10-02), so they're filled
// pills, a step larger and bolder than body small print. Plain inline spans (no
// per-pill margin/display): the row's line-height spaces wrapped rows and a
// space separates pills, set once; &nbsp; inside a tag keeps it on one line.
const PILL_ROW = `margin:0 0 10px;font-size:13px;font-weight:600;line-height:2.4;color:${INK};`;
const PILL = `padding:3px 10px;background:${TAG_BG};border:1px solid ${TAG_BORDER};border-radius:99px`;

const LABEL = `font:600 11px/1.4 ${MONO};letter-spacing:1.5px;text-transform:uppercase;color:${TITLE};`;
// The per-book rank label: same look as LABEL, with the capitals written into
// the text rather than styled, since it repeats 30+ times.
const RANK = `margin:0 0 4px;font:11px ${MONO};letter-spacing:1px;color:${TITLE}`;

// One link per book to its /find-it page, which offers the stores: four
// direct store links per book pushed a 30-book issue past Gmail's clip limit
// (DECISIONS.md, 2026-10-02).
function findItLink(b: IssueEmailBook): string {
  return `<p style="margin:0"><a href="${esc(b.findUrl)}" style="color:${TITLE};font-weight:700;font-size:14px">Find this book &rarr;</a></p>`;
}

/** A boxed section with a small heading: the article's "How we made this list" box, in Reading Room colours. */
function section(heading: string, text: string): string {
  return `<tr><td style="padding:0 0 16px;"><div style="background:${SECTION_BG};border-left:3px solid ${TITLE};border-radius:8px;padding:16px 20px 4px;">
    <div style="margin:0 0 8px;${LABEL}">${esc(heading)}</div>
    ${paragraphs(text, TEXT)}
  </div></td></tr>`;
}

function paragraphs(text: string, style: string): string {
  return splitParagraphs(text)
    .map((p) => `<p style="${style}">${esc(p).replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

export function readingRoomIssueHtml(issue: IssueEmail): string {
  const books = issue.books
    .map((b, i) => {
      const cover = b.coverUrl
        ? `<img src="${esc(sized(b.coverUrl, COVER_WIDTH * 2))}" alt="${esc(b.title)}" width="${COVER_WIDTH}" style="display:block;border-radius:3px 6px 6px 3px">`
        : `<div style="width:${COVER_WIDTH}px;height:${Math.round(COVER_WIDTH * 1.5)}px;background:${COVER_STANDIN};border-radius:3px 6px 6px 3px;"></div>`;
      const tags = b.tags.map((t) => `<span style="${PILL}">${esc(t).replace(/ /g, "&nbsp;")}</span>`).join("&#32;"); // &#32;: a real space the whitespace-stripping below keeps
      return `
        <tr><td style="padding:22px 0;${i > 0 ? `border-top:1px solid ${RULE}` : ""}">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td class="fc" width="${COVER_WIDTH}" valign="top" style="padding-right:18px">${cover}</td>
            <td class="ft" valign="top" style="${BOOK_TEXT}">
              ${b.rank ? `<p style="${RANK}">#${b.rank} MOST RECOMMENDED</p>` : ""}
              <h2 style="margin:0 0 2px;font:700 20px/1.25 ${DISPLAY};color:${TITLE}">${esc(b.title)}</h2>
              <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:${INK}">${esc(b.author)}</p>
              ${tags ? `<div style="${PILL_ROW}">${tags}</div>` : ""}
              ${paragraphs(b.blurb ?? "", BLURB)}
              ${findItLink(b)}
            </td>
          </tr></table>
        </td></tr>`;
    })
    .join("");

  // {{ subscriber.first_name }} is Kit's Liquid personalisation; `default`
  // also covers subscribers with an empty name.
  const html = `<style>
  /* Phones: cover above the book's text (clients without media-query support keep side-by-side). */
  @media (max-width: 480px) {
    .fc, .ft { display: block !important; width: 100% !important; }
    .fc { padding: 0 0 14px !important; }
    .fnfe-issue { padding: 20px 16px !important; }
  }
</style>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAGE_BG};border-radius:12px;">
  <tr><td class="fnfe-issue" style="padding:28px 28px 8px;font-family:${BODY};color:${INK};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="padding:0 0 10px;">
        <p style="${TEXT}">Hi {{ subscriber.first_name | default: "there" }},</p>
        ${paragraphs(issue.introSentence, TEXT)}
      </td></tr>
      ${section(issue.themeHeading, issue.themeExplanation)}
      ${section(issue.expectHeading, issue.whatToExpect)}
      <tr><td style="padding:6px 0 10px;">${paragraphs(issue.transitionSentence, TEXT)}</td></tr>
      ${books}
    </table>
  </td></tr>
</table>`;
  return html.replace(/>\s+</g, "><").replace(/\n\s*/g, " ");
}
