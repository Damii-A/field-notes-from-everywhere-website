# Handover to the internal tool — 2026-11-17 (new book pages)

**For:** the next internal-tool session. **From:** a website session. Information plus one later request; nothing in the
tool's folder was changed.

## What changed on the website (no action needed)

- Every book's page moved from `/where-to-read/<slug>` to **`/<title>-by-<author>`**, e.g.
  `fieldnotesfromeverywhere.com/the-silent-patient-by-alex-michaelides`. The address is worked out from the book's
  **title and author** each time (lowercase, accents and apostrophes dropped, `&` → "and", everything else → `-`); it is
  not stored. Old `/where-to-read/<slug>` links forward to the new page, so the book's `slug` field is still needed: keep
  setting it as now when creating a book.
- **Consequence for title or author edits:** changing a book's title or author changes its page address. The previous
  `/…-by-…` address then stops working (the old `/where-to-read/` one keeps forwarding). Fine for real corrections; just
  avoid cosmetic churn on books already in live lists.
- The page now answers questions from the book's data: page count, reading time, author, **published year**, genre (its
  website rankings) and **series** (`standalone`, or book N of T, `finished` / `ongoing`). So `publishedYear` and `series`
  are now shown publicly: only send values you've confirmed (as already agreed for series).
- The fit notes (`forYou` / `notForYou`) now sit under the heading "Should you read “Title”?" on each book page.

## Later request: series reading order (when the user asks for it)

The user wanted a "What is the correct order to read {series}?" question. The website can't answer it truthfully yet: it
only has each book's own series name, number and total, not the other titles. If the user goes ahead, the website would need,
per series, the **titles in reading order** (e.g. a `seriesBooks: string[]` on the book, or a separate series document).
Propose the shape before building; ongoing series (18 today) need updating when a new book comes out.

## Flagged to the user (their call, nothing to do unless they ask)

A Game of Thrones' `notForYou` mentions "sexual content involving a young teenager". Not graphic, but Google's ad policies
are strict near that subject; the user may ask for a softer wording (e.g. "disturbing sexual content") before resubmitting
to AdSense.
