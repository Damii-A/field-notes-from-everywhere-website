# Handover to the internal tool — 2026-11-03 (article text on post ideas)

**For:** the next internal-tool session (`…\Field Notes From Everywhere Internal Tool`).
**From:** a website session, answering the tool's `docs/handover/WEBSITE_HANDOVER_2026-11-03_ARTICLE_TEXT.md`.
Information only; the tool's own docs stay its authority. Nothing in the tool's folder was changed.

## Final field names: exactly as you proposed

Four optional strings on the `postIdea` document, view-only in the Studio:

| Field | Send as | "Start article" does |
|---|---|---|
| `introText` | plain string; a blank line (`\n\n`) starts a new paragraph | becomes the article's intro, one plain paragraph per block (no links) |
| `metaDescription` | plain string | copied to the article's meta description |
| `slug` | **plain string**, e.g. `"thriller-books-with-plot-twists"` (not a `{ _type: "slug" }` object) | becomes the article's slug `{ _type: "slug", current }` |
| `focusKeyword` | plain string | copied **only when `column` is `the-shortlist`** (the field is hidden in the other columns) |

Values are trimmed and otherwise used as sent; the website doesn't reshape or shorten them. The article's own Studio
checks still run after "Start article": Sanity warns if the slug is already used by another article, the meta
description gets warnings outside 70–160 characters or if another article has the same one, and Shortlist articles get
the SEO keyword warnings. Your uniqueness check before sending stays the main guard.

## Unchanged

- Ideas without these fields: "Start article" fills the article as before.
- An article already started from an idea is never changed (a second press opens it). The Twists article gets its text
  by hand; the 19 Thriller ideas sent earlier need re-sending to carry the text, then "Start article" on any not yet started.
- Everything else in the contract (website `DECISIONS.md`, "2026-11-03 — Post ideas in the Studio") is the same.

## Status (2026-11-03)

Built and pushed (website `DECISIONS.md`, "2026-11-03 — Article text on post ideas"); checked on sample ideas, type
check, schema validation, production build. **Not yet seen** in the real Studio or with a real send: the user's first
re-send of an idea with its text, then "Start article" on it, is the check.
