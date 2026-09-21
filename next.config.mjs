/** @type {import('next').NextConfig} */
const nextConfig = {
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
