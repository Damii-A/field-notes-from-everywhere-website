import Link from "next/link";
import styles from "./Header.module.css";
import { CATEGORY_LIST } from "@/lib/content";
import type { CategorySlug } from "@/lib/content";

export interface HeaderProps {
  /** Which category nav link (if any) is the "you are here" state — ported
   * from Site Header.dc.html's `active` prop. */
  active?: CategorySlug;
}

/** Ported from the design's `Site Header.dc.html`, imported on every page. */
export function Header({ active }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.brandRow}>
        <Link href="/" className={styles.brand}>
          Field&nbsp;Notes
          <br />
          From&nbsp;Everywhere
        </Link>
      </div>
      <nav className={styles.nav}>
        {CATEGORY_LIST.map((cat) => (
          <Link
            key={cat.slug}
            href={`/${cat.slug}`}
            className={`${styles.navLink} ${active === cat.slug ? styles.navLinkActive : ""}`}
          >
            {cat.name}
          </Link>
        ))}
        <span className={styles.divider} aria-hidden="true" />
        <Link href="/the-reading-room" className={styles.readingRoomPill}>
          The Reading Room
        </Link>
      </nav>
    </header>
  );
}
