import { NextResponse } from "next/server";
import { tagSubscriber, KitNotConfiguredError } from "@/lib/integrations/kit";
import { triggerReadingRoomTrialEvent } from "@/lib/integrations/resend";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface StartTrialBody {
  email: string;
}

/**
 * Starts a Reading Room trial — email-capture only, no Paddle involved (see
 * DECISIONS.md, "Reading Room's free trial is tracked in Kit, not as a
 * Paddle trial"). Resend Automations owns the actual sequence (7 days of
 * daily catalogue emails + the trial sales sequence — see DECISIONS.md,
 * "Move the Reading Room trial sequence from Kit to Resend Automations");
 * Kit only tracks membership via the durable relationship tag.
 */
export async function POST(request: Request) {
  let body: StartTrialBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { email } = body;
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
  }

  try {
    await triggerReadingRoomTrialEvent(email);
  } catch (err) {
    console.error("[api/reading-room/start-trial] Resend event failed:", err);
    return NextResponse.json(
      { error: "Couldn't start your trial right now. This service isn't fully configured yet — see CURRENT_STATE.md." },
      { status: 502 },
    );
  }

  try {
    const tagId = process.env.KIT_READING_ROOM_TAG_ID;
    if (!tagId) throw new KitNotConfiguredError();
    await tagSubscriber(email, tagId);
  } catch (err) {
    console.error("[api/reading-room/start-trial] Kit membership tag failed:", err);
    // The trial sequence already started via Resend — don't report total
    // failure, since the reader IS trialing now, just tell the truth about
    // the membership-tracking tag.
    return NextResponse.json(
      { started: true, membershipTagged: false, warning: "Trial started, but membership tracking wasn't recorded." },
      { status: 207 },
    );
  }

  return NextResponse.json({ started: true, membershipTagged: true });
}
