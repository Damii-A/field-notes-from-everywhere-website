"use client";

import { useEffect } from "react";

/**
 * The browser jumps to a #section link (e.g. /terms#refund-policy) before the
 * web fonts finish loading; the swap then reflows the text above and leaves
 * the heading under the pinned header on a first visit. Re-align once fonts
 * are ready.
 */
export function HashScrollFix() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    document.fonts.ready.then(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "instant", block: "start" });
    });
  }, []);
  return null;
}
