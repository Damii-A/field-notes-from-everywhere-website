# Current state — Field Notes From Everywhere

Last updated: 2026-10-28. Full reasoning is in `DECISIONS.md`; this is the short version.

**2026-10-28: access check.** Working: GitHub push, live site, Resend, Kit, Sanity read **and write**
(new local Editor key "Claude Code local", made by the user; the old one returned "Session not found",
i.e. deleted), and the Claude Design project via `DesignSync` (user ran `/design-login`). **Standalone
Claude Design closes by 2026-12-14** (it moves into Claude): before then, decide how to keep a reference
copy of the "Full FNFE Website" project, since it's governing source #1. Not working, left on purpose
(user agreed): the Sanity MCP connector (Claude Code's OAuth builds a broken
`mcp.sanity.io.well-known` URL; the server itself answers fine; the API key covers everything); the
sandbox `PADDLE_API_KEY` (403 on every endpoint; only matters for a Reading Room relaunch); no Vercel
or GitHub CLIs installed (not needed). Old Sanity keys ("Claude Write token (Robot)", "Claude's Field
Notes Sanity API") are left in place: which key Vercel's `SANITY_API_TOKEN` is can't be told from
Sanity's list, and deleting it would break the site's content fetches.

**First, the internal tool's open items** (its CURRENT_STATE.md "Start here", end of 2026-10-28): the
edit session is closed (done; the user then invalidated Dragon Tattoo's Dark Fantasy recommendation
themselves); the rebuilt "+ tag" menu (done 2026-10-28: works, checked on a database copy); the tool's
duplicate scan (done 2026-10-28: ~4x faster, same suggestions). Never click-test against the
tool's live data. Then the next feature is "Send to website" (design in the paragraph below).

**Start the next session here (as of 2026-10-28; nothing blocking).** Dated: (1) after ~2026-11-05,
check the user's Kit member tag is gone (paused subscription, below); (2) before 2026-12-14, keep a
reference copy of the Claude Design project (above). Otherwise the user's next step is writing the
next article with the new Studio tools; offer the remaining open points one at a time.
The user is also adding tags to the existing books (research), using the new **Tags tab on
rankings** (2026-10-28; DECISIONS.md) to see which tag-focused lists have enough books. If they bring
an "extra tags" sheet for existing books, merge tags by script; don't re-import the original CSV.

**2026-10-28: tool ↔ website plan (in progress).** The internal tool (`../Field Notes From Everywhere
Internal Tool`, its own repo and docs) becomes the one place for book research; a manual "Send to
website" will update Sanity rankings and books from it. Agreed tag model: primary tags belong to
rankings, never stored as book tags (each Sanity ranking linked to its tool primary tag, with the real
recommendation count; books get a separate "Recommended by readers in" list); book tags = reader +
the user's research tags, one set per book. Done 2026-10-28 in the tool: research tags separated from
reader evidence + the 2026-09-23 import repaired; research tags editable in the tool; 7 duplicate
books merged + stronger duplicate check; pre-change backups kept a year; the website's book fixes
copied into the tool (49 Thriller books now identical in both). **Book details and book tags are
edited only in the tool from now on** (user, 2026-10-28); the Studio's book fields should become
view-only when the send is built. **Send design agreed so far (2026-10-28, tool's DECISIONS.md
"Send to website: design agreed so far")**: sent from a ranking's tag page with ticked books, live
straight away after a preview; "Recommended by readers in" = website rankings only, shown as ordinary
tag pills beside the book's tags; unticked books come off the ranking on a resend; the ranking
carries every valid recommendation as its count. **Build steps**: (1) website side **done 2026-10-28**
(commit 57a5893; DECISIONS.md "Website side of Send to website"): ranking pills, read-only tool fields,
count in "Write draft sentence"; checked live: the three articles and a book page read the same as
before, except The Risk's pills now say "Thriller · Dark Romance" (was the reverse). (2) the tool's
Send button + preview (read-only) **done 2026-10-28**, checked on a database copy; (3) **done 2026-10-28**: the tool uses this repo's
Editor key "Claude Code local" (shared; deleting it stops both); (4) next: the send itself,
tested on a copy first; (5) Studio book fields view-only. Details: the send (preview first; books + rankings only, never
articles; removes the primary tag "Thriller" from the 49 books and "Dark Romance" from The Risk;
ask the user Global vs International Manhunt for I Am Pilgrim), then "Tick all shown" in "Choose
books from ranking". All tool details: the tool's DECISIONS.md, 2026-10-28 entries.

Trimmed 2026-10-06: the session-by-session history that used to sit here (much of it superseded)
is in git (`git log -p -- CURRENT_STATE.md`); every decision it described is in `DECISIONS.md`.
This file now holds only what's true today, what's open, and facts a new session needs.

**2026-10-26: Publication formats** (user; DECISIONS.md "Five article formats…"). Articles come in five
formats (top X; books like {book}; book club; tag/trope qualifier; seasonal), placed in the existing
three columns. The homepage and hub-page column descriptions are two deliberately different sets of the
user's copy (restored after I wrongly merged them); What to Read When got one user-approved addition in
each set (seasons, "books like"); the rest are unchanged. Tags stay as they are; every format except the Shortlist is hand-picked with the new Studio button
**"Choose books from ranking"** (tick boxes, tag filter, "Also in" notes; DECISIONS.md 2026-10-26).
Done 2026-10-26: a required **Format** field on What to Read When articles and a "Write draft
sentence" button for the methodology box (patterns approved by the user; publishing is blocked while
[bracketed] parts remain). Settled 2026-10-28: list length varies by format (~30 books is where the
emailed copy clips in Gmail); seasonal articles keep one evergreen address, refreshed yearly; **Publish
asks about the date** on articles dated before today (`PublishWithDateCheck.tsx`). Seen working in the
real Studio (2026-10-28): the Format field (live What to Read When article set to trope or feeling)
and the Publish date dialog. **Not yet used for real**: "Choose books from ranking" and "Write draft
sentence"; the user's next article is their check. Still open in the "Five article formats" entry,
none urgent: overlap between several lists from one ranking (search cannibalisation), and linking
"books like X" articles from the matching "Where to read" page.

**2026-10-23: The Reading Room is paused as a product** (user; DECISIONS.md). The business now
focuses on the Publication and the free weekly newsletter; The Reading Room may relaunch later. Every
spot that promoted it (homepage, article banner and floating card, About) now opens a free-newsletter
signup popup; the menu pill, footer link, book-list email P.S., llms.txt and sitemap entries are gone;
`/the-reading-room` shows a "taking a break" note (noindex) and `/subscribe` redirects there. All its
code is kept, switched off. Checked live 2026-10-23 (commit e7ef2eb): the redirect, the noindex, the
new promos on the homepage, About and an article, and no Reading Room in the sitemap or llms.txt. Not
tested: a real signup through the new popup (same `/api/subscribe` call as the footer form; skipped to
keep test contacts off the real list). Follow-ups from the pause:
1. ~~Cancel their own $7 subscription~~ The user **paused** it instead (by 2026-10-28; Paddle said the
   pause is scheduled, i.e. from the next billing date, ~2026-11-05). Still Kit-tagged on 2026-10-28, as
   expected. **After ~2026-11-05, check the Kit member tag is gone**: a real pause has never been seen by
   the webhook (`subscription.updated` → status `paused` → untag; `subscription.paused` isn't a
   subscribed event). If the tag is still there, check Paddle's notification log for what was sent.
2. ~~Legal pages~~ **Done 2026-10-28**: published by the user, checked live (new wording and date on
   all three; no drafts left). (User-approved minimal edits; RR sections kept, since the user's paused subscription and Paddle's
   review still need them, with a "taking a break, not open to new members" note). Disclosures:
   "Right now, FNFE doesn't earn any money." (was "Today, our income comes from The Reading Room").
   Privacy: short-version bullet no longer mentions subscribing. All three dated 2026-10-28.)

**Session 2026-10-09/10: book covers.** 15 book covers replaced in Sanity (user-approved; checked
live 2026-10-10): the 9 low-resolution ones (Dark Places, Kill for Me Kill for You, Nightwatching,
Orphan X, Shutter Island, The Fourth Monkey, The Girl with the Dragon Tattoo, The Likeness, What Lies
Between Us) and 6 that showed the wrong image (I Let You Go: back cover; The Plot: audiobook CD; Eye
of the Needle: Polish edition; Rebecca: 4-book omnibus; Gone Girl: library copy; And Then There Were
None: plain binding). Sources: Goodreads full-size images (its `/book/auto_complete?format=json`
feed works when book pages hit the bot check; strip `._SY75_` from `imageUrl`) or Open Library.
Old assets remain in Sanity's media library. Also made, outside the repo, a folder of all 49 covers
for Pinterest pins in the user's Downloads ("FNFE book covers", largest good version of each, many
1000-3700px tall; some differ in design from the site's, where the site's was smaller).
- The local `SANITY_API_TOKEN` returned "Session is expired" (401) on 2026-10-10; replaced
  2026-10-28 (see top). The user enters keys in `.env.local`, never in chat.

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
3. **If The Reading Room relaunches**: the first real member's checkout, Kit tag + first name and
   welcome email, and a recovered payment re-tagging a member, were never seen with real events.

The user's own subscription (lululope@yahoo.com, Kit subscriber 4306601425, first name "Dami") is
real; it's the only member-tagged subscriber in Kit (tagged 2026-10-05). To be cancelled (above).

## Open, raise one at a time (nothing blocking)

- Cancelling the old WordPress hosting, if the account still exists (provider unknown).
- Optional: accurate sitemap `lastmod`; JSON-LD beyond the book pages (offered, not chosen).
- Covers: The Family Upstairs is square (318 × 318, cropped); a full 1838 × 2775 cover is in the
  Pinterest folder (offered, not done). Still under 300px wide but the best front covers found:
  I Let You Go, Nightwatching, Rebecca (267/265/267px).
- Largest-contentful-paint 2.6-3.3s on mobile vs the 2.5s target (homepage hero image). Remaining
  levers, not done: ~300ms render-blocking CSS; the homepage preloads 7 font files.
- A check on the user's own phone and a tablet (the phone share-sheet button is already verified).
- Cosmetic leftovers, user's discretion: the unused Kit form and old Kit free-list tags; the
  `*.vercel.app` CORS entries in Sanity.
- Before joining an **ad network**: a Google-certified consent platform for EEA/UK/Swiss visitors,
  and a privacy-policy update naming it.

Settled, don't offer again: merging the homepage and hub-page column descriptions (deliberately
different, user 2026-10-26); merging near-duplicate book tags (declined 2026-09-29); blocking AI
training crawlers in robots.txt (declined twice).

## Paused: The Reading Room (whole product, 2026-10-23) and its free trial (2026-09-27)

The product pause is above and in DECISIONS.md. The older trial notes below apply only to a relaunch.
Trial paused 2026-09-27 (user). Every Reading Room CTA says "Join The Reading Room" and goes to
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
- The local `SANITY_API_TOKEN` is an Editor key ("Claude Code local", 2026-10-28). Writes to live content via scripts trigger Claude Code's auto-mode safety check; they go ahead only with the user's explicit approval in that session.
- Publishing an article whose date has passed: Publish asks whether to use today's date (2026-10-28).
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

**Pinterest**: domain-claim tag `p:domain_verify` in `app/layout.tsx` metadata (added and checked live
2026-10-19); domain claimed in Pinterest 2026-10-19 (user-confirmed). Keep the tag: Pinterest re-checks it.

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
