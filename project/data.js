// Data + helpers for GTM Project Planner

window.gtmInitialProjects = [
  // === SALES TOOLING ===
  {
    id: "p-aircall",
    name: "Aircall dialer rollout",
    category: "Sales tooling",
    owner: "Shivani",
    sponsor: "",
    rag: "amber", priority: "high", stage: "Trial", score: 82,
    target: "TBD", updated: "2h ago", updatedDays: 0,
    focus: true, decision: false,
    businessCase: "Replace the patchwork of Dialpad/manual dialing across BDR + AE teams. Targeting 30% lift in connect rate, 2× outbound activity, full Salesforce sync for call analytics.",
    ragReason: "",
    successMetrics: "Connect rate ≥ 18% (baseline 13%). Outbound calls/AE/day ≥ 60 (baseline 31). Salesforce call activity logged on > 95% of attempts.",
    estCost: "",
    revenueImpact: "",
    stakeholders: [],
    askText: "",
    askRecommendation: "",
    nextActions: [],
    blockers: [], dependencies: [], risks: [],
    scoring: { revenueImpact: 8, strategicFit: 7, riskIfDelayed: 9, timeToValue: 8, effort: 5 },
    decisions: [],
    comments: []
  },
  {
    id: "p-chilipiper",
    name: "Chili Piper deployment for PSMs",
    category: "Sales tooling", owner: "Shivani", sponsor: "",
    rag: "green", priority: "medium", stage: "Rollout", score: 58,
    target: "TBD", updated: "1d ago", updatedDays: 1,
    focus: true, decision: false,
    businessCase: "Inbound demo requests currently hand-routed by ops, average 6h response. Chili Piper auto-routes by territory + segment to drop time-to-first-touch under 10 min. Phase 1 covers Partner Success Managers (PSM).",
    ragReason: "",
    successMetrics: "Time-to-first-touch ≤ 10 min (baseline 6h). Routing accuracy ≥ 95%.",
    estCost: "", revenueImpact: "",
    stakeholders: [],
    askText: "", askRecommendation: "",
    nextActions: [],
    blockers: [], dependencies: [], risks: [],
    scoring: { revenueImpact: 6, strategicFit: 6, riskIfDelayed: 4, timeToValue: 9, effort: 3 },
    decisions: [], comments: []
  },
  {
    id: "p-6sense",
    name: "6sense intent signals",
    category: "Sales tooling", owner: "Shivani", sponsor: "",
    rag: "green", priority: "medium", stage: "Pilot", score: 62,
    target: "TBD", updated: "3h ago", updatedDays: 0,
    focus: false, decision: false,
    businessCase: "Surface in-market accounts to BDRs using 6sense intent + Bombora keyword signals. Pilot scoped to UK enterprise tier; goal is +25% top-of-funnel meeting rate for accounts flagged 'Decision' or 'Purchase' stage.",
    ragReason: "",
    successMetrics: "Meeting rate on intent-flagged accounts ≥ 4× cold baseline. BDR adoption ≥ 80% weekly.",
    estCost: "", revenueImpact: "",
    stakeholders: [],
    askText: "", askRecommendation: "",
    nextActions: [],
    blockers: [], dependencies: [], risks: [],
    scoring: { revenueImpact: 7, strategicFit: 7, riskIfDelayed: 4, timeToValue: 6, effort: 5 },
    decisions: [], comments: []
  },
  {
    id: "p-salesnav",
    name: "LinkedIn Sales Nav enterprise rollout",
    category: "Sales tooling", owner: "Shivani", sponsor: "",
    rag: "red", priority: "medium", stage: "Evaluation", score: 54,
    target: "TBD", updated: "1d ago", updatedDays: 1,
    focus: false, decision: false,
    businessCase: "Existing Sales Nav individual licenses (32 seats, ad-hoc purchasing). LinkedIn proposed an enterprise contract that consolidates billing, adds team analytics, and lifts the InMail cap — but at +68% cost.",
    ragReason: "",
    successMetrics: "Cost-per-seat ≤ current $1,250/seat. Team analytics + admin console live by Jul 1.",
    estCost: "",
    revenueImpact: "",
    stakeholders: [],
    askText: "",
    askRecommendation: "",
    nextActions: [],
    blockers: [], dependencies: [], risks: [],
    scoring: { revenueImpact: 5, strategicFit: 5, riskIfDelayed: 8, timeToValue: 7, effort: 3 },
    decisions: [], comments: []
  },
  {
    id: "p-dealhub",
    name: "DealHub CPQ evaluation",
    category: "Sales tooling", owner: "Shivani", sponsor: "",
    rag: "amber", priority: "medium", stage: "Evaluation", score: 71,
    target: "TBD", updated: "4h ago", updatedDays: 0,
    focus: false, decision: false,
    businessCase: "Current Salesforce CPQ workflow is brittle — multi-product quotes take 40+ min and error rate on tiering is ~12%. Evaluating DealHub vs Salesforce CPQ+ vs status quo with finance and legal in the loop.",
    ragReason: "",
    successMetrics: "Quote build time ≤ 12 min. Tiering error rate < 2%. Finance + legal sign-off on contract templates.",
    estCost: "",
    revenueImpact: "",
    stakeholders: [],
    askText: "",
    askRecommendation: "",
    nextActions: [],
    blockers: [], dependencies: [], risks: [],
    scoring: { revenueImpact: 7, strategicFit: 7, riskIfDelayed: 6, timeToValue: 5, effort: 7 },
    decisions: [],
    comments: []
  },

  // === AI AGENTS ===
  {
    id: "p-scoring",
    name: "Prospect scoring agent",
    category: "AI / agents", owner: "Shivani", sponsor: "",
    rag: "green", priority: "high", stage: "Discovery", score: 88,
    target: "TBD", updated: "6h ago", updatedDays: 0,
    focus: true, decision: false,
    businessCase: "LLM-powered scoring that augments the existing Marketo lead score with firmographic + tech-stack + intent signals. Aiming for a 2× lift in MQL → SQL conversion on the top tercile. Spike with Claude Sonnet underway.",
    ragReason: "",
    successMetrics: "MQL → SQL conversion lift 2× on top tercile. Cost per scored lead ≤ $0.04.",
    estCost: "",
    revenueImpact: "",
    stakeholders: [],
    askText: "",
    askRecommendation: "",
    nextActions: [],
    blockers: [], dependencies: [], risks: [],
    scoring: { revenueImpact: 9, strategicFit: 8, riskIfDelayed: 6, timeToValue: 6, effort: 5 },
    decisions: [],
    comments: []
  },
  {
    id: "p-prospecting",
    name: "Custom prospecting agent",
    category: "AI / agents", owner: "Shivani", sponsor: "",
    rag: "green", priority: "high", stage: "Discovery", score: 84,
    target: "TBD", updated: "1d ago", updatedDays: 1,
    focus: false, decision: false,
    businessCase: "Per-BDR agent that drafts opening sequences using account context pulled from Clay + LinkedIn + Gong call notes. Goal: replace generic templates with personalised drafts approved in under 2 min per account.",
    ragReason: "",
    successMetrics: "Drafts approved in ≤ 2 min/account. Reply rate ≥ 2× current template baseline.",
    estCost: "", revenueImpact: "",
    stakeholders: [],
    askText: "", askRecommendation: "",
    nextActions: [],
    blockers: [], dependencies: [], risks: [],
    scoring: { revenueImpact: 8, strategicFit: 9, riskIfDelayed: 5, timeToValue: 4, effort: 6 },
    decisions: [], comments: []
  },
  {
    id: "p-gong",
    name: "Gong vs Claude deal intelligence",
    category: "AI / agents", owner: "Shivani", sponsor: "",
    rag: "amber", priority: "medium", stage: "Discovery", score: 66,
    target: "TBD", updated: "5d ago", updatedDays: 5,
    focus: false, decision: false,
    businessCase: "Existing Gong contract renews in Q3 at +24%. Evaluating whether a Claude-based pipeline (transcripts → call coaching + deal risk signals) gets us 70% of the value at 30% of the cost. Tradeoff: integration lift + recording capture story.",
    ragReason: "",
    successMetrics: "Cost ≤ 40% of Gong renewal. Coaching insight parity on 80% of categories.",
    estCost: "",
    revenueImpact: "",
    stakeholders: [],
    askText: "",
    askRecommendation: "",
    nextActions: [],
    blockers: [], dependencies: [], risks: [],
    scoring: { revenueImpact: 6, strategicFit: 6, riskIfDelayed: 8, timeToValue: 4, effort: 7 },
    decisions: [], comments: []
  },
  {
    id: "p-callsummary",
    name: "AI call summary agent",
    category: "AI / agents", owner: "Shivani", sponsor: "",
    rag: "green", priority: "medium", stage: "Discovery", score: 58,
    target: "TBD", updated: "2d ago", updatedDays: 2,
    focus: false, decision: false,
    businessCase: "Post-call summary + next-step extraction emailed to AE within 5 minutes of call end. Auto-creates Salesforce activity + next-action task. Replaces manual AE post-call admin (~15 min/call).",
    ragReason: "",
    successMetrics: "AE post-call admin time ≤ 3 min. Next-step accuracy ≥ 80% (sample audit).",
    estCost: "",
    revenueImpact: "",
    stakeholders: [],
    askText: "", askRecommendation: "",
    nextActions: [],
    blockers: [], dependencies: [], risks: [],
    scoring: { revenueImpact: 6, strategicFit: 7, riskIfDelayed: 4, timeToValue: 5, effort: 4 },
    decisions: [], comments: []
  },
  {
    id: "p-renewal",
    name: "Renewal predictor (CS AI)",
    category: "AI / agents", owner: "Shivani", sponsor: "",
    rag: "amber", priority: "high", stage: "Discovery", score: 72,
    target: "TBD", updated: "4d ago", updatedDays: 4,
    focus: false, decision: false,
    businessCase: "LLM model that predicts renewal risk 90 days out, using product usage + support tickets + CSM call notes. Goal: flag at-risk renewals while there's still time to intervene.",
    ragReason: "",
    successMetrics: "≥ 75% precision on at-risk renewals 90 days out. Time-to-flag earlier than current CSM gut-feel by ≥ 30 days.",
    estCost: "",
    revenueImpact: "",
    stakeholders: [],
    askText: "",
    askRecommendation: "",
    nextActions: [],
    blockers: [], dependencies: [], risks: [],
    scoring: { revenueImpact: 9, strategicFit: 8, riskIfDelayed: 7, timeToValue: 4, effort: 6 },
    decisions: [], comments: []
  },

  // === OUTBOUND ===
  {
    id: "p-outreach",
    name: "Outreach → Apollo migration",
    category: "Outbound", owner: "Shivani", sponsor: "",
    rag: "amber", priority: "medium", stage: "Evaluation", score: 64,
    target: "TBD", updated: "1d ago", updatedDays: 1,
    focus: false, decision: false,
    businessCase: "Outreach renews Q3 at +31%. Apollo's combined sequencer + data platform is 45% cheaper and consolidates the BDR data stack. Tradeoff: deliverability stats are slightly weaker on Apollo, AB testing needed.",
    ragReason: "",
    successMetrics: "≤ 5% reply-rate gap vs Outreach. Migration in ≤ 4 weeks.",
    estCost: "",
    revenueImpact: "",
    stakeholders: [],
    askText: "",
    askRecommendation: "",
    nextActions: [],
    blockers: [], dependencies: [], risks: [],
    scoring: { revenueImpact: 6, strategicFit: 6, riskIfDelayed: 7, timeToValue: 5, effort: 6 },
    decisions: [], comments: []
  },
  {
    id: "p-champion",
    name: "Champion tracker in HubSpot",
    category: "Outbound", owner: "Shivani", sponsor: "",
    rag: "green", priority: "low", stage: "Pilot", score: 38,
    target: "TBD", updated: "3d ago", updatedDays: 3,
    focus: false, decision: false,
    businessCase: "Custom HubSpot object to track champions across job moves and re-engage when they land somewhere new. Pilot with top 3 AEs and 200 historical champions.",
    ragReason: "",
    successMetrics: "Re-engaged meetings per quarter ≥ 8. Match rate ≥ 12%.",
    estCost: "",
    revenueImpact: "",
    stakeholders: [],
    askText: "", askRecommendation: "",
    nextActions: [],
    blockers: [], dependencies: [], risks: [],
    scoring: { revenueImpact: 3, strategicFit: 4, riskIfDelayed: 2, timeToValue: 6, effort: 3 },
    decisions: [], comments: []
  },
  {
    id: "p-reachdesk",
    name: "Reachdesk gifting + ROI tracking",
    category: "Field marketing", owner: "Shivani", sponsor: "",
    rag: "green", priority: "medium", stage: "Pilot", score: 64,
    target: "TBD", updated: "yesterday", updatedDays: 1,
    focus: false, decision: false,
    businessCase: "Stand up direct mail sequences for top-50 target accounts. Track redemption → meeting → pipeline conversion. Pilot scoped to UK enterprise segment, Q3 expansion contingent on cost-per-meeting under £180.",
    ragReason: "",
    successMetrics: "Cost-per-meeting ≤ £180. Wave-1 redemption ≥ 30%. Pipeline attributable ≥ £600k by end Q3.",
    estCost: "", revenueImpact: "",
    stakeholders: [],
    askText: "",
    askRecommendation: "",
    nextActions: [],
    blockers: [], dependencies: [], risks: [],
    scoring: { revenueImpact: 6, strategicFit: 5, riskIfDelayed: 4, timeToValue: 7, effort: 4 },
    decisions: [], comments: []
  },

  // === CUSTOMER SUCCESS ===
  {
    id: "p-onboarding",
    name: "Customer onboarding playbook v2",
    category: "Customer success", owner: "Shivani", sponsor: "",
    rag: "green", priority: "high", stage: "Rollout", score: 76,
    target: "TBD", updated: "1d ago", updatedDays: 1,
    focus: true, decision: false,
    businessCase: "Reduce time-to-first-value from 38 → 21 days by templating the first-30-days journey. Phase 1 covers new logo onboarding; phase 2 covers expansion.",
    ragReason: "",
    successMetrics: "Time-to-first-value ≤ 21 days median. CSAT at 30-day mark ≥ 8.5.",
    estCost: "", revenueImpact: "",
    stakeholders: [],
    askText: "", askRecommendation: "",
    nextActions: [],
    blockers: [], dependencies: [], risks: [],
    scoring: { revenueImpact: 7, strategicFit: 8, riskIfDelayed: 5, timeToValue: 7, effort: 4 },
    decisions: [], comments: []
  },
  {
    id: "p-cshealth",
    name: "CS health score model",
    category: "Customer success", owner: "Shivani", sponsor: "",
    rag: "green", priority: "medium", stage: "Pilot", score: 56,
    target: "TBD", updated: "2d ago", updatedDays: 2,
    focus: false, decision: false,
    businessCase: "Composite score combining product usage, support ticket velocity, sentiment, and NPS to power CSM weekly account review. Phase 1 pilot with mid-market segment.",
    ragReason: "",
    successMetrics: "Score correlates with churn (r > 0.6 on 12-month look-back). CSM trust rating ≥ 7/10 in survey.",
    estCost: "", revenueImpact: "",
    stakeholders: [],
    askText: "", askRecommendation: "",
    nextActions: [],
    blockers: [], dependencies: [], risks: [],
    scoring: { revenueImpact: 6, strategicFit: 7, riskIfDelayed: 3, timeToValue: 6, effort: 5 },
    decisions: [], comments: []
  },

  // === SALES ENABLEMENT ===
  {
    id: "p-geomapper",
    name: "Geomapper",
    category: "Sales enablement", owner: "Shivani", sponsor: "",
    rag: "green", priority: "medium", stage: "Discovery", score: 49,
    target: "TBD", updated: "3d ago", updatedDays: 3,
    focus: false, decision: false,
    businessCase: "Internal tool concept — visual map layer over Salesforce data to help AEs identify whitespace clusters and route plan customer visits. Discovery interviews with 6 AEs scheduled this week.",
    ragReason: "",
    successMetrics: "Tool used by ≥ 70% of AEs weekly. Whitespace meetings booked +20%.",
    estCost: "", revenueImpact: "",
    stakeholders: [],
    askText: "", askRecommendation: "",
    nextActions: [],
    blockers: [], dependencies: [], risks: [],
    scoring: { revenueImpact: 5, strategicFit: 5, riskIfDelayed: 3, timeToValue: 5, effort: 6 },
    decisions: [], comments: []
  },

  // === DATA / OPS ===
  {
    id: "p-clay",
    name: "Clay enrichment",
    category: "Data / ops", owner: "Shivani", sponsor: "",
    rag: "unknown", priority: "low", stage: "Paused", score: 22,
    target: "TBD", updated: "18d ago", updatedDays: 18,
    focus: false, decision: false,
    businessCase: "Account-level enrichment for outbound lists — was running as a Q1 pilot, paused pending custom prospecting agent direction. Re-evaluate dependency before Q3 planning lock.",
    ragReason: "",
    successMetrics: "TBD on un-pause", estCost: "", revenueImpact: "",
    stakeholders: [],
    askText: "", askRecommendation: "",
    nextActions: [],
    blockers: [], dependencies: [], risks: [],
    scoring: { revenueImpact: 3, strategicFit: 3, riskIfDelayed: 2, timeToValue: 3, effort: 3 },
    decisions: [], comments: []
  }
];

window.gtmStages = ["Discovery", "Evaluation", "Trial", "Pilot", "Rollout", "Paused"];
window.gtmRags = ["green", "amber", "red", "unknown"];
window.gtmPriorities = ["high", "medium", "low"];
window.gtmCategories = ["Sales tooling", "AI / agents", "Outbound", "Customer success", "Field marketing", "Sales enablement", "Revenue ops", "Data / ops"];
window.gtmOwners = ["Shivani", "Marcus K.", "Priya R.", "Daniel H.", "Lila T.", "Aisha P.", "Mira S."];

window.ragMeta = {
  green:   { dot: "#10B981", chipBg: "#ECFDF5", chipText: "#047857", label: "Green",   border: "rag-green",   severity: 2 },
  amber:   { dot: "#F59E0B", chipBg: "#FFFBEB", chipText: "#B45309", label: "Amber",   border: "rag-amber",   severity: 1 },
  red:     { dot: "#F43F5E", chipBg: "#FFF1F2", chipText: "#BE123C", label: "Red",     border: "rag-red",     severity: 0 },
  unknown: { dot: "#94A3B8", chipBg: "#F1F5F9", chipText: "#475569", label: "Unknown", border: "rag-unknown", severity: 3 }
};
window.priorityMeta = {
  high:   { bg: "#E0E7FF", text: "#3730A3", label: "High",   order: 0 },
  medium: { bg: "#E2E8F0", text: "#334155", label: "Medium", order: 1 },
  low:    { bg: "#F1F5F9", text: "#64748B", label: "Low",    order: 2 }
};

window.gtmCardFields = [
  { id: "stage",    label: "Stage",    defaultOn: true },
  { id: "rag",      label: "RAG",      defaultOn: true },
  { id: "priority", label: "Priority", defaultOn: true },
  { id: "decision", label: "Decision badge", defaultOn: true },
  { id: "owner",    label: "Owner",    defaultOn: true },
  { id: "score",    label: "Score",    defaultOn: true },
  { id: "target",   label: "Target date", defaultOn: false },
  { id: "category", label: "Category", defaultOn: false },
  { id: "updated",  label: "Last updated", defaultOn: false },
  { id: "summary",  label: "Business case (1 line)", defaultOn: false }
];
window.gtmDefaultCardFields = window.gtmCardFields.filter(f => f.defaultOn).map(f => f.id);

// ISO week number (Mon-start, 1-53)
window.isoWeek = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

// Mon–Sun range covering the given date
window.weekRange = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMon);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { monday, sunday };
};

window.fmtWeekRange = (date) => {
  const { monday, sunday } = window.weekRange(date);
  const sameMonth = monday.getMonth() === sunday.getMonth();
  const monStr = monday.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
  const sunStr = sameMonth
    ? sunday.toLocaleDateString("en-GB", { day: "numeric" })
    : sunday.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
  const year = sunday.getFullYear();
  return `${monStr} – ${sunStr}, ${year}`;
};

window.fmtWeekLabel = (date) => {
  const wk = window.isoWeek(date);
  const yr = date.getFullYear() % 100;
  return `Week ${wk} of FY${String(yr).padStart(2, "0")}`;
};
window.fmtDate = (iso) => {
  if (!iso || iso === "TBD") return "TBD";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

// computed priority score (0–100) from 5-dimension scoring
window.computeScore = (s) => {
  if (!s) return 0;
  // Weighted: revenue x3, strategic x2, risk x2, time x1, effort -2
  const raw = (s.revenueImpact || 0) * 3
            + (s.strategicFit || 0) * 2
            + (s.riskIfDelayed || 0) * 2
            + (s.timeToValue || 0) * 1
            - (s.effort || 0) * 2;
  // max raw ≈ 80, min ≈ -20 → map to 0..100
  return Math.max(0, Math.min(100, Math.round(((raw + 20) / 100) * 100)));
};

// sort comparator for dashboard: focus → RAG severity → asks → priority → score
window.dashboardSort = (a, b) => {
  if (a.focus !== b.focus) return a.focus ? -1 : 1;
  const sa = window.ragMeta[a.rag].severity, sb = window.ragMeta[b.rag].severity;
  if (sa !== sb) return sa - sb;
  if (!!a.decision !== !!b.decision) return a.decision ? -1 : 1;
  const pa = window.priorityMeta[a.priority].order, pb = window.priorityMeta[b.priority].order;
  if (pa !== pb) return pa - pb;
  return b.score - a.score;
};
