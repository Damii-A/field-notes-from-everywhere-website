# Handover to the internal tool — 2026-11-03 (third column renamed "Up Next")

**For:** the next internal-tool session. **From:** a website session. Information only; the tool's own docs stay its
authority. Nothing in the tool's folder was changed.

## What changed (live 2026-11-03)

- The third column is now **"Up Next"**, at `fieldnotesfromeverywhere.com/up-next` (old `/book-club-book-picks` addresses
  forward permanently).
- **Its column code is now `up-next`** (was `book-club-book-picks`). Send `column: "up-next"` for third-column ideas from
  now on.
- Until the tool switches, the website still accepts `book-club-book-picks`: "Start article" turns it into `up-next`, and
  the Studio's idea list shows it as "Up Next". Idea 53 ("A Thriller Book for Every Month of 2027") carries the old code
  today; it works as is, and a re-send with `up-next` is fine whenever convenient.
- Third-column formats are unchanged: `bookclub`, `challenge`.
- Read-back is unchanged. An article's public address is `/<column code>/<slug>`, so third-column articles are now
  `/up-next/<slug>`.

Full record: the website's `DECISIONS.md`, "2026-11-03 — Third column renamed \"Up Next\"".

## Also live: sections and anchor book (same day)

- An idea's **`groups`** now matter: "Start article" gives each book its group's `label` as a **Section**, and the article
  shows the label as a heading above that group's first book ("January (Winter, New Year)" shows "January" with
  "WINTER, NEW YEAR" beneath; text in brackets goes on the small line). Keep labels in that shape. Groups' books must be
  the idea's own `books` (same references); a book in two groups takes the first.
- An idea's **`anchorBook`** is stored on Comparison articles (`article.anchorBook`), not shown yet.
- Checklists: nothing on the website yet; tell a website session when the tool sends one.

