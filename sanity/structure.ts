import { distinctUntilChanged, map } from "rxjs";
import type { StructureBuilder, StructureResolver } from "sanity/structure";
import { POST_IDEA_STATUS_QUERY, sortPostIdeas, type PostIdeaStatusRow, type PostIdeaTheme } from "./lib/postIdeaStatus";

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
  { slug: "up-next", title: "Up Next" },
] as const;

/** One of a theme's Post ideas lists; view-only, so no "create new" button. */
const postIdeaList = (S: StructureBuilder, id: string, title: string, ids: string[]) =>
  S.listItem()
    .id(id)
    .title(`${title} (${ids.length})`)
    .child(
      S.documentList()
        .id(id)
        .title(title)
        .schemaType("postIdea")
        .filter('_type == "postIdea" && _id in $ids')
        .apiVersion("2025-01-01")
        .params({ ids })
        .defaultOrdering([{ field: "sentAt", direction: "desc" }])
        .initialValueTemplates([]),
    );

/** A theme (e.g. Thriller), opening onto its lists. */
const postIdeaTheme = (S: StructureBuilder, { id, name, total, status }: PostIdeaTheme) =>
  S.listItem()
    .id(`postIdeas-${id}`)
    .title(`${name} (${total})`)
    .child(
      S.list()
        .id(`postIdeas-${id}`)
        .title(name)
        .items([
          postIdeaList(S, `postIdeas-${id}-notStarted`, "Not started", status.notStarted),
          postIdeaList(S, `postIdeas-${id}-inProgress`, "In progress", status.inProgress),
          postIdeaList(S, `postIdeas-${id}-deferred`, "Deferred", status.deferred),
          postIdeaList(S, `postIdeas-${id}-published`, "Published", status.published),
        ]),
    );

export const structure: StructureResolver = (S, { documentStore }) =>
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
              ).concat(
                // Safety net: an article with no category appears in none of
                // the lists above, so it would otherwise be unfindable here.
                S.listItem()
                  .title("No category (set one to file it)")
                  .child(S.documentList().title("No category").filter('_type == "article" && !defined(category)')),
              ),
            ),
        ),
      // Sent from the internal tool; view-only here (DECISIONS.md, 2026-11-03). Grouped by
      // theme, then status, live, from raw documents (see postIdeaStatus.ts; DECISIONS.md,
      // 2026-11-04). "Theme" here is the idea's ranking, not the Themes section below.
      S.listItem()
        .id("postIdeas")
        .title("Post ideas")
        .child(() =>
          documentStore
            .listenQuery(POST_IDEA_STATUS_QUERY, {}, { tag: "post-idea-status", apiVersion: "2025-01-01", perspective: "raw", throttleTime: 1000 })
            .pipe(
              map((rows) => sortPostIdeas(rows as PostIdeaStatusRow[])),
              // Article edits re-run the query; only redraw when an idea changes list.
              distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
              map((themes) =>
                S.list()
                  .id("postIdeas")
                  .title("Post ideas")
                  .items(themes.map((theme) => postIdeaTheme(S, theme))),
              ),
            ),
        ),
      S.documentTypeListItem("readingRoomIssue").title("Reading Room issues"),
      S.listItem()
        .title("Weekly newsletters")
        .child(S.documentTypeList("weeklyNewsletter").title("Weekly newsletters").defaultOrdering([{ field: "sendDate", direction: "desc" }])),
      S.divider(),
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
