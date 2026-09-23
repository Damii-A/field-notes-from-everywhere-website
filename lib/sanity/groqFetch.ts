/**
 * Minimal GROQ fetch helper, used instead of `@sanity/client`'s own
 * `.fetch()` for this app's read path. `@sanity/client@6.29.1`'s `.fetch()`
 * was verified (2026-09-21) to silently return `null` for queries that
 * definitely match documents, specifically when running inside this
 * project's Next.js server runtime — a plain `fetch()` call against the
 * exact same Sanity Query HTTP API endpoint, with the same query/params/
 * token, reliably returns the correct result in that same runtime. Root
 * cause not isolated (something in how the SDK's bundled HTTP layer
 * resolves in this environment); rather than depend on a third-party SDK
 * with a confirmed environment-specific bug, this hand-rolled call directly
 * against Sanity's public Query HTTP API sidesteps it entirely. See
 * DECISIONS.md. `@sanity/client` is still used by the embedded Studio
 * (sanity.config.ts) — this file is only for the app's own content reads.
 */
// Two naming conventions in play: our own `.env.local` (NEXT_PUBLIC_SANITY_*,
// SANITY_API_TOKEN) and whatever Vercel's Sanity marketplace integration
// auto-provisions on deploy (SANITY_STUDIO_*/SANITY_API_*, which don't match
// ours) — read whichever is actually present rather than requiring the user
// to manually duplicate values across both.
const PROJECT_ID =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID || process.env.SANITY_API_PROJECT_ID;
const DATASET =
  process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_STUDIO_DATASET || process.env.SANITY_API_DATASET || "production";
const API_VERSION = "2025-01-01";
const TOKEN = process.env.SANITY_API_TOKEN || process.env.SANITY_API_READ_TOKEN;

// Past this, switch from GET (query in the URL) to POST (query in the body)
// to avoid hitting server/proxy URL-length limits — mirrors @sanity/client's
// own GET/POST switching behavior.
const MAX_GET_URL_LENGTH = 2000;

interface GroqFetchOptions {
  tags: string[];
  revalidate: number;
}

export async function groqFetch<T>(query: string, params: Record<string, unknown>, options: GroqFetchOptions): Promise<T> {
  const base = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}`;
  // Always explicit: at this API version, an authenticated query's default
  // ("raw") perspective includes unpublished drafts (`drafts.*` ids) alongside
  // published documents — found 2026-09-24 when an unpublished, future-dated
  // draft article was being returned by the live hub query and would have
  // gone live at its scheduled time without ever being published.
  const searchParams = new URLSearchParams({ query, perspective: "published" });
  for (const [key, value] of Object.entries(params)) {
    searchParams.set(`$${key}`, JSON.stringify(value));
  }
  const getUrl = `${base}?${searchParams.toString()}`;

  const headers: Record<string, string> = TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {};
  const fetchOptions: RequestInit & { next: GroqFetchOptions } = {
    headers,
    next: { tags: options.tags, revalidate: options.revalidate },
  };

  const res =
    getUrl.length <= MAX_GET_URL_LENGTH
      ? await fetch(getUrl, fetchOptions)
      : await fetch(`${base}?perspective=published`, {
          ...fetchOptions,
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({ query, params }),
        });

  if (!res.ok) {
    throw new Error(`Sanity query failed (${res.status}): ${await res.text()}`);
  }
  const body = (await res.json()) as { result: T };
  return body.result;
}
