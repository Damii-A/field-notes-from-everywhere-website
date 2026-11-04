/**
 * Where each post idea stands, grouped by theme (its ranking, e.g. Thriller). The status
 * is worked out from the articles that point at it (`article.postIdea`), so nothing has
 * to be ticked by hand (DECISIONS.md, 2026-11-04). Published means the same as the
 * internal tool's "Published" read-back: a published article whose date has passed.
 * Scheduled articles and drafts are In progress.
 *
 * Deferred is the one list that's chosen: a `postIdeaDeferral` document, set with the
 * "Defer" action. It's a separate document because the tool's re-send replaces the whole
 * idea, which would wipe a field kept on the idea. An article always wins, so an idea
 * with one is never Deferred.
 *
 * Needs the raw documents: the Studio's usual read merges drafts over published
 * articles and drops the "drafts." from their ids, which would make a draft with its
 * date filled in (needed before Publish can be pressed) look live.
 */

export const POST_IDEA_STATUS_QUERY = `*[_type == "postIdea" || _type == "postIdeaDeferral" || (_type == "article" && defined(postIdea._ref))]{
  _id, _type, publishedAt,
  "idea": select(_type == "article" => postIdea._ref, _type == "postIdeaDeferral" => idea),
  "rankingId": ranking._ref, "rankingName": ranking->name
}`;

export type PostIdeaStatusRow = {
  _id: string;
  _type: string;
  publishedAt?: string | null;
  idea?: string | null;
  rankingId?: string | null;
  rankingName?: string | null;
};

export type PostIdeaStatus = { notStarted: string[]; inProgress: string[]; deferred: string[]; published: string[] };

/** `id` is safe to use in a Studio pane id. An idea with no ranking goes under "No theme". */
export type PostIdeaTheme = { id: string; name: string; total: number; status: PostIdeaStatus };

/** The deferral document for an idea: `postIdea-53` is deferred by `postIdeaDeferral-53`. */
export const deferralIdFor = (ideaId: string) => ideaId.replace(/^postIdea-/, "postIdeaDeferral-");

/** Published documents are the only ones with no "." in their id (drafts.…, versions.…). */
const isLive = (row: PostIdeaStatusRow, now: Date) =>
  !row._id.includes(".") && Boolean(row.publishedAt) && new Date(row.publishedAt as string) <= now;

export function sortPostIdeas(rows: PostIdeaStatusRow[], now: Date = new Date()): PostIdeaTheme[] {
  const articles = rows.filter((row) => row._type === "article" && row.idea);
  const started = new Set(articles.map((article) => article.idea));
  const live = new Set(articles.filter((article) => isLive(article, now)).map((article) => article.idea));
  const deferred = new Set(rows.filter((row) => row._type === "postIdeaDeferral").map((row) => row.idea));

  const themes = new Map<string, PostIdeaTheme>();
  for (const { _id, _type, rankingId, rankingName } of rows) {
    if (_type !== "postIdea") continue;
    const name = rankingName?.trim() || "No theme";
    const id = (rankingId ?? "no-theme").replace(/[^a-zA-Z0-9_-]/g, "-");
    const theme = themes.get(id) ?? { id, name, total: 0, status: { notStarted: [], inProgress: [], deferred: [], published: [] } };
    themes.set(id, theme);
    theme.total += 1;
    const { status } = theme;
    (live.has(_id) ? status.published : started.has(_id) ? status.inProgress : deferred.has(_id) ? status.deferred : status.notStarted).push(_id);
  }
  // Alphabetical, with "No theme" last.
  return [...themes.values()].sort((a, b) => Number(a.id === "no-theme") - Number(b.id === "no-theme") || a.name.localeCompare(b.name));
}
