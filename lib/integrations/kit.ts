/**
 * Kit (formerly ConvertKit) — holds only confirmed, converted Reading Room
 * members, and the draft broadcasts the Studio makes for their issues
 * (`saveReadingRoomDraft`). Nothing else touches Kit: the free list lives in Resend's own
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

export class KitDraftLockedError extends Error {
  constructor(status: string) {
    super(`The Kit email for this issue is no longer a draft (status: ${status}), so it can't be changed from here.`);
    this.name = "KitDraftLockedError";
  }
}

interface KitBroadcast {
  id: number;
  status: string;
  email_template: { id: number } | null;
}

/**
 * Saves a Reading Room issue to Kit as a draft broadcast for members only
 * (the member tag), never sending it: `send_at: null` + `public: false` is
 * Kit's draft state. With `existingId`, updates that broadcast instead, as
 * long as it's still a draft (a scheduled or sent one throws
 * KitDraftLockedError; a deleted one is recreated). DECISIONS.md, 2026-10-02.
 */
export async function saveReadingRoomDraft(input: {
  existingId?: number;
  description: string;
  subject: string;
  previewText: string;
  content: string;
}): Promise<{ id: number; created: boolean }> {
  const apiKey = requireApiKey();
  const tagId = Number(process.env.KIT_READING_ROOM_TAG_ID);
  if (!tagId) throw new KitNotConfiguredError();
  const body = {
    subject: input.subject,
    preview_text: input.previewText,
    description: input.description,
    content: input.content,
    public: false,
    send_at: null,
    subscriber_filter: [{ all: [{ type: "tag", ids: [tagId] }] }],
  };

  if (input.existingId) {
    const res = await fetch(`${KIT_API_BASE}/broadcasts/${input.existingId}`, { headers: kitHeaders(apiKey) });
    if (res.ok) {
      const { broadcast } = (await res.json()) as { broadcast: KitBroadcast };
      if (broadcast.status !== "draft") throw new KitDraftLockedError(broadcast.status);
      const put = await fetch(`${KIT_API_BASE}/broadcasts/${input.existingId}`, {
        method: "PUT",
        headers: kitHeaders(apiKey),
        body: JSON.stringify({ ...body, email_template_id: broadcast.email_template?.id }),
      });
      if (!put.ok) throw new Error(`Kit update-broadcast failed: ${put.status} ${await put.text()}`);
      return { id: input.existingId, created: false };
    }
    if (res.status !== 404) throw new Error(`Kit get-broadcast failed: ${res.status} ${await res.text()}`);
    // Deleted in Kit since: fall through and make a new draft.
  }

  const res = await fetch(`${KIT_API_BASE}/broadcasts`, { method: "POST", headers: kitHeaders(apiKey), body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`Kit create-broadcast failed: ${res.status} ${await res.text()}`);
  const { broadcast } = (await res.json()) as { broadcast: KitBroadcast };
  return { id: broadcast.id, created: true };
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
