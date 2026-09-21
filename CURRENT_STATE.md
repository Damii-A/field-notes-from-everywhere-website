# Current state — Field Notes From Everywhere

Last updated: 2026-09-21 (first implementation session)

## What exists right now

The full V1 site structure is implemented and builds/runs cleanly (`npm run build`, `npm run
dev`), serving all pages from local mock content that matches the eventual Sanity shape —
see "Mock content" below. Verified with `npm run build` (0 errors/warnings) and a Playwright
smoke pass (all 6 primary routes 200, zero console errors, visually reviewed against the
design's screenshots).

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
  trial section — CTAs wired to `ReadingRoomCheckoutButton`, which opens Paddle.js checkout
  when configured and otherwise shows an honest "not configured yet" state rather than a fake
  success.
- API routes: `/api/subscribe` (Kit + Resend), `/api/webhooks/paddle`, `/api/webhooks/sanity`
  — all functional but gated on env vars that don't exist yet; each returns a clear error
  rather than silently no-op-ing when unconfigured (see "Known open items" below).
- Sanity schema definitions (`sanity/schemaTypes/*`) and embedded Studio config
  (`sanity.config.ts`, `/studio` route) — written and building correctly, not yet connected to
  a live project.
- `sitemap.xml`, `robots.txt`, per-page metadata, 404 page.

**Mock content**: `lib/content/` is the data-access layer every page reads through — see its
top-of-file comment. It currently serves local mock data (`lib/content/mock-data.ts`)
transcribed from the design's own real placeholder copy (not lorem ipsum), typed to the exact
shape the Sanity schema will produce. Swapping in real Sanity queries later is a change
inside `lib/content/index.ts` only, not a rewrite of any page. One thing to know: only one
article per category has a full hand-authored book list (matching the fact that the design
itself only fully built one example article per category) — every other hub card title is
real placeholder copy but resolves, if clicked, to a synthesized article reusing that
category's book list rather than 404ing. This is clearly commented in the code; it goes away
entirely once Sanity has real articles.

## Immediately next

1. Set up a real Sanity project and connect it (see open items below) — replace
   `lib/content/index.ts`'s mock implementations with GROQ queries, one function at a time.
2. Wire Kit, Paddle and Resend once those accounts/credentials exist.
3. Source real photography (see "Assets needed" below) to replace the `ImagePlaceholder`
   boxes.
4. Real legal copy for Terms/Privacy/Disclosures before public launch.

## Assets needed

- The homepage hero photo — `uploads/diletta-davolio-8b4FAmbxZTg-unsplash.png` in the design,
  described there as "the one real image" among otherwise-placeholder imagery. Currently an
  `ImagePlaceholder`. Once Sanity exists this becomes a normal image upload in the Studio; no
  code change needed beyond adding the field's actual value.
- Every other `ImagePlaceholder` across the site (article heroes, book covers, hub cards,
  Reading Room screenshots) is intentionally a placeholder until real content exists in
  Sanity — this is expected, not a bug to fix now.

## Known open items requiring the user before certain work can proceed

- **Resend account** — vendor use approved by the user (2026-09-21, see `DECISIONS.md`).
  Needs an account created and a `RESEND_API_KEY` before the "send this list to me" email
  capture can actually send (it's fully implemented in `lib/integrations/resend.ts`, just
  unconfigured).
- **Sanity account/project** — needs to be created (or existing one identified) and its
  project ID/dataset name provided, or authorization to create one on the user's behalf.
- **Kit account** — API key, and a decision on list/tag naming for "free Publication list" vs.
  "Reading Room active" segment (recommended structure is in `ARCHITECTURE.md` §9; final
  naming is the user's call inside their own Kit account). Note: `lib/integrations/kit.ts` is
  written against Kit's v4 REST API from their public docs but has never been exercised
  against a real account — verify the exact endpoint/payload shape once one exists.
- **Paddle account** — API key, webhook secret, and the actual $5/month + 7-day-trial Price
  created in Paddle's dashboard (a Price ID this app checks out against). Also needs
  resolving whether Paddle can do a genuinely card-free trial, since the landing page copy
  promises "no credit card required" — this is a real constraint check against Paddle's
  product capabilities, not an engineering assumption to make silently. Separately,
  `app/api/webhooks/paddle/route.ts` has a marked TODO: resolving a webhook event's
  `customerId` to an email address (via `paddle.customers.get`) before it can actually tag
  the subscriber in Kit — untestable without a real account, so left as a clear gap rather
  than guessed at.
- **Namecheap DNS access** — needed only once the app is ready to go live at the production
  domain; not needed for early development (Vercel preview URLs are sufficient until then).
- **Real legal copy** for Terms, Privacy & Cookies, and Disclosures — currently placeholder
  in the design; needs real text (from the user or their legal counsel) before public launch.
  Not a technical blocker for building the page template itself.
- **Vercel hosting** — no project created yet. Routine to set up once the user wants a
  deployed preview rather than local-only.

## Known limitations / explicitly out of scope for V1

See `DECISIONS.md` ("V1 scope excludes the logged-in Reading Room product") and
`docs/design-specs/DESIGN_PROJECT_BUILD_NOTES.md` for the full list of what the design itself
cut from V1. In summary: no Reading Room login/Books/Past Issues, no eight-section
"Browse our Collections" taxonomy browsing on hubs, no Recent-Articles carousel — hubs are
category identity → latest article → all articles (+ See more). Confirmed with the user
2026-09-21.

## Remote repository

Connected 2026-09-21: `origin` → `git@github.com:Damii-A/Field-Notes-From-Everywhere-Website.git`
(SSH — an existing `~/.ssh/id_ed25519_github` key was already authenticated for this GitHub
account, so no new credentials were needed). `master` tracks `origin/master`. Future sessions
should push completed logical work regularly per `AI_ENGINEERING_OPERATING_MANUAL.md` §18,
§20.
