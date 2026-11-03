# Handover to the internal tool — 2026-11-03

**For:** the next internal-tool session (`…\Field Notes From Everywhere Internal Tool`).
**From:** a website session, answering the tool's `docs/handover/WEBSITE_HANDOVER_2026-11-03.md`.
Information only; the tool's own docs stay its authority. Nothing in the tool's folder was changed.

## What's live on the website (2026-11-03)

- **"Post ideas"** in the Studio sidebar: `postIdea` documents, view-only (no editing, publishing or
  deleting in the Studio; the tool is the one place ideas are edited).
- **"Start article"** on a post idea: makes a draft article in the idea's column with the title, the
  books in order (each entry's "Tags shown here" = the idea's `tagsShown`), "How we made this list" =
  the evidence line, the ranking, the What to Read When format where the formula maps to one, and a
  Seasonal idea's future `scheduleFor` date as the published date. A second press opens the article
  already started. Checked by the user in the real Studio with a sample idea (since deleted).
- Articles carry **`postIdea`**, a read-only weak reference to the idea they came from.
- Website: the ranking pill now shows first even when an entry has its own "Tags shown here".

## The agreed data contract (final field names)

Full version: the website's `DECISIONS.md`, entry "2026-11-03 — Post ideas in the Studio". Changes from
the proposal in your note are marked **changed**.

- `_id` `postIdea-<toolIdeaId>`, `_type` `postIdea`; send with `createOrReplace`.
- `toolIdeaId` (number), `sentAt` (datetime).
- `ranking`: `{ _type: "reference", _ref: "ranking-thriller" }`.
- `title` (string), `otherTitles` (string array).
- `formula`: one of `authority`, `ultimate`, `year`, `mood`, `intensity`, `pace`, `blend`, `comparison`,
  `seasonal`, `series`, `bookclub`, **`bookamonth`** (added: your note's list had 12 codes for 14
  formulas; tell the website session about any other code so it's added to the Studio's list), `challenge`.
- `column` (**changed**): the article category code, not the display name: `the-shortlist`,
  `what-to-read-when`, `book-club-book-picks`. The "Up Next" rename hasn't happened on the website; until
  it does, third-column ideas use `book-club-book-picks`.
- `whyItQualifies`, `evidenceLine`, `notes` (strings).
- `timing` (**changed**, an object, optional): `occasion` (string), `window` (string), `scheduleFor`
  (date `YYYY-MM-DD`), `year` (number).
- `books` (**changed** shape): array in order of
  `{ _type: "postIdeaBook", _key, book: { _type: "reference", _ref: <the book's Sanity _id> }, tagsShown: [{ _type: "reference", _ref: "tag-<name>", _key }] }`.
  Look up each book's `_id` from its `toolBookId` before sending.
- `sharedTags` (tag references, up to 8), `anchorBook` (book reference), `groups`
  (`{ _type: "postIdeaGroup", _key, label, books: [book references] }`). Stored only; not used on the
  website yet.
- Every array item needs a `_key`. References are strong: **Sanity refuses the whole send if any book or
  tag isn't in the Studio**, so send books first.

## Reading back "Published"

An idea is published when this finds a document:
`*[_type == "article" && postIdea._ref == "postIdea-<toolIdeaId>" && !(_id in path("drafts.**")) && publishedAt <= now()][0]`
(query with the `published` perspective, or keep the drafts filter). An article that's been started but not
published has a `drafts.` id.

## Still on the website's list (the user decides each, one at a time)

Article formats per formula in all three columns; layouts beyond one flat list (the user wants the
current article look kept, so any visible change needs their OK with a preview first); renaming the third
column "Up Next"; the Shortlist's description; the live Shortlist title's "2,181 Real Readers"; tag
categories and book facts on the website (then the send can carry them); Studio book fields view-only;
moving the Claude Design project before 14 December 2026; optionally, checking Sanity's usage limits.
