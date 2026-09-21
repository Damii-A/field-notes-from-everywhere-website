/**
 * Catch-all route that mounts the embedded Sanity Studio at /studio —
 * DECISIONS.md "Sanity Studio embedded". See StudioLoader.tsx and
 * StudioClient.tsx for why this is split across two client components
 * instead of one direct import here: this server file must never
 * statically import `sanity`/`next-sanity/studio` (that crashed Next's
 * build-time page-data collection with a React-instance mismatch), and
 * `ssr: false` on next/dynamic is only usable from a Client Component.
 */
import StudioLoader from "./StudioLoader";

export const dynamic = "force-static";

export default function StudioPage() {
  return <StudioLoader />;
}
