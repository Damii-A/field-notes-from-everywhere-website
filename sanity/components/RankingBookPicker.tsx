import { useMemo, useState } from "react";

/** A book in a ranking, as the picker shows it. */
export interface RankingBook {
  _id: string;
  title: string;
  author: string | null;
  cover: string | null;
  tags: string[] | null;
}

/** The parts of an article's book entry the picker reads (overrides are kept untouched). */
export interface BookEntryRef {
  _key: string;
  book?: { _ref: string };
}

function randomKey() {
  return Math.random().toString(36).slice(2, 12);
}

/**
 * The tick-box list behind "Choose books from ranking" (sanity/actions/ChooseBooksAction.tsx):
 * the ranking's books in rank order with cover and tags, a tag filter (books with any chosen
 * tag), and an "Also in" note for books other articles from the ranking already use.
 * Saving keeps existing entries (order, blurb/tag overrides) unless unticked and appends newly
 * ticked books in rank order; entries for books outside the ranking are left alone.
 * No Sanity imports, so it can be rendered and tested on its own.
 */
export function RankingBookPicker({
  books,
  usedIn,
  entries,
  onCancel,
  onSave,
}: {
  books: RankingBook[];
  usedIn: Map<string, Set<string>>;
  entries: BookEntryRef[];
  onCancel: () => void;
  onSave: (entries: object[]) => void;
}) {
  const inRanking = useMemo(() => new Set(books.map((b) => b._id)), [books]);
  const [selected, setSelected] = useState(() => new Set(entries.map((e) => e.book?._ref).filter((r): r is string => !!r && inRanking.has(r))));
  const [filter, setFilter] = useState<Set<string>>(new Set());
  const outsideCount = entries.filter((e) => !e.book?._ref || !inRanking.has(e.book._ref)).length;

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const b of books) for (const t of b.tags ?? []) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [books]);

  // Tags on a single book are most of the list; tuck them behind a button (chosen ones always stay visible).
  const [allTags, setAllTags] = useState(false);
  const shownTags = tagCounts.filter(([tag, n]) => allTags || n > 1 || filter.has(tag));
  const hiddenTagCount = tagCounts.length - shownTags.length;

  const visible = books
    .map((b, i) => ({ ...b, rank: i + 1 }))
    .filter((b) => filter.size === 0 || (b.tags ?? []).some((t) => filter.has(t)));

  const toggle = <T,>(set: Set<T>, value: T) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  };

  function save() {
    // Keep existing entries (order, blurb/tag overrides) unless unticked; add newly ticked books in rank order.
    const kept = entries.filter((e) => !e.book?._ref || !inRanking.has(e.book._ref) || selected.has(e.book._ref));
    const existing = new Set(kept.map((e) => e.book?._ref));
    const added = books
      .filter((b) => selected.has(b._id) && !existing.has(b._id))
      .map((b) => ({ _type: "bookEntry", _key: randomKey(), book: { _type: "reference", _ref: b._id } }));
    onSave([...kept, ...added]);
  }

  const pill = (active: boolean) => ({
    border: "1px solid currentColor",
    borderRadius: 999,
    padding: "3px 10px",
    fontSize: 12,
    cursor: "pointer",
    background: active ? "rgba(128,128,128,0.3)" : "transparent",
    color: "inherit",
    opacity: active ? 1 : 0.75,
  });

  return (
    <div style={{ padding: "0 4px", lineHeight: 1.45, fontSize: 14 }}>
      <p style={{ margin: "0 0 10px" }}>
        Tick the books you want in this article. New ones are added at the end in rank order; drag to reorder afterwards.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
        {shownTags.map(([tag, n]) => (
          <button key={tag} type="button" style={pill(filter.has(tag))} onClick={() => setFilter(toggle(filter, tag))} aria-pressed={filter.has(tag)}>
            {tag} ({n})
          </button>
        ))}
        {hiddenTagCount > 0 || allTags ? (
          <button type="button" style={{ ...pill(false), borderStyle: "dashed" }} onClick={() => setAllTags(!allTags)}>
            {allTags ? "Show fewer tags" : `+ ${hiddenTagCount} more tags (one book each)`}
          </button>
        ) : null}
      </div>
      <p style={{ margin: "0 0 12px", fontSize: 12, opacity: 0.75 }}>
        {filter.size === 0 ? (
          "Click tags to show only books that have any of them."
        ) : (
          <>
            Showing {visible.length} of {books.length} books with any of the chosen tags.{" "}
            <button type="button" style={{ ...pill(false), padding: "1px 8px" }} onClick={() => setFilter(new Set())}>
              Clear filter
            </button>
          </>
        )}
      </p>
      <div style={{ maxHeight: "55vh", overflowY: "auto", borderTop: "1px solid rgba(128,128,128,0.3)" }}>
        {visible.map((b) => {
          const others = usedIn.get(b._id);
          return (
            <label
              key={b._id}
              style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 4px", borderBottom: "1px solid rgba(128,128,128,0.2)", cursor: "pointer" }}
            >
              <input type="checkbox" checked={selected.has(b._id)} onChange={() => setSelected(toggle(selected, b._id))} style={{ marginTop: 4 }} />
              <span style={{ minWidth: 28, fontWeight: 600, opacity: 0.7 }}>#{b.rank}</span>
              {b.cover ? (
                // eslint-disable-next-line @next/next/no-img-element -- Studio UI, not a site page: next/image doesn't apply here
                <img src={`${b.cover}?w=80`} alt="" width={40} style={{ width: 40, height: "auto", borderRadius: 2, flex: "none" }} />
              ) : (
                <span style={{ width: 40, height: 60, background: "rgba(128,128,128,0.25)", borderRadius: 2, flex: "none" }} />
              )}
              <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <span>
                  <strong>{b.title}</strong>
                  {b.author ? <span style={{ opacity: 0.75 }}> · {b.author}</span> : null}
                </span>
                {b.tags?.length ? <span style={{ fontSize: 12, opacity: 0.75 }}>{b.tags.join(" · ")}</span> : null}
                {others ? <span style={{ fontSize: 12, fontStyle: "italic", opacity: 0.85 }}>Also in: {[...others].join("; ")}</span> : null}
              </span>
            </label>
          );
        })}
      </div>
      {outsideCount > 0 ? (
        <p style={{ margin: "10px 0 0", fontSize: 12, opacity: 0.75 }}>
          {outsideCount} book{outsideCount === 1 ? "" : "s"} in this article {outsideCount === 1 ? "isn't" : "aren't"} from this ranking and will stay as{" "}
          {outsideCount === 1 ? "it is" : "they are"}.
        </p>
      ) : null}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10, marginTop: 14 }}>
        <span style={{ marginRight: "auto", fontSize: 13 }}>{selected.size + outsideCount} books selected</span>
        <button type="button" style={{ ...pill(false), fontSize: 14, padding: "6px 14px" }} onClick={onCancel}>
          Cancel
        </button>
        <button type="button" style={{ ...pill(true), fontSize: 14, padding: "6px 14px", fontWeight: 600 }} onClick={save}>
          Save to article
        </button>
      </div>
    </div>
  );
}
