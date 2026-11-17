/**
 * A book's page address (user, 2026-11-17): /<title>-by-<author>, e.g.
 * /the-silent-patient-by-alex-michaelides. Worked out from the title and author every
 * time (never stored), so it can't drift from them; next.config.mjs rewrites any
 * "/…-by-…" address to app/book/[slug]. The old /where-to-read/<slug> pages forward here.
 */
function slugPart(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // accents
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’‘`]/g, "") // "Ender's" → "enders"
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const bookPageSlug = (title: string, author: string) => `${slugPart(title)}-by-${slugPart(author)}`;

export const bookPagePath = (title: string, author: string) => `/${bookPageSlug(title, author)}`;

/** The "Where to read" section's id, so "Where to read X" links jump straight to it. */
export const WHERE_TO_READ_ID = "where-to-read";

export const whereToReadHref = (title: string, author: string) => `${bookPagePath(title, author)}#${WHERE_TO_READ_ID}`;
