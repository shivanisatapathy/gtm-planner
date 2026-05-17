import { useState, useMemo, useRef, useEffect } from 'react'
import Icon from '../components/Icon'
import { useStore, useClickOutside } from '../App'
import { ragMeta, priorityMeta, gtmStages, gtmCardFields, defaultCardFields, dashboardSort, fmtDate } from '../data'

// ---- Group config ----
export function getKanbanGroupConfig(projects) {
  function stageDot(s) {
    return ({ Discovery: '#A855F7', Evaluation: '#6366F1', Trial: '#F59E0B', Pilot: '#0EA5E9', Rollout: '#10B981', Paused: '#94A3B8' })[s] || '#94A3B8'
  }
  const ownerSet = [...new Set(projects.map(p => p.owner).filter(Boolean))]
  const categorySet = [...new Set(projects.map(p => p.category).filter(Boolean))]
  return {
    stage:    { label: 'Stage',      keys: gtmStages,                      color: k => ({ bg: '#F1F5F9', text: '#0F172A', dot: stageDot(k) }) },
    priority: { label: 'Priority',   keys: ['high', 'medium', 'low'],      color: k => ({ high: { bg: '#E0E7FF', text: '#3730A3', dot: '#4F46E5' }, medium: { bg: '#E2E8F0', text: '#334155', dot: '#64748B' }, low: { bg: '#F1F5F9', text: '#64748B', dot: '#94A3B8' } })[k] },
    rag:      { label: 'RAG status', keys: ['green','amber','red','unknown'], color: k => ({ green: { bg: '#ECFDF5', text: '#047857', dot: '#10B981' }, amber: { bg: '#FFFBEB', text: '#B45309', dot: '#F59E0B' }, red: { bg: '#FFF1F2', text: '#BE123C', dot: '#F43F5E' }, unknown: { bg: '#F1F5F9', text: '#475569', dot: '#94A3B8' } })[k] },
    owner:    { label: 'Owner',      keys: ownerSet,                        color: () => ({ bg: '#F1F5F9', text: '#0F172A', dot: '#0B0D12' }) },
    category: { label: 'Category',   keys: categorySet,                     color: () => ({ bg: '#F1F5F9', text: '#0F172A', dot: '#4F46E5' }) }
  }
}

function groupKeyLabel(g, k) {
  if (g === 'rag') return ({ green: 'Green', amber: 'Amber', red: 'Red', unknown: 'Unknown' })[k]
  if (g === 'priority') return ({ high: 'High', medium: 'Medium', low: 'Low' })[k]
  return k
}

// ---- KanbanBoard ----
export function KanbanBoard({ projects, allProjects, groupBy, manual, setManual, canDrag, onCardClick, hideEmptyColumns, onMoveProject, fields, selectable, selection, onToggleSelect }) {
  const cfg = useMemo(() => getKanbanGroupConfig(allProjects || projects), [allProjects, projects, groupBy])
  const visibleFields = fields || defaultCardFields

  function projectMatchesKey(p, key) {
    if (groupBy === 'stage') return p.stage === key
    if (groupBy === 'priority') return p.priority === key
    if (groupBy === 'rag') return p.rag === key
    if (groupBy === 'owner') return p.owner === key
    if (groupBy === 'category') return p.category === key
  }

  const columns = useMemo(() => {
    const groupCfg = cfg[groupBy]
    if (!groupCfg) return []
    return groupCfg.keys.map(key => {
      const auto = projects.filter(p => projectMatchesKey(p, key))
      auto.sort(dashboardSort)
      const mk = `${groupBy}::${key}`
      let items = auto
      let isManual = false
      if (canDrag && manual[mk]) {
        const ordered = manual[mk].map(id => auto.find(p => p.id === id)).filter(Boolean)
        const rest = auto.filter(p => !manual[mk].includes(p.id))
        items = [...ordered, ...rest]
        isManual = manual[mk].length > 0
      }
      return { key, label: groupKeyLabel(groupBy, key), color: groupCfg.color(key), items, isManual }
    }).filter(c => !hideEmptyColumns || c.items.length > 0)
  }, [projects, groupBy, manual, canDrag, cfg, hideEmptyColumns])

  const [dragId, setDragId] = useState(null)

  function onDragStart(e, pid) {
    if (!canDrag) { e.preventDefault(); return }
    setDragId(pid); e.dataTransfer.effectAllowed = 'move'
  }
  function onDragOver(e) { if (!canDrag) return; e.preventDefault(); e.dataTransfer.dropEffect = 'move' }
  function onDropOnCard(e, targetCol, targetPid) {
    if (!canDrag) return; e.preventDefault(); e.stopPropagation()
    if (!dragId || dragId === targetPid) return
    moveCard(dragId, targetCol, targetPid); setDragId(null)
  }
  function onDropOnColumn(e, targetCol) {
    if (!canDrag) return; e.preventDefault()
    if (!dragId) return
    moveCard(dragId, targetCol, null); setDragId(null)
  }

  function moveCard(pid, targetCol, beforeId) {
    const proj = (allProjects || projects).find(p => p.id === pid)
    if (!proj) return
    const fieldKey = ({ stage: 'stage', priority: 'priority', rag: 'rag', owner: 'owner', category: 'category' })[groupBy]
    const currentVal = proj[fieldKey]
    if (currentVal !== targetCol && onMoveProject) onMoveProject(pid, { [fieldKey]: targetCol })
    setManual && setManual(m => {
      const mk = `${groupBy}::${targetCol}`
      const sourceMk = `${groupBy}::${currentVal}`
      const existing = m[mk] || columns.find(c => c.key === targetCol)?.items.map(i => i.id) || []
      const targetIds = existing.filter(id => id !== pid)
      let insertAt = beforeId ? targetIds.indexOf(beforeId) : targetIds.length
      if (insertAt < 0) insertAt = targetIds.length
      const next = [...targetIds]; next.splice(insertAt, 0, pid)
      const out = { ...m, [mk]: next }
      if (m[sourceMk] && sourceMk !== mk) out[sourceMk] = m[sourceMk].filter(id => id !== pid)
      return out
    })
  }

  function resetManual(colKey) {
    setManual && setManual(m => { const out = { ...m }; delete out[`${groupBy}::${colKey}`]; return out })
  }

  return (
    <div className="kanban-row nice-scroll">
      {columns.map(col => (
        <div key={col.key} onDragOver={onDragOver} onDrop={e => onDropOnColumn(e, col.key)}
          className="bg-slate-50/60 rounded-xl border border-slate-200 flex flex-col min-h-[360px]">
          <header className="px-3 py-2.5 flex items-center justify-between gap-2 border-b border-slate-200">
            <div className="inline-flex items-center gap-2 min-w-0">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ background: col.color.dot }}></span>
              <h3 className="text-[13px] font-semibold tracking-tight truncate" style={{ color: col.color.text }}>{col.label}</h3>
              <span className="text-[11px] tabular-nums px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">{col.items.length}</span>
              {col.isManual && <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">Manual</span>}
            </div>
            {col.isManual && (
              <button className="text-[11px] text-slate-500 hover:text-indigo-600 inline-flex items-center gap-1" onClick={() => resetManual(col.key)}>
                <Icon name="rotate-ccw" size={11} /> Reset
              </button>
            )}
          </header>
          <div className="flex-1 p-2 flex flex-col gap-2 nice-scroll overflow-y-auto" style={{ maxHeight: 'calc(100vh - 320px)' }}>
            {col.items.length === 0 && <div className="text-[12px] text-slate-400 px-2 py-6 text-center">No projects</div>}
            {col.items.map(p => (
              <KanbanCard key={p.id} p={p} fields={visibleFields}
                draggable={canDrag} dragging={dragId === p.id}
                onDragStart={e => onDragStart(e, p.id)}
                onDragOver={onDragOver}
                onDrop={e => onDropOnCard(e, col.key, p.id)}
                onClick={() => onCardClick && onCardClick(p)}
                selectable={selectable}
                selected={selection?.includes(p.id)}
                onToggleSelect={onToggleSelect ? () => onToggleSelect(p.id) : null}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ---- KanbanView (built-in tab) ----
export default function KanbanView({ fixedGroupBy, title } = {}) {
  const { projects, setRoute, updateProject, identity, selection, toggleSelect } = useStore()
  const [groupBy, setGroupBy] = useState(fixedGroupBy || 'stage')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  useClickOutside(menuRef, () => setMenuOpen(false))

  const [fields, setFields] = useState(() => {
    try { const v = localStorage.getItem('gtm.kanbanFields'); return v ? JSON.parse(v) : defaultCardFields } catch { return defaultCardFields }
  })
  useEffect(() => { try { localStorage.setItem('gtm.kanbanFields', JSON.stringify(fields)) } catch {} }, [fields])

  const [manualByGroup, setManualByGroup] = useState(() => {
    try { const v = localStorage.getItem('gtm.kanbanManual'); return v ? JSON.parse(v) : {} } catch { return {} }
  })
  useEffect(() => { try { localStorage.setItem('gtm.kanbanManual', JSON.stringify(manualByGroup)) } catch {} }, [manualByGroup])

  const manual = manualByGroup[groupBy] || {}
  function setManual(updater) {
    setManualByGroup(prev => {
      const cur = prev[groupBy] || {}
      const next = typeof updater === 'function' ? updater(cur) : updater
      return { ...prev, [groupBy]: next }
    })
  }

  useEffect(() => { if (fixedGroupBy) setGroupBy(fixedGroupBy) }, [fixedGroupBy])

  const canDrag = identity.isOwner
  const cfg = getKanbanGroupConfig(projects)

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <div className="mb-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight inline-flex items-center gap-2">
            {title || 'Kanban'}
            {fixedGroupBy && <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 bg-slate-100 border border-slate-200 rounded-md px-2 py-0.5">Custom view</span>}
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            {canDrag ? 'Drag to reorder or move between columns. Manual order locks per column — hit Reset to revert.'
              : 'Read-only — only the planner owner can drag cards.'}
          </p>
        </div>
        {!fixedGroupBy && (
          <div className="flex items-center gap-2">
            <CardFieldsPicker fields={fields} onChange={setFields} />
            <div className="text-[12px] text-slate-500">Group by</div>
            <div className="relative" ref={menuRef}>
              <button className="btn-ghost" onClick={() => setMenuOpen(v => !v)}>
                {cfg[groupBy].label}<Icon name="chevron-down" size={12} />
              </button>
              {menuOpen && (
                <div className="menu" style={{ top: 36, right: 0 }}>
                  {Object.entries(cfg).map(([k, c]) => (
                    <button key={k} className="menu-item" onClick={() => { setGroupBy(k); setManual({}); setMenuOpen(false) }}>
                      {groupBy === k ? <Icon name="check" size={13} className="text-indigo-600" /> : <span style={{ width: 13 }} />}
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {fixedGroupBy && (
          <div className="text-[12px] text-slate-500 inline-flex items-center gap-1.5">
            <Icon name="lock" size={11} /> Grouped by {cfg[groupBy].label}
          </div>
        )}
      </div>
      <KanbanBoard
        projects={projects} allProjects={projects}
        groupBy={groupBy} manual={manual} setManual={setManual}
        canDrag={canDrag} fields={fields}
        onCardClick={p => setRoute({ tab: 'project', projectId: p.id })}
        onMoveProject={(pid, patch) => updateProject(pid, patch)}
        selectable={identity.isOwner} selection={selection} onToggleSelect={toggleSelect}
      />
    </div>
  )
}

// ---- Card fields picker ----
export function CardFieldsPicker({ fields, onChange, label = 'Card fields' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useClickOutside(ref, () => setOpen(false))
  function toggle(id) { onChange(fields.includes(id) ? fields.filter(x => x !== id) : [...fields, id]) }
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)} className="btn-ghost">
        <Icon name="sliders-horizontal" size={12} /> {label}
        <Icon name="chevron-down" size={11} className="text-slate-400" />
      </button>
      {open && (
        <div className="menu" style={{ top: 36, right: 0, width: 240, padding: 0 }}>
          <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
            <div className="text-[12px] font-semibold tracking-tight">Show on card</div>
            <button onClick={() => onChange(defaultCardFields)} className="text-[11px] text-indigo-600 hover:underline">Reset</button>
          </div>
          <div className="p-2 flex flex-col gap-0.5 max-h-[50vh] overflow-y-auto">
            {gtmCardFields.map(f => (
              <label key={f.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer text-[13px] text-slate-700">
                <input type="checkbox" checked={fields.includes(f.id)} onChange={() => toggle(f.id)} className="accent-indigo-600" />
                {f.label}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function KanbanCard({ p, draggable, dragging, onDragStart, onDragOver, onDrop, onClick, fields, selectable, selected, onToggleSelect }) {
  const r = ragMeta[p.rag]
  const pr = priorityMeta[p.priority]
  const f = fields || defaultCardFields
  const has = k => f.includes(k)
  const hasMidChips = has('stage') || has('rag') || has('decision')
  const hasFooter = has('owner') || has('priority') || has('score')
  const summary = (p.businessCase || '').split(/[.!?]/)[0] || ''
  return (
    <article
      draggable={draggable} onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} onClick={onClick}
      className={'card-hover bg-white rounded-lg shadow-card p-3 flex flex-col gap-2 ' + (dragging ? 'opacity-50 ' : '') + (selected ? 'ring-2 ring-indigo-500 ' : '')}
      style={draggable ? { cursor: 'grab' } : {}}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          {selectable && (
            <input type="checkbox" checked={!!selected} onChange={onToggleSelect}
              onClick={e => e.stopPropagation()}
              className="mt-0.5 h-3.5 w-3.5 accent-indigo-600 cursor-pointer shrink-0" />
          )}
          <h4 className="text-[13px] font-medium leading-tight">{p.name}</h4>
        </div>
        {p.focus && <Icon name="star" size={12} className="text-amber-500 shrink-0" />}
      </div>
      {has('category') && <div className="text-[11px] text-slate-500 -mt-1">{p.category}</div>}
      {has('summary') && summary && <p className="text-[12px] text-slate-600 leading-snug clamp-2">{summary}.</p>}
      {hasMidChips && (
        <div className="flex flex-wrap items-center gap-1">
          {has('stage') && <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">{p.stage}</span>}
          {has('rag') && (
            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium inline-flex items-center gap-1" style={{ background: r.chipBg, color: r.chipText }}>
              <span className="h-1 w-1 rounded-full" style={{ background: r.dot }}></span>{r.label}
            </span>
          )}
          {has('decision') && p.decision && <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">Decision</span>}
        </div>
      )}
      {has('target') && <div className="text-[11px] text-slate-500 inline-flex items-center gap-1.5"><Icon name="calendar" size={11} /> {fmtDate(p.target)}</div>}
      {hasFooter && (
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span className="truncate">{has('owner') ? p.owner : ''}</span>
          <span className="inline-flex items-center gap-1.5">
            {has('priority') && <span className="font-medium" style={{ color: pr.text }}>{pr.label}</span>}
            {has('score') && <span className="px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 tabular-nums">{p.score}</span>}
          </span>
        </div>
      )}
      {has('updated') && <div className="text-[10px] text-slate-400 -mt-1">Updated {p.updated}</div>}
    </article>
  )
}
