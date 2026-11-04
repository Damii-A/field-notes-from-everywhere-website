import { useEffect, useState } from "react";
import { useClient, type DocumentActionProps } from "sanity";
import { deferralIdFor } from "../lib/postIdeaStatus";

/**
 * Studio document action on post ideas: moves an idea to Deferred, or brings it back to
 * Not started (DECISIONS.md, 2026-11-04). Nothing about the idea itself changes. Not
 * available once an article has been started from the idea: it's In progress by then.
 */
export function DeferIdeaAction({ id, onComplete }: DocumentActionProps) {
  const client = useClient({ apiVersion: "2025-01-01" });
  const deferralId = deferralIdFor(id);
  const [state, setState] = useState<{ deferred: boolean; started: boolean } | null>(null);
  const [running, setRunning] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    client
      .fetch<{ deferred: boolean; started: boolean }>(
        `{ "deferred": count(*[_id == $deferralId]) > 0, "started": count(*[_type == "article" && postIdea._ref == $id]) > 0 }`,
        { deferralId, id },
      )
      .then((result) => {
        if (!cancelled) setState(result);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [client, deferralId, id]);

  async function toggle() {
    if (!state) return;
    setRunning(true);
    setFailed(false);
    try {
      if (state.deferred) await client.delete(deferralId);
      else await client.createIfNotExists({ _id: deferralId, _type: "postIdeaDeferral", idea: id, deferredAt: new Date().toISOString() });
      setState({ ...state, deferred: !state.deferred });
      onComplete();
    } catch {
      setFailed(true);
    } finally {
      setRunning(false);
    }
  }

  const label = failed ? "Couldn't update. Reload and try again" : running ? "Saving…" : state?.deferred ? "Bring back to Not started" : "Defer";
  return {
    label,
    disabled: !state || running || state.started,
    title: state?.started ? "An article was started from this idea, so it's In progress." : undefined,
    onHandle: toggle,
  };
}
