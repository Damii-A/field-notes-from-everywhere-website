import type { StructureResolver } from "sanity/structure";

/**
 * Custom Studio sidebar — replaces the default flat, alphabetical
 * per-type list. Two deliberate choices here (2026-09-23, see DECISIONS.md):
 *
 * 1. Articles are grouped by category, not Tags — the eventual hub-page
 *    "grouped by category" browsing (pub_hub.md) is a frontend concern that
 *    doesn't need mirroring in the Studio's own organization; grouping the
 *    thing the author actually works with most (articles, one at a time,
 *    per column) is what actually reduces friction while authoring.
 * 2. Site settings is pinned as a true singleton (fixed document id, no
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
                      .defaultOrdering([{ field: "publishedAt", direction: "desc" }]),
                  ),
              ),
            ),
        ),
      S.documentTypeListItem("book").title("Books"),
      S.documentTypeListItem("tag").title("Tags"),
      S.divider(),
      S.documentTypeListItem("legalPage").title("Legal pages"),
      S.listItem()
        .title("Site settings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
    ]);
