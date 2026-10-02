/**
 * Where a reader can get a book — the buttons on /where-to-read/<slug> (user's
 * choice of sites, 2026-10-02; DECISIONS.md). Plain searches for title +
 * author, since book records have no ISBN. "Library" is OverDrive's search:
 * its title pages hand off to Libby for the reader's own library (Libby's own
 * search links need a library already chosen, so they fail). An affiliate tag,
 * if one is ever added, goes here once and applies to every issue already sent.
 */
export interface Store {
  name: string;
  /** What the reader gets there, one short line. */
  note: string;
  url: (title: string, author: string) => string;
}

const q = (title: string, author: string) => encodeURIComponent(`${title} ${author}`);

export const STORES: Store[] = [
  { name: "Amazon", note: "Print and Kindle editions", url: (t, a) => `https://www.amazon.com/s?k=${q(t, a)}&i=stripbooks` },
  { name: "Bookshop.org", note: "Buy from an independent bookstore", url: (t, a) => `https://bookshop.org/search?keywords=${q(t, a)}` },
  { name: "Goodreads", note: "Reviews, and add it to your shelf", url: (t, a) => `https://www.goodreads.com/search?q=${q(t, a)}` },
  { name: "Your library", note: "Borrow it free with Libby", url: (t, a) => `https://www.overdrive.com/search?q=${q(t, a)}` },
];
