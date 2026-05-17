import { useState, useMemo, useRef } from 'react'
import Icon from '../components/Icon'
import { useStore, useClickOutside } from '../App'
import { ragMeta, priorityMeta, gtmStages, defaultCardFields, dashboardSort, fmtDate } from '../data'
import { KanbanBoard, CardFieldsPicker, getKanbanGroupConfig, KanbanCard } from './Kanban'

export function normalizeCustomTab(tab) {
  return {
    id: tab.id,
    label: tab.label || 'Untitled view',
    view: tab.view || 'kanban',
    groupBy: tab.groupBy || 'priority',
    sort: tab.sort || 'score',
    hideEmptyColumns: !!tab.hideEmptyColumns,
    cardFields: tab.cardFields || defaultCardFields,
    manual: tab.manual || {},
    filters: {
      categories: tab.filters?.categories || [],
      owners: tab.filters?.owners || [],
      priorities: tab.filters?.priorities || [],
      rags: tab.filters?.rags || [],
      stages: tab.filters?.stages || [],
      focusOnly: !!tab.filters?.focusOnly,
      decisionOnly: !!tab.filters?.decisionOnly,
      stalledOnly: !!tab.filters?.stalledOnly,
      search: tab.filters?.search || ''
    }
  }
}

export function applyFilters(projects, f) {
  return projects.filter(p => {
    if (f.categories.length && !f.categories.includes(p.category)) return false
    if (f.owners.length && !f.owners.includes(p.owner)) return false
    if (f.priorities.length && !f.priorities.includes(p.priority)) return false
    if (f.rags.length && !f.rags.includes(p.rag)) return false
    if (f.stages.length && !f.stages.includes(p.stage)) return false
    if (f.focusOnly && !p.focus) return false
    if (f.decisionOnly && !p.decision) return false
    if (f.stalledOnly && (p.updatedDays ?? 0) < 14) return false
    if (f.search) {
      const q = f.search.toLowerCase()
      if (!p.name.toLowerCase().includes(q) && !(p.businessCase || '').toLowerCase().includes(q)) return false
    }
    return true
  })
}

function activeFilterCount(f) {
  let n = f.categories.length + f.owners.length + f.priorities.length + f.rags.length + f.stages.length
  if (f.focusOnly) n++; if (f.decisionOnly) n++; if (f.stalledOnly) n++; if (f.search) n++
  return n
}

export default function CustomTabView({ tab }) {
  const { projects, setRoute, updateProject, updateCustomTab, identity, selection, toggleSelect } = useStore()
  const t = useMemo(() => normalizeCustomTab(tab), [tab])

  const manualByGroup = t.manual || {}
  const manual = manualByGroup[t.groupBy] || {}
  function setManual(updater) {
    const cur = manualByGroup[t.groupBy] || {}
    const next = typeof updater === 'function' ? updater(cur) : updater
    updateCustomTab(t.id, { manual: { ...manualByGroup, [t.groupBy]: next } })
  }

  function update(patch) { updateCustomTab(t.id, patch) }
  function updateFilters(patch) { update({ filters: { ...t.filters, ...patch } }) }
  function clearAllFilters() {
    update({ filters: { categories: [], owners: [], priorities: [], rags: [], stages: [], focusOnly: false, decisionOnly: false, stalledOnly: false, search: '' } })
  }

  const filtered = useMemo(() => applyFilters(projects, t.filters), [projects, t.filters])
  const cfg = useMemo(() => getKanbanGroupConfig(projects), [projects])
  const filterCount = activeFilterCount(t.filters)

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight inline-flex items-center gap-2">
            <RenameableTitle value={t.label} canEdit={identity.isOwner} onCommit={v => update({ label: v })} />
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 bg-slate-100 border border-slate-200 rounded-md px-2 py-0.5">Custom view</span>
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            {filtered.length} of {projects.length} projects · {t.view === 'kanban' ? 'Grouped by ' + cfg[t.groupBy]?.label : 'Sorted by ' + sortLabel(t.sort)}
            {!identity.isOwner && <span className="ml-2 text-slate-400 inline-flex items-center gap-1"><Icon name="lock" size={11} /> Read-only</span>}
          </p>
        </div>
      </div>

      <Toolbar tab={t} update={update} updateFilters={updateFilters} clearAllFilters={clearAllFilters} filterCount={filterCount} cfg={cfg} canEdit={identity.isOwner} />
      {filterCount > 0 && <ActiveFilters t={t} updateFilters={updateFilters} clearAllFilters={clearAllFilters} />}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-card p-12 text-center mt-4">
          <div className="inline-flex h-10 w-10 rounded-full bg-slate-100 items-center justify-center text-slate-400 mb-2">
            <Icon name="search-x" size={18} />
          </div>
          <h3 className="text-sm font-medium">No projects match these filters</h3>
          <p className="text-[12px] text-slate-500 mt-1">Clear filters to see all projects.</p>
          {filterCount > 0 && <button className="btn-ghost mt-3 mx-auto" onClick={clearAllFilters}><Icon name="x" size={12} /> Clear all filters</button>}
        </div>
      ) : t.view === 'kanban' ? (
        <KanbanBoard
          projects={filtered} allProjects={projects}
          groupBy={t.groupBy} manual={manual} setManual={setManual}
          canDrag={identity.isOwner} hideEmptyColumns={t.hideEmptyColumns}
          fields={t.cardFields}
          onCardClick={p => setRoute({ tab: 'project', projectId: p.id })}
          onMoveProject={(pid, patch) => updateProject(pid, patch)}
          selectable={identity.isOwner} selection={selection} onToggleSelect={toggleSelect}
        />
      ) : (
        <TableView projects={filtered} sort={t.sort} fields={t.cardFields}
          onCardClick={p => setRoute({ tab: 'project', projectId: p.id })}
          selectable={identity.isOwner} selection={selection} onToggleSelect={toggleSelect} />
      )}
    </div>
  )
}

function Toolbar({ tab, update, updateFilters, clearAllFilters, filterCount, cfg, canEdit }) {
  const [filterOpen, setFilterOpen] = useState(false)
  const filterRef = useRef(null)
  useClickOutside(filterRef, () => setFilterOpen(false))
  const [search, setSearch] = useState(tab.filters.search || '')

  return (
    <div className="bg-white rounded-xl shadow-card p-2 mb-3 flex items-center gap-2 flex-wrap">
      <div className="inline-flex items-center bg-slate-100 rounded-md p-0.5 text-[12px]">
        <button onClick={() => canEdit && update({ view: 'kanban' })} disabled={!canEdit}
          className={'seg-btn h-7 px-2.5 rounded inline-flex items-center gap-1.5 text-slate-600 ' + (!canEdit ? 'cursor-default' : '')}
          aria-pressed={tab.view === 'kanban'}>
          <Icon name="columns-3" size={12} /> Board
        </button>
        <button onClick={() => canEdit && update({ view: 'table' })} disabled={!canEdit}
          className={'seg-btn h-7 px-2.5 rounded inline-flex items-center gap-1.5 text-slate-600 ' + (!canEdit ? 'cursor-default' : '')}
          aria-pressed={tab.view === 'table'}>
          <Icon name="rows-3" size={12} /> Table
        </button>
      </div>

      {tab.view === 'kanban' ? (
        <PillSelect icon="layers" label="Group" value={cfg[tab.groupBy]?.label || tab.groupBy}
          options={Object.entries(cfg).map(([k, c]) => ({ value: k, label: c.label }))}
          onChange={v => update({ groupBy: v })} canEdit={canEdit} />
      ) : (
        <PillSelect icon="arrow-down-narrow-wide" label="Sort" value={sortLabel(tab.sort)}
          options={[{ value: 'score', label: 'Priority score' }, { value: 'name', label: 'Name (A→Z)' }, { value: 'target', label: 'Target date' }, { value: 'rag', label: 'RAG severity' }, { value: 'updated', label: 'Recently updated' }]}
          onChange={v => update({ sort: v })} canEdit={canEdit} />
      )}

      {canEdit && <CardFieldsPicker fields={tab.cardFields} onChange={v => update({ cardFields: v })} label={tab.view === 'kanban' ? 'Card fields' : 'Columns'} />}

      <div className="relative" ref={filterRef}>
        <button onClick={() => setFilterOpen(v => !v)}
          className={'btn-ghost ' + (filterCount > 0 ? '!bg-indigo-50 !border-indigo-200 !text-indigo-700' : '')}>
          <Icon name="filter" size={12} /> Filter
          {filterCount > 0 && <span className="tabular-nums font-semibold bg-indigo-600 text-white rounded-full h-4 min-w-[16px] px-1 inline-flex items-center justify-center text-[10px]">{filterCount}</span>}
          <Icon name="chevron-down" size={11} className="text-slate-400" />
        </button>
        {filterOpen && <FilterPopover tab={tab} updateFilters={updateFilters} clearAllFilters={clearAllFilters} onClose={() => setFilterOpen(false)} canEdit={canEdit} />}
      </div>

      <div className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-slate-200 bg-white text-[12px]">
        <Icon name="search" size={12} className="text-slate-400" />
        <input value={search} onChange={e => { setSearch(e.target.value); updateFilters({ search: e.target.value }) }}
          placeholder="Search…" disabled={!canEdit} className="bg-transparent outline-none text-[12px] w-[140px]" />
        {search && canEdit && <button onClick={() => { setSearch(''); updateFilters({ search: '' }) }} className="text-slate-400 hover:text-rose-500"><Icon name="x" size={11} /></button>}
      </div>

      {tab.view === 'kanban' && canEdit && (
        <label className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-slate-200 bg-white text-[12px] text-slate-700 cursor-pointer">
          <input type="checkbox" checked={tab.hideEmptyColumns} onChange={e => update({ hideEmptyColumns: e.target.checked })} className="accent-indigo-600" />
          Hide empty columns
        </label>
      )}
      <div className="flex-1" />
    </div>
  )
}

function PillSelect({ icon, label, value, options, onChange, canEdit }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useClickOutside(ref, () => setOpen(false))
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => canEdit && setOpen(v => !v)} disabled={!canEdit} className="btn-ghost">
        <Icon name={icon} size={12} /> {label}: <span className="font-medium text-[#0B0D12] ml-0.5">{value}</span>
        {canEdit && <Icon name="chevron-down" size={11} className="text-slate-400" />}
      </button>
      {open && (
        <div className="menu" style={{ top: 36, left: 0, minWidth: 180 }}>
          {options.map(o => (
            <button key={o.value} className="menu-item" onClick={() => { onChange(o.value); setOpen(false) }}>
              {value === o.label ? <Icon name="check" size={13} className="text-indigo-600" /> : <span style={{ width: 13 }} />}
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function sortLabel(s) {
  return ({ score: 'Priority score', name: 'Name', target: 'Target date', rag: 'RAG severity', updated: 'Recently updated' })[s] || s
}

function FilterPopover({ tab, updateFilters, clearAllFilters, onClose, canEdit }) {
  const { projects } = useStore()
  const owners = useMemo(() => [...new Set(projects.map(p => p.owner).filter(Boolean))].sort(), [projects])
  const categories = useMemo(() => [...new Set(projects.map(p => p.category).filter(Boolean))].sort(), [projects])
  const f = tab.filters

  function toggle(key, value) {
    if (!canEdit) return
    const arr = f[key]
    const next = arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value]
    updateFilters({ [key]: next })
  }

  return (
    <div className="menu" style={{ top: 40, right: 0, width: 360, padding: 0 }}>
      <div className="p-3 border-b border-slate-100 flex items-center justify-between">
        <div className="text-[12px] font-semibold tracking-tight">Filters</div>
        <button onClick={clearAllFilters} disabled={activeFilterCount(f) === 0} className="text-[11px] text-indigo-600 hover:underline disabled:text-slate-300">Clear all</button>
      </div>
      <div className="p-3 flex flex-col gap-3 max-h-[60vh] overflow-y-auto nice-scroll">
        <ToggleRow label="Focus only" icon="star" checked={f.focusOnly} onChange={v => updateFilters({ focusOnly: v })} canEdit={canEdit} />
        <ToggleRow label="Needs decision only" icon="git-pull-request-draft" checked={f.decisionOnly} onChange={v => updateFilters({ decisionOnly: v })} canEdit={canEdit} />
        <ToggleRow label="Stalled >14d only" icon="hourglass" checked={f.stalledOnly} onChange={v => updateFilters({ stalledOnly: v })} canEdit={canEdit} />
        <FilterGroup label="Priority" values={['high','medium','low']} selected={f.priorities} onToggle={v => toggle('priorities', v)}
          renderLabel={v => priorityMeta[v].label} renderSwatch={v => <span className="h-1.5 w-1.5 rounded-full" style={{ background: priorityMeta[v].text }} />} canEdit={canEdit} />
        <FilterGroup label="RAG status" values={['green','amber','red','unknown']} selected={f.rags} onToggle={v => toggle('rags', v)}
          renderLabel={v => ragMeta[v].label} renderSwatch={v => <span className="h-1.5 w-1.5 rounded-full" style={{ background: ragMeta[v].dot }} />} canEdit={canEdit} />
        <FilterGroup label="Stage" values={gtmStages} selected={f.stages} onToggle={v => toggle('stages', v)} canEdit={canEdit} />
        <FilterGroup label="Category" values={categories} selected={f.categories} onToggle={v => toggle('categories', v)} canEdit={canEdit} />
        <FilterGroup label="Owner" values={owners} selected={f.owners} onToggle={v => toggle('owners', v)} canEdit={canEdit} />
      </div>
      <div className="p-3 border-t border-slate-100 flex justify-end">
        <button className="btn-ghost" onClick={onClose}>Done</button>
      </div>
    </div>
  )
}

function ToggleRow({ label, icon, checked, onChange, canEdit }) {
  return (
    <label className="flex items-center gap-2 text-[13px] text-slate-700 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={e => canEdit && onChange(e.target.checked)} disabled={!canEdit} className="accent-indigo-600" />
      {icon && <Icon name={icon} size={12} className="text-slate-400" />}
      {label}
    </label>
  )
}

function FilterGroup({ label, values, selected, onToggle, canEdit, renderLabel, renderSwatch }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider font-medium text-slate-500 mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {values.map(v => {
          const isSel = selected.includes(v)
          return (
            <button key={v} onClick={() => onToggle(v)} disabled={!canEdit}
              className={'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border text-[12px] transition-colors ' +
                (isSel ? 'bg-[#0B0D12] text-white border-[#0B0D12]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50') +
                (canEdit ? '' : ' cursor-default opacity-80')}>
              {renderSwatch && renderSwatch(v)}
              {renderLabel ? renderLabel(v) : v}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ActiveFilters({ t, updateFilters, clearAllFilters }) {
  const f = t.filters
  const chips = []
  if (f.focusOnly) chips.push({ key: 'focusOnly', label: 'Focus only', icon: 'star', clear: () => updateFilters({ focusOnly: false }) })
  if (f.decisionOnly) chips.push({ key: 'decisionOnly', label: 'Needs decision', icon: 'git-pull-request-draft', clear: () => updateFilters({ decisionOnly: false }) })
  if (f.stalledOnly) chips.push({ key: 'stalledOnly', label: 'Stalled >14d', icon: 'hourglass', clear: () => updateFilters({ stalledOnly: false }) })
  f.priorities.forEach(v => chips.push({ key: 'p-' + v, label: 'Priority: ' + priorityMeta[v].label, clear: () => updateFilters({ priorities: f.priorities.filter(x => x !== v) }) }))
  f.rags.forEach(v => chips.push({ key: 'r-' + v, label: 'RAG: ' + ragMeta[v].label, dot: ragMeta[v].dot, clear: () => updateFilters({ rags: f.rags.filter(x => x !== v) }) }))
  f.stages.forEach(v => chips.push({ key: 's-' + v, label: 'Stage: ' + v, clear: () => updateFilters({ stages: f.stages.filter(x => x !== v) }) }))
  f.categories.forEach(v => chips.push({ key: 'c-' + v, label: 'Category: ' + v, clear: () => updateFilters({ categories: f.categories.filter(x => x !== v) }) }))
  f.owners.forEach(v => chips.push({ key: 'o-' + v, label: 'Owner: ' + v, clear: () => updateFilters({ owners: f.owners.filter(x => x !== v) }) }))
  if (f.search) chips.push({ key: 'search', label: `Search: "${f.search}"`, clear: () => updateFilters({ search: '' }) })
  if (chips.length === 0) return null
  return (
    <div className="flex items-center gap-1.5 flex-wrap mb-3 text-[11.5px]">
      {chips.map(c => (
        <span key={c.key} className="inline-flex items-center gap-1.5 h-6 pl-2 pr-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
          {c.icon && <Icon name={c.icon} size={10} />}
          {c.dot && <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.dot }} />}
          {c.label}
          <button onClick={c.clear} className="h-4 w-4 grid place-items-center rounded-full hover:bg-indigo-100 text-indigo-500"><Icon name="x" size={10} /></button>
        </span>
      ))}
      {chips.length > 1 && <button onClick={clearAllFilters} className="text-indigo-600 hover:underline ml-1">Clear all</button>}
    </div>
  )
}

function TableView({ projects, sort, fields, onCardClick, selectable, selection, onToggleSelect }) {
  const visibleFields = fields || defaultCardFields
  const has = k => visibleFields.includes(k)
  const sorted = useMemo(() => {
    const list = projects.slice()
    if (sort === 'score') list.sort((a, b) => b.score - a.score)
    else if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name))
    else if (sort === 'target') list.sort((a, b) => {
      if (a.target === 'TBD') return 1; if (b.target === 'TBD') return -1
      return (a.target || 'z').localeCompare(b.target || 'z')
    })
    else if (sort === 'rag') list.sort((a, b) => ragMeta[a.rag].severity - ragMeta[b.rag].severity)
    else if (sort === 'updated') list.sort((a, b) => (a.updatedDays ?? 0) - (b.updatedDays ?? 0))
    return list
  }, [projects, sort])

  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200 bg-slate-50/50">
            {selectable && <th className="pl-4 pr-1 py-2 font-medium w-6">
              <input type="checkbox"
                checked={sorted.length > 0 && sorted.every(p => selection?.includes(p.id))}
                onChange={e => {
                  if (!onToggleSelect) return
                  const allSel = sorted.every(p => selection?.includes(p.id))
                  sorted.forEach(p => {
                    if (allSel) { if (selection.includes(p.id)) onToggleSelect(p.id) }
                    else { if (!selection.includes(p.id)) onToggleSelect(p.id) }
                  })
                }}
                className="h-3.5 w-3.5 accent-indigo-600 cursor-pointer" />
            </th>}
            <th className="px-4 py-2 font-medium w-8"></th>
            <th className="px-4 py-2 font-medium">Project</th>
            {has('stage')    && <th className="px-3 py-2 font-medium">Stage</th>}
            {has('rag')      && <th className="px-3 py-2 font-medium">RAG</th>}
            {has('priority') && <th className="px-3 py-2 font-medium">Priority</th>}
            {has('owner')    && <th className="px-3 py-2 font-medium">Owner</th>}
            {has('score')    && <th className="px-3 py-2 font-medium tabular-nums text-right">Score</th>}
            {has('target')   && <th className="px-3 py-2 font-medium">Target</th>}
            {has('updated')  && <th className="px-3 py-2 font-medium">Updated</th>}
          </tr>
        </thead>
        <tbody>
          {sorted.map(p => {
            const r = ragMeta[p.rag]; const pr = priorityMeta[p.priority]
            return (
              <tr key={p.id} onClick={() => onCardClick(p)} className={'border-b border-slate-100 hover:bg-slate-50 cursor-pointer ' + (selection?.includes(p.id) ? 'bg-indigo-50/40' : '')}>
                {selectable && <td className="pl-4 pr-1 py-2.5" onClick={e => e.stopPropagation()}>
                  <input type="checkbox" checked={selection?.includes(p.id) || false}
                    onChange={() => onToggleSelect && onToggleSelect(p.id)}
                    className="h-3.5 w-3.5 accent-indigo-600 cursor-pointer" />
                </td>}
                <td className="px-4 py-2.5 text-center">{p.focus ? <Icon name="star" size={13} className="text-amber-500 inline-block" /> : <span className="text-slate-200">·</span>}</td>
                <td className="px-4 py-2.5">
                  <div className="font-medium text-[#0B0D12] inline-flex items-center gap-2">
                    {p.name}
                    {has('decision') && p.decision && <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">Decision</span>}
                  </div>
                  {has('category') && <div className="text-[11px] text-slate-500">{p.category}</div>}
                </td>
                {has('stage') && <td className="px-3 py-2.5"><span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">{p.stage}</span></td>}
                {has('rag') && <td className="px-3 py-2.5"><span className="text-[11px] px-1.5 py-0.5 rounded font-medium inline-flex items-center gap-1" style={{ background: r.chipBg, color: r.chipText }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: r.dot }}></span>{r.label}</span></td>}
                {has('priority') && <td className="px-3 py-2.5"><span className="text-[11px] px-1.5 py-0.5 rounded font-medium" style={{ background: pr.bg, color: pr.text }}>{pr.label}</span></td>}
                {has('owner') && <td className="px-3 py-2.5 text-slate-700">{p.owner}</td>}
                {has('score') && <td className="px-3 py-2.5 tabular-nums text-right font-medium">{p.score}</td>}
                {has('target') && <td className="px-3 py-2.5 text-slate-600">{fmtDate(p.target)}</td>}
                {has('updated') && <td className="px-3 py-2.5 text-slate-500 text-[12px]">{p.updated}</td>}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function RenameableTitle({ value, canEdit, onCommit }) {
  return (
    <span contentEditable={canEdit} suppressContentEditableWarning
      onBlur={e => canEdit && onCommit((e.target.innerText || 'Untitled view').trim())}
      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur() } }}
      className={canEdit ? 'editable' : ''}>{value}</span>
  )
}
