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
 *
 * Safe to re-run with an updated file: books are matched by title+author
 * (not row order), so editing a blurb and re-running updates the existing
 * book instead of creating a duplicate. Tags are matched by name
 * (case-insensitive) against what already exists in Sanity; anything new is
 * created automatically. Cover images are NOT handled by this script —
 * add those individually in the Studio afterward.
 */
import { readFileSync } from "node:fs";
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

const csvPath = process.argv[2];
if (!csvPath) {
  console.error("Usage: node --env-file=.env.local scripts/import-books.mjs <path-to-books.csv>");
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

const raw = readFileSync(csvPath, "utf-8");
const rows = parse(raw, { columns: (header) => header.map((h) => h.trim().toLowerCase()), skip_empty_lines: true, trim: true });

const skipped = [];
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

const tagMutations = [];
function resolveTagId(name) {
  const key = name.trim().toLowerCase();
  if (tagIdByName.has(key)) return tagIdByName.get(key);
  const id = `tag-${slugify(name)}`;
  tagIdByName.set(key, id);
  tagMutations.push({
    createIfNotExists: { _id: id, _type: "tag", name: name.trim(), slug: { _type: "slug", current: slugify(name) } },
  });
  return id;
}

const bookMutations = validRows.map((row) => {
  const tagNames = (row.tags || "")
    .split(";")
    .map((t) => t.trim())
    .filter(Boolean);
  const tagRefs = tagNames.map((name) => ({ _type: "reference", _key: slugify(name), _ref: resolveTagId(name) }));

  const id = `book-${slugify(row.title)}-${slugify(row.author)}`;
  return {
    createOrReplace: {
      _id: id,
      _type: "book",
      title: row.title.trim(),
      author: row.author.trim(),
      ...(row.blurb ? { canonicalBlurb: row.blurb.trim() } : {}),
      ...(tagRefs.length > 0 ? { tags: tagRefs } : {}),
    },
  };
});

if (tagMutations.length + bookMutations.length === 0) {
  console.log("Nothing to import.");
  process.exit(0);
}

await sanityMutate([...tagMutations, ...bookMutations]);

console.log(`Created ${tagMutations.length} new tag(s).`);
console.log(`Created/updated ${bookMutations.length} book(s).`);
if (skipped.length > 0) {
  console.log("\nSkipped rows:");
  skipped.forEach((s) => console.log(`  - ${s}`));
}
