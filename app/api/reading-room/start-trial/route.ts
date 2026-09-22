import { NextResponse } from "next/server";
import { triggerReadingRoomTrialEvent } from "@/lib/integrations/resend";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface StartTrialBody {
  name: string;
  email: string;
}

/**
 * Starts a Reading Room trial — email-capture only, no Paddle involved (see
 * DECISIONS.md, "Reading Room's free trial is tracked in Kit, not as a
 * Paddle trial"). Resend owns the entire trial-to-conversion journey
 * (welcome, 7 days of trial content, conversion push — see DECISIONS.md,
 * "Move the Reading Room trial sequence from Kit to Resend Automations").
 * Kit is never touched here: it holds only confirmed, converted Reading
 * Room members, added exclusively by the Paddle webhook at the moment of
 * actual conversion (see DECISIONS.md, "Kit holds only confirmed Reading
 * Room members, never trial-only signups").
 */
export async function POST(request: Request) {
  let body: StartTrialBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, email } = body;
  if (!name || !name.trim()) {
    return NextResponse.json({ error: "A name is required" }, { status: 400 });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
  }

  try {
    await triggerReadingRoomTrialEvent(email, name);
  } catch (err) {
    console.error("[api/reading-room/start-trial] Resend event failed:", err);
    return NextResponse.json(
      { error: "Couldn't start your trial right now. This service isn't fully configured yet — see CURRENT_STATE.md." },
      { status: 502 },
    );
  }

  return NextResponse.json({ started: true });
}
