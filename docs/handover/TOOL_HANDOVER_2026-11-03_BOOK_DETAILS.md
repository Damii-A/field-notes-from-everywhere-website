# Handover to the internal tool — 2026-11-03 (year, series, tag categories)

**For:** the next internal-tool session. **From:** a website session (the tool's `docs/TOPIC_SUGGESTER_DESIGN.md` §10 gaps
1-2). Information only; the tool's own docs stay its authority. Nothing in the tool's folder was changed.

## New website fields the tool can now send with "Send books to Studio"

On each **book** document (all view-only in the Studio; the user edits books only in the tool):

| Field | Type | From the tool |
|---|---|---|
| `publishedYear` | number | `books.published_year` |
| `series` | object `{ status, name, number, total }` | `series_status` ("standalone" / "finished" / "ongoing"), `series_name`, `series_number` (may be fractional), `series_total` |

Send `series` **only when confirmed** (`series_confirmed_at` set); leave it out otherwise. For a standalone, `{ status:
"standalone" }` alone is fine. Same rule as other book facts: only fields the tool has a value for; a resend replaces them.

On each **tag** document:

| Field | Type | From the tool |
|---|---|---|
| `category` | string, exactly one of: `Genre`, `Character`, `Relationship`, `Trope`, `Mood`, `Theme`, `Setting`, `Experience`, `Story Elements`, `Intensity` | `tags.category` (not `suggested_category`) |

Tag documents are `tag-<name>` as now; set `category` when the tag has one.

## Not shown on the website yet

The user chose "store only" (2026-11-03): none of these appear on any page. How they're shown is a later decision with real
data in. Please include the new fields in the send's preview so the user can see what changes.

Full record: the website's `DECISIONS.md`, "2026-11-03 — Publication year, series and tag categories".

## Also: two idea pairs with high book overlap (for the user to review in the tool)

Checked from the website side (share of the smaller list): "14 Thriller Books for Long Winter Nights" and "Get Ready for
Spooky Season With These 17 Thrillers" share 9 books (64%); "Just Finished Gone Girl? These 12 Twisty Thrillers Are Up
Next" and "From Agatha Christie to Gillian Flynn: 14 Mystery Thrillers for 2027" share 7 (58%). Their search targets
differ, so this is about readers seeing the same books, not search. Nothing changes on the website.

