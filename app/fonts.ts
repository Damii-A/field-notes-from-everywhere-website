import { Comfortaa, Delius, IBM_Plex_Mono, Nunito } from "next/font/google";

/**
 * The design system's four Google Fonts (styles/tokens/fonts.css), self-hosted
 * by Next.js instead of loaded from fonts.googleapis.com: no render-blocking
 * request to another domain on first paint, preloaded files, and metric-matched
 * fallbacks so text doesn't jump when the font arrives. Same families, weights
 * and styles as the design's @import. The --font-* tokens point at these
 * variables in app/globals.css. See DECISIONS.md, 2026-09-24.
 */
const comfortaa = Comfortaa({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--nf-display", display: "swap" });
const delius = Delius({ subsets: ["latin"], weight: "400", variable: "--nf-hand", display: "swap" });
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--nf-body",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--nf-mono", display: "swap" });

export const fontVariables = [comfortaa.variable, delius.variable, nunito.variable, plexMono.variable].join(" ");
