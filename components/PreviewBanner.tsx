"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Shown only while Studio preview (draft mode) is on AND the page is open in
 * a normal browser tab rather than inside the Studio's Presentation pane.
 * The preview cookie is site-wide for this browser, so without this an
 * editor could browse the real site afterwards and mistake unpublished or
 * scheduled content for what readers see.
 */
export function PreviewBanner() {
  const pathname = usePathname();
  const [standalone, setStandalone] = useState(false);
  useEffect(() => setStandalone(window.self === window.top), []);
  if (!standalone) return null;

  return (
    <div
      role="status"
      style={{
        position: "fixed",
        left: 16,
        right: 16,
        bottom: 16,
        zIndex: 1000,
        margin: "0 auto",
        maxWidth: 560,
        padding: "10px 16px",
        borderRadius: 999,
        background: "var(--slate-700)",
        color: "var(--paper-050)",
        fontFamily: "var(--font-body)",
        fontSize: 14,
        display: "flex",
        gap: 12,
        justifyContent: "center",
        flexWrap: "wrap",
      }}
    >
      <span>Preview: showing unpublished and scheduled content.</span>
      <a
        href={`/api/draft-mode/disable?redirect=${encodeURIComponent(pathname)}`}
        style={{ color: "var(--ochre-100)", textDecoration: "underline" }}
      >
        exit preview
      </a>
    </div>
  );
}
