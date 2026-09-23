import { draftMode } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

/** Turns preview off and returns to the page the reader was on (or home). */
export async function GET(request: NextRequest) {
  (await draftMode()).disable();
  const back = request.nextUrl.searchParams.get("redirect") || "/";
  const target = new URL(back, "http://localhost"); // same-site paths only
  return NextResponse.redirect(new URL(`${target.pathname}${target.search}`, request.url));
}
