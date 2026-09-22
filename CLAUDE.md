# CLAUDE.md — Field Notes From Everywhere

Operational entry point for any AI coding session working in this repository. Read this
first, then follow the Session Startup Protocol below before making substantial changes.

## Project identity

Field Notes From Everywhere (FNFE) is a book-recommendation editorial website: a free
Publication (three editorial columns of curated reading lists, backed by reader-recommendation
research) and The Reading Room, a paid ($5/month, 7-day free trial) daily newsletter product.
V1 is the public marketing/editorial site plus Reading Room trial signup — see
`ARCHITECTURE.md` for exactly what that does and doesn't include.

## Governing sources, in order of authority

1. **The live Claude Design project** — `claude.ai/design`, project **"Full FNFE Website"**
   (projectId `5a207ce5-1cf9-4986-b5f1-12c9e767072d`), accessed via the `DesignSync` tool
   (requires `/design-login` authorization in an interactive session — not available to every
   session or subagent). This is the authoritative definition of the V1 product: its pages,
   content structure, visual system, responsive behavior, interactions, motion and states.
   Build what's there. Do not redesign it or add product scope it doesn't show.
2. **`docs/design-specs/DESIGN_PROJECT_BUILD_NOTES.md`** — the design project's own build
   notes (mirrored verbatim). States, in the design team's own words, where the built pages
   depart from the specs and what was deliberately cut from V1. **Trust this over the specs
   below when they conflict** — it is closer to the live design project than the specs are.
3. **`docs/design-specs/*.md`** (`homepage`, `about`, `pub_hub`, `pub_article`, `rr_landing`,
   `rr_subscriber`, `utility_pages`) — the original client experience-spec documents, mirrored
   verbatim. Authoritative for content hierarchy, business rules (trial length, pricing,
   editorial methodology, disclosure requirements) and intent, but treat anything the build
   notes say was cut as **documented backlog, not a current requirement**. Most notably:
   `rr_subscriber.md` describes a full logged-in product that does not exist in V1.
4. **`docs/AI_ENGINEERING_OPERATING_MANUAL.md`** — governs engineering process: autonomy and
   escalation, documentation discipline, version control, secrets, testing, performance, cost,
   deployment, and the overall definition of done. Governs *how* work gets done; does not
   define the product. Do not copy it into other files — reference it.
5. **`ARCHITECTURE.md` and `DECISIONS.md`** (this repo) — how the above was translated into a
   production system, and why. Consult before re-deciding something already settled here.

**Source-of-truth rules**: these documents remain independent sources of truth. A summary
never replaces them — consult the actual source when its subject matter is relevant, not a
prior session's interpretation of it. Code should never silently override documented intent.
If something in the codebase conflicts with a governing document, that's a conflict to
resolve intentionally (Operating Manual §14), not something to paper over. A genuine change
of product direction updates the relevant source of truth (the design project or, if the user
directs a change the design doesn't reflect, this repo's docs) rather than creating
undocumented divergence between code and docs.

## Session startup protocol

Before substantial implementation work:

1. Read this file.
2. Read `CURRENT_STATE.md` — what exists, what's next, what's blocked on the user. Useful this
   early mainly to identify *which area* is relevant when the session hasn't named one yet.
   **Reading this file does not conclude the protocol.** It's the one document that answers
   "what should happen next," which makes it tempting to stop here and answer — don't: steps
   3–6 below still have to happen before recommending anything or treating the protocol as
   done. This has been a repeat failure in this project — see the `feedback_startup_protocol.md`
   agent memory.
3. Read the relevant sections of `ARCHITECTURE.md` for the area identified above (or the area
   the user explicitly named).
4. Check `DECISIONS.md` for anything already settled in that area.
5. If you're touching a specific page/feature, read its governing spec in
   `docs/design-specs/` **and**, if you have design-tool access, the live page in the Claude
   Design project — the specs describe intent, the live project shows the actual current
   built state (see governing-sources ordering above).
6. Inspect the existing implementation before changing it.
7. Confirm you understand the actual outcome wanted before starting, now that you've read
   everything above.

Don't re-read every document in full for a trivial change — read what's relevant to the work.

## Working rules

- Build what the design shows. Infer the ordinary technical requirements needed to make a
  designed feature actually work (data fetching, validation, loading/error/empty states,
  persistence, auth where the design requires it, accessibility, responsive behavior,
  performance, caching, routing, metadata) — that's normal engineering judgment, not scope
  creep. Don't invent new user-facing features, business rules, or workflows the design
  doesn't show.
- Make routine, reversible engineering decisions autonomously (file structure, naming,
  ordinary refactors, minor dependency choices, test organization) — don't ask permission for
  these.
- Preserve working functionality; avoid unrelated rewrites; follow established patterns in
  this repo unless there's a real reason to change them.
- Port design-system tokens and components faithfully — don't recreate values by eyeballing
  the design; read the actual token/component source from the design project.
- Treat `prefers-reduced-motion` handling as a hard requirement on every bespoke animation
  (it's explicitly required in the specs, not optional polish).
- Keep the repository recoverable: commit logical units of work with clear messages; don't
  leave long uncommitted stretches before risky changes.

## Decision escalation

Surface a decision explicitly (don't just proceed) when it would materially affect:

- **Project direction** — anything that would contradict a governing source above, or that
  implies a user-facing behavior the design doesn't show and where more than one plausible
  behavior exists (a genuine product decision, not an implementation detail).
- **Architecture** — a new major framework/service, significant vendor lock-in, or
  infrastructure that materially changes how the system operates (see `DECISIONS.md` for the
  Resend recommendation as a worked example of this).
- **Security/privacy** — auth, credential handling, sensitive data, permissions.
- **Cost** — any new paid or recurring-cost service, even a low/no-cost one, since the concern
  is vendor/complexity surface as much as dollars (Operating Manual §10, §35).
- **Data integrity** — destructive operations, irreversible transformations, anything that
  could corrupt Sanity content, Kit list state, or Paddle subscription state.
- **Irreversible or expensive-to-undo actions** — e.g. DNS cutover on the production domain,
  which should happen deliberately near the end of the build with explicit confirmation, not
  as a routine step.

Don't ask about ordinary reversible implementation choices — decide and note it if it's
consequential enough for `DECISIONS.md`, otherwise just build it.

## Documentation maintenance

Update `CURRENT_STATE.md` when what's built or what's blocked changes. Update `ARCHITECTURE.md`
when the actual architecture changes. Add to `DECISIONS.md` when a consequential decision is
made (see its existing entries for the expected format). Don't create documentation churn for
trivial code changes.

## Session ending protocol

Before ending significant work: verify it, update `CURRENT_STATE.md` (and `ARCHITECTURE.md` /
`DECISIONS.md` if applicable), record unresolved issues or next steps, commit completed
logical work with a clear message, and push to the configured remote once one exists. Leave
enough in the repository that a new session can continue without this conversation.
