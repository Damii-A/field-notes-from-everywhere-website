import { CATEGORIES } from "./categories";
import { articlePath } from "./index";
import type { Article } from "./types";
import { SITE_URL } from "@/lib/siteUrl";

/**
 * Structured data for an article page (DECISIONS.md, 2026-11-03), invisible to readers:
 * the article itself, its books as an ordered list (each linking to its "Where to read"
 * page), and the breadcrumb trail. Book pages have their own (app/where-to-read).
 */
export function articleJsonLd(article: Article): object[] {
  const url = `${SITE_URL}${articlePath(article)}`;
  const column = CATEGORIES[article.category];
  const org = { "@type": "Organization", name: "Field Notes From Everywhere", url: SITE_URL };
  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      ...(article.description ? { description: article.description } : {}),
      ...(article.heroImage ? { image: article.heroImage.url } : {}),
      datePublished: article.publishedAt,
      author: org,
      publisher: { ...org, logo: { "@type": "ImageObject", url: `${SITE_URL}/images/logo-ghost.png` } },
      mainEntityOfPage: url,
      url,
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: article.title,
      url,
      numberOfItems: article.books.length,
      itemListOrder: column.ranked ? "https://schema.org/ItemListOrderAscending" : "https://schema.org/ItemListUnordered",
      itemListElement: article.books.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Book",
          name: b.title,
          author: { "@type": "Person", name: b.author },
          ...(b.slug ? { url: `${SITE_URL}/where-to-read/${b.slug}` } : {}),
        },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: column.name, item: `${SITE_URL}/${column.slug}` },
        { "@type": "ListItem", position: 3, name: article.title, item: url },
      ],
    },
  ];
}
