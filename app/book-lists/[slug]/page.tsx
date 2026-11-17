import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { JsonLd } from "@/components/JsonLd";
import { getRankingListsPage, rankingListsPath, type RankingListsPage } from "@/lib/content";
import { CATEGORIES } from "@/lib/content/categories";
import { pageMetadata } from "@/lib/metadata";
import { SITE_URL } from "@/lib/siteUrl";
import hub from "@/components/CategoryHub.module.css";
import styles from "./RankingLists.module.css";

/**
 * "{Ranking} book lists" (user, 2026-11-17; not in the design): every live article made from
 * one ranking, grouped by column, at /<slug>-book-lists (next.config.mjs rewrites it here;
 * /book-lists/<slug> redirects there). Linked from the ranking pill under each article's
 * title and the footer. /books/<slug> is left free for a possible page of just books.
 */
export const revalidate = 300;

export async function generateStaticParams() {
  return []; // built on first visit, then cached
}

const intro = (p: RankingListsPage) =>
  p.intro ??
  `Every ${p.name} book list we've published, in one place. Each one starts from the same research: ${
    p.recommendationCount ? `${p.recommendationCount.toLocaleString("en-US")} reader recommendations` : "real reader recommendations"
  } we analysed to find the most-recommended ${p.name} books.`;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = await getRankingListsPage((await params).slug);
  if (!page) return {};
  return pageMetadata({ title: `${page.name} Book Lists`, description: intro(page), path: rankingListsPath(page.slug) });
}

export default async function RankingListsPageView({ params }: { params: Promise<{ slug: string }> }) {
  const page = await getRankingListsPage((await params).slug);
  if (!page) notFound();
  const url = `${SITE_URL}${rankingListsPath(page.slug)}`;
  const items = page.groups.flatMap((g) => g.articles.map((a) => ({ ...a, url: `${SITE_URL}/${a.category}/${a.slug}` })));

  return (
    <>
      <Header />
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${page.name} Book Lists`,
            description: intro(page),
            url,
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: items.length,
              itemListElement: items.map((a, i) => ({ "@type": "ListItem", position: i + 1, url: a.url, name: a.title })),
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
              { "@type": "ListItem", position: 2, name: `${page.name} Book Lists`, item: url },
            ],
          },
        ]}
      />
      <main style={{ background: "var(--paper-100)" }}>
        <section className={hub.identityBand} style={{ background: "var(--paper-050)" }}>
          <div className={hub.identityInner}>
            <h1 className={`${hub.identityName} ${styles.name}`} style={{ color: "var(--ink-900)" }}>
              {page.name} Book Lists
            </h1>
            <p className={hub.identityDescription} style={{ color: "var(--ink-700)" }}>
              {intro(page)}
            </p>
          </div>
        </section>

        {page.groups.map((g) => {
          const def = CATEGORIES[g.category];
          return (
            <section key={g.category} className={styles.group} style={{ background: def.identity.pageBg }}>
              <div className={hub.allInner}>
                <div className={styles.groupHead}>
                  <h2 className={hub.allHeading} style={{ margin: 0 }}>
                    <Link href={`/${g.category}`} className={styles.groupLink} style={{ color: def.identity.accent }}>
                      {def.name}
                    </Link>
                  </h2>
                  <span className={styles.count}>
                    {g.articles.length} {g.articles.length === 1 ? "list" : "lists"}
                  </span>
                </div>
                <div className={hub.allGrid}>
                  {g.articles.map((a) => (
                    <Link key={a.slug} href={`/${a.category}/${a.slug}`} className={hub.card}>
                      <div className={hub.cardImage}>
                        <ImagePlaceholder label="Article image" src={a.heroImage?.url} position={a.heroImage?.position} alt={a.heroImage?.alt} />
                      </div>
                      <span className={hub.cardTitle}>{a.title}</span>
                      <span className={hub.cardMeta}>{a.meta}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </main>
      <Footer />
    </>
  );
}
