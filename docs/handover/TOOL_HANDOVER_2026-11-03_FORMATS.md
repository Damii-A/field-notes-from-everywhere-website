# Handover to the internal tool — 2026-11-03 (article formats = formulas)

**For:** the next internal-tool session. **From:** a website session (item "article formats per formula in every
column", the tool's `docs/TOPIC_SUGGESTER_DESIGN.md` §10 gap 4 / §11 item 36 (2)). Information only; the tool's own
docs stay its authority. Nothing in the tool's folder was changed.

## What changed on the website

- Every article now has a required **Format**, and its values **are the tool's formula codes**, per column:
  - `the-shortlist`: `authority`, `ultimate`, `year`
  - `what-to-read-when`: `mood`, `intensity`, `pace`, `blend`, `comparison`, `seasonal`, `series`
  - `book-club-book-picks`: `bookclub`, `challenge`
- **"Start article"** copies the idea's `formula` into the article's `format` when the formula is one of the
  column's formats. Otherwise (e.g. a `year` idea sent to What to Read When) the format is left for the user to pick.
- The post-idea contract is **unchanged**: keep sending `formula` and `column` as now. A new formula needs adding to
  the website's `sanity/lib/formats.ts` (and `FORMULA_NAMES` in `sanity/schemaTypes/postIdea.ts`) before its ideas
  get a format.
- Grouped map and Graded scale aren't formats (dropped / parked in the tool).
- Read-back is unchanged: an idea is published when an article with `postIdea._ref == "postIdea-<id>"` is published.
  An article's `format` can now also be read as its formula.

## Idea 53 and Book a month (settled after your answer)

Idea 53 stays `challenge`; "Start article" gives it the Challenge format. **`bookamonth` is removed** from the website
(the third column's formats and the Studio's formula names), as you confirmed the tool will never send it. No article or
idea used it. If the tool ever sends `bookamonth` again, the Studio shows the raw code and the article's format is left
empty for the user to pick.

Full record: the website's `DECISIONS.md`, "2026-11-03 — Article formats = the tool's formulas, in every column".
