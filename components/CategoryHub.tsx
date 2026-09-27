"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "./ds/Button";
import { ImagePlaceholder } from "./ImagePlaceholder";
import styles from "./CategoryHub.module.css";
import { CATEGORIES } from "@/lib/content/categories"; // not "@/lib/content": that pulls server-only fetching into this client component
import { formatArticleDate } from "@/lib/content/dates";
import { HUB_INITIAL_COUNT, HUB_PAGE_INCREMENT } from "@/lib/content/hubPaging";
import type { HubPage } from "@/lib/content";
import type { CategorySlug } from "@/lib/content";

const IDENTITY_COLOR: Record<CategorySlug, { band: string; name: string; leadLabel: string; leadBg: string; leadTitle: string; leadMeta: string }> = {
  "the-shortlist": {
    band: "var(--sage-700)",
    name: "var(--paper-050)",
    leadLabel: "var(--ink-800)",
    leadBg: "var(--sage-500)",
    leadTitle: "var(--ink-900)",
    leadMeta: "var(--ink-700)",
  },
  "what-to-read-when": {
    band: "var(--paper-100)",
    name: "var(--ink-700)",
    leadLabel: "var(--ink-800)",
    leadBg: "var(--oat-200)",
    leadTitle: "var(--ink-900)",
    leadMeta: "var(--ink-700)",
  },
  "book-club-book-picks": {
    band: "var(--paper-050)",
    name: "var(--slate-600)",
    leadLabel: "var(--sky-200)",
    leadBg: "var(--slate-600)",
    leadTitle: "var(--sky-100)",
    leadMeta: "var(--sky-100)",
  },
};

export function CategoryHub({ category, hub }: { category: CategorySlug; hub: HubPage }) {
  const def = CATEGORIES[category];
  const colors = IDENTITY_COLOR[category];
  const [shown, setShown] = useState(HUB_INITIAL_COUNT);
  const visible = hub.articles.slice(0, shown);
  const moreLeft = shown < hub.articles.length;

  return (
    <div style={{ background: def.identity.pageBg }}>
      <section className={styles.identityBand} style={{ background: colors.band }}>
        <div className={styles.identityInner}>
          <h1 className={styles.identityName} style={{ color: colors.name }}>
            {def.name}
          </h1>
          <p className={styles.identityDescription} style={{ color: colors.name }}>
            {def.description}
          </p>
        </div>
      </section>

      {/* The Shortlist's lead is square and unshadowed (as designed), full-bleed on wider screens and inset on phones (CSS). */}
      {hub.latest ? (
        <section
          className={[styles.leadSection, category === "the-shortlist" ? styles.leadSectionFlush : "", visible.length === 0 ? styles.leadSectionLast : ""].filter(Boolean).join(" ")}
        >
          <Link
            href={`/${category}/${hub.latest.slug}`}
            className={category === "the-shortlist" ? `${styles.leadCard} ${styles.leadCardFlush}` : styles.leadCard}
          >
            <div className={styles.leadImage}>
              <ImagePlaceholder label="Lead article image" src={hub.latest.heroImage?.url} position={hub.latest.heroImage?.position} alt={hub.latest.heroImage?.alt} />
            </div>
            <div className={styles.leadBody} style={{ background: colors.leadBg }}>
              <span className={styles.leadLabel} style={{ color: colors.leadLabel }}>
                Newest in {def.name}
              </span>
              <h2 className={styles.leadTitle} style={{ color: colors.leadTitle }}>
                {hub.latest.title}
              </h2>
              <p className={styles.leadMeta} style={{ color: colors.leadMeta }}>
                {hub.latest.description}
              </p>
              <span className={styles.leadMeta} style={{ color: colors.leadMeta }}>
                By {hub.latest.author} · {formatArticleDate(hub.latest.publishedAt)} ·{" "}
                {hub.latest.books.length} books
              </span>
            </div>
          </Link>
        </section>
      ) : null}

      {visible.length > 0 || !hub.latest ? (
      <section className={styles.allSection}>
        <div className={styles.allInner}>
          <h2 className={styles.allHeading}>All articles</h2>
          {visible.length > 0 ? (
            <>
              <div className={styles.allGrid}>
                {visible.map((a) => (
                  <Link key={a.slug} href={`/${category}/${a.slug}`} className={styles.card}>
                    <div className={styles.cardImage}>
                      <ImagePlaceholder label="Article image" src={a.heroImage?.url} position={a.heroImage?.position} alt={a.heroImage?.alt} />
                    </div>
                    <span className={styles.cardTitle}>{a.title}</span>
                    <span className={styles.cardMeta}>{a.meta}</span>
                  </Link>
                ))}
              </div>
              {moreLeft ? (
                <div className={styles.seeMoreRow}>
                  <Button tone="outline" size="md" onClick={() => setShown((s) => Math.min(hub.articles.length, s + HUB_PAGE_INCREMENT))}>
                    See more
                  </Button>
                </div>
              ) : null}
            </>
          ) : !hub.latest ? (
            <p style={{ font: "var(--type-body)", color: "var(--ink-700)" }}>
              New articles are on their way — check back soon.
            </p>
          ) : null}
        </div>
      </section>
      ) : null}
    </div>
  );
}
