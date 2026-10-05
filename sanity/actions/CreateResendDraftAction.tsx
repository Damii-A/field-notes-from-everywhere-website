import { useState } from "react";
import { useClient, useDocumentOperation, type DocumentActionDialogProps, type DocumentActionProps } from "sanity";

interface NewsletterFields {
  resendBroadcastId?: string;
}

function randomId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * "Create Resend draft" on weekly newsletters: builds the newsletter email and
 * saves it in Resend as a draft broadcast to the whole free list
 * (app/api/newsletter/resend-draft). Never sends: the user sends or schedules
 * it in Resend. The short-lived newsletterDraftRequest document proves to the
 * server that a logged-in editor pressed this (same as "Create Kit draft").
 * DECISIONS.md, 2026-10-05.
 */
export function CreateResendDraftAction(props: DocumentActionProps) {
  const { id, type, draft, published, onComplete } = props;
  const doc = (draft ?? published) as NewsletterFields | null;
  const client = useClient({ apiVersion: "2025-01-01" });
  const { patch } = useDocumentOperation(id, type);
  const [dialog, setDialog] = useState<DocumentActionDialogProps | null>(null);
  const [running, setRunning] = useState(false);

  const message = (header: string, content: React.ReactNode) =>
    setDialog({
      type: "dialog",
      header,
      content: <div style={{ padding: "0 4px", lineHeight: 1.5 }}>{content}</div>,
      onClose: () => {
        setDialog(null);
        onComplete();
      },
    });

  async function run() {
    setRunning(true);
    const requestId = `newsletterDraftRequest.${randomId()}`;
    try {
      await client.create({ _id: requestId, _type: "newsletterDraftRequest", newsletterId: id });
      const res = await fetch("/api/newsletter/resend-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });
      const body = (await res.json().catch(() => ({}))) as { id?: string; created?: boolean; articleCount?: number; error?: string };
      if (!res.ok || !body.id) {
        message("Couldn't create the Resend draft", body.error ?? `Something went wrong (${res.status}).`);
        return;
      }
      if (body.id !== doc?.resendBroadcastId) patch.execute([{ set: { resendBroadcastId: body.id } }]);
      message(
        body.created ? "Draft created in Resend" : "Resend draft updated",
        <>
          <p>
            {body.created ? "A new draft" : "The existing draft"} with {body.articleCount} article{body.articleCount === 1 ? "" : "s"} is in Resend under
            Broadcasts, addressed to everyone on the email list. Nothing has been sent.
          </p>
          <p>Open it in Resend to preview it, then send it or schedule it for Wednesday 10am Eastern from there. To change anything, edit it here and press this button again.</p>
          {body.created && <p>Publish this newsletter here too, so the link to the Resend draft is saved.</p>}
        </>,
      );
    } catch (err) {
      message("Couldn't create the Resend draft", `Something went wrong: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      await client.delete(requestId).catch(() => {});
      setRunning(false);
    }
  }

  return {
    label: running ? "Creating Resend draft…" : doc?.resendBroadcastId ? "Update Resend draft" : "Create Resend draft",
    disabled: running || !doc,
    dialog,
    onHandle: () => void run(),
  };
}
