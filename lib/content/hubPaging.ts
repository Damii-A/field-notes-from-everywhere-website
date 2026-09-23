/** Hub "All articles" paging (DESIGN_PROJECT_BUILD_NOTES.md: 9 at a time, +6 per "See more"). Kept out of lib/content/index.ts so client components can import it without pulling in server-only fetching. */
export const HUB_INITIAL_COUNT = 9;
export const HUB_PAGE_INCREMENT = 6;
