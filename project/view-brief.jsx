// Weekly Brief (Exec + Ops) + Decisions Log (cross-project activity)
const { useMemo: useMemoB, useState: useStateB } = React;

function WeeklyBriefView() {
  const { viewMode } = useStore();
  return viewMode === "ops" ? <OpsBrief /> : <ExecBrief />;
}

// ============================================================================
// EXEC brief
// ============================================================================
function ExecBrief() {
  const { projects, setViewMode } = useStore();
  const [refreshing, setRefreshing] = useStateB(false);
  const [generatedAt, setGeneratedAt] = useStateB("8:42 AM");

  function regenerate() {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setGeneratedAt(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
    }, 1100);
  }

  const stats = useMemoB(() => {
    const c = { green: 0, amber: 0, red: 0, unknown: 0, decision: 0, focus: 0, stalled: 0 };
    projects.forEach(p => {
      c[p.rag]++;
      if (p.decision) c.decision++;
      if (p.focus) c.focus++;
      if ((p.updatedDays ?? 0) >= 14) c.stalled++;
    });
    return c;
  }, [projects]);

  const topMoves = useMemoB(() => projects
    .filter(p => (p.updatedDays ?? 99) <= 3 && p.rag !== "red")
    .sort((a, b) => b.score - a.score)
    .slice(0, 3), [projects]);

  const decisions = useMemoB(() => projects.filter(p => p.decision), [projects]);
  const risks = useMemoB(() => projects.filter(p => p.rag === "amber" || p.rag === "red"), [projects]);

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8" data-screen-label="04 Weekly Brief Exec">
      <Header title="Weekly brief — Exec" generatedAt={generatedAt} refreshing={refreshing} onRegenerate={regenerate}
        switchTo={() => setViewMode("ops")} switchLabel="Switch to Ops brief" />

      <div className="flex flex-col gap-4">
        <BriefCard icon="layout-dashboard" title="Portfolio snapshot" tone="slate">
          <p className="text-[14px] leading-relaxed text-slate-700">
            <span className="font-semibold">{projects.length} projects</span> active across GTM. <span className="text-emerald-700 font-semibold">{stats.green} on track</span>, <span className="text-amber-700 font-semibold">{stats.amber} at risk</span>, <span className="text-rose-700 font-semibold">{stats.red} blocked</span>, <span className="text-slate-600 font-semibold">{stats.unknown} needing update</span>. <span className="font-semibold">{stats.focus} pinned</span> as focus, <span className="font-semibold">{stats.decision} decisions</span> awaiting leadership.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Stat label="On track" value={stats.green} colorBg="bg-emerald-50" colorText="text-emerald-700" />
            <Stat label="At risk"  value={stats.amber} colorBg="bg-amber-50"   colorText="text-amber-700" />
            <Stat label="Blocked"  value={stats.red}   colorBg="bg-rose-50"    colorText="text-rose-700" />
            <Stat label="Unknown"  value={stats.unknown} colorBg="bg-slate-100" colorText="text-slate-600" />
            <Stat label="Decisions" value={stats.decision} colorBg="bg-indigo-50" colorText="text-indigo-700" />
          </div>
        </BriefCard>

        <BriefCard icon="trending-up" title="Top moves forward this week" tone="emerald">
          <ul className="flex flex-col gap-2.5">
            {topMoves.length === 0 && <li className="text-[13px] text-slate-500">No notable moves logged in the last 7 days.</li>}
            {topMoves.map(p => (
              <li key={p.id} className="flex items-start gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                <div className="text-[13px]">
                  <span className="font-semibold">{p.name}</span>
                  <span className="text-slate-500"> ({p.stage}, {p.owner}).</span>
                  <span className="text-slate-600"> {firstSentence(p.businessCase)}</span>
                </div>
              </li>
            ))}
          </ul>
        </BriefCard>

        <BriefCard icon="git-pull-request-draft" title="Decisions needed from leadership" tone="indigo">
          {decisions.length === 0 ? (
            <p className="text-[13px] text-indigo-900/80">No decisions pending exec review.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {decisions.map(p => (
                <li key={p.id} className="bg-white/70 border border-indigo-200/70 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold text-indigo-900">{p.name}</div>
                    </div>
                    <span className="text-[11px] font-medium text-indigo-700 bg-white border border-indigo-200 rounded-full px-2 py-0.5 whitespace-nowrap shrink-0">
                      by {window.fmtDate(p.target)}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-[12px]">
                    <div>
                      <span className="text-indigo-700/70 font-medium">Ask:</span>{" "}
                      <span className="text-indigo-900/90">{p.askText || "Decision required — see project detail."}</span>
                    </div>
                    <div>
                      <span className="text-indigo-700/70 font-medium">Shivani's rec:</span>{" "}
                      <span className="text-indigo-900/90">{p.askRecommendation || "—"}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </BriefCard>

        <BriefCard icon="triangle-alert" title="Risks to flag" tone="amber">
          {risks.length === 0 ? (
            <p className="text-[13px] text-slate-600">No active risks.</p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {risks.map(p => (
                <li key={p.id} className="flex items-start gap-3">
                  <span className="h-1.5 w-1.5 rounded-full mt-2 shrink-0" style={{ background: window.ragMeta[p.rag].dot }}></span>
                  <div className="text-[13px]">
                    <span className="font-semibold">{p.name}</span>
                    <span className="text-slate-500"> · {window.ragMeta[p.rag].label}.</span>
                    <span className="text-slate-600"> {p.ragReason || "—"}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </BriefCard>

        <div className="rounded-xl p-6 text-white relative overflow-hidden" style={{
          background: "linear-gradient(135deg, #4F46E5 0%, #6D28D9 50%, #9333EA 100%)"
        }}>
          <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10 blur-3xl"></div>
          <div className="relative">
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wider text-white/70 mb-2">
              <Icon name="sparkles" size={12} /> Strategic question
            </div>
            <h3 className="text-[20px] font-semibold tracking-tight leading-snug max-w-[640px]">
              We're investing heavily in AI agents (5 projects, ~30% of effort). Are we resourcing the underlying data + tooling layer (Clay, Gong path, recording capture) at the same pace, or building agents on sand?
            </h3>
            <p className="text-[13px] text-white/80 mt-3 max-w-[640px]">
              Recommended discussion at the Tuesday GTM review. Data-layer choices unblock both the prospecting agent and deal intelligence path.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// OPS brief
// ============================================================================
function OpsBrief() {
  const { projects, setRoute, setViewMode } = useStore();
  const [refreshing, setRefreshing] = useStateB(false);
  const [generatedAt, setGeneratedAt] = useStateB("8:42 AM");

  function regenerate() {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setGeneratedAt(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
    }, 1100);
  }

  const focus = useMemoB(() => projects.filter(p => p.focus).sort(window.dashboardSort), [projects]);
  const stalled = useMemoB(() => projects.filter(p => (p.updatedDays ?? 0) >= 14), [projects]);
  const deps = useMemoB(() => projects.filter(p => (p.dependencies || []).length > 0 || (p.blockers || []).length > 0).slice(0, 5), [projects]);

  // AI-generated lateral idea, grounded in current project state
  const [idea, setIdea] = useStateB("");
  const [ideaLoading, setIdeaLoading] = useStateB(false);
  const [ideaError, setIdeaError] = useStateB(false);

  async function generateIdea() {
    setIdeaLoading(true);
    setIdeaError(false);
    try {
      const context = projects.slice(0, 12).map(p =>
        `- ${p.name} [${p.category}] · ${p.stage} · RAG ${p.rag} · priority ${p.priority}${p.focus ? " · FOCUS" : ""}${p.decision ? " · decision-pending" : ""}${(p.updatedDays ?? 0) >= 14 ? " · stalled" : ""}`
      ).join("\n");
      const focusNames = focus.map(p => p.name).join(", ") || "(none pinned)";
      const stalledNames = stalled.map(p => p.name).join(", ") || "(none)";
      const prompt = `You are advising the GTM Operations Lead at Inforcer (an MSP-focused B2B SaaS company) on her weekly portfolio of projects. Generate ONE lateral, unexpected operational idea (1–2 sentences, max 220 chars) that connects two or more current projects in a non-obvious way, or sequences a piece of work to extract leverage. Be specific — use real project names from the list. No fluff, no "consider" / "think about". Direct, actionable, calm tone like a senior engineer's note.

PORTFOLIO (${projects.length} projects):
${context}

Focused this week: ${focusNames}
Stalled: ${stalledNames}

Output: just the idea text, no preamble.`;
      const text = await window.claude.complete(prompt);
      setIdea((text || "").trim().replace(/^["']|["']$/g, ""));
    } catch (e) {
      setIdeaError(true);
      setIdea("Could not generate an idea right now — try refresh in a moment.");
    } finally {
      setIdeaLoading(false);
    }
  }

  React.useEffect(() => { if (!idea && !ideaLoading) generateIdea(); /* eslint-disable-next-line */ }, []);

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8" data-screen-label="04 Weekly Brief Ops">
      <Header title="Weekly brief — Ops" generatedAt={generatedAt} refreshing={refreshing} onRegenerate={regenerate}
        switchTo={() => setViewMode("exec")} switchLabel="Switch to Exec brief" />

      <div className="flex flex-col gap-4">
        <BriefCard icon="star" title="Focus this week" tone="amber">
          {focus.length === 0 ? (
            <p className="text-[13px] text-slate-500">Nothing pinned to focus.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {focus.map(p => {
                const pr = window.priorityMeta[p.priority];
                const r = window.ragMeta[p.rag];
                return (
                  <li key={p.id} className="border border-slate-200 rounded-lg p-3 bg-white">
                    <button onClick={() => setRoute({ tab: "project", projectId: p.id })} className="text-left w-full">
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <div className="text-[13.5px] font-semibold">{p.name}</div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[11px] px-1.5 py-0.5 rounded font-medium" style={{ background: pr.bg, color: pr.text }}>{pr.label}</span>
                          <span className="text-[11px] px-1.5 py-0.5 rounded font-medium inline-flex items-center gap-1" style={{ background: r.chipBg, color: r.chipText }}>
                            <span className="h-1 w-1 rounded-full" style={{ background: r.dot }}></span>{r.label}
                          </span>
                          <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 tabular-nums font-medium">{p.score}</span>
                        </div>
                      </div>
                      <div className="text-[12.5px] text-slate-600 mb-2">{p.ragReason || firstSentence(p.businessCase)}</div>
                      {p.nextActions && p.nextActions[0] && (
                        <div className="text-[12px] inline-flex items-start gap-1.5 text-slate-700 bg-slate-50 border border-slate-100 rounded-md px-2 py-1">
                          <Icon name="arrow-right" size={12} className="mt-0.5 text-slate-400 shrink-0" />
                          <span><span className="text-slate-400 font-medium">Next:</span> {p.nextActions[0]}</span>
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </BriefCard>

        <BriefCard icon="hourglass" title="Stalled items (no update in 14+ days)" tone="rose">
          {stalled.length === 0 ? (
            <p className="text-[13px] text-slate-600">Nothing stalled — everything updated within 14 days.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {stalled.map(p => (
                <li key={p.id} className="flex items-start justify-between gap-3 text-[13px]">
                  <button onClick={() => setRoute({ tab: "project", projectId: p.id })} className="text-left flex-1 min-w-0 inline-flex items-start gap-2 hover:text-indigo-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mt-2 shrink-0"></span>
                    <span><span className="font-semibold">{p.name}</span> <span className="text-slate-500">· {p.owner}</span></span>
                  </button>
                  <span className="text-[11px] text-slate-400 tabular-nums shrink-0">{p.updated}</span>
                </li>
              ))}
            </ul>
          )}
        </BriefCard>

        <BriefCard icon="link" title="Dependency reminders" tone="indigo">
          {deps.length === 0 ? (
            <p className="text-[13px] text-slate-600">No active blockers or dependencies.</p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {deps.map(p => (
                <li key={p.id} className="text-[13px]">
                  <button onClick={() => setRoute({ tab: "project", projectId: p.id })} className="text-left w-full hover:text-indigo-600">
                    <span className="font-semibold">{p.name}</span>
                    <span className="text-slate-500"> · {p.owner}</span>
                  </button>
                  <div className="text-[12px] text-slate-600 mt-0.5 ml-0 flex flex-wrap gap-x-3 gap-y-0.5">
                    {(p.blockers || []).map((b, i) => <span key={"b"+i} className="inline-flex items-center gap-1"><span className="h-1 w-1 rounded-full bg-rose-400"></span>{b}</span>)}
                    {(p.dependencies || []).map((d, i) => <span key={"d"+i} className="inline-flex items-center gap-1"><span className="h-1 w-1 rounded-full bg-indigo-400"></span>{d}</span>)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </BriefCard>

        <div className="rounded-xl p-6 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0F766E 0%, #1E40AF 60%, #4338CA 100%)" }}>
          <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-3xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wider text-white/70">
                <Icon name="lightbulb" size={12} /> Lateral idea — generated from your portfolio
              </div>
              <button onClick={generateIdea} disabled={ideaLoading}
                className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[11.5px] disabled:opacity-60">
                <Icon name="refresh-cw" size={11} className={ideaLoading ? "animate-spin" : ""} />
                {ideaLoading ? "Thinking…" : "Refresh"}
              </button>
            </div>
            <p className={"text-[16px] font-medium leading-snug max-w-[640px] " + (ideaLoading ? "opacity-60" : "")}>
              {idea || "Thinking…"}
            </p>
            <p className="text-[12px] text-white/70 mt-2">
              {ideaError
                ? <span className="inline-flex items-center gap-1"><Icon name="alert-triangle" size={11} /> Couldn't reach Claude — refresh to retry.</span>
                : "Claude reads your current focus, stalled items, and decisions pending — then suggests one sequencing or pairing move you might miss."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Header({ title, generatedAt, refreshing, onRegenerate, switchTo, switchLabel }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
      <div>
        <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">{window.fmtWeekLabel(new Date())} · {window.fmtWeekRange(new Date())}</div>
        <h1 className="text-[22px] font-semibold tracking-tight">{title}</h1>
        <p className="text-[12px] text-slate-500 mt-1">Auto-generated · Last regenerated {generatedAt}</p>
      </div>
      <div className="flex items-center gap-2">
        <button className="btn-ghost" onClick={switchTo}>
          <Icon name="arrow-left-right" size={13} /> {switchLabel}
        </button>
        <button className="btn-ghost"><Icon name="copy" size={13} /> Copy</button>
        <button className="btn-primary" onClick={onRegenerate} disabled={refreshing}>
          <Icon name="refresh-cw" size={13} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Regenerating…" : "Regenerate"}
        </button>
      </div>
    </div>
  );
}

function BriefCard({ icon, title, tone, children }) {
  const toneMap = {
    slate:   { iconBg: "bg-slate-100",  iconColor: "text-slate-700",   ring: "" },
    emerald: { iconBg: "bg-emerald-50", iconColor: "text-emerald-700", ring: "" },
    indigo:  { iconBg: "bg-indigo-100", iconColor: "text-indigo-700",  ring: "bg-indigo-50/60 border-indigo-200/80" },
    amber:   { iconBg: "bg-amber-50",   iconColor: "text-amber-700",   ring: "" },
    rose:    { iconBg: "bg-rose-50",    iconColor: "text-rose-700",    ring: "" }
  };
  const t = toneMap[tone] || toneMap.slate;
  return (
    <section className={"rounded-xl p-5 " + (t.ring ? "border " + t.ring : "bg-white shadow-card")}>
      <div className="flex items-start gap-3">
        <div className={"h-8 w-8 rounded-md grid place-items-center shrink-0 " + t.iconBg}>
          <Icon name={icon} size={15} className={t.iconColor} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-semibold tracking-tight mb-2">{title}</h3>
          {children}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, colorBg, colorText }) {
  return (
    <span className={"inline-flex items-center gap-2 h-7 px-2.5 rounded-full text-[12px] " + colorBg + " " + colorText}>
      <span className="font-semibold tabular-nums">{value}</span>{label}
    </span>
  );
}

function firstSentence(text) {
  if (!text) return "";
  const m = text.match(/^[^.!?]+[.!?]/);
  return m ? m[0] : text.slice(0, 120) + "…";
}

// ============================================================================
// Decisions log (cross-project activity feed: decisions + comments)
// ============================================================================
function DecisionsLogView() {
  const { projects, setRoute } = useStore();
  const [filter, setFilter] = useStateB("all"); // all | pending | decisions | comments

  const pending = useMemoB(() => projects.filter(p => p.decision), [projects]);

  const feed = useMemoB(() => {
    const rows = [];
    projects.forEach(p => {
      (p.decisions || []).forEach(d => rows.push({ ...d, kind: "decision", project: p, sortKey: parseDate(d.date) }));
      (p.comments || []).forEach(c => rows.push({ ...c, kind: "comment", project: p, sortKey: parseWhen(c.when) }));
    });
    rows.sort((a, b) => b.sortKey - a.sortKey);
    return rows;
  }, [projects]);

  const filteredFeed = filter === "decisions" ? feed.filter(f => f.kind === "decision")
    : filter === "comments" ? feed.filter(f => f.kind === "comment")
    : feed;

  function parseDate(d) {
    const order = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const m = d && d.match(/(\d+)\s+(\w+)/);
    return m ? (order.indexOf(m[2]) * 31 + parseInt(m[1])) : -1;
  }
  function parseWhen(w) {
    if (!w) return -1;
    if (w === "now" || w === "just now") return 99999;
    const h = w.match(/^(\d+)h$/); if (h) return 90000 - parseInt(h[1]);
    const d = w.match(/^(\d+)d$/); if (d) return 50000 - parseInt(d[1]);
    if (w === "yesterday") return 49000;
    return parseDate(w);
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8" data-screen-label="05 Decisions log">
      <div className="mb-5 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Decisions log</h1>
          <p className="text-[13px] text-slate-500 mt-1">{feed.length} entries across {projects.length} projects · {pending.length} decisions awaiting exec</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button className={"chip " + (filter === "all" ? "active" : "")} onClick={() => setFilter("all")}>All <span className="chip-count tabular-nums">{feed.length}</span></button>
          <button className={"chip " + (filter === "decisions" ? "active" : "")} onClick={() => setFilter("decisions")}>Decisions <span className="chip-count tabular-nums">{feed.filter(f => f.kind === "decision").length}</span></button>
          <button className={"chip " + (filter === "comments" ? "active" : "")} onClick={() => setFilter("comments")}>Comments <span className="chip-count tabular-nums">{feed.filter(f => f.kind === "comment").length}</span></button>
        </div>
      </div>

      {pending.length > 0 && (
        <section className="mb-6">
          <h2 className="text-[12px] uppercase tracking-wider text-slate-500 mb-2 font-medium">Awaiting exec decision</h2>
          <div className="flex flex-col gap-2">
            {pending.map(p => (
              <button key={p.id} onClick={() => setRoute({ tab: "project", projectId: p.id })}
                className="card-hover text-left bg-indigo-50/60 border border-indigo-200/70 rounded-lg p-4 flex items-start gap-3">
                <div className="h-8 w-8 rounded-md bg-white border border-indigo-200 grid place-items-center text-indigo-600 shrink-0">
                  <Icon name="git-pull-request-draft" size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-indigo-900">{p.name}</div>
                  <div className="text-[12px] text-indigo-900/80 mt-0.5">{p.askText || "Decision required — see project detail."}</div>
                </div>
                <span className="text-[11px] text-indigo-700 bg-white border border-indigo-200 rounded-full px-2 py-0.5 shrink-0">by {window.fmtDate(p.target)}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-[12px] uppercase tracking-wider text-slate-500 mb-2 font-medium">Activity</h2>
        <div className="bg-white rounded-xl shadow-card divide-y divide-slate-100">
          {filteredFeed.length === 0 && <div className="p-5 text-[13px] text-slate-500">Nothing logged yet.</div>}
          {filteredFeed.map((f, i) => (
            <button key={f.kind + "-" + f.id + "-" + i} onClick={() => setRoute({ tab: "project", projectId: f.project.id })}
              className="w-full text-left p-4 grid grid-cols-[72px_28px_1fr_auto] gap-3 items-start hover:bg-slate-50">
              <div className="text-[12px] text-slate-400 tabular-nums pt-0.5">{f.date || f.when}</div>
              <div className="h-6 w-6 rounded-md grid place-items-center mt-0.5"
                   style={{ background: f.kind === "decision" ? "#EEF2FF" : "#F1F5F9", color: f.kind === "decision" ? "#4338CA" : "#475569" }}>
                <Icon name={f.kind === "decision" ? "git-branch" : "message-square"} size={12} />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] text-slate-800">{f.text}</div>
                <div className="text-[11px] text-slate-500 mt-1 inline-flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1"><Icon name="folder" size={11} /> {f.project.name}</span>
                  <span>·</span>
                  <span>{f.actor || f.who}</span>
                  {f.kind === "decision" && <><span>·</span><span className="text-indigo-600">Decision</span></>}
                </div>
              </div>
              <span className="text-slate-300 self-center"><Icon name="chevron-right" size={14} /></span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

window.WeeklyBriefView = WeeklyBriefView;
window.DecisionsLogView = DecisionsLogView;
