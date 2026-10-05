/**
 * UTM tags on links in our emails, so Google Analytics can attribute visits
 * (and Reading Room joins) to the email that sent them (DECISIONS.md,
 * 2026-09-27, "Email analytics"). `campaign` names the email type;
 * `content` the specific item (article slug, or the issue's date).
 * Canonical tags strip the query string, so these never affect SEO.
 */
export function withUtm(url: string, campaign: "book_list" | "weekly_newsletter" | "welcome", content?: string): string {
  const u = new URL(url);
  u.searchParams.set("utm_source", "fnfe_email");
  u.searchParams.set("utm_medium", "email");
  u.searchParams.set("utm_campaign", campaign);
  if (content) u.searchParams.set("utm_content", content);
  return u.toString();
}
