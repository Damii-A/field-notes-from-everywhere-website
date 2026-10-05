/**
 * Direct Sanity HTTP API reads for server routes that need raw or draft data
 * (the weekly newsletter cron and its "Create Resend draft" route). Read-only:
 * the site's server has no write access to Sanity. Same plain-fetch approach as groqFetch (see the DECISIONS.md entry on
 * groqFetch); no caching. Token names: our own SANITY_API_TOKEN locally, or
 * what Vercel's Sanity integration provisions.
 */
const PROJECT_ID =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID || process.env.SANITY_API_PROJECT_ID;
const DATASET =
  process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_STUDIO_DATASET || process.env.SANITY_API_DATASET || "production";
const READ_TOKEN = process.env.SANITY_API_TOKEN || process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN;
const API = "v2025-02-19";

export async function sanityQuery<T>(groq: string, params: Record<string, unknown> = {}, perspective: "raw" | "published" = "raw"): Promise<T> {
  if (!PROJECT_ID || !READ_TOKEN) throw new Error("Sanity isn't configured on the server (project id / token).");
  const url = new URL(`https://${PROJECT_ID}.api.sanity.io/${API}/data/query/${DATASET}`);
  url.searchParams.set("query", groq);
  url.searchParams.set("perspective", perspective);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(`$${k}`, JSON.stringify(v));
  const res = await fetch(url, { headers: { Authorization: `Bearer ${READ_TOKEN}` }, cache: "no-store" });
  if (!res.ok) throw new Error(`Sanity query failed (${res.status}): ${await res.text()}`);
  return ((await res.json()) as { result: T }).result;
}
