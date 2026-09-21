import type { MetadataRoute } from "next";
import { CATEGORY_LIST, getHubArticles } from "@/lib/content";
import { SITE_URL } from "@/lib/siteUrl";

const STATIC_ROUTES = ["/", "/about", "/contact", "/the-reading-room", "/terms", "/privacy-and-cookies", "/disclosures"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  for (const cat of CATEGORY_LIST) {
    entries.push({ url: `${SITE_URL}/${cat.slug}`, lastModified: new Date() });
    const hub = await getHubArticles(cat.slug);
    if (hub.latest) {
      entries.push({ url: `${SITE_URL}/${cat.slug}/${hub.latest.slug}`, lastModified: new Date(hub.latest.publishedAt) });
    }
    for (const a of hub.articles) {
      entries.push({ url: `${SITE_URL}/${cat.slug}/${a.slug}` });
    }
  }

  return entries;
}
