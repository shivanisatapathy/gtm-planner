# Master Prompt — Build the GTM Project Planner from Scratch

A copy-paste prompt for starting a fresh Claude Code session to rebuild this app (or one like it). Structured following Anthropic's prompt-engineering basics: clear role, explicit context, XML structure, examples, success criteria, and a thinking step before action.

---

## How to use

1. Start a new Claude Code session in an empty git repo (or run `git init` in a new folder).
2. Paste the prompt below as your first message.
3. Adjust the bracketed `[APP NAME]`, `[OWNER NAME]`, `[OWNER PASSWORD]`, and entity-specific fields if you're adapting to a different domain.
4. Let Claude propose the file layout before approving — don't skip the approval step; it catches misunderstandings early.

---

## The prompt

```
<role>
You are a senior full-stack engineer pairing with me to build a small,
production-quality web app. You write clean, readable JavaScript. You
prefer to ship a working minimum and iterate rather than over-architect
upfront. You ask one focused clarifying question when something is
ambiguous, instead of guessing or doing extra work I didn't ask for.
</role>

<task>
Build [APP NAME] — a shared, real-time portfolio planner for tracking
[ENTITY, e.g. "GTM projects"] across a small team. The app supports an
owner with full edit access and viewers who can read everything, add
comments, and submit asks to leadership. State syncs across all users in
real time, with a localStorage fallback when the backend isn't
configured.
</task>

<stack>
- Vite + React 18 (JavaScript, not TypeScript)
- Tailwind CSS
- lucide-react for icons (note: v0.462+ exports React components
  directly, render as <LucideIcon />, do not destructure as tuples)
- Supabase for shared real-time state
- localStorage as a fallback layer when Supabase env vars are missing
- Deploy target: Vercel
</stack>

<file_layout_proposal>
Before writing any code, propose a file layout and wait for my approval.
At minimum I expect:
- src/App.jsx — Context store, routing, identity, layout shell
- src/data.js — Enums, seed data, meta lookups, date helpers
- src/lib/supabase.js — Client init + isSupabaseEnabled flag
- src/lib/storage.js — Storage abstraction (Supabase ↔ localStorage,
  snake_case ↔ camelCase mapping)
- src/views/ — One file per top-level view (Dashboard, Project,
  Kanban, Brief, DecisionsLog, CustomTab)
- src/components/ — Shared UI (Icon, BulkActionBar, etc.)
- supabase/migrations/001_initial.sql — Schema + RLS + real-time setup
</file_layout_proposal>

<entities>
Each [project / deal / ticket / item] has:
- id, name, category, owner, sponsor
- rag (green | amber | red | unknown)
- priority (high | medium | low)
- stage (Discovery, Evaluation, Trial, Pilot, Rollout, Paused)
- score (computed from scoring weights)
- target (ISO date or "TBD"), updated, updatedDays
- focus (boolean), decision (boolean — needs exec decision)
- businessCase, ragReason, successMetrics, estCost, revenueImpact
- stakeholders[], askText, askRecommendation
- nextActions[], blockers[], dependencies[], risks[]
- scoring: { revenueImpact, strategicFit, riskIfDelayed, timeToValue, effort }
- decisions[], comments[]
</entities>

<views>
1. Dashboard — Stat tiles (RAG counts, needs decision, stalled, focus),
   filter chips, project cards in a 3-col grid.
2. Project detail — Editable fields for everything above, sectioned:
   header, asks for leadership, RAG + reasoning, scoring, next actions,
   blockers/deps/risks, decisions log, comments.
3. Kanban — Drag-to-reorder board grouped by stage / priority / rag /
   owner / category. Owner-only drag.
4. Weekly Brief — Two variants (Exec and Ops) auto-generated from
   project state.
5. Decisions log — Chronological feed of decisions + comments across
   all projects.
6. Custom Tabs — User-defined saved views (kanban or table) with
   filters, group-by, sort, and a card-fields picker.
</views>

<identity_and_permissions>
On first load show a modal asking for the user's first name. If the
name (case-insensitive) is "[OWNER NAME]", show a password field. If
the password matches "[OWNER PASSWORD]", grant owner access. Otherwise
the user is a viewer.

Owner can: edit any field, drag kanban cards, delete projects, bulk
edit, create/rename/delete custom tabs.

Viewer can: read everything, add comments on any project, edit the
"ask for leadership" section, submit asks. Cannot edit RAG / priority /
owner / stage, cannot delete, cannot drag.

Persist identity in localStorage. Add a sign-out button that clears it.
</identity_and_permissions>

<critical_patterns>
These patterns are non-obvious and easy to get wrong. Implement them
exactly as described.

1. <pattern name="editable_field">
   contentEditable fields must use useRef + useEffect that only writes
   to the DOM when the element is NOT document.activeElement. Never
   bind value as a React child — Supabase real-time events will
   re-render mid-typing and wipe in-progress edits. Provide a
   `placeholder` prop separately from `value`; use CSS `:empty:before`
   with `data-placeholder` for display so the placeholder never ends
   up as field content.
   </pattern>

2. <pattern name="safe_lookups">
   Wrap ragMeta, priorityMeta, and similar lookup tables in a Proxy
   that returns a default value when the key is missing. This prevents
   "cannot read property 'chipBg' of undefined" crashes when data has
   unexpected values.
   </pattern>

3. <pattern name="error_boundary">
   Wrap the heaviest view (project detail) in a class-component
   ErrorBoundary that surfaces error.message + stack instead of a
   blank screen. Add a "Try again" button that resets the error state.
   </pattern>

4. <pattern name="route_state">
   Route state is a merged object: { tab, projectId }. The setRoute
   helper does `prev => ({ ...prev, ...next })`. When navigating to a
   non-project tab, explicitly pass `projectId: null` — otherwise a
   stale projectId hijacks the routing on the next tab switch.
   </pattern>

5. <pattern name="storage_abstraction">
   src/lib/storage.js exposes loadProjects / upsertProject /
   removeProject / subscribeToProjects with identical signatures
   whether Supabase is enabled or not. When Supabase is enabled,
   translate camelCase ↔ snake_case at the boundary. When disabled,
   localStorage is the source of truth and upsertProject is a no-op
   (App.jsx's useEffect handles the save).
   </pattern>
</critical_patterns>

<build_phases>
Build in this order. Each phase = one prompt from me + one working,
committed result from you.

Phase 1: Scaffold (Vite + React + Tailwind, folder layout, data.js with
seed data + enums + meta lookups, empty App.jsx with Context store).

Phase 2: Dashboard view + project cards. localStorage only at this
point.

Phase 3: Project detail view with the editable-field pattern (see
critical_patterns). ErrorBoundary in place.

Phase 4: Kanban view with drag-to-move (owner-gated).

Phase 5: Weekly Brief (Exec + Ops variants).

Phase 6: Decisions log.

Phase 7: Custom tabs — saved views with filters, group-by, sort.

Phase 8: Supabase integration. Add supabase.js, storage.js, migration
SQL. Wire real-time subscriptions in App.jsx. localStorage stays as
fallback.

Phase 9: Identity modal + permission gating.

Phase 10: Polish — bulk select with floating action bar, tabs settings
modal, sign-out, top bar with save status indicator.

Phase 11: Deploy. Add Vercel config, env vars, push to GitHub.
</build_phases>

<output_format_per_phase>
For each phase:
1. Brief one-sentence plan ("I'm going to add X, Y, Z").
2. Code changes (committed to the current branch).
3. One-line commit message summarizing the change.
4. A "decisions" note ONLY if you made a non-obvious choice
   (e.g. "I used a Proxy for ragMeta instead of optional chaining
   because [reason]"). Skip this section if every choice was obvious.
5. Build verification: confirm `npm run build` succeeds before
   declaring the phase done.
</output_format_per_phase>

<constraints>
- Don't add features I didn't ask for in this phase.
- Don't refactor unrelated code unless the current change requires it.
- Don't write comments that just restate the code. Only comment when
  the WHY is non-obvious.
- Don't add backwards-compatibility shims for code that doesn't exist
  yet. We're building from scratch.
- Don't create README/docs files unless I ask.
- If the build fails, fix the underlying issue. Don't skip checks with
  --no-verify or similar.
- Ask ONE focused question if a requirement is ambiguous. Don't ask
  multiple questions or guess.
</constraints>

<example_interaction>
<good>
Me: "Phase 1 — scaffold the project."
You: "Plan: Vite + React + Tailwind setup, src/ folder layout per the
file_layout_proposal, data.js with 8 seed projects and the RAG /
priority / stage enums, empty App.jsx Context store. Building now…"
[creates files, runs npm install + npm run build, commits]
"Done. `npm run build` passes. Commit: 'Scaffold Vite + React +
Tailwind, seed data, empty Context store.' No non-obvious decisions."
</good>

<bad>
Me: "Phase 1 — scaffold the project."
You: "Should I use Vite or Next.js? Should I use TypeScript? Do you
want Tailwind v3 or v4? Should I add ESLint? Prettier? Husky?
Should…"
</bad>

The good example uses the stack already specified, doesn't re-ask
settled questions, reports the result tightly. The bad example wastes
my time re-litigating decisions already in this prompt.
</example_interaction>

<thinking_step>
Before responding to my first message after this prompt, take a moment
to:
1. Confirm you've read the stack, entities, views, identity rules, and
   critical patterns above.
2. List any genuine ambiguities (don't invent them — most of this
   prompt is precise).
3. Then propose the file layout for my approval.
</thinking_step>

Reply with your file-layout proposal now. Do not write code yet.
```

---

## Why this prompt is structured this way

Mapping to Anthropic's prompt-engineering basics:

| Principle | Where it shows up |
|---|---|
| **Give Claude a role** | `<role>` tag at the top — sets tone and judgment style. |
| **Be clear and direct** | Every section uses imperative voice and concrete specs (versions, names, exact field lists). |
| **Use XML tags** | All major sections are wrapped (`<task>`, `<stack>`, `<entities>`, etc.) so Claude can reference and obey each chunk independently. |
| **Provide examples** | `<example_interaction>` shows one good and one bad response — much higher signal than describing the behavior abstractly. |
| **Specify output format** | `<output_format_per_phase>` defines exactly what each turn should contain. |
| **Let Claude think** | `<thinking_step>` forces an explicit confirmation pass before code is written. |
| **Chain complex prompts** | `<build_phases>` breaks the work into 11 sequential prompts instead of one mega-request — each phase is small enough that Claude doesn't drift. |
| **Long content first** | Heavy context (entities, views, patterns) appears before the call-to-action at the bottom. |
| **Define success** | `<constraints>` and "build verification" make the bar for "done" explicit. |
| **Anticipate failure modes** | `<critical_patterns>` pre-empts the 5 specific bugs we hit during the original build, so the rebuild doesn't repeat them. |

---

## Customizing for a different domain

To use this prompt for a non-GTM app:

1. Replace `[APP NAME]`, `[ENTITY]`, `[OWNER NAME]`, `[OWNER PASSWORD]`.
2. Edit `<entities>` with your entity's fields.
3. Edit `<views>` to drop views you don't need (e.g. remove "Weekly Brief" for a generic tracker).
4. Keep `<critical_patterns>`, `<identity_and_permissions>`, `<build_phases>`, and the meta-structure unchanged — those generalize to any small shared real-time app.

---

## What this prompt deliberately avoids

- **Over-specification of UI details.** Colors, spacing, exact copy — left to Claude with Tailwind as the guide. Specifying these eats prompt budget without improving outcomes.
- **Forbidding features Claude might add.** Saying "don't do X, Y, Z" is less effective than the positive frame ("only do what I asked").
- **Asking for tests.** Tests at this scale slow iteration and the app is small enough to verify manually. Add them in a later phase if needed.
- **Multiple clarifying questions upfront.** The prompt is precise enough that Claude should be able to start with the file-layout proposal. The "one focused question" rule prevents question-storms.
