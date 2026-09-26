import { createHmac, timingSafeEqual } from "node:crypto";
import { SITE_URL } from "@/lib/siteUrl";

/**
 * Signed unsubscribe links for free-list emails (DECISIONS.md, 2026-09-26).
 * The token is an HMAC of the address, so a link only works for the address
 * it was sent to and nobody can unsubscribe someone else by guessing.
 * Keyed off `CRON_SECRET` (an internal secret already set on Vercel) with a
 * purpose prefix, so no new env var is needed. Rotating `CRON_SECRET`
 * invalidates links in already-sent emails; newer emails carry new links.
 */
function secret(): string {
  const s = process.env.CRON_SECRET;
  if (!s) throw new Error("CRON_SECRET is not set — unsubscribe links can't be signed.");
  return s;
}

function normalize(email: string): string {
  return email.trim().toLowerCase();
}

export function unsubscribeToken(email: string): string {
  return createHmac("sha256", secret()).update(`unsubscribe:${normalize(email)}`).digest("base64url");
}

export function isValidUnsubscribeToken(email: string, token: string): boolean {
  if (!email || !token) return false;
  const expected = Buffer.from(unsubscribeToken(email));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

function query(email: string): string {
  return `e=${encodeURIComponent(normalize(email))}&t=${unsubscribeToken(email)}`;
}

/** The visible "Unsubscribe" link in an email's footer: a confirm page, so link-scanning mail filters can't unsubscribe anyone by opening it. */
export function unsubscribePageUrl(email: string): string {
  return `${SITE_URL}/unsubscribe?${query(email)}`;
}

/** RFC 8058 one-click target for the `List-Unsubscribe` header (Gmail/Yahoo's unsubscribe button). POST only. */
export function unsubscribeOneClickUrl(email: string): string {
  return `${SITE_URL}/api/unsubscribe?${query(email)}`;
}

/** Headers every free-list email carries so mail apps can offer their own one-click unsubscribe. */
export function unsubscribeHeaders(email: string): Record<string, string> {
  return {
    "List-Unsubscribe": `<${unsubscribeOneClickUrl(email)}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}
