<!-- Mirrored verbatim from the Claude Design project's own CLAUDE.md, fetched 2026-09-21. -->

# Field Notes From Everywhere — project notes

Reconstructed 19 Sep 2026 by reading the built files, after the chat history that held
these decisions was trimmed. Everything below is **observed in the build**. Where the
reason for a decision wasn't recorded anywhere, it says so — don't treat a guess as a rule.

## What this project is

A full marketing/publication website for FNFE, built as Design Components, one page per
`.dc.html`. The `specs/` folder holds the markdown extractions of the client's eight Word
specs (`uploads/*.docx`). The specs are the brief, **not** the current state — several
deliberate departures are listed below.

## Pages that exist

| File | Role |
| --- | --- |
| `Home.dc.html` | Homepage |
| `The Shortlist.dc.html` / `What to Read When.dc.html` / `Book Club Book Picks.dc.html` | The three publication hubs |
| `Article - <category>.dc.html` | One article template per category |
| `The Reading Room.dc.html` | Reading Room landing/paywall page |
| `About.dc.html`, `Contact.dc.html` | About + contact |
| `Terms.dc.html`, `Privacy and Cookies.dc.html`, `Disclosures.dc.html` | Shared legal template |
| `Site Header.dc.html`, `Site Footer.dc.html` | Shared chrome, imported by every page |
| `Palette.dc.html` | Internal reference — every colour token with its ink-contrast ratio. Not a site page. |

**V1 is a deliberately stripped-down cut of the specified site.** Several specified sections
and whole features were cut to get a coherent v1 shipped, not abandoned. The cuts are listed
below — treat them as a backlog, not as decisions against the spec.

## What was cut from v1

- **The entire Reading Room subscriber experience** (`specs/rr_subscriber.md`, 30k chars):
  log in, sign up / free trial, the Books screen, Past Issues, and the eight
  collection-browsing sections. Nothing behind the paywall exists.
- **Two of the five Reading Room landing sections.** `specs/rr_landing.md` specifies
  1 header → 2 daily catalogue → 3 Past Issues → 4 Books catalogue → 5 trial offer. Built:
  1, 2 and 5, plus a drifting book-cover shelf between them. Sections 3 and 4, and their
  product screenshots, are not built. The header also has only one CTA ("Join for free");
  the spec asks for "Try it for free" beside "Log in".
- **Ten of the thirteen hub sections** — see below.
- **Real legal copy** on Terms / Privacy / Disclosures.

## Structural departures from the specs

- **Hub pages are three sections, not thirteen.** The spec (`specs/pub_hub.md`) asks for
  category identity → latest → recent → "browse our collections" → eight taxonomy sections
  (genre, character, relationship, trope, mood, theme, setting, experience) → all articles.
  The built hubs are: category identity band, one full-bleed latest-article panel, then
  "All articles" as a grid with a **See more** button (9 at a time, +6 per click). The
  eight collection sections and the "recent articles" carousel are not built.
- **Homepage hero** is a headline + the watercolour book-stack photo
  (`uploads/diletta-davolio-8b4FAmbxZTg-unsplash.png`), followed by the **reader-request
  stratosphere** — a full-width band of real reader requests in mixed hand/body type that
  fade in and out one at a time, each lane justified edge to edge and re-justified after
  every swap. That animation is bespoke (all the logic is in `Home.dc.html`'s class) and is
  the most fragile thing in the project: it measures text, packs lanes, and recentres on
  resize. Don't casually restyle `.strat` or the `--font-hand` sizes.
- **Article pages carry four floating behaviours**, all desktop-only (hidden below 1080px)
  and all driven by scroll state in the article's own logic class:
  1. copy-link button, left rail;
  2. reading progress — "n of 8" plus a fill bar, shown only while the book list is in view;
  3. Reading Room float card, shown only when the book list is *not* in view (they swap);
  4. "Send this list to me" email popup, fires once past 50% scroll, dismissible.
- **Legal pages are a shared skeleton** with placeholder "Section heading" / "Sub-heading"
  copy. Real legal text has not been supplied.

## Conventions the build follows

- Every DC loads the seven design-system token sheets + `_ds_bundle.js` in `<helmet>`,
  then a small reset block (`box-sizing`, body bg/colour, `a` / `a:hover`). Copy that block
  verbatim into any new page.
- Header and footer are imported, never re-created: `<dc-import name="Site Header"
  active="shortlist|when|club">`. The `active` prop is the only nav-state mechanism.
- Header: centred two-line wordmark over a centred nav, sticky, `--oat-200` ground, with
  The Reading Room split off as a filled clay pill after a hairline divider.
- Design-system components in use: `BookCover`, `Button`, `Icon`. Everything else is
  hand-composed with tokens — there is no card component in play.
- All imagery is `<image-slot>` placeholders with stable ids (`sl-lead`, `art-sl-hero`,
  `home-bc-2a`…) so drops survive reload. The homepage photo is the one real image.
- Content is realistic placeholder written in FNFE voice — counted claims
  ("1,240 reader recommendations", "18 books · Aug 6"), lowercase button labels, no emoji.
  Book titles and authors are real; the blurbs and counts are invented.

## Per-category colour identity

Each category owns a ground and an accent, applied consistently across its hub and article:

- **The Shortlist** — `--sage-100` page, `--sage-700` bands and rank numerals.
- **What to Read When** — `--oat-200` page, clay accents (`--clay-700`, `--clay-300`).
- **Book Club Book Picks** — `--paper-100` page, sky accents (`--sky-600`, `--sky-200`).
- **The Reading Room** — `--paper-050` page, `--slate-700` panel, ochre highlight.

**The rule (client-stated):** a hub and everything under it carry one visual identity —
on the homepage hub section, on the hub's own page, and on every article published under it.
A colour belongs to a category, not to a page.

The homepage hub-link hover colours were rotated by one against this (Shortlist hovered clay,
What to Read When hovered sky, Book Club hovered sage) and were corrected on 19 Sep 2026.
The section grounds on the homepage were already correct.

## Next session — agreed, not yet built

1. **Email callout placement.** The "Want us to send you this book list?" callout currently
   sits once, above the article intro. It should instead repeat *within* the book list —
   after the 5th, 10th, 15th book and so on — rather than only at the top.
2. **Reading Room rail card is too close to the article.** The sticky rail card should be
   pushed further right within its own column, away from the text.

## Working agreements

- Targeted edits only. This site has been iterated on heavily; layout and spacing values
  are usually the result of a decision, not a default.
- When a decision is made in chat that contradicts a spec, add it to this file.
