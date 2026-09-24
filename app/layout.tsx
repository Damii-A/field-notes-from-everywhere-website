import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity";
import { PreviewBanner } from "@/components/PreviewBanner";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Field Notes From Everywhere",
    template: "%s · Field Notes From Everywhere",
  },
  description:
    "Book recommendations, backed by real reader discussions. The Field Notes From Everywhere Publication and The Reading Room.",
  alternates: {
    types: { "application/rss+xml": "/feed.xml" },
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Studio preview only (see lib/sanity/previewSecret.ts): VisualEditing
  // refreshes the page inside the Studio's Presentation pane as edits save.
  const preview = (await draftMode()).isEnabled;
  return (
    <html lang="en" className={fontVariables}>
      <body>
        {children}
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
