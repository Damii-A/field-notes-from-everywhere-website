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
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
});
