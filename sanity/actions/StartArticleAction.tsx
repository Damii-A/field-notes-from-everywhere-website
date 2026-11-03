import { useState } from "react";
import { useClient, type DocumentActionDialogProps, type DocumentActionProps } from "sanity";
import { useRouter } from "sanity/router";
import { articleFromPostIdea, type PostIdeaDoc } from "../lib/articleFromPostIdea";

function randomKey() {
  return Math.random().toString(36).slice(2, 12);
}

/**
 * Studio document action on post ideas: makes a draft article in the idea's column
 * (title, books in order with their "Tags shown here", "How we made this list" from
 * the evidence line; sanity/lib/articleFromPostIdea.ts) and opens it. If an article
 * was already started from this idea, it opens that one instead (user, 2026-11-03).
 */
export function StartArticleAction(props: DocumentActionProps) {
  const { id, draft, published, onComplete } = props;
  const idea = (published ?? draft) as PostIdeaDoc | null;
  const client = useClient({ apiVersion: "2025-01-01" });
  const router = useRouter();
  const [dialog, setDialog] = useState<DocumentActionDialogProps | null>(null);
  const [running, setRunning] = useState(false);

  const open = (articleId: string) => router.navigateIntent("edit", { id: articleId, type: "article" });

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

  async function start() {
    if (!idea) return;
    setRunning(true);
    try {
      // Drafts included: an article started but never published still counts.
      const existing = await client.fetch<string | null>(`*[_type == "article" && postIdea._ref == $id][0]._id`, { id });
      if (existing) {
        const articleId = existing.replace(/^drafts\./, "");
        message(
          "An article was already started from this idea",
          <>
            <p>Opening it now. To start over, delete that article first.</p>
          </>,
        );
        open(articleId);
        return;
      }

      const result = articleFromPostIdea({ ...idea, _id: id }, randomKey, new Date());
      if ("problem" in result) {
        message("Can't start an article yet", result.problem);
        return;
      }
      const articleId = crypto.randomUUID();
      await client.create({ _id: `drafts.${articleId}`, ...result.fields } as { _id: string; _type: string });
      onComplete();
      open(articleId);
    } catch (err) {
      message("Couldn't start the article", `Something went wrong: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setRunning(false);
    }
  }

  return {
    label: running ? "Starting article…" : "Start article",
    tone: "primary",
    disabled: running || !idea,
    dialog,
    onHandle: () => void start(),
  };
}
