import { useMemo, useState } from "react";
import type { RankingBook } from "./RankingBookPicker";

/**
 * The "Tags" tab on a ranking (sanity/components/RankingTagsView.tsx): every tag on the
 * ranking's books with how many books carry it, most-used first or A–Z (A–Z puts look-alike
 * tags such as "Plot Twist" / "Plot Twist Ending" side by side). Clicking a tag lists its books
 * in rank order. For planning tag-focused lists within one ranking (DECISIONS.md, 2026-10-28).
 * Display only. No Sanity imports, so it can be rendered and tested on its own.
 */
export function RankingTags({ books }: { books: RankingBook[] }) {
  const [sort, setSort] = useState<"count" | "az">("count");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<Set<string>>(new Set());

  const tags = useMemo(() => {
    const byTag = new Map<string, (RankingBook & { rank: number })[]>();
    books.forEach((b, i) => {
      for (const t of b.tags ?? []) {
        if (!byTag.has(t)) byTag.set(t, []);
        byTag.get(t)!.push({ ...b, rank: i + 1 });
      }
    });
    return [...byTag];
  }, [books]);

  const q = search.trim().toLowerCase();
  const shown = tags
    .filter(([tag]) => !q || tag.toLowerCase().includes(q))
    .sort((a, b) => (sort === "count" ? b[1].length - a[1].length : 0) || a[0].localeCompare(b[0], undefined, { sensitivity: "base" }));

  const toggle = (tag: string) => {
    const next = new Set(open);
    if (next.has(tag)) next.delete(tag);
    else next.add(tag);
    setOpen(next);
  };

  const pill = (active: boolean): React.CSSProperties => ({
    border: "1px solid currentColor",
    borderRadius: 999,
    padding: "3px 12px",
    fontSize: 13,
    cursor: "pointer",
    background: active ? "rgba(128,128,128,0.3)" : "transparent",
    color: "inherit",
    opacity: active ? 1 : 0.75,
  });

  const untagged = books.filter((b) => !b.tags?.length).length;

  return (
    <div style={{ padding: 24, lineHeight: 1.45, fontSize: 14, maxWidth: 820 }}>
      <p style={{ margin: "0 0 4px" }}>
        <strong>{tags.length} tags</strong> across this ranking&rsquo;s {books.length} books. Click a tag to see its books.
      </p>
      {untagged > 0 ? (
        <p style={{ margin: "0 0 4px", fontSize: 13, opacity: 0.8 }}>
          {untagged} book{untagged === 1 ? " has" : "s have"} no tags yet.
        </p>
      ) : null}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", margin: "12px 0 16px" }}>
        <button type="button" style={pill(sort === "count")} aria-pressed={sort === "count"} onClick={() => setSort("count")}>
          Most books
        </button>
        <button type="button" style={pill(sort === "az")} aria-pressed={sort === "az"} onClick={() => setSort("az")}>
          A–Z
        </button>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Find a tag…"
          aria-label="Find a tag"
          style={{ font: "inherit", fontSize: 13, padding: "4px 10px", borderRadius: 999, border: "1px solid rgba(128,128,128,0.5)", background: "transparent", color: "inherit", minWidth: 180 }}
        />
        {open.size > 0 ? (
          <button type="button" style={{ ...pill(false), borderStyle: "dashed" }} onClick={() => setOpen(new Set())}>
            Close all
          </button>
        ) : null}
      </div>
      <div style={{ borderTop: "1px solid rgba(128,128,128,0.3)" }}>
        {shown.map(([tag, tagBooks]) => {
          const isOpen = open.has(tag);
          return (
            <div key={tag} style={{ borderBottom: "1px solid rgba(128,128,128,0.2)" }}>
              <button
                type="button"
                onClick={() => toggle(tag)}
                aria-expanded={isOpen}
                style={{ display: "flex", width: "100%", gap: 12, alignItems: "baseline", padding: "8px 4px", background: "none", border: 0, color: "inherit", font: "inherit", cursor: "pointer", textAlign: "left" }}
              >
                <span style={{ minWidth: 30, fontWeight: 600, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>{tagBooks.length}</span>
                <span style={{ flex: 1 }}>
                  {tag}
                  {tagBooks.length === books.length ? <span style={{ fontSize: 12, opacity: 0.7 }}> · on every book</span> : null}
                </span>
                <span aria-hidden style={{ opacity: 0.6 }}>{isOpen ? "▾" : "▸"}</span>
              </button>
              {isOpen ? (
                <ol style={{ listStyle: "none", margin: "0 0 10px", padding: "0 0 0 42px" }}>
                  {tagBooks.map((b) => (
                    <li key={b._id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "4px 0" }}>
                      <span style={{ minWidth: 28, fontWeight: 600, opacity: 0.7 }}>#{b.rank}</span>
                      {b.cover ? (
                        // eslint-disable-next-line @next/next/no-img-element -- Studio UI, not a site page: next/image doesn't apply here
                        <img src={`${b.cover}?w=56`} alt="" width={28} style={{ width: 28, height: "auto", borderRadius: 2, flex: "none" }} />
                      ) : (
                        <span style={{ width: 28, height: 42, background: "rgba(128,128,128,0.25)", borderRadius: 2, flex: "none" }} />
                      )}
                      <span>
                        <strong>{b.title}</strong>
                        {b.author ? <span style={{ opacity: 0.75 }}> · {b.author}</span> : null}
                      </span>
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>
          );
        })}
        {shown.length === 0 ? <p style={{ padding: "12px 4px", opacity: 0.75 }}>{tags.length === 0 ? "No tags on these books yet." : "No tag matches that search."}</p> : null}
      </div>
    </div>
  );
}
