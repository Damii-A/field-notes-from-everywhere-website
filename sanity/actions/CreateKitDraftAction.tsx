import { useState } from "react";
import { useClient, useDocumentOperation, type DocumentActionDialogProps, type DocumentActionProps } from "sanity";

interface IssueFields {
  kitBroadcastId?: number;
}

function randomId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * "Create Kit draft" on Reading Room issues: builds the issue's email and
 * saves it in Kit as a draft for members (app/api/reading-room/kit-draft).
 * Never sends: the user reviews it in Kit and sends or schedules it there.
 * The short-lived kitDraftRequest document proves to the server that a
 * logged-in editor pressed this (see the route). DECISIONS.md, 2026-10-02.
 */
export function CreateKitDraftAction(props: DocumentActionProps) {
  const { id, type, draft, published, onComplete } = props;
  const doc = (draft ?? published) as IssueFields | null;
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
    const requestId = `kitDraftRequest.${randomId()}`;
    try {
      await client.create({ _id: requestId, _type: "kitDraftRequest", issueId: id });
      const res = await fetch("/api/reading-room/kit-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        id?: number;
        created?: boolean;
        bookCount?: number;
        error?: string;
      };
      if (!res.ok || !body.id) {
        message("Couldn't create the Kit draft", body.error ?? `Something went wrong (${res.status}).`);
        return;
      }
      if (body.id !== doc?.kitBroadcastId) patch.execute([{ set: { kitBroadcastId: body.id } }]);
      message(
        body.created ? "Draft created in Kit" : "Kit draft updated",
        <>
          <p>
            {body.created ? "A new draft" : "The existing draft"} with {body.bookCount} books is in Kit under Send → Broadcasts, addressed to
            Reading Room members only. Nothing has been sent.
          </p>
          <p>Open it in Kit to preview it, then send or schedule it from there.</p>
          {body.created && <p>Publish this issue here too, so the link to the Kit draft is saved.</p>}
        </>,
      );
    } catch (err) {
      message("Couldn't create the Kit draft", `Something went wrong: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      await client.delete(requestId).catch(() => {});
      setRunning(false);
    }
  }

  return {
    label: running ? "Creating Kit draft…" : doc?.kitBroadcastId ? "Update Kit draft" : "Create Kit draft",
    disabled: running || !doc,
    dialog,
    onHandle: () => void run(),
  };
}
