import type { MetadataRoute } from "next";
import { CATEGORY_LIST, getSitemapDates, getWhereToReadSlugs } from "@/lib/content";
import { SITE_URL } from "@/lib/siteUrl";

/**
 * Every date here is a real "last changed" date (DECISIONS.md, 2026-11-03): search engines
 * stop trusting a sitemap that says "changed now" on every read. Pages written in code with
 * nothing dated behind them (About, Contact) carry no date.
 */
const latest = (dates: string[]) => (dates.length ? new Date(dates.reduce((a, b) => (a > b ? a : b))) : undefined);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { articles, legal } = await getSitemapDates();
  const entries: MetadataRoute.Sitemap = [];

  // The homepage shows the newest articles, so it changes when they do.
  entries.push({ url: `${SITE_URL}/`, lastModified: latest(articles.map((a) => a.changed)) });
  for (const path of ["/about", "/contact"]) entries.push({ url: `${SITE_URL}${path}` });
  for (const slug of ["terms", "privacy-and-cookies", "disclosures"]) {
    const updatedOn = legal.find((l) => l.slug === slug)?.updatedOn;
    entries.push({ url: `${SITE_URL}/${slug}`, ...(updatedOn ? { lastModified: new Date(updatedOn) } : {}) });
  }

  for (const cat of CATEGORY_LIST) {
    const inColumn = articles.filter((a) => a.category === cat.slug);
    entries.push({ url: `${SITE_URL}/${cat.slug}`, lastModified: latest(inColumn.map((a) => a.changed)) });
    for (const a of inColumn) entries.push({ url: `${SITE_URL}/${cat.slug}/${a.slug}`, lastModified: new Date(a.changed) });
  }

  // "Where to read" pages, only for books in a published list (the others are noindex).
  for (const b of await getWhereToReadSlugs()) {
    entries.push({ url: `${SITE_URL}/where-to-read/${b.slug}`, lastModified: new Date(b.updatedAt) });
  }

  return entries;
}
