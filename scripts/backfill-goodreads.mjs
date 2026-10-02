/**
 * Fills in `goodreadsUrl` for every published book that doesn't have one yet,
 * using the same author-matched lookup as the importer (scripts/lib/goodreads.mjs).
 * Run: npm run goodreads-links. Safe to re-run: books that already have a link
 * (including ones corrected by hand in the Studio) are left alone.
 */
import { GoodreadsBlockedError, findGoodreadsUrl } from "./lib/goodreads.mjs";

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const TOKEN = process.env.SANITY_API_TOKEN;
if (!PROJECT_ID || !TOKEN) throw new Error("Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_TOKEN (.env.local).");
const API = `https://${PROJECT_ID}.api.sanity.io/v2025-02-19/data`;
const headers = { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" };

const query = new URL(`${API}/query/${DATASET}`);
query.searchParams.set("query", `*[_type == "book" && !(_id in path("drafts.**")) && !defined(goodreadsUrl)]{ _id, title, author }`);
const books = (await (await fetch(query, { headers })).json()).result;
console.log(`${books.length} book(s) without a Goodreads link.`);

const notFound = [];
for (const b of books) {
  let url = null;
  try {
    url = await findGoodreadsUrl(b.title, b.author);
  } catch (err) {
    if (err instanceof GoodreadsBlockedError) {
      console.error(`Stopped: ${err.message} The rest are untouched; re-run later.`);
      process.exit(1);
    }
    console.warn(`  ${b.title}: lookup failed (${err.message})`);
  }
  if (url) {
    const res = await fetch(`${API}/mutate/${DATASET}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ mutations: [{ patch: { id: b._id, set: { goodreadsUrl: url } } }] }),
    });
    if (!res.ok) throw new Error(`Sanity patch ${res.status}: ${await res.text()}`);
    console.log(`  ${b.title} -> ${url}`);
  } else {
    notFound.push(`${b.title} by ${b.author}`);
  }
  await new Promise((r) => setTimeout(r, 3000)); // be gentle: rapid lookups trip Goodreads' bot check
}
if (notFound.length) console.log(`No author match (left empty; the button searches by title):\n  ${notFound.join("\n  ")}`);
