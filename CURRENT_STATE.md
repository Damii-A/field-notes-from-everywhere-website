# Current state — Field Notes From Everywhere

Last updated: 2026-09-26. Full reasoning is in `DECISIONS.md`; this is the short version.

**Immediately next**: the user reviews the three legal-page **drafts** now in the Studio (Legal
page → Terms / Privacy & Cookies / Disclosures; readable via the Preview tab), replaces
`[YOUR FULL LEGAL NAME]` (twice: Terms and Privacy intros; must match their Paddle account), sets
"Last updated" to the publish date, then publishes. Until then the live legal pages show the old
"This page has not been published in the CMS yet…" placeholder. See DECISIONS.md, "Legal pages
drafted…". Facts behind them: run by the user as an **individual** in **Nigeria**; refunds: **no
refunds, cancel anytime**, a section of Terms. Paddle's domain review needs Terms, Privacy and a
refund policy reachable from navigation, the legal name in the Terms, and a live HTTPS **own
domain**, so the domain cutover comes **before** the Paddle live switch. If Paddle's reviewer
wants a separate "Refund policy" link, add one then.

The three Thriller drafts are held until the launch date is decided; change their dates first,
then publish (an article published after its date appears at once with the old date).

**Done 2026-09-26 (unsubscribe)**: every free-list email now has an unsubscribe link + one-click
header; unsubscribed readers are skipped by the weekly recap. See DECISIONS.md. **Still open**:
the Reading Room trial emails (Resend Automation templates) need their own unsubscribe handling
when their real content is written.

**Done 2026-09-26 (social links)**: footer Pinterest/Reddit icons link to
pinterest.com/fieldnotesfromeverywhere and reddit.com/r/Fieldnotesfromew (new tab). The footer now
reads Site Settings' Social links; the URLs are the code defaults in `getSiteSettings`, which
now falls back per field, so a Site Settings document can override any one of them later. No
Site Settings document exists in Sanity yet. The Reddit URL couldn't be checked automatically
(Reddit blocks it); used exactly as the user gave it. Verified in a local production build on
home, a hub, About, Contact and the 404 page; static pages stayed static.

**Done 2026-09-26 (favicon)**: the user's ghost-reading logo is the site icon. `app/favicon.ico`
(16/32/48), `app/icon.png` (512) and `app/apple-icon.png` (180, on `--paper-050` ivory since iOS
fills transparency with black), all cut from the 2000px transparent original with its empty
margins trimmed. Next.js picks these up by filename; verified in a local production build (all
three return 200, the `<link>` tags are emitted). Previewed at 16/32px on light and dark tabs.

**Done 2026-09-26**: the Studio's "How many books" box now means the article's total in every
column (it meant "extra on top of the top 5" for What to Read When / Book Club, which made those
two drafts 5 books longer than their titles). See DECISIONS.md, "Fill books from ranking" update.

**Done 2026-09-24 (later session)**: the homepage Book Club Book Picks row was hidden because it
only showed complete pairs and just one Book Club article exists. By the user's choice, an odd
article now appears on its own (no connecting line) until a partner is published. Verified in
preview on desktop and phone. See DECISIONS.md.

**Content status (checked in Sanity 2026-09-26)**: all three Thriller articles are still
**unpublished drafts**, dated 8:00 am US Eastern on Oct 1 (Shortlist, 15 books, ranks 1-15), Oct 2
(What to Read When, 17 books: ranks 1-5 + 16-27) and Oct 3 (Book Club, 12 books: ranks 1-5 +
28-34). Counts now match the titles (re-filled by the user after the fix below; verified, no overlap
beyond the shared top 5). Meta descriptions and the Shortlist focus keyword are filled in. They
still need Publish. The Book Club slug reads "12-thrillers-books-..." (possible slip, mentioned to
the user; free to change before publishing). 3 empty untitled article drafts exist (harmless).

**Built this session (2026-09-24)**, all verified in a browser and pushed:
- Fixes: live site showed unpublished drafts (perspective bug); book covers never rendered in
  articles; blurb paragraph breaks were collapsed; copy-link control rode past the article.
- Studio: preview tab (unpublished/scheduled content), meta description field, Shortlist SEO
  checks (focus keyword; revised against the user's Backlinko guides), links in article intros
  ("Link to article" / "Web link"), hero image crop + hotspot honoured, design-size guidance.
- Site timezone is US Eastern (article dates + Studio scheduling). Hero images: design at
  2400 x 1000 (the article banner's shape); only sides are ever trimmed elsewhere.
- Book titles are `<h2>`s; book tags sit under the author.
- Mobile pass (three rounds, after the user's three mobile guides): stacked book entries on
  phones, phone menu button opening a content-width floating card with dividers, bottom-sheet
  send-list popup on phones, self-hosted fonts (next/font), contrast text shades
  (`--text-soft` etc. in `app/globals.css`), tap areas, tap feedback, form autofill + specific
  errors, bundled icons (incl. official Pinterest/Reddit marks). Live Lighthouse (mobile):
  performance 91-96, accessibility 95-100, layout shift 0.
- Visual tweaks: new hub column descriptions (also their search descriptions), boxed footer
  signup (ivory), footer top border, homepage column-name boxes + centred titles, equal hub
  lead spacing on The Shortlist.

**Open, after the Book Club fix** (raise one at a time): largest-contentful-paint 2.6-3.0s vs the
2.5s target; ~~favicon~~ and ~~social profile URLs~~ (done 2026-09-26); the user testing on their own phone/tablet; then the remaining
outstanding list further down (Reading Room post-trial automation, CRON_SECRET check, legal copy,
Paddle live switch, domain cutover + Search Console).

**Data-quality flags from the first batch (user's call, not fixed silently)**: 9 covers are
low-resolution (under 300px wide — Dark Places, Kill For Me Kill For You, Nightwatching,
Orphan X, Shutter Island, The Fourth Monkey, The Girl with the Dragon Tattoo, The Likeness,
What Lies Between Us); "The Girl with the Dragon Tattoo" is tagged Dark Fantasy (likely a
slip); ~~inconsistent title/author capitalization~~ — **fixed directly in Sanity 2026-09-23**
(11 books patched; the source CSV in Downloads still has the old casing, so re-importing it
unedited would revert them); a few near-duplicate tags exist (Plot Twist / Plot Twist
Ending, FBI Profiler / FBI Profiler MC, Toxic couple / Toxic Marriage, Global / International
Manhunt, Journalist MC / Female Journalist MC).

This session's work, most recent first: built and hardened the bulk book-import script
(`scripts/import-books.mjs`) — CSV → Sanity, handles both cover-image URLs and local cover
image files (a CSV can't hold an embedded spreadsheet image, so local files were added after
the user clarified their actual workflow), verified three times against the real dataset with
cleanup each time. Along the way, found the Sanity dataset already has real content (3
articles, 1 theme, 3 draft tags — the user's own work in the Studio, not touched by any
script). Replaced the theme taxonomy with the user's own 9-group list. Split book tags and
article-level themes into two separate Sanity document types (`tag` vs `theme`) after the
first version conflated them. Added `article.themes` so articles can be classified into the
future "Browse Our Collections" hub groupings, a real schema gap found by reading `pub_hub.md`
directly. Fixed book rank to derive from array order instead of a hand-typed field that could
drift out of sync. Added a custom Sanity Studio sidebar (articles grouped by category, Site
Settings pinned as a true singleton). Full reasoning for all of the above is in `DECISIONS.md`
(all dated 2026-09-23).

Earlier the same day: re-verified the Kit/Resend production env vars live against the real
production URL (`RESEND_NEWSLETTER_SEGMENT_ID`/`RESEND_SEND_LIST_SEGMENT_ID` confirmed
working, `CRON_SECRET` still unverified — see "Email/subscriber integrations" below), wired
the Paddle webhook to signal Resend on conversion via a new `reading_room_member` contact
property, and added a footer newsletter signup form.

Previous session, 2026-09-22: Paddle fully set up and verified end-to-end — real sandbox test
purchase → webhook → Kit tag confirmed working, after finding and fixing a real bug along the
way. Also that session: a cluster of earlier production-only bugs (`SITE_URL`, Sanity Studio's
client-side project ID, Sanity CORS/webhook, a broken production `RESEND_API_KEY`), the
Reading Room trial automation structure, the `/the-reading-room/subscribe` page, and the
Reading Room price change to $7/month.

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
  `SANITY_API_TOKEN`). **Real authoring has actually started.** As of 2026-09-23 (late): 3
  `article` documents and 1 draft `theme` (the user's own Studio work), plus 49 real `book`
  documents and 94 published `tag` documents from the first CSV import. The user's 3 former
  draft tags (Thriller, Dark Fantasy, Dark Romance) were published by that import under their
  original ids rather than duplicated — see `DECISIONS.md`, bulk book import, third update. Every page that depends on content still handles the empty/partial
  case gracefully (see "Empty content state" below) rather than crashing.
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

**Content-authoring workflow (started 2026-09-23)**: the user will author real *articles*
directly in the Studio (`/studio`), article by article, as they go — not via a bulk
import/spreadsheet. **Books are the exception** — see the bulk-import script below. Several
things were fixed/added/built before real authoring starts:
- **Book rank is no longer a field you fill in.** It's derived from the order you arrange a
  Shortlist article's book entries in (drag to reorder) — see `DECISIONS.md`, "Book rank is
  derived from array order." Previously a separate hand-typed number existed that could
  silently disagree with the actual displayed order.
- **Custom Studio sidebar** (`sanity/structure.ts`): Articles are grouped into three lists by
  category (matching the three Publication columns) rather than the default flat alphabetical
  list; Site Settings is pinned as a true singleton (can't be accidentally duplicated). See
  `DECISIONS.md`, "Studio: articles grouped by category, not tags; Site Settings pinned
  singleton." **Not yet visually verified live** — Studio login is account-tied OAuth, so this
  needs the user's own eyes the first time they open `/studio` after this deploys.
- **Article-level themes, separate from book tags**: articles can now be tagged with which of
  the 8 "Browse Our Collections" groupings (genre/mood/trope/etc. — `pub_hub.md` §5–12) they
  belong to — a real schema gap found while checking the spec at the user's direction (the
  schema previously had no way to say what an *article as a whole* is about, only what
  individual books within it are). This lives on a new `theme` document type
  (`sanity/schemaTypes/theme.ts`), deliberately separate from `tag` (book descriptors like
  "dark fantasy," "brutal") — a theme and a tag can share a name without being the same
  record. `tag.group` was removed (nothing ever rendered it, and `theme.group` now does that
  job). Both `theme` and `tag` are Publication-scoped only — the future Reading Room
  archive/catalogue is expected to have its own separate book/tag model, not reuse these.
  Threaded through `ArticleSummary`/`Article` and both GROQ projections so the data is
  captured now, before real authoring starts, even though no hub page reads it yet. Also
  added to the Studio sidebar as its own section. See `DECISIONS.md`, "Articles need their own
  taxonomy-group associations" and "Split `tag`... and `theme`... into separate types."
- **Per-article tag display**: a book's tag pills shown within an article already come from
  `bookEntries[].tags` if you fill it in (a deliberate subset/override of that book's own
  canonical tags — e.g. show only "dark fantasy" for a book tagged dark fantasy, brutal, AND
  emotionally devastating on its own record, if that's the only one relevant to this
  particular list) — falls back to the book's full tag list if left empty. This mechanism
  already existed in the code; the field's Studio description was clarified so it's obvious
  what it does without reading code.
- **Theme groups**: replaced with the user's own 9-group taxonomy — Genre, Tone, Mood, Trope,
  Character Archetype, Relationship, Setting, World Elements, Opening Style — instead of
  `pub_hub.md`'s original 8 named sections. A deliberate, documented divergence from that
  governing spec; see `DECISIONS.md`, "Theme groups replaced with the user's own 9-group
  taxonomy."
- **Bulk book-import script** (`scripts/import-books.mjs`, `npm run import-books -- <file.csv>`):
  since books are simple, structured records, the user will hand off batches as a
  spreadsheet/CSV rather than creating each one by hand in the Studio (articles still get
  authored directly in the Studio, one at a time — see above). Columns: `title`, `author`,
  `blurb`, `tags` (semicolon-separated), `cover` (either a local image file path, resolved
  relative to wherever the CSV itself lives, or a direct image URL — either way it's uploaded
  to Sanity's asset store automatically; a CSV can't hold an actual embedded spreadsheet
  image, so images pasted directly into spreadsheet cells need to be exported as real files
  into a folder first, per the user's chosen workflow — see `DECISIONS.md`). Matches existing
  books by title+author so
  it's safe to re-run with an updated file; matches/creates tags by name; a blank `cover` cell
  on a re-run preserves whatever cover the book already has rather than clearing it. **Note**:
  re-running does fully replace each matched book's document from its CSV row, so a manual
  edit made in the Studio to an already-imported book (e.g. adding an extra tag by hand) would
  be overwritten if that same row is re-imported later — treat the CSV as the source of truth
  for whatever it manages. **Real bug found and fixed while first testing this against the
  live dataset**: the user had already started adding real tags directly in the Studio (three
  unpublished drafts — Thriller, Dark Fantasy, Dark Romance, found live) before this script
  existed. The script's first version matched an existing tag by name regardless of
  draft/published status, so it wired a real book to a `drafts.*` tag id — not valid Sanity
  practice. Fixed by excluding drafts from the tag-matching query (only matches/reuses
  published tags now). Verified twice against the real dataset (once before cover-image
  support was added, once after): ran with template rows each time, confirmed books/tags/
  cover images all landed correctly with real uploaded asset URLs, confirmed the existing
  "Dark Fantasy" draft was correctly recognized and never duplicated, then deleted all of the
  script's own test output afterward (books, tags, and uploaded image assets) — leaving the
  user's 3 real draft tags untouched both times. **Local-file cover support added same
  session**, after the user clarified they'd planned to paste actual images into spreadsheet
  cells rather than use URLs — verified against the real dataset a third time (a valid local
  file uploads correctly; a missing/bad file path fails just that book's cover with a warning,
  same graceful-degradation behavior as a bad URL), cleaned up afterward. See `DECISIONS.md`.

**Still using mock/placeholder behavior**: none — the "one hand-authored lead article, every
other hub card resolves to a synthesized placeholder" mechanism from the mock-data era is gone
entirely. Every hub card and article now comes from a real Sanity document; nothing resolves
until something is actually published in the Studio.

**Built:**
- Design tokens ported verbatim to `styles/tokens/*.css`, global reset in `app/globals.css`.
- Design-system components actually used by the built pages: `Button`, `Icon`, `BookCover`
  (`components/ds/`). The chat/cart/discover `ui_kits` components in the design bundle were
  confirmed unused by every page read and were not ported — see `ARCHITECTURE.md` §4.
- `Header` / `Footer`, shared across every page. Footer includes a newsletter signup form
  (added 2026-09-23, not part of the original design — see "Immediately next" below).
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
  starts a trial via `/api/reading-room/start-trial` (fires a Resend event only; Kit is never
  touched by trial-start — see "Email/subscriber integrations" below). Hero also has a
  "Subscribe" button alongside "Try it free", linking to `/the-reading-room/subscribe` — a
  standalone confirm-and-pay page using `ReadingRoomCheckoutButton` (Paddle.js checkout),
  fully configured and working (see "Paddle account" under "Known open items" below).
- API routes: `/api/subscribe` (Kit + Resend), `/api/webhooks/paddle`, `/api/webhooks/sanity`
  — all functional. Sanity and Paddle's webhooks are both configured and verified firing
  end-to-end against real accounts; Resend's env vars are live in production too.
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

  **Bug found and fixed (2026-09-22)**: production's `RESEND_API_KEY` was not a valid key —
  both `/api/subscribe` and `/api/reading-room/start-trial` returned 502 on the real production
  URL (this had likely never actually worked in production; the earlier "verified through an
  actual browser" note was against a **local dev server**, not production — see git commit
  `e4c1656` for the real origin of the two-key setup: a previous session created the
  `.env.local` key separately only because Vercel permanently masks a saved value and the
  original marketplace-provisioned key could never be read back out — not a deliberate
  security-separation decision). Whatever ended up in Vercel's `RESEND_API_KEY` wasn't a
  working key for either purpose. Fixed by the user reconnecting Resend's Vercel integration
  (Resend's own "Connect to Vercel" flow, which provisioned fresh `RESEND_API_KEY` and
  `RESEND_EMAIL_DOMAIN` values) and redeploying. **Verified live** immediately after: both
  routes return real success responses (`{"started":true}`, `{"subscribed":true,...}`) against
  the production URL, not just locally.
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

**Verified through an actual browser, 2026-09-22** (not just the API routes — everything
above this point had only been tested by calling routes directly, not through the real UI a
visitor would use): drove both the Reading Room trial form and the article "send this list to
me" popup with Playwright against a live dev server — screenshots confirmed both forms render
the name+email inputs correctly and show the right success state after a real submission,
with no console errors. The article popup needed temporary test content (a book + article
created directly in Sanity, then deleted after — same pattern as the original Sanity
integration test) since no real content exists yet. Caught and fixed a real, unrelated bug in
the process: roughly 15 orphaned `npm run dev` processes had silently accumulated across the
session because stopping a background task doesn't reliably kill the underlying process tree
on this Windows setup — this caused a genuine Next.js crash (`clientReferenceManifest`
invariant error) from multiple dev servers racing on the same build cache, which looked at
first like a real code bug. All orphaned processes killed, `.next` cache cleared, single
clean instance confirmed. (Saved as a memory for future sessions on this machine.)

**All required env vars are on Vercel** (`KIT_API_KEY`, `KIT_READING_ROOM_TAG_ID`,
`RESEND_API_KEY`, `RESEND_NEWSLETTER_SEGMENT_ID`, `RESEND_SEND_LIST_SEGMENT_ID`,
`CRON_SECRET`) — **done by the user 2026-09-22**, including removing the now-dead
`KIT_NEWSLETTER_TAG_ID`/`KIT_SEND_LIST_TAG_ID`.

**Re-verified live against production, 2026-09-23**: `POST /api/subscribe` against the real
production URL with `source:"newsletter"` and again with `source:"send-list"` (the latter hits
its 400 for a missing `articleSlug`, but the segment-add happens first regardless — see the
route's code order) both returned success, and a direct Resend API check
(`GET /segments/{id}/contacts`) confirmed the test contact actually landed in both
`RESEND_NEWSLETTER_SEGMENT_ID` and `RESEND_SEND_LIST_SEGMENT_ID` — so both those production
env vars are confirmed working, not just present. `KIT_API_KEY`/`KIT_READING_ROOM_TAG_ID` were
already independently verified via the real Paddle sandbox purchase → webhook → Kit tag test
(see "Paddle" below), so nothing further was needed there. **`CRON_SECRET` was not
re-verified** — the harness's own auto-mode classifier blocked a direct call to the production
cron endpoint as a "real-world transaction" (it sends real email if there's anything to send);
worth a quick explicit-permission check next time, low urgency since a wrong secret just fails
closed (401), it doesn't silently misfire.

**Still needed**:
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

**Content authoring has now genuinely started (2026-09-23)** — the sequencing preference
below (2026-09-21: content/legal copy deliberately last) held exactly as intended: the
remaining technical/integration work (Paddle, the Resend/Kit conversion signal, the footer
newsletter form) was finished first, and content authoring began only once that was done, not
before. The first real book batch (49 thrillers) is imported — see the top of this file for
the data-quality flags awaiting the user's review. Further batches: `npm run import-books --
<path-to-their-file>` (the user's own spreadsheet export format works as-is — see
`DECISIONS.md`, bulk book import, third update).
Real legal copy (Terms/Privacy/Disclosures) is still not written — still last, alongside the
rest of the editorial content.

**Resolved 2026-09-23**: added a real "join the list" newsletter signup form to the site
footer (`components/FooterNewsletterForm.tsx`), submitting to `/api/subscribe` with
`source: "newsletter"`. This wasn't shown anywhere in the design (the only free-list entry
point the design specifies is the article "send this list to me" popup, `pub_article.md`
§6.4) — footer placement was confirmed with the user before building, since inventing a new
entry point isn't something to place unprompted per `CLAUDE.md`. Verified with a real
Playwright run against a live dev server: desktop and mobile both render correctly, a real
submission (the user's own email) succeeded end-to-end with the success message showing and
no console errors, and the Resend segment received it (same segment already verified above).

**Resolved 2026-09-22** (all verified live against production, not just locally): `SITE_URL`
pointed at a dead per-deployment URL — fixed, now uses the stable hash-less production domain
(see "Deployment" below for the important lesson on Vercel URL types). Sanity's embedded
Studio never actually worked in production (client bundle fell back to a hardcoded
placeholder project ID — see "Deployment" below); fixed in code via `next.config.mjs`.
Sanity's CORS allowlist and publish webhook were pointed at the dead URL; both corrected and
the webhook confirmed firing (a live test article appeared within 10 seconds of publishing).
`RESEND_API_KEY` in production wasn't a valid key at all — `/api/subscribe` and
`/api/reading-room/start-trial` both 502'd on production; fixed by reconnecting Resend's own
Vercel integration and redeploying, now verified returning real success responses in
production.

**Reading Room trial automation — structure complete, content pending.** Clarified
2026-09-22: the trial isn't a separate "trial-only" marketing sequence — a trialing reader
just receives the same real, themed daily catalogue issues (per `rr_landing.md`: cover +
title/author/blurb per book, Amazon-search-result-style layout) a paying member would get,
for 7 days. Sequence, confirmed with the user: **welcome email** (explains what's coming, says
the first issue arrives in a few minutes) → **issue 1** (~5 minutes later) → **issues 2–7**
(one per day) → each issue ends with a conversion nudge (varied wording, possibly a
trial-duration discount — Paddle itself is built now, but discount-code mechanics aren't
implemented yet). Built as a 16-step Resend Automation (trigger +
8 send_email steps + 7 delay steps between them), confirmed firing end-to-end against a real
inbox. **The 7 issue templates currently hold structural placeholders only** — no fake themes
or book picks were written; that's real editorial work (themes, book selections, blurbs),
deferred to the end of the build same as Sanity content, per the user's explicit sequencing
preference (2026-09-21, reconfirmed 2026-09-22 for this specifically — see
`project_content_authoring_sequencing` in agent memory). Automation id `01a0c97d-1c72-72fd-b8b3-39b58340aacc` ("Reading Room Trial Sequence"), welcome
template id `0306e7f0-66de-44bf-a65e-a60e89532431`, issue templates 1–7 respectively:
`5c4c4c69-92b3-44de-bf91-e87f136a7ddb`, `db73717c-bfb4-4b12-a581-8949ece27097`,
`accc3914-eba9-48a6-8f67-8cf10770a4bf`, `6d5bebd3-4bbd-4a0b-9ab2-61671452196e`,
`29a19992-dfaa-4f8f-abcb-0d8d08ab8bd5`, `0e033b8a-5cda-4be8-a502-28f132ac7403`,
`695adb0a-c721-4d18-9a2a-daeb3c68a4fa` — all findable in Resend's dashboard by name
("Reading Room - Issue N (placeholder)") too, this is just for a quick API reference.
**Still needs, once content exists**: swap each placeholder template's `html` (PATCH
`/templates/{id}` + re-publish — see this session's history for the exact call shape) and
write the varied per-issue conversion-nudge copy. **Still needs regardless of
content**: the post-trial branch — a conversion-check (member email vs. continued push) after
issue 7 — isn't built yet (see "Still open" under the Paddle section below for exactly what's
missing to make it possible now that Paddle exists).

**Bug found and fixed while building this**: a Resend Automation step's `variables` field does
NOT use `{{handlebars}}`-style string interpolation to reference trigger event data — that
syntax silently sends the literal text as-is (a real subscriber would have seen "Hi
{{event.name}}"). The correct form is an object reference: `{"name": {"var": "event.name"}}`.
Caught by testing against a real inbox before this ever reached a real subscriber, not by
reading docs correctly the first time — worth remembering if any other automation step ever
needs dynamic event/contact data.

**Where Paddle fits — built and verified end-to-end, 2026-09-22**: Paddle stays completely out
of the trial (see `DECISIONS.md`, "Reading Room's free trial is tracked in Kit, not as a
Paddle trial" — trial mechanics moved to Resend since, but this principle didn't change). It
only enters when someone actually decides to subscribe, via a standalone page,
`app/the-reading-room/subscribe/page.tsx` — every "subscribe"/"keep it going" CTA points here
rather than triggering Paddle checkout independently from multiple places. Deliberately
doesn't re-explain what The Reading Room is. `noindex`ed and not in `sitemap.ts` (a checkout
page has no reason to rank in search). **Linked from the Reading Room landing page hero**
(the "Subscribe" button added alongside "Try it free" — see below); trial issue emails will
link here too once they have real content. See "Paddle account" under "Known open items"
below for the full account-side build (webhook, Price, tokens) and the real bug that was
found and fixed along the way.

**Resolved 2026-09-23**: the Paddle webhook now also writes a matching signal into Resend on
every conversion/cancellation event — a Resend contact property (`reading_room_member`,
0/1), set alongside the existing Kit tag call. See `DECISIONS.md`, "Paddle webhook signals
Resend via a contact property, not a second event," for why a persistent property was chosen
over a second one-shot event. Verified directly against the real Resend account (create +
update + read-back, matching the exact shape the code sends); not yet exercised through an
actual Paddle webhook delivery this session. **Still open**: the automation's actual
`condition` step(s) reading this property, and the post-trial email series itself, both still
need to be built in Resend's dashboard — this only made the signal available, per
`ARCHITECTURE.md` §9's existing framing that automation content/timing is dashboard
configuration, not app code.

1. **In progress**: author real content — Sanity articles/books/tags/Site Settings, the 7
   Reading Room issue templates in Resend (see above), and real legal copy for
   Terms/Privacy/Disclosures. Everything else in this document is done. Started 2026-09-23
   (see "Content-authoring workflow" above); first 49 books imported 2026-09-23.

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
- **Paddle enters only at real conversion**: a real Paddle checkout for the $7/month Price,
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

- **Paddle — done, 2026-09-22.** Account created, Sandbox environment. Product + $7/month
  Price created by the user in the dashboard; client-side token and webhook destination
  created directly via the Paddle API (same pattern as Sanity/Resend earlier — used
  `PADDLE_API_KEY` directly rather than walking the user through more dashboard clicks). All
  5 env vars (`PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`, `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`,
  `NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox`, `NEXT_PUBLIC_PADDLE_READING_ROOM_PRICE_ID`) are in
  `.env.local` and on Vercel. Default payment link set to the production
  `/the-reading-room/subscribe` page (works for sandbox now, no change needed at go-live).
  The `customerId`→email resolution TODO in `app/api/webhooks/paddle/route.ts` is now
  implemented (`paddle.customers.get`), and `setReadingRoomTag(active=false)` in
  `lib/integrations/kit.ts` (previously an unimplemented stub) now works too, via Kit's
  documented email-lookup-then-delete-tag pattern.

  **Verified end-to-end against real accounts**, not just code review: a real sandbox test
  purchase (Paddle's test card) → webhook delivery → Kit tag. Caught and fixed a real bug in
  the process — the Paddle Node SDK defaults to the **production** API unless `environment` is
  passed explicitly; `new Paddle(apiKey)` with no options was silently hitting production with
  a sandbox key/customer, failing, and returning a bare 500 with no detail (visible only via
  Paddle's own notification delivery logs, which showed 3 failed attempts). Fixed by passing
  `environment` read from `NEXT_PUBLIC_PADDLE_ENVIRONMENT`. After the fix, replayed the
  originally-failed webhook via Paddle's API (no need for a second test purchase) — delivered
  successfully, Kit tag confirmed applied.

  **Still open**: no trial is configured on Paddle's side (correct, matches
  "Email/subscriber architecture" below — Paddle only enters at real conversion). Switching to
  a live Price/token/webhook at actual go-live is a distinct, deliberate step, not done yet.
  Paddle's own receipt email didn't arrive on the sandbox test purchase — likely just sandbox
  behavior (Paddle's transactional emails are entirely outside this app's code either way),
  worth a glance once testing with production credentials but not chased now.
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

**Phone/mobile pass — three rounds done 2026-09-24** (see `DECISIONS.md`): stacked book
entries, phone menu button, bottom-sheet send-list popup, self-hosted fonts, contrast shades,
tap areas, form autofill/errors, bundled icons; tested in Chromium, WebKit (Safari) and Firefox,
portrait and landscape. Live Lighthouse (mobile): performance 91-96, accessibility 95-100, layout
shift 0. **Still open**: largest-contentful-paint 2.6-3.0s vs the 2.5s target; ~~the favicon~~ (done 2026-09-26); a check on the user's own phone and a tablet; the ~11 KB legacy-JS audit
deliberately skipped (would drop older iPhones).

(Earlier note, superseded:) **Phone layout pass — first round done 2026-09-24** (see `DECISIONS.md`): book entries, header,
homepage intro text and the send-list popup fixed at phone width; every page audited at 390px.
Not yet looked at: tablet widths in detail, the Reading Room book shelf's placeholder covers (a
content gap, not layout), and hub "All articles" showing an empty heading when a column has only
its lead article.

~~**Mobile polish, deliberately deferred (2026-09-22)**~~: the user noted the site doesn't perform
particularly well on mobile generally, and wants that tackled as a dedicated pass at the end
of the build, not piecemeal per-feature. Don't go looking for broad mobile issues outside
whatever a specific change actually touches — verifying a new feature works reasonably on a
narrow viewport (per this session's normal UI-verification practice) is still expected, but
a full site-wide mobile audit/fix is out of scope until explicitly picked up later.

## Remote repository

Connected 2026-09-21: `origin` → `git@github.com:Damii-A/field-notes-from-everywhere-website.git`
(SSH — an existing `~/.ssh/id_ed25519_github` key was already authenticated for this GitHub
account, so no new credentials were needed; note the repo was later renamed to all-lowercase by
GitHub/Vercel — the remote URL was updated accordingly). `master` tracks `origin/master`. Future
sessions should push completed logical work regularly per `AI_ENGINEERING_OPERATING_MANUAL.md`
§18, §20.

## Deployment

**Production URL**: `https://field-notes-from-everywhere-website.vercel.app` — no hash
suffix. This is Vercel's stable, project-name-based alias that always points to whatever the
current production deployment is. Deploys automatically on push to `master`.

**Important lesson (2026-09-22), so this doesn't get re-litigated**: every URL this file
recorded before today (`...-o6jkwewmr.vercel.app`, then `...-94ph8iele.vercel.app`) was
actually a **per-deployment URL** — Vercel gives every individual deployment its own unique,
hash-suffixed URL that stays frozen to that exact build forever, even after later deployments
supersede it in production. Those aren't aliases; they don't move. Only the hash-less
`<project-name>.vercel.app` form is the real, stable production alias. Two prior sessions'
worth of confusion (stale content, 404s on newer routes, `SITE_URL` fixes that appeared not to
take effect) traced back to testing against frozen per-deployment URLs instead of this one.
**Always use the hash-less URL** for verification and for `SITE_URL` going forward.

**`SITE_URL` is now correctly set to this hash-less URL** — fixed and redeployed 2026-09-22,
verified live via a fresh direct check of both `sitemap.xml` and `/rss` (both emit
`https://field-notes-from-everywhere-website.vercel.app`, no hash), cross-checked via two
independent fetch paths. This was previously claimed "confirmed" before it actually was (see
git history on this file) — that's corrected now with an actual verified check.

**Sanity CORS + webhook — fixed 2026-09-22**: both were pointed at the dead `o6jkwewmr` URL.
Added the correct hash-less production URL to Sanity's CORS allowlist directly via Sanity's
management API (`SANITY_API_TOKEN` has sufficient scope for this — no need to ask the user to
do it by hand). Re-created the publish webhook the same way (the old one was also gone —
`GET /hooks/projects/{id}` came back empty; whether it was ever actually working before is
unclear). **Verified live**, not just configured: published a real temporary test article
directly in Sanity and it appeared on `/the-shortlist` within 10 seconds — well inside the
5-minute ISR fallback window, proving the webhook genuinely fires, not just that the config
looks right. Deleted the test article afterward; its removal also showed up within seconds.
Note: this Sanity project's plan allows only 2 webhooks total — 1 is now in use, 1 free.

**Embedded Studio was broken in production the entire time — fixed 2026-09-22, in code.**
`sanity.config.ts`'s fallback (`NEXT_PUBLIC_SANITY_PROJECT_ID || SANITY_STUDIO_PROJECT_ID ||
SANITY_API_PROJECT_ID || "placeholder-project-id"`) only works for server-side code
(`groqFetch.ts`) — the embedded Studio runs entirely in the browser, and Next.js only bakes
`NEXT_PUBLIC_*`-prefixed vars into client bundles at build time. `SANITY_STUDIO_PROJECT_ID`
(what Vercel's Sanity marketplace integration actually provisions) can never reach browser
code, no matter how it's scoped in Vercel's dashboard — this was a real code gap, not a
settings mistake, confirmed by inspecting the deployed client bundle directly (it contained
the literal string `"placeholder-project-id"`, with `NEXT_PUBLIC_SANITY_PROJECT_ID` entirely
absent from the compiled output). Fixed by resolving the same fallback chain in
`next.config.mjs`'s `env` block instead, where all naming conventions ARE readable at build
time, and re-exposing the result under the `NEXT_PUBLIC_` name. The user's earlier successful
Studio test (2026-09-21) was almost certainly against local dev, not production — `.env.local`
sets `NEXT_PUBLIC_SANITY_PROJECT_ID` directly, so it was never affected by this bug.

- **Env vars**: set directly in Vercel's dashboard (Environments section), not synced from
  `.env.local`. Two things to know: (1) the Vercel Sanity marketplace integration provisions
  its own variable names (`SANITY_STUDIO_PROJECT_ID`, `SANITY_API_PROJECT_ID`,
  `SANITY_STUDIO_DATASET`, `SANITY_API_DATASET`, `SANITY_API_READ_TOKEN`,
  `SANITY_API_WRITE_TOKEN`) rather than the `NEXT_PUBLIC_SANITY_*`/`SANITY_API_TOKEN` names this
  app was originally written against — `lib/sanity/groqFetch.ts` reads either via its own
  fallback (fine, server-side); the embedded Studio needed the `next.config.mjs` fix above
  since client-side code can't use that same fallback trick; (2) `SANITY_WEBHOOK_SECRET` was
  added manually (not integration-provisioned, since it's a value this app invented) and must
  match what's registered in Sanity's webhook config (now re-verified correct, see above).
- **Resend integration**: installed via Vercel's marketplace, provisioned its own account/API
  key and a sending domain (verified via DNS records at Cloudflare — subdomain-scoped MX
  record under `send.<domain>`, doesn't conflict with existing email on the root domain).
  Inbound email receiving deliberately left off — not needed, would conflict with the domain's
  existing personal-inbox MX records. **Bug found and fixed 2026-09-22**: whatever ended up in
  Vercel's `RESEND_API_KEY` (likely the `.env.local` "Local dev" key pasted in by mistake — see
  "Email/subscriber integrations" above for the full story) was not a working key in
  production — `/api/subscribe` and `/api/reading-room/start-trial` both 502'd on the real
  production URL. Fixed by the user reconnecting Resend's own "Connect to Vercel" flow, which
  provisioned fresh `RESEND_API_KEY`/`RESEND_EMAIL_DOMAIN` values, then redeploying. Verified
  live afterward — both routes now return real success responses in production.
- **Deployment Protection**: was on by default (Vercel's own SSO-gate, blocking all public
  access) and has been turned off so the site is actually publicly reachable.
- **Custom production domain**: deliberately not connected yet — Vercel's domain-connection
  flow asks for either a nameserver handover or a root CNAME, both of which are the real DNS
  cutover this project is holding off on until the site is otherwise ready to launch (see
  `DECISIONS.md`/`CLAUDE.md` on treating that as a deliberate, late step, not routine).
- **Not yet done**: Kit env vars on Vercel (account/integration itself is done locally — see
  "Kit connection" above) and Paddle account/integration; real content authoring (deliberately
  sequenced last — see below); legal copy; the domain cutover above.
