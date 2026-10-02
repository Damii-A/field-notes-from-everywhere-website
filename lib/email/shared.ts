/**
 * Pieces shared by our HTML emails (the book-list email and Reading Room
 * issues). Email clients can't read the site's CSS variables, so colours are
 * the hex values of the design tokens (styles/tokens/colors.css).
 */

export const INK = "#302B24"; // --ink-900
export const INK_SOFT = "#4E463C"; // --ink-700
export const INK_MUTED = "#736858"; // --ink-500
export const RULE = "#D9C4B0";
export const DISPLAY = "'Comfortaa','Nunito',Arial,Helvetica,sans-serif";
export const BODY = "'Nunito',Arial,Helvetica,sans-serif";
export const MONO = "'IBM Plex Mono','Courier New',monospace";

export function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Sanity CDN images at a fixed width (keeps the original format: some email clients can't show WebP). */
export function sized(url: string, width: number): string {
  return url.includes("cdn.sanity.io") ? `${url}${url.includes("?") ? "&" : "?"}w=${width}` : url;
}
