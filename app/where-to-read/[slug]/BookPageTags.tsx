"use client";

import { useState } from "react";
import styles from "./WhereToRead.module.css";

/**
 * The "About" section's tags: the first `shown`, then a "+N more" pill that expands the rest in
 * place ("Show fewer" folds them back), as under books in articles (user, 2026-11-03).
 */
export function BookPageTags({ tags, shown }: { tags: string[]; shown: number }) {
  const [open, setOpen] = useState(false);
  const hidden = Math.max(0, tags.length - shown);
  const visible = open || hidden === 0 ? tags : tags.slice(0, shown);
  return (
    <ul className={styles.tags} aria-label="Tags">
      {visible.map((t) => (
        <li key={t} className={styles.tag}>
          {t}
        </li>
      ))}
      {hidden > 0 ? (
        <li>
          <button type="button" className={`${styles.tag} ${styles.moreTags}`} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            {open ? "Show fewer" : `+${hidden} more`}
          </button>
        </li>
      ) : null}
    </ul>
  );
}
