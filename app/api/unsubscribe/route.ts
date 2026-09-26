import { NextResponse, type NextRequest } from "next/server";
import { unsubscribeContact, ResendNotConfiguredError } from "@/lib/integrations/resend";
import { isValidUnsubscribeToken } from "@/lib/unsubscribe";

/**
 * Unsubscribes a free-list contact. Two callers, same signed `?e=&t=` link
 * (lib/unsubscribe.ts): mail apps' one-click button (RFC 8058, a POST with
 * body `List-Unsubscribe=One-Click`), and the button on /unsubscribe.
 * POST only — a GET here (someone opening the header URL in a browser) goes
 * to the confirm page instead, so link-scanning mail filters can't
 * unsubscribe anyone just by fetching it.
 */
export async function POST(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("e") ?? "";
  const token = request.nextUrl.searchParams.get("t") ?? "";
  if (!isValidUnsubscribeToken(email, token)) {
    return NextResponse.json({ error: "This unsubscribe link isn't valid." }, { status: 400 });
  }

  try {
    await unsubscribeContact(email);
  } catch (err) {
    if (err instanceof ResendNotConfiguredError) {
      return NextResponse.json({ error: "Unsubscribing isn't available right now." }, { status: 503 });
    }
    console.error("[unsubscribe]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 502 });
  }
  return NextResponse.json({ unsubscribed: true });
}

export function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/unsubscribe";
  return NextResponse.redirect(url);
}
