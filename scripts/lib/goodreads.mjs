/**
 * Finds a book's own Goodreads page: a title-only Goodreads search (a search
 * that includes the author's name ranks study guides and summaries first),
 * taking the first result whose author matches. Returns the clean
 * https://www.goodreads.com/book/show/<id> URL, or null when nothing matches
 * (the "Where to read" page then falls back to a title search).
 * DECISIONS.md, 2026-10-02. Used by import-books.mjs and backfill-goodreads.mjs.
 */
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

export class GoodreadsBlockedError extends Error {
  constructor() {
    super("Goodreads is temporarily blocking requests from this computer (bot check). Try again later.");
    this.name = "GoodreadsBlockedError";
  }
}

/** "B.A. Paris" / "B. A.  Paris" → "baparis". */
const norm = (s) => s.toLowerCase().normalize("NFKD").replace(/[^a-z]/g, "");

function authorMatches(theirs, ours) {
  if (norm(theirs) === norm(ours)) return true;
  // Same surname and first initial covers "Tracy  Sierra" vs "Tracy Sierra", middle names, initials.
  const t = theirs.trim().split(/\s+/), o = ours.trim().split(/\s+/);
  return norm(t.at(-1)) === norm(o.at(-1)) && norm(t[0])[0] === norm(o[0])[0];
}

export async function findGoodreadsUrl(title, author) {
  const url = `https://www.goodreads.com/search?q=${encodeURIComponent(title)}&search_type=books&search%5Bfield%5D=title`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  const html = await res.text();
  // Goodreads' bot protection answers 202 with an empty page when it's had too
  // many requests from this address; that's "try later", not "no match".
  if (res.status === 202 || !html) throw new GoodreadsBlockedError();
  if (!res.ok) throw new Error(`Goodreads search ${res.status}`);
  for (const row of html.split('<tr itemscope').slice(1)) {
    const href = row.match(/class="bookTitle"[^>]*href="(\/book\/show\/\d+)/)?.[1];
    const authors = [...row.matchAll(/itemprop="name">([^<]*)</g)].map((m) => m[1]);
    if (href && authors.some((a) => authorMatches(a, author))) return `https://www.goodreads.com${href}`;
  }
  return null;
}
