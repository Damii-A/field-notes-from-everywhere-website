/**
 * Where each post idea stands, worked out from the articles that point at it
 * (`article.postIdea`), so nothing has to be ticked by hand (DECISIONS.md, 2026-11-04).
 * Published means the same as the internal tool's "Published" read-back: a published
 * article whose date has passed. Scheduled articles and drafts are In progress.
 *
 * Needs the raw documents: the Studio's usual read merges drafts over published
 * articles and drops the "drafts." from their ids, which would make a draft with its
 * date filled in (needed before Publish can be pressed) look live.
 */

export const POST_IDEA_STATUS_QUERY = `*[_type == "postIdea" || (_type == "article" && defined(postIdea._ref))]{
  _id, _type, publishedAt, "idea": postIdea._ref
}`;

export type PostIdeaStatusRow = {
  _id: string;
  _type: string;
  publishedAt?: string | null;
  idea?: string | null;
};

export type PostIdeaStatus = { notStarted: string[]; inProgress: string[]; published: string[] };

/** Published documents are the only ones with no "." in their id (drafts.…, versions.…). */
const isLive = (row: PostIdeaStatusRow, now: Date) =>
  !row._id.includes(".") && Boolean(row.publishedAt) && new Date(row.publishedAt as string) <= now;

export function sortPostIdeas(rows: PostIdeaStatusRow[], now: Date = new Date()): PostIdeaStatus {
  const articles = rows.filter((row) => row._type === "article" && row.idea);
  const started = new Set(articles.map((article) => article.idea));
  const live = new Set(articles.filter((article) => isLive(article, now)).map((article) => article.idea));

  const status: PostIdeaStatus = { notStarted: [], inProgress: [], published: [] };
  for (const { _id, _type } of rows) {
    if (_type !== "postIdea") continue;
    (live.has(_id) ? status.published : started.has(_id) ? status.inProgress : status.notStarted).push(_id);
  }
  return status;
}
