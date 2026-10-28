import { useEffect, useState } from "react";
import { useDocumentOperation, type DocumentActionComponent, type DocumentActionDialogProps, type DocumentActionProps } from "sanity";
import { formatArticleDate } from "../../lib/content/dates";

const button = (primary: boolean): React.CSSProperties => ({
  font: "inherit",
  fontSize: 14,
  fontWeight: primary ? 600 : 400,
  padding: "8px 14px",
  borderRadius: 6,
  border: "1px solid #8a8f98",
  background: primary ? "#2C464F" : "transparent",
  color: primary ? "#fff" : "inherit",
  cursor: "pointer",
  textAlign: "left",
});

/**
 * Wraps the Studio's own Publish button on articles (DECISIONS.md, 2026-10-28):
 * when the article's date would show an earlier day than today (US Eastern),
 * Publish first asks whether to publish with today's date or keep the current
 * one. Today's date is for a new article whose draft was started earlier, or a
 * yearly refresh; keeping it is for small fixes, so they don't move the article
 * back to the top of its column, the homepage and the newsletter. Future
 * (scheduled) dates and same-day dates publish straight away, as before.
 */
export function withPublishDateCheck(PublishAction: DocumentActionComponent): DocumentActionComponent {
  function PublishWithDateCheck(props: DocumentActionProps) {
    const original = PublishAction(props);
    const { patch } = useDocumentOperation(props.id, props.type);
    const [dialog, setDialog] = useState<DocumentActionDialogProps | null>(null);
    // The date just set, waiting for the draft to show it before publishing,
    // so the publish can't go out with the old date.
    const [pendingDate, setPendingDate] = useState<string | null>(null);
    const date = (props.draft as { publishedAt?: string } | null)?.publishedAt;

    useEffect(() => {
      if (pendingDate && date === pendingDate) {
        setPendingDate(null);
        original?.onHandle?.();
      }
    }, [pendingDate, date, original]);

    if (!original) return null;

    const today = new Date();
    const needsAsking = !!date && new Date(date) < today && formatArticleDate(date) !== formatArticleDate(today.toISOString());

    const close = () => {
      setDialog(null);
      props.onComplete();
    };

    return {
      ...original,
      label: pendingDate ? "Publishing…" : original.label,
      disabled: original.disabled || !!pendingDate,
      dialog: dialog ?? original.dialog,
      onHandle: () => {
        if (!needsAsking) return original.onHandle?.();
        setDialog({
          type: "dialog",
          header: "Update the published date?",
          onClose: close,
          content: (
            <div style={{ padding: "0 4px 8px", lineHeight: 1.5 }}>
              <p>
                This article is dated <strong>{formatArticleDate(date!)}</strong>. Readers see that date, and it decides where the
                article sits on its column page and the homepage, and whether it goes in the weekly newsletter.
              </p>
              <p>Use today&rsquo;s date for a new article or a yearly refresh. Keep the current date for small fixes.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
                <button
                  type="button"
                  style={button(true)}
                  onClick={() => {
                    setDialog(null);
                    // A minute in the past, so a Studio clock running slightly fast
                    // can't leave the article hidden as "scheduled".
                    const now = new Date(Date.now() - 60_000).toISOString();
                    setPendingDate(now);
                    patch.execute([{ set: { publishedAt: now } }]);
                  }}
                >
                  Publish with today&rsquo;s date ({formatArticleDate(today.toISOString())})
                </button>
                <button
                  type="button"
                  style={button(false)}
                  onClick={() => {
                    setDialog(null);
                    original.onHandle?.();
                  }}
                >
                  Publish and keep {formatArticleDate(date!)}
                </button>
              </div>
            </div>
          ),
        });
      },
    };
  }
  PublishWithDateCheck.action = PublishAction.action;
  PublishWithDateCheck.displayName = "PublishWithDateCheck";
  return PublishWithDateCheck;
}
