/**
 * Article formats = the internal tool's formulas, per column (DECISIONS.md, 2026-11-03;
 * the tool's docs/TOPIC_SUGGESTER_DESIGN.md §7a and §11). Values are the tool's formula
 * codes, so "Start article" copies a post idea's formula straight in. Grouped map was
 * dropped and Graded scale is parked in the tool, so neither is here.
 */
export const FORMATS_BY_COLUMN: Record<string, { value: string; title: string }[]> = {
  "the-shortlist": [
    { value: "authority", title: "Authority (the most-recommended books)" },
    { value: "ultimate", title: "Ultimate list (the whole ranking, 40+ books)" },
    { value: "year", title: "Year (…to read in [year])" },
  ],
  "what-to-read-when": [
    { value: "mood", title: "Mood (a feeling, e.g. bleak, cozy)" },
    { value: "intensity", title: "Intensity (the darkest, the twistiest…)" },
    { value: "pace", title: "Pace (read in a day, a weekend…)" },
    { value: "blend", title: "Blend (the theme + a trope or setting)" },
    { value: "comparison", title: "Comparison (books like…)" },
    { value: "seasonal", title: "Seasonal (a season or occasion)" },
    { value: "series", title: "Series (series to binge or start)" },
  ],
  "book-club-book-picks": [
    { value: "bookclub", title: "Book club" },
    { value: "bookamonth", title: "Book a month" },
    { value: "challenge", title: "Challenge or checklist" },
  ],
};

export const ALL_FORMATS = Object.values(FORMATS_BY_COLUMN).flat();

export function isFormatForColumn(column: string | undefined, format: string | undefined): boolean {
  return !!column && !!format && (FORMATS_BY_COLUMN[column] ?? []).some((f) => f.value === format);
}
