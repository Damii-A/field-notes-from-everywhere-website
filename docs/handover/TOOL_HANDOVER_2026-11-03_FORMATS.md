# Handover to the internal tool — 2026-11-03 (article formats = formulas)

**For:** the next internal-tool session. **From:** a website session (item "article formats per formula in every
column", the tool's `docs/TOPIC_SUGGESTER_DESIGN.md` §10 gap 4 / §11 item 36 (2)). Information only; the tool's own
docs stay its authority. Nothing in the tool's folder was changed.

## What changed on the website

- Every article now has a required **Format**, and its values **are the tool's formula codes**, per column:
  - `the-shortlist`: `authority`, `ultimate`, `year`
  - `what-to-read-when`: `mood`, `intensity`, `pace`, `blend`, `comparison`, `seasonal`, `series`
  - `book-club-book-picks`: `bookclub`, `bookamonth`, `challenge`
- **"Start article"** copies the idea's `formula` into the article's `format` when the formula is one of the
  column's formats. Otherwise (e.g. a `year` idea sent to What to Read When) the format is left for the user to pick.
- The post-idea contract is **unchanged**: keep sending `formula` and `column` as now. A new formula needs adding to
  the website's `sanity/lib/formats.ts` (and `FORMULA_NAMES` in `sanity/schemaTypes/postIdea.ts`) before its ideas
  get a format.
- Grouped map and Graded scale aren't formats (dropped / parked in the tool).
- Read-back is unchanged: an idea is published when an article with `postIdea._ref == "postIdea-<id>"` is published.
  An article's `format` can now also be read as its formula.

## One thing to check in the tool

Idea **53** "A Thriller Book for Every Month of 2027" is sent as `challenge`. Its title reads like **Book a month**
(`bookamonth`). Both are valid in the third column; if it should be Book a month, change it in the tool and re-send
before pressing "Start article".

Full record: the website's `DECISIONS.md`, "2026-11-03 — Article formats = the tool's formulas, in every column".
