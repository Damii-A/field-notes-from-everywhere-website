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

## 2026-09-21 — Reading Room's free trial is tracked in Kit, not as a Paddle trial

**Decision**: Starting a Reading Room trial is an email-capture action, not a Paddle checkout.
A visitor enters only their email; the app tags them in Kit as trialing, and Kit alone runs the
7 days of daily catalogue emails plus the trial sales sequence. Paddle is not involved until the
person actually decides to become a paying subscriber, at which point they see a real Paddle
checkout screen for the $5/month Price. `ReadingRoomCheckoutButton` (currently a direct Paddle.js
checkout trigger) needs to become an email-capture form for the trial-start action, with Paddle
checkout reserved for the "keep it going" moment.

**Context**: The Reading Room landing page copy promises "no credit card required" for the
7-day trial (`rr_landing.md`). Subscription-billing platforms like Paddle generally require a
payment method up front for a trial, specifically so they can auto-charge it the moment the
trial ends — a real conflict with that promise, flagged as an open question when this was first
built (`ARCHITECTURE.md` §10, `CURRENT_STATE.md`) but not resolved until now, before Paddle
integration work begins. Separately, V1 has no logged-in Reading Room product to gate (see "V1
scope excludes the logged-in Reading Room product" above) — the entire "product" during the
trial is the daily emails themselves, which Kit is already the system of record for. That
combination means nothing about the trial actually requires Paddle at all.

**Alternatives considered**: Use Paddle's own trial mechanism and accept that a card is
collected up front, updating the landing page copy to say so. Rejected — changes a specific,
already-written product promise without the user asking for that tradeoff, when a workable
alternative exists that keeps the promise as written. Verify empirically whether Paddle Billing
can do a truly card-free trial before deciding. Not pursued — even if possible, routing the free
period through Paddle at all adds billing-platform dependency to something that doesn't need
billing, and produces the exact same tag-based end state in Kit either way.

**Reasoning**: Keeps the free period honestly free-of-card as promised, without depending on a
specific billing platform capability that may not exist. Matches the existing "Kit is the
list/segment system of record, Paddle is the billing system of record" split (`ARCHITECTURE.md`
§68) — someone who hasn't paid anything has no billing state to represent yet, so there being no
Paddle object for them is the more accurate model, not a workaround.

**Consequences**: A new API route is needed to start a trial (validate email → tag in Kit as
`reading-room-trialing` with a start date) — this becomes part of the Kit integration work, not
a separate piece. `ReadingRoomCheckoutButton`'s current "always open Paddle checkout" behavior
needs to branch: an email-capture form for people starting a trial, Paddle checkout only for
people who are already trialing (or skipping the trial) and ready to subscribe. Paddle's
subscription-lifecycle webhook (`app/api/webhooks/paddle/route.ts`) only ever sees people from
the point they actually check out — it does not see trial-start events, since those never touch
Paddle.

**Future implications**: The 7-day countdown and "did they convert" branching for the sales
sequence lives entirely inside a Kit automation, not in this app's code — the app's only
responsibility is firing the initial "trial started" tag and, later, whatever Paddle webhook
events mark a conversion or the absence of one. If Kit ever can't express the timing/branching
needed, that would have to be reconsidered, but Kit's automation feature is built exactly for
this kind of tag-triggered, time-delayed sequence.

---

## 2026-09-22 — Kit object mapping: forms for the Reading Room trial, tags for everything else

**Decision**: The Reading Room trial signup uses a Kit **form** (`KIT_READING_ROOM_FORM_ID`).
The general free-list entry points (direct newsletter signup, the article "send this list to
me" popup) use **tags** (`KIT_NEWSLETTER_TAG_ID`, `KIT_SEND_LIST_TAG_ID`) instead. A separate
durable tag (`KIT_READING_ROOM_TAG_ID`) tracks "currently has an active Reading Room
relationship," applied at trial start and by the Paddle webhook on conversion, removed on
cancellation. This refines, not reverses, the "Email/subscriber architecture" decision
recorded 2026-09-21 — the base-group/Reading-Room-tag model is unchanged; only which Kit
object (form vs. tag) implements each entry point changes.

**Context**: While wiring up the real Kit account, the free-list signup was initially built
against a Kit **form**, on the (incorrect) assumption that a form was the natural equivalent
of "the free list." The user caught this: Kit has a single audience, not separate lists per
form — a form and a tag are just two different ways of labeling the same subscriber pool. The
question is which Kit mechanism to use for which entry point, not which "list" someone joins.

**Reasoning**: Kit forms are themselves a native automation trigger ("subscriber submits this
form" is a valid trigger condition in Kit's automation builder) — the Reading Room trial is
the one entry point that actually needs to kick off a multi-day automated sequence (the 7-day
daily catalogue + sales sequence, per the 2026-09-21 decision), so it's the one that benefits
from being a form. The general free-list entry points don't need that — they just need
source attribution for reporting, and tags (which this app's own code adds directly via the
API, and which the Paddle webhook can also remove, unlike a form subscription) are the
simpler, more appropriate mechanism there. Kit's own weekly-recap broadcast reaches the whole
audience regardless of tag, so no tag is functionally required for recap delivery — the
free-list tags exist purely for attribution, not gating.

**Alternatives considered**: Use tags for everything, including the Reading Room trial —
rejected because it would forfeit Kit's native form-submission automation trigger, requiring
either a manual/duplicated automation setup keyed off a tag instead, or app code to
orchestrate the sequence itself (contradicting the existing decision that Kit runs the
sequence entirely as its own automation, no app code involved).

**Consequences**: `lib/integrations/kit.ts` already exposed both `addSubscriberToForm` and
`tagSubscriber` as separate functions (added the same day, see the `groqFetch`-adjacent Kit
API-verification work below), so this was a call-site and env-var change, not a new
integration: `/api/subscribe` now tags by source instead of adding to a form.
`KIT_PUBLICATION_FORM_ID` was renamed `KIT_READING_ROOM_FORM_ID` (same underlying Kit form,
reused rather than recreated, since nothing depended on the old semantics yet) and two new
tags (`KIT_NEWSLETTER_TAG_ID`, `KIT_SEND_LIST_TAG_ID`) were created in the real Kit account.

**Status**: confirmed with the user 2026-09-22 before implementing.

---

## 2026-09-22 — Move the Reading Room trial sequence from Kit to Resend Automations

**Decision**: The Reading Room trial's 7-day daily-catalogue-and-sales-sequence email
automation runs on **Resend Automations** (`resend.events.send({ event:
"reading_room_trial_started", email })`, triggered from `/api/reading-room/start-trial`),
not Kit. Kit's role narrows to what the user called "Reading Room memberships": the durable
`KIT_READING_ROOM_TAG_ID` tag tracking who currently has an active trial/paid relationship,
still applied at trial start and updated by the Paddle webhook on conversion/cancellation.
Kit still owns the free-list tags, the weekly recap (RSS-to-email), and the "send this list
to me" subscribe call. Resend now owns all actual multi-step sending except the weekly
recap broadcast. This refines the 2026-09-22 "Kit object mapping" decision above — the
`KIT_READING_ROOM_FORM_ID` Kit form created for this purpose is no longer called by app code
(harmless to leave configured in Kit; just unused).

**Context**: Setting up the Reading Room trial automation in Kit revealed it's a **paid**
feature — Kit's free plan has no automations at all; they require the Creator plan
($33/month). Reading Room's entire trial mechanism was designed to depend on this. Checking
alternatives, Resend (already an approved vendor in this project, used for the "send this
list to me" transactional email) shipped its own Automations feature in April 2026: a
visual, event-triggered, multi-day sequence builder with wait/delay steps, and its **free
plan includes 10,000 automation runs/month** — the feature itself isn't paywalled the way
Kit's is.

**Alternatives considered**: Pay for Kit Creator ($33/mo) — keeps everything already built
as-is and consolidates all email in one vendor, but is a real new recurring cost for a
feature Resend already covers for free. Build the sequence logic entirely in this app's own
code (cron/scheduled sends) — rejected as unnecessary complexity per Operating Manual §5;
Resend Automations already solves exactly this problem. Move the weekly recap to Resend too
— considered and explicitly declined by the user for now, since Kit's RSS-to-email is a
native, no-code fit for that specific job and there's no concrete reason yet to give it up.

**Reasoning**: Avoids a new $33/mo recurring cost by using a capability an already-approved
vendor added for free, rather than paying a second vendor for the same job. Confirmed the
free plan's sending cap (100 emails/day, 3,000/month) before recommending this — acceptable
at current (pre-launch) scale, worth revisiting if trial volume grows enough to approach it.
Verified the exact API shape (`resend.events.send`, `{ event, email, payload? }`) against
the installed SDK's own type definitions after upgrading `resend` from 4.8.0 (which predates
this feature entirely) to 6.28.1, not just against marketing/doc pages — the same rigor
applied to the Kit forms/tags bug found earlier the same day, after that bug demonstrated
doc-only verification isn't sufficient.

**Consequences**: `lib/integrations/resend.ts` gained `triggerReadingRoomTrialEvent`;
`/api/reading-room/start-trial` now calls Resend first (required — the trial's actual value)
and Kit's tag second (best-effort membership bookkeeping, degrades to a 207 partial-success
response rather than failing the whole request if Kit's tag call fails). The `resend` npm
dependency bump (4.8.0 → 6.28.1) was verified against the existing `sendBookListEmail` call
(`emails.send`) — signature unchanged, typecheck and full `next build` both clean.
**Still needed**: `RESEND_API_KEY` isn't in `.env.local` yet (see CURRENT_STATE.md), so this
hasn't been verified end-to-end against a real account the way the Kit changes were; and the
actual automation (content + timing) needs to be built in Resend's dashboard, triggered on
the `reading_room_trial_started` event — account-side work, not code.

**Status**: confirmed with the user 2026-09-22 before implementing (the newsletter-to-Resend
question was asked separately and declined — recap stays on Kit).

---

## 2026-09-22 — Build the weekly recap ourselves via Resend, not Kit's RSS-to-email

**Decision**: The weekly Publication recap is sent by a Vercel Cron job (`vercel.json`,
`GET /api/cron/weekly-recap`, weekly on Sundays) that reads the last 7 days of articles
(`getFeedArticles`, the same content-layer function `/rss` uses), pulls the recipient list
from Kit (`listActiveSubscriberEmails` — Kit remains the free-list source of truth), and
sends via Resend's Batch API (`sendWeeklyRecap`). This replaces the plan (recorded
2026-09-21) to use Kit's own RSS-to-email automation.

**Context**: Checking Kit's actual plan restrictions while investigating the Reading Room
trial-automation cost (see the entry above) found that RSS-to-email is **also** a
Creator-plan-only feature ($33/month) — the free plan only has manual broadcasts, which
would mean composing and sending the recap by hand every week, defeating the reason the
`/rss` feed was built in the first place (automatic composition, no manual writing). This
was a real gap in the 2026-09-21 architecture: it assumed Kit's RSS-to-email was available
on the free plan without actually checking, the same unverified-assumption pattern that
caused the forms/tags bug and the Automations surprise earlier the same day.

**Alternatives considered**: Pay for Kit Creator ($33/mo) — would also restore the option of
moving the Reading Room trial sequence back to Kit, but is a real recurring cost for a
capability that can be built directly. Send the recap manually each week — zero cost, zero
engineering, but not automatic, and the user had already specifically chosen automatic
composition over manual writing (2026-09-21). Both were offered to the user; they chose to
build it.

**Reasoning**: Consistent with the same-day pattern of preferring an already-approved
vendor's free capability over paying a second vendor for the same job (see the Resend
Automations decision above) — Resend's Batch API and the existing `/rss` content-layer
function already cover everything needed; the only new piece is the trigger (Vercel Cron)
and the recipient list (Kit's `/subscribers` endpoint, verified against `developers.kit.com`
the same way other Kit endpoints were verified today).

**Consequences**: New `GET /api/cron/weekly-recap` route, secured by a `CRON_SECRET` shared
secret (generated locally, not tied to any external account — Vercel's documented cron-auth
pattern: the same value set in Vercel's env vars is sent back as `Authorization: Bearer
<value>`). `lib/integrations/kit.ts` gained `listActiveSubscriberEmails` (paginated GET
`/v4/subscribers?status=active`); `lib/integrations/resend.ts` gained `sendWeeklyRecap`,
chunking into Resend Batch calls of 100 with a deterministic idempotency key per chunk
(`weekly-recap-<date>-<chunk-index>`) — Vercel Cron's delivery is best-effort and can invoke
the same scheduled run more than once, so a duplicate invocation within the same day must
not double-send; verified this is how Resend's idempotency key mechanism is meant to be used
via the installed SDK's types. Verified end-to-end locally: the route correctly rejects a
missing/wrong `Authorization` header (401), and correctly found zero articles published in
the last 7 days against the real (currently empty) Sanity dataset — a safe, honest test of
the full auth + content-filtering path without actually emailing anyone, since there's
nothing to send yet.

**Future implications**: Kit's free plan sending isn't a factor here since Resend does the
sending, but Resend's own free-tier cap (100 emails/day, 3,000/month) applies across
*everything* Resend sends — the "send this list to me" transactional emails, the Reading
Room trial sequence, and now the weekly recap all share that same daily allowance. Worth
revisiting if combined volume approaches it.

**Status**: confirmed with the user 2026-09-22 (offered alongside "pay for Kit Creator" and
"send manually"; user chose to build it).

---

## 2026-09-22 — Move the free list from Kit to Resend contacts

**Decision**: `/api/subscribe` (newsletter signup and "send this list to me") and the weekly
recap's recipient list both moved from Kit to Resend's own Contacts/Segments — Kit is no
longer involved in the free list at all. Two Resend Segments (`RESEND_NEWSLETTER_SEGMENT_ID`,
`RESEND_SEND_LIST_SEGMENT_ID`) replace the two Kit tags for source attribution.

**Context**: The prior same-day decision ("Kit holds only confirmed Reading Room members,
never trial-only signups") established that Kit should hold nothing except confirmed,
converted members. That logic applies just as much to the free list: Resend already sends
every free-list email (the one-off list email, and the weekly recap since the RSS-to-email
decision above), so there was no remaining reason for Kit to be the list's system of record
either — it was pure duplicate bookkeeping for a list Kit never acts on.

**Reasoning**: Same reasoning as the Reading Room correction — the vendor that sends
something should be the one that holds the recipient list for it, rather than a second vendor
being a passive middleman. Resend's newer Contacts model (April 2026, replacing the old
mandatory-Audience model with global contacts + optional Segments — see
`https://resend.com/docs/dashboard/segments/migrating-from-audiences-to-segments`) makes this
straightforward: a contact can belong to any number of Segments without needing an Audience
at all, and `contacts.segments.add` addresses a contact by email directly, the same
ergonomics Kit's tag-by-email endpoint had.

**Consequences**: `lib/integrations/kit.ts` lost `addSubscriberToForm` and
`listActiveSubscribers` entirely (both had zero remaining callers — deleted rather than left
unused, unlike `ReadingRoomCheckoutButton`, which has a clear future use once Paddle exists).
`lib/integrations/resend.ts` gained `addToSegment` and `listSegmentContacts`. The two Resend
Segments were created via `resend.segments.create()` directly (not manually in the
dashboard) — non-secret IDs, since the API key already in `.env.local` was sufficient and
segment creation is a routine, reversible, non-account-sensitive action. `KIT_NEWSLETTER_TAG_ID`
/ `KIT_SEND_LIST_TAG_ID` were removed from `.env.local`/`.env.example` (the Kit tags
themselves are harmless to leave configured in Kit's dashboard, just unused going forward).
This had to ship together with the trial-start Kit removal above, not as a truly separate
step — leaving `/api/subscribe` still writing to Kit while `/api/reading-room/start-trial` no
longer did would have been an inconsistent halfway state with no real benefit.

**Verified against the real Resend account, 2026-09-22**: `/api/subscribe` succeeds and
correctly adds the contact to the right segment (`{"subscribed":true,...}`); a direct
`resend.contacts.list({segmentId})` call confirms the contact is really there with the
correct name; the weekly recap route's segment-fetch code path matches that exact response
shape.

**Status**: confirmed with the user 2026-09-22 before implementing.

---

## 2026-09-22 — Kit holds only confirmed Reading Room members, never trial-only signups

**Decision**: `/api/reading-room/start-trial` no longer touches Kit at all — it only fires the
Resend trial event. Kit is never involved until the moment someone actually converts to a
paying subscriber (the future Paddle webhook), at which point it's tagged for the first and
only time. This supersedes the "added at trial start" framing in the "Move the Reading Room
trial sequence from Kit to Resend Automations" entry above, from earlier the same day.

**Context**: The earlier same-day decision still had trial-start tagging Kit's
`KIT_READING_ROOM_TAG_ID` "for membership bookkeeping," on the assumption Kit should track
the relationship from the moment someone starts trialing. The user pointed out there's no
reason for this: Resend already runs and knows the entire state of someone's trial (it's the
system actually sending them anything), so registering them in Kit too is pure duplicate
bookkeeping for a system that never acts on it during the trial. Kit's actual job — established
across several corrections this same day — is being the home for genuine, ongoing Reading Room
*memberships*, not a shadow copy of every trial signup.

**Reasoning**: Removes a redundant integration point with no consumer — nothing reads the
"trialing" tag for anything, since the Resend automation doesn't need it (it already knows who
started via its own trigger) and no other system queries Kit for trial status. Keeping Kit
untouched until real conversion also means Kit's own subscriber count and dashboard stay an
honest reflection of actual paying members, not a mix of trial noise and confirmed members.

**Consequences**: `/api/reading-room/start-trial` (`app/api/reading-room/start-trial/route.ts`)
now only calls `triggerReadingRoomTrialEvent`; the Kit tagging call and its 207
partial-failure branch were removed entirely. `KIT_READING_ROOM_TAG_ID` remains a real env var,
but its only future caller is the not-yet-built Paddle webhook, at actual conversion.
Verified against the real Resend account: the route still returns `{"started":true}`
correctly with no Kit call in the path.

**Status**: confirmed with the user 2026-09-22 before implementing.

---

## 2026-09-22 — Collect a name at every email signup point; redesign the weekly recap format

**Decision**: `/api/subscribe` and `/api/reading-room/start-trial` now require a `name` field
(not just email) at every signup point — the "send this list to me" popup, and the Reading
Room trial-start form. The weekly recap email was redesigned to match a specific format: a
personalized greeting ("Hi {first name}," falling back to "Hi there," when none is on file),
an intro line, then each article as its own block (linked heading, the methodology sentence
as a summary, and the first 3 books' cover images in a row), ending with a "Go to the site"
button. It sends a fixed-size digest (10 most recent articles) rather than everything
published in a trailing window, since publishing volume can exceed 20 articles/week and a
full listing would be unreadable.

**Context**: The user asked for "Hi {name}" personalization in the recap; nothing in the app
collected a name anywhere before this, only email addresses. Separately, the recap's original
"last 7 days" query logic didn't account for actual publishing volume — with 20+ articles/week,
every article from the last 7 days would make for a very long, low-signal email.

**Reasoning**: Collecting a name once, at signup, is far simpler than trying to backfill or
infer it later, and the user flagged it as "important for future email correspondence"
generally — not just this one email. A fixed-size digest with a link to the rest is a standard,
readable newsletter pattern at any publishing volume, where a full trailing-window listing
isn't.

**Consequences**: `lib/integrations/kit.ts`'s `upsertSubscriber`/`tagSubscriber`/
`addSubscriberToForm` all accept an optional `firstName`, sent to Kit's `first_name` field.
`listActiveSubscriberEmails` was renamed `listActiveSubscribers` and now returns `{email,
firstName}` pairs instead of bare strings, since the recap needs the name to personalize each
recipient's copy. `lib/content/index.ts`'s `getFeedArticles` GROQ query was extended to
include each article's first 3 `bookEntries` (title + cover image) for the cover-row
treatment. The Resend trial-start event now carries `name` in its payload too, so the trial
automation's emails can personalize the same way. Verified against the real Kit/Resend
accounts: `/api/subscribe` and `/api/reading-room/start-trial` both reject a missing name
(400) and succeed with one; the recap route still safely no-ops against the real (empty)
Sanity dataset.

**Status**: confirmed with the user 2026-09-22 before implementing.

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

---

## 2026-09-22 — Reading Room price changed from $5/month to $7/month

**Decision**: The Reading Room subscription price is $7/month (still a 7-day free trial, still
no card required to start it). Every prior reference to $5/month across the codebase, docs,
and UI copy has been updated to $7/month.

**Context**: User-directed pricing change, made while discussing where Paddle fits into the
trial/checkout flow, before the actual Paddle Price object exists — no live subscribers or
Paddle configuration affected by this change.

**Consequences**: Updated `app/page.tsx`, `app/the-reading-room/page.tsx`,
`app/the-reading-room/subscribe/page.tsx`, `components/ArticleView.tsx`,
`lib/content/index.ts` (`readingRoomPriceCopy` fallback), `lib/content/types.ts` and
`sanity/schemaTypes/siteSettings.ts` (comments/field descriptions), plus `CLAUDE.md`,
`ARCHITECTURE.md`, and `CURRENT_STATE.md`. Deliberately did **not** edit
`docs/design-specs/rr_landing.md`/`homepage.md` — those are verbatim mirrors of the original
client spec (still $5/month there), not live app content; this decision is the record of the
intentional divergence, per `CLAUDE.md`'s governing-sources rules on how a real change of
product direction gets recorded. When Paddle's actual Price object is created, it must be
created at $7/month to match.

**Status**: user-directed, implemented same session.

---

## 2026-09-23 — Paddle webhook signals Resend via a contact property, not a second event

**Decision**: `app/api/webhooks/paddle/route.ts` now calls `setReadingRoomMemberProperty`
(`lib/integrations/resend.ts`) alongside the existing `setReadingRoomTag` (Kit) call, on the
same four subscription events. It sets a Resend contact property, `reading_room_member`
(type `number`, fallback `0`, created directly via `resend.contactProperties.create()` against
the real account — same pattern as the free-list Segments), to `1` on
`SubscriptionTrialing`/`SubscriptionActivated` and `0` on `SubscriptionCanceled`/`SubscriptionPastDue`.
This is the conversion signal the Reading Room trial automation's post-trial branch needs —
see `CURRENT_STATE.md`, "Still open" under the Paddle section, and `ARCHITECTURE.md` §9's
"conversion-check before each further email."

**Context**: Until now, nothing ever told Resend when someone actually converted — the Paddle
webhook only updated Kit. The trial automation (built 2026-09-22, still placeholder content)
needs to branch on conversion status before each post-trial email, and Resend's own
Automations feature (confirmed via the installed SDK's type definitions,
`node_modules/resend/dist/index.d.mts`) supports two mechanisms for this: a `wait_for_event`
step (branches once on `event_received` vs `timeout`) or a `condition` step reading a contact
property/field (rechecked as many times as needed). Since the automation needs a check
*before each further email*, not a single one-time branch, a persistent, re-checkable contact
property fits better than a second one-shot event.

**Alternatives considered**: Fire a second Resend event (e.g. `reading_room_converted`) and
use `wait_for_event` — rejected because a `wait_for_event` step only catches the event within
its own waiting window; it doesn't naturally support being rechecked before several
subsequent emails days apart, and an event that fired before a later wait step started would
be missed. A contact property survives indefinitely and can be read by a `condition` step at
any point, which is what "before each further email" actually needs. Add a new database —
never considered seriously; would contradict "No application database for V1" for a problem
Resend's own contact-properties feature already solves.

**Reasoning**: Uses a capability of an already-approved vendor (Resend) that exactly fits the
described need, with no new vendor, no new infrastructure, and no persistent state added to
this app itself (Operating Manual §5, §35). Mirrors the existing Kit tag's semantics 1:1 so
the two systems can't drift out of sync about who's a converted member.

**Consequences**: `lib/integrations/resend.ts` gained `setReadingRoomMemberProperty(email,
active, firstName?)` — upserts the Resend contact first (someone can reach Paddle checkout
without ever starting a trial via the landing page's "Subscribe" CTA, so they may not already
be a Resend contact), then updates the property. Verified directly against the real Resend
account (create + PATCH `/contacts/{email}` + GET, matching the exact request/response shape
the SDK's types describe) — not yet exercised through an actual Paddle webhook delivery in
this session (would require either a fresh sandbox purchase or replaying a specific past
event id, neither available without a new real-world sandbox transaction); `npm run build` and
`npm run typecheck` both clean.

**Still needed**: the automation's actual `condition` step(s) reading this property still need
to be built in Resend's dashboard — this decision only makes the signal available, per
`ARCHITECTURE.md` §9's existing framing that automation content/timing is dashboard
configuration, not app code. The post-trial email series itself is also still unbuilt (see
`CURRENT_STATE.md`).

**Status**: implemented this session; not escalated for separate confirmation since it's a
routine, reversible implementation choice consistent with prior same-day-category decisions
above (Segments/Automations both created directly via API without asking the user to click
through Resend's dashboard first).

---

## 2026-09-23 — Newsletter signup added to the site footer (not shown in the design)

**Decision**: Added a "Join the list" free-newsletter signup form (`FooterNewsletterForm`)
to the site footer, submitting to the existing `/api/subscribe` with `source: "newsletter"`.

**Context**: `/api/subscribe` already accepted `source: "newsletter"` and
`RESEND_NEWSLETTER_SEGMENT_ID` already existed (built 2026-09-22), but nothing in the built
UI ever triggered that path — the only free-list entry point the design actually specifies
anywhere is the article "send this list to me" popup (`pub_article.md` §6.4). Checked the
full design-spec set and `DESIGN_PROJECT_BUILD_NOTES.md` before building anything: no footer
or homepage newsletter CTA is described or built there. Per `CLAUDE.md` ("don't invent new
user-facing features... where the design doesn't show it" / escalate when a change "implies a
user-facing behavior the design doesn't show and where more than one plausible behavior
exists"), this was surfaced to the user rather than placed unprompted.

**Alternatives considered**: Homepage-only section (more visible but reachable from one page
only); skip entirely and leave the `newsletter` source unused until a real design need
arises. The user chose the footer.

**Reasoning**: The footer is the standard, low-friction placement for a site-wide newsletter
signup on an editorial site, visible from every page without competing with any page's
primary CTA — and it's genuinely new UI, so the placement decision belonged to the user, not
to me.

**Consequences**: New `components/FooterNewsletterForm.tsx` (client component, mirrors the
existing `ReadingRoomTrialForm`/article-popup pattern: name + email, POST to `/api/subscribe`,
inline success/error state) and `FooterNewsletterForm.module.css`, styled against the same
design tokens already used elsewhere in the footer (`--surface-card`/`--shadow-flat` for
inputs, matching the existing social-icon buttons, since this is new UI with no `.dc.html`
source to port verbatim). `Footer.tsx` gained a fourth column, "Join the list." Verified with
a real Playwright run against a live dev server (desktop + mobile, a real submission
succeeded, no console errors) — see `CURRENT_STATE.md`.

**Status**: confirmed with the user 2026-09-23 (footer, over homepage-only or skipping)
before implementing.

---

## 2026-09-23 — Book rank is derived from array order, never a hand-entered field

**Decision**: Removed the `rank` field from the `article` schema's `bookEntries` object
(`sanity/schemaTypes/article.ts`). A Shortlist book's displayed rank number is now always
`(its position in the bookEntries array) + 1`, computed in `lib/content/index.ts`'s
`toArticle`/`toBookEntry` for every consumer, not read from a stored Sanity field.

**Context**: While reviewing the schema ahead of real content authoring, found that the
on-page article view (`ArticleView.tsx`) already displayed rank numbers from array position
(`{i + 1}`), but the one-off "send this list to me" email (`sendBookListEmail`,
`lib/integrations/resend.ts`) numbered books using the separate stored `rank` field instead.
Those two could silently drift apart: an author dragging book entries into a new order in the
Studio (Sanity arrays support drag-reordering natively) had no reason to also update each
entry's hand-typed rank number, so the on-page order and the emailed order could show
different numbers for the same list. User flagged this as a real authoring risk before
starting to enter real Shortlist content.

**Alternatives considered**: Keep the field but add Studio-side guidance/validation to remind
authors to update it — rejected as treating a symptom; a field that can silently go stale is
worth removing entirely when the "correct" value is always mechanically derivable from
something else that already has to be kept accurate (the array order itself, which directly
controls the visible book order either way).

**Reasoning**: Removing the redundant field removes an entire class of data-entry error
rather than mitigating it — the display order and the rank number can no longer disagree,
because there's only one thing to keep correct (the order you arrange the books in).
Consistent with Operating Manual §5 (prefer simplicity) and §26 ("avoid unnecessary
duplication" in data modeling).

**Consequences**: Schema field removed; `RawBookEntry`/`toBookEntry`/`toArticle` in
`lib/content/index.ts` updated to compute rank from array index, only for categories where
`CATEGORIES[category].ranked` is true (What to Read When / Book Club Book Picks entries get
`rank: undefined`, matching prior behavior — their emailed lists stay unnumbered).
`sendBookListEmail` needed no change; it already just reads whatever `rank` it's given.
Dataset was empty at the time (no migration needed for existing documents). `npm run build`/
`typecheck` clean.

**Status**: user-directed, implemented same session.

---

## 2026-09-23 — Studio: articles grouped by category, not tags; Site Settings pinned singleton

**Decision**: Added a custom Studio sidebar (`sanity/structure.ts`, wired into
`sanity.config.ts` via `structureTool({ structure })`), replacing the default flat
alphabetical per-type list. Articles are grouped into three filtered lists, one per category
(The Shortlist / What to Read When / Book Club Book Picks). Books and Tags stay flat,
top-level lists. Site Settings is pinned as a true singleton — a fixed document id
(`S.document().schemaType("siteSettings").documentId("siteSettings")`), and also removed from
the global "+ New document" menu (`document.newDocumentOptions` in `sanity.config.ts`) so it
can't be accidentally duplicated.

**Context**: Discussed with the user how to make direct-in-Studio authoring (their chosen
workflow — see the "figuring out the best way to author content" conversation, 2026-09-23)
less error-prone before real content authoring starts. The user specifically asked to group
by article/category rather than by tag, reasoning that tag-based grouping will exist on the
hub pages eventually anyway (`pub_hub.md`'s "Browse our Collections" sections, still V1
backlog per `DESIGN_PROJECT_BUILD_NOTES.md`) — mirroring it in the Studio would duplicate a
frontend concern rather than reduce authoring friction. Grouping what the author actually
works with (one article at a time, within one of the three columns) is what actually helps.

**Reasoning**: Matches Operating Manual §17 ("follow established project patterns... prefer
focused changes") and keeps the Studio's organization aligned with the authoring workflow
(one column at a time) rather than the taxonomy model, which belongs to hub-page browsing, a
separate, not-yet-built frontend feature. The Site Settings singleton lockdown prevents a
real, easy-to-hit mistake (accidentally creating a second Site Settings document, after which
`getSiteSettings()`'s `[0]` query would nondeterministically pick one).

**Consequences**: New `sanity/structure.ts`. `sanity.config.ts` gained the `structure` import
and a `document.newDocumentOptions` filter. No schema/data changes — this is purely a Studio
UI/navigation change, safe regardless of what's already in the (currently empty) dataset.
Not independently visually verified this session — Sanity Studio's own login is an
account-tied OAuth flow, not something a headless session can authenticate into, so the user
should confirm the new sidebar looks right the first time they open `/studio`. `npm run
build`/`typecheck` clean, including the `/studio` route itself compiling.

**Status**: confirmed with the user 2026-09-23 (articles-by-category over any tag-based
grouping) before implementing.

---

## 2026-09-23 — Articles need their own taxonomy-group associations (`collectionTags`)

**Decision**: Added `collectionTags` to the `article` schema — an array of references to
`tag` documents, representing which of the 8 "Browse Our Collections" groupings
(genre/character/relationship/trope/mood/theme/setting/experience — `pub_hub.md` §5–12) the
whole article belongs to (it can belong to several at once). Threaded through the content
layer too: `ArticleSummary`/`Article` (`lib/content/types.ts`) and both GROQ projections
(`lib/content/index.ts`), so the data is retrievable, not just capturable — nothing renders it
yet.

**Context**: This corrects a misunderstanding in the same-day "Studio: articles grouped by
category, not tags" entry above. That entry's own reasoning ("the grouping will happen
eventually on the hub pages anyway") was the user's, but I applied it to the wrong layer —
Studio sidebar navigation, which the user hadn't actually been talking about. Re-reading
`pub_hub.md` §5–12 directly, at the user's explicit direction, showed each collection section
is *"a fixed-size selection of relevant articles associated with [Genre/Mood/Trope/etc.]"* —
articles need a direct association with these groupings. Before this, the schema had no way
to express that at all: tags only existed on `book` (canonical descriptors) and as a
per-article-row display override (`bookEntries[].tags`) — neither says anything about what
the *article as a whole* is about.

**Alternatives considered**: Derive an article's groupings implicitly from the union of tags
across its books — rejected; a single article can easily span books with a wide, noisy mix of
tags across every group, with no reliable signal for which groupings the article itself
should surface under. Wait until the hub-browsing feature is actually built to add this field
— rejected: every article authored in the meantime would need to be revisited and re-tagged
retroactively, for a cost of essentially nothing (one more reference-array field) paid now
instead.

**Reasoning**: The user's practical point stands even though it wasn't about Studio
navigation: since real authoring starts now and the hub-browsing feature is only "eventually"
built, capturing the association at write time is far cheaper than a retroactive backfill
later. Matches Operating Manual §7 (architecture should enable change without requiring
unnecessary rewrites) — this is genuinely cheap now and expensive to skip.

**Consequences**: `sanity/schemaTypes/article.ts` gained `collectionTags`.
`RawArticleSummary`/`ArticleSummary` gained the same field, mapped through
`toArticleSummary`; both `SUMMARY_PROJECTION` and `FULL_ARTICLE_PROJECTION` select it (so
`whatToReadNext` summaries carry it too, since that query reuses `SUMMARY_PROJECTION`).
Deliberately **not** built: any hub-page UI that reads or filters by it, or the
engagement-based "strongest-performing articles" selection logic `pub_hub.md` §5–12 also
describes for choosing which articles surface within a grouping once enough data exists —
both remain documented V1 backlog (`ARCHITECTURE.md` §15, `DECISIONS.md` "V1 scope excludes
the logged-in Reading Room product" and the "not modeled in V1" note in `ARCHITECTURE.md`
§6). `npm run build`/`typecheck` clean.

**Status**: user-directed correction, implemented same session.

---

## 2026-09-23 — Split `tag` (book descriptors) and `theme` (article/hub taxonomy) into separate types

**Decision**: `collectionTags` (above) is renamed `themes` and now references a new, separate
`theme` document type (`sanity/schemaTypes/theme.ts`), not `tag`. `tag` goes back to a plain
book-descriptor vocabulary — `name`/`slug` only, `group` removed from it entirely. `theme`
carries `name`/`slug`/`group` (group now **required**, since a theme's entire purpose is
classifying into one of the 8 groupings). Both are added to the Studio sidebar as separate
top-level sections (`sanity/structure.ts`).

**Context**: After the `collectionTags` entry above, the user noticed the field's reference
picker was drawing from the same `tag` list used for book tagging, and clarified the intent:
book tags and article-level hub groupings should be two separate, differently-curated
vocabularies, not one shared pool — even where a tag and a theme happen to share a name (e.g.
both called "Dark Fantasy"), they're deliberately not the same record. Checking actual usage
confirmed `tag.group` had no real purpose left once `theme` existed — nothing in the app ever
rendered a book tag's group (`ArticleView.tsx` only reads a tag's label), so leaving it on
`tag` would have meant two overlapping, confusing "group" concepts on two different types.
Separately, the user flagged that the future Reading Room archive/catalogue (still out of V1
scope) will have its own, independent book/tag model and should not be assumed to reuse
anything built here — both `tag.ts` and `theme.ts`'s doc comments now say so explicitly,
correcting an earlier premature comment on `tag.ts` that had called it "shared... with (later)
Reading Room issues."

**Reasoning**: Book tags are expected to be a large, granular, ad-hoc-growing vocabulary
(whatever nuances describe a given book); themes are a small, deliberately curated vocabulary
meant for hub navigation and a future glossary. Mixing them in one reference list would make
the theme picker cluttered with irrelevant book-level granularity, and would make it unclear
whether picking a "tag" for an article was describing the article or filing it into hub
navigation. Two distinct types make both jobs unambiguous, and both stay simple document
types with no cross-dependency, so nothing here creates lock-in against whatever separate
model the Reading Room catalogue eventually needs (Operating Manual §7).

**Consequences**: New `sanity/schemaTypes/theme.ts`; `tag.ts` lost `group`.
`article.themes` (renamed from `collectionTags`) references `theme`, not `tag`.
`lib/content/types.ts` gained `ThemeRef`/`CollectionGroup`, split from a now-simpler `TagRef`
(no `group`). `lib/content/index.ts`'s `RawTag`/`RawTheme`, both GROQ projections, and
`toArticleSummary`/`toBookEntry` updated accordingly. `sanity/structure.ts` gained a "Themes"
section. `npm run build`/`typecheck` clean; dataset still empty, so no migration needed.

**Status**: user-directed refinement, implemented same session.

---

## 2026-09-23 — Theme groups replaced with the user's own 9-group taxonomy

**Decision**: `theme.group` (and the corresponding `CollectionGroup` TS type) no longer uses
`pub_hub.md` §5–12's original 8 named sections (Genre / Character / Relationship / Trope /
Mood / Theme / Setting / Experience). It now uses the user's own 9 groups: **Genre, Tone,
Mood, Trope, Character Archetype, Relationship, Setting, World Elements, Opening Style.**

**Context**: User-directed change, given directly as a plain list after the tag/theme split
above. This is a genuine divergence from `pub_hub.md`, one of the governing spec documents —
per `CLAUDE.md`'s source-of-truth rules, an intentional change of product direction gets
recorded here rather than left as undocumented drift between the code and the mirrored spec.
`docs/design-specs/pub_hub.md` itself is **not** edited (same precedent as the $5→$7 price
change entry above — it stays a verbatim mirror of the original client spec); this entry is
the record of the intentional departure.

**Reasoning**: Not evaluated for a "better" taxonomy — this is the user's own editorial
judgment about how their catalogue should actually be organized, which is exactly the kind of
call that belongs to them, not something for me to second-guess. Worth noting only as a
side-effect: this also resolves an awkward naming collision from the previous entry, where
"Theme" was both the new document type's name and one of the original 8 group *values* — the
new list drops "Theme" as a group value entirely.

**Consequences**: `sanity/schemaTypes/theme.ts`'s `group` field options and
`lib/content/types.ts`'s `CollectionGroup` type both updated to the 9 new values (multi-word
groups use hyphenated values with human-readable titles in the Studio, e.g.
`character-archetype` / "Character Archetype"). `ARCHITECTURE.md` §6's `theme` bullet, which
had enumerated the original 8 values directly in prose, updated to the new 9 and pointed at
this entry rather than re-describing the list a second place. Dataset was still empty, so no
data migration needed. `npm run build`/`typecheck` clean.

**Status**: user-directed, implemented same session.

---

## 2026-09-23 — Bulk book import via a CSV script, not one-at-a-time in the Studio

**Decision**: Added `scripts/import-books.mjs` (run via `npm run import-books -- <file.csv>`)
— reads a CSV (`title`, `author`, `blurb`, `tags` columns) and creates/updates `book`
documents in Sanity directly via its HTTP API, matching/creating referenced `tag` documents
by name along the way. Articles are still authored directly in the Studio, one at a time (the
user's chosen workflow, confirmed earlier this session) — this is specifically for books,
since they're simple, structured, high-volume records well suited to a spreadsheet, unlike an
article's actual editorial writing.

**Context**: User asked directly whether bulk upload was possible, not wanting to create
every book one at a time in the Studio UI. Confirmed the input format (spreadsheet/CSV) before
building.

**Alternatives considered**: A community Sanity CSV-import Studio plugin — not evaluated in
depth; adds a third-party dependency into the Studio's own runtime for something a ~120-line
script already covers directly against Sanity's own API, which this project already has a
write token for (Operating Manual §35). Sanity's CLI dataset-import tool (NDJSON) — would
still need a script to convert CSV to NDJSON first, so no simpler than writing directly
against the mutate API.

**Reasoning**: Matches this project's established pattern of scripting directly against a
vendor's API with the token already in `.env.local` rather than adding a UI plugin/dependency
(same approach used for Resend Segments/contact properties, Sanity CORS/webhook setup).
Idempotent by design (`book-<slug(title)>-<slug(author)>` as a deterministic `_id`, tags
matched case-insensitively by name) so re-running with an updated spreadsheet is safe.
`csv-parse` added as a devDependency (not shipped in the production app bundle) rather than
hand-rolling CSV parsing — quoted fields with embedded commas are a realistic case for book
blurbs, and that's a known footgun for naive parsers.

**Real bug found and fixed while first testing this against the live dataset**: the dataset
turned out not to be empty — the user had already started adding real tags directly in the
Studio (Thriller, Dark Fantasy, Dark Romance; all still unpublished drafts) before this
script was tested. The script's tag-matching query (`*[_type == "tag"]`) matched the existing
"Dark Fantasy" draft by name and wired a newly created (published) test book to reference
that `drafts.*` id — not valid Sanity practice; a published document shouldn't hold a hard
reference to a draft-only id. Fixed by excluding drafts from the tag-lookup query
(`!(_id in path("drafts.**"))`), so the script only ever matches/reuses published tags and
creates a fresh (published) one if only a draft with that name exists. Verified the fix and
the script's overall correctness against the real dataset: ran with two template rows,
confirmed via a direct query that both books and all 5 newly-referenced tags were created
correctly with the right fields, confirmed the existing "Dark Fantasy" draft was recognized
and not duplicated, then deleted every document the test run created (2 books, 5 tags) via
the API, leaving the user's 3 real draft tags untouched — confirmed via a follow-up query.

**Consequences**: New `scripts/import-books.mjs`, `scripts/books-template.csv` (example/
reference format), `csv-parse` devDependency, `import-books` npm script.
`CURRENT_STATE.md`'s "dataset is empty" claim was also corrected — it no longer is, as of
this discovery.

**Future implications**: This script doesn't handle cover images — deliberately, since image
sourcing is a separate concern from bulk text import. If a bulk image-upload need comes up
later (e.g. once the user has cover image URLs sourced for many books at once), extend this
script rather than building a separate one, since the matching/dedup logic would be the same.

**Status**: user-directed, implemented same session.

**Update, same session**: the user pointed out cover images were missed. Added a `cover`
column (direct image URL) — the script downloads it and uploads it to Sanity's own asset
store (`POST /assets/images/{dataset}`), then references the resulting asset id on the
book's `coverImage` field. A failed download/upload for one row (bad URL, non-image content)
is caught and reported as a warning rather than failing that book or the whole import — the
book still gets created/updated without a cover, since a book with placeholder art
(`ImagePlaceholder`, per `CURRENT_STATE.md`) is a normal, already-handled state on this site.
Also: a blank `cover` cell on a re-run preserves an existing book's current cover (queried
before building mutations) rather than clearing it via `createOrReplace` — otherwise
re-running the same file to add new rows would silently wipe covers set at some point after
the original import. Re-verified end-to-end with real image URLs (picsum.photos test images,
since real cover art wasn't needed to prove the mechanism): both test books got real,
correctly-sized uploaded cover assets with working CDN URLs; cleaned up afterward (2 books, 6
tags, and the 2 uploaded image assets deleted directly via the API), confirmed via a
follow-up query that the user's 3 real draft tags were untouched both times this was tested.

**Second update, same session — local image files, not just URLs**: the user clarified they'd
actually planned to paste images directly into spreadsheet cells (Google Sheets/Excel both
support this), not look up a hosted URL per book. CSV can't hold an embedded image at all —
plain text format, no binary payload — so that specific workflow can't survive a CSV export
no matter what the script does. Presented three real options (keep URLs; export embedded
images to files and reference by filename; or build something that extracts images directly
from a saved `.xlsx`, which is possible since `.xlsx` is a zip of XML + media files, but
Excel-specific and more fragile). User chose exporting to files. `cover` now accepts either
form: a value starting with `http(s)://` is downloaded as before; anything else is treated as
a local file path, resolved relative to the CSV's own directory (not the current working
directory) so a self-contained folder (CSV + a `covers/` subfolder) works regardless of where
the user saves it. A missing/unreadable local file degrades the same way a bad URL already
did — a warning, book still imports without a cover. Verified against the real dataset a
third time: a valid local file uploaded correctly (confirmed via a working CDN URL on the
resulting book), a missing file path failed gracefully with the expected warning and the book
still imported; all test-created books/tags/image assets deleted afterward, confirmed clean
via a follow-up query. `scripts/books-template.csv` updated to reference `covers/*.jpg`
filenames (the recommended path) instead of URLs.

**Third update, 2026-09-23 (late) — first real import**: the user's actual spreadsheet uses
`Cover URL` / `Primary tags` / `Secondary tags` headers with comma-separated tags, so the
script now accepts those as aliases (primary + secondary merged into `tags`) and splits tags
on either `;` or `,` — the user's own format works as exported, no conversion step. A tag name
that exists only as an unpublished Studio draft is now **published** (same id, name + slug
only) instead of left behind while a duplicate published tag is created — the user's 3 draft
tags were their own real tags, never meant to be separate from the imported ones. Book tag
references are deduped by id (a tag in both columns would otherwise produce a duplicate array
`_key`). Cover downloads retry with backoff on 429/5xx and network errors: Open Library's cover
server started refusing (502) after ~25 rapid downloads on the first 49-book run, then dropped
connections on a few more. All 49 books were then confirmed in Sanity with covers, blurbs and
valid tag references.

---

## 2026-09-23 — Article scheduling via `publishedAt`, not Sanity's scheduling feature

**Decision**: An article is visible on the site only once its `publishedAt` time has passed.
Every article query in `lib/content/index.ts` includes `publishedAt <= now()` (hubs, article
pages, homepage rails, RSS, weekly recap, sitemap via the hub query, and `whatToReadNext`
references). The author publishes in the Studio with a future date; the article appears on
its own.

**Context**: User asked whether articles can be scheduled. Previously `publishedAt` only drove
display date and ordering; a future-dated published article appeared immediately.

**Alternatives considered**: Sanity's own scheduled-publishing / content-releases feature —
may require a paid plan (not verified), and would duplicate what `publishedAt`, a field
already required on every article, can express. Not pursued.

**Consequences**: Go-live lag is up to ~5 minutes after the scheduled time (the 300s
revalidate window — the Sanity webhook fires at publish time, not at the scheduled time). A
scheduled article's direct URL 404s until it's live. Verified with two temporary live
articles (past/future-dated): the hub query returned only the past one; both deleted.

**Status**: user-approved 2026-09-23 (option offered alongside Sanity's own feature).

---

## 2026-09-23 — Reader-recommendation rankings stored as their own `ranking` documents

**Decision**: New `ranking` document type (`sanity/schemaTypes/ranking.ts`): a name (the
theme the books were ranked for, e.g. "Thriller") plus an ordered, unique list of book
references — rank = position. The importer gained `--ranking "Name"`, saving the CSV's row
order as that ranking. The first one, "Thriller" (49 books), was created from the user's
first import file's row order.

**Context**: The user pointed out the first import had lost their ranking: the spreadsheet was
the top-ranked thrillers in order, and reader-recommendation ranking is the site's core
premise. Rank is per theme, not per book: the same book can rank differently for "Thriller"
and for, say, "Small Town Mystery".

**Alternatives considered**: A rank number on `book` — can't express per-theme ranks. A list of
`{theme, rank}` pairs on each book — a ranking would be scattered across dozens of documents,
and reordering one would mean hand-editing many numbers that could drift (the same failure
mode that removed `bookEntries[].rank`, see "Book rank is derived from array order"). Reusing
an article's `bookEntries` as the ranking — conflates research data with one published list
drawn from it. Referencing the `theme` type — not done yet: themes are the article-level hub
taxonomy with a required group, and a ranking's subject may not map 1:1 onto one; easy to
add as an optional reference later if wanted.

**Consequences**: Rankings live in their own Studio sidebar section, drag-to-reorder. Nothing
on the site reads them yet. Re-importing with `--ranking` replaces that ranking's order with
the file's — reorder in one place (file or Studio), not both. The Thriller ranking was written
directly (not via a re-import) so the capitalization fixes made directly in Sanity earlier the
same day weren't reverted by the unedited source CSV.

**Status**: user-directed, implemented same session.

---

## 2026-09-23 — "Fill books from ranking": one-click book lists per column

**Decision**: Articles gained `ranking` (reference) and `rankingCount` fields, and a Studio
document action, "Fill books from ranking", that fills `bookEntries` by the user's per-theme
rule (one article per column per theme):

- **The Shortlist**: the ranking's top N books, in rank order.
- **What to Read When**: the top 5 + N more not in that theme's Shortlist article.
- **Book Club Book Picks**: the top 5 + N more not in that theme's Shortlist or What to Read
  When article.

"More books" continue down the ranking; the two unranked columns are shuffled so the top 5
don't read as a ranking (pub_article.md §10.2–10.3). Exclusions are found by looking up the
sibling articles (drafts or published) that reference the same ranking, so the Shortlist
should be created first; the action warns if a sibling column's article is missing. Rules live
in a pure function (`sanity/lib/pickBooksFromRanking.ts`), the Studio wiring in
`sanity/actions/FillFromRankingAction.tsx`.

**Context**: User asked to automate adding books to articles one by one. The three-column
rule is theirs; "continue down the ranking", "shuffle", and "Shortlist first" were my
recommendations, accepted by the user.

**Alternatives considered**: Compute an article's books live at render time from the ranking
— rejected: per-entry blurb/tag overrides need real entries to attach to, and a published
article silently changing when a ranking is reordered isn't desirable. A script run on
request (like the book importer) — rejected in favor of a Studio button the user can use
without asking me.

**Consequences**: The fill is a one-time snapshot into the draft; clicking again replaces the
list (with a confirmation, since per-entry overrides are lost). Verified against the real
Thriller ranking with three temporary draft articles (Shortlist 10, WTRW +7, Book Club +8):
ranks 1-10 in order; top 5 + ranks 11-17 shuffled; top 5 + ranks 18-25 shuffled; no overlap
or duplicates; temporaries deleted. The Studio button itself wasn't clicked this session
(Studio login is the user's own OAuth) — the user's first use is its UI check.

**Status**: user-approved 2026-09-23.

---

## 2026-09-24 — Site queries must request the `published` perspective explicitly (bug fix)

**Decision**: `groqFetch` sends `perspective=published` on every normal query.

**Context**: Found while planning Studio preview. At API version `2025-01-01`, an authenticated
query's default perspective is `raw`, which returns `drafts.*` documents alongside published
ones, and `groqFetch` always sends the token. Confirmed live: the hub query returned the user's
unpublished Shortlist draft. It was only hidden because its `publishedAt` was in the future. On
that date it would have gone live without ever being published, and any draft edit to a
published article would have appeared as a duplicate.

**Consequences**: Verified live: the same query returns nothing with `published`, and the draft
under `drafts`. Shipped on its own before the preview work (commit `a8ee79b`).

---

## 2026-09-24 — Studio preview via Presentation tool + draft mode, secret check reimplemented

**Decision**: Sanity's Presentation tool (titled "Preview" in the Studio) shows the real site,
including unpublished and scheduled content, only to people logged into the Studio. The handshake
is the standard one: the Studio writes a short-lived `sanity.previewUrlSecret` document with the
editor's own session, and `/api/draft-mode/enable` checks it and turns on Next.js draft mode. In
draft mode `groqFetch` reads the `drafts` perspective uncached and passes `$includeScheduled` so
the scheduling filter lets future-dated articles through. `/api/draft-mode/disable` exits.
`PreviewBanner` shows an "exit preview" bar if a preview-mode page is opened outside the Studio,
since the cookie covers the whole site in that browser.

**Context**: The user asked how to preview a scheduled article before it goes live. Surfaced
before building since it concerns who can see unpublished content; the user approved.

**Alternatives considered**: A preview link protected by our own shared secret env var. It
works, but it's a password to create, store on Vercel and never leak, and anyone holding the
link can view. The Studio-issued secret ties access to Studio login instead. Using
`@sanity/preview-url-secret` / `defineEnableDraftMode` directly was rejected: the package
requires `@sanity/client` v7 (the project is on v6, npm refused), and it validates through
`@sanity/client`'s `fetch`, the path this app avoids (see the `groqFetch` decision). So
`lib/sanity/previewSecret.ts` mirrors the package's `validatePreviewUrl` (same query, 1-hour
TTL, parameter names) over a plain fetch. Only the per-session secret is accepted; the
package's optional "share preview access" link mode is not supported.

**Consequences**: Client components (`ArticleView`, `CategoryHub`) now import `CATEGORIES`
and hub paging constants from `lib/content/categories.ts` / `lib/content/hubPaging.ts`
instead of `lib/content`, because `groqFetch` now imports `next/headers`, which can't be
bundled for the browser. Pages remain statically cached for visitors. Verified end-to-end
against a local production build and the real dataset:
- a visitor gets 404 for the draft article, and the hub doesn't list it;
- a fake secret gets 401;
- a Studio-format secret (created via API to stand in for the Studio) enables preview: the
  draft article renders and the hub lists it;
- an off-site redirect target is reduced to a same-site path;
- exiting preview restores the 404.

The test secret was deleted afterwards. The Studio's Preview tab itself wasn't opened (Studio
login is the user's own OAuth), so the user's first use is its UI check.

**Status**: user-approved 2026-09-24.

---

## 2026-09-24 — Article meta description field; book tags moved above the blurb; covers fixed

**Decision**: Articles gained a required `metaDescription` field (Studio warns outside roughly
70-160 characters). It's the page's `<meta name="description">` and Open Graph description,
the summary on the hub's "Newest in…" lead card, the RSS item description and the weekly
recap's per-article summary. Each falls back to the methodology sentence when it's empty, so
nothing breaks for articles authored before the field existed. Separately, each book entry's
tag pills now sit directly under the book's author, above the blurb.

**Context**: User-directed. There was no description field, so search results, link previews
and the hub lead card all reused the methodology sentence. The design's hub lead card
(`The Shortlist.dc.html`) shows a summary sentence there that is distinct from the methodology
box's text, so a dedicated field matches the design better, not just SEO. The "All articles"
grid cards were left as they are (title + book count/date): the design shows no summary there.
The recap previously used the methodology sentence as its summary (2026-09-22 format
decision); the user asked for the description to be the article preview "wherever necessary",
which includes the recap.

**Tag placement** departs from `pub_article.md` §5 ("quiet tag/chip treatments beneath the
blurb") and the built design, at the user's direction (confirmed: each book's tags, not the
article's category pill). `pub_article.md` is not edited (verbatim mirror); this entry is the
record.

**Bug fixed alongside**: book covers never showed in articles. `ArticleView` passed title and
author to `BookCover` but never the uploaded cover image, so every book showed the design's
coloured stand-in. "What to read next" cards had the same gap for article hero images.
Verified in a local production build, in preview mode against the user's real Shortlist draft:
15/15 covers load, tags render under the author, the hub lead card shows the description, no
console errors.

---

## 2026-09-24 — Site timezone is US Eastern

**Decision**: Article dates on the site (article byline, hub lead card, hub card meta) are
formatted in `America/New_York` (EST/EDT) via `lib/content/dates.ts`, and the Studio's
"Published at" field displays and takes input in the same zone (`displayTimeZone`, switching
disabled). Scheduling itself is unchanged: `publishedAt` is stored as an absolute instant.

**Context**: User-directed ("use EST"). Dates were formatted in whatever timezone rendered the
page: UTC on Vercel, the user's own UTC+1 in the Studio. An article the user scheduled for just
after midnight their time would have shown the previous day's date on the site. Formatting in
a fixed zone also stops server and browser rendering from disagreeing near midnight.
`America/New_York` rather than a fixed UTC-5 offset, so daylight saving is handled.

**Consequences**: The user's first three articles, entered as ~00:07-00:25 on Sept 26 UTC+1,
are 7:07-7:25 pm Eastern on Sept 25 and display as September 25. RSS `pubDate` stays UTC (the
RSS format expects an absolute timestamp).

---

## 2026-09-24 — SEO checks for Shortlist articles in the Studio

**Decision**: Shortlist articles have a `focusKeyword` field (hidden for the other two
columns) and Studio warnings, never publish-blocking errors, on the fields it should appear in:
title, slug, meta description and the intro's first paragraph. The title also gets a warning
past 60 characters. A check passes when every meaningful word of the keyword appears in any
order, singular or plural, so "15 Thriller Books ... Reader Recommendations" satisfies "thriller
book recommendations"; small words ("for", "a", "the") are ignored. "Fill books from ranking"
fills an empty keyword with "<ranking name> book recommendations", the user's stated convention,
and the empty-keyword warning suggests the same. Rules: `sanity/lib/seoChecks.ts`; wiring:
`sanity/schemaTypes/article.ts`.

**Context**: User asked for SEO-compliance checks in Sanity, targeting theme + "book
recommendations" for each Shortlist article.

**Alternatives considered**: A third-party Sanity SEO plugin (Yoast-style panes). Rejected: a new
dependency inside the Studio runtime for a handful of rules this project can state exactly in
~60 lines, and its checks wouldn't know this site's keyword convention (Operating Manual §35).
Exact-phrase matching: rejected, since natural titles rarely contain the literal phrase and the
user's own first title would fail it. Errors instead of warnings: rejected so SEO advice can
never stop an article going out.

**Consequences**: Checked against the user's real Shortlist draft: title passes the keyword
check but is 73 characters (warned); slug lacks "recommendations" (warned); intro passes; meta
description not yet written. The warnings themselves in the Studio UI weren't seen this session
(Studio login is the user's own), so the user's first look is that check.

**Revised same day against the user's chosen SEO sources** — Backlinko, "Blog SEO: The Complete
Guide" (backlinko.com/hub/content/blog-seo) and "How to Rank Higher on Google in 2026"
(backlinko.com/rank-high-on-google), read in full at the user's request so the checks optimize
for the right things. Changes:
- **Meta description no longer checked for the keyword.** The guide is explicit: Google doesn't
  use descriptions for ranking; they exist to earn clicks. Replaced with a uniqueness check (warn
  if another article has the same description) and field guidance to write for click-through.
- **Slug**: added warnings for more than 5 words ("short URLs" correlate with rankings) and for
  numbers ("evergreen URLs": a book count or year goes stale if the list changes).
- **Intro**: keyword checked across the whole intro, not just the first paragraph (the guide says
  "intro"). Its "and conclusion" advice has no field to check: articles have no conclusion.
- **Internal links**: warning when a Shortlist article has no "What to read next" articles.
- **Hero image alt text**: warning when an image has no alt text.
- **Book titles are now `<h2>` headings** (previously `<span>`), styling unchanged. The guides
  tie list-style featured snippets and AI Overview passage matching to subheadings; a ranked list
  whose items aren't headings can't be read as a list by either.

**Not done, needs a decision** (see `CURRENT_STATE.md`): links inside intro text are flattened to
plain text by `portableTextToParagraphs` (a deliberate 2026-09-21 match to the design's plain
intro paragraphs), so authors can't add the in-body internal links the guides recommend. A
keyword-bearing subheading beyond the H1 would need new UI the design doesn't show.
Off-page and strategy advice (backlinks, brand mentions, original research, topical depth, page
speed, mobile) isn't something Studio checks can enforce; mobile polish is already a
scheduled end-of-build pass.

---

## 2026-09-24 — Article intros support links (internal and external)

**Decision**: `article.introText` now has two link types: "Link to article" (a reference to
another article, resolved to `/<category>/<slug>` in GROQ) and "Web link" (http/https/mailto).
The article page renders them as real links, in the methodology link's style; web links open in
a new tab. An article link whose target isn't live for the viewer (unpublished or scheduled)
resolves to `null` and renders as plain text, never a dead link. Bold/italic are still flattened,
per the design's plain intro paragraphs.

**Context**: User-approved, following the Backlinko reading above: the guides recommend 5-10
internal links from each post with descriptive anchor text, and intros were the only free-text
place to put them. This reverses the 2026-09-21 choice (recorded in `lib/content/portableText.ts`)
to flatten intro links to plain text.

**Alternatives considered**: A plain URL link only (the default Sanity annotation). Rejected for
internal links: typing `/the-shortlist/...` by hand breaks silently when a slug changes (as it
just did for the first Shortlist article) and can link to an unpublished article.

**Consequences**: `introParagraphs` is now `IntroSegment[][]` (text segments, optional `href`).
Verified with a temporary future-dated article (deleted afterwards): the visitor-perspective query
returns `null` for a link to an unpublished article and the URL for a web link; in preview the
page renders both as working links with no console errors.

---

## 2026-09-24 — Hero images: 2400 × 1600 design size; Studio crop and hotspot honoured

**Decision**: Article hero images are designed at 2400 × 1600 (3:2), subject centred. The site
now applies the Studio's crop (Sanity image `rect` parameter) and hotspot (CSS
`object-position`) everywhere a hero image appears. The size guidance is in the Studio field
description.

**Context**: User asked for the featured-image design size. One image is cropped to five shapes:
12:5 article hero, ~16:9 hub lead, 3:2 hub cards / What to read next, 4:5 homepage Shortlist and
What to Read When rails, 1:1 homepage Book Club pairs, plus ~1.91:1 link previews. The region
all of them keep on a 2400 × 1600 image is the centre 1280 × 1000. The Studio already offered
a hotspot (`options.hotspot`), but pages used the raw asset URL and always cropped from the
centre; the user approved making it work.

**Alternatives considered**: A `next/image` loader generating per-size Sanity crops
(`fit=crop` + focal point). More exact framing, but it replaces the image pipeline for every
image and moves optimisation from Vercel to Sanity; `object-position` keeps the focal point in
view with a small, contained change. Revisit if exact centring on the focal point is ever needed.

**Consequences**: Verified with a temporary future-dated article (crop + hotspot on a borrowed
asset, deleted afterwards): the article hero requested the expected `rect`, and the article, hub
lead and homepage images all used the expected 25%/25% position; no console errors.

**Corrected same day — design size is 2400 × 1000, not 2400 × 1600.** The user's first real
hero image (2400 × 1600, scene along the bottom edge) lost its top and bottom on the article
page: the article banner is a fixed 12:5 (720 × 300 on desktop, measured), so any 3:2 image
loses about a fifth top and bottom there. Measured the other placements (hub lead 590 × 350 at
1280 and 1920 wide, 390 × 200 on mobile; cards 3:2; homepage 4:5 and 1:1; link previews ~1.91:1):
none is wider than 12:5, so an image designed at the banner's shape shows in full on the article
and only ever loses its sides elsewhere. The rule for designers becomes one sentence: 2400 × 1000,
main subject in the middle third. Studio field description updated.

**Confirmed with the user same day**: images stay cropped to fill each placement (the built
design), designed at the article banner's 12:5 so the full image shows there, with sides trimmed
elsewhere. Considered and declined: never cropping anywhere (letterboxing every placement, which
leaves large empty bands on the 4:5 homepage cards), and uncropped article banner + hub lead only.

---

## 2026-09-24 — Phone layout pass (first round)

**Decision**: Phone-width (≤600-700px) adaptations where the design only specifies desktop:
- **Book entries**: rank + cover + title/author/tags on top, blurb full width underneath (CSS
  grid with `display: contents` on the body, so desktop markup and layout are untouched).
  Previously the blurb sat beside the cover in a ~190px column; the Shortlist article is ~35%
  shorter on a phone as a result.
- **Header**: stays in normal flow (not sticky) at ≤700px, and the divider is hidden. The design's
  header wraps to ~180px on a phone; pinned, it would cover a fifth of the screen. A menu
  button was not added: new navigation UI the design doesn't show.
- **Homepage intro well**: left-aligned instead of justified at ≤600px (justified text opened
  wide word gaps at that width).
- **Send-list popup**: fields and button stacked at ≤600px (the email field was cut off); larger
  close button and callout-link tap areas.

**Context**: The user's end-of-build mobile pass (deferred 2026-09-22), prioritised because the
first articles go live 2026-09-25 and What to Read When / Book Club Book Picks are social-first.
Audited every page at 390px: no page scrolled sideways before or after. Verified after:
phone screenshots of home and all three articles, and the desktop article unchanged.

**Second round, same day — after reading the user's three mobile guides** (Michael Bell "How to
build mobile responsive sites in 2026", Network Solutions "mobile-friendly website checklist",
Capi Product "10-point UX audit checklist"):
- **Fonts self-hosted via `next/font`** (`app/fonts.ts`) instead of the design's render-blocking
  Google Fonts `@import` (`styles/tokens/fonts.css`, now commented out with the original kept for
  reference). Same families, weights and styles; the `--font-*` tokens point at the next/font
  variables in `app/globals.css`. Lighthouse (mobile, local production build vs the live site
  before): performance 79-93 → 91-97, layout shift ~0.1 → ~0. Verified the same faces render and
  no requests go to Google Fonts.
- **Forms**: `autocomplete` (given-name / email) on every signup field, and `aria-label`s where
  fields only had placeholders (article popup, Reading Room trial form).
- **Header**: also unpinned on short (sideways) screens; divider hidden below 1000px wide, where
  the pill otherwise wraps and leaves it dangling (measured: one row down to ~740px wide);
  ~40px-tall tap areas on phones.
- **Hub**: "All articles" is an `h2` (was `h3` after the page's `h1`, a heading-order failure).
- **Tested in WebKit** (Safari's engine), iPhone portrait and landscape, on public pages: no
  sideways scroll or console errors. Article pages couldn't be previewed in WebKit locally because
  Safari rejects the secure preview cookie over plain-http localhost; not an issue in the real
  (https) Studio.

**Surfaced to the user, not changed** (design decisions): colour contrast (the header's inactive
links, grey body text and some category accents measure 3.2-4.4:1 against the 4.5:1 guideline);
a collapsible menu on phones (all three guides recommend one; the design has none); the send-list
popup as a full-screen overlay on phones (the guides advise against intrusive pop-ups). The
remaining "best practices" miss is the missing favicon (404), awaiting the user's icon.

**Footer signup box** (user-directed, same day): the "Join the list" label, fields, button and small
print sit in one card (`--surface-card`, `--radius-xl`, 24px padding) with a single 14px gap
between every element; fields use the article popup's inset style so they read against the card.
Measured: 14px between all elements, 24px inner padding, desktop and phone.

**Third round, same day — user decisions on the guides' design-changing tips** (asked via a
question box after the user pointed out the earlier summary glossed over unimplemented tips):
- **Phone menu** (user chose it over keeping all links visible): at ≤700px the header is the
  wordmark + a menu button; the nav opens as a list (44-46px tap targets), closes on Escape, on
  tapping a link and on route change. `Header` is now a client component. Compact (65px), so it
  stays pinned on phones again; short (sideways) screens still unpin it.
- **Send-list popup on phones**: a bottom panel sliding up (no dim overlay, article stays
  visible, safe-area padding, reduced-motion respected), above the editor-only Preview bar.
  Desktop unchanged. This also covers the "thumb zone" tip; nothing else was pinned to the bottom
  (user's choice).
- **Contrast** ("darken just enough"): four text-only shades in `app/globals.css`
  (`--text-soft`, `--clay-text`, `--sage-text`, `--sky-text`), each the design colour darkened
  12-21% to reach ≥4.6:1, applied only where text failed (header links, homepage grey copy, About
  column links/labels and email link, popup small print). Palette tokens unchanged. Left as
  designed: the homepage stratosphere's deliberately faded requests (decorative, and the design
  notes warn against restyling it) and image-placeholder captions (vanish once images exist).
- **Visible form labels**: kept as placeholders (user's choice).
Also done: footer link hit areas fill their column gap (37-44px, layout unchanged); `.tap-area`
helper on small standalone links; tap feedback (opacity) on touch screens; specific form errors
from the API's message (`lib/formError.ts`); icons bundled inline (`components/ds/Icon.tsx`, no
jsdelivr requests); hero image `sizes="340px"` + `fetchPriority="high"`; 12px minimum on the
fallback book-cover author text. Tested in Firefox (no layout or console issues).

**Deliberately not done**: the "legacy JavaScript" audit (~11 KB). Removing it means raising
the supported-browser floor to 2023-era browsers (Safari 16.4+), which would drop older iPhones
that can't update — a poor trade for 11 KB on a social-first site. Lighthouse after (local
build): accessibility 100 on About, The Shortlist and Contact; 95-96 on Home and The Reading Room
(only the two left-as-designed items above).
**Measured live after deploy (Lighthouse mobile, production URL)**: performance 91-96 (was
79-93 before the mobile rounds), accessibility 95-100, layout shift 0 on every page (was ~0.1).
Largest-contentful-paint 2.6-3.0s — improved but still above the 2.5s target under Lighthouse's
simulated slow-4G throttling; not claimed as met. Remaining levers (inlining critical CSS,
smaller hero image) are diminishing returns, noted in CURRENT_STATE.md.

**Phone menu styling** (user's choice from three options, same day): the open menu is a floating
card (`--surface-card`, `--radius-xl`, `--shadow-float`) 8px below the header, over a light
backdrop that closes it when tapped; the header bar itself isn't dimmed. Chosen so the menu
doesn't read as the bar extending downwards in the same colour. Alternatives offered: a
full-screen dark menu; an attached lighter drawer.
