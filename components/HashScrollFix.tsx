"use client";

import { useEffect } from "react";

/**
 * The browser jumps to a #section link (e.g. /terms#refund-policy) before the
 * web fonts finish loading; the swap then reflows the text above, and the
 * (smooth) jump finishes at the stale position, leaving the heading under the
 * pinned header on a first visit. Re-align once fonts are ready and once any
 * in-flight scroll ends, unless the reader has started scrolling themselves.
 */
export function HashScrollFix() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    const target = id ? document.getElementById(id) : null;
    if (!target) return;

    let readerScrolled = false;
    const onReaderInput = () => {
      readerScrolled = true;
    };
    const align = () => {
      if (!readerScrolled) target.scrollIntoView({ behavior: "instant", block: "start" });
    };
    const inputEvents = ["wheel", "touchstart", "keydown", "mousedown"] as const;
    inputEvents.forEach((e) => window.addEventListener(e, onReaderInput, { passive: true }));
    window.addEventListener("scrollend", align);
    document.fonts.ready.then(align);
    // Fallback for browsers without `scrollend`.
    const late = window.setTimeout(align, 1000);
    const done = window.setTimeout(cleanup, 2000);

    function cleanup() {
      inputEvents.forEach((e) => window.removeEventListener(e, onReaderInput));
      window.removeEventListener("scrollend", align);
    }
    return () => {
      window.clearTimeout(late);
      window.clearTimeout(done);
      cleanup();
    };
  }, []);
  return null;
}
