import type { Metadata } from "next";

/**
 * Share-preview (Open Graph + X card) tags for every page. Next.js replaces
 * a parent's `openGraph`/`twitter` objects rather than merging them, so each
 * page builds the full set through `pageMetadata` instead of relying on the
 * layout's defaults. Relative URLs resolve against `metadataBase` (SITE_URL).
 */
export const SITE_NAME = "Field Notes From Everywhere";
export const SITE_DESCRIPTION =
  "Book recommendations, backed by real reader discussions. The Field Notes From Everywhere Publication and The Reading Room.";

type ShareImage = { url: string; width?: number; height?: number; alt?: string };

// The homepage illustration on the site's ivory, sized for share cards (1200 × 630).
export const DEFAULT_SHARE_IMAGE: ShareImage = {
  url: "/images/share-default.png",
  width: 1200,
  height: 630,
  alt: "A watercolour illustration of a stack of four books",
};

interface PageMetadataInput {
  /** Page title (the layout adds " · Field Notes From Everywhere" to <title>); omit for the homepage. */
  title?: string;
  /** Meta description; the site description is used for share cards when omitted. */
  description?: string;
  /** The page's path, e.g. "/about". */
  path: string;
  image?: ShareImage;
  /** Articles only: marks the page as an article with its publish time. */
  publishedTime?: string;
}

export function pageMetadata({ title, description, path, image, publishedTime }: PageMetadataInput): Metadata {
  const shareTitle = title ?? SITE_NAME;
  const shareDescription = description ?? SITE_DESCRIPTION;
  const images = [image ?? DEFAULT_SHARE_IMAGE];
  const common = { title: shareTitle, description: shareDescription, url: path, siteName: SITE_NAME, locale: "en_US", images };
  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    openGraph: publishedTime ? { ...common, type: "article", publishedTime } : { ...common, type: "website" },
    twitter: { card: "summary_large_image", title: shareTitle, description: shareDescription, images },
  };
}
