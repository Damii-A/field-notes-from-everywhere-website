# Current state — Field Notes From Everywhere

Last updated: 2026-09-21 (Sanity connected, content layer wired to real queries)

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
  trial section — CTAs wired to `ReadingRoomCheckoutButton`, which opens Paddle.js checkout
  when configured and otherwise shows an honest "not configured yet" state rather than a fake
  success.
- API routes: `/api/subscribe` (Kit + Resend), `/api/webhooks/paddle`, `/api/webhooks/sanity`
  — all functional but gated on env vars that don't exist yet; each returns a clear error
  rather than silently no-op-ing when unconfigured (see "Known open items" below).
- Sanity schema definitions (`sanity/schemaTypes/*`) and embedded Studio config
  (`sanity.config.ts`, `/studio` route) — connected to the real project (see "Sanity
  connection" above); Studio login/editing itself not yet manually exercised end-to-end.
- `sitemap.xml`, `robots.txt`, per-page metadata, 404 page.

## Immediately next

Per the user's explicit sequencing preference (2026-09-21): content authoring and legal copy
are deliberately last, after the remaining technical/integration work, not next.

1. Set up Kit (account + API key + tag structure — see "Email/subscriber architecture" below,
   decided 2026-09-21). This now also covers building the trial-start flow (an email-capture
   form + a new API route that tags the subscriber in Kit), not just list signup.
2. Set up Paddle (account + API key + webhook secret + the actual $5/month Price — no trial
   configured on Paddle's side; see "Email/subscriber architecture" below for why).
3. Wire `RESEND_API_KEY` into local `.env.local` too, for parity with what Vercel's Resend
   integration already provisioned there (not required for the live site, just for local dev).
4. **In Kit's dashboard**: set up the RSS-to-email automation for the weekly recap, pointed at
   `<production-url>/feed.xml` (built 2026-09-21 — see below). Nothing left to build for this
   on the app side.
5. Source real photography (see "Assets needed" below).
6. **Last**: author real content in the Studio, and get real legal copy for
   Terms/Privacy/Disclosures.

## Weekly recap feed

`app/feed.xml/route.ts` publishes a standard RSS feed of the 30 most recent Publication
articles across all three categories (title, link, publish date, category, and the article's
methodology sentence as the description) — built specifically so Kit's RSS-to-email automation
can compose the weekly recap automatically, with no manual writing required each week (the user
chose this over a manually-written recap, 2026-09-21). Point Kit's automation at
`<production-url>/feed.xml`. Verified locally: valid RSS output, gracefully empty (no `<item>`
entries) while the dataset has no articles yet.

Also fixed while building this: `NEXT_PUBLIC_SITE_URL` was renamed to `SITE_URL` everywhere
(code, `.env.local`, `.env.example`) — it was never actually used in any browser-facing code, so
the `NEXT_PUBLIC_` prefix was unnecessary, and Vercel outright refused to save a public
variable it suspected might be sensitive-looking, which blocked setting it at all under the old
name. **On Vercel**, this needs its own new `SITE_URL` variable created (plain, not public) set
to the production URL — the old empty `NEXT_PUBLIC_SITE_URL` there can be deleted.

## Email/subscriber architecture (decided 2026-09-21)

Full reasoning in `DECISIONS.md`; summary here for quick reference when building Kit/Paddle:

- **One base group**: everyone who opts in any way (direct signup, "send this list to me," or
  starting a Reading Room trial) is tagged as a free-list subscriber and receives the weekly
  recap of that week's Publication articles — including current Reading Room subscribers,
  since it's different content from Reading Room's own daily catalogues.
- **Reading Room trial is email-only, not a Paddle trial**: starting a trial just captures an
  email and tags the person in Kit. Kit alone runs the 7 days of daily catalogue emails and the
  trial sales sequence (as a Kit automation — no app code needed for the sequence itself).
  Paddle is not involved until the person actually chooses to subscribe.
- **Paddle enters only at real conversion**: a real Paddle checkout for the $5/month Price,
  with no trial object configured on Paddle's side. Its webhook then tells Kit whenever
  someone converts, cancels, or has a failed payment — updating their tag accordingly.
- **Paddle's own transactional emails** (receipts, failed-payment notices) go straight to the
  subscriber; this app and Kit are never involved in those.
- **Still open**: how the weekly recap actually gets composed each week (see item 4 above).

## Assets needed

- The homepage hero photo — `uploads/diletta-davolio-8b4FAmbxZTg-unsplash.png` in the design,
  described there as "the one real image" among otherwise-placeholder imagery. Currently an
  `ImagePlaceholder`. Once Sanity exists this becomes a normal image upload in the Studio; no
  code change needed beyond adding the field's actual value.
- Every other `ImagePlaceholder` across the site (article heroes, book covers, hub cards,
  Reading Room screenshots) is intentionally a placeholder until real content exists in
  Sanity — this is expected, not a bug to fix now.

## Known open items requiring the user before certain work can proceed

- **Kit account** — API key, and the tag structure decided under "Email/subscriber
  architecture" above (final tag naming inside Kit is still the user's call). Note:
  `lib/integrations/kit.ts` is written against Kit's v4 REST API from their public docs but has
  never been exercised against a real account — verify the exact endpoint/payload shape once
  one exists.
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
- **Not yet done**: Kit and Paddle accounts/integration; real content authoring (deliberately
  sequenced last — see below); legal copy; the domain cutover above.
