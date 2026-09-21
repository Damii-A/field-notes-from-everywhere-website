# Engineering decisions — Field Notes From Everywhere

Consequential decisions, in the format required by `AI_ENGINEERING_OPERATING_MANUAL.md` §12.
Routine/reversible implementation choices are not recorded here.

---

## 2026-09-21 — V1 scope excludes the logged-in Reading Room product

**Decision**: V1 does not build passwordless login, the Books catalogue, or the Past Issues
archive described in `docs/design-specs/rr_subscriber.md`. The Reading Room in V1 is a public
landing page plus a Paddle checkout for the paid trial; nothing behind a login exists.

**Context**: The full spec set (`docs/design-specs/*.md`) describes a considerably larger
product than what's actually built in the Claude Design project. The design project's own
`CLAUDE.md` (mirrored as `docs/design-specs/DESIGN_PROJECT_BUILD_NOTES.md`) explicitly states:
*"The entire Reading Room subscriber experience... Nothing behind the paywall exists"* and
lists it under "What was cut from v1," alongside two of the five Reading Room landing
sections and ten of the thirteen hub sections.

**Alternatives considered**: Build the full spec now, since it's documented and detailed.
Rejected — the user's initialization brief is explicit that the completed Claude Design file
(not the specs) is authoritative for V1 scope, and the design file itself documents this cut
in its own words. Building the full spec would mean inventing a user-facing product (a login
system, a subscriber database, two new screens) the design never actually specified as
current — exactly the kind of silent scope expansion the operating manual and the
initialization brief both warn against.

**Reasoning**: Trust the design's own record of what it built over a superset brief it
explicitly says is "the brief, not the current state."

**Consequences**: No authentication system, no subscriber-facing database, no Books/Past
Issues UI in V1. This substantially simplifies the initial build (see the "no application
database" decision below). The full subscriber spec is preserved verbatim in
`docs/design-specs/rr_subscriber.md` as documented backlog.

**Future implications**: When this is built later, it will need: passwordless auth (likely
Auth.js email provider), a `readingRoomIssue` Sanity document type, and a real decision about
where subscriber/access-state lives (this document doesn't answer that yet — it wasn't in
scope to design infrastructure for a feature not being built).

---

## 2026-09-21 — No application database for V1

**Decision**: V1 ships with no database of its own. Sanity holds content, Kit holds
email-list/subscriber membership, Paddle holds billing/subscription state.

**Context**: Reviewing every functional touchpoint in the built V1 pages — Contact (mailto
link, no form), the two email-capture points (Kit), the Reading Room trial CTA (Paddle) — none
of them need state that doesn't already belong to one of those three systems of record. This
is a direct consequence of the previous decision: without a logged-in product, there's nothing
to gate and nothing to store per-user beyond what Paddle and Kit already track for their own
purposes.

**Alternatives considered**: Stand up a database now "for future use" (e.g. to prepare for the
logged-in Reading Room product later). Rejected per Operating Manual §5 and §7 — architecture
should enable change without building for scale/features the project hasn't earned yet. Adding
a database later, when the subscriber product is actually being built, is a normal, contained
addition; adding one now with no current writer or reader is pure unused complexity.

**Reasoning**: Prefer simplicity (Operating Manual §5); every added system is a maintenance
and security surface with no offsetting benefit right now.

**Consequences**: The Paddle→Kit webhook sync (§9–10 in `ARCHITECTURE.md`) is the only place
subscription state is "stored," and it's stored by proxy — in Kit's own tag/segment system —
rather than in our own store. This is a reasonable, common pattern; it does mean this app has
no way to answer "who are our subscribers" except by asking Kit or Paddle directly.

**Future implications**: Building the logged-in Reading Room product will require a real
datastore (subscriber identity, session/access state, and eventually the Books/Past Issues
content — which may or may not live in Sanity, a separate decision for that point).

---

## 2026-09-21 — Framework: Next.js on Vercel

**Decision**: Next.js (App Router, TypeScript, React), hosted on Vercel.

**Context**: The product is a content-driven, SEO-relevant editorial site with real
server-side needs (two webhook endpoints, one API route) and a CMS (Sanity) with first-party
Next.js tooling.

**Alternatives considered**: A static site generator without a server runtime (e.g. Astro) —
rejected because Paddle/Kit webhooks and the subscribe endpoint need a server, not just a
static build; a full custom backend framework — rejected as unnecessary complexity for a
project this shape (Operating Manual §5, §6).

**Reasoning**: Established, well-documented, matches the problem shape exactly, and Sanity +
Vercel + Next.js is a proven, low-lock-in combination (all three are independently
replaceable).

**Consequences**: Hosting, CMS integration, and the webhook/API surface are all designed
around this from the start (see `ARCHITECTURE.md` §4, §8).

---

## 2026-09-21 — Recommend adding Resend (or equivalent) as a transactional-email provider

**Decision (recommended, not yet actioned — see open item in `CURRENT_STATE.md`)**: use a
small transactional-email API (Resend suggested) for the one-off "send this list to me"
email in Publication articles, keeping Kit strictly for list/segment membership and the
recurring newsletter broadcasts it's actually built for.

**Context**: `pub_article.md` §6.4 requires sending the reader the *specific book list from
the specific article they were reading*, immediately, as a one-off transactional send. Kit
(ConvertKit) is a marketing ESP built around lists, tags, and broadcast/automation sequences
— it's not designed to template and send arbitrary per-article dynamic content on demand.
Building that on top of Kit would mean either manually maintaining a Kit automation/email per
article (doesn't scale with the publication) or fighting the tool's grain.

**Alternatives considered**: Build it entirely through Kit's automations tied to a
per-article tag. Rejected as not scaling with content volume and being fragile to maintain.
Skip the immediate email and only subscribe the reader to the list, addressing the "send"
part later. Considered as a fallback if the added vendor is not approved.

**Reasoning**: This is a new third-party vendor beyond the three named in the initialization
brief (Sanity, Kit, Paddle). Per Operating Manual §10 ("Cost" / new dependencies), a new
vendor decision is flagged for the user even though Resend's free tier covers this volume at
$0 — the manual's principle is about vendor-relationship/complexity cost, not only dollar
cost.

**Consequences if approved**: one more account/API key to provision (`RESEND_API_KEY`); the
"send this list to me" flow becomes reliable and scales with content automatically.

**Status**: presented to the user in the initialization report as a recommended addition
requiring their go-ahead, not yet implemented.

---

## 2026-09-21 — Sanity Studio embedded at `/studio`, not separately hosted

**Decision**: Run Sanity Studio embedded inside the Next.js app at `/studio` rather than as a
separately deployed `sanity.studio` project.

**Context**: No V1 requirement (e.g. an editorial team needing an isolated deploy/release
cycle from engineering) justifies a second deployment target.

**Reasoning**: Simplicity — one repo, one deployment, one auth surface (Operating Manual §5).

**Consequences**: Studio releases whenever the main app releases. Reversible later — Sanity
supports moving to a standalone Studio without a schema change if ever needed.

---

## 2026-09-21 — Production sources mirrored into the repository

**Decision**: The nine `docs/design-specs/*.md` specs and the design project's own `CLAUDE.md`
(as `DESIGN_PROJECT_BUILD_NOTES.md`) are copied verbatim into this repository. The `.dc.html`
pages, design tokens as authored in the design tool, and `_ds_bundle.js` component source are
**not** mirrored as static files — they get read directly from the live design project during
implementation and ported into real application code (see `ARCHITECTURE.md` §7).

**Context**: `DesignSync` (the tool used to read the Claude Design project) requires
`/design-login` authorization that is per-machine/per-session and is not available to every
future session (confirmed during initialization — two subagents spawned in this same
conversation could not reach it at all). Per Operating Manual §11, anything future engineering
work depends on must live in the repository.

**Reasoning**: The text specs and build notes are exactly the kind of durable, low-maintenance
reference material that should survive in the repo regardless of tool access. The `.dc.html`
pages and design-tool component bundle are not mirrored because they'd become a second,
driftable copy of the actual product surface the moment either the live design or the
production implementation changes — better to have one authoritative live source (the design
project) and one authoritative shipped source (the production app) than three.

**Consequences**: A future session without design-tool access can still read the full
requirements brief and the as-built departures from it, but cannot independently verify exact
current pixel-level design without either design-tool access or reading the deployed
production app.
