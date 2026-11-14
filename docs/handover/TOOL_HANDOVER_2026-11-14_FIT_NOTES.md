# Handover to the internal tool — 2026-11-14 ("might be for you" notes on books)

**For:** the next internal-tool session. **From:** a website session. Information and a request; nothing in the tool's
folder was changed.

## Why

Google AdSense turned the site down (2026-11-14). Google didn't name a reason, but its email points to "insufficient
content or content quality". About 97% of the words on the live lists are publisher blurbs that appear all over the web,
so the user is adding their planned fix: two short notes per book, written by FNFE. The website is built and live; the
tool needs to write the notes and send them. **The user will resubmit to AdSense once the notes are on the live lists.**

## What the website now accepts

On each `book` document (the book is view-only in the Studio, as before):

| Field | Type | Shown under the heading |
|---|---|---|
| `forYou` | string (plain text) | "This book might be for you" |
| `notForYou` | string (plain text) | "This book might not be for you" |

- **Sent with "Send books to Studio"**, like page count (user's choice: per book, not per post idea, so one send fills
  every live list, including the articles that weren't made from post ideas).
- Both optional. Empty or missing = that part doesn't show; neither = no box. Trimmed; no other processing.
- Shown in articles (all three columns) in a small box under the blurb, above "Where to read …". Not shown (yet) on
  "Where to read" pages or in the "send this list" email.

## How to write them (the user's rules, plus what the site needs)

- **Based strictly on the blurb, the book's tags and checkable facts** (page count, series status, year). No claims
  about what readers think unless the tool has that evidence, and no comparisons to other books on a list (a book
  appears on many lists).
- **Start with "If you…"**; one or two sentences each, about 20-45 words. Example (Sharp Objects):
  - forYou: "If you like dark, gothic small-town mysteries: a journalist goes home to cover a girl's murder and
    another's disappearance, and her family's secrets come up with them. At 272 pages, it's a quick read."
  - notForYou: "If child abuse, self-harm or graphic violence are hard reads for you. This one is very dark and
    disturbing."
- **Own words**: don't reuse sentences from the blurb or other sites; the point is original text.
- **No spoilers**: name that there's a twist, never what it is.
- **AdSense-safe wording**: content warnings are fine, but no graphic sexual description. The website hides the tags
  "Explicit Sex" and "Sexual Violence" from public pages; if they matter, say "sexual content" or "sexual violence"
  plainly, without detail.
- The user should be able to review and edit the notes in the tool before sending, as with other text.

## Please

1. Add the two fields to the tool's books, written/drafted per the rules above.
2. Include `forYou` / `notForYou` in "Send books to Studio".
3. Fill them for the Thriller ranking's books (53) and send, so all live lists get them. The Risk (Dark Romance) can
   follow with its ranking.

Full record: the website's `DECISIONS.md`, "2026-11-14 — 'This book might be for you' notes on books".
