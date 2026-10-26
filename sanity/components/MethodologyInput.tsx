import { useState } from "react";
import { set, useClient, useFormValue, type TextInputProps } from "sanity";
import { methodologyPattern } from "../lib/methodologyPattern";

/**
 * The article's "Methodology sentence" box with a "Write draft sentence" button
 * above it: fills in the pattern for the article's column/format
 * (sanity/lib/methodologyPattern.ts) with the ranking's theme and size and the
 * article's book count. The editor fills in the [bracketed] parts.
 */
export function MethodologyInput(props: TextInputProps) {
  const client = useClient({ apiVersion: "2025-01-01" });
  const category = useFormValue(["category"]) as string | undefined;
  const format = useFormValue(["format"]) as string | undefined;
  const ranking = useFormValue(["ranking"]) as { _ref?: string } | undefined;
  const entries = useFormValue(["bookEntries"]) as unknown[] | undefined;
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function draft() {
    setBusy(true);
    setNote(null);
    try {
      const r = ranking?._ref
        ? await client.fetch<{ name: string | null; size: number | null } | null>(`*[_id == $id][0]{ name, "size": count(books) }`, { id: ranking._ref })
        : null;
      const result = methodologyPattern({ category, format, rankingName: r?.name ?? null, rankingSize: r?.size ?? null, bookCount: entries?.length ?? 0 });
      if ("problem" in result) {
        setNote(result.problem);
        return;
      }
      if (props.value?.trim() && !window.confirm("Replace the current sentence with a fresh draft?")) return;
      props.onChange(set(result.sentence));
      setNote(
        `Fill in the [bracketed] parts (for the theme, the natural wording, e.g. "thrillers").${entries?.length ? "" : " Add the books first so the count is filled in."}`,
      );
    } catch (err) {
      setNote(`Couldn't write a draft: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={draft}
          disabled={busy || props.readOnly}
          style={{ border: "1px solid currentColor", borderRadius: 999, padding: "4px 12px", fontSize: 13, background: "transparent", color: "inherit", cursor: "pointer", opacity: 0.85 }}
        >
          {busy ? "Writing…" : "Write draft sentence"}
        </button>
        {note ? <span style={{ fontSize: 12, opacity: 0.8 }}>{note}</span> : null}
      </div>
      {props.renderDefault(props)}
    </div>
  );
}
