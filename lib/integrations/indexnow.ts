import { SITE_URL } from "@/lib/siteUrl";

/**
 * IndexNow (indexnow.org): tells Bing and the other participating search
 * engines straight away that pages changed, instead of waiting for them to
 * re-read the sitemap. Called from the Sanity publish webhook.
 *
 * The key is public by design: it proves ownership by being served at
 * /<key>.txt (public/6f1351ce56d828cb8d8ce4e6fe26768b.txt). Changing it means
 * renaming that file too.
 */
export const INDEXNOW_KEY = "6f1351ce56d828cb8d8ce4e6fe26768b";

export async function notifyIndexNow(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const site = new URL(SITE_URL);
  // Only the real public domain; a local or preview address can't be verified.
  if (site.hostname === "localhost" || site.hostname.endsWith(".vercel.app")) return;

  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: site.host,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: [...new Set(paths)].map((p) => `${SITE_URL}${p}`),
    }),
  });
  // 200 = accepted, 202 = accepted, key check pending.
  if (!res.ok) throw new Error(`IndexNow ${res.status}: ${await res.text()}`);
}
