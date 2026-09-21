# Current state — Field Notes From Everywhere

Last updated: 2026-09-21 (project initialization)

## What exists right now

Nothing implemented yet. This is the state immediately after initialization:

- Repository created, no code.
- Governing documentation established: `CLAUDE.md`, `ARCHITECTURE.md`, `DECISIONS.md`, this
  file, `docs/AI_ENGINEERING_OPERATING_MANUAL.md`, `docs/design-specs/*`.
- Full Claude Design project ("Full FNFE Website") inspected: About, Home, Site Header, Site
  Footer, Terms (representative of the shared legal template), Contact, The Shortlist (hub),
  Article - The Shortlist, The Reading Room, all 9 spec documents, and the design project's
  own `CLAUDE.md` build notes were read in full. **Not yet individually read**: What to Read
  When / Book Club Book Picks hub and article pages, Privacy and Cookies / Disclosures
  (expected identical template to Terms), Palette.dc.html (explicitly not a site page).
- No Sanity project, Kit account integration, Paddle account integration, or hosting/domain
  configuration exists yet.

## Immediately next (first implementation session)

1. Before writing code: read the remaining hub/article page variants (What to Read When,
   Book Club Book Picks) to confirm they share the exact data shape assumed in
   `ARCHITECTURE.md` §6 — the specs say they do, but confirm against the actual built markup
   the way The Shortlist pair was confirmed.
2. Scaffold the Next.js app, port design tokens verbatim, port the confirmed-in-use
   design-system components.
3. Set up the Sanity project and schema from `ARCHITECTURE.md` §6.
4. Build the static/content-only pages first (About, Contact, legal template, hubs, articles)
   before the integration-dependent pages (Reading Room checkout, email capture) — smaller,
   independently verifiable releases per Operating Manual §37.

## Known open items requiring the user before certain work can proceed

- **Remote repository** — not yet connected. The user asked to connect one; see the setup
  steps at the bottom of this file. Repo currently exists only on this machine.
- **Resend account** — vendor use approved by the user (2026-09-21, see `DECISIONS.md`).
  Needs an account created and a `RESEND_API_KEY` before the "send this list to me" email
  capture can be implemented.
- **Sanity account/project** — needs to be created (or existing one identified) and its
  project ID/dataset name provided, or authorization to create one on the user's behalf.
- **Kit account** — API key, and a decision on list/tag naming for "free Publication list" vs.
  "Reading Room active" segment (recommended structure is in `ARCHITECTURE.md` §9; final
  naming is the user's call inside their own Kit account).
- **Paddle account** — API key, webhook secret, and the actual $5/month + 7-day-trial Price
  created in Paddle's dashboard (a Price ID this app checks out against). Also needs
  resolving whether Paddle can do a genuinely card-free trial, since the landing page copy
  promises "no credit card required" — this is a real constraint check against Paddle's
  product capabilities, not an engineering assumption to make silently.
- **Namecheap DNS access** — needed only once the app is ready to go live at the production
  domain; not needed for early development (Vercel preview URLs are sufficient until then).
- **Real legal copy** for Terms, Privacy & Cookies, and Disclosures — currently placeholder
  in the design; needs real text (from the user or their legal counsel) before public launch.
  Not a technical blocker for building the page template itself.

## Known limitations / explicitly out of scope for V1

See `DECISIONS.md` ("V1 scope excludes the logged-in Reading Room product") and
`docs/design-specs/DESIGN_PROJECT_BUILD_NOTES.md` for the full list of what the design itself
cut from V1. In summary: no Reading Room login/Books/Past Issues, no eight-section
"Browse our Collections" taxonomy browsing on hubs, no Recent-Articles carousel — hubs are
category identity → latest article → all articles (+ See more). Confirmed with the user
2026-09-21.

## Connecting a remote repository

`gh` (GitHub CLI) isn't available in this environment, so this couldn't be automated. To
connect one:

1. Create a **new, empty** repository on GitHub (or another Git host) — do **not** initialize
   it with a README, `.gitignore`, or license, since this repo already has commits.
2. Copy its remote URL (e.g. `https://github.com/<you>/field-notes-from-everywhere.git`).
3. Run:
   ```
   git remote add origin <url>
   git push -u origin master
   ```
4. Confirm the push succeeded and the commit history matches.

Once connected, future sessions should push completed logical work regularly per
`AI_ENGINEERING_OPERATING_MANUAL.md` §18, §20.
