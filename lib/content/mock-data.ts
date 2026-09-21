/**
 * Placeholder content, standing in for Sanity until a project is connected
 * (see CURRENT_STATE.md). Transcribed from the actual example content in the
 * built Claude Design pages, not lorem ipsum — book titles/authors/blurbs
 * here are the real placeholder copy the design shipped with.
 *
 * Only the three "lead" articles below (one per category) have a full,
 * hand-authored book list, matching the fact that the design itself only
 * fully built out one example article per category. Every other title in
 * each category's POOL is real placeholder hub-card copy (title/tag/meta)
 * but has no article of its own yet — see `getArticleBySlug` in `index.ts`
 * for how that's handled without producing broken links.
 */
import type { Article, ArticleSummary, BookEntry, CategorySlug } from "./types";
import { slugify } from "./slug";

const SPINES = ["var(--slate-600)", "var(--clay-600)", "var(--sky-600)", "var(--sage-600)", "var(--slate-700)"];

function withSpines(books: Omit<BookEntry, "spine">[]): BookEntry[] {
  return books.map((b, i) => ({ ...b, spine: SPINES[i % SPINES.length] }));
}

// ---------------------------------------------------------------------------
// The Shortlist — lead article
// ---------------------------------------------------------------------------

export const SHORTLIST_LEAD: Article = {
  slug: "the-dark-fantasy-books-readers-recommend-again-and-again",
  category: "the-shortlist",
  title: "The dark fantasy books readers recommend again and again",
  meta: "18 books · September 4, 2026",
  author: "The FNFE Team",
  publishedAt: "2026-09-04",
  methodologySentence:
    "We reviewed 1,240 individual reader recommendations across four independent dark fantasy discussions, then ranked the titles that were recommended most often.",
  introParagraphs: [
    "There is dark fantasy, and then there is the kind of dark fantasy readers warn each other about before recommending it anyway.",
    "Every few weeks someone asks for a fantasy that stops flinching: no clean victories, no comfortable magic, no promise that the good people will still be standing at the end. The replies are always immediate and always specific, and the same handful of titles keep arriving before anyone has finished typing the question.",
    "These are the books that came up most often. A few will be familiar. A couple are recommended so insistently that readers seem to take it personally when someone hasn't read them yet.",
  ],
  books: withSpines([
    {
      rank: 1,
      title: "The Blade Itself",
      author: "Joe Abercrombie",
      blurb:
        "A torturer, a vain duellist and a barbarian, written with enough wit that the cruelty lands harder.",
      tags: [{ label: "Grimdark", slug: "grimdark" }, { label: "Morally Grey", slug: "morally-grey" }],
    },
    {
      rank: 2,
      title: "The Poppy War",
      author: "R. F. Kuang",
      blurb: "Opens as a military school story and turns into something far heavier by its final third.",
      tags: [{ label: "Military Fantasy", slug: "military-fantasy" }, { label: "Emotionally Devastating", slug: "emotionally-devastating" }],
    },
    {
      rank: 3,
      title: "Gideon the Ninth",
      author: "Tamsyn Muir",
      blurb: "Necromancers in a haunted palace, held together by one of the most cited narrative voices in our research.",
      tags: [{ label: "Gothic", slug: "gothic" }, { label: "Found Family", slug: "found-family" }],
    },
    {
      rank: 4,
      title: "The Fifth Season",
      author: "N. K. Jemisin",
      blurb: "A world that breaks on schedule, and the people it has decided are tools rather than citizens.",
      tags: [{ label: "Apocalyptic", slug: "apocalyptic" }, { label: "Slow Reveal", slug: "slow-reveal" }],
    },
    {
      rank: 5,
      title: "Jade City",
      author: "Fonda Lee",
      blurb: "A family, a city and a magic that behaves like inherited money. Readers recommend it for the family, not the fights.",
      tags: [{ label: "Family Saga", slug: "family-saga" }, { label: "Urban Fantasy", slug: "urban-fantasy" }],
    },
    {
      rank: 6,
      title: "Between Two Fires",
      author: "Christopher Buehlman",
      blurb: "Plague-era France with the divine order in open collapse. The most recommended title for readers who want dread rather than action.",
      tags: [{ label: "Horror", slug: "horror" }, { label: "Historical", slug: "historical" }],
    },
    {
      rank: 7,
      title: "The Rage of Dragons",
      author: "Evan Winter",
      blurb: "Recommended almost entirely for its momentum, usually by someone who finished it in two days.",
      tags: [{ label: "Revenge", slug: "revenge" }, { label: "Unputdownable", slug: "unputdownable" }],
    },
    {
      rank: 8,
      title: "She Who Became the Sun",
      author: "Shelley Parker-Chan",
      blurb: "Ambition as a survival instinct, and a protagonist readers argue about at length.",
      tags: [{ label: "Morally Grey", slug: "morally-grey" }, { label: "Historical", slug: "historical" }],
    },
  ]),
  whatToReadNext: [],
};

// ---------------------------------------------------------------------------
// What to Read When — lead article
// ---------------------------------------------------------------------------

export const WHEN_LEAD: Article = {
  slug: "what-to-read-when-you-want-to-be-emotionally-destroyed",
  category: "what-to-read-when",
  title: "What to read when you want to be emotionally destroyed",
  meta: "17 books · September 5, 2026",
  author: "The FNFE Team",
  publishedAt: "2026-09-05",
  methodologySentence:
    "We gathered 1,480 reader recommendations across five independent discussions about books that leave readers wrecked, and kept the titles readers put forward most often.",
  introParagraphs: [
    "Some evenings you do not want to be comforted. You want a book to take the whole thing out of you and leave you sitting quietly at the end of it.",
    "It is a very specific request, and readers make it constantly: something devastating, please, and no half measures. The replies arrive with warnings attached. People name the chapter that did it. Somebody always mentions reading the last forty pages in one go, because stopping felt worse than continuing.",
    "These are the books readers keep offering when that is the mood. They are not ranked, because there is no winning this. Read them on an evening you do not mind losing.",
  ],
  books: withSpines([
    {
      title: "A Little Life",
      author: "Hanya Yanagihara",
      blurb: "The title readers name first, always with a warning about the middle third.",
      tags: [{ label: "Emotionally Devastating", slug: "emotionally-devastating" }, { label: "Friendship", slug: "friendship" }],
    },
    {
      title: "We Need to Talk About Kevin",
      author: "Lionel Shriver",
      blurb: "A mother writing letters about her son. Recommended for the discomfort, not the plot.",
      tags: [{ label: "Unreliable Narrator", slug: "unreliable-narrator" }],
    },
    {
      title: "Never Let Me Go",
      author: "Kazuo Ishiguro",
      blurb: "Quiet, unhurried, and cited constantly by readers who describe crying without noticing they had started.",
      tags: [{ label: "Slow Reveal", slug: "slow-reveal" }, { label: "Melancholy Sci-Fi", slug: "melancholy-sci-fi" }],
    },
    {
      title: "The Kite Runner",
      author: "Khaled Hosseini",
      blurb: "Guilt carried across decades. Readers recommend it for the last fifty pages.",
      tags: [{ label: "Historical", slug: "historical" }, { label: "Redemption", slug: "redemption" }],
    },
    {
      title: "Beloved",
      author: "Toni Morrison",
      blurb: "The most-cited literary title in our research on grief and haunting.",
      tags: [{ label: "Literary Fiction", slug: "literary-fiction" }, { label: "Haunting", slug: "haunting" }],
    },
    {
      title: "On Earth We're Briefly Gorgeous",
      author: "Ocean Vuong",
      blurb: "A letter to a mother who cannot read it. Recommended for the sentences as much as the story.",
      tags: [{ label: "Adult Coming of Age", slug: "adult-coming-of-age" }],
    },
    {
      title: "Tender Is the Flesh",
      author: "Agustina Bazterrica",
      blurb: "Readers recommend this one carefully, and usually with a full list of warnings attached.",
      tags: [{ label: "Horror", slug: "horror" }, { label: "Bleak", slug: "bleak" }],
    },
    {
      title: "The Road",
      author: "Cormac McCarthy",
      blurb: "A father, a son, and almost nothing else. Named repeatedly by readers who want to be hollowed out.",
      tags: [{ label: "Apocalyptic", slug: "apocalyptic" }, { label: "Father-Son", slug: "father-son" }],
    },
  ]),
  whatToReadNext: [],
};

// ---------------------------------------------------------------------------
// Book Club Book Picks — lead article
// ---------------------------------------------------------------------------

export const CLUB_LEAD: Article = {
  slug: "six-dark-fantasy-picks-a-book-club-can-actually-discuss",
  category: "book-club-book-picks",
  title: "Six dark fantasy picks a book club can actually discuss",
  meta: "12 books · September 3, 2026",
  author: "The FNFE Team",
  publishedAt: "2026-09-03",
  methodologySentence:
    "We drew on 940 reader recommendations from three independent dark fantasy discussions, then chose the titles with the most to argue about in a group.",
  introParagraphs: [
    "Dark fantasy is a hard sell for a book club, right up until the meeting starts and nobody wants to leave.",
    "The problem is rarely the darkness. It is that a lot of dark fantasy is built for momentum rather than conversation, and momentum is a solitary pleasure. What a group needs is a book that makes people disagree about whether a character deserved what happened to them.",
    "So these six come from the dark fantasy recommendations readers made to each other, chosen for how much there is to say about them afterwards. Bring snacks. You will be there a while.",
  ],
  books: withSpines([
    {
      title: "The Poppy War",
      author: "R. F. Kuang",
      blurb: "Half the group will defend what she does at the end. The other half will not speak to them.",
      tags: [{ label: "Military Fantasy", slug: "military-fantasy" }, { label: "Morally Grey", slug: "morally-grey" }],
    },
    {
      title: "Between Two Fires",
      author: "Christopher Buehlman",
      blurb: "Plague-era France with heaven in open collapse. Good for a group that likes a theological argument.",
      tags: [{ label: "Horror", slug: "horror" }, { label: "Historical", slug: "historical" }],
    },
    {
      title: "The Fifth Season",
      author: "N. K. Jemisin",
      blurb: "Structurally clever enough that someone will want to reread the first chapter aloud.",
      tags: [{ label: "Apocalyptic", slug: "apocalyptic" }, { label: "Slow Reveal", slug: "slow-reveal" }],
    },
    {
      title: "Jade City",
      author: "Fonda Lee",
      blurb: "A family business with magic instead of money. Everyone arrives with a favourite sibling.",
      tags: [{ label: "Family Saga", slug: "family-saga" }, { label: "Urban Fantasy", slug: "urban-fantasy" }],
    },
    {
      title: "She Who Became the Sun",
      author: "Shelley Parker-Chan",
      blurb: "Ambition, gender and cost. Reliably the longest discussion of the year.",
      tags: [{ label: "Historical", slug: "historical" }, { label: "Morally Grey", slug: "morally-grey" }],
    },
    {
      title: "Gideon the Ninth",
      author: "Tamsyn Muir",
      blurb: "Divisive in the best way: the voice either wins a reader over on page one or never does.",
      tags: [{ label: "Gothic", slug: "gothic" }, { label: "Found Family", slug: "found-family" }],
    },
  ]),
  whatToReadNext: [],
};

// Fill in whatToReadNext now that all three lead articles are defined (they
// reference each other, matching each article's actual "What to read next"
// module in the built design).
SHORTLIST_LEAD.whatToReadNext = [
  summaryOf(WHEN_LEAD, "What to read when regular fantasy isn't dark enough"),
  summaryOf(CLUB_LEAD, "Six dark fantasy picks a book club can actually discuss"),
];
WHEN_LEAD.whatToReadNext = [
  summaryOf(SHORTLIST_LEAD, "The dark fantasy books readers recommend again and again"),
  summaryOf(CLUB_LEAD, "Six dark fantasy picks a book club can actually discuss"),
];
CLUB_LEAD.whatToReadNext = [
  summaryOf(SHORTLIST_LEAD, "The dark fantasy books readers recommend again and again"),
  summaryOf(WHEN_LEAD, "What to read when regular fantasy isn't dark enough"),
];

function summaryOf(article: Article, titleOverride?: string): ArticleSummary {
  return {
    slug: article.slug,
    category: article.category,
    title: titleOverride ?? article.title,
    meta: article.meta,
  };
}

// ---------------------------------------------------------------------------
// Hub "All articles" pools — real placeholder hub-card copy from the design.
// Only the lead article above (per category) has a full article page; other
// pool entries render as hub cards but resolve to a synthesized placeholder
// article if visited (see getArticleBySlug in index.ts) rather than 404ing.
// ---------------------------------------------------------------------------

export const SHORTLIST_POOL: { title: string; tag: string; meta: string }[] = ([
  ["The books that topped the reader recommendations for female rage", "Female Rage", "16 books · Sep 2"],
  ["The found family books that came up most often in the discussions we analysed", "Found Family", "18 books · Aug 30"],
  ["The morally grey heroines readers recommend most", "Morally Grey FMC", "14 books · Aug 27"],
  ["The slow burn romances readers keep putting forward", "Slow Burn Romance", "19 books · Aug 23"],
  ["The books readers recommend most for a book hangover", "Book Hangover", "12 books · Aug 20"],
  ["The cosy fantasy readers recommend again and again", "Cozy Fantasy", "15 books · Aug 16"],
  ["The most-recommended emotionally devastating novels", "Emotionally Devastating", "17 books · Aug 13"],
  ["The adult coming-of-age novels that rose to the top", "Adult Coming of Age", "13 books · Aug 9"],
  ["The unputdownable books readers keep naming", "Unputdownable", "18 books · Aug 6"],
  ["The horror readers recommend when you want to be properly scared", "Quiet Horror", "14 books · Aug 2"],
  ["The most-recommended enemies-to-lovers novels", "Enemies to Lovers", "16 books · Jul 30"],
  ["The books readers recommend for a long winter", "Winter Reads", "15 books · Jul 26"],
  ["The most-cited literary fiction of our 2026 research round", "Literary Fiction", "19 books · Jul 23"],
  ["The sci-fi readers recommend for its sadness, not its science", "Melancholy Sci-Fi", "13 books · Jul 19"],
  ["The books readers recommend most for social anxiety comfort reads", "Comfort Reads", "16 books · Jul 16"],
  ["The most-recommended novels with a big messy family at the centre", "Family Saga", "14 books · Jul 12"],
  ["The romantasy that topped the reader recommendations", "Romantasy", "18 books · Jul 9"],
  ["The most-recommended books set somewhere cold and haunted", "Northern Gothic", "15 books · Jul 5"],
] as [string, string, string][]).map(([title, tag, meta]) => ({ title, tag, meta }));

export const WHEN_POOL: { title: string; tag: string; meta: string }[] = ([
  ["What to read when you need a really good cry", "Emotionally Devastating", "16 books · Aug 30"],
  ["What to read when you can't focus on anything", "Comfort Reads", "14 books · Aug 28"],
  ["What to read when autumn arrives and you want to feel it", "Autumnal", "12 books · Aug 24"],
  ["What to read when you've just finished a five-star book", "Book Hangover", "13 books · Aug 21"],
  ["What to read when you want to be furious for 400 pages", "Female Rage", "15 books · Aug 17"],
  ["What to read when you want to be scared but not disturbed", "Quiet Horror", "14 books · Aug 14"],
  ["What to read when you miss your friends", "Found Family", "16 books · Aug 10"],
  ["What to read when the week has been far too long", "Cozy Fantasy", "13 books · Aug 7"],
  ["What to read when you want a romance that takes its time", "Slow Burn Romance", "17 books · Aug 3"],
  ["What to read when you only have one evening", "Short Novels", "12 books · Jul 31"],
  ["What to read when you want to be somewhere cold", "Northern Gothic", "14 books · Jul 27"],
  ["What to read when nothing bad should happen to anyone", "Low Stakes", "15 books · Jul 24"],
  ["What to read when you want to grow up all over again", "Adult Coming of Age", "13 books · Jul 20"],
  ["What to read when you want a villain to root for", "Morally Grey", "16 books · Jul 17"],
  ["What to read when the house is quiet", "Slow Literary", "14 books · Jul 13"],
  ["What to read when you want sci-fi that makes you sad", "Melancholy Sci-Fi", "12 books · Jul 10"],
  ["What to read when you want a big messy family", "Family Saga", "15 books · Jul 6"],
] as [string, string, string][]).map(([title, tag, meta]) => ({ title, tag, meta }));

export const CLUB_POOL: { title: string; tag: string; meta: string }[] = ([
  ["Found family novels worth a group read", "Found Family", "11 books · Sep 1"],
  ["Female rage novels made for group discussion", "Female Rage", "10 books · Aug 26"],
  ["Book club picks for a group tired of sad literary fiction", "Low Stakes", "12 books · Aug 22"],
  ["Short book club picks for a busy month", "Short Novels", "9 books · Aug 19"],
  ["Book club picks with an ending nobody will agree on", "Ambiguous Endings", "10 books · Aug 15"],
  ["Family sagas that will remind everyone of their own relatives", "Family Saga", "11 books · Aug 12"],
  ["Book club picks for the group that likes being scared together", "Quiet Horror", "8 books · Aug 8"],
  ["Morally grey characters worth two hours of argument", "Morally Grey", "12 books · Aug 5"],
  ["Adult coming-of-age novels for a group of grown-ups", "Adult Coming of Age", "10 books · Aug 1"],
  ["Book club picks that made readers cry in front of each other", "Emotionally Devastating", "9 books · Jul 29"],
  ["Cosy fantasy for a book club that needs a gentle month", "Cozy Fantasy", "11 books · Jul 25"],
  ["Book club picks set somewhere nobody has been", "Northern Gothic", "10 books · Jul 22"],
  ["Sci-fi picks for a group that does not read sci-fi", "Melancholy Sci-Fi", "8 books · Jul 18"],
  ["Slow burn romances a book club can be patient with", "Slow Burn Romance", "12 books · Jul 15"],
  ["Book club picks about friendship, not romance", "Friendship", "10 books · Jul 11"],
  ["Unputdownable picks for a club that never finishes the book", "Unputdownable", "9 books · Jul 8"],
  ["Book club picks for a long winter of meetings", "Winter Reads", "11 books · Jul 4"],
] as [string, string, string][]).map(([title, tag, meta]) => ({ title, tag, meta }));

export const LEAD_BY_CATEGORY: Record<CategorySlug, Article> = {
  "the-shortlist": SHORTLIST_LEAD,
  "what-to-read-when": WHEN_LEAD,
  "book-club-book-picks": CLUB_LEAD,
};

export const POOL_BY_CATEGORY: Record<CategorySlug, { title: string; tag: string; meta: string }[]> = {
  "the-shortlist": SHORTLIST_POOL,
  "what-to-read-when": WHEN_POOL,
  "book-club-book-picks": CLUB_POOL,
};

export { slugify };
