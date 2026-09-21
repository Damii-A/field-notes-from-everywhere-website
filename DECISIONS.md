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

**Status**: confirmed with the user during initialization (2026-09-21) — this reading of V1
scope is correct and approved.

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

**Status**: approved by the user during initialization (2026-09-21). Not yet implemented —
implementation needs a `RESEND_API_KEY` (see `CURRENT_STATE.md`).

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

## 2026-09-21 — Styling: CSS Modules + global token stylesheet, no CSS-in-JS library

**Decision**: Component-scoped styles (hover states, animations, media queries) use plain
CSS Modules, which Next.js supports natively. Design tokens live as global CSS custom
properties (`styles/tokens/*.css`, ported verbatim from the design). One-off structural
layout (padding/gap/flex on a single JSX element) is written as inline `style={{}}` objects
referencing those same `var(--token)` values — matching how the design itself is authored
(every `.dc.html` page uses inline styles against the same tokens), which made porting layout
faithfully straightforward and low-risk of transcription error.

**Context**: `styled-components` was in the original package.json drafted during
initialization. It was never actually needed — CSS Modules covers everything V1 requires
(hover/focus states, keyframe animations, responsive breakpoints) with zero added dependency
and no runtime CSS-in-JS cost.

**Reasoning**: Prefer simplicity (Operating Manual §5) — don't add a styling library when the
framework's built-in mechanism suffices.

**Consequences**: Removed `styled-components` from `package.json` before the first install.

---

## 2026-09-21 — Sanity Studio must be loaded fully client-side via `next/dynamic`

**Decision**: `/studio` is a server component (`page.tsx`) that renders a client-only wrapper
(`StudioLoader.tsx`, `"use client"`) which in turn uses `next/dynamic(..., { ssr: false })` to
load `StudioClient.tsx` (which does the actual `next-sanity/studio` + `sanity.config` import).

**Context**: A direct static import of `next-sanity/studio`/`sanity.config` in the route file
(the pattern shown in next-sanity's own docs) crashed `next build`'s page-data-collection step
with `createContext is not a function` — a React-instance mismatch between Node's module
evaluation during that step and Sanity Studio's browser-only bundle. `ssr: false` on
`next/dynamic` is also only permitted from a Client Component in the App Router, hence the
two-file split (`StudioLoader` → `StudioClient`) rather than one.

**Reasoning**: Keep Node from ever evaluating Sanity Studio's module graph; only the browser
does, where it works as intended.

**Consequences**: `/studio` builds and loads correctly (verified: `npm run build` succeeds,
route compiles). Functionality itself is unverified beyond that, since no live Sanity project
exists yet to actually open the Studio against (see `CURRENT_STATE.md`). If a future Sanity
Studio major version fixes this upstream, this workaround can likely be simplified back to a
direct import — worth a quick retry next time Sanity/Next dependencies are upgraded.

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

---

## 2026-09-21 — Content reads use a hand-rolled `groqFetch`, not `@sanity/client`'s `.fetch()`

**Decision**: `lib/content/index.ts` fetches all content via `lib/sanity/groqFetch.ts`, a ~50-line
function that calls Sanity's public Query HTTP API directly with `fetch()`. It does not use
`@sanity/client`'s own `.fetch()` method for this. `@sanity/client` is still a dependency (the
embedded Studio at `/studio` needs it), and `@sanity/image-url`/`@sanity/vision` are untouched —
this decision is scoped to the app's own read path only.

**Context**: While wiring the first real content queries and verifying them against a live test
article, `@sanity/client@6.29.1`'s `.fetch()` consistently returned `null` for queries that
provably matched an existing document — confirmed via: the identical query/params/token/dataset
returning the correct result from a plain Node script and from a direct `curl` against Sanity's
API, `client.config()` showing the correct resolved URL, and (the decisive test) a raw `fetch()`
call to that exact resolved URL, made from inside the same Next.js server process, in the same
request, immediately before the `@sanity/client` call — succeeding where `@sanity/client.fetch()`
failed. This narrows the fault specifically to `@sanity/client`'s own HTTP layer as bundled/run in
this Next.js App Router server environment; the root cause inside that library was not isolated
further (time-boxed — see Operating Manual on not over-investing in a vendored dependency's
internals when a clean workaround exists).

**Alternatives considered**: Pin a different `@sanity/client` version — untried; no specific
version was identified as known-good, and the bug reproduced with the version range this project
already specifies. Keep debugging the SDK — rejected past a reasonable time-box: this app's read
needs are simple GET queries against a public, documented HTTP API, well within reach of a small
direct implementation. Use `next-sanity`'s helpers instead — not evaluated in depth; would still
depend on `@sanity/client` internally and might carry the same bug.

**Reasoning**: A ~50-line function against a stable, documented public API, verified working in
this exact runtime, is more reliable here than an opaque third-party HTTP layer with a confirmed
environment-specific bug. Operating Manual §5 (prefer simplicity) supports removing a dependency
that isn't earning its complexity in this path.

**Consequences**: `groqFetch` reimplements: GET-with-query-string for normal-sized queries,
POST-with-JSON-body past a length threshold (matching `@sanity/client`'s own GET/POST switching
behavior), and Next.js cache-tag/revalidate passthrough. It does **not** reimplement CDN routing,
perspectives/drafts, mutations, or stega — none of which the app's read path currently needs. If
a future requirement needs one of those, extend `groqFetch` deliberately rather than reaching back
for `@sanity/client.fetch()` without re-verifying the bug is actually gone.

**Future implications**: Worth a quick retry of `@sanity/client.fetch()` against a newer major
version if one is adopted later (for the Studio's own dependency), to see if this was fixed
upstream — but don't switch the app's read path back without first repeating the same isolation
test (raw `fetch()` vs `client.fetch()` in the same request) that caught this.
