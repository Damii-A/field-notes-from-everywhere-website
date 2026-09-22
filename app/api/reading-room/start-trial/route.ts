import { NextResponse } from "next/server";
import { addSubscriberToForm, tagSubscriber, KitNotConfiguredError } from "@/lib/integrations/kit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface StartTrialBody {
  email: string;
}

/**
 * Starts a Reading Room trial — email-capture only, no Paddle involved (see
 * DECISIONS.md, "Reading Room's free trial is tracked in Kit, not as a
 * Paddle trial"). Adds the subscriber to the Reading Room Kit form (which
 * triggers Kit's own 7-day daily-catalogue/sales-sequence automation) and
 * tags them with the durable "active Reading Room relationship" tag
 * directly, rather than relying on a Kit-side automation step to apply it.
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
    const formId = process.env.KIT_READING_ROOM_FORM_ID;
    const tagId = process.env.KIT_READING_ROOM_TAG_ID;
    if (!formId || !tagId) throw new KitNotConfiguredError();
    await addSubscriberToForm(email, formId);
    await tagSubscriber(email, tagId);
  } catch (err) {
    console.error("[api/reading-room/start-trial] Kit call failed:", err);
    return NextResponse.json(
      { error: "Couldn't start your trial right now. This service isn't fully configured yet — see CURRENT_STATE.md." },
      { status: 502 },
    );
  }

  return NextResponse.json({ started: true });
}
