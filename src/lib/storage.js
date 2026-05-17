// Storage abstraction — uses Supabase when configured, falls back to localStorage
import { supabase, isSupabaseEnabled } from './supabase'
import { initialProjects } from '../data'

// localStorage helpers
function loadLS(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback }
}
function saveLS(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

// ---- Projects ----
export async function loadProjects() {
  if (isSupabaseEnabled) {
    const { data, error } = await supabase.from('projects').select('*').order('created_at')
    if (error) { console.error('Supabase load error:', error); return loadLS('gtm.projects', initialProjects) }
    if (data && data.length > 0) return data.map(fromDbProject)
    // Seed initial data
    await seedProjects(initialProjects)
    return initialProjects
  }
  return loadLS('gtm.projects', initialProjects)
}

export async function upsertProject(project) {
  if (isSupabaseEnabled) {
    const { error } = await supabase.from('projects').upsert(toDbProject(project))
    if (error) console.error('Supabase upsert error:', error)
  } else {
    // localStorage handled by the store
  }
}

export async function removeProject(id) {
  if (isSupabaseEnabled) {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) console.error('Supabase delete error:', error)
  }
}

async function seedProjects(projects) {
  if (!isSupabaseEnabled) return
  const rows = projects.map(toDbProject)
  const { error } = await supabase.from('projects').insert(rows)
  if (error) console.error('Supabase seed error:', error)
}

// ---- Custom tabs ----
export async function loadCustomTabs() {
  if (isSupabaseEnabled) {
    const { data, error } = await supabase.from('custom_tabs').select('*').order('created_at')
    if (error) { console.error('Supabase tabs load error:', error); return loadLS('gtm.customTabs', []) }
    return (data || []).map(fromDbTab)
  }
  return loadLS('gtm.customTabs', [])
}

export async function upsertCustomTab(tab) {
  if (isSupabaseEnabled) {
    const { error } = await supabase.from('custom_tabs').upsert(toDbTab(tab))
    if (error) console.error('Supabase tab upsert error:', error)
  }
}

export async function removeCustomTab(id) {
  if (isSupabaseEnabled) {
    const { error } = await supabase.from('custom_tabs').delete().eq('id', id)
    if (error) console.error('Supabase tab delete error:', error)
  }
}

// ---- Real-time subscriptions ----
export function subscribeToProjects(onInsertOrUpdate, onDelete) {
  if (!isSupabaseEnabled) return () => {}
  const channel = supabase
    .channel('projects-changes')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'projects' },
      (payload) => onInsertOrUpdate(fromDbProject(payload.new)))
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'projects' },
      (payload) => onInsertOrUpdate(fromDbProject(payload.new)))
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'projects' },
      (payload) => onDelete(payload.old.id))
    .subscribe()
  return () => supabase.removeChannel(channel)
}

export function subscribeToCustomTabs(onInsertOrUpdate, onDelete) {
  if (!isSupabaseEnabled) return () => {}
  const channel = supabase
    .channel('tabs-changes')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'custom_tabs' },
      (payload) => onInsertOrUpdate(fromDbTab(payload.new)))
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'custom_tabs' },
      (payload) => onInsertOrUpdate(fromDbTab(payload.new)))
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'custom_tabs' },
      (payload) => onDelete(payload.old.id))
    .subscribe()
  return () => supabase.removeChannel(channel)
}

// ---- DB ↔ app object mapping ----
// Supabase uses snake_case columns; our app uses camelCase

function toDbProject(p) {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    owner: p.owner,
    sponsor: p.sponsor || '',
    rag: p.rag,
    priority: p.priority,
    stage: p.stage,
    score: p.score,
    target: p.target || 'TBD',
    updated: p.updated || 'just now',
    updated_days: p.updatedDays ?? 0,
    focus: !!p.focus,
    decision: !!p.decision,
    business_case: p.businessCase || '',
    rag_reason: p.ragReason || '',
    success_metrics: p.successMetrics || '',
    est_cost: p.estCost || '',
    revenue_impact: p.revenueImpact || '',
    stakeholders: p.stakeholders || [],
    ask_text: p.askText || '',
    ask_recommendation: p.askRecommendation || '',
    next_actions: p.nextActions || [],
    blockers: p.blockers || [],
    dependencies: p.dependencies || [],
    risks: p.risks || [],
    scoring: p.scoring || { revenueImpact: 5, strategicFit: 5, riskIfDelayed: 5, timeToValue: 5, effort: 5 },
    decisions: p.decisions || [],
    comments: p.comments || []
  }
}

function fromDbProject(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    owner: row.owner,
    sponsor: row.sponsor || '',
    rag: row.rag,
    priority: row.priority,
    stage: row.stage,
    score: row.score,
    target: row.target || 'TBD',
    updated: row.updated || 'just now',
    updatedDays: row.updated_days ?? 0,
    focus: !!row.focus,
    decision: !!row.decision,
    businessCase: row.business_case || '',
    ragReason: row.rag_reason || '',
    successMetrics: row.success_metrics || '',
    estCost: row.est_cost || '',
    revenueImpact: row.revenue_impact || '',
    stakeholders: Array.isArray(row.stakeholders) ? row.stakeholders : [],
    askText: row.ask_text || '',
    askRecommendation: row.ask_recommendation || '',
    nextActions: Array.isArray(row.next_actions) ? row.next_actions : [],
    blockers: Array.isArray(row.blockers) ? row.blockers : [],
    dependencies: Array.isArray(row.dependencies) ? row.dependencies : [],
    risks: Array.isArray(row.risks) ? row.risks : [],
    scoring: row.scoring || { revenueImpact: 5, strategicFit: 5, riskIfDelayed: 5, timeToValue: 5, effort: 5 },
    decisions: Array.isArray(row.decisions) ? row.decisions : [],
    comments: Array.isArray(row.comments) ? row.comments : []
  }
}

function toDbTab(t) {
  return {
    id: t.id,
    label: t.label,
    view: t.view || 'kanban',
    group_by: t.groupBy || 'priority',
    sort: t.sort || 'score',
    hide_empty_columns: !!t.hideEmptyColumns,
    card_fields: t.cardFields || [],
    manual: t.manual || {},
    filters: t.filters || {}
  }
}

function fromDbTab(row) {
  return {
    id: row.id,
    label: row.label,
    view: row.view || 'kanban',
    groupBy: row.group_by || 'priority',
    sort: row.sort || 'score',
    hideEmptyColumns: !!row.hide_empty_columns,
    cardFields: Array.isArray(row.card_fields) ? row.card_fields : [],
    manual: row.manual || {},
    filters: row.filters || {}
  }
}

// localStorage sync helpers (used when Supabase not configured)
export { loadLS, saveLS }
