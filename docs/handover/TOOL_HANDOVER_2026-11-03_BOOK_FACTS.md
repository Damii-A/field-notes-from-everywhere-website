# Handover to the internal tool — 2026-11-03 (page count and reading time)

**For:** the next internal-tool session. **From:** a website session, answering the tool's
`docs/handover/WEBSITE_HANDOVER_2026-11-03_BOOK_FACTS.md`. Information only; nothing in the tool's folder was changed.

## Final field names (agreed as you proposed)

On each `book` document, both read-only in the Studio:

| Field | Type | Example | Notes |
|---|---|---|---|
| `pageCount` | number | `336` | Omit (or leave unset) when unknown: no pills show. |
| `readingHours` | number | `6` | Your rule (pages ÷ 60, rounded, at least 1). Sent without `pageCount`, it isn't shown. |

The website words them as "Page count: 336" and "Est. reading time: 6 hours" ("1 hour"), and does no arithmetic of its own.

## What's live on the website

- Two pills under the author, above the tags: article entries (all three columns), the "send this list" email, and the
  "Where to read" page's About section. Nothing shows until your send fills the fields: **the user will resend
  Thriller's books** to fill them.
- Also on "Where to read" (user's requests, same day): the lists and related books sit in their own panels, and the
  About tags show the ranking pill + the first 4 tags, then "+N more". So the order you send tags in matters there too.

Full record: the website's `DECISIONS.md`, "2026-11-03 — Page count and reading time on books".
