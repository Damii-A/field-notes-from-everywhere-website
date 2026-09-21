/** Site's own public URL, used for building absolute links (sitemap, robots, RSS feed). Trailing slash stripped so callers can safely do `${SITE_URL}/path`. */
export const SITE_URL = (process.env.SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
