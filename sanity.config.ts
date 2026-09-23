/**
 * Embedded Sanity Studio config — DECISIONS.md "Sanity Studio embedded at
 * /studio, not separately hosted". See lib/sanity/groqFetch.ts for why two
 * env var naming conventions are checked here (our own .env.local vs.
 * whatever Vercel's Sanity marketplace integration auto-provisions).
 */
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
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
  plugins: [structureTool({ structure }), visionTool()],
  schema: { types: schemaTypes },
  document: {
    // Site settings is a singleton (see sanity/structure.ts) — keep it out
    // of the global "+ New document" menu so it can't be accidentally
    // duplicated from outside the pinned entry in the sidebar.
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === "global" ? prev.filter((item) => item.templateId !== "siteSettings") : prev,
    // "Fill books from ranking" on articles — DECISIONS.md, 2026-09-23.
    actions: (prev, { schemaType }) => (schemaType === "article" ? [...prev, FillFromRankingAction] : prev),
  },
});
