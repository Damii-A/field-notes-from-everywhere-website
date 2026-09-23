import { NextResponse } from "next/server";
import { Paddle, EventName, Environment } from "@paddle/paddle-node-sdk";
import { setReadingRoomTag } from "@/lib/integrations/kit";
import { setReadingRoomMemberProperty } from "@/lib/integrations/resend";

/**
 * Paddle → this app. Syncs subscription lifecycle into Kit's Reading Room
 * tag/segment — see ARCHITECTURE.md §10. This is the entire mechanism by
 * which a paying subscriber starts receiving the newsletter, since V1 has
 * no application database (DECISIONS.md "No application database for V1").
 *
 * Subscription events carry a `customerId`, not an email directly — resolved
 * via `paddle.customers.get(customerId)` below. `trialing`/`activated` tag
 * the subscriber; `canceled`/`past_due` untag them (no separate dunning
 * handling in V1 — a past-due subscriber simply drops out of the member tag
 * until/unless Paddle recovers the payment and fires `activated` again).
 *
 * Also updates the same status as a Resend contact property
 * (`reading_room_member`) — this is the conversion signal the Reading Room
 * trial automation's post-trial branch reads (see ARCHITECTURE.md §9); until
 * this was added, nothing ever told Resend that a conversion had happened.
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

  // The SDK defaults to the production API if no environment is given, even
  // though the client-side var this reads is named NEXT_PUBLIC_ (safe to
  // read server-side too — it's just the string "sandbox"/"production", not
  // a secret). Confirmed via a real failed sandbox webhook delivery
  // (2026-09-22): paddle.customers.get() was hitting production with a
  // sandbox API key/customer, which fails and was going unhandled, turning
  // into a bare 500 with no detail — Paddle retried 3x and gave up.
  const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "production" ? Environment.production : Environment.sandbox;
  const paddle = new Paddle(apiKey, { environment });
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
    case EventName.SubscriptionActivated: {
      const customer = await paddle.customers.get(event.data.customerId);
      await setReadingRoomTag(customer.email, true, customer.name ?? undefined);
      await setReadingRoomMemberProperty(customer.email, true, customer.name ?? undefined);
      break;
    }
    case EventName.SubscriptionCanceled:
    case EventName.SubscriptionPastDue: {
      const customer = await paddle.customers.get(event.data.customerId);
      await setReadingRoomTag(customer.email, false);
      await setReadingRoomMemberProperty(customer.email, false);
      break;
    }
    default:
      // Other event types (transaction.*, etc.) aren't acted on in V1.
      break;
  }

  return NextResponse.json({ received: true });
}
