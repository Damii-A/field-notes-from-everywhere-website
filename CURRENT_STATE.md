# Current state — Field Notes From Everywhere

Last updated: 2026-10-08. Full reasoning is in `DECISIONS.md`; this is the short version.

Trimmed 2026-10-06: the session-by-session history that used to sit here (much of it superseded)
is in git (`git log -p -- CURRENT_STATE.md`); every decision it described is in `DECISIONS.md`.
This file now holds only what's true today, what's open, and facts a new session needs.

**Session ended 2026-10-06 (second session).** Everything committed and pushed; no local servers
running. Done this session: this file trimmed and `ARCHITECTURE.md`'s stale lines fixed; the two
Reading Room email-screenshot placeholders (homepage teaser, `/the-reading-room`) replaced with the
user's own framed images, live and checked (DECISIONS.md, visual tweaks list). Item 1 below was
still pending at session end.

**2026-10-08: The Reading Room is now weekly, every Tuesday** (user; DECISIONS.md). All site and
email copy changed in code; Terms and Disclosures (Sanity) now say "sent once a week", Last updated
2026-10-08 (edited by the user in the Studio, checked live). Also:
- The Thriller issue already went out (Kit broadcast 26208411, sent 2026-10-06 14:09 UTC to the one
  member, the user) ending "back in your inbox on Thursday"; nothing to resend. Future issues: the
  closing sentence is typed per issue in the Studio, so just don't name another day.
- The paused trial's Resend templates (welcome + 7 placeholder issues) still say "daily" / "a day for
  the next 7 days". The automation is stopped, so nothing sends; rewrite them when the trial is rebuilt.
- Paddle product description updated by the user 2026-10-08 (user-confirmed; not checked by me).

## Pick up here

1. ~~Tuesday cron's first run~~ **Done 2026-10-06**: the user received "No newsletter this week"
   at hello@ (confirmed 2026-10-08), so the Vercel cron and `CRON_SECRET` work in production.
2. **First week an article is published**: the Tuesday email's Studio link should open a filled-in
   Weekly newsletter, and "Create Resend draft" should make a Resend draft (neither seen for real
   yet: Studio login is the user's). After the first send, show the user its stats (Resend →
   Broadcasts).
3. **When the first real member pays** (only sandbox-tested so far), check:
   - they saw the "You're in!" message on the subscribe page;
   - Kit shows them with the member tag **and their first name** (checkout asks for it since
     2026-10-06; the webhook end couldn't be tested in sandbox);
   - Resend shows a "Welcome to The Reading Room!" email to them.
4. Not yet seen with a real event: a recovered failed payment re-tagging a member
   (`subscription.updated`, handled since 2026-10-05).

The user's own subscription (lululope@yahoo.com, Kit subscriber 4306601425, first name "Dami") is
real and kept; it's the only member-tagged subscriber in Kit (tagged 2026-10-05).

## Open, raise one at a time (nothing blocking)

- Cancelling the old WordPress hosting, if the account still exists (provider unknown).
- The column hub pages' own descriptions (`lib/content/categories.ts`, also used by llms.txt and
  search results) still differ from the homepage column copy (offered, not chosen).
- Optional: accurate sitemap `lastmod`; JSON-LD beyond the book pages (offered, not chosen).
- 9 low-resolution covers (under 300px wide; user said "later"): Dark Places, Kill For Me Kill For
  You, Nightwatching, Orphan X, Shutter Island, The Fourth Monkey, The Girl with the Dragon Tattoo,
  The Likeness, What Lies Between Us.
- Largest-contentful-paint 2.6-3.3s on mobile vs the 2.5s target (homepage hero image). Remaining
  levers, not done: ~300ms render-blocking CSS; the homepage preloads 7 font files.
- A check on the user's own phone and a tablet (the phone share-sheet button is already verified).
- Cosmetic leftovers, user's discretion: the unused Kit form and old Kit free-list tags; the
  `*.vercel.app` CORS entries in Sanity.
- Before joining an **ad network**: a Google-certified consent platform for EEA/UK/Swiss visitors,
  and a privacy-policy update naming it.

Settled, don't offer again: merging near-duplicate book tags (declined 2026-09-29); blocking AI
training crawlers in robots.txt (declined twice).

## Paused: the Reading Room free trial

Paused 2026-09-27 (user). Every Reading Room CTA says "Join The Reading Room" and goes to
`/the-reading-room/subscribe`. It comes back **after the first 7 real issues have gone to paying
members**, using them as sample issues; at one issue a week (since 2026-10-08) its length/sample needs rethinking.
Rebuild steps: `DECISIONS.md`, "Reading Room free trial paused". The Resend automation "Reading Room
Trial Sequence" (`01a0c97d-1c72-72fd-b8b3-39b58340aacc`) is **stopped**; its welcome template
(`0306e7f0-66de-44bf-a65e-a60e89532431`) and 7 issue templates ("Reading Room - Issue N
(placeholder)") hold placeholders only. When rebuilt, those emails need their own unsubscribe
handling and a post-trial branch on the `reading_room_member` contact property.

## What's live (reference)

**Site**: https://fieldnotesfromeverywhere.com on Vercel, auto-deploys on push to `master`
(`origin` = `git@github.com:Damii-A/field-notes-from-everywhere-website.git`). `www` and the
`vercel.app` alias 308-redirect to the root. DNS at Cloudflare (DNS only, grey cloud), registrar
Namecheap; details in `ARCHITECTURE.md` §11.

**Content (Sanity)**: project `7ci7c80z`, dataset `production`, Studio at `/studio`.
- 49 books (all with Goodreads links and slugs), 94 tags, the "Thriller" ranking (49 books).
- Published: the three Thriller articles (one per column, dated 2026-09-27), Terms / Privacy /
  Disclosures (real copy, "Last updated" 2026-09-30), Site Settings.
- The user's Thriller Reading Room issue (Kit draft updated by the user 2026-10-05).
- Publish webhook → `/api/webhooks/sanity` (revalidate + IndexNow). The plan allows 2 webhooks;
  1 is used.
- The local `SANITY_API_TOKEN` is a new **Editor** (write) key since 2026-10-08 (dry-run write test passed). Writes to live content via scripts are still blocked by Claude Code's auto-mode safety check; the user makes those edits in the Studio unless they add a permission rule.
- Publishing an article whose date has passed: update its date first, or it shows the old date.
- More books: `npm run import-books -- <file.csv> [--ranking "Name"]`; Goodreads links:
  `npm run goodreads-links`. The original Thriller CSV in Downloads has old title casing (fixed in
  Sanity); re-importing it unedited would revert 11 books.

**Email**: Resend sends everything except member issues. It holds the free list: segments for
newsletter signups, send-list signups, and "Email list (everyone)"
(`8cc353d8-01f9-4e6a-a3f9-dc61420682e9`, what the newsletter goes to). Kit holds only members (tag
`23811808`). Member issues are Kit drafts sent by the user, from bookrecs@; hello@ is admin/support.
Gmail clips past ~102 KB; Kit's estimate ≈ body × 1.19 + 31 KB; a 30-book issue with full blurbs
(~130 KB) is clipped, accepted and signposted.

**Payments (Paddle, live since 2026-09-29)**: product `pro_01m3j7tcyp08vmnx18avy12pfk`, price
`pri_01m3j7tdjww6pbve0azdszysw5` ($7/month, no trial, tax by location), client token
`ctkn_01m3j7tdwqyd1d309bgp69ctvq`, notification destination `ntfset_01m3j7te7sraen15jcmd15q3wd`
(subscription activated / canceled / past_due / trialing / updated → the live webhook). The inline
checkout's look is set in Paddle's dashboard (slate #2C464F button, focus outline #2C464F).
`.env.local` holds sandbox values under the normal names and live ones as `PADDLE_LIVE_*`. The
auto-mode classifier blocks scripts that read the live Paddle key, so live Paddle API checks need
the user's approval or a dashboard check by the user. Sandbox webhooks go to the live site, which
rejects their signature, so sandbox purchases never touch Kit/Resend.

**Analytics and search**: Google Analytics 4 (`G-4DSKEJTSC5`, consent banner for EEA/UK/CH),
Google Search Console and Bing Webmaster Tools (sitemap processed, 13+ URLs), IndexNow on publish.

## Out of scope for V1

The logged-in Reading Room product (login, Books, Past Issues), the hubs' "Browse our Collections"
sections and Recent-Articles carousel. See `DECISIONS.md` ("V1 scope excludes the logged-in Reading
Room product") and `docs/design-specs/DESIGN_PROJECT_BUILD_NOTES.md`.

## Lessons worth keeping

- Test against the real domain, never a hash-suffixed per-deployment `*.vercel.app` URL (those are
  frozen to one old build).
- Avoid dotted, extension-like App Router folder names on Vercel (`feed.xml` 404'd; it's now a
  rewrite to `/rss`, likewise `/llms.txt` → `/llms`).
- The Paddle Node SDK defaults to the production API unless `environment` is passed.
- Resend Automation steps reference event data as `{"var": "event.name"}`, not `{{handlebars}}`.
- Client-side code only sees `NEXT_PUBLIC_*` env vars (the embedded Studio's project id is resolved
  in `next.config.mjs` for that reason).
- Resend shows a contact's *first* signup date; re-signups keep it (not a bug).
