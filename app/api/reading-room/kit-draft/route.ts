import { NextResponse } from "next/server";
import { readingRoomIssueHtml, type IssueEmail } from "@/lib/email/readingRoomIssueEmail";
import { KitDraftLockedError, saveReadingRoomDraft } from "@/lib/integrations/kit";

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
// Gmail clips emails over ~102 KB ("[Message clipped]"), and Kit's template +
// footer add to our body; warn the editor with room to spare.
const CLIP_WARNING_KB = 85;

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
  title, subject, previewText, introSentence, themeHeading, themeExplanation, expectHeading, whatToExpect, transitionSentence, kitBroadcastId,
  "books": bookEntries[defined(book)]{
    "title": book->title, "author": book->author, "coverUrl": book->coverImage.asset->url,
    "blurb": coalesce(blurb, book->canonicalBlurb),
    "tags": select(count(tags) > 0 => tags[]->name, book->tags[]->name)
  }
}`;

type Issue = Partial<Omit<IssueEmail, "books">> & {
  title?: string;
  subject?: string;
  previewText?: string;
  kitBroadcastId?: number;
  books: (Omit<IssueEmail["books"][number], "tags"> & { tags: (string | null)[] | null })[] | null;
};

const REQUIRED: [keyof Issue, string][] = [
  ["subject", "Email subject line"],
  ["previewText", "Preview text"],
  ["introSentence", "Intro sentence"],
  ["themeExplanation", "Explaining the theme"],
  ["whatToExpect", "What to expect"],
  ["transitionSentence", "Transition to the book list"],
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
    introSentence: issue.introSentence!,
    themeHeading: issue.themeHeading?.trim() || "About this theme",
    themeExplanation: issue.themeExplanation!,
    expectHeading: issue.expectHeading?.trim() || "What to expect",
    whatToExpect: issue.whatToExpect!,
    transitionSentence: issue.transitionSentence!,
    books: books.map((b) => ({ ...b, tags: (b.tags ?? []).filter((t): t is string => !!t) })),
  });

  try {
    const result = await saveReadingRoomDraft({
      existingId: issue.kitBroadcastId,
      description: `Reading Room: ${issue.title || issue.subject}`,
      subject: issue.subject!,
      previewText: issue.previewText!,
      content,
    });
    const sizeKb = Math.round(Buffer.byteLength(content) / 1000);
    return NextResponse.json({ ...result, bookCount: books.length, sizeKb, nearClipLimit: sizeKb > CLIP_WARNING_KB });
  } catch (err) {
    if (err instanceof KitDraftLockedError) return NextResponse.json({ error: err.message }, { status: 409 });
    console.error("[kit-draft]", err);
    return NextResponse.json({ error: "Kit didn't accept the draft. Try again in a minute." }, { status: 502 });
  }
}
