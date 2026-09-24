"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";
import { Icon } from "./ds/Icon";
import { CATEGORY_LIST } from "@/lib/content/categories"; // not "@/lib/content": that pulls server-only fetching into this client component
import type { CategorySlug } from "@/lib/content";

export interface HeaderProps {
  /** Which category nav link (if any) is the "you are here" state — ported
   * from Site Header.dc.html's `active` prop. */
  active?: CategorySlug;
}

/**
 * Ported from the design's `Site Header.dc.html`, imported on every page.
 * On phones (≤700px) the nav collapses behind a menu button — the user's
 * choice after the mobile-guide review (DECISIONS.md, 2026-09-24); the design
 * itself only shows the desktop header. Desktop is unchanged.
 */
export function Header({ active }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={styles.header}>
      <div className={styles.brandRow}>
        <Link href="/" className={styles.brand}>
          Field&nbsp;Notes
          <br />
          From&nbsp;Everywhere
        </Link>
        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={open}
          aria-controls="site-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <Icon name={open ? "x" : "menu"} size={24} />
        </button>
      </div>
      <nav id="site-nav" className={`${styles.nav} ${open ? styles.navOpen : ""}`} aria-label="Main">
        {CATEGORY_LIST.map((cat) => (
          <Link
            key={cat.slug}
            href={`/${cat.slug}`}
            onClick={() => setOpen(false)}
            className={`${styles.navLink} ${active === cat.slug ? styles.navLinkActive : ""}`}
            aria-current={active === cat.slug ? "page" : undefined}
          >
            {cat.name}
          </Link>
        ))}
        <span className={styles.divider} aria-hidden="true" />
        <Link href="/the-reading-room" onClick={() => setOpen(false)} className={styles.readingRoomPill}>
          The Reading Room
        </Link>
      </nav>
    </header>
  );
}
