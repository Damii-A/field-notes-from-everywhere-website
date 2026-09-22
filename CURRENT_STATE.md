# Current state — Field Notes From Everywhere

Last updated: 2026-09-22 (Kit connected; Reading Room trial + weekly recap both moved off
Kit's paid Automations/RSS-to-email onto Resend Automations + a self-built Vercel Cron job)

## What exists right now

The full V1 site structure is implemented and builds/runs cleanly (`npm run build`, `npm run
dev`). As of this update, it's connected to a **real, live Sanity project** and reads real
content through actual GROQ queries — not mock data. See "Sanity connection" and "Content
layer" below. Verified with `npm run build` (0 errors/warnings), `npm run typecheck`, and a
manual end-to-end content test (temporary Tag/Book/Article documents created directly in the
live dataset, confirmed rendering correctly on the hub, article, and home pages with resolved
book references and tags, then deleted).

## Sanity connection

- **Project**: `7ci7c80z`, dataset `production` — real, live, created 2026-09-21. Values are in
  `.env.local` (`NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`,
  `SANITY_API_TOKEN`). The dataset is currently **empty of real content** (nothing authored in
  the Studio yet) — every page that depends on content handles this gracefully (see "Empty
  content state" below) rather than crashing.
- **CORS**: `http://localhost:3000` and `http://localhost:3001` are allowed (added via the
  Sanity management API 2026-09-21, since neither was there by default and the embedded Studio
  needs it to work from the browser). **Still needed**: add the production/preview domain to
  Sanity's CORS allowlist once this deploys to Vercel — the Studio will otherwise fail there
  with a CORS error the same way it would have here before this was added.
- **Token exposure note**: the current `SANITY_API_TOKEN` value passed through this session's
  transcript at least once (an IDE file-change notification echoed it automatically). Low risk
  since it was only visible within this session, but rotating it in Sanity's dashboard before
  going further is cheap insurance if that matters to you.
- **`SANITY_WEBHOOK_SECRET`** is still unset. Until it's configured (both the env var and an
  actual webhook pointed at `/api/webhooks/sanity` in Sanity's project settings), content
  edited in the Studio won't show up on the live site until the 5-minute cache window expires
  on its own — see "Content layer" below.

## Content layer

`lib/content/index.ts` now runs real GROQ queries instead of serving `lib/content/mock-data.ts`
(deleted, along with `lib/content/slug.ts` — both fully superseded). Queries go through
`lib/sanity/groqFetch.ts`, a small hand-rolled fetch helper — **not** `@sanity/client`'s own
`.fetch()` method, which was found to have a confirmed environment-specific bug in this app's
Next.js runtime (see the `DECISIONS.md` entry "Content reads use a hand-rolled `groqFetch`" for
the full diagnosis). `@sanity/client` is still used by the embedded Studio itself.

Caching: each query tags its Next.js cache entry by Sanity document type (`article`, `book`,
`tag`, `legalPage`, `siteSettings`) with a 300-second revalidate as a safety net, matching what
`app/api/webhooks/sanity/route.ts` already expects to invalidate on-demand once the webhook is
configured (see above). `groqFetch` always hits `api.sanity.io` directly, never
`apicdn.sanity.io` — the CDN's own eventual-consistency lag would otherwise undercut "content
shows up within seconds."

**Empty content state**: with nothing authored yet, every content-dependent function returns a
sensible empty/fallback value instead of crashing — hub pages show "New articles are on their
way," the homepage hides showcase rails with nothing to show, `getSiteSettings`/`getLegalPage`
fall back to placeholder copy. This was necessary, not optional — the live dataset really is
empty right now, so this path runs in production today, not just hypothetically.

**Portable text**: `article.introText` and `legalPage.body` are Sanity portable text (rich
text blocks). Intro paragraphs are flattened to plain strings (one block → one paragraph,
matching the design's plain-paragraph treatment — see `lib/content/portableText.ts`); legal
page bodies are rendered as real HTML via `@portabletext/to-html` (matches the rich structure
legal copy needs — headings, lists, links).

**Still using mock/placeholder behavior**: none — the "one hand-authored lead article, every
other hub card resolves to a synthesized placeholder" mechanism from the mock-data era is gone
entirely. Every hub card and article now comes from a real Sanity document; nothing resolves
until something is actually published in the Studio.

**Built:**
- Design tokens ported verbatim to `styles/tokens/*.css`, global reset in `app/globals.css`.
- Design-system components actually used by the built pages: `Button`, `Icon`, `BookCover`
  (`components/ds/`). The chat/cart/discover `ui_kits` components in the design bundle were
  confirmed unused by every page read and were not ported — see `ARCHITECTURE.md` §4.
- `Header` / `Footer`, shared across every page.
- Home (`/`) — hero, the reader-request Stratosphere (ported faithfully as a client
  component, including the lane-packing/rejustify algorithm — see `components/Stratosphere.tsx`),
  the three category showcase rails, Reading Room intro section.
- About (`/about`) — full page including the linkable `#how-we-find-the-books` methodology
  section.
- Contact (`/contact`) and the shared legal template (`/terms`, `/privacy-and-cookies`,
  `/disclosures`) — real page structure, placeholder body copy (see open items below).
- All three Publication hubs (`/the-shortlist`, `/what-to-read-when`, `/book-club-book-picks`)
  via one shared `CategoryHub` component — category identity band, latest-article panel,
  "All articles" grid with client-side "See more".
- All three article templates via one shared `ArticleView` component, per category identity
  (colors, hero shape, progress-rail design — bar / curved SVG / dot-chain, matching each
  category's actual built page) — methodology box, book list with periodic "send this list to
  me" callouts, Reading Room banner + floating rail ad, floating share/copy-link control,
  scroll-driven progress rail, send-list popup wired to `/api/subscribe`.
- The Reading Room landing page (`/the-reading-room`) — drifting book-cover hero, book shelf,
  trial section — CTAs wired to `ReadingRoomTrialForm`, an inline email-capture form that
  starts a trial via `/api/reading-room/start-trial`. This only fires a Resend event; Kit is
  never touched (no Paddle involvement either) — see "Email/subscriber integrations" below.
  `ReadingRoomCheckoutButton` (Paddle.js checkout) exists but is unused for now, reserved for
  a future "subscribe now" CTA once Paddle is configured.
- API routes: `/api/subscribe` (Kit + Resend), `/api/webhooks/paddle`, `/api/webhooks/sanity`
  — all functional but gated on env vars that don't exist yet; each returns a clear error
  rather than silently no-op-ing when unconfigured (see "Known open items" below).
- Sanity schema definitions (`sanity/schemaTypes/*`) and embedded Studio config
  (`sanity.config.ts`, `/studio` route) — connected to the real project (see "Sanity
  connection" above); Studio login/editing itself not yet manually exercised end-to-end.
- `sitemap.xml`, `robots.txt`, per-page metadata, 404 page.

## Email/subscriber integrations: Kit + Resend (2026-09-22)

**Current, accurate picture** (see `DECISIONS.md` for the several corrections that got here —
this section describes only the end state, not the history): **Resend sends everything and
holds the free list; Kit holds only confirmed, converted Reading Room members.**

- **Resend** — real account connected (`RESEND_API_KEY` in `.env.local`, independent of the
  one Vercel's marketplace integration provisioned for production). Sends the one-off "send
  this list to me" email, the weekly recap (Vercel Cron), and runs the entire Reading Room
  trial-to-conversion journey via Resend Automations (`reading_room_trial_started` event, no
  Kit call). Holds the free list itself: two Segments,
  `RESEND_NEWSLETTER_SEGMENT_ID`/`RESEND_SEND_LIST_SEGMENT_ID`, created directly via
  `resend.segments.create()` (not the dashboard) since the API key already in `.env.local`
  was sufficient. `/api/subscribe` adds contacts to the right one.
- **Kit** — real account connected (`KIT_API_KEY` in `.env.local`, `lib/integrations/kit.ts`
  verified against the real v4 API). Holds only `KIT_READING_ROOM_TAG_ID` — the confirmed
  member tag, added exclusively by the future Paddle webhook at actual conversion. Nothing
  else touches Kit; `addSubscriberToForm` and `listActiveSubscribers` were deleted from
  `lib/integrations/kit.ts` once their last callers moved to Resend (genuinely dead code, not
  reserved for later). `KIT_READING_ROOM_FORM_ID` was likewise removed from env vars — the
  Kit form itself (created earlier, before Resend Automations took over the trial) is unused
  and can be deleted in Kit's dashboard at the user's discretion, purely cosmetic.

**Verified against real accounts, 2026-09-22**: `/api/subscribe` succeeds and the contact is
confirmed present in the correct Resend segment with the right name (`resend.contacts.list`
checked directly); `/api/reading-room/start-trial` succeeds with no Kit call in the path.

**Still needed**:
- Add `KIT_API_KEY` and `KIT_READING_ROOM_TAG_ID` to Vercel's environment variables (the two
  now-removed `KIT_NEWSLETTER_TAG_ID`/`KIT_SEND_LIST_TAG_ID` don't need adding — **the rest
  done by the user 2026-09-22**, confirmed working after a redeploy).
- Add `RESEND_API_KEY`, `RESEND_NEWSLETTER_SEGMENT_ID`, `RESEND_SEND_LIST_SEGMENT_ID`, and
  `CRON_SECRET` to Vercel's environment variables (check whether `RESEND_API_KEY` is already
  there from the marketplace integration before adding a duplicate; `CRON_SECRET` must be the
  **same value** as `.env.local`'s, since Vercel sends it back verbatim to authenticate the
  cron job — see "Weekly recap" below).
- **In Resend's dashboard** (the user's own account-side task, not code): build the actual
  Reading Room trial automation (welcome, 7 days of trial content, then a conversion-check
  before each further email so it can exit into a single "you're a member" email whenever
  conversion happens, or continue a post-trial conversion series if it hasn't), triggered on
  the `reading_room_trial_started` event. A simple placeholder/test email first is a
  reasonable way to confirm the trigger wiring works before writing the real content.
- `setReadingRoomTag(active=false)` (removing the membership tag on cancellation) is still an
  unimplemented TODO in `lib/integrations/kit.ts` — needs a subscriber lookup-by-email step,
  deferred until the Paddle webhook work makes it testable.

## Immediately next

Per the user's explicit sequencing preference (2026-09-21): content authoring and legal copy
are deliberately last, after the remaining technical/integration work, not next.

1. Add `RESEND_API_KEY` and `CRON_SECRET` to Vercel's environment variables (see "Still
   needed" above) — the last step before the weekly recap cron job actually works in
   production; it's already fully built and verified locally.
2. **In Resend's dashboard**: build the Reading Room trial automation (7 daily catalogue
   emails + sales sequence), triggered on the `reading_room_trial_started` event — account-side
   setup, not app code (see "Email/subscriber integrations" above). App side is fully done and
   verified.
3. Set up Paddle (account + API key + webhook secret + the actual $5/month Price — no trial
   configured on Paddle's side; see "Email/subscriber architecture" below for why).
4. **Last**: author real content in the Studio (which brings the remaining per-article/book
   images with it), and get real legal copy for Terms/Privacy/Disclosures.

## Weekly recap

`app/rss/route.ts` publishes a standard RSS feed of the 30 most recent Publication articles
across all three categories. Originally built so Kit's RSS-to-email automation could compose
the weekly recap automatically — but Kit's RSS-to-email turned out to be a Creator-plan-only
feature too, so the feed's actual consumer is now this app's own weekly cron job instead:
`GET /api/cron/weekly-recap` (`vercel.json`, Sundays). The `/rss`/`/feed.xml` endpoint itself
still exists and still works — useful as a plain RSS feed regardless — it's just no longer
wired into an external automation.

**Recap format (2026-09-22)**: a personalized greeting ("Hi {first name}," falling back to
"Hi there," when no name is on file), an intro line, then a fixed digest of the 10 most
recently published articles (not everything from a trailing window — publishing volume can
exceed 20/week, which would make a full listing unreadable), each as its own block: the
title linking to the article, the methodology sentence as a summary, and the first 3 books'
cover images in a row. Ends with a "Go to the site" button. `getFeedArticles`
(`lib/content/index.ts`) was extended to pull each article's first 3 book entries (title +
cover) for this; recipients come from Resend's two free-list Segments, merged and deduped by
email (`listSegmentContacts`, `lib/integrations/resend.ts`), not Kit. Name collection was
added to every signup point (`/api/subscribe`, `/api/reading-room/start-trial`) specifically
to support this — see `DECISIONS.md`, 2026-09-22.

**Verified 2026-09-22**: the cron route correctly rejects requests without the right
`CRON_SECRET` (401), and correctly found no articles to send against the real (still-empty)
Sanity dataset — a safe, real test of the full path without emailing anyone, since there's
nothing to send yet. The segment-listing code path was verified separately (a direct
`resend.contacts.list({segmentId})` call), since the empty-articles case short-circuits
before reaching it. Both `/api/subscribe` and `/api/reading-room/start-trial` correctly
reject a missing name (400) and succeed with one, verified against the real accounts.
Verified live in production (2026-09-21, before the Kit-to-Resend switch): correct domain in
all links, valid RSS, gracefully empty.

Two real issues surfaced and fixed while building this, worth knowing about for future work:

- **A route folder literally named `feed.xml` 404'd on Vercel specifically** (worked in every
  local test, dev and production mode) — likely Vercel's routing treating any `*.xml`-looking
  path as a static-asset lookup before it reaches app code. Fixed by moving the real route to
  `/rss` and rewriting `/feed.xml` to it. **Lesson: avoid literal dotted/extension-like
  segment names for custom App Router routes on Vercel**, even though Next.js's own docs pattern
  for this looks like it should work.
- **`NEXT_PUBLIC_SITE_URL` → `SITE_URL`**: the `NEXT_PUBLIC_` prefix was never needed (only used
  in server-only route handlers, never browser code), and Vercel outright refused to save it as
  a public variable it suspected might be sensitive-looking. Separately, once saved as a plain
  `SITE_URL` variable, Vercel's dashboard always shows it as blank on re-edit — that's normal
  (values that look sensitive are masked and never redisplayed), not a save failure; the value
  did take effect once a fresh deployment ran. Centralized in `lib/siteUrl.ts`, which also
  strips any trailing slash (the value as entered on Vercel had one, which was producing a
  double slash in `sitemap.xml`'s output).

## Email/subscriber architecture (decided 2026-09-21, Kit/Resend split settled 2026-09-22)

Full reasoning in `DECISIONS.md`; summary here for quick reference:

- **The free list**: direct signup or "send this list to me" makes someone a Resend contact,
  tagged by source (a Segment), receiving the weekly recap of that week's Publication
  articles. Starting a Reading Room trial does **not** touch Kit or add them to the free
  list — it's a Resend-only relationship until they convert (see "Email/subscriber
  integrations" above).
- **Reading Room trial is email-only, not a Paddle trial**: starting a trial just captures an
  email and fires a Resend event. **Resend** runs the entire trial-to-conversion journey
  (welcome, 7 days of catalogue content, a conversion push) with no Kit involvement at all.
  Paddle is not involved until the person actually chooses to subscribe either.
- **Paddle enters only at real conversion**: a real Paddle checkout for the $5/month Price,
  with no trial object configured on Paddle's side. Its webhook then tells Kit whenever
  someone converts, cancels, or has a failed payment — updating their membership tag
  accordingly.
- **Paddle's own transactional emails** (receipts, failed-payment notices) go straight to the
  subscriber; this app, Kit, and Resend are never involved in those.
- **The weekly recap** is composed and sent automatically by this app's own Vercel Cron job
  (not Kit's RSS-to-email, which turned out to be Creator-plan-only too) — see "Weekly recap"
  above. Nothing left to build on the app side; just the Vercel env vars.

## Assets needed

- ~~The homepage hero photo~~ — **done (2026-09-21)**. The design's own placeholder-image slot
  ("Watercolour stack of four books") now shows the user-supplied illustration, at
  `public/images/homepage-hero-books.png`, wired directly into `app/page.tsx`. Note this is a
  **static file bundled with the app**, not a Sanity asset — deliberate, since it's a fixed
  brand/decorative image rather than editorial content that changes; if that assumption changes
  (e.g. the user wants to swap it themselves via the Studio without a code change), it should
  become a `siteSettings` image field instead.
- Every other `ImagePlaceholder` across the site (article heroes, book covers, hub cards,
  Reading Room screenshots) is intentionally a placeholder until real content exists in
  Sanity — this is expected, not a bug to fix now.

## Known open items requiring the user before certain work can proceed

- **Paddle account** — API key, webhook secret, and the actual $5/month Price created in
  Paddle's dashboard (a Price ID this app checks out against). No trial needs configuring on
  Paddle's side — see "Email/subscriber architecture" above; the earlier open question about
  whether Paddle supports a genuinely card-free trial is now moot, since Paddle isn't used
  during the free period at all. Separately, `app/api/webhooks/paddle/route.ts` has a marked
  TODO: resolving a webhook event's `customerId` to an email address (via
  `paddle.customers.get`) before it can actually tag the subscriber in Kit — untestable
  without a real account, so left as a clear gap rather than guessed at.
- **Production domain DNS cutover** — deliberately deferred to near the end of the build (see
  "Deployment" above). The domain's DNS is managed at Cloudflare (nameservers delegated there
  from Namecheap, which is just the registrar).
- **Real legal copy** for Terms, Privacy & Cookies, and Disclosures — currently placeholder
  in the design; needs real text (from the user or their legal counsel) before public launch.
  Deliberately sequenced last, alongside content authoring.

## Known limitations / explicitly out of scope for V1

See `DECISIONS.md` ("V1 scope excludes the logged-in Reading Room product") and
`docs/design-specs/DESIGN_PROJECT_BUILD_NOTES.md` for the full list of what the design itself
cut from V1. In summary: no Reading Room login/Books/Past Issues, no eight-section
"Browse our Collections" taxonomy browsing on hubs, no Recent-Articles carousel — hubs are
category identity → latest article → all articles (+ See more). Confirmed with the user
2026-09-21.

## Remote repository

Connected 2026-09-21: `origin` → `git@github.com:Damii-A/field-notes-from-everywhere-website.git`
(SSH — an existing `~/.ssh/id_ed25519_github` key was already authenticated for this GitHub
account, so no new credentials were needed; note the repo was later renamed to all-lowercase by
GitHub/Vercel — the remote URL was updated accordingly). `master` tracks `origin/master`. Future
sessions should push completed logical work regularly per `AI_ENGINEERING_OPERATING_MANUAL.md`
§18, §20.

## Deployment

Live on Vercel as of 2026-09-21: `https://field-notes-from-everywhere-website-o6jkwewmr.vercel.app`
(the `-o6jkwewmr` suffix appears to be permanent, likely because the plain project name was
already taken by another Vercel account — this is the real, stable production URL, not a
per-deployment preview one). Deploys automatically on push to `master`.

- **Env vars**: set directly in Vercel's dashboard (Environments section), not synced from
  `.env.local`. Two things to know: (1) the Vercel Sanity marketplace integration provisions
  its own variable names (`SANITY_STUDIO_PROJECT_ID`, `SANITY_API_PROJECT_ID`,
  `SANITY_STUDIO_DATASET`, `SANITY_API_DATASET`, `SANITY_API_READ_TOKEN`,
  `SANITY_API_WRITE_TOKEN`) rather than the `NEXT_PUBLIC_SANITY_*`/`SANITY_API_TOKEN` names this
  app was originally written against — `lib/sanity/groqFetch.ts` and `sanity.config.ts` check
  both naming conventions as a fallback, so either works; (2) `SANITY_WEBHOOK_SECRET` was added
  manually (not integration-provisioned, since it's a value this app invented) and must match
  what's registered in Sanity's webhook config.
- **Resend integration**: installed via Vercel's marketplace, provisioned its own account/API
  key. A sending domain was verified via DNS records at Cloudflare (subdomain-scoped MX record
  under `send.<domain>`, doesn't conflict with existing email on the root domain). Inbound
  email receiving was deliberately left off — not needed, and would have conflicted with the
  domain's existing personal-inbox MX records.
- **Deployment Protection**: was on by default (Vercel's own SSO-gate, blocking all public
  access) and has been turned off so the site is actually publicly reachable.
- **Sanity CORS + webhook**: the production URL above is in Sanity's CORS allowlist, and a
  webhook is registered (via Sanity's API) pointing at
  `<production-url>/api/webhooks/sanity`, using the `SANITY_WEBHOOK_SECRET` now set in both
  places. It currently uses Sanity's default payload (no custom projection — the API rejected
  a string projection, and a working payload shape wasn't chased further) — this still sends
  `_type` on every change, which is enough for this app's tag-based revalidation to work, just
  not fine-grained per-path revalidation. Improving that projection is a small future
  refinement, not a current gap.
- **Custom production domain**: deliberately not connected yet — Vercel's domain-connection
  flow asks for either a nameserver handover or a root CNAME, both of which are the real DNS
  cutover this project is holding off on until the site is otherwise ready to launch (see
  `DECISIONS.md`/`CLAUDE.md` on treating that as a deliberate, late step, not routine).
- **Not yet done**: Kit env vars on Vercel (account/integration itself is done locally — see
  "Kit connection" above) and Paddle account/integration; real content authoring (deliberately
  sequenced last — see below); legal copy; the domain cutover above.
