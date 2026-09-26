import { NextResponse, type NextRequest } from "next/server";

/**
 * Tells the cookie-consent manager (components/ConsentManager.tsx) whether
 * this visitor must opt in before analytics runs: the EEA, the UK and
 * Switzerland (GDPR / UK GDPR / Swiss FADP + ePrivacy). Country comes from
 * Vercel's edge header; when it's missing (local dev, unknown), ask anyway.
 * Only called on a first visit, before any choice is stored.
 */
const CONSENT_COUNTRIES = new Set([
  // EU
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU",
  "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
  // rest of the EEA, UK, Switzerland
  "IS", "LI", "NO", "GB", "CH",
]);

export function GET(request: NextRequest) {
  const country = request.headers.get("x-vercel-ip-country")?.toUpperCase() ?? "";
  const consentRequired = !country || CONSENT_COUNTRIES.has(country);
  return NextResponse.json({ consentRequired }, { headers: { "Cache-Control": "private, no-store" } });
}
