# Architecture — Field Notes From Everywhere

Status: **implemented and deployed.** This document was originally written during project
initialization, before any code existed; it's since been kept in sync with what's actually
built as the system evolved (see `DECISIONS.md` for the specific changes and why). See
`CURRENT_STATE.md` for exactly what's built, connected, and still open right now.

## 1. What this system is

FNFE is a book-recommendation editorial publication with a free content hub (the
"Publication") and a paid newsletter product ("The Reading Room", Tuesday/Thursday/Saturday since 2026-09-30). V1, as actually
built in the Claude Design project, is:

- a **public marketing/editorial website**: homepage, three Publication category hubs, an
  article template shared by all three categories, an About page with a linkable methodology
  section, Contact, and three legal pages;
- a **Reading Room landing page** that sells a $7/month subscription with a 7-day free trial;
- **two email-capture points** inside Publication articles that join a free mailing list;
- **no logged-in product** — the full subscriber experience (passwordless login, a Books
  catalogue, a Past Issues archive) is specified in `docs/design-specs/rr_subscriber.md` but
  was explicitly cut from V1 by the design team (see
  `docs/design-specs/DESIGN_PROJECT_BUILD_NOTES.md`). It is documented backlog, not a V1
  requirement. **This is the single biggest scope determinant in this document** — see
  `DECISIONS.md` for the reasoning and the confirmation this was checked with the user.

Because there is no logged-in product in V1, **there is nothing to gate and nothing that
requires our own user-authentication system.** The Reading Room's actual "product" in V1 is
the newsletter itself, which Kit sends — not anything this website renders behind a login.

## 2. Source of truth for the product

`CLAUDE.md` names the governing sources in full. In short: the **live Claude Design project**
(`claude.ai/design`, project "Full FNFE Website") is authoritative for the product and UX.
`docs/design-specs/` mirrors the text specs and the design team's own build notes for when
that live project isn't reachable. This document translates that product into a production
system; it does not redefine the product.

## 3. High-level architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Next.js app (App Router, TypeScript, React)  — hosted on Vercel │
│                                                                   │
│   Public pages (SSG/ISR)          API routes (server)            │
│   ─────────────────────           ──────────────────             │
│   /                    Home       /api/subscribe        (Kit)    │
│   /the-shortlist[/...] hub+article /api/webhooks/paddle          │
│   /what-to-read-when[/...]        /api/webhooks/sanity           │
│   /book-club-book-picks[/...]        (→ on-demand revalidate)    │
│   /the-reading-room    RR landing  /studio/*  (embedded Sanity   │
│   /about /contact                              Studio, auth'd)   │
│   /terms /privacy-and-cookies /disclosures                       │
└───────────┬───────────────────────────────┬─────────────────────┘
            │ GROQ (read)                   │ webhooks / REST
            ▼                               ▼
   ┌─────────────────┐  ┌───────────────────┐  ┌──────────────────┐
   │  Sanity (CMS)    │  │  Kit               │  │  Paddle Billing  │
   │  content +       │  │  (email)           │  │  (subscriptions) │
   │  taxonomy        │  │  free list, RR     │  │  $7/mo, no trial │
   │                  │  │  trial tracking +  │  │  object — entered│
   │                  │  │  delivery, sales   │  │  only at actual  │
   │                  │  │  sequences         │  │  sign-up         │
   └─────────────────┘  └───────────────────┘  └──────────────────┘
                                  ▲                      │
                                  └──── webhook syncs ────┘
                                 (converted/canceled → Kit tag)
```

The 7-day free trial itself is tracked entirely in Kit, not Paddle — see `DECISIONS.md`
("Reading Room's free trial is tracked in Kit, not as a Paddle trial"). Paddle only enters the
picture once someone actually decides to become a paying subscriber.

No application database. Sanity is the content system of record, Kit is the email-list
system of record, Paddle is the billing system of record. Nothing in V1 needs state that
doesn't already belong to one of those three. See `DECISIONS.md` for why this is safe and
what would force adding one (building the logged-in Reading Room product).

## 4. Application

- **Framework**: Next.js (App Router), TypeScript, React Server Components for data
  fetching, client components only where interaction/animation requires it (the reader-request
  stratosphere, article scroll-driven rail, Reading Room drifting shelf, Tags dropdowns if/when
  built).
- **Why Next.js**: the product is content-driven and SEO-relevant (an editorial publication
  lives or dies on search/social discovery), needs SSR/SSG with incremental revalidation so
  publishing in Sanity doesn't require a redeploy, has real server-side needs (Paddle and Kit
  webhooks, a Kit subscribe endpoint), and has first-party, well-maintained integration with
  both Sanity (`next-sanity`) and Vercel hosting. It is the established, boring choice for
  this shape of product — see Operating Manual §6.
- **Styling**: the design system's tokens (`_ds/.../tokens/*.css`) are plain CSS custom
  properties with no framework dependency — they are ported into the app's global stylesheet
  **verbatim**, unchanged, so visual values never drift from the design. Components are
  authored as real `.tsx` files using those tokens (`var(--sage-700)` etc.), not as inline
  style strings copied from the `.dc.html` markup — the `.dc.html`/`dc-runtime` format is a
  design-tool preview mechanism only (see §7) and is not used in production.
- **Design-system components ported**: `Button`, `Icon`, `BookCover`, and any of `Card`,
  `Badge`, `Tag`, `Input`, `SectionHeading`, `TeaserCard`, `CategoryChip` actually referenced
  by a built page once all hub/article pages have been read in full during implementation.
  **Not ported**: `ChatBubble`, `MessageInput`, `Avatar`, `SideRail`, `TopBar`, and the
  `ui_kits/reader/*` screens (`BookScreen`, `CartScreen`, `ChatScreen`, `DiscoverScreen`) —
  these exist in `_ds_bundle.js` but are not referenced by any FNFE page read during
  initialization (Home, Header, Footer, About, Contact, Terms, The Shortlist hub, Article -
  The Shortlist, The Reading Room). They read as generic starter-kit scaffolding from the
  design tool, unrelated to FNFE's actual product. Confirm against the remaining hub/article
  pages before implementation; do not port unused code (Operating Manual §5).

## 5. Routing

| Route | Page | Notes |
| --- | --- | --- |
| `/` | Home | reader-request stratosphere, three column showcases, Reading Room intro |
| `/the-shortlist` | Shortlist hub | category identity, latest article, "All articles" + See more |
| `/the-shortlist/[slug]` | Shortlist article | ranked, numbered book list |
| `/what-to-read-when` | hub | same hub template, clay identity |
| `/what-to-read-when/[slug]` | article | unranked |
| `/book-club-book-picks` | hub | same hub template, sky identity |
| `/book-club-book-picks/[slug]` | article | unranked, paired presentation |
| `/the-reading-room` | RR landing page | "Join The Reading Room" → `/the-reading-room/subscribe` (Paddle checkout overlay); trial paused |
| `/about` | About | `#how-we-find-the-books` anchor, linked from every article's methodology box |
| `/terms`, `/privacy-and-cookies`, `/disclosures` | legal pages (CMS body) | every heading gets an id from its text, e.g. `/terms#refund-policy` (the refund link given to Paddle) |
| `/contact` | Contact | static, mailto link only |
| `/llms.txt` | llms.txt (rewrite to `/llms`) | Markdown site overview for AI tools, built from published articles (`app/llms/route.ts`) |
| `/unsubscribe` | Unsubscribe confirm | from email footer links; noindex, not in the design |
| `/terms`, `/privacy-and-cookies`, `/disclosures` | shared legal template | CMS body content |
| `/studio` | Sanity Studio | embedded, editor-auth'd, not a public route |
| `/api/reading-room/kit-draft` | (POST only) | Studio "Create Kit draft" button → Kit draft broadcast; accepts only a fresh Studio-written request id (§9) |

Slugs are kebab-case URL-safe versions of the `.dc.html` filenames. Hub sections 5–12
("Browse our Collections" / Genre…Experience) and the Recent-Articles carousel are in the
spec but not built in V1 (see `DECISIONS.md`); routes above reflect what's built. If those
sections get built later, they're additions to the existing hub route, not new routes.

## 6. Content model (Sanity)

Derived from the "CMS controlled" vs. "frontend controlled" split in
`docs/design-specs/pub_article.md` §8, and from the actual `sc-for` data bindings observed
in the built pages (e.g. `{{ b.title }}`, `{{ b.author }}`, `{{ b.blurb }}`, `{{ b.tags }}`,
`{{ b.rank }}` in `Article - The Shortlist.dc.html`).

- **`category`** — fixed set of 3 (Shortlist / What to Read When / Book Club Book Picks).
  Modeled as a frontend-level enum/constant, not a Sanity document — its visual identity
  (colour, motion, typography) is explicitly frontend-controlled per spec, and there will
  never be a 4th without an engineering change anyway.
- **`tag`** — Publication-only, book-level descriptor vocabulary (`name`, `slug`) — e.g. "dark
  fantasy," "brutal." Used by `book.tags[]` and, per article, `bookEntries[].tags[]` (an
  optional override of which of a book's tags display for that specific article). Deliberately
  **not** the mechanism for hub-page grouping — see `theme` below. Originally modeled with a
  `group` field and described as shared with a future Reading Room taxonomy; both were removed
  2026-09-23 (see `DECISIONS.md`) — nothing ever read a book tag's group, and the Reading Room
  archive/catalogue (still out of V1 scope) is expected to have its own independent book/tag
  model, not reuse this one.
- **`theme`** — Publication-only, article-level taxonomy (`name`, `slug`, `group`: required
  enum — Genre / Tone / Mood / Trope / Character Archetype / Relationship / Setting / World
  Elements / Opening Style, the user's own 9-group list, replacing `pub_hub.md` §5–12's
  original 8 named sections — see `DECISIONS.md`, "Theme groups replaced with the user's own
  9-group taxonomy"). Added 2026-09-23 specifically so `article.themes[]` (below) has
  something to reference — a small, curated vocabulary for hub-page grouping and a possible
  future glossary, kept deliberately separate from `tag`'s book-descriptor vocabulary even
  though a theme and a tag may share a name.
- **`book`** — canonical book record: `title`, `author`, `coverImage`, `canonicalBlurb`,
  `tags[]` (→ `tag`). Not used for anything in V1's built pages yet, but cheap to model now
  since Publication articles already reference books, and modeling it as its own document
  avoids re-typing title/author/cover across articles later. (Not expected to be reused by a
  future Reading Room Books catalogue — see `tag`, above.)
- **`article`** — `title`, `slug`, `metaDescription` (search/link-preview summary, also the
  hub lead card, RSS and recap summary; falls back to `methodologySentence` when empty),
  `focusKeyword` (Shortlist only; drives Studio SEO warnings, `sanity/lib/seoChecks.ts`),
  `category` (enum), `themes[]` (references to `theme` —
  which of the 8 "Browse Our Collections" groupings this whole article belongs to, added
  2026-09-23; not yet read by any page, see below), `author`, `publishedAt`, `heroImage`,
  `methodologySentence` (the one sentence in the "How we made this list" box), `introText`
  (rich text), `bookEntries[]` (array of `{ book: reference, blurb: text (override of the
  book's canonical blurb — the built article's blurbs are clearly written for that specific
  list, not generic), tags[]: reference[] (optional per-entry override, controls which of the
  book's tags display for THIS article) }` — rank for Shortlist articles is not a stored
  field; it's derived from each entry's position in this array, see `DECISIONS.md`),
  `whatToReadNext[]` (references to up to 3 other `article` documents, editorially chosen per
  spec §6.5).
- **`ranking`** — a reader-recommendation ranking for one theme (`name`, e.g. "Thriller";
  `slug`; `books[]`: ordered, unique references to `book`). Rank is array position, same
  derived-from-order rule as `article.bookEntries`. A book can appear in many rankings at
  different positions. This is the site's research data, stored independently of any article;
  no page reads it yet (added 2026-09-23 — see `DECISIONS.md`). Articles reference one via
  `article.ranking` + `article.rankingCount`, and the Studio's "Fill books from ranking"
  document action (`sanity/actions/FillFromRankingAction.tsx`, rules in
  `sanity/lib/pickBooksFromRanking.ts`) fills `bookEntries` from it — a one-time fill into
  ordinary editable entries, not a live link.
- **`readingRoomIssue`** — one Reading Room email (added 2026-10-02, see `DECISIONS.md`): `title`
  (the theme), `subject`, `previewText`, `introSentence`, `themeExplanation`, `whatToExpect`,
  `transitionSentence` (the user's layout, in order), `ranking` + `rankingCount` (for "Fill books
  from ranking": top N in rank order), `bookEntries[]` (same shape as an article's), and
  `kitBroadcastId` (read-only, set by "Create Kit draft"). Not shown on the site yet; it's the
  record future Past Issues pages can read.
- **`legalPage`** — `title`, `slug` (terms / privacy-and-cookies / disclosures), `body`
  (rich text). Matches `utility_pages.md` §2.1 exactly ("CMS-managed body content").
- **`siteSettings`** singleton — the contact email, social links (Pinterest/Reddit URLs, read
  by the footer), and Reading Room price/trial copy
  surfaced on the landing page and article rail card, so a price change doesn't require a
  code deploy. Each field falls back to a default in `getSiteSettings` when the document or
  the field is empty (the real social URLs live there as defaults).

Not modeled in V1 (documented backlog, matches the cuts in
`DESIGN_PROJECT_BUILD_NOTES.md`): `readingRoomIssue` (Past Issues / individual issue pages),
subscriber accounts, and the "recommendation count"/engagement-ranking data model implied by
`pub_hub.md`'s "strongest-performing articles" language for choosing *which* articles surface
within each of the eight collection sections. The association itself — which groupings an
article belongs to — *is* modeled (`article.themes`, above), captured at authoring
time specifically so it doesn't need backfilling once those sections are built; only the
hub-page UI and the engagement-based selection-within-a-grouping logic remain unbuilt.

The homepage's "Explore our columns" showcases and the hub's "Latest Article" section pull
the N most recent published articles per category by query (`publishedAt desc`), matching
`pub_hub.md`'s "automatically determined by publication date rather than manually curated."
No manual curation field needed for those. **Scheduling**: every article query also requires
`publishedAt <= now()`, so an article published in the Studio with a future date stays hidden
until then (go-live within the 300s revalidate window — see `DECISIONS.md`, 2026-09-23). The homepage reader-request text bank
(`REQUESTS` array in the built `Home.dc.html`) stays as a code-level constant, not a CMS
field — it's copy that changes rarely, isn't tied to any content publishing workflow, and
adding a CMS array field buys nothing here (Operating Manual §5, prefer simplicity).

## 7. What does *not* carry over from the design tool into production

The `.dc.html` / `dc-runtime` (`support.js`) / `<image-slot>` (`image-slot.js`) machinery is
the Claude Design authoring/preview environment, not a production runtime:

- `<image-slot id="...">` placeholders mark exactly where a real image belongs and what it's
  a placeholder for (its `placeholder="..."` text). In production these become Sanity image
  fields rendered through `next/image` + Sanity's image URL builder (crop/hotspot-aware).
  Every `image-slot id` in the built pages is a checklist item for "does this article/page
  have an image field for this."
- `sc-for` / `sc-if` / `{{ }}` template directives are the design tool's own templating
  language for previewing dynamic content with placeholder data. In production, the
  equivalent is a normal React `.map()` and conditional render over data fetched from Sanity
  via GROQ — no runtime dependency on `dc-runtime` is carried into the app.
- The bespoke JS logic embedded in each page's `<script type="text/x-dc" data-dc-script>`
  block (the stratosphere layout algorithm in `Home.dc.html`, the scroll/progress logic in
  the article template, the Reading Room drifting-shelf logic) **is** real, portable
  behavioral logic — it gets reimplemented as ordinary React client components/hooks,
  preserving the algorithm, not rewritten from scratch. The design project's own warning
  stands: the stratosphere measures text, packs lanes, and re-centers on resize — treat it
  as load-bearing, not decorative, when porting it.

## 8. Sanity

- Embedded Studio at `/studio` inside the Next.js app (single deployment, shared repo,
  standard modern `next-sanity` pattern) rather than a separately hosted Studio — there's no
  V1 requirement (e.g. a separate editorial team needing an isolated deployment) that would
  justify the extra moving part.
- Reads via GROQ, primarily through Next.js Server Components at request/build time.
- **On-demand ISR**: a Sanity webhook fires on publish → `/api/webhooks/sanity` → validates
  the webhook signature → calls Next.js's on-demand `revalidateTag`/`revalidatePath` for the
  affected route. This means an editor publishing an article goes live within seconds without
  a full site rebuild, and the site isn't hammering Sanity on every request either.
  The same webhook also notifies search engines via **IndexNow** (`lib/integrations/indexnow.ts`,
  after responding; failures only logged): a live article → its page, its column hub and `/`; a
  legal page → itself. Future-dated articles are left to the sitemap. Key file: `public/<key>.txt`
  (public by design).
- Image pipeline: Sanity's asset CDN, rendered through `next/image`. Article hero images honour
  the Studio crop (applied as Sanity's `rect` URL parameter) and hotspot (a CSS `object-position`),
  via `toHeroImage` in `lib/content/index.ts` — the same image is shown at 12:5, ~16:9, 3:2, 4:5
  and 1:1 across the site. Design size: 2400 × 1000 (the article banner's 12:5), subject in the middle third (see `DECISIONS.md`).
- **Published content only**: `groqFetch` always requests the `published` perspective
  explicitly — an authenticated query's default at this API version also returns drafts.
- **Studio preview** (2026-09-24): Sanity's Presentation tool ("Preview" in the Studio) shows
  the real site with unpublished and scheduled content. It turns on Next.js draft mode via
  `/api/draft-mode/enable`, which only accepts a short-lived secret the Studio writes for a
  logged-in editor (`lib/sanity/previewSecret.ts`). In draft mode `groqFetch` reads the
  `drafts` perspective uncached and lets future-dated articles through; `VisualEditing` refreshes
  the page as edits save; a "Preview · exit preview" bar shows if the page is opened outside
  the Studio. Normal visitors are unaffected, and pages stay statically cached.

## 9. Kit and Resend (email)

Email responsibility is split cleanly by job: **Resend sends everything and holds the free
list; Kit holds only confirmed, converted Reading Room members.** This settled 2026-09-22
after two rounds of correction, both recorded in `DECISIONS.md` — the short version: Kit's
Automations and RSS-to-email both turned out to be Creator-plan-only ($33/month) rather than
free-plan features as first assumed, and once Resend was already sending everything, there
was no remaining reason for Kit to be a passive middleman holding lists it never acts on.

- **Resend** sends every actual email and holds the free list's contacts:
  - The **free list** (`/api/subscribe` — direct newsletter signup or the article "send this
    list to me" popup) — each contact is added to one of two Resend **Segments**
    (`RESEND_NEWSLETTER_SEGMENT_ID` / `RESEND_SEND_LIST_SEGMENT_ID`, `addToSegment` in
    `lib/integrations/resend.ts`) for source attribution, **and** to the whole-list segment
    "Email list (everyone)" (`RESEND_EMAIL_LIST_SEGMENT_ID`; the account's default "General"
    segment, renamed, since the plan allows only 3 segments), which the weekly newsletter
    Broadcast is sent to. Segments are Resend's replacement
    for the old mandatory-Audience model (contacts are global, belong to any number of
    Segments) — created via `resend.segments.create()` directly against the API, not
    manually in the dashboard.
  - The **weekly newsletter** (weekly Publication recap) — a **Vercel Cron job**
    (`vercel.json`, `GET /api/cron/weekly-recap`, Wednesdays 14:00 UTC, i.e. 10am US Eastern in
    summer, 9am in winter) takes up to 10 articles published
    in the past 7 days (`getFeedArticles`, the same function `/rss` uses; nothing new = no
    email) and sends them as a Resend **Broadcast** to "Email list (everyone)"
    (`sendWeeklyNewsletter`), so each issue has its own stats in Resend. Resend personalises
    the greeting (`{{{contact.first_name|there}}}`), adds a per-recipient unsubscribe link
    (`{{{RESEND_UNSUBSCRIBE_URL}}}`) and skips unsubscribed contacts. Named "Weekly newsletter
    YYYY-MM-DD"; a repeat cron run skips if that name exists.
    Secured by `CRON_SECRET`, an internal shared secret (Vercel's documented cron-auth
    pattern), not a third-party credential.
  - The **one-off "send this list to me" email** (`pub_article.md` §6.4) — the reader gets
    the specific book list from the specific article they were reading, immediately, as a
    transactional send (`sendBookListEmail`) — not something a marketing ESP templates well.
  - The **Reading Room trial-to-conversion journey** — **paused 2026-09-27** (DECISIONS.md,
    "Reading Room free trial paused"): the site has no trial entry point and
    `/api/reading-room/start-trial` is deleted; the Resend automation below still exists,
    unused. As built before the pause: `/api/reading-room/start-trial` fired
    a **Resend Automations** event (`reading_room_trial_started`,
    `triggerReadingRoomTrialEvent`) with no Kit call at all. That event runs the entire
    journey in Resend: welcome, 7 days of fixed trial catalogue content (the last day(s)
    mentioning the trial ending), then a conversion-check before each further email so it can
    exit into a single "you're a member now" email whenever conversion actually happens, or
    continue a post-trial conversion-focused series if it hasn't — content/timing configured
    in Resend's dashboard, not this app.
- **Reading Room issues** (2026-10-02): written in the Studio (`readingRoomIssue`, §6); its
  "Create Kit draft" button (`sanity/actions/CreateKitDraftAction.tsx`) calls
  `/api/reading-room/kit-draft`, which renders the email (`lib/email/readingRoomIssueEmail.ts`, a
  body fragment for Kit's "Text only" template) and creates or updates a **draft** broadcast for
  the member tag (`saveReadingRoomDraft`). The user sends or schedules it in Kit; the site never
  sends. Auth: the button first writes a `kitDraftRequest.<random>` document with the editor's
  Studio session; the route only accepts an id that exists and is under 5 minutes old.
- **Kit** holds only confirmed, converted Reading Room members (`KIT_READING_ROOM_TAG_ID`,
  "membership" in the user's words) — added exclusively by the future Paddle webhook (§10) at
  the moment of actual conversion, never at trial-start. It sends nothing automated (both its
  Automations and RSS-to-email are Creator-plan-only), but it *is* still the intended sender
  for the ongoing Reading Room member catalogue once someone's converted — manual broadcasts
  targeted at the member tag, which don't hit the automation restriction since a person is
  composing and triggering them directly. A Kit form created earlier in this design's
  evolution (before Resend Automations took over the trial) is no longer used or referenced
  anywhere — removed from env vars 2026-09-22, though the form object itself can stay or be
  deleted in Kit's own dashboard at the user's discretion.

**Unsubscribe** (2026-09-26): every free-list email carries a signed per-address unsubscribe
link (`lib/unsubscribe.ts`) to `/unsubscribe` (confirm page) plus RFC 8058 one-click headers
pointing at `/api/unsubscribe` (POST). Unsubscribing sets the Resend contact's `unsubscribed`
flag, which the weekly newsletter Broadcast respects (as does Resend's own unsubscribe link in
it, which sets the same flag); re-signing up clears it.

**Email analytics** (2026-09-27): newsletter issues are Broadcasts (per-issue stats in Resend's
Broadcasts page); every book-list email is tagged `email_type=book_list`, `category`,
`article` (slug) for per-article reporting from Resend's API; links in both emails carry UTM
tags (`lib/email/utm.ts`: `utm_source=fnfe_email`, `utm_medium=email`, `utm_campaign=book_list`
or `weekly_newsletter`, `utm_content` = article slug / issue date) for Google Analytics.

`/api/subscribe` validates the email and name, adds the contact to the right Resend Segment,
and (for the "send this list" flow only) sends the transactional book-list email. Every
Reading Room CTA ("Join The Reading Room") links to `/the-reading-room/subscribe` (Paddle
checkout); there is no trial signup while the trial is paused.

## 10. Paddle (billing)

Paddle is entered **only at the moment someone becomes an actual paying subscriber** — not
during the free trial (see §9 and `DECISIONS.md`). Concretely:

- **Paddle Billing** (current product), overlay checkout via Paddle.js, triggered from
  wherever a trialing (or trial-skipping) reader chooses to actually subscribe — configured
  against a single Price: $7/month, no trial configured on the Paddle side, since the free
  period already happened (if at all) entirely inside Kit before Paddle was ever involved.
- `/api/webhooks/paddle` verifies Paddle's webhook signature and handles subscription
  lifecycle events (activated, past-due, canceled) by calling the Kit API to tag/untag the
  customer's email accordingly — this is the entire mechanism by which Kit knows someone is
  now a *paying* Reading Room subscriber rather than a trialing one, since there is no app
  database or subscriber table in V1.
- No card data ever touches our server — Paddle's hosted/overlay checkout handles PCI scope
  entirely.
- Paddle's own transactional emails (receipts, failed-payment notices) go straight from
  Paddle to the customer — this app and Kit are never involved in those.

## 11. Hosting and domain

- **Vercel**, deploying this Next.js app directly from the Git repository, with preview
  deployments per pull request (Operating Manual §37, small reversible releases).
- The domain `fieldnotesfromeverywhere.com` is registered at **Namecheap** (registrar only);
  its DNS is managed at **Cloudflare** (nameservers delegated there). Cut over to Vercel
  2026-09-27: the root is a CNAME to Vercel's project-specific target (Cloudflare flattens it
  at the apex), `www` is a CNAME to the same target and Vercel redirects it to the root. Both
  are **DNS only (grey cloud)**, never proxied, so Vercel issues and renews TLS itself. The
  root MX/TXT records (Zoho mail) and Resend's `send.*`, `resend._domainkey` and `links`
  records sit alongside and must be left alone.
- `SITE_URL` (`lib/siteUrl.ts`) is the only place the site's own address comes from:
  sitemap, robots, RSS, email links, and the root layout's `metadataBase`, which gives every
  page a canonical URL (`alternates.canonical: "./"`) on the real domain.

## 12. Environment variables / secrets (names only — see `.env.example`)

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` | Sanity client config |
| `SANITY_API_TOKEN` | server-side write access (Studio auth, revalidation) |
| `SANITY_WEBHOOK_SECRET` | verifies Sanity → `/api/webhooks/sanity` calls |
| `KIT_API_KEY` | Kit (ConvertKit) API access — holds only confirmed Reading Room members (see §9) |
| `KIT_READING_ROOM_TAG_ID` | confirmed Reading Room member tag — applied only by the Paddle webhook at actual conversion, removed on cancellation |
| `RESEND_API_KEY` | Resend API access — transactional email, the free-list contacts, the weekly recap, and the Reading Room trial's Automations sequence (see §9) |
| `RESEND_NEWSLETTER_SEGMENT_ID` / `RESEND_SEND_LIST_SEGMENT_ID` | source-attribution segments for the two free-list entry points |
| `RESEND_EMAIL_LIST_SEGMENT_ID` | "Email list (everyone)", the segment the weekly newsletter Broadcast goes to (not a secret) |
| `CRON_SECRET` | internal shared secret verifying Vercel Cron → `/api/cron/weekly-recap` calls — generated locally, not a third-party credential |
| `PADDLE_API_KEY` | server-side Paddle API access |
| `PADDLE_WEBHOOK_SECRET` | verifies Paddle → `/api/webhooks/paddle` calls |
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | Paddle.js client-side checkout (not a secret — Paddle's client SDK is designed to ship this to the browser) |
| `NEXT_PUBLIC_PADDLE_ENVIRONMENT` | `sandbox` or `production` |
| `NEXT_PUBLIC_PADDLE_READING_ROOM_PRICE_ID` | the $7/mo Price (no Paddle-side trial) to check out against (Price IDs aren't secret either — Paddle.js needs this client-side) |
| `SITE_URL` | the site's public address (`https://fieldnotesfromeverywhere.com`), for canonical/OG metadata, sitemap, RSS and email links. Server-side only, no `NEXT_PUBLIC_` prefix |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 ID; unset = no analytics. Loaded only with consent where required (`components/ConsentManager.tsx`) |

All of these are set locally (`.env.local`) and on Vercel (`NEXT_PUBLIC_GA_MEASUREMENT_ID` since
2026-09-27). Since 2026-09-29 the Paddle values on Vercel are the **live** account's
(`NEXT_PUBLIC_PADDLE_ENVIRONMENT=production`). `.env.local` keeps the sandbox values under the
normal names for local testing, and the live ones as `PADDLE_LIVE_*`.

## 13. Accessibility, performance, SEO — standing requirements, not optional add-ons

These aren't shown individually in the design but are necessary for the designed product to
actually work as a public, search-discoverable editorial site (Operating Manual "product
scope" framing in the initialization brief):

- Semantic HTML and real alt text (Sanity image `alt` field, required on `heroImage`/`cover`
  fields) — required both for accessibility and because this is an image-heavy editorial
  site.
- Per-page metadata via Next.js's Metadata API. Every page builds its title, description and full
  share tags (Open Graph + X card) through `pageMetadata` (`lib/metadata.ts`); articles use their
  hero image and `type=article`, other pages the default share image
  (`public/images/share-default.png`, the homepage illustration at 1200 × 630). The homepage sets
  its canonical to `/` explicitly (the layout's `"./"` resolves to `/index` there).
- `sitemap.xml` and `robots.txt` generated from the same Sanity queries that render the hubs.
- `prefers-reduced-motion` handling for every bespoke animation (stratosphere, article
  progress rail, Reading Room drift/shelf) — the spec explicitly requires this in multiple
  places; treat it as a hard requirement, not a nice-to-have.
- **Analytics and consent** (2026-09-26): Google Analytics 4 behind a consent banner for
  EEA/UK/Swiss visitors (country from `/api/geo`, Vercel's IP-country header), default-on
  elsewhere, "Cookie settings" in the footer for everyone; gtag.js loads when the page is idle.
  See `DECISIONS.md`.
- Core Web Vitals attention specifically on Home (the stratosphere must not jank or block
  interaction) and article pages (image-heavy, many book covers).

## 14. Testing approach

Scoped to actual risk (Operating Manual §29), not applied uniformly:

- **Unit tests**: GROQ query builders/result shaping, Kit/Paddle payload builders, webhook
  signature verification.
- **Integration tests**: `/api/subscribe`, `/api/webhooks/paddle`, `/api/webhooks/sanity`
  against mocked Kit/Paddle/Sanity.
- **End-to-end**: the two flows where failure has real business consequence — Reading Room
  trial signup (landing page → Paddle checkout → webhook → Kit tag), and the free-list
  email-capture flow.
- **Manual/visual QA**: every editorial page, at desktop/tablet/mobile, in both reduced- and
  full-motion — this is an editorial/design-led product and automated tests won't catch a
  broken layout or a motion regression.

## 15. Open implementation questions (not yet resolved — see `CURRENT_STATE.md`)

- Exact behavior if Paddle cannot do a truly card-free 7-day trial (copy says "no credit
  card required").
- Whether the eight "Browse our Collections" hub/Reading-Room sections and the Reading Room
  subscriber product get built in a later phase — tracked as backlog, not scheduled.
- Final list/tag naming inside Kit and Price/Product naming inside Paddle depend on the
  user's own account setup in those tools.
