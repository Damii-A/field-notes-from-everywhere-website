/**
 * The site's timezone for displaying article dates: US Eastern (EST/EDT,
 * daylight saving handled automatically). Fixed rather than left to the
 * server's or visitor's clock, so an article shows the same date everywhere
 * (Vercel renders in UTC) and server/browser rendering always agree. The
 * Studio's publish-date field uses the same zone (sanity/schemaTypes/article.ts).
 * Client-safe: no server-only imports.
 */
export const SITE_TIME_ZONE = "America/New_York";

export function formatArticleDate(iso: string, month: "long" | "short" = "long"): string {
  return new Date(iso).toLocaleDateString("en-US", { month, day: "numeric", year: "numeric", timeZone: SITE_TIME_ZONE });
}
