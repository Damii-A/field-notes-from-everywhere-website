import { defineField, defineType } from "sanity";

/**
 * Marks a post idea as Deferred: set aside for now, not deleted (DECISIONS.md, 2026-11-04).
 * Made and removed by the "Defer" / "Bring back" action on the idea, never edited by hand,
 * and not in the sidebar. Separate from the idea because the tool's re-send replaces the
 * whole idea document. `idea` is a plain id, not a reference, so it can never block the
 * tool from replacing or removing an idea.
 */
export default defineType({
  name: "postIdeaDeferral",
  title: "Deferred post idea",
  type: "document",
  readOnly: true,
  fields: [
    defineField({ name: "idea", title: "Post idea id", type: "string" }),
    defineField({ name: "deferredAt", title: "Deferred at", type: "datetime" }),
  ],
});
