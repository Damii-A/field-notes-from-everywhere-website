import type { StructureResolver } from "sanity/structure";

/**
 * Custom Studio sidebar — replaces the default flat, alphabetical
 * per-type list. Deliberate choices here (2026-09-23, see DECISIONS.md):
 *
 * 1. Articles are grouped by category in the sidebar (own concern from
 *    Studio-navigation friction, separate from the article-level `theme`
 *    field below — that's about hub-page grouping, not Studio navigation).
 * 2. Themes gets its own top-level section alongside Books/Tags — it's a
 *    distinct, curated vocabulary (hub-navigation groupings) from Tags
 *    (book descriptors), so it's browsed/managed separately too.
 * 3. Site settings is pinned as a true singleton (fixed document id, no
 *    "create new" for it) — it's meant to be exactly one document; the
 *    default structure would otherwise present it as a list you could
 *    accidentally create duplicates of.
 */
const ARTICLE_CATEGORIES = [
  { slug: "the-shortlist", title: "The Shortlist" },
  { slug: "what-to-read-when", title: "What to Read When" },
  { slug: "book-club-book-picks", title: "Book Club Book Picks" },
] as const;

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Articles")
        .child(
          S.list()
            .title("Articles by category")
            .items(
              ARTICLE_CATEGORIES.map((cat) =>
                S.listItem()
                  .title(cat.title)
                  .child(
                    S.documentList()
                      .title(cat.title)
                      .filter("_type == \"article\" && category == $category")
                      .params({ category: cat.slug })
                      .defaultOrdering([{ field: "publishedAt", direction: "desc" }])
                      .initialValueTemplates([S.initialValueTemplateItem("article-by-category", { category: cat.slug })]),
                  ),
              ),
            ),
        ),
      S.documentTypeListItem("theme").title("Themes"),
      S.documentTypeListItem("book").title("Books"),
      S.documentTypeListItem("ranking").title("Rankings"),
      S.documentTypeListItem("tag").title("Tags"),
      S.divider(),
      S.documentTypeListItem("legalPage").title("Legal pages"),
      S.listItem()
        .title("Site settings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
    ]);
