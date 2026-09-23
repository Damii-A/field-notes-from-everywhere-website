/**
 * Validates a Studio preview request — the server half of Sanity's
 * Presentation tool handshake. When someone logged into the Studio opens a
 * preview, the Studio writes a short-lived random secret document
 * (`sanity.previewUrlSecret`) using THEIR Studio session, then loads
 * /api/draft-mode/enable?sanity-preview-secret=…; this checks that exact
 * secret exists and is under an hour old. Nobody without Studio access can
 * create one, so nobody else can turn preview on.
 *
 * Mirrors `validatePreviewUrl` from @sanity/preview-url-secret@2.1.16 (same
 * query, TTL and parameter names), reimplemented over a plain fetch rather
 * than depending on it: that package requires @sanity/client v7, and this
 * app's reads deliberately avoid @sanity/client's fetch (DECISIONS.md,
 * "Content reads use a hand-rolled groqFetch"). Only the per-session secret
 * is accepted — the package's optional "share preview access" link mode
 * isn't supported. See DECISIONS.md, 2026-09-24.
 */
const PROJECT_ID =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID || process.env.SANITY_API_PROJECT_ID;
const DATASET =
  process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_STUDIO_DATASET || process.env.SANITY_API_DATASET || "production";
const TOKEN = process.env.SANITY_API_TOKEN || process.env.SANITY_API_READ_TOKEN;

const SECRET_TTL_SECONDS = 3600;
const SECRET_QUERY = `*[_type == "sanity.previewUrlSecret" && secret == $secret && dateTime(_updatedAt) > dateTime(now()) - ${SECRET_TTL_SECONDS}][0]{ secret }`;

export async function validatePreviewRequest(requestUrl: string): Promise<{ isValid: boolean; redirectTo: string }> {
  const url = new URL(requestUrl);
  const secret = url.searchParams.get("sanity-preview-secret")?.trim();
  if (!secret || !TOKEN || !PROJECT_ID) return { isValid: false, redirectTo: "/" };

  const queryUrl = new URL(`https://${PROJECT_ID}.api.sanity.io/v2025-02-19/data/query/${DATASET}`);
  queryUrl.searchParams.set("query", SECRET_QUERY);
  queryUrl.searchParams.set("$secret", JSON.stringify(secret));
  queryUrl.searchParams.set("perspective", "raw");
  const res = await fetch(queryUrl, { headers: { Authorization: `Bearer ${TOKEN}` }, cache: "no-store" });
  if (!res.ok) return { isValid: false, redirectTo: "/" };
  const { result } = (await res.json()) as { result: { secret?: string } | null };
  if (result?.secret !== secret) return { isValid: false, redirectTo: "/" };

  // Same-site paths only — resolving against a dummy origin and keeping just
  // the path means a crafted pathname can't redirect off this site.
  const target = new URL(url.searchParams.get("sanity-preview-pathname") || "/", "http://localhost");
  return { isValid: true, redirectTo: `${target.pathname}${target.search}${target.hash}` };
}
