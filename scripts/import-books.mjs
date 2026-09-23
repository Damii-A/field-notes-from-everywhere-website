#!/usr/bin/env node
/**
 * Bulk-imports Book documents (and any new Tags they reference) into Sanity
 * from a CSV file — see CURRENT_STATE.md / DECISIONS.md, 2026-09-23, "Bulk
 * book import script". Run with:
 *
 *   node --env-file=.env.local scripts/import-books.mjs path/to/books.csv
 *
 * CSV columns (first row = header, case-insensitive):
 *   title   (required)
 *   author  (required)
 *   blurb   (optional — becomes the book's canonicalBlurb)
 *   tags    (optional — semicolon-separated tag names, e.g. "dark fantasy; brutal")
 *   cover   (optional — EITHER a local image filename/path OR a direct image
 *            URL; either way it's uploaded to Sanity. A CSV can't hold an
 *            actual embedded image, so if your spreadsheet has images pasted
 *            directly into cells, export those as real image files into a
 *            folder instead and put each book's filename here — see
 *            DECISIONS.md, 2026-09-23. A local path is resolved relative to
 *            wherever the CSV file itself is, so keep the CSV and its cover
 *            images together in one folder and it'll just work regardless of
 *            where that folder lives.)
 *
 * Safe to re-run with an updated file for NEW books, or to update a book's
 * text fields/cover — but re-running fully replaces each matched book's
 * document from the CSV row, so any manual edits made in the Studio to a
 * book in the meantime (e.g. adding more tags by hand) will be overwritten
 * if that book's row is re-imported. Leaving the `cover` cell blank on a
 * later re-run does NOT clear an existing cover.
 *
 * Ranking (optional): add `--ranking "Thriller"` to also save the CSV's row
 * order as that theme's reader-recommendation ranking (row 1 = #1), stored as
 * a `ranking` document. Re-running with the same name replaces that ranking's
 * order with the file's — so reorder in the file, or in the Studio, not both.
 *
 * Books are matched by title+author (not row order). Tags are matched by
 * name (case-insensitive, published tags only — see the comment on
 * existingTags below) against what already exists in Sanity; anything new
 * is created automatically.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve, isAbsolute } from "node:path";
import { parse } from "csv-parse/sync";

const PROJECT_ID =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID || process.env.SANITY_API_PROJECT_ID;
const DATASET =
  process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_STUDIO_DATASET || process.env.SANITY_API_DATASET || "production";
const TOKEN = process.env.SANITY_API_TOKEN || process.env.SANITY_API_WRITE_TOKEN;
const API_VERSION = "2025-01-01";

if (!PROJECT_ID || !TOKEN) {
  console.error("Missing Sanity project id or API token. Run with: node --env-file=.env.local scripts/import-books.mjs <file.csv>");
  process.exit(1);
}

const args = process.argv.slice(2);
const rankingFlag = args.indexOf("--ranking");
const rankingName = rankingFlag >= 0 ? args[rankingFlag + 1]?.trim() : undefined;
if (rankingFlag >= 0 && !rankingName) {
  console.error('--ranking needs a name, e.g. --ranking "Thriller"');
  process.exit(1);
}
const csvPath = args.find((a, i) => !a.startsWith("--") && (rankingFlag < 0 || i !== rankingFlag + 1));
if (!csvPath) {
  console.error('Usage: node --env-file=.env.local scripts/import-books.mjs <path-to-books.csv> [--ranking "Theme name"]');
  process.exit(1);
}

function slugify(s) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function sanityQuery(query, params = {}) {
  const url = new URL(`https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}`);
  url.searchParams.set("query", query);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(`$${k}`, JSON.stringify(v));
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!res.ok) throw new Error(`Sanity query failed (${res.status}): ${await res.text()}`);
  return (await res.json()).result;
}

async function sanityMutate(mutations) {
  const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ mutations }),
  });
  if (!res.ok) throw new Error(`Sanity mutate failed (${res.status}): ${await res.text()}`);
  return await res.json();
}

function guessImageContentType(url) {
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase();
  return { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif" }[ext] || null;
}

/** Uploads raw image bytes to Sanity's asset store, returning the new asset's _id. */
async function uploadImageBytes(bytes, contentType) {
  const uploadUrl = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/assets/images/${DATASET}`;
  const uploadRes = await fetch(uploadUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": contentType },
    body: bytes,
  });
  if (!uploadRes.ok) throw new Error(`Sanity image upload failed (${uploadRes.status}): ${await uploadRes.text()}`);
  const { document } = await uploadRes.json();
  return document._id;
}

/**
 * Fetches with retry + backoff on 429/5xx. Open Library's cover server starts
 * refusing (502) after ~25 rapid downloads — found on the first real 49-book
 * import, where every cover after that point failed.
 */
async function fetchWithRetry(url, attempts = 5) {
  for (let i = 1; ; i++) {
    let res;
    try {
      res = await fetch(url);
    } catch (err) {
      if (i === attempts) throw err; // network-level failure (reset/timeout) — retried like a 5xx
    }
    if (res && (res.ok || i === attempts || !(res.status === 429 || res.status >= 500))) return res;
    await new Promise((r) => setTimeout(r, 2000 * 2 ** (i - 1)));
  }
}

/** Downloads an image from a URL, then uploads it. */
async function uploadImageFromUrl(url) {
  const imgRes = await fetchWithRetry(url);
  if (!imgRes.ok) throw new Error(`could not download image (${imgRes.status})`);
  const contentType = (imgRes.headers.get("content-type") || "").split(";")[0] || guessImageContentType(url);
  if (!contentType || !contentType.startsWith("image/")) throw new Error(`URL doesn't look like an image (content-type: ${contentType || "unknown"})`);
  return uploadImageBytes(Buffer.from(await imgRes.arrayBuffer()), contentType);
}

/** Reads a local image file, then uploads it. `path` is resolved relative to the CSV's own directory unless it's already absolute. */
async function uploadImageFromFile(path, csvDir) {
  const fullPath = isAbsolute(path) ? path : resolve(csvDir, path);
  const contentType = guessImageContentType(fullPath);
  if (!contentType) throw new Error(`unrecognized image file extension: ${fullPath}`);
  let bytes;
  try {
    bytes = readFileSync(fullPath);
  } catch {
    throw new Error(`file not found: ${fullPath}`);
  }
  return uploadImageBytes(bytes, contentType);
}

/** A `cover` cell is a URL if it starts with http(s):// — everything else is treated as a local file path. */
async function uploadCover(coverValue, csvDir) {
  return /^https?:\/\//i.test(coverValue) ? uploadImageFromUrl(coverValue) : uploadImageFromFile(coverValue, csvDir);
}

const csvDir = dirname(resolve(csvPath));
const raw = readFileSync(csvPath, "utf-8");
// The user's own book spreadsheets use "Cover URL" / "Primary tags" /
// "Secondary tags" headers, so those are accepted as aliases for `cover` and
// `tags` (primary + secondary merged) rather than requiring a rename first.
const rows = parse(raw, { columns: (header) => header.map((h) => h.trim().toLowerCase()), skip_empty_lines: true, trim: true }).map(
  (row) => ({
    ...row,
    cover: row.cover ?? row["cover url"],
    tags: row.tags ?? [row["primary tags"], row["secondary tags"]].filter(Boolean).join(";"),
  }),
);

const skipped = [];
const warnings = [];
const publishedDrafts = [];
const validRows = rows.filter((row, i) => {
  if (!row.title || !row.author) {
    skipped.push(`Row ${i + 2}: missing title or author — skipped`);
    return false;
  }
  return true;
});

console.log(`Read ${rows.length} row(s), ${validRows.length} valid, ${skipped.length} skipped.`);

// --- Resolve tags: reuse existing by name, stage-create anything new. ---
// Excludes drafts deliberately — a published book document shouldn't end up
// referencing a `drafts.*` tag id (found the hard way: this project's own
// Studio already had an unpublished "Dark Fantasy" draft tag when this
// script was first tested, and an earlier version of this query matched it).
const existingTags = await sanityQuery(`*[_type == "tag" && !(_id in path("drafts.**"))]{ _id, name }`);
const tagIdByName = new Map(existingTags.map((t) => [t.name.trim().toLowerCase(), t._id]));

// A tag that exists only as an unpublished Studio draft gets published (same
// document id, name + slug only) rather than duplicated by a fresh tag of the
// same name — the draft is the author's own tag, just never published.
const draftTags = await sanityQuery(`*[_type == "tag" && _id in path("drafts.**")]{ _id, name, slug }`);
const draftTagByName = new Map(draftTags.map((t) => [t.name.trim().toLowerCase(), t]));

const tagMutations = [];
function resolveTagId(name) {
  const key = name.trim().toLowerCase();
  if (tagIdByName.has(key)) return tagIdByName.get(key);
  const draft = draftTagByName.get(key);
  if (draft) {
    const id = draft._id.replace(/^drafts\./, "");
    tagIdByName.set(key, id);
    tagMutations.push(
      { createOrReplace: { _id: id, _type: "tag", name: draft.name.trim(), slug: draft.slug ?? { _type: "slug", current: slugify(draft.name) } } },
      { delete: { id: draft._id } },
    );
    publishedDrafts.push(draft.name.trim());
    return id;
  }
  const id = `tag-${slugify(name)}`;
  tagIdByName.set(key, id);
  tagMutations.push({
    createIfNotExists: { _id: id, _type: "tag", name: name.trim(), slug: { _type: "slug", current: slugify(name) } },
  });
  return id;
}

// --- Existing books' current cover, so a blank `cover` cell on a re-run doesn't clear it. ---
const existingBooks = await sanityQuery(`*[_type == "book" && !(_id in path("drafts.**"))]{ _id, coverImage }`);
const existingCoverById = new Map(existingBooks.filter((b) => b.coverImage).map((b) => [b._id, b.coverImage]));

const bookMutations = [];
for (const row of validRows) {
  const tagNames = (row.tags || "")
    .split(/[;,]/)
    .map((t) => t.trim())
    .filter(Boolean);
  // Deduped by resolved id — the same tag listed twice (e.g. in both primary
  // and secondary columns) would otherwise produce a duplicate array _key.
  const tagIds = [...new Set(tagNames.map(resolveTagId))];
  const tagRefs = tagIds.map((id) => ({ _type: "reference", _key: id.replace(/[^a-zA-Z0-9-]/g, "-"), _ref: id }));

  const id = `book-${slugify(row.title)}-${slugify(row.author)}`;

  let coverImage;
  if (row.cover && row.cover.trim()) {
    try {
      const assetId = await uploadCover(row.cover.trim(), csvDir);
      coverImage = { _type: "image", asset: { _type: "reference", _ref: assetId } };
      console.log(`  uploaded cover for "${row.title}"`);
    } catch (err) {
      warnings.push(`"${row.title}" by ${row.author}: cover image failed (${err.message}) — book imported without a cover.`);
    }
  } else if (existingCoverById.has(id)) {
    coverImage = existingCoverById.get(id); // preserve what's already there
  }

  bookMutations.push({
    createOrReplace: {
      _id: id,
      _type: "book",
      title: row.title.trim(),
      author: row.author.trim(),
      ...(row.blurb ? { canonicalBlurb: row.blurb.trim() } : {}),
      ...(tagRefs.length > 0 ? { tags: tagRefs } : {}),
      ...(coverImage ? { coverImage } : {}),
    },
  });
}

// Row order = rank. Duplicate rows for the same book keep their first (highest) position.
const rankingMutations = [];
if (rankingName) {
  const rankedIds = [...new Set(bookMutations.map((m) => m.createOrReplace._id))];
  rankingMutations.push({
    createOrReplace: {
      _id: `ranking-${slugify(rankingName)}`,
      _type: "ranking",
      name: rankingName,
      slug: { _type: "slug", current: slugify(rankingName) },
      books: rankedIds.map((id) => ({ _type: "reference", _key: id, _ref: id })),
    },
  });
}

if (tagMutations.length + bookMutations.length === 0) {
  console.log("Nothing to import.");
  process.exit(0);
}

await sanityMutate([...tagMutations, ...bookMutations, ...rankingMutations]);

console.log(`\nCreated ${tagMutations.length - publishedDrafts.length * 2} new tag(s).`);
if (publishedDrafts.length > 0) console.log(`Published ${publishedDrafts.length} existing draft tag(s): ${publishedDrafts.join(", ")}.`);
console.log(`Created/updated ${bookMutations.length} book(s).`);
if (rankingName) console.log(`Saved ranking "${rankingName}" (${rankingMutations[0].createOrReplace.books.length} books, in file order).`);
if (skipped.length > 0) {
  console.log("\nSkipped rows:");
  skipped.forEach((s) => console.log(`  - ${s}`));
}
if (warnings.length > 0) {
  console.log("\nWarnings:");
  warnings.forEach((w) => console.log(`  - ${w}`));
}
