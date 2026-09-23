import { useState } from "react";
import { useClient, useDocumentOperation, type DocumentActionDialogProps, type DocumentActionProps } from "sanity";
import {
  EXCLUDED_SIBLING_CATEGORIES,
  TOP_N_SHARED,
  pickBooksFromRanking,
  type ArticleCategory,
} from "../lib/pickBooksFromRanking";

const CATEGORY_TITLES: Record<ArticleCategory, string> = {
  "the-shortlist": "The Shortlist",
  "what-to-read-when": "What to Read When",
  "book-club-book-picks": "Book Club Book Picks",
};

interface ArticleFields {
  category?: ArticleCategory;
  ranking?: { _ref: string };
  rankingCount?: number;
  bookEntries?: unknown[];
}

interface SiblingData {
  ranking: string[] | null;
  siblings: { category: ArticleCategory; books: string[] | null }[];
}

function randomKey() {
  return Math.random().toString(36).slice(2, 12);
}

/**
 * Studio document action on articles: fills `bookEntries` from the chosen
 * ranking using the per-column rules in sanity/lib/pickBooksFromRanking.ts.
 * The result is an ordinary, editable book list on the draft — the author
 * still reviews, reorders and publishes it.
 */
export function FillFromRankingAction(props: DocumentActionProps) {
  const { id, type, draft, published, onComplete } = props;
  const doc = (draft ?? published) as ArticleFields | null;
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

  async function fill(category: ArticleCategory, rankingId: string, count: number) {
    setDialog(null);
    setRunning(true);
    try {
      const excludedCats = EXCLUDED_SIBLING_CATEGORIES[category];
      const data = await client.fetch<SiblingData>(
        `{
          "ranking": *[_id == $rankingId][0].books[]._ref,
          "siblings": *[_type == "article" && ranking._ref == $rankingId && category in $cats && !(_id in [$id, $draftId])]{
            category, "books": bookEntries[].book._ref
          }
        }`,
        { rankingId, cats: excludedCats, id, draftId: `drafts.${id}` },
      );
      const ranking = data.ranking ?? [];
      if (ranking.length === 0) {
        message("Nothing to fill", "The chosen ranking has no books in it yet.");
        return;
      }

      const used = new Set(data.siblings.flatMap((s) => s.books ?? []));
      const { bookIds, shortBy } = pickBooksFromRanking(category, ranking, count, used);
      patch.execute([
        {
          set: {
            bookEntries: bookIds.map((ref) => ({
              _type: "bookEntry",
              _key: randomKey(),
              book: { _type: "reference", _ref: ref },
            })),
          },
        },
      ]);

      const missingSiblings = excludedCats.filter((c) => !data.siblings.some((s) => s.category === c));
      message(
        `Added ${bookIds.length} books`,
        <>
          <p>
            {category === "the-shortlist"
              ? `The top ${bookIds.length} books from the ranking, in rank order.`
              : `The ranking's top ${Math.min(TOP_N_SHARED, ranking.length)} plus ${bookIds.length - Math.min(TOP_N_SHARED, ranking.length)} more, shuffled. Drag to rearrange if you like.`}
          </p>
          {shortBy > 0 && <p>The ranking ran out of unused books — {shortBy} fewer than you asked for.</p>}
          {missingSiblings.length > 0 && (
            <p>
              Heads up: there's no {missingSiblings.map((c) => CATEGORY_TITLES[c]).join(" or ")} article for this ranking
              yet, so its books couldn&rsquo;t be left out. Create that one first, then click this again.
            </p>
          )}
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
      const category = doc?.category;
      const rankingId = doc?.ranking?._ref;
      const count = doc?.rankingCount;
      if (!category || !rankingId || !count) {
        message(
          "A few fields first",
          "Set the article's Category, the Ranking it's drawn from, and How many books, then click this again.",
        );
        return;
      }
      const existing = doc?.bookEntries?.length ?? 0;
      if (existing > 0) {
        setDialog({
          type: "confirm",
          message: `This replaces the ${existing} book${existing === 1 ? "" : "s"} already in this article, including any blurb or tag overrides on them. Continue?`,
          onConfirm: () => fill(category, rankingId, count),
          onCancel: () => {
            setDialog(null);
            onComplete();
          },
        });
        return;
      }
      void fill(category, rankingId, count);
    },
  };
}
