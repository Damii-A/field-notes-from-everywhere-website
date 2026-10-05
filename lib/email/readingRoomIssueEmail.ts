import { splitParagraphs } from "@/lib/content/paragraphs";
import { INK, INK_SOFT, esc, sized } from "./shared";

/**
 * A Reading Room issue's email body, saved to Kit as a draft broadcast
 * (lib/integrations/kit.ts). Kit's "Text only" template wraps it and adds the
 * unsubscribe footer, so this is a body fragment, not a whole document.
 * Order is the user's (DECISIONS.md, 2026-10-02): greeting, an "About this
 * issue" box, then every book (cover, ranking position, title, author, tags,
 * a shortened blurb, a "View full book page" link), then a closing
 * sentence and sign-off. Colours: ISSUE_PALETTES (brand tokens, no pure white or
 * black). Inline styles, for email clients.
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
  /** The book's /where-to-read page (full blurb, where to get it); no link when missing. */
  pageUrl?: string;
}

export interface IssueEmail {
  aboutThisIssue: string;
  books: IssueEmailBook[];
  closingSentence: string;
  signOff: string;
}

// Short font stacks: an email body in Kit can't load the site's web fonts, so
// readers get the fallbacks anyway, and each style here repeats per book.
const BODY = "Nunito,Arial,sans-serif";
const DISPLAY = "Comfortaa,Arial,sans-serif";
const MONO = "'Courier New',monospace";

/**
 * Colour palettes (brand tokens, styles/tokens/colors.css), no pure white or
 * black. Every text element sets its own colour: Kit's template colours
 * paragraphs itself, which overrode inherited colours and made the first
 * (dark-box) version's "About this issue" text unreadable (user, 2026-10-02).
 */
export interface IssuePalette {
  page: string; // email background
  box: string; // "About this issue" background
  boxHeading: string;
  title: string; // book titles, rank labels
  link: string;
  divider: string;
}

export const ISSUE_PALETTES = {
  // --paper-050 page, --clay-100 box, --clay-700 headings/titles, --slate-600 links, --clay-300 dividers
  clay: { page: "#F5F7EE", box: "#F2E3D5", boxHeading: "#8F5F3C", title: "#8F5F3C", link: "#3F606B", divider: "#D9C4B0" },
  // --sage-100 page, --paper-050 box, --sage-700 headings/titles, --clay-700 links, --sage-500 dividers
  sage: { page: "#E5EAD8", box: "#F5F7EE", boxHeading: "#657455", title: "#657455", link: "#8F5F3C", divider: "#B4C09E" },
  // --paper-050 page, --slate-100 box, --slate-600 headings/titles, --clay-700 links, --sky-200 dividers
  slate: { page: "#F5F7EE", box: "#D9E4E8", boxHeading: "#3F606B", title: "#3F606B", link: "#8F5F3C", divider: "#BBDCE5" },
} satisfies Record<string, IssuePalette>;

export type IssuePaletteName = keyof typeof ISSUE_PALETTES;
export const DEFAULT_ISSUE_PALETTE: IssuePaletteName = "sage"; // the user's pick, 2026-10-02

const TAG_BG = "#F6E7C8"; // --ochre-100
const TAG_BORDER = "#BC9143"; // --ochre-600
const COVER_STANDIN = "#D9E4E8"; // --slate-100
const COVER_WIDTH = 96;
// The text block's widest (560px, user, 2026-10-05; was 380, which wrapped the
// text early on computers); cover + gap + this = 674px. Narrower than that
// (phones, small tablets), the text block wraps below the cover and takes the full width: the
// stacked layout the user prefers on phones, without a media query (some email
// apps ignore those, which is how phones briefly got two columns).
const TEXT_MAX = 560;


// Every text style carries its own colour (see ISSUE_PALETTES).
const TEXT = `margin:0 0 14px;font-size:16px;line-height:1.6;color:${INK};`;
const COVER_BOX = `display:inline-block;vertical-align:top;width:${COVER_WIDTH}px;margin:0 18px 14px 0`;
const BOOK_TEXT = `display:inline-block;vertical-align:top;width:100%;max-width:${TEXT_MAX}px;font-size:15px;line-height:1.6`;
const BLURB = `margin:0 0 10px;color:${INK_SOFT};`;
// Tags are a main thing readers scan for (user, 2026-10-02), so they're filled
// pills, a step larger and bolder than body small print. Plain inline spans (no
// per-pill margin/display): the row's line-height spaces wrapped rows and a
// space separates pills, set once; &nbsp; inside a tag keeps it on one line.
const PILL_ROW = `margin:0 0 10px;font-size:13px;font-weight:600;line-height:2.4;color:${INK};`;
const PILL = `padding:3px 10px;background:${TAG_BG};border:1px solid ${TAG_BORDER};border-radius:99px;color:${INK}`;

// One link per book to its "Where to read" page (where to buy or borrow it,
// the lists it's in, similar books): four direct store links per book would
// add a lot of size to an already large email (DECISIONS.md, 2026-10-02). Wording: the user's
// "View full book page" (2026-10-02), clearer than earlier "Find this book" labels.
function pageLink(b: IssueEmailBook, c: IssuePalette): string {
  if (!b.pageUrl) return "";
  return `<p style="margin:0"><a href="${esc(b.pageUrl)}" style="color:${c.link};font-weight:700;font-size:14px">View full book page &rarr;</a></p>`;
}

/** The "About this issue" box: a light tint of the palette with a small mono heading. */
function panel(heading: string, text: string, c: IssuePalette): string {
  return `<tr><td style="padding:0 0 18px;"><div style="background:${c.box};border-radius:10px;padding:18px 20px 4px;">
    <p style="margin:0 0 8px;font:600 11px/1.4 ${MONO};letter-spacing:1.5px;text-transform:uppercase;color:${c.boxHeading};">${esc(heading)}</p>
    ${paragraphs(text, TEXT)}
  </div></td></tr>`;
}

function paragraphs(text: string, style: string): string {
  return splitParagraphs(text)
    .map((p) => `<p style="${style}">${esc(p).replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

export function readingRoomIssueHtml(issue: IssueEmail, palette: IssuePaletteName = DEFAULT_ISSUE_PALETTE): string {
  const c = ISSUE_PALETTES[palette];
  const rank = `margin:0 0 4px;font:11px ${MONO};letter-spacing:1px;color:${c.title}`; // capitals written into the text: it repeats 30+ times
  // Full blurbs push a 30-book issue past Gmail's ~102 KB clip limit, accepted
  // by the user (2026-10-05), so every book says "Book N of 30" and a note
  // before the first book says where to tap: wherever Gmail cuts the email,
  // readers can tell there's more and how to see it.
  const n = issue.books.length;
  const books = issue.books
    .map((b, i) => {
      const cover = b.coverUrl
        ? `<img src="${esc(sized(b.coverUrl, COVER_WIDTH * 2))}" alt="${esc(b.title)}" width="${COVER_WIDTH}" style="display:block;border-radius:3px 6px 6px 3px">`
        : `<div style="width:${COVER_WIDTH}px;height:${Math.round(COVER_WIDTH * 1.5)}px;background:${COVER_STANDIN};border-radius:3px 6px 6px 3px;"></div>`;
      const tags = b.tags.map((t) => `<span style="${PILL}">${esc(t).replace(/ /g, "&nbsp;")}</span>`).join("&#32;"); // &#32;: a real space the whitespace-stripping below keeps
      return `
        <tr><td style="padding:22px 0 8px;${i > 0 ? `border-top:1px solid ${c.divider}` : ""}">
          <div style="${COVER_BOX}">${cover}</div><div style="${BOOK_TEXT}">
            <p style="${rank}">BOOK ${i + 1} OF ${n}${b.rank ? ` &middot; #${b.rank} MOST RECOMMENDED` : ""}</p>
            <h2 style="margin:0 0 2px;font:700 20px/1.25 ${DISPLAY};color:${c.title}">${esc(b.title)}</h2>
            <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:${INK}">${esc(b.author)}</p>
            ${tags ? `<div style="${PILL_ROW}">${tags}</div>` : ""}
            ${paragraphs(b.blurb ?? "", BLURB)}
            ${pageLink(b, c)}
          </div>
        </td></tr>`;
    })
    .join("");

  // "Happy reading,\nThe FNFE Team": each line of the sign-off on its own line.
  const signOffLines = issue.signOff.trim().split(/\r?\n/).map(esc).join("<br/>");

  // {{ subscriber.first_name }} is Kit's Liquid personalisation; `default`
  // also covers subscribers with an empty name.
  const html = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${c.page};border-radius:12px;">
  <tr><td style="padding:24px 20px 8px;font-family:${BODY};color:${INK};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="padding:0 0 4px;">
        <p style="${TEXT}">Hi {{ subscriber.first_name | default: "there" }},</p>
      </td></tr>
      ${panel("About this issue", issue.aboutThisIssue, c)}
      <tr><td style="padding:0 0 4px;"><p style="margin:0;font-size:14px;line-height:1.55;color:${INK_SOFT}">${n} books in this issue. Reading in Gmail? If the email stops early, tap &ldquo;View entire message&rdquo; at the very bottom to see the rest.</p></td></tr>
      ${books}
      <tr><td style="padding:22px 0 14px;border-top:1px solid ${c.divider};">
        ${paragraphs(issue.closingSentence, TEXT)}
        <p style="${TEXT}">${signOffLines}</p>
      </td></tr>
    </table>
  </td></tr>
</table>`;
  return html.replace(/>\s+</g, "><").replace(/\n\s*/g, " ");
}
