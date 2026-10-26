import { useState } from "react";
import { useClient, useDocumentOperation, type DocumentActionDialogProps, type DocumentActionProps } from "sanity";
import { pickTopBooks } from "../lib/pickBooksFromRanking";
import { suggestedFocusKeyword } from "../lib/seoChecks";

interface ArticleFields {
  category?: string;
  ranking?: { _ref: string };
  rankingCount?: number;
  bookEntries?: unknown[];
  focusKeyword?: string;
}

interface RankingData {
  ranking: string[] | null;
  rankingName: string | null;
}

function randomKey() {
  return Math.random().toString(36).slice(2, 12);
}

/**
 * Studio document action on Shortlist articles and Reading Room issues: fills
 * `bookEntries` with the chosen ranking's top N books in rank order
 * (sanity/lib/pickBooksFromRanking.ts). The result is an ordinary, editable
 * book list on the draft — the author still reviews, reorders and publishes it.
 * Other columns' articles are hand-picked instead (ChooseBooksAction).
 */
export function FillFromRankingAction(props: DocumentActionProps) {
  const { id, type, draft, published, onComplete } = props;
  const doc = (draft ?? published) as ArticleFields | null;
  const isIssue = type === "readingRoomIssue";
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

  if (!isIssue && doc?.category !== "the-shortlist") return null;

  async function fill(rankingId: string, count: number) {
    setDialog(null);
    setRunning(true);
    try {
      const data = await client.fetch<RankingData>(
        `{ "ranking": *[_id == $rankingId][0].books[]._ref, "rankingName": *[_id == $rankingId][0].name }`,
        { rankingId },
      );
      const ranking = data.ranking ?? [];
      if (ranking.length === 0) {
        message("Nothing to fill", "The chosen ranking has no books in it yet.");
        return;
      }

      const { bookIds, shortBy } = pickTopBooks(ranking, count);
      const keyword = !isIssue && !doc?.focusKeyword?.trim() && data.rankingName ? suggestedFocusKeyword(data.rankingName) : null;
      patch.execute([
        {
          set: {
            bookEntries: bookIds.map((ref) => ({
              _type: "bookEntry",
              _key: randomKey(),
              book: { _type: "reference", _ref: ref },
            })),
            ...(keyword ? { focusKeyword: keyword } : {}),
          },
        },
      ]);

      message(
        `Added ${bookIds.length} books`,
        <>
          <p>The top {bookIds.length} books from the ranking, in rank order.</p>
          {shortBy > 0 && <p>The ranking only has {bookIds.length} books — {shortBy} fewer than you asked for.</p>}
          {keyword && <p>Focus keyword set to &ldquo;{keyword}&rdquo; for the SEO checks. Change it if you&rsquo;re targeting something else.</p>}
          <p>Review the list, then publish when ready.</p>
        </>,
      );
    } catch (err) {
      message("Couldn't fill the books", `Something went wrong: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setRunning(false);
    }
  }

  return {
    label: running ? "Filling books…" : "Fill books from ranking",
    disabled: running,
    dialog,
    onHandle: () => {
      const rankingId = doc?.ranking?._ref;
      const count = doc?.rankingCount;
      if (!rankingId || !count) {
        message(
          "A few fields first",
          `Set the Ranking this ${isIssue ? "issue" : "article"}'s books come from and How many books, then click this again.`,
        );
        return;
      }
      const existing = doc?.bookEntries?.length ?? 0;
      if (existing > 0) {
        setDialog({
          type: "confirm",
          message: `This replaces the ${existing} book${existing === 1 ? "" : "s"} already in this ${isIssue ? "issue" : "article"}, including any blurb or tag overrides on them. Continue?`,
          onConfirm: () => fill(rankingId, count),
          onCancel: () => {
            setDialog(null);
            onComplete();
          },
        });
        return;
      }
      void fill(rankingId, count);
    },
  };
}
