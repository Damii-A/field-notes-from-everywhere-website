/** @type {import('next').NextConfig} */
const nextConfig = {
  // NEXT_PUBLIC_SANITY_PROJECT_ID/DATASET must be defined for the embedded
  // Studio (sanity.config.ts) to work at all — it's pure client-side code,
  // and Next.js only inlines NEXT_PUBLIC_* vars into the browser bundle.
  // Vercel's Sanity marketplace integration provisions SANITY_STUDIO_*/
  // SANITY_API_* instead (server-only names), which groqFetch.ts can read
  // fine at request time but the client Studio bundle never can, no matter
  // how those vars are scoped in Vercel's dashboard. Resolving the fallback
  // here, at build time (where all of these ARE readable), and re-exposing
  // it under the NEXT_PUBLIC_ name is what actually makes it reach the
  // browser — the fallback inside sanity.config.ts itself can't do this,
  // since Next.js's client-var inlining only recognizes NEXT_PUBLIC_-
  // prefixed `process.env.X` references it can statically resolve.
  env: {
    NEXT_PUBLIC_SANITY_PROJECT_ID:
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID || process.env.SANITY_API_PROJECT_ID,
    NEXT_PUBLIC_SANITY_DATASET:
      process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_STUDIO_DATASET || process.env.SANITY_API_DATASET,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  // /feed.xml is the public-facing URL (what Kit's RSS automation should
  // use), rewritten to the actual route at app/rss/route.ts — see that
  // file's comment for why it isn't just named app/feed.xml/route.ts.
  async rewrites() {
    return [{ source: "/feed.xml", destination: "/rss" }];
  },
};

export default nextConfig;
