/**
 * Kit (formerly ConvertKit) — list/tag membership only. See ARCHITECTURE.md
 * §9: Kit owns the ongoing newsletter relationship (free Publication list,
 * Reading Room segment), not one-off transactional sends (that's Resend,
 * see resend.ts).
 *
 * Uses Kit's v4 REST API (api.kit.com/v4). Not yet exercised against a real
 * account — there is no Kit account configured yet (see CURRENT_STATE.md).
 * Verify the exact endpoint/payload shape against Kit's current API
 * reference before relying on this in production; this is a best-effort
 * implementation from their public docs, not something that's been tested
 * end-to-end.
 */

const KIT_API_BASE = "https://api.kit.com/v4";

export class KitNotConfiguredError extends Error {
  constructor() {
    super("KIT_API_KEY is not set — Kit is not configured yet. See CURRENT_STATE.md.");
    this.name = "KitNotConfiguredError";
  }
}

interface SubscribeOptions {
  email: string;
  /** Kit tag ID to apply — distinguishes the free Publication list from the Reading Room segment. */
  tagId?: string;
}

export async function subscribeToKit({ email, tagId }: SubscribeOptions): Promise<void> {
  const apiKey = process.env.KIT_API_KEY;
  if (!apiKey) throw new KitNotConfiguredError();

  const res = await fetch(`${KIT_API_BASE}/subscribers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Kit-Api-Key": apiKey,
    },
    body: JSON.stringify({ email_address: email }),
  });
  if (!res.ok) {
    throw new Error(`Kit subscribe failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { subscriber?: { id: number } };
  const subscriberId = data.subscriber?.id;

  if (tagId && subscriberId) {
    const tagRes = await fetch(`${KIT_API_BASE}/tags/${tagId}/subscribers/${subscriberId}`, {
      method: "POST",
      headers: { "X-Kit-Api-Key": apiKey },
    });
    if (!tagRes.ok) {
      throw new Error(`Kit tag failed: ${tagRes.status} ${await tagRes.text()}`);
    }
  }
}

/** Used by the Paddle webhook to move a customer in/out of the Reading Room segment. */
export async function setReadingRoomTag(email: string, active: boolean): Promise<void> {
  const tagId = process.env.KIT_READING_ROOM_TAG_ID;
  if (!tagId) throw new KitNotConfiguredError();
  if (active) {
    await subscribeToKit({ email, tagId });
    return;
  }
  const apiKey = process.env.KIT_API_KEY;
  if (!apiKey) throw new KitNotConfiguredError();
  // Removing a tag by email requires looking the subscriber up first —
  // left as a TODO until this is exercised against a real Kit account;
  // the Paddle webhook route surfaces this rather than silently no-op-ing.
  throw new Error("setReadingRoomTag(active=false) is not implemented yet — see lib/integrations/kit.ts");
}
