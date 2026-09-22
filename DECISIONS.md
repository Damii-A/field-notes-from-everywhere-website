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
