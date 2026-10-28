import { useState } from "react";
import { useClient, useDocumentOperation, type DocumentActionDialogProps, type DocumentActionProps } from "sanity";
import { RankingBookPicker, type BookEntryRef, type RankingBook } from "../components/RankingBookPicker";

interface ArticleFields {
  category?: string;
  ranking?: { _ref: string };
  bookEntries?: BookEntryRef[];
}

interface PickerData {
  rankingName: string | null;
  books: RankingBook[] | null;
  others: { _id: string; title: string | null; books: string[] | null }[];
}

/**
 * "Choose books from ranking" on What to Read When and Book Club Book Picks
 * articles (DECISIONS.md, 2026-10-26): every format except the ranked
 * Shortlist is hand-picked. Lists the article's ranking in rank order with
 * covers and tags, a tag filter, and a note on books already used by other
 * articles from the same ranking; ticking/unticking updates `bookEntries`,
 * keeping existing entries (and their blurb/tag overrides) where they are.
 */
export function ChooseBooksAction(props: DocumentActionProps) {
  const { id, type, draft, published, onComplete } = props;
  const doc = (draft ?? published) as ArticleFields | null;
  const client = useClient({ apiVersion: "2025-01-01" });
  const { patch } = useDocumentOperation(id, type);
  const [dialog, setDialog] = useState<DocumentActionDialogProps | null>(null);
  const [loading, setLoading] = useState(false);

  if (doc?.category === "the-shortlist") return null;

  const close = () => {
    setDialog(null);
    onComplete();
  };

  const message = (header: string, content: string) =>
    setDialog({ type: "dialog", header, content: <p style={{ padding: "0 4px", lineHeight: 1.5 }}>{content}</p>, onClose: close });

  async function open(rankingId: string) {
    setLoading(true);
    try {
      const data = await client.fetch<PickerData>(
        `{
          "rankingName": *[_id == $rankingId][0].name,
          "books": *[_id == $rankingId][0].books[]->{ _id, title, author, "cover": coverImage.asset->url, "tags": array::unique(*[_type == "ranking" && references(^._id)].name + coalesce(tags[]->name, [])) },
          "others": *[_type == "article" && ranking._ref == $rankingId && !(_id in [$id, $draftId])]{ _id, title, "books": bookEntries[].book._ref }
        }`,
        { rankingId, id, draftId: `drafts.${id}` },
      );
      const books = (data.books ?? []).filter(Boolean);
      if (books.length === 0) {
        message("Nothing to choose from", "The chosen ranking has no books in it yet.");
        return;
      }
      // A published article and its draft are two documents; show each article once (draft title wins).
      const usedIn = new Map<string, Set<string>>();
      const byArticle = new Map<string, { title: string; books: string[] }>();
      for (const o of data.others) {
        const baseId = o._id.replace(/^drafts\./, "");
        if (!byArticle.has(baseId) || o._id.startsWith("drafts.")) byArticle.set(baseId, { title: o.title || "Untitled article", books: o.books ?? [] });
      }
      for (const a of byArticle.values()) for (const b of a.books) (usedIn.get(b) ?? usedIn.set(b, new Set()).get(b)!).add(a.title);

      setDialog({
        type: "dialog",
        width: "large",
        header: `Choose books from ${data.rankingName ? `the ${data.rankingName} ranking` : "the ranking"}`,
        content: (
          <RankingBookPicker
            books={books}
            usedIn={usedIn}
            entries={doc?.bookEntries ?? []}
            onCancel={close}
            onSave={(entries) => {
              patch.execute([{ set: { bookEntries: entries } }]);
              close();
            }}
          />
        ),
        onClose: close,
      });
    } catch (err) {
      message("Couldn't load the ranking", `Something went wrong: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  return {
    label: loading ? "Loading books…" : "Choose books from ranking",
    disabled: loading,
    dialog,
    onHandle: () => {
      const rankingId = doc?.ranking?._ref;
      if (!rankingId) {
        message("Pick a ranking first", "Set the Ranking this article's books come from, then click this again.");
        return;
      }
      void open(rankingId);
    },
  };
}
