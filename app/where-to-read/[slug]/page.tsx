import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BookCover } from "@/components/ds/BookCover";
import { getWhereToReadBook } from "@/lib/content";
import { CATEGORIES } from "@/lib/content/categories";
import { splitParagraphs } from "@/lib/content/paragraphs";
import { STORES } from "@/lib/books/stores";
import { pageMetadata } from "@/lib/metadata";
import { SITE_URL } from "@/lib/siteUrl";
import styles from "./WhereToRead.module.css";

/**
 * "Where to read {Title}" (DECISIONS.md, 2026-10-02): one page per book, built
 * to answer "where to read X" searches, and where Reading Room issues and
 * articles link each book. Leads with a direct answer and the places to get
 * it, then what only FNFE has: the full blurb, which of our reader-
 * recommendation lists feature it (and its rank), and what readers recommend
 * alongside it. Indexed only when the book is in a published list; otherwise
 * the page works but stays out of search (a store-links-only page is thin).
 * Not in the design: a new page type the user asked for.
 */
export const revalidate = 300;

export async function generateStaticParams() {
  return []; // built on first visit, then cached
}

type Props = { params: Promise<{ slug: string }> };

const TITLE_MAX = 60;

function pageTitle(title: string, author: string): string {
  const full = `Where to Read ${title} by ${author}`;
  return full.length <= TITLE_MAX ? full : `Where to Read ${title}`;
}

/** The direct answer. Deliberately general: we don't know each book's formats, prices or library availability. */
function answer(title: string, author: string): string {
  return `You can buy ${title} by ${author} in print or as an ebook from Amazon (including Kindle) or Bookshop.org, or borrow it free from your local library through the Libby app, if your library carries it. Links to each are below.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const book = await getWhereToReadBook(decodeURIComponent((await params).slug));
  if (!book) return { title: "Where to read" };
  const featured = book.lists.length > 0;
  const description = `Where to buy, borrow or read ${book.title} by ${book.author}: print, ebook and Kindle, or free from your library with Libby.${featured ? " Plus the reader-recommended lists it's in." : ""}`;
  return {
    ...pageMetadata({
      title: pageTitle(book.title, book.author),
      description,
      path: `/where-to-read/${book.slug}`,
      image: book.coverUrl ? { url: book.coverUrl, alt: `Cover of ${book.title} by ${book.author}` } : undefined,
    }),
    ...(featured ? {} : { robots: { index: false, follow: true } }),
  };
}

export default async function WhereToReadPage({ params }: Props) {
  const book = await getWhereToReadBook(decodeURIComponent((await params).slug));
  if (!book) notFound();

  const url = `${SITE_URL}/where-to-read/${book.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Book",
      name: book.title,
      author: { "@type": "Person", name: book.author },
      url,
      ...(book.coverUrl ? { image: book.coverUrl } : {}),
      ...(book.blurb ? { description: book.blurb.replace(/\s+/g, " ").trim() } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: `Where to read ${book.title}`, item: url },
      ],
    },
  ];

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        // "<" escaped so text can never close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <main className={styles.main}>
        <article className={styles.inner}>
          <header className={styles.top}>
            <BookCover title={book.title} author={book.author} src={book.coverUrl} alt={`Cover of ${book.title} by ${book.author}`} width={140} />
            <div className={styles.heading}>
              <h1 className={styles.title}>Where to read {book.title}</h1>
              <p className={styles.author}>by {book.author}</p>
            </div>
            <p className={styles.answer}>{answer(book.title, book.author)}</p>
          </header>

          <section aria-labelledby="where" className={styles.section}>
            <h2 id="where" className={styles.label}>Where to buy or borrow it</h2>
            <ul className={styles.stores}>
              {STORES.map((s) => (
                <li key={s.name}>
                  <a className={styles.store} href={s.url(book.title, book.author)} rel="nofollow noopener">
                    <span className={styles.storeName}>{s.name}</span>
                    <span className={styles.storeNote}>{s.note}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          {(book.blurb || book.tags.length > 0) && (
            <section aria-labelledby="about" className={styles.section}>
              <h2 id="about" className={styles.label}>About the book</h2>
              {book.tags.length > 0 && (
                <ul className={styles.tags} aria-label="Tags">
                  {book.tags.map((t) => (
                    <li key={t} className={styles.tag}>
                      {t}
                    </li>
                  ))}
                </ul>
              )}
              {book.blurb && (
                <div className={styles.blurb}>
                  {splitParagraphs(book.blurb).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              )}
            </section>
          )}

          {book.lists.length > 0 && (
            <section aria-labelledby="lists" className={styles.section}>
              <h2 id="lists" className={styles.label}>Why readers recommend it</h2>
              <p className={styles.text}>
                {book.title} made {book.lists.length === 1 ? "one of our book lists" : `${book.lists.length} of our book lists`}, built
                from what real readers recommend in book discussions.
              </p>
              <ul className={styles.lists}>
                {book.lists.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className={styles.list}>
                      <span className={styles.listMeta}>
                        {l.rank ? `#${l.rank} of ${l.bookCount} · ` : ""}
                        {CATEGORIES[l.category].name}
                      </span>
                      <span className={styles.listTitle}>{l.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {book.related.length > 0 && (
            <section aria-labelledby="related" className={styles.section}>
              <h2 id="related" className={styles.label}>Readers who recommend it also recommend</h2>
              <ul className={styles.related}>
                {book.related.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/where-to-read/${r.slug}`} className={styles.relatedBook}>
                      <BookCover title={r.title} author={r.author} src={r.coverUrl} alt={`Cover of ${r.title}`} width={88} />
                      <span className={styles.relatedTitle}>{r.title}</span>
                      <span className={styles.relatedAuthor}>{r.author}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      </main>
      <Footer />
    </>
  );
}
