# Design specs — mirrored governing sources

This folder mirrors text documents from the Claude Design project **"Full FNFE Website"**
(claude.ai/design, projectId `5a207ce5-1cf9-4986-b5f1-12c9e767072d`), fetched and committed
here on **2026-09-21**.

## Why these are mirrored here

The Claude Design project is the authoritative source for the FNFE product and requires
its own authorization (`/design-login`) to read live. That authorization is per-machine and
per-session — a future Claude Code session, or a human engineer, may not have it available.
Per the AI Engineering Operating Manual ("Repository Memory Principle"), anything future
engineering work depends on must live in the repository, not only in an external tool a
session may not be able to reach.

The **visual/UX design itself** (the `.dc.html` pages, the design-system tokens and
components) is intentionally **not** mirrored here — that content is authoritative only in
its live, rendered form, and reproducing it as static files here would create a second,
driftable copy of the actual product surface. Engineers building or modifying the frontend
should consult the live design project directly (or the deployed production app, which is
the faithful implementation of it), not a frozen snapshot.

What **is** mirrored here are the text/requirements documents whose authority doesn't depend
on live rendering:

| File | What it is |
| --- | --- |
| `DESIGN_PROJECT_BUILD_NOTES.md` | The design project's own `CLAUDE.md` — an as-built record of what was actually constructed, including deliberate departures from the specs below and features cut from V1. **Read this first** — it tells you which parts of the specs are current and which are backlog. |
| `homepage.md` | Homepage experience spec |
| `about.md` | About page experience spec |
| `pub_hub.md` | Publication category hub experience spec (The Shortlist / What to Read When / Book Club Book Picks) |
| `pub_article.md` | Publication article experience spec (shared article system + per-category rules) |
| `rr_landing.md` | The Reading Room public landing page spec |
| `rr_subscriber.md` | The Reading Room logged-in subscriber experience spec (login, Books, Past Issues) — **per the build notes, none of this is built in V1.** Kept here as the documented backlog/future spec. |
| `utility_pages.md` | Contact, Privacy & Cookies, Terms, Disclosures |

## Authority and how to read these together

1. **The live Claude Design project** (the actual `.dc.html` pages) is authoritative for
   what V1 looks like and does. Build what's there.
2. **`DESIGN_PROJECT_BUILD_NOTES.md`** explains, in the design team's own words, where the
   built pages depart from the specs below and what was deliberately cut from V1. Trust it
   over the specs when they conflict.
3. **The spec files** are the original brief. They remain valuable for intent, content
   hierarchy, and business rules (trial length, pricing, editorial methodology, etc.) that
   the built pages don't always restate. Treat unbuilt sections (e.g. the eight
   "Browse our Collections" taxonomy sections, the Reading Room subscriber product) as
   **documented future scope**, not present-day requirements, unless the live design project
   shows otherwise.

See `/ARCHITECTURE.md` and `/DECISIONS.md` in the repository root for how these requirements
were translated into the production system.
