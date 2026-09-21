import { NextResponse } from "next/server";
import { Paddle, EventName } from "@paddle/paddle-node-sdk";

/**
 * Paddle → this app. Syncs subscription lifecycle into Kit's Reading Room
 * tag/segment — see ARCHITECTURE.md §10. This is the entire mechanism by
 * which a paying subscriber starts receiving the newsletter, since V1 has
 * no application database (DECISIONS.md "No application database for V1").
 *
 * Not yet exercised against a real Paddle account/webhook (no
 * PADDLE_API_KEY/PADDLE_WEBHOOK_SECRET configured — see CURRENT_STATE.md).
 *
 * TODO once a Paddle account exists: subscription events carry a
 * `customerId`, not an email address directly. Before calling
 * `setReadingRoomTag` (lib/integrations/kit.ts) on trial/activated/canceled
 * events below, resolve it via `paddle.customers.get(customerId)`. Left
 * unimplemented rather than guessed at — untestable without a real account.
 */
export async function POST(request: Request) {
  const apiKey = process.env.PADDLE_API_KEY;
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!apiKey || !webhookSecret) {
    console.error("[api/webhooks/paddle] PADDLE_API_KEY / PADDLE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Paddle is not configured yet" }, { status: 501 });
  }

  const signature = request.headers.get("paddle-signature");
  const rawBody = await request.text();
  if (!signature) {
    return NextResponse.json({ error: "Missing paddle-signature header" }, { status: 400 });
  }

  const paddle = new Paddle(apiKey);
  let event;
  try {
    event = await paddle.webhooks.unmarshal(rawBody, webhookSecret, signature);
  } catch (err) {
    console.error("[api/webhooks/paddle] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  if (!event) {
    return NextResponse.json({ error: "Could not parse event" }, { status: 400 });
  }

  switch (event.eventType) {
    case EventName.SubscriptionTrialing:
    case EventName.SubscriptionActivated:
      console.warn(`[api/webhooks/paddle] ${event.eventType} received — customer→email resolution + Kit tag not yet implemented, see TODO above`);
      break;
    case EventName.SubscriptionCanceled:
    case EventName.SubscriptionPastDue:
      console.warn(`[api/webhooks/paddle] ${event.eventType} received — customer→email resolution + Kit untag not yet implemented, see TODO above`);
      break;
    default:
      // Other event types (transaction.*, etc.) aren't acted on in V1.
      break;
  }

  return NextResponse.json({ received: true });
}
