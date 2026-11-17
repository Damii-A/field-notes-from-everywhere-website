import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BookCover } from "@/components/ds/BookCover";
import { JsonLd } from "@/components/JsonLd";
import { getBookSlugForPage, getWhereToReadBook } from "@/lib/content";
import type { WhereToReadBook } from "@/lib/content/types";
import { CATEGORIES } from "@/lib/content/categories";
import { splitParagraphs } from "@/lib/content/paragraphs";
import { STORES } from "@/lib/books/stores";
import { bookFactLabels } from "@/lib/books/facts";
import { WHERE_TO_READ_ID } from "@/lib/books/path";
import { pageMetadata } from "@/lib/metadata";
import { SITE_URL } from "@/lib/siteUrl";
import styles from "./BookPage.module.css";
import { BookPageTags } from "./BookPageTags";

/**
 * A book's page (DECISIONS.md, 2026-10-02; rebuilt 2026-11-17 as an SEO page, the user's
 * structure): /<title>-by-<author> (next.config.mjs rewrites it here; the old
 * /where-to-read/<slug> forwards to its #where-to-read section). Banner (title + author,
 * page count and reading time, story elements) → what it's about → where to read →
 * questions (FAQ) → should you read it → books like it → the FNFE lists it's in.
 * Indexed only when the book is in a published list; otherwise the page works but stays
 * out of search (a store-links-only page is thin).
 */
export const revalidate = 300;

export async function generateStaticParams() {
  return []; // built on first visit, then cached
}

type Props = { params: Promise<{ slug: string }> };

const TITLE_MAX = 60;

async function loadBook(pageSlug: string): Promise<WhereToReadBook | null> {
  const slug = await getBookSlugForPage(decodeURIComponent(pageSlug));
  return slug ? getWhereToReadBook(slug) : null;
}

function pageTitle(title: string, author: string): string {
  for (const t of [`${title} by ${author}: Pages, Series & Where to Read`, `${title} by ${author}`]) if (t.length <= TITLE_MAX) return t;
  return title;
}

/** The direct answer. Deliberately general: we don't know each book's formats, prices or library availability. */
function answer(quoted: string, author: string): string {
  return `You can buy ${quoted} by ${author} in print or as an ebook from Amazon (including Kindle) or Bookshop.org, or borrow it free from your local library through the Libby app, if your library carries it.`;
}

const article = (word: string) => (/^[aeiou]/i.test(word) ? "an" : "a");
const joinAnd = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

/** "in the Scholomance series" / "in the Broken Empire Trilogy". */
function seriesPhrase(name: string): string {
  const bare = name.replace(/^the\s+/i, "");
  return /\b(series|trilogy|duology|quartet|saga|cycle|chronicles)\b/i.test(bare) ? `the ${bare}` : `the ${bare} series`;
}

interface Question {
  q: string;
  /** Plain text, for the FAQ structured data. */
  text: string;
  /** What shows on the page (may include links). */
  body: ReactNode;
}

/** The "About {Book}" questions (user's list, plus reading time, year and genre), only those we can answer truthfully. */
function questions(book: WhereToReadBook, quoted: string): Question[] {
  const out: Question[] = [];
  // Questions name the author too: they get quoted on their own (search answers, AI tools), and several books share a title
  // (user, 2026-11-17). "Who wrote" is the exception, for obvious reasons.
  const named = `${quoted} by ${book.author}`;
  if (book.pageCount) {
    const text = `${quoted} has about ${book.pageCount.toLocaleString("en-US")} pages. Page counts vary a little between editions.`;
    out.push({ q: `How many pages is ${named}?`, text, body: text });
  }
  if (book.readingHours) {
    const h = `${book.readingHours} hour${book.readingHours === 1 ? "" : "s"}`;
    const text = `About ${h} at an average reading pace of around 60 pages an hour.`;
    out.push({ q: `How long does it take to read ${named}?`, text, body: text });
  }
  {
    const base = `${quoted} was written by ${book.author}.`;
    const more = book.sameAuthor;
    const text = more.length ? `${base} We also recommend ${joinAnd(more.map((b) => `“${b.title}”`))} by ${book.author}.` : base;
    out.push({
      q: `Who wrote ${quoted}?`,
      text,
      body: more.length ? (
        <>
          {base} We also recommend{" "}
          {more.map((b, i) => (
            <span key={b.path}>
              {i > 0 ? (i === more.length - 1 ? " and " : ", ") : ""}
              <Link href={b.path} target="_blank" rel="noopener">“{b.title}”</Link>
            </span>
          ))}{" "}
          by {book.author}.
        </>
      ) : (
        base
      ),
    });
  }
  if (book.publishedYear) {
    const text = `${quoted} was published in ${book.publishedYear}.`;
    out.push({ q: `When was ${named} published?`, text, body: text });
  }
  if (book.genres.length) {
    const names = book.genres.map((g) => g.name.toLowerCase());
    const base = `${quoted} is ${article(names[0]!)} ${joinAnd(names)} book.`;
    const linked = book.genres.filter((g) => g.href);
    out.push({
      q: `What genre is ${named}?`,
      text: base,
      body: (
        <>
          {base}
          {linked.length ? (
            <>
              {" "}
              See all our{" "}
              {linked.map((g, i) => (
                <span key={g.name}>
                  {i > 0 ? " and " : ""}
                  <Link href={g.href!} target="_blank" rel="noopener">{g.name} book lists</Link>
                </span>
              ))}
              .
            </>
          ) : null}
        </>
      ),
    });
  }
  const s = book.series;
  if (s) {
    let text: string | null = null;
    if (s.status === "standalone") text = `No, ${quoted} is a standalone book.`;
    else if (s.name && s.number) {
      text =
        s.status === "finished"
          ? `Yes, ${quoted} is book ${s.number}${s.total ? ` of ${s.total}` : ""} in ${seriesPhrase(s.name)}, which is complete.`
          : `Yes, ${quoted} is book ${s.number} in ${seriesPhrase(s.name)}, which is still ongoing${s.total ? ` (${s.total} books so far)` : ""}.`;
    } else if (s.name) text = `Yes, ${quoted} is part of ${seriesPhrase(s.name)}.`;
    if (text) out.push({ q: `Is ${named} part of a series?`, text, body: text });
  }
  return out;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const book = await loadBook((await params).slug);
  if (!book) return { title: "Book not found" };
  const featured = book.lists.length > 0;
  const series = book.series && book.series.status !== "standalone" ? ", whether it's part of a series" : "";
  const description = `What “${book.title}” by ${book.author} is about, how many pages it is${series}, and where to buy or borrow it: print, ebook and Kindle, or free from your library with Libby.`;
  return {
    ...pageMetadata({
      title: pageTitle(book.title, book.author),
      description,
      path: book.path,
      image: book.coverUrl ? { url: book.coverUrl, alt: `Cover of ${book.title} by ${book.author}` } : undefined,
    }),
    ...(featured ? {} : { robots: { index: false, follow: true } }),
  };
}

export default async function BookPage({ params }: Props) {
  const book = await loadBook((await params).slug);
  if (!book) notFound();

  const url = `${SITE_URL}${book.path}`;
  // The book's name in quotation marks wherever it appears on the page (user, 2026-10-02).
  const quoted = `“${book.title}”`;
  const facts = bookFactLabels(book);
  const faq = questions(book, quoted);
  const hasFit = !!(book.forYou || book.notForYou);

  const sections = [
    book.blurb && { id: "description", label: "What it's about" },
    { id: WHERE_TO_READ_ID, label: "Where to read" },
    faq.length > 0 && { id: "faq", label: "Questions" },
    hasFit && { id: "should-you-read", label: "Should you read it?" },
    book.related.length > 0 && { id: "books-like", label: "Books like it" },
    book.lists.length > 0 && { id: "reading-lists", label: "In our lists" },
  ].filter((x): x is { id: string; label: string } => !!x);

  const s = book.series;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Book",
      name: book.title,
      author: { "@type": "Person", name: book.author },
      url,
      ...(book.coverUrl ? { image: book.coverUrl } : {}),
      ...(book.blurb ? { description: book.blurb.replace(/\s+/g, " ").trim() } : {}),
      ...(book.pageCount ? { numberOfPages: book.pageCount } : {}),
      ...(book.publishedYear ? { datePublished: String(book.publishedYear) } : {}),
      ...(book.genres.length ? { genre: book.genres.map((g) => g.name) } : {}),
      ...(s && s.status !== "standalone" && s.name
        ? { isPartOf: { "@type": "BookSeries", name: s.name }, ...(s.number ? { position: s.number } : {}) }
        : {}),
    },
    ...(faq.length
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.text } })),
          },
        ]
      : []),
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: `${book.title} by ${book.author}`, item: url },
      ],
    },
  ];

  return (
    <>
      <Header />
      <JsonLd data={jsonLd} />
      <main>
        <article>
          {/* The Reading Room's slate hero band (app/the-reading-room), user, 2026-10-02. */}
          <header className={styles.hero}>
            <div className={styles.heroInner}>
              <BookCover title={book.title} author={book.author} src={book.coverUrl} alt={`Cover of ${book.title} by ${book.author}`} width={140} />
              <h1 className={styles.title}>
                {quoted}
                <span className={styles.author}> by {book.author}</span>
              </h1>
              {facts.length > 0 && (
                <div className={styles.facts}>
                  {facts.map((f) => (
                    <span key={f} className={styles.fact}>
                      {f}
                    </span>
                  ))}
                </div>
              )}
              {book.tags.length > 0 && <BookPageTags tags={book.tags} shown={book.tagsShown} />}
            </div>
          </header>

          {/* Jump links to each section (user, 2026-11-17). */}
          <nav aria-label="On this page" className={styles.jump}>
            {sections.map((x) => (
              <a key={x.id} href={`#${x.id}`} className={styles.jumpLink}>
                {x.label}
              </a>
            ))}
          </nav>

          <div className={styles.inner}>
            {book.blurb && (
              <section aria-labelledby="description" className={`${styles.section} ${styles.boxed} ${styles.aboutBoxed}`}>
                <h2 id="description" className={styles.heading}>What is {quoted} about?</h2>
                <div className={styles.blurb}>
                  {splitParagraphs(book.blurb).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </section>
            )}

            <section aria-labelledby={WHERE_TO_READ_ID} className={styles.section}>
              <h2 id={WHERE_TO_READ_ID} className={styles.heading}>Where to read {quoted} by {book.author}</h2>
              <p className={styles.text}>{answer(quoted, book.author)}</p>
              <ul className={styles.stores}>
                {STORES.map((st) => (
                  <li key={st.name}>
                    <a className={styles.card} href={st.url(book)} target="_blank" rel="nofollow noopener">
                      <span className={styles.cardTitle}>{st.name}</span>
                      <span className={styles.cardNote}>{st.note}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            {faq.length > 0 && (
              <section aria-labelledby="faq" className={`${styles.section} ${styles.boxed}`}>
                <h2 id="faq" className={styles.heading}>About {quoted}</h2>
                <div className={styles.faq}>
                  {faq.map((f) => (
                    <div key={f.q} className={styles.faqItem}>
                      <h3 className={styles.question}>{f.q}</h3>
                      <p className={styles.faqAnswer}>{f.body}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {hasFit && (
              <section aria-labelledby="should-you-read" className={styles.section}>
                <h2 id="should-you-read" className={styles.heading}>Should you read {quoted}?</h2>
                {/* "This book might (not) be for you", as in articles (user, 2026-11-14). */}
                {book.forYou && (
                  <div className={styles.fitBox}>
                    <h3 className={styles.fitLabel}>This book might be for you</h3>
                    <p className={styles.fitText}>{book.forYou}</p>
                  </div>
                )}
                {book.notForYou && (
                  <div className={styles.fitBox}>
                    <h3 className={styles.fitLabel}>This book might not be for you</h3>
                    <p className={styles.fitText}>{book.notForYou}</p>
                  </div>
                )}
              </section>
            )}

            {book.related.length > 0 && (
              <section aria-labelledby="books-like" className={`${styles.section} ${styles.boxed}`}>
                <h2 id="books-like" className={styles.heading}>Books like {quoted}</h2>
                <ul className={styles.related}>
                  {book.related.map((r) => (
                    <li key={r.slug}>
                      <Link href={r.path} className={styles.relatedBook} target="_blank" rel="noopener">
                        <BookCover title={r.title} author={r.author} src={r.coverUrl} alt={`Cover of ${r.title}`} width={96} />
                        <span className={styles.relatedTitle}>{r.title}</span>
                        <span className={styles.relatedAuthor}>{r.author}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {book.lists.length > 0 && (
              <section aria-labelledby="reading-lists" className={`${styles.section} ${styles.boxed}`}>
                <h2 id="reading-lists" className={styles.heading}>
                  {quoted} has appeared in {book.lists.length === 1 ? "this reading list" : "these reading lists"} on FNFE
                </h2>
                <p className={styles.text}>
                  {quoted} made {book.lists.length === 1 ? "one of our reading lists" : `${book.lists.length} of our reading lists`}, built
                  from what real readers recommend in book discussions.
                </p>
                <ul className={styles.lists}>
                  {book.lists.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className={styles.card} target="_blank" rel="noopener">
                        <span className={styles.kicker}>
                          {l.rank ? `#${l.rank} of ${l.bookCount} · ` : ""}
                          {CATEGORIES[l.category].name}
                        </span>
                        <span className={styles.cardTitle}>{l.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
