/**
 * Sanity client — not wired into lib/content/index.ts yet (that module
 * still serves mock data, see CURRENT_STATE.md). Ready for when a project
 * exists: swap the mock implementations in lib/content/index.ts for GROQ
 * queries using this client, one function at a time.
 */
import { createClient } from "@sanity/client";

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2025-01-01",
  useCdn: true,
});
