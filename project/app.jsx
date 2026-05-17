// Main App shell + top bar + tabs + identity + permissions
const { useState, useEffect, useRef, useMemo, createContext, useContext } = React;

// ---- icon helper (Lucide) ----
function Icon({ name, size = 14, className = "", strokeWidth = 2 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = "";
      const el = document.createElement("i");
      el.setAttribute("data-lucide", name);
      el.style.width = size + "px";
      el.style.height = size + "px";
      el.style.strokeWidth = strokeWidth;
      ref.current.appendChild(el);
      window.lucide.createIcons({ attrs: { width: size, height: size, "stroke-width": strokeWidth } });
    }
  }, [name, size, strokeWidth]);
  return <span ref={ref} className={"inline-flex shrink-0 " + className} style={{ width: size, height: size, lineHeight: 0 }} />;
}

const StoreCtx = createContext(null);
function useStore() { return useContext(StoreCtx); }

function useClickOutside(ref, onClose) {
  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) onClose(); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, onClose]);
}

// ---- LocalStorage persistence ----
function loadLS(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } }
function saveLS(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }

// ============================================================================
// Identity prompt (first-load only)
// ============================================================================
function IdentityModal({ onSubmit }) {
  const [name, setName] = useState("");

  function submit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    // Only Shivani gets owner access; everyone else is a viewer
    const isOwner = trimmed.toLowerCase() === "shivani";
    onSubmit({ name: trimmed, isOwner });
  }

  const willBeOwner = name.trim().toLowerCase() === "shivani";

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={submit}>
        <div className="flex items-center gap-3 mb-4">
          <div className="logo-grad h-9 w-9 rounded-md grid place-items-center shadow-pop">
            <Icon name="target" size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold tracking-tight">Welcome to the GTM planner</h3>
            <p className="text-[12px] text-slate-500">Tell us who you are so we can tag your comments.</p>
          </div>
        </div>
        <label className="text-[12px] font-medium text-slate-700 block">
          Your name
          <input autoFocus value={name} onChange={e => setName(e.target.value)}
            placeholder="Your name"
            className="mt-1 w-full h-9 px-2.5 rounded-md border border-slate-200 text-[13px]" />
        </label>
        <div className="flex justify-end gap-2 mt-5">
          <button type="submit" className="btn-primary">Continue</button>
        </div>
      </form>
    </div>
  );
}

// ============================================================================
// Top bar
// ============================================================================
function TopBar() {
  const { projects, viewMode, setViewMode, saveStatus, sync, syncing, lastSynced, identity, signOut } = useStore();
  const counts = useMemo(() => {
    const c = { green: 0, amber: 0, red: 0, unknown: 0 };
    projects.forEach(p => c[p.rag]++);
    return c;
  }, [projects]);

  const lastSyncedLabel = useMemo(() => {
    if (!lastSynced) return "";
    const mins = Math.floor((Date.now() - lastSynced) / 60000);
    if (mins < 1) return "just now";
    if (mins === 1) return "1 min ago";
    if (mins < 60) return mins + " min ago";
    const hrs = Math.floor(mins / 60);
    return hrs + "h ago";
  }, [lastSynced, syncing]);

  return (
    <div className="bg-[#0B0D12] text-slate-200 border-b border-black/30">
      <div className="px-6 h-14 flex items-center gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="logo-grad h-7 w-7 rounded-md flex items-center justify-center shadow-pop">
            <Icon name="target" size={14} className="text-white" />
          </div>
          <div className="flex flex-col leading-tight">
            <div className="text-[14px] font-semibold text-white tracking-tight whitespace-nowrap">GTM Project Planner</div>
            <div className="hidden md:inline-flex items-center gap-1 text-[10.5px] text-slate-400 -mt-0.5">
              <Icon name="eye" size={10} />
              Shared — visible to all viewers
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-3 ml-4 pl-4 border-l border-white/10 text-[12px] text-slate-300 tabular-nums">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500"></span>{counts.green}</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500"></span>{counts.amber}</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500"></span>{counts.red}</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-400"></span>{counts.unknown}</span>
        </div>

        <div className="flex-1"></div>

        <div className="hidden md:inline-flex items-center gap-1.5 text-[12px] text-slate-300">
          <span className={"h-2 w-2 rounded-full " + (
            saveStatus === "saved" ? "bg-emerald-400"
            : saveStatus === "saving" ? "bg-amber-400 pulse-soft"
            : "bg-rose-400"
          )}></span>
          {saveStatus === "saved" ? "Saved" : saveStatus === "saving" ? "Saving…" : "Unsaved"}
        </div>

        <button onClick={sync} className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-[12px] text-slate-200 hover:bg-white/5 border border-white/10" title={lastSynced ? "Last synced " + lastSyncedLabel : "Sync"}>
          <Icon name="refresh-cw" size={13} className={syncing ? "animate-spin" : ""} />
          <span className="hidden sm:inline">Sync</span>
          {lastSynced && <span className="text-slate-400 hidden md:inline">· {lastSyncedLabel}</span>}
        </button>

        <div className="inline-flex items-center bg-white/5 border border-white/10 rounded-md p-0.5 text-[12px]">
          <button onClick={() => setViewMode("exec")} className="seg-btn h-7 px-3 rounded text-slate-300" aria-pressed={viewMode === "exec"}>Exec</button>
          <button onClick={() => setViewMode("ops")} className="seg-btn h-7 px-3 rounded text-slate-300" aria-pressed={viewMode === "ops"}>Ops</button>
        </div>

        <UserMenu identity={identity} signOut={signOut} />
      </div>
    </div>
  );
}

function UserMenu({ identity, signOut }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));
  const initials = identity.name.split(" ").map(x => x[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)} className="inline-flex items-center gap-1.5 h-8 pl-1.5 pr-2.5 rounded-md hover:bg-white/5 border border-white/10 text-[12px] text-slate-200">
        <span className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 grid place-items-center text-[10px] font-semibold text-white">{initials || "?"}</span>
        {identity.isOwner
          ? <Icon name="crown" size={13} className="text-amber-300" />
          : <Icon name="user" size={13} className="text-slate-400" />}
        {identity.name}
      </button>
      {open && (
        <div className="menu" style={{ top: 38, right: 0, minWidth: 200 }}>
          <div className="px-2.5 py-2 text-[11px] text-slate-500">
            Signed in as <span className="font-medium text-slate-700">{identity.name}</span>
            <div className="text-[10.5px] text-slate-400 mt-0.5 inline-flex items-center gap-1">
              {identity.isOwner ? <><Icon name="crown" size={10} className="text-amber-500" />Owner — full edit access</> : <><Icon name="user" size={10} />Viewer — comment + add only</>}
            </div>
          </div>
          <button className="menu-item" onClick={() => { signOut(); setOpen(false); }}>
            <Icon name="log-out" size={13} /> Switch user
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Tabs nav + Tabs settings modal
// ============================================================================
function Tabs() {
  const { route, setRoute, customTabs, hiddenTabs, openTabSettings } = useStore();

  const baseTabs = [
    { id: "dashboard", label: "Dashboard", icon: "layout-dashboard" },
    { id: "project",   label: "Project",   icon: "folder" },
    { id: "kanban",    label: "Kanban",    icon: "columns-3" },
    { id: "brief",     label: "Weekly Brief", icon: "file-text" },
    { id: "decisions", label: "Decisions Log", icon: "git-branch" }
  ];
  const visible = baseTabs.filter(t => !hiddenTabs.includes(t.id));

  return (
    <nav className="px-6 bg-[#0B0D12] border-t border-white/[0.06]">
      <ul className="flex items-end gap-1 text-[13px] text-slate-400 overflow-x-auto nice-scroll">
        {visible.map(t => (
          <li key={t.id}>
            <button onClick={() => setRoute({ tab: t.id })}
              className={"tab-btn relative h-10 px-3 inline-flex items-center gap-1.5 hover:text-slate-200 whitespace-nowrap " + (route.tab === t.id ? "active" : "")}>
              <Icon name={t.icon} size={13} />
              {t.label}
            </button>
          </li>
        ))}
        {customTabs.length > 0 && <li className="text-slate-500 px-1 text-[11px] uppercase tracking-wider mb-2 ml-2 self-center">Custom</li>}
        {customTabs.map(t => (
          <li key={t.id}>
            <button onClick={() => setRoute({ tab: t.id })}
              className={"tab-btn relative h-10 px-3 inline-flex items-center gap-1.5 hover:text-slate-200 whitespace-nowrap " + (route.tab === t.id ? "active" : "")}>
              <Icon name="layout-grid" size={13} />
              {t.label}
            </button>
          </li>
        ))}
        <li className="ml-auto">
          <button onClick={openTabSettings} className="h-10 px-3 inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200">
            <Icon name="settings-2" size={13} />Tabs
          </button>
        </li>
      </ul>
    </nav>
  );
}

function TabSettingsModal({ onClose }) {
  const { identity, customTabs, addCustomTab, removeCustomTab, hiddenTabs, toggleHiddenTab, setRoute } = useStore();
  const [name, setName] = useState("");
  const [view, setView] = useState("kanban");
  const [groupBy, setGroupBy] = useState("priority");

  const builtins = [
    { id: "dashboard", label: "Dashboard" },
    { id: "project",   label: "Project" },
    { id: "kanban",    label: "Kanban" },
    { id: "brief",     label: "Weekly Brief" },
    { id: "decisions", label: "Decisions Log" }
  ];

  function create(e) {
    e.preventDefault();
    if (!name.trim()) return;
    const id = addCustomTab({ label: name.trim(), view, groupBy });
    setName("");
    setRoute({ tab: id });
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ width: 580 }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-semibold tracking-tight">Tabs</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><Icon name="x" size={16} /></button>
        </div>

        <section className="mb-6">
          <h4 className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">Show / hide built-in tabs</h4>
          <p className="text-[11.5px] text-slate-500 mb-3">Personal preference — only you see this change.</p>
          <div className="grid grid-cols-2 gap-1.5">
            {builtins.map(t => (
              <label key={t.id} className="inline-flex items-center gap-2 text-[13px] text-slate-700 px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer">
                <input type="checkbox" checked={!hiddenTabs.includes(t.id)} onChange={() => toggleHiddenTab(t.id)} className="accent-indigo-600" />
                {t.label}
              </label>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Custom views</h4>
            {!identity.isOwner && <span className="text-[10.5px] text-slate-400">Owner only</span>}
          </div>
          {identity.isOwner ? (
            <>
              <p className="text-[11.5px] text-slate-500 mb-3">Each custom view is a saved board or table with its own filters, group-by, and sort. Configure everything inline once the view is created. Shared with all viewers.</p>
              <form onSubmit={create} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-end mb-4 p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block">View name</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Q3 OKRs, AI agents, my projects" className="mt-1 w-full h-8 px-2.5 rounded-md border border-slate-200 text-[13px] bg-white" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block">Start as</label>
                  <select className="bare mt-1 h-8 px-2.5 rounded-md border border-slate-200 text-[13px] bg-white" value={view} onChange={e => setView(e.target.value)}>
                    <option value="kanban">Board</option>
                    <option value="table">Table</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block">{view === "kanban" ? "Group by" : "Sort by"}</label>
                  {view === "kanban" ? (
                    <select className="bare mt-1 h-8 px-2.5 rounded-md border border-slate-200 text-[13px] bg-white" value={groupBy} onChange={e => setGroupBy(e.target.value)}>
                      <option value="priority">Priority</option>
                      <option value="rag">RAG status</option>
                      <option value="stage">Stage</option>
                      <option value="owner">Owner</option>
                      <option value="category">Category</option>
                    </select>
                  ) : (
                    <span className="mt-1 inline-flex items-center h-8 px-2.5 rounded-md border border-slate-200 text-[13px] bg-white text-slate-500">Priority score</span>
                  )}
                </div>
                <button type="submit" className="btn-primary self-end"><Icon name="plus" size={13} />Add</button>
              </form>
              <div className="flex flex-col gap-1.5 max-h-[40vh] overflow-y-auto nice-scroll">
                {customTabs.length === 0 && <p className="text-[12px] text-slate-400 italic">No custom views yet.</p>}
                {customTabs.map(t => <CustomTabRow key={t.id} tab={t} onRemove={() => removeCustomTab(t.id)} onOpen={() => { setRoute({ tab: t.id }); onClose(); }} />)}
              </div>
            </>
          ) : (
            <p className="text-[12.5px] text-slate-500">{customTabs.length} custom {customTabs.length === 1 ? "view" : "views"} configured by the owner.</p>
          )}
        </section>
      </div>
    </div>
  );
}

function CustomTabRow({ tab, onRemove, onOpen }) {
  const t = window.normalizeCustomTab(tab);
  const filterCount = (t.filters.categories.length + t.filters.owners.length + t.filters.priorities.length + t.filters.rags.length + t.filters.stages.length
    + (t.filters.focusOnly ? 1 : 0) + (t.filters.decisionOnly ? 1 : 0) + (t.filters.stalledOnly ? 1 : 0) + (t.filters.search ? 1 : 0));
  return (
    <div className="flex items-center gap-2 p-2 rounded-md border border-slate-200 bg-white">
      <Icon name={t.view === "kanban" ? "columns-3" : "rows-3"} size={13} className="text-slate-400" />
      <button onClick={onOpen} className="flex-1 text-left text-[13px] hover:text-indigo-600">{t.label}</button>
      <span className="text-[11px] text-slate-500 inline-flex items-center gap-2">
        <span className="inline-flex items-center gap-1"><Icon name={t.view === "kanban" ? "layers" : "arrow-down-narrow-wide"} size={11} />{t.view === "kanban" ? (({ priority: "Priority", rag: "RAG", stage: "Stage", owner: "Owner", category: "Category" })[t.groupBy]) : "Score"}</span>
        {filterCount > 0 && <span className="inline-flex items-center gap-1 text-indigo-700"><Icon name="filter" size={11} />{filterCount}</span>}
      </span>
      <button onClick={onOpen} className="text-[11px] text-slate-500 hover:text-indigo-600 inline-flex items-center gap-1 px-1.5 py-1 rounded hover:bg-slate-50">
        <Icon name="settings" size={11} /> Edit inline
      </button>
      <button onClick={onRemove} className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-[11.5px] font-medium">
        <Icon name="trash-2" size={12} /> Delete
      </button>
    </div>
  );
}

// ============================================================================
// App root
// ============================================================================
const GTM_SCHEMA_VERSION = "v7-cleared-fields";

function App() {
  // identity from LS
  const [identity, setIdentity] = useState(() => loadLS("gtm.identity", null));
  const [projects, setProjects] = useState(() => {
    const v = loadLS("gtm.schema", null);
    return v === GTM_SCHEMA_VERSION ? loadLS("gtm.projects", window.gtmInitialProjects) : window.gtmInitialProjects;
  });
  const [route, setRouteState] = useState({ tab: "dashboard", projectId: null });
  const [viewMode, setViewMode] = useState(() => loadLS("gtm.viewMode", "ops"));
  const [filter, setFilter] = useState("all");
  const [saveStatus, setSaveStatus] = useState("saved");
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(Date.now() - 1000 * 60 * 2);
  const [customTabs, setCustomTabs] = useState(() => loadLS("gtm.customTabs", []));
  const [hiddenTabs, setHiddenTabs] = useState(() => loadLS("gtm.hiddenTabs", []));
  const [tabSettingsOpen, setTabSettingsOpen] = useState(false);

  // ensure schema version is stamped so next load picks up fresh seed if we bump it
  useEffect(() => { saveLS("gtm.schema", GTM_SCHEMA_VERSION); }, []);

  // persist
  useEffect(() => { saveLS("gtm.projects", projects); }, [projects]);
  useEffect(() => { saveLS("gtm.viewMode", viewMode); }, [viewMode]);
  useEffect(() => { saveLS("gtm.customTabs", customTabs); }, [customTabs]);
  useEffect(() => { saveLS("gtm.hiddenTabs", hiddenTabs); }, [hiddenTabs]);
  useEffect(() => { if (identity) saveLS("gtm.identity", identity); }, [identity]);

  // default view mode reflects who the user is — owner Shivani → Ops; everyone else → Exec
  // (only applied at identity sign-in time, doesn't override later toggles)
  function signIn({ name, isOwner }) {
    // Force-resolve owner status by name — only Shivani is owner, regardless of input
    const resolvedOwner = name.trim().toLowerCase() === "shivani";
    setIdentity({ name, isOwner: resolvedOwner });
    setViewMode(resolvedOwner ? "ops" : "exec");
  }
  function signOut() {
    localStorage.removeItem("gtm.identity");
    setIdentity(null);
  }

  function setRoute(next) {
    setRouteState(prev => ({ ...prev, ...next }));
    window.scrollTo({ top: 0 });
  }

  const savingTimer = useRef(null);
  function markSaving() {
    setSaveStatus("saving");
    clearTimeout(savingTimer.current);
    savingTimer.current = setTimeout(() => setSaveStatus("saved"), 700);
  }
  function updateProject(id, patch) {
    setProjects(ps => ps.map(p => p.id === id ? { ...p, ...patch, updated: "just now", updatedDays: 0 } : p));
    markSaving();
  }
  function addProject(partial) {
    const id = "p-" + Math.random().toString(36).slice(2, 8);
    const np = {
      id, name: partial.name || "New project", category: partial.category || "Uncategorised",
      owner: partial.owner || identity?.name || "Unassigned", sponsor: partial.sponsor || "",
      rag: "unknown", priority: "medium", stage: "Discovery", score: 30,
      target: "TBD", updated: "just now", updatedDays: 0, focus: false, decision: false,
      businessCase: partial.businessCase || "",
      ragReason: "", successMetrics: "", estCost: "", revenueImpact: "",
      stakeholders: [], askText: "", askRecommendation: "",
      nextActions: [], blockers: [], dependencies: [], risks: [],
      scoring: { revenueImpact: 5, strategicFit: 5, riskIfDelayed: 5, timeToValue: 5, effort: 5 },
      decisions: [], comments: []
    };
    setProjects(ps => [np, ...ps]);
    markSaving();
    return id;
  }
  function deleteProject(id) {
    setProjects(ps => ps.filter(p => p.id !== id));
    setRoute({ tab: "dashboard", projectId: null });
    markSaving();
  }
  function sync() {
    setSyncing(true);
    setTimeout(() => { setSyncing(false); setLastSynced(Date.now()); }, 900);
  }

  // custom tabs
  function addCustomTab({ label, view, groupBy }) {
    const id = "t-" + Math.random().toString(36).slice(2, 8);
    const newTab = {
      id,
      label,
      view: view || "kanban",
      groupBy: groupBy || "priority",
      sort: "score",
      hideEmptyColumns: false,
      filters: { categories: [], owners: [], priorities: [], rags: [], stages: [], focusOnly: false, decisionOnly: false, stalledOnly: false, search: "" }
    };
    setCustomTabs(ts => [...ts, newTab]);
    markSaving();
    return id;
  }
  function updateCustomTab(id, patch) {
    setCustomTabs(ts => ts.map(t => t.id === id ? { ...t, ...patch } : t));
    markSaving();
  }
  function removeCustomTab(id) {
    setCustomTabs(ts => ts.filter(t => t.id !== id));
    setRouteState(r => r.tab === id ? { tab: "dashboard" } : r);
    markSaving();
  }
  function toggleHiddenTab(id) {
    setHiddenTabs(arr => arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]);
  }

  const store = {
    identity, signIn, signOut,
    projects, updateProject, addProject, deleteProject,
    route, setRoute,
    viewMode, setViewMode,
    filter, setFilter,
    saveStatus, sync, syncing, lastSynced,
    customTabs, addCustomTab, updateCustomTab, removeCustomTab,
    hiddenTabs, toggleHiddenTab,
    openTabSettings: () => setTabSettingsOpen(true),
    closeTabSettings: () => setTabSettingsOpen(false)
  };

  // ---- identity gate ----
  if (!identity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
        <IdentityModal onSubmit={signIn} />
      </div>
    );
  }

  // ---- routing ----
  let body;
  const customTab = customTabs.find(t => t.id === route.tab);
  if (route.tab === "dashboard") body = <DashboardView />;
  else if (route.tab === "kanban") body = <KanbanView />;
  else if (route.tab === "brief") body = <WeeklyBriefView />;
  else if (route.tab === "decisions") body = <DecisionsLogView />;
  else if (route.tab === "project" || route.projectId) body = <ProjectDetailView />;
  else if (customTab) body = <CustomTabView tab={customTab} />;
  else body = <DashboardView />;

  return (
    <StoreCtx.Provider value={store}>
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-30">
          <TopBar />
          <Tabs />
        </header>
        <main className="flex-1">{body}</main>
        {tabSettingsOpen && <TabSettingsModal onClose={() => setTabSettingsOpen(false)} />}
      </div>
    </StoreCtx.Provider>
  );
}

window.App = App;
window.useStore = useStore;
window.useClickOutside = useClickOutside;
window.Icon = Icon;
