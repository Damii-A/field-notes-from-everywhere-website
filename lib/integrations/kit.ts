/**
 * Kit (formerly ConvertKit) — holds only confirmed, converted Reading Room
 * members. Nothing else touches Kit: the free list lives in Resend's own
 * contacts instead (see resend.ts, ARCHITECTURE.md §9, and DECISIONS.md,
 * "Kit holds only confirmed Reading Room members, never trial-only
 * signups").
 *
 * Uses Kit's v4 REST API (api.kit.com/v4), verified against
 * developers.kit.com on 2026-09-22 against a real Kit account.
 */

const KIT_API_BASE = "https://api.kit.com/v4";

export class KitNotConfiguredError extends Error {
  constructor() {
    super("KIT_API_KEY is not set — Kit is not configured yet. See CURRENT_STATE.md.");
    this.name = "KitNotConfiguredError";
  }
}

function requireApiKey(): string {
  const apiKey = process.env.KIT_API_KEY;
  if (!apiKey) throw new KitNotConfiguredError();
  return apiKey;
}

function kitHeaders(apiKey: string) {
  return { "Content-Type": "application/json", "X-Kit-Api-Key": apiKey };
}

/** Creates the subscriber in Kit if they don't already exist (POST /subscribers is an upsert). */
async function upsertSubscriber(apiKey: string, email: string, firstName?: string): Promise<void> {
  const res = await fetch(`${KIT_API_BASE}/subscribers`, {
    method: "POST",
    headers: kitHeaders(apiKey),
    body: JSON.stringify({ email_address: email, ...(firstName ? { first_name: firstName } : {}) }),
  });
  if (!res.ok) {
    throw new Error(`Kit create-subscriber failed: ${res.status} ${await res.text()}`);
  }
}

/**
 * Tags a subscriber with the Reading Room member tag — POST
 * /tags/{tag_id}/subscribers, addressed by email. The subscriber must
 * already exist in Kit, hence the upsert first.
 */
export async function tagSubscriber(email: string, tagId: string, firstName?: string): Promise<void> {
  const apiKey = requireApiKey();
  await upsertSubscriber(apiKey, email, firstName);
  const res = await fetch(`${KIT_API_BASE}/tags/${tagId}/subscribers`, {
    method: "POST",
    headers: kitHeaders(apiKey),
    body: JSON.stringify({ email_address: email }),
  });
  if (!res.ok) {
    throw new Error(`Kit tag failed: ${res.status} ${await res.text()}`);
  }
}

/** Looks a subscriber up by email (Kit's `id` lookup only takes a numeric id, not an email — this is the documented workaround via List subscribers). Returns null if no subscriber exists with that email. */
async function findSubscriberIdByEmail(apiKey: string, email: string): Promise<number | null> {
  const res = await fetch(`${KIT_API_BASE}/subscribers?email_address=${encodeURIComponent(email)}`, {
    headers: kitHeaders(apiKey),
  });
  if (!res.ok) {
    throw new Error(`Kit find-subscriber failed: ${res.status} ${await res.text()}`);
  }
  const body = (await res.json()) as { subscribers?: { id: number }[] };
  return body.subscribers?.[0]?.id ?? null;
}

/** Used by the Paddle webhook to move a customer in/out of the Reading Room member tag — the only thing that ever writes to Kit. */
export async function setReadingRoomTag(email: string, active: boolean, firstName?: string): Promise<void> {
  const apiKey = requireApiKey();
  const tagId = process.env.KIT_READING_ROOM_TAG_ID;
  if (!tagId) throw new KitNotConfiguredError();
  if (active) {
    await tagSubscriber(email, tagId, firstName);
    return;
  }
  const subscriberId = await findSubscriberIdByEmail(apiKey, email);
  if (subscriberId === null) return; // never a member (or already gone) — nothing to untag
  const res = await fetch(`${KIT_API_BASE}/tags/${tagId}/subscribers/${subscriberId}`, {
    method: "DELETE",
    headers: kitHeaders(apiKey),
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`Kit untag failed: ${res.status} ${await res.text()}`);
  }
}
