import { notFound, permanentRedirect } from "next/navigation";
import { getBookById } from "@/lib/content";
import { WHERE_TO_READ_ID, bookPagePath } from "@/lib/books/path";

/**
 * Old address of a book's page (Reading Room "Find this book" links, test
 * drafts only, 2026-10-02). Permanently forwards to the book's page (DECISIONS.md, 2026-11-17).
 */
export default async function FindItRedirect({ params }: { params: Promise<{ bookId: string }> }) {
  const book = await getBookById(decodeURIComponent((await params).bookId));
  if (!book) notFound();
  permanentRedirect(`${bookPagePath(book.title, book.author)}#${WHERE_TO_READ_ID}`);
}
