import { useEffect, useState } from "react";
import { useClient } from "sanity";
import type { RankingBook } from "./RankingBookPicker";
import { RankingTags } from "./RankingTags";

/**
 * The "Tags" tab beside a ranking's editing form (wired in sanity.config.ts): loads the
 * ranking's books with their tags, in rank order, for RankingTags. Follows the ranking as
 * edited (draft included), and reloads when the book list changes.
 */
export function RankingTagsView({ document }: { document: { displayed: { books?: { _ref: string }[] } } }) {
  const client = useClient({ apiVersion: "2025-01-01" });
  const refs = (document.displayed.books ?? []).map((b) => b._ref);
  const key = refs.join(",");
  const [books, setBooks] = useState<RankingBook[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    const ids = key ? key.split(",") : [];
    client
      .fetch<RankingBook[]>(
        `*[_id in $ids]{ _id, title, author, "cover": coverImage.asset->url, "tags": tags[]->name }`,
        { ids },
        { perspective: "published" },
      )
      .then((found) => {
        if (!live) return;
        const byId = new Map(found.map((b) => [b._id, b]));
        setBooks(ids.map((id) => byId.get(id)).filter((b): b is RankingBook => !!b));
      })
      .catch((err) => live && setError(err instanceof Error ? err.message : String(err)));
    return () => {
      live = false;
    };
  }, [client, key]);

  if (error) return <p style={{ padding: 24 }}>Couldn&rsquo;t load the tags: {error}</p>;
  if (!books) return <p style={{ padding: 24, opacity: 0.75 }}>Loading tags…</p>;
  return <RankingTags books={books} />;
}
