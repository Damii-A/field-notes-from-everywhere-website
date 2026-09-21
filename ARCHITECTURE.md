# Architecture — Field Notes From Everywhere

Status: **proposed architecture for V1, not yet implemented.** No application code exists
in this repository yet. This document was written during project initialization, before
any implementation, per `AI_ENGINEERING_OPERATING_MANUAL.md` §12 and the Project
Initializer Prompt. See `CURRENT_STATE.md` for exactly what does and doesn't exist right now.

## 1. What this system is

FNFE is a book-recommendation editorial publication with a free content hub (the
"Publication") and a paid daily-newsletter product ("The Reading Room"). V1, as actually
built in the Claude Design project, is:

- a **public marketing/editorial website**: homepage, three Publication category hubs, an
  article template shared by all three categories, an About page with a linkable methodology
  section, Contact, and three legal pages;
- a **Reading Room landing page** that sells a $5/month subscription with a 7-day free trial;
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
   ┌─────────────────┐   ┌──────────────┐   ┌──────────────────┐
   │  Sanity (CMS)    │   │  Kit         │   │  Paddle Billing  │
   │  content +       │   │  (email)     │   │  (subscriptions) │
   │  taxonomy        │   │  free list + │   │  $5/mo, 7-day    │
   │                  │   │  RR delivery │   │  trial           │
   └─────────────────┘   └──────────────┘   └──────────────────┘
                                ▲                     │
                                └─── webhook syncs ────┘
                                  (trial/active/canceled
                                   → Kit tag)
```

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
| `/the-reading-room` | RR landing page | trial CTA → Paddle checkout overlay |
| `/about` | About | `#how-we-find-the-books` anchor, linked from every article's methodology box |
| `/contact` | Contact | static, mailto link only |
| `/terms`, `/privacy-and-cookies`, `/disclosures` | shared legal template | CMS body content |
| `/studio` | Sanity Studio | embedded, editor-auth'd, not a public route |

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
- **`tag`** — one taxonomy document type shared by Publication articles and (later) Reading
  Room issues. Fields: `name`, `slug`, `group` (enum: genre / character / relationship /
  trope / mood / theme / setting / experience — the eight groupings named in both
  `pub_hub.md` and `rr_subscriber.md`). This is the single taxonomy system the spec describes
  as reused across the whole product.
- **`book`** — canonical book record: `title`, `author`, `coverImage`, `canonicalBlurb`,
  `tags[]` (→ `tag`). This is what the future Reading Room Books catalogue would dedupe
  against ("each unique book that has appeared in at least one published issue appears
  once" — `rr_subscriber.md` §3.3). Not used for anything in V1's built pages yet, but cheap
  to model now since Publication articles already reference books, and modeling it as its
  own document avoids re-typing title/author/cover across articles later.
- **`article`** — `title`, `slug`, `category` (enum), `author`, `publishedAt`, `heroImage`,
  `methodologySentence` (the one sentence in the "How we made this list" box), `introText`
  (rich text), `bookEntries[]` (array of `{ book: reference, blurb: text (override of the
  book's canonical blurb — the built article's blurbs are clearly written for that specific
  list, not generic), tags[]: reference[] (optional per-entry override), rank: number
  (Shortlist only, ignored by frontend for the other two categories) }`), `whatToReadNext[]`
  (references to up to 3 other `article` documents, editorially chosen per spec §6.5).
- **`legalPage`** — `title`, `slug` (terms / privacy-and-cookies / disclosures), `body`
  (rich text). Matches `utility_pages.md` §2.1 exactly ("CMS-managed body content").
- **`siteSettings`** singleton — the contact email, social links (Pinterest/Reddit URLs,
  currently `href="#"` placeholders in the built footer), and Reading Room price/trial copy
  surfaced on the landing page and article rail card, so a price change doesn't require a
  code deploy.

Not modeled in V1 (documented backlog, matches the cuts in
`DESIGN_PROJECT_BUILD_NOTES.md`): `readingRoomIssue` (Past Issues / individual issue pages),
subscriber accounts, and the "recommendation count"/engagement-ranking data model implied by
`pub_hub.md`'s "strongest-performing articles" language for the eight collection sections —
none of that exists until those sections are built.

The homepage's "Explore our columns" showcases and the hub's "Latest Article" section pull
the N most recent published articles per category by query (`publishedAt desc`), matching
`pub_hub.md`'s "automatically determined by publication date rather than manually curated."
No manual curation field needed for those. The homepage reader-request text bank
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
- Image pipeline: Sanity's asset CDN + `@sanity/image-url`, rendered through `next/image`.

## 9. Kit (email)

Two distinct jobs, kept separate:

1. **List/segment membership and ongoing broadcast delivery** — the free Publication list
   and (once a subscriber exists) the Reading Room's actual Monday–Saturday catalogue +
   Sunday recap. This is Kit's job, configured in Kit's own UI/automations; this app never
   renders or sends the recurring newsletter content itself.
2. **The one-off "send this list to me" email** (`pub_article.md` §6.4) — the reader gets
   the specific book list from the specific article they were reading, immediately, by
   email, and is also added to the free Publication list (disclosed in the UI copy per
   spec). This is a **transactional** send with per-article dynamic content, which is not
   what a marketing ESP like Kit is built to template well. See `DECISIONS.md` for the
   recommendation to use a small transactional-email provider (Resend) for this one send,
   while Kit still receives the subscribe/tag call for the ongoing list relationship.

`/api/subscribe` handles both the article "send this list to me" popup and any other
free-list signup point: validates the email, calls the Kit API to add/tag the subscriber,
and (for the "send this list" flow only) sends the transactional email with that article's
book list.

## 10. Paddle (billing)

- **Paddle Billing** (current product), overlay checkout via Paddle.js on the Reading Room
  landing page's "Try it for free" / "Join for free" CTAs, configured against a single
  Price: $5/month with a 7-day free trial, no card capture required beyond whatever Paddle's
  own trial flow requires (the copy says "no credit card required" — confirm this is
  achievable with Paddle's trial configuration before implementing; if Paddle requires a
  card on file even during a $0 trial, that's a genuine product-copy conflict to flag, not
  something to resolve silently).
- `/api/webhooks/paddle` verifies Paddle's webhook signature and handles subscription
  lifecycle events (trial started, activated, past-due, canceled) by calling the Kit API to
  tag/untag the customer's email for the Reading Room segment — this is the entire mechanism
  by which a paying subscriber actually starts receiving the newsletter, since there is no
  app database or subscriber table in V1.
- No card data ever touches our server — Paddle's hosted/overlay checkout handles PCI scope
  entirely.

## 11. Hosting and domain

- **Vercel**, deploying this Next.js app directly from the Git repository, with preview
  deployments per pull request (Operating Manual §37, small reversible releases).
- The domain is registered at **Namecheap**; Namecheap stays the registrar. Production
  traffic is pointed at Vercel via Namecheap's DNS management (Vercel-provided A/CNAME
  records, or Vercel nameservers), not by moving the registration. Vercel issues and renews
  TLS automatically once DNS is pointed at it. This is a DNS change to a live domain and is
  sequenced near the end of the build, with the user's explicit go-ahead before it's made —
  see `DECISIONS.md`.

## 12. Environment variables / secrets (names only — see `.env.example`)

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` | Sanity client config |
| `SANITY_API_TOKEN` | server-side write access (Studio auth, revalidation) |
| `SANITY_WEBHOOK_SECRET` | verifies Sanity → `/api/webhooks/sanity` calls |
| `KIT_API_KEY` | Kit (ConvertKit) API access |
| `KIT_PUBLICATION_FORM_ID` / `KIT_READING_ROOM_TAG_ID` | which list/tag a given call affects |
| `PADDLE_API_KEY` | server-side Paddle API access |
| `PADDLE_WEBHOOK_SECRET` | verifies Paddle → `/api/webhooks/paddle` calls |
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | Paddle.js client-side checkout (not a secret — Paddle's client SDK is designed to ship this to the browser) |
| `NEXT_PUBLIC_PADDLE_ENVIRONMENT` | `sandbox` or `production` |
| `NEXT_PUBLIC_PADDLE_READING_ROOM_PRICE_ID` | the $5/mo + 7-day-trial Price to check out against (Price IDs aren't secret either — Paddle.js needs this client-side) |
| `RESEND_API_KEY` | transactional "send this list to me" email |
| `NEXT_PUBLIC_SITE_URL` | canonical URL for metadata/OG/sitemap |

None of these exist yet. See `CURRENT_STATE.md` for what's actually needed from the user
before each integration can be implemented.

## 13. Accessibility, performance, SEO — standing requirements, not optional add-ons

These aren't shown individually in the design but are necessary for the designed product to
actually work as a public, search-discoverable editorial site (Operating Manual "product
scope" framing in the initialization brief):

- Semantic HTML and real alt text (Sanity image `alt` field, required on `heroImage`/`cover`
  fields) — required both for accessibility and because this is an image-heavy editorial
  site.
- Per-page metadata via Next.js's Metadata API: title/description/OG image per article (from
  CMS fields), sensible defaults elsewhere.
- `sitemap.xml` and `robots.txt` generated from the same Sanity queries that render the hubs.
- `prefers-reduced-motion` handling for every bespoke animation (stratosphere, article
  progress rail, Reading Room drift/shelf) — the spec explicitly requires this in multiple
  places; treat it as a hard requirement, not a nice-to-have.
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
