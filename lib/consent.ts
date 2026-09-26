/**
 * Cookie-consent choice, stored in a first-party cookie (a "necessary"
 * cookie in the privacy policy). Client-safe. Shaped as categories so ads
 * can be added later without re-asking for analytics (DECISIONS.md,
 * 2026-09-26).
 */
export const CONSENT_COOKIE = "fnfe_consent";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // re-ask after a year

export interface ConsentChoice {
  analytics: boolean;
}

/** Event the footer's "Cookie settings" link dispatches to reopen the banner. */
export const OPEN_COOKIE_SETTINGS_EVENT = "fnfe:open-cookie-settings";

export function readConsent(): ConsentChoice | null {
  const raw = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${CONSENT_COOKIE}=`))
    ?.slice(CONSENT_COOKIE.length + 1);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<ConsentChoice>;
    return typeof parsed.analytics === "boolean" ? { analytics: parsed.analytics } : null;
  } catch {
    return null;
  }
}

export function writeConsent(choice: ConsentChoice): void {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(choice))}; Max-Age=${MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
}

/** Removes Google Analytics' own cookies (_ga, _ga_<id>) after someone switches analytics off. */
export function clearAnalyticsCookies(): void {
  const host = location.hostname;
  const domains = ["", host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  for (const name of document.cookie.split("; ").map((c) => c.split("=")[0]!)) {
    if (name !== "_ga" && !name.startsWith("_ga_")) continue;
    for (const d of domains) {
      document.cookie = `${name}=; Max-Age=0; Path=/${d ? `; Domain=${d}` : ""}`;
    }
  }
}
