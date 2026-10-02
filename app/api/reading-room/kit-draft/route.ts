import { NextResponse } from "next/server";
import { blurbExcerpt } from "@/lib/email/excerpt";
import { readingRoomIssueHtml, type IssueEmail } from "@/lib/email/readingRoomIssueEmail";
import { KitDraftLockedError, saveReadingRoomDraft } from "@/lib/integrations/kit";
import { SITE_URL } from "@/lib/siteUrl";

/**
 * POST /api/reading-room/kit-draft — the server half of the Studio's "Create
 * Kit draft" button (sanity/actions/CreateKitDraftAction.tsx). The Kit key
 * never leaves the server, so the Studio can't call Kit itself.
 *
 * Who may call it: only someone logged into the Studio. The button first
 * writes a short-lived `kitDraftRequest.<random>` document with the editor's
 * own Studio session (nobody without write access to the dataset can), then
 * sends its id here; we accept it only if that document exists and is under
 * 5 minutes old. Ids containing a "." are never publicly readable, so the
 * id can't be read off the dataset either. Same idea as the preview secret
 * (lib/sanity/previewSecret.ts). DECISIONS.md, 2026-10-02.
 */
export const dynamic = "force-dynamic";

const PROJECT_ID =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID || process.env.SANITY_API_PROJECT_ID;
const DATASET =
  process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_STUDIO_DATASET || process.env.SANITY_API_DATASET || "production";
const TOKEN = process.env.SANITY_API_TOKEN || process.env.SANITY_API_READ_TOKEN;
const REQUEST_TTL_SECONDS = 300;
// Gmail clips emails over ~102 KB ("[Message clipped]"); Kit's editor warns
// past 100 KB of its own estimate. Kit's estimate vs our body, measured
// 2026-10-02 (30-book issue): 85 KB -> 133 KB, 59 KB -> 102 KB, i.e. about
// body x 1.19 + 31 KB (its template, footer and link tracking). Warn past 98.
const CLIP_WARNING_KB = 98;
const kitEstimateKb = (bodyKb: number) => Math.round(bodyKb * 1.19 + 31);

async function query<T>(groq: string, params: Record<string, unknown>, perspective: "raw" | "drafts"): Promise<T> {
  const url = new URL(`https://${PROJECT_ID}.api.sanity.io/v2025-02-19/data/query/${DATASET}`);
  url.searchParams.set("query", groq);
  url.searchParams.set("perspective", perspective);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(`$${k}`, JSON.stringify(v));
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` }, cache: "no-store" });
  if (!res.ok) throw new Error(`Sanity query failed (${res.status}): ${await res.text()}`);
  return ((await res.json()) as { result: T }).result;
}

// The "drafts" perspective shows unpublished edits over the published issue —
// what the editor is looking at when they press the button.
const ISSUE_QUERY = `*[_type == "readingRoomIssue" && _id == $id][0]{
  title, subject, previewText, aboutThisIssue, closingSentence, signOff, kitBroadcastId,
  "rankedIds": ranking->books[]._ref,
  "books": bookEntries[defined(book)]{
    "id": book._ref, "slug": book->slug.current, "title": book->title, "author": book->author, "coverUrl": book->coverImage.asset->url,
    "ownBlurb": blurb, "canonicalBlurb": book->canonicalBlurb,
    "tags": select(count(tags) > 0 => tags[]->name, book->tags[]->name)
  }
}`;

type Issue = Partial<Omit<IssueEmail, "books">> & {
  title?: string;
  subject?: string;
  previewText?: string;
  kitBroadcastId?: number;
  rankedIds?: string[] | null;
  books: (Omit<IssueEmail["books"][number], "tags" | "rank" | "pageUrl" | "blurb"> & { id: string; slug?: string | null; ownBlurb?: string | null; canonicalBlurb?: string | null; tags: (string | null)[] | null })[] | null;
};

const REQUIRED: [keyof Issue, string][] = [
  ["subject", "Email subject line"],
  ["previewText", "Preview text"],
  ["aboutThisIssue", "About this issue"],
  ["closingSentence", "Closing sentence"],
  ["signOff", "Sign-off"],
];

export async function POST(req: Request) {
  if (!PROJECT_ID || !TOKEN) return NextResponse.json({ error: "Sanity isn't configured on the server." }, { status: 500 });
  const { requestId } = (await req.json().catch(() => ({}))) as { requestId?: unknown };
  if (typeof requestId !== "string" || !/^kitDraftRequest\.[a-z0-9]{20,}$/.test(requestId)) {
    return NextResponse.json({ error: "Not allowed." }, { status: 401 });
  }

  const request = await query<{ issueId?: string } | null>(
    `*[_id == $id && _type == "kitDraftRequest" && dateTime(_createdAt) > dateTime(now()) - ${REQUEST_TTL_SECONDS}][0]{ issueId }`,
    { id: requestId },
    "raw",
  );
  if (!request?.issueId) return NextResponse.json({ error: "Not allowed." }, { status: 401 });

  const issue = await query<Issue | null>(ISSUE_QUERY, { id: request.issueId }, "drafts");
  if (!issue) return NextResponse.json({ error: "Couldn't find this issue. Save it and try again." }, { status: 404 });

  const missing = REQUIRED.filter(([key]) => !String(issue[key] ?? "").trim()).map(([, label]) => label);
  const books = (issue.books ?? []).filter((b) => b.title);
  if (books.length === 0) missing.push("Book list");
  if (missing.length > 0) return NextResponse.json({ error: `Fill these in first: ${missing.join(", ")}.` }, { status: 400 });

  const content = readingRoomIssueHtml({
    aboutThisIssue: issue.aboutThisIssue!,
    closingSentence: issue.closingSentence!,
    signOff: issue.signOff!,
    books: books.map(({ id, slug, ownBlurb, canonicalBlurb, ...b }) => {
      const pos = issue.rankedIds?.indexOf(id) ?? -1;
      return {
        ...b,
        // A blurb written for this issue is used as written; the book's own
        // (publisher) blurb is shortened, with the full text on its /find-it page.
        blurb: ownBlurb?.trim() ? ownBlurb : blurbExcerpt(canonicalBlurb ?? ""),
        tags: (b.tags ?? []).filter((t): t is string => !!t),
        rank: pos >= 0 ? pos + 1 : undefined,
        // The book's "Where to read" page (full blurb + where to get it). No UTM
        // tags: Kit reports clicks per issue, and every byte of the URL is
        // repeated inside Kit's tracking link, which counts against Gmail's
        // clip limit. A book with no slug yet gets no link rather than a dead one.
        pageUrl: slug ? `${SITE_URL}/where-to-read/${slug}` : undefined,
      };
    }),
  });

  try {
    const result = await saveReadingRoomDraft({
      existingId: issue.kitBroadcastId,
      description: `Reading Room: ${issue.title || issue.subject}`,
      subject: issue.subject!,
      previewText: issue.previewText!,
      content,
    });
    const sizeKb = kitEstimateKb(Buffer.byteLength(content) / 1000);
    return NextResponse.json({ ...result, bookCount: books.length, sizeKb, nearClipLimit: sizeKb > CLIP_WARNING_KB });
  } catch (err) {
    if (err instanceof KitDraftLockedError) return NextResponse.json({ error: err.message }, { status: 409 });
    console.error("[kit-draft]", err);
    return NextResponse.json({ error: "Kit didn't accept the draft. Try again in a minute." }, { status: 502 });
  }
}
