/**
 * Embedded Sanity Studio config — DECISIONS.md "Sanity Studio embedded at
 * /studio, not separately hosted". See lib/sanity/groqFetch.ts for why two
 * env var naming conventions are checked here (our own .env.local vs.
 * whatever Vercel's Sanity marketplace integration auto-provisions).
 */
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { defineDocuments, defineLocations, presentationTool } from "sanity/presentation";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";
import { FillFromRankingAction } from "./sanity/actions/FillFromRankingAction";

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  process.env.SANITY_STUDIO_PROJECT_ID ||
  process.env.SANITY_API_PROJECT_ID ||
  "placeholder-project-id";
const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_STUDIO_DATASET || process.env.SANITY_API_DATASET || "production";

export default defineConfig({
  name: "default",
  title: "Field Notes From Everywhere",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [
    structureTool({ structure }),
    // "Preview" — the real site, showing unpublished/scheduled content,
    // inside the Studio (DECISIONS.md, 2026-09-24). Preview is switched on
    // via app/api/draft-mode/enable, which only accepts a secret the Studio
    // itself creates for a logged-in editor.
    presentationTool({
      title: "Preview",
      previewUrl: { previewMode: { enable: "/api/draft-mode/enable", disable: "/api/draft-mode/disable" } },
      resolve: {
        mainDocuments: defineDocuments([
          { route: "/:category/:slug", filter: `_type == "article" && category == $category && slug.current == $slug` },
        ]),
        locations: {
          article: defineLocations({
            select: { title: "title", slug: "slug.current", category: "category" },
            resolve: (doc) =>
              doc?.slug && doc?.category
                ? { locations: [{ title: doc.title || "Untitled article", href: `/${doc.category}/${doc.slug}` }] }
                : null,
          }),
        },
      },
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
    // Lets each category's article list in the sidebar create articles with
    // that category already set (sanity/structure.ts) — without it a new
    // article there starts with no category, so it doesn't even appear in
    // the list it was created from.
    templates: (prev) => [
      ...prev,
      {
        id: "article-by-category",
        title: "Article in category",
        schemaType: "article",
        parameters: [{ name: "category", type: "string" }],
        value: ({ category }: { category: string }) => ({ category }),
      },
    ],
  },
  document: {
    // Site settings is a singleton (see sanity/structure.ts) — keep it out
    // of the global "+ New document" menu so it can't be accidentally
    // duplicated from outside the pinned entry in the sidebar.
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === "global" ? prev.filter((item) => item.templateId !== "siteSettings" && item.templateId !== "article-by-category") : prev,
    // "Fill books from ranking" on articles — DECISIONS.md, 2026-09-23.
    actions: (prev, { schemaType }) => (schemaType === "article" ? [...prev, FillFromRankingAction] : prev),
  },
});
