import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BookCover } from "@/components/ds/BookCover";
import { getBookById } from "@/lib/content";
import { STORES } from "@/lib/books/stores";
import styles from "./FindIt.module.css";

/**
 * "Find this book": where each book's link in a Reading Room issue lands,
 * offering the user's chosen places to get it (lib/books/stores.ts). One link
 * per book keeps issues under Gmail's ~102 KB clip limit, which four direct
 * store links per book didn't (DECISIONS.md, 2026-10-02). Not in the design;
 * a utility page like /unsubscribe, so noindex and not in the sitemap.
 */
export const revalidate = 300;

export async function generateStaticParams() {
  return []; // built on first visit, then cached
}

type Props = { params: Promise<{ bookId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const book = await getBookById(decodeURIComponent((await params).bookId));
  return {
    title: book ? `Find ${book.title}` : "Find this book",
    robots: { index: false, follow: false },
  };
}

export default async function FindItPage({ params }: Props) {
  const book = await getBookById(decodeURIComponent((await params).bookId));
  if (!book) notFound();

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.inner}>
          <BookCover
            title={book.title}
            author={book.author}
            src={book.coverUrl}
            alt={`Cover of ${book.title} by ${book.author}`}
            width={140}
          />
          <div className={styles.heading}>
            <h1 className={styles.title}>{book.title}</h1>
            <p className={styles.author}>{book.author}</p>
          </div>
          <ul className={styles.stores}>
            {STORES.map((s) => (
              <li key={s.name}>
                <a className={styles.store} href={s.url(book.title, book.author)} rel="noopener">
                  <span className={styles.storeName}>{s.name}</span>
                  <span className={styles.storeNote}>{s.note}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
