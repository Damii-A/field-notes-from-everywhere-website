# Current state — Field Notes From Everywhere

Last updated: 2026-11-04. Full reasoning is in `DECISIONS.md`; this is the short version.

**2026-10-28: access check.** Working: GitHub push, live site, Resend, Kit, Sanity read **and write**
(new local Editor key "Claude Code local", made by the user; the old one returned "Session not found",
i.e. deleted), and the Claude Design project via `DesignSync` (user ran `/design-login`). **Standalone
Claude Design closes by 2026-12-14** (it moves into Claude): before then, decide how to keep a reference
copy of the "Full FNFE Website" project (optional since 2026-11-03: it's history now, no longer the authority). Not working, left on purpose
(user agreed): the Sanity MCP connector (Claude Code's OAuth builds a broken
`mcp.sanity.io.well-known` URL; the server itself answers fine; the API key covers everything); the
sandbox `PADDLE_API_KEY` (403 on every endpoint; only matters for a Reading Room relaunch); no Vercel
or GitHub CLIs installed (not needed). Old Sanity keys ("Claude Write token (Robot)", "Claude's Field
Notes Sanity API") are left in place: which key Vercel's `SANITY_API_TOKEN` is can't be told from
Sanity's list, and deleting it would break the site's content fetches.

**2026-10-30: book-tag limit reviewed and pushed.** Commit 7cc409f (made from an internal-tool session):
book tags show the first 4 under a book in articles and the Reading Room issue email, then "+N more"
(DECISIONS.md, 2026-10-30). Reviewed here: code sound, type check + production build clean; pushed. No
visible change yet: the 4 books with 5 tags all carry "Thriller", which merges into the ranking pill.
**Not checked against the Claude Design project** (DesignSync needs `/design-login`, unavailable in that
session; the design shows no tag limit anyway, and this is the user's direction). **Gap found and fixed the
same day (user's choice)**: the "send this list to me" email listed every tag; it now shows the same first
4 + "+N more" as the article (checked by test render; not yet seen in a real email). The tool's handover
note is its `docs/handover/WEBSITE_HANDOVER_2026-10-30.md`; its Sanity gap list for the coming topic
suggester is now in ARCHITECTURE.md §15 (future work, not to build yet). Next (agreed order): the user's
first "Send books to Studio" of Thriller from the tool's Pool prep page (53-book pool), then reload the
Studio and check the Studio, one article and one "Where to read" page together; then step 5, Studio book
fields view-only.

**2026-11-03: post ideas (website side) built and live** (commits 028dce3, b5bd246, 6fe3c10; DECISIONS.md
"2026-11-03 — Post ideas in the Studio", which holds the data contract). Planned with the user from the tool's
`docs/handover/WEBSITE_HANDOVER_2026-11-03.md`. "Post ideas" in the Studio (view-only `postIdea`, sent by the
tool), "Start article" on each (draft article: title, books + "Tags shown here", evidence line, format, seasonal
date; a second press opens the same article), `article.postIdea` for the tool's "Published" read-back; the
ranking pill now stays first before an entry's own tag choice. **Seen working by the user in the real Studio**
with a sample idea (sample and its draft deleted after: 0 post ideas, the 3 real articles untouched). Note back
to the tool: `docs/handover/TOOL_HANDOVER_2026-11-03.md` (this repo). **User preference (2026-11-03): keep the
current article/hub look and reader experience; tool-driven work is backend only**, so any visible layout change
needs their OK with a preview first. The first real "Send books to Studio" of Thriller has happened (Sanity:
ranking 53 books, 2,181 recommendations, 54 books, 415 tags, checked 2026-11-03); whether the joint
Studio/article/"Where to read" check after it was done isn't recorded here, so ask the user.

**Google showing `vercel.app` results (user, 2026-11-03)**: Google lists the homepage and About under the old
`field-notes-from-everywhere-website.vercel.app` address (indexed before the 2026-09-27 cutover). Checked: that
address 308-redirects every path to the real domain, and per-deployment `*.vercel.app` URLs send
`X-Robots-Tag: noindex` with a canonical to the real domain, so Google should replace them as it recrawls.
Suggested to the user (optional): Search Console → URL inspection → "Request indexing" for `/` and `/about`.
Worth a look in a few weeks. **2026-11-03**: the user sees the real domain first with a vercel.app result under it;
explained (leftover entry, clears on recrawl; can't be removed without owning the address). **Around 2026-12-03**: if
`site:field-notes-from-everywhere-website.vercel.app` still lists pages, look again.

**2026-11-03 (later): page count + reading time, "Where to read" panels and tag limit, live** (DECISIONS.md, same
date). `book.pageCount` / `book.readingHours` (read-only, from the tool) show as two pills under the author in
articles, the "send this list" email and the "Where to read" About section; **showing since the tool's resend**
(53 of 54 books; seen in a local build of the live content 2026-11-03). The user **hasn't looked at the email preview** yet (their choice, "another
time"). "Where to read": lists and related books in panels a shade darker than the page; About shows first tags +
"+N more". Note back to the tool: `docs/handover/TOOL_HANDOVER_2026-11-03_BOOK_FACTS.md`.

**2026-11-03 (later): article text on post ideas** (DECISIONS.md, same date). Post ideas carry `introText`,
`metaDescription`, `slug`, `focusKeyword` (view-only, from the tool); "Start article" prefills the draft with them
(focus keyword on Shortlist only), so the user adds only the hero image + alt text. **Next check**: reload the Studio,
the tool re-sends an idea with its text, then "Start article" on it. The Twists article (started before) gets its text by
hand; the 19 Thriller ideas sent earlier need re-sending to carry it. Note back to the tool:
`docs/handover/TOOL_HANDOVER_2026-11-03_ARTICLE_TEXT.md`.

**2026-11-03 (later still): Pinterest pin field, popup tidy, bigger intro, "About" panel** (DECISIONS.md, same
date). Articles have "Pinterest pin" + "Pin description" in the Studio; the Pinterest share button uses them (hero image
+ title when empty). **Not yet tried with a real pin**: the user uploads one, publishes, then presses the Pinterest
button on the live article. Also: Publish stays greyed out until "Published at" is set ("Start article" leaves it empty
on purpose, except Seasonal ideas).

**Checked in Sanity 2026-11-03 (end of day)**: all 19 Thriller post ideas are in the Studio, all carrying the
article text; the first tool-driven article, "11 Thrillers You Can Read in a Day" (from `postIdea-16`; intro, meta
description and slug prefilled), is **published** (dated 2026-11-03); the Twists draft (`postIdea-8`, started before
the text existed) is still a draft with no intro, meta description or slug. 53 of 54 books have page count + reading
time; the one without is **The Risk** (Dark Romance, not in the Thriller ranking; it fills when that ranking is sent).
No article has a Pinterest pin yet. The user confirmed the popup changes live.

**2026-11-04: no hero image on article pages** (DECISIONS.md, same date; user's idea, approved from a preview). The first book is now on the opening screen on phones and laptops. The image is still added to each article: hubs, homepage, "What to read next", emails and link previews use it.

**2026-11-04: Post ideas by theme, with Deferred** (DECISIONS.md, same date; replaces the three flat lists below). Post ideas → Thriller → Not started / In progress / Deferred / Published. "Defer" is in an idea's actions menu and survives tool re-sends.

**2026-11-04: Post ideas split by status** (DECISIONS.md, same date; user's pick of three lists). "Post ideas" in the Studio
opens onto Not started / In progress / Published, with counts, worked out live from the articles. **Seen working by the
user** in the real Studio (2026-11-04).

**2026-11-04: "Where to read" SEO checked against outside feedback (no change needed).** Live Gone Girl page: own address,
title, description and canonical; content in the server's HTML before JavaScript; 42 book pages in the sitemap; the Shortlist
article links its 15 books. **User's Search Console, 2026-11-04: 47 pages indexed, book pages among them** (10 rows seen; sitemap has 63 URLs, 47 of them
book pages), so they are being indexed; the user is satisfied and doesn't need ranking numbers now. If many later show
"Crawled, currently not indexed", add original content per page.

**Tool notes: none waiting (checked 2026-11-04).** All six notes in `docs/handover/` have been acted on by the tool
(its commits `e9c55fc`, `29934d3`, `1da72d8`, `02af582`; checked read-only in the Studio): ideas send `column: "up-next"`
(idea 53 re-sent with it and its 12 groups; no idea carries the old code); 53 of 54 books have year and series, and 411
of 415 tags have a category; nothing uses `bookamonth`. Left with the user, not the tool: the two high-overlap idea pairs
in `…_BOOK_DETAILS.md` (a review in the tool; not recorded as done). At session start, mention any new note added here.

**Start the next session here (end of 2026-11-03; nothing unpushed).** Every non-dated open item was worked through
today (see the numbered list and "Open" below). **Waiting on the user, small checks**: (a) the Twists draft was deleted
(checked: no article for `postIdea-8`; the idea carries its text), so "Start article" on it should now come prefilled;
(b) "Start article" on idea 53 (month sections); (c) a Pinterest pin on one article + the Pinterest button; (d) the
first published "books like" article, then link it from that book's "Where to read" page. **Dated**: Tue 2026-11-10,
the first weekly newsletter with a new article (Studio link + "Create Resend draft"); ~2026-12-03, the vercel.app search
result. **After the tool switches to `up-next`**: remove the old column code's acceptance (`articleFromPostIdea.ts`, `postIdea.ts`
`columnName`) once idea 53 is re-sent. The post-idea send and "Start article" work for real (above). The rest of the tool's website list, **one at a time, asking the
user before each** (order not chosen yet):
1. ~~Article formats per formula in all three columns~~ **Done 2026-11-03** (DECISIONS.md, same date; the 5 existing
   articles updated, backup in `backups/2026-11-03-article-formats-before.json`); Book a month removed (merged into Challenge in the tool).
   **Seen working by the user** in the real Studio.
2. ~~Layouts beyond one flat list~~ **Done 2026-11-03** (DECISIONS.md, same date): book entries take an optional Section
   (headings like "January" shown only where set; "Start article" fills them from an idea's groups); Comparison articles
   store their anchor book (not shown). **Not yet seen**: a real sectioned article (start one from idea 53) and its
   "send this list" email. Not built: checklists (nothing sends one), showing the anchor book.
3. ~~Rename the third column "Up Next"~~ **Done 2026-11-03** (DECISIONS.md, same date): live at `/up-next`, old addresses
   308-redirect, the one article's `category` changed (backup `backups/2026-11-03-up-next-before.json`), IndexNow pinged.
4. ~~The Shortlist's description~~ **Done 2026-11-03** ("ranked" dropped from the hub and homepage descriptions; user's pick;
   DECISIONS.md, same date).
5. ~~The live Shortlist title~~ **Done 2026-11-03** (user's pick): "15 Thriller Book Recommendations (From
   2,181 Reader Picks)" (was "…Real Readers"; 2,181 is recommendations from over 1,100 readers). Changed in
   Sanity by API, checked live on the article, the Shortlist page and the homepage; slug unchanged.
6. Tag categories and book facts on the website, so the tool's send can carry them. **Page count + reading time
   done 2026-11-03**; **year, series and tag categories: website fields added 2026-11-03** (stored only, not shown;
   user's choice); **filled by the tool's send 2026-11-04** (53 of 54 books, all but The Risk; 411 of 415 tags).
7. ~~Studio book fields view-only~~ **Done 2026-11-03**: the whole book is view-only in the Studio (DECISIONS.md, same
   date). **Seen working by the user** in the real Studio (2026-11-03).
8. Move the Claude Design project out of standalone Claude Design before 2026-12-14. **Checked 2026-11-03**: no full
   copy exists anywhere (only the text specs + build notes in `docs/design-specs/`, by design, 2026-09-21; the
   `FNFE Website Structure.pdf` in Downloads predates the design). `DesignSync` is for the user-started /design-sync
   component-library flow, not archiving, so it wasn't used. Its notice says Claude Design is moving into Claude.
   **Now optional** (user, 2026-11-03): the live site + DECISIONS.md are the authority (CLAUDE.md updated); a copy of
   the design project is history only. If the user opens it and finds a move/export option, an export can be committed.
9. ~~Sanity plan usage~~ **Checked 2026-11-03** (user's screenshot, free plan): documents 502 / 10k (5%, the one to
   watch as rankings grow), API requests 2.7k / 250k a month, bandwidth 49.9 MB / 100 GB, assets 7.8 MB / 100 GB,
   datasets 1 / 2, webhooks 1 / 2, seats 1 / 20. Nothing near a limit.
Dated: (a) after ~2026-11-05, check the user's Kit member tag is gone (paused subscription, below);
(b) before 2026-12-14, optionally keep a reference copy of the Claude Design project (above); the tag limit was
never compared against it (DesignSync needs `/design-login` in an interactive session). Offer the
remaining open points one at a time. Tool notes in this file are short pointers; the tool's own docs hold
its changes. If the user brings an "extra tags" sheet for existing books, the tool is where book tags are
edited (not a website re-import).

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
Editor key "Claude Code local" (shared; deleting it stops both); (4) the send **built 2026-10-28** (backup first,
undo script, checked with Sanity's dry run against live content; **never sent for real**: the user's first
Thriller send is the check, then look at the Studio, an article and a book page); (5) Studio book fields view-only, **done 2026-11-03**. Details: the send (preview first; books + rankings only, never
articles; removes the primary tag "Thriller" from the 49 books and "Dark Romance" from The Risk;
I Am Pilgrim settled as "International Manhunt"), then "Tick all shown" in "Choose
books from ranking" (planned, not built). All tool details: the tool's DECISIONS.md, 2026-10-28 entries.

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
sentence"; the user's next article is their check. Overlap between lists from one ranking: **checked 2026-11-03, no website change** (live articles share 2-5 books
per pair; search targets differ; the tool already limits overlap; two high-overlap idea pairs passed to the tool).
Still open: linking "books like X" articles from the matching "Where to read" page, **once the first one is published**.

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
   expected. **Checked early, 2026-11-03: the Kit member tag is already gone** (Kit API: subscriber 4306601425 active, no tags;
   `reading-room-member` has 0 subscribers), so the pause reached Kit; not re-checked in Paddle. (Was: after ~2026-11-05, check the Kit member tag is gone): a real pause has never been seen by
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

## To do: the user's list (added 2026-11-04; not started, user said don't work on these yet)

1. ~~Park post ideas, group by theme~~ **Built 2026-11-04** (DECISIONS.md, same date). **Seen working by the user** (2026-11-04).
2. ~~Automate the "What to read next" picks~~ **Built 2026-11-04** (DECISIONS.md, same date).
3. **Prepare the site for ad networks** (started 2026-11-04; audited, nothing built). **User's plan: AdSense first (the
   site is new, nearly zero traffic), then Journey by Mediavine at 1,000 Tier 1 sessions in 30 days.** Don't install a
   consent platform in advance (corrects an older note): AdSense's Privacy & messaging has a Google-certified one, and
   Journey brings its own. AdSense lists no traffic minimum; it reviews the whole site for original, high-quality content.
   - **Main risk, found by audit**: of about 18,150 words across the 10 published lists, 507 are ours (intros); 17,652 are
     shared book blurbs (at least some publisher text; 0 of 128 entries have their own). The fix considered: each
     entry's existing `blurb` field would replace the book's, **which the user declined: the blurbs stay on the lists.** Offered: a short "why it's here" line above
     each blurb (needs a field + preview). **User's call 2026-11-04: apply as is first**; revisit if Google rejects the site.
     **User's idea if it's flagged (replaces the "why it's here" line):** two fields per book, "This book might be for you" and
     "This book might not be for you", based strictly on the blurb, tags and verifiable information.
   - **Signed up**: publisher ID `pub-5271200373971782` (public); site connected by `public/ads.txt`. **Privacy and Disclosures
     updated 2026-11-04** (approved text; DECISIONS.md, same date). **Submitted for review by the user 2026-11-04** (a few days, up
     to 2-4 weeks). **Don't let ads run before the consent pop-up and US link are in.** The ad code and consent pop-up aren't on the site yet. **One line about the policy change goes in the
     2026-11-10 newsletter.**
   - **Second risk**: 47 templated "Where to read" pages, about three quarters of the sitemap, mostly the same answer,
     store links and blurb. Keep ads off them (and off the Reading Room page).
   - **Tags**: "Explicit Sex" and "Sexual Violence" hidden from public pages (done; DECISIONS.md, same date).
   - Fine already: About, Contact, Privacy, Terms, Disclosures; no dead ends.
   - **Once the user signs up** (the publisher ID isn't secret): AdSense code loading with consent, `ads.txt` (404 today),
     Google's EU/UK/Swiss message and US states message, one banner rather than two (GA4 follows the choice), Privacy
     (Google's required wording: vendor cookies, Ads Settings opt-out) and Disclosures ("we don't show ads" goes). Legal
     text is live Sanity data: the user approves it first. Seller information stays Confidential (keeps the owner's name
     out of sellers.json). Never click own ads or ask readers to.

## Open, raise one at a time (nothing blocking)

- ~~Cancelling the old WordPress hosting~~ **Settled 2026-11-03**: it's a Namecheap Stellar shared plan the user keeps
  for Livo, so it stays. DNS checked: nothing on fieldnotesfromeverywhere.com uses it (site on Vercel, mail on Zoho MX,
  registration at Namecheap, separate). Suggested, optional: remove the old FNFE WordPress install from that cPanel (an
  unmaintained WordPress on the same account is a risk to Livo); user's call.
- ~~Accurate sitemap `lastmod`~~ **done 2026-11-03**. ~~JSON-LD beyond the book pages~~ **articles done 2026-11-03** (user chose it; DECISIONS.md, same date).
- ~~The Family Upstairs cover~~ **Done**: the Studio has had the full 1838 × 2775 cover since the tool's send of
  2026-10-31 (checked 2026-11-04). Covers still under 300px wide but the best front covers found:
  I Let You Go, Nightwatching, Rebecca (267/265/267px).
- ~~Largest-contentful-paint on mobile~~ **Done 2026-11-03** (DECISIONS.md, same date): hero images fetched first, 4 of 7
  font preloads dropped. User's pagespeed.web.dev (mobile): homepage 99 / LCP 2.1s; article 96 / LCP 0.9-2.6s. Left: ~300ms
  render-blocking CSS (diminishing returns).
- ~~A check on the user's own phone~~ **Done 2026-11-03**: "everything is good on mobile" (menu, Up Next, article, Where to
  read, send-list popup, Pinterest share). Tablet not checked (optional).
- ~~Kit leftovers~~ **Done 2026-11-03**: the unused "Imported September 22nd…" tag deleted by the user; form "Newsletter
  site" (7664818, 0 subscribers) left in place (Kit offered no delete; harmless, settled). Keep tag `reading-room-member`
  (23811808, used by the code). (~~`*.vercel.app` CORS entries
  in Sanity~~ removed by the user 2026-11-03; checked: the real domain still allowed, vercel.app no longer.)

Settled, don't offer again: the "12-thrillers-books…" typo in the Up Next article's address (kept, user
2026-11-03); centring the newsletter popup's "Once a week…" line (kept left-aligned, user 2026-11-03); merging the homepage and hub-page column descriptions (deliberately
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
- 49 books (all with Goodreads links and slugs), 93 tags, the "Thriller" ranking (49 books) (counted 2026-10-30).
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
