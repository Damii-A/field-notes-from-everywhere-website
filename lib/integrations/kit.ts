/**
 * Kit (formerly ConvertKit) — list/tag membership only. See ARCHITECTURE.md
 * §9: Kit owns the ongoing newsletter relationship (free Publication list,
 * Reading Room segment), not one-off transactional sends (that's Resend,
 * see resend.ts).
 *
 * Uses Kit's v4 REST API (api.kit.com/v4), verified against
 * developers.kit.com on 2026-09-22 against a real Kit account. A form and a
 * tag are different Kit objects with different endpoints — adding someone to
 * the publication signup form is not the same call as tagging them.
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
async function upsertSubscriber(apiKey: string, email: string): Promise<void> {
  const res = await fetch(`${KIT_API_BASE}/subscribers`, {
    method: "POST",
    headers: kitHeaders(apiKey),
    body: JSON.stringify({ email_address: email }),
  });
  if (!res.ok) {
    throw new Error(`Kit create-subscriber failed: ${res.status} ${await res.text()}`);
  }
}

/**
 * Adds a subscriber to a specific Kit form (e.g. the publication free-list
 * signup form) — POST /forms/{form_id}/subscribers. The subscriber must
 * already exist in Kit, hence the upsert first.
 */
export async function addSubscriberToForm(email: string, formId: string): Promise<void> {
  const apiKey = requireApiKey();
  await upsertSubscriber(apiKey, email);
  const res = await fetch(`${KIT_API_BASE}/forms/${formId}/subscribers`, {
    method: "POST",
    headers: kitHeaders(apiKey),
    body: JSON.stringify({ email_address: email }),
  });
  if (!res.ok) {
    throw new Error(`Kit add-to-form failed: ${res.status} ${await res.text()}`);
  }
}

/**
 * Tags a subscriber (e.g. the Reading Room trial tag) — POST
 * /tags/{tag_id}/subscribers, addressed by email. The subscriber must
 * already exist in Kit, hence the upsert first.
 */
export async function tagSubscriber(email: string, tagId: string): Promise<void> {
  const apiKey = requireApiKey();
  await upsertSubscriber(apiKey, email);
  const res = await fetch(`${KIT_API_BASE}/tags/${tagId}/subscribers`, {
    method: "POST",
    headers: kitHeaders(apiKey),
    body: JSON.stringify({ email_address: email }),
  });
  if (!res.ok) {
    throw new Error(`Kit tag failed: ${res.status} ${await res.text()}`);
  }
}

/** Used by the Paddle webhook to move a customer in/out of the Reading Room segment. */
export async function setReadingRoomTag(email: string, active: boolean): Promise<void> {
  const tagId = process.env.KIT_READING_ROOM_TAG_ID;
  if (!tagId) throw new KitNotConfiguredError();
  if (active) {
    await tagSubscriber(email, tagId);
    return;
  }
  // Removing a tag by email requires looking the subscriber up first —
  // left as a TODO until this is exercised against a real Kit account;
  // the Paddle webhook route surfaces this rather than silently no-op-ing.
  throw new Error("setReadingRoomTag(active=false) is not implemented yet — see lib/integrations/kit.ts");
}
