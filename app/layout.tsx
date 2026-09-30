import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity";
import { PreviewBanner } from "@/components/PreviewBanner";
import { ConsentManager } from "@/components/ConsentManager";
import { SITE_URL } from "@/lib/siteUrl";
import { DEFAULT_SHARE_IMAGE, SITE_DESCRIPTION, SITE_NAME } from "@/lib/metadata";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  // Absolute URLs for canonical and social-share tags; "./" makes each page
  // its own canonical, on the real domain rather than the vercel.app alias.
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Field Notes From Everywhere",
    template: "%s · Field Notes From Everywhere",
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "./",
    types: { "application/rss+xml": "/feed.xml" },
  },
  // Fallback share tags for pages that don't set their own (e.g. the 404 page).
  openGraph: { siteName: SITE_NAME, locale: "en_US", type: "website", images: [DEFAULT_SHARE_IMAGE] },
  twitter: { card: "summary_large_image", images: [DEFAULT_SHARE_IMAGE] },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Studio preview only (see lib/sanity/previewSecret.ts): VisualEditing
  // refreshes the page inside the Studio's Presentation pane as edits save.
  const preview = (await draftMode()).isEnabled;
  return (
    <html lang="en" className={fontVariables}>
      <body>
        {children}
        <ConsentManager gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        {preview && (
          <>
            <VisualEditing />
            <PreviewBanner />
          </>
        )}
      </body>
    </html>
  );
}
