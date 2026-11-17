import { notFound, permanentRedirect } from "next/navigation";
import { getBookPathForSlug } from "@/lib/content";
import { WHERE_TO_READ_ID } from "@/lib/books/path";

/**
 * The old "Where to read" address (2026-10-02 to 2026-11-17). Books now live at
 * /<title>-by-<author> (DECISIONS.md, 2026-11-17); old links, Pins, emails and search
 * results forward there permanently, landing on the "Where to read" section.
 */
export default async function OldWhereToReadRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const path = await getBookPathForSlug(decodeURIComponent((await params).slug));
  if (!path) notFound();
  permanentRedirect(`${path}#${WHERE_TO_READ_ID}`);
}
