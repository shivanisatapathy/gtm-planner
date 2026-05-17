# GTM Project Planner — Build Guide

A reference for replicating this build (or building something similar) with Claude Code. Includes the refined master prompt, step-by-step process, tech stack rationale, and the pitfalls we hit so you don't have to.

---

## 1. The refined master prompt

Use this as the first message to Claude Code (or Claude.ai with a code-capable workspace). It's tuned from the messy back-and-forth of this build — copy verbatim and adapt the bracketed parts.

```
You are helping me build [APP NAME] — a [ONE-LINE DESCRIPTION, e.g. "shared
GTM portfolio planner for tracking projects, RAG status, decisions, and
weekly briefs"].

STACK (non-negotiable unless I say otherwise):
- Vite + React 18 (JS, not TS — keep it simple)
- Tailwind CSS for styling
- lucide-react for icons
- Supabase for shared real-time state, with localStorage as fallback
  when Supabase env vars aren't set
- Deploy target: Vercel

DESIGN INPUTS:
- HTML prototype(s) in ./project/
- Design conversations in ./chats/
Read both folders fully before writing code. Treat the prototype as the
visual source of truth and the chats as intent / rationale.

CONSTRAINTS:
1. Single source of truth for shared state. No prop drilling more than 2
   levels — use a React Context store in App.jsx.
2. Identity is name-based ("first name" prompt on first load). Owner is
   gated by a password I'll specify. Everyone else is a viewer with
   comment + ask-submission permissions.
3. All contentEditable fields must use a useRef + useEffect pattern that
   guards against re-renders overwriting in-progress edits (Supabase
   real-time events will trigger re-renders mid-typing). Never bind
   contentEditable value as a React child.
4. Use a Proxy wrapper for any lookup tables (RAG meta, priority meta,
   etc.) so unknown keys fall back to a sane default instead of throwing
   `Cannot read property 'x' of undefined`.
5. Wrap the heaviest view (project detail) in an ErrorBoundary so a bad
   field doesn't blank the whole app.
6. Build cleanly: `npm install && npm run build` must succeed with no
   errors before you commit.

DELIVERABLES PER STEP:
- Working code committed to the current branch
- A one-line summary of what changed
- Any non-obvious decisions called out (e.g. "I chose X over Y because…")

Do not add features I didn't ask for. Do not refactor unrelated code. If
a request is ambiguous, ask one focused question before coding.

Start by reading ./project/ and ./chats/, then propose a file layout and
wait for my approval before scaffolding.
```

---

## 2. Step-by-step build flow

This is the actual order things were built in. Following it avoids the dead-ends we hit.

### Phase 1 — Scaffold (1 prompt)
- Vite + React + Tailwind project
- Folder structure: `src/views/`, `src/components/`, `src/lib/`, `src/data.js`, `src/App.jsx`
- A `data.js` with seed projects, enums (RAG, priority, stages), and meta lookups
- `App.jsx` with a Context store holding `projects`, `route`, `identity`, `viewMode`

### Phase 2 — Views (1 prompt each, in order)
1. **Dashboard** — portfolio overview with stat tiles, filter chips, project cards
2. **Project detail** — full editable view per project (asks, scoring, decisions, comments)
3. **Kanban** — grouped board with drag-to-move (owner only)
4. **Weekly Brief** — Exec and Ops variants
5. **Decisions Log** — chronological feed of decisions + comments across all projects
6. **Custom Tabs** — user-defined saved views (kanban or table) with filters + group-by

### Phase 3 — Shared state
- Add `src/lib/supabase.js` and `src/lib/storage.js` (storage abstraction with snake_case ↔ camelCase mapping)
- Add `supabase/migrations/001_initial.sql` with `projects` + `custom_tabs` tables, RLS "Allow all" policies, real-time publication enabled
- Wire `subscribeToProjects` / `subscribeToCustomTabs` into `App.jsx`
- Keep localStorage cache as fallback when `VITE_SUPABASE_URL` is missing

### Phase 4 — Identity + permissions
- `IdentityModal` on first load: name input, password field only when name is "shivani"
- Persist identity in localStorage
- Gate owner-only actions (drag, delete, RAG/priority edit) behind `identity.isOwner`

### Phase 5 — Polish features (one per prompt)
- Bulk select (checkboxes on cards/rows + fixed bottom action bar)
- Tabs settings modal (show/hide built-ins, create custom views)
- Real-time edit guard for contentEditable

### Phase 6 — Deploy
- Push to GitHub
- Connect repo to Vercel
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Vercel env vars
- Vercel rebuilds on every push to main

---

## 3. Tech stack rationale

| Choice | Why |
|---|---|
| **Vite over CRA/Next** | Fastest dev server, simplest config. We don't need SSR. |
| **React 18 + JS (not TS)** | Faster to iterate for a single-developer tool; TypeScript's overhead isn't worth it at this size. |
| **Tailwind** | No CSS file sprawl, design tokens inline. Pairs well with the HTML prototype. |
| **lucide-react** | Most complete free icon set. Note: v0.462+ exports React components directly (not tuples) — see pitfalls. |
| **Supabase** | Real-time out of the box, free tier covers small teams, RLS lets viewers read without auth complexity. |
| **localStorage fallback** | Lets the app run locally with no setup; Supabase env vars upgrade it to shared mode. |
| **Vercel** | Zero-config for Vite. Auto-deploys on push. |

---

## 4. Key files to read first

If you're forking this for another project, these are the files that capture the architecture:

- `src/App.jsx` — the store, routing, identity, top-level layout
- `src/data.js` — enums, seed data, meta lookups (RAG/priority via Proxy), date helpers
- `src/lib/storage.js` — the Supabase ↔ localStorage abstraction; the casing-translation layer
- `src/lib/supabase.js` — client init + `isSupabaseEnabled` flag
- `src/views/Project.jsx` — the contentEditable + ErrorBoundary pattern (copy this verbatim for any editable detail view)
- `src/components/BulkActionBar.jsx` — the floating action bar pattern; reusable for any list-select UI
- `supabase/migrations/001_initial.sql` — schema, RLS, real-time setup

---

## 5. Pitfalls we hit (and how to avoid them)

1. **lucide-react v0.462 API change.** The `icons` export is now a map of React components, not `[tag, props, children]` tuples. Render them as `<LucideIcon />`, don't destructure.

2. **contentEditable + real-time = lost edits.** Supabase events echo your own upserts back as subscription events, triggering re-renders that wipe in-progress typing. Fix: `useRef` + `useEffect` that only writes to the DOM when the element is NOT `document.activeElement`.

3. **ASI gotcha.** Two consecutive statements starting with `(` on adjacent lines get parsed as a single function call. Either combine them or prefix the second with `;`.

4. **Route state merging.** Don't keep `projectId` in route state across tab switches. When clicking a non-project tab, explicitly pass `projectId: null`. Otherwise stale IDs hijack the routing.

5. **Lookup tables crash on unknown keys.** Wrap `ragMeta` / `priorityMeta` etc. in a `Proxy` that returns a default when the key is missing. Saves you from a dozen "cannot read property of undefined" crashes.

6. **Vercel env vars are baked at build time** for `VITE_*` variables. Changing them in the Vercel UI requires a redeploy to take effect.

7. **Don't `--amend` after a failed pre-commit hook.** The commit didn't happen, so amend modifies the *previous* commit instead. Create a new commit.

---

## 6. How to use this in a Claude Project

Upload these files to the Claude Project's knowledge base so anyone in the project can ask Claude to explain or replicate parts:

**Required (architecture + intent):**
- `BUILD_GUIDE.md` (this file)
- `README.md`
- `SETUP.md`
- `src/App.jsx`
- `src/data.js`

**Recommended (patterns worth copying):**
- `src/lib/storage.js`
- `src/lib/supabase.js`
- `src/views/Project.jsx` (the editable-detail pattern)
- `src/components/BulkActionBar.jsx` (the bulk-action pattern)
- `supabase/migrations/001_initial.sql`

**Optional (full reference):**
- The rest of `src/views/` and `src/components/`
- `package.json` (for the dependency versions that work)

Then in the Claude Project's custom instructions, add:

> If someone asks "how was this built" or "how do I build something like this", point them to BUILD_GUIDE.md in the project knowledge — it has the refined master prompt, step-by-step phases, tech stack rationale, and the pitfalls we hit. Don't reinvent the explanation; reference the guide.

---

## 7. Adapting this to a different domain

The architecture is generic enough to fit any "shared, real-time, role-gated CRUD app over a list of entities". To adapt:

1. Replace `projects` everywhere with your entity (e.g. `deals`, `tickets`, `experiments`).
2. Edit `data.js` enums (RAG, priority, stages) to match your entity's fields.
3. Edit the Supabase migration: change the `projects` table schema, keep the RLS pattern.
4. Edit `Project.jsx` to show your entity's fields.
5. Keep `App.jsx`, `storage.js`, `BulkActionBar.jsx`, the identity flow, and the routing pattern as-is.

The refined master prompt in section 1 already supports this — just change `[APP NAME]` and `[ONE-LINE DESCRIPTION]`.
