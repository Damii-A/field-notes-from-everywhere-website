import { NextResponse } from "next/server";
import { Paddle, EventName, Environment } from "@paddle/paddle-node-sdk";
import { setReadingRoomTag } from "@/lib/integrations/kit";
import { sendReadingRoomWelcomeEmail, setReadingRoomMemberProperty } from "@/lib/integrations/resend";

/**
 * Paddle → this app. Syncs subscription lifecycle into Kit's Reading Room
 * tag/segment — see ARCHITECTURE.md §10. This is the entire mechanism by
 * which a paying subscriber starts receiving the newsletter, since V1 has
 * no application database (DECISIONS.md "No application database for V1").
 *
 * Subscription events carry a `customerId`, not an email directly — resolved
 * via `paddle.customers.get(customerId)` below. `trialing`/`activated` tag
 * the subscriber; `canceled`/`past_due` untag them; `updated` re-syncs to the
 * subscription's current status, which is how a recovered past-due payment
 * gets the member tag back (Paddle fires `updated`, not `activated`, then).
 *
 * Also updates the same status as a Resend contact property
 * (`reading_room_member`) — this is the conversion signal the Reading Room
 * trial automation's post-trial branch reads (see ARCHITECTURE.md §9); until
 * this was added, nothing ever told Resend that a conversion had happened.
 *
 * First name: Paddle's checkout never asks for one (customer.name stays empty),
 * so the subscribe page asks first and sends it as the checkout's custom data,
 * which Paddle copies onto the subscription (DECISIONS.md 2026-10-06).
 */
function memberFirstName(customData: object | null, customerName: string | null): string | undefined {
  const fromPage = (customData as { first_name?: unknown } | null)?.first_name;
  const name = typeof fromPage === "string" && fromPage.trim() ? fromPage : customerName;
  return name?.trim().slice(0, 50) || undefined;
}

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
      const firstName = memberFirstName(event.data.customData, customer.name);
      await setReadingRoomTag(customer.email, true, firstName);
      await setReadingRoomMemberProperty(customer.email, true, firstName);
      // New members get the welcome email (DECISIONS.md, 2026-10-05). Last, so
      // a failure above retries first; a failure here throws so Paddle retries,
      // and the per-subscription idempotency key stops a second copy.
      if (event.eventType === EventName.SubscriptionActivated) {
        await sendReadingRoomWelcomeEmail(customer.email, firstName ?? "", event.data.id);
      }
      break;
    }
    case EventName.SubscriptionCanceled:
    case EventName.SubscriptionPastDue: {
      const customer = await paddle.customers.get(event.data.customerId);
      await setReadingRoomTag(customer.email, false);
      await setReadingRoomMemberProperty(customer.email, false);
      break;
    }
    case EventName.SubscriptionUpdated: {
      // Paddle's way of saying a past-due payment was recovered ("the
      // subscription returns to active and subscription.updated occurs",
      // developer.paddle.com, subscription.past_due), and it also fires on
      // renewals, pauses and other changes. Sync membership to the
      // subscription's *current* status (fetched, not taken from the payload,
      // so a late or out-of-order delivery can't undo a newer change).
      // Re-tagging an existing member is harmless. No welcome email here.
      const subscription = await paddle.subscriptions.get(event.data.id);
      const member = subscription.status === "active" || subscription.status === "trialing";
      const customer = await paddle.customers.get(subscription.customerId);
      const firstName = member ? memberFirstName(subscription.customData, customer.name) : undefined;
      await setReadingRoomTag(customer.email, member, firstName);
      await setReadingRoomMemberProperty(customer.email, member, firstName);
      break;
    }
    default:
      // Other event types (transaction.*, etc.) aren't acted on in V1.
      break;
  }

  return NextResponse.json({ received: true });
}
