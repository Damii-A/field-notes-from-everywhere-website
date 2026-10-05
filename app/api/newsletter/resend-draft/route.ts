import { NextResponse } from "next/server";
import type { CategorySlug } from "@/lib/content/types";
import { weeklyNewsletterHtml, weeklyNewsletterText, type NewsletterArticle } from "@/lib/email/weeklyNewsletterEmail";
import { NewsletterAlreadySentError, saveNewsletterDraft } from "@/lib/integrations/resend";
import { sanityQuery } from "@/lib/sanity/serverApi";

/**
 * POST /api/newsletter/resend-draft — the server half of the Studio's "Create
 * Resend draft" button on weekly newsletters
 * (sanity/actions/CreateResendDraftAction.tsx). The Resend key never leaves the
 * server. Same proof-of-Studio-login as the Kit draft route
 * (app/api/reading-room/kit-draft): the button first writes a short-lived
 * `newsletterDraftRequest.<random>` document with the editor's own session, and
 * only an id that exists and is under 5 minutes old is accepted.
 * DECISIONS.md, 2026-10-05.
 */
export const dynamic = "force-dynamic";

const REQUEST_TTL_SECONDS = 300;

interface RawNewsletter {
  _id: string;
  sendDate?: string;
  subject?: string;
  previewText?: string;
  intro?: string;
  signOff?: string;
  resendBroadcastId?: string;
  articles?: {
    summary?: string | null;
    a: {
      slug: string | null;
      category: CategorySlug | null;
      title: string | null;
      live: boolean;
      description: string | null;
      heroUrl: string | null;
      heroAlt: string | null;
      books: ({ title: string | null; coverUrl: string | null } | null)[] | null;
    } | null;
  }[];
}

// Raw perspective, so references resolve to the *published* article (what
// readers will reach); the newsletter itself is read as draft-over-published.
const NEWSLETTER_QUERY = `*[_type == "weeklyNewsletter" && _id in [$id, "drafts." + $id]]{
  _id, sendDate, subject, previewText, intro, signOff, resendBroadcastId,
  "articles": articles[]{ summary, "a": article->{
    "slug": slug.current, category, title, "live": publishedAt <= now(),
    "description": coalesce(metaDescription, methodologySentence),
    "heroUrl": heroImage.asset->url, "heroAlt": heroImage.alt,
    "books": bookEntries[0...3].book->{ title, "coverUrl": coverImage.asset->url }
  } }
}`;

export async function POST(req: Request) {
  const { requestId } = (await req.json().catch(() => ({}))) as { requestId?: unknown };
  if (typeof requestId !== "string" || !/^newsletterDraftRequest\.[a-z0-9]{20,}$/.test(requestId)) {
    return NextResponse.json({ error: "Not allowed." }, { status: 401 });
  }

  try {
    const request = await sanityQuery<{ newsletterId?: string } | null>(
      `*[_id == $id && _type == "newsletterDraftRequest" && dateTime(_createdAt) > dateTime(now()) - ${REQUEST_TTL_SECONDS}][0]{ newsletterId }`,
      { id: requestId },
    );
    if (!request?.newsletterId) return NextResponse.json({ error: "Not allowed." }, { status: 401 });

    const baseId = request.newsletterId.replace(/^drafts\./, "");
    const docs = await sanityQuery<RawNewsletter[]>(NEWSLETTER_QUERY, { id: baseId });
    const n = docs.find((d) => d._id.startsWith("drafts.")) ?? docs[0];
    if (!n) return NextResponse.json({ error: "Couldn't find this newsletter. Save it and try again." }, { status: 404 });

    const missing: string[] = [];
    if (!n.sendDate) missing.push("Send date");
    if (!n.subject?.trim()) missing.push("Email subject line");
    if (!n.intro?.trim()) missing.push("Intro");
    if (!n.signOff?.trim()) missing.push("Sign-off");
    const entries = (n.articles ?? []).filter((e) => e.a);
    if (entries.length === 0) missing.push("Articles");
    if (missing.length > 0) return NextResponse.json({ error: `Fill these in first: ${missing.join(", ")}.` }, { status: 400 });

    // Every card links to its article, so each must be live for readers.
    const notLive = entries.filter((e) => !e.a!.live || !e.a!.slug || !e.a!.category).map((e) => `"${e.a!.title ?? "Untitled"}"`);
    if (notLive.length > 0) {
      return NextResponse.json({ error: `These articles aren't live on the site yet, so their links wouldn't work: ${notLive.join(", ")}. Publish them or remove them from the newsletter.` }, { status: 400 });
    }

    const articles: NewsletterArticle[] = entries.map(({ summary, a }) => ({
      slug: a!.slug!,
      category: a!.category!,
      title: a!.title ?? "",
      summary: summary?.trim() ? summary : (a!.description ?? ""),
      heroUrl: a!.heroUrl ?? undefined,
      heroAlt: a!.heroAlt ?? undefined,
      books: (a!.books ?? []).filter((b): b is { title: string; coverUrl: string | null } => !!b?.title).map((b) => ({ title: b.title, coverUrl: b.coverUrl ?? undefined })),
    }));
    const email = { sendDate: n.sendDate!, intro: n.intro!, signOff: n.signOff!, articles };

    const result = await saveNewsletterDraft({
      existingId: n.resendBroadcastId,
      name: `Weekly newsletter ${n.sendDate}`,
      subject: n.subject!,
      previewText: n.previewText,
      html: weeklyNewsletterHtml(email),
      text: weeklyNewsletterText(email),
    });
    return NextResponse.json({ ...result, articleCount: articles.length });
  } catch (err) {
    if (err instanceof NewsletterAlreadySentError) return NextResponse.json({ error: err.message }, { status: 409 });
    console.error("[newsletter/resend-draft]", err);
    return NextResponse.json({ error: "Resend didn't accept the draft. Try again in a minute." }, { status: 502 });
  }
}
