/**
 * Where a reader can get a book — the buttons on /where-to-read/<slug> (user's
 * choice of sites, 2026-10-02; DECISIONS.md). Searches for title + author,
 * since book records have no ISBN, except Goodreads: its search ranks study
 * guides and summaries above the real book when the author's name is in the
 * query, so it goes to the book's own page (`book.goodreadsUrl`, found on
 * import by author match, scripts/lib/goodreads.mjs) or, failing that, a
 * title-only search. "Your library" is OverDrive's search: its title pages
 * hand off to Libby for the reader's own library (Libby's own search links
 * need a library already chosen, so they fail). An affiliate tag, if one is
 * ever added, goes here once and applies to every issue already sent.
 */
export interface StoreBook {
  title: string;
  author: string;
  goodreadsUrl?: string;
}

export interface Store {
  name: string;
  /** What the reader gets there, one short line. */
  note: string;
  url: (book: StoreBook) => string;
}

const q = (b: StoreBook) => encodeURIComponent(`${b.title} ${b.author}`);

export const STORES: Store[] = [
  { name: "Amazon", note: "Print and Kindle editions", url: (b) => `https://www.amazon.com/s?k=${q(b)}&i=stripbooks` },
  { name: "Bookshop.org", note: "Buy from an independent bookstore", url: (b) => `https://bookshop.org/search?keywords=${q(b)}` },
  {
    name: "Goodreads",
    note: "Reviews, and add it to your shelf",
    url: (b) =>
      b.goodreadsUrl || `https://www.goodreads.com/search?q=${encodeURIComponent(b.title)}&search_type=books&search%5Bfield%5D=title`,
  },
  { name: "Your library", note: "Borrow it free with Libby", url: (b) => `https://www.overdrive.com/search?q=${q(b)}` },
];
