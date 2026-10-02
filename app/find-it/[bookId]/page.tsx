import { notFound, permanentRedirect } from "next/navigation";
import { getBookById } from "@/lib/content";

/**
 * Old address of a book's page (Reading Room "Find this book" links, test
 * drafts only, 2026-10-02). Permanently forwards to its "Where to read" page.
 */
export default async function FindItRedirect({ params }: { params: Promise<{ bookId: string }> }) {
  const book = await getBookById(decodeURIComponent((await params).bookId));
  if (!book?.slug) notFound();
  permanentRedirect(`/where-to-read/${book.slug}`);
}
