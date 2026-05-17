import { useMemo, useState } from 'react'
import Icon from '../components/Icon'
import { useStore, useClickOutside } from '../App'
import { ragMeta, priorityMeta, gtmCategories, fmtWeekLabel, fmtWeekRange, fmtDate, dashboardSort } from '../data'
import { useRef } from 'react'

function StatTile({ label, value, sub, icon, accent }) {
  return (
    <div className="p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between text-slate-500">
        <span className="text-[12px] font-medium">{label}</span>
        <span className={'h-6 w-6 rounded-md grid place-items-center ' + accent.bg}>
          {typeof icon === 'string'
            ? <Icon name={icon} size={13} className={accent.iconColor} />
            : <span className={'h-2 w-2 rounded-full ' + accent.dot}></span>}
        </span>
      </div>
      <div className="text-[28px] font-semibold tracking-tight tabular-nums leading-none">{value}</div>
      <div className="text-[11px] text-slate-400">{sub}</div>
    </div>
  )
}

export default function DashboardView() {
  const { projects, filter, setFilter, setRoute, viewMode, updateProject, identity } = useStore()
  const [showAdd, setShowAdd] = useState(false)

  const stats = useMemo(() => {
    const c = { green: 0, amber: 0, red: 0, unknown: 0, decision: 0, stalled: 0, focus: 0 }
    projects.forEach(p => {
      c[p.rag]++
      if (p.decision) c.decision++
      if ((p.updatedDays ?? 0) >= 14) c.stalled++
      if (p.focus) c.focus++
    })
    return c
  }, [projects])

  const filtered = useMemo(() => {
    let list = projects.slice()
    if (filter === 'focus') list = list.filter(p => p.focus)
    else if (filter === 'decision') list = list.filter(p => p.decision)
    else if (filter === 'red') list = list.filter(p => p.rag === 'red')
    else if (filter === 'amber') list = list.filter(p => p.rag === 'amber')
    else if (filter === 'green') list = list.filter(p => p.rag === 'green')
    else if (filter === 'unknown') list = list.filter(p => p.rag === 'unknown')
    else if (filter === 'stalled') list = list.filter(p => (p.updatedDays ?? 0) >= 14)
    list.sort(dashboardSort)
    return list
  }, [projects, filter])

  const chips = [
    { id: 'all', label: 'All', count: projects.length },
    { id: 'focus', label: 'Focus', icon: 'star', count: stats.focus },
    { id: 'decision', label: 'Needs decision', count: stats.decision },
    { id: 'red', label: 'Red', dot: '#F43F5E', count: stats.red },
    { id: 'amber', label: 'Amber', dot: '#F59E0B', count: stats.amber },
    { id: 'unknown', label: 'Unknown', dot: '#94A3B8', count: stats.unknown },
    { id: 'stalled', label: 'Stalled', count: stats.stalled }
  ]

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <div className="mb-6 flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Portfolio overview</h1>
          <p className="text-[13px] text-slate-500 mt-1">
            {projects.length} active {projects.length === 1 ? 'project' : 'projects'} · {fmtWeekLabel(new Date()).toLowerCase()} ·{' '}
            <span className="inline-flex items-center gap-1">
              {viewMode === 'exec' ? <><Icon name="briefcase" size={11} />Exec view</> : <><Icon name="wrench" size={11} />Ops view</>}
            </span>
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-[12px] text-slate-500">
          <Icon name="calendar" size={13} />
          <span>Reporting cycle: <span className="text-[#0B0D12] font-medium">{fmtWeekRange(new Date())}</span></span>
        </div>
      </div>

      <section className="bg-white rounded-xl shadow-card mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 divide-x divide-slate-100">
          <StatTile label="Green"   value={stats.green}    sub="On track"      accent={{ bg: 'bg-emerald-50', dot: 'bg-emerald-500' }} />
          <StatTile label="Amber"   value={stats.amber}    sub="At risk"       accent={{ bg: 'bg-amber-50',   dot: 'bg-amber-500' }} />
          <StatTile label="Red"     value={stats.red}      sub="Blocked"       accent={{ bg: 'bg-rose-50',    dot: 'bg-rose-500' }} />
          <StatTile label="Unknown" value={stats.unknown}  sub="Needs update"  accent={{ bg: 'bg-slate-100',  dot: 'bg-slate-400' }} />
          <StatTile label="Need decisions" value={stats.decision} sub="Awaiting exec" icon="git-pull-request-draft" accent={{ bg: 'bg-indigo-50', iconColor: 'text-indigo-600' }} />
          <StatTile label="Stalled >14d"   value={stats.stalled}  sub="No movement"   icon="hourglass"               accent={{ bg: 'bg-rose-50',   iconColor: 'text-rose-600' }} />
          <StatTile label="Focused"        value={stats.focus}    sub="This cycle"    icon="star"                    accent={{ bg: 'bg-amber-50',  iconColor: 'text-amber-500' }} />
        </div>
      </section>

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap text-[12px]">
          {chips.map(c => (
            <button key={c.id} className={'chip ' + (filter === c.id ? 'active' : '')} onClick={() => setFilter(c.id)}>
              {c.icon && <Icon name={c.icon} size={12} className="text-amber-500" />}
              {c.dot && <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.dot }}></span>}
              {c.label}
              <span className="chip-count tabular-nums">{c.count}</span>
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <div className="text-[11px] text-slate-400 hidden md:inline-flex items-center gap-1">
          <Icon name="arrow-down-narrow-wide" size={11} />
          Sorted: focus → RAG → asks → priority → score
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>
          <Icon name="plus" size={13} /> Add project
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-card p-12 text-center">
          <div className="inline-flex h-10 w-10 rounded-full bg-slate-100 items-center justify-center text-slate-400 mb-2">
            <Icon name="search-x" size={18} />
          </div>
          <h3 className="text-sm font-medium">No projects match this filter</h3>
          <p className="text-[12px] text-slate-500 mt-1">Try "All" or add a new project.</p>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => (
            <ProjectCard key={p.id} p={p}
              onOpen={() => setRoute({ tab: 'project', projectId: p.id })}
              onToggleFocus={identity.isOwner ? () => updateProject(p.id, { focus: !p.focus }) : null}
              viewMode={viewMode} />
          ))}
        </section>
      )}

      {showAdd && <AddProjectModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}

export function ProjectCard({ p, onOpen, onToggleFocus, viewMode }) {
  const r = ragMeta[p.rag]
  const pr = priorityMeta[p.priority]
  const isFocus = p.focus
  return (
    <article
      onClick={onOpen}
      className={'card-hover relative bg-white rounded-xl pl-5 pr-5 pt-5 pb-4 flex flex-col gap-3 ' + (isFocus ? 'focused-ring' : r.border)}>
      {isFocus && (
        <div className="absolute -top-2 left-4 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-semibold tracking-wider uppercase shadow-sm">
          <Icon name="star" size={10} /> Focus
        </div>
      )}
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold tracking-tight leading-snug">{p.name}</h3>
          <p className="text-[12px] text-slate-500 mt-0.5">{p.category} · <span className="text-slate-700">{p.owner}</span></p>
        </div>
        {onToggleFocus && (
          <button
            onClick={e => { e.stopPropagation(); onToggleFocus() }}
            title={isFocus ? 'Unpin from focus' : 'Pin to focus'}
            className={'shrink-0 h-7 w-7 grid place-items-center rounded-md hover:bg-slate-50 ' + (isFocus ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500')}>
            <Icon name="star" size={15} />
          </button>
        )}
      </header>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 h-6 px-2 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">{p.stage}</span>
        <span className="inline-flex items-center gap-1 h-6 px-2 rounded-md text-[11px] font-medium" style={{ background: r.chipBg, color: r.chipText }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: r.dot }}></span>{r.label}
        </span>
        <span className="inline-flex items-center gap-1 h-6 px-2 rounded-md text-[11px] font-medium" style={{ background: pr.bg, color: pr.text }}>{pr.label}</span>
        {p.decision && (
          <span className="inline-flex items-center gap-1 h-6 px-2 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-medium border border-indigo-100">
            <Icon name="git-pull-request-draft" size={11} /> Decision needed
          </span>
        )}
      </div>
      {viewMode === 'exec' ? (
        <p className="text-[13px] text-slate-600 leading-relaxed clamp-3">{p.businessCase}</p>
      ) : (
        <>
          <p className="text-[13px] text-slate-600 leading-relaxed clamp-2">{p.businessCase}</p>
          {p.nextActions && p.nextActions.length > 0 && (
            <div className="text-[12px] text-slate-600 bg-slate-50 border border-slate-100 rounded-md px-2.5 py-2 flex items-start gap-2">
              <Icon name="arrow-right" size={13} className="mt-0.5 text-slate-400 shrink-0" />
              <div><span className="text-slate-400 font-medium">Next:</span> {p.nextActions[0]}</div>
            </div>
          )}
        </>
      )}
      <footer className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 mt-1">
        <span className="inline-flex items-center gap-1.5"><Icon name="calendar" size={11} />{fmtDate(p.target)}</span>
        <span className="inline-flex items-center gap-1.5"><Icon name="clock" size={11} />Updated {p.updated}</span>
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600 tabular-nums font-medium">{p.score}</span>
      </footer>
    </article>
  )
}

function AddProjectModal({ onClose }) {
  const { addProject, setRoute, identity } = useStore()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Sales tooling')
  const [owner, setOwner] = useState('Shivani')
  const [sponsor, setSponsor] = useState('')
  const [target, setTarget] = useState('')
  const [businessCase, setBusinessCase] = useState('')

  function submit(e) {
    e.preventDefault()
    if (!name.trim()) return
    const id = addProject({ name: name.trim(), category, owner, sponsor, target: target || 'TBD', businessCase })
    onClose()
    setRoute({ tab: 'project', projectId: id })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" style={{ width: 520 }} onClick={e => e.stopPropagation()} onSubmit={submit}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-semibold tracking-tight">Add project</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700"><Icon name="x" size={16} /></button>
        </div>
        <div className="flex flex-col gap-3">
          <label className="text-[12px] font-medium text-slate-700">
            Project name
            <input autoFocus value={name} onChange={e => setName(e.target.value)}
              className="mt-1 w-full h-9 px-2.5 rounded-md border border-slate-200 text-[13px]" placeholder="e.g. Salesforce pipeline hygiene" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-[12px] font-medium text-slate-700">
              Category
              <select className="bare mt-1 w-full h-9 px-2.5 rounded-md border border-slate-200 text-[13px]" value={category} onChange={e => setCategory(e.target.value)}>
                {gtmCategories.map(c => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label className="text-[12px] font-medium text-slate-700">
              Owner
              <input value={owner} onChange={e => setOwner(e.target.value)} placeholder="e.g. Shivani"
                className="mt-1 w-full h-9 px-2.5 rounded-md border border-slate-200 text-[13px]" />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-[12px] font-medium text-slate-700">
              Leadership sponsor
              <input value={sponsor} onChange={e => setSponsor(e.target.value)} placeholder="e.g. VP Sales"
                className="mt-1 w-full h-9 px-2.5 rounded-md border border-slate-200 text-[13px]" />
            </label>
            <label className="text-[12px] font-medium text-slate-700">
              Target date
              <input type="date" value={target} onChange={e => setTarget(e.target.value)}
                className="mt-1 w-full h-9 px-2.5 rounded-md border border-slate-200 text-[13px]" />
            </label>
          </div>
          <label className="text-[12px] font-medium text-slate-700">
            Business case
            <textarea rows="3" value={businessCase} onChange={e => setBusinessCase(e.target.value)}
              className="mt-1 w-full p-2.5 rounded-md border border-slate-200 text-[13px]" placeholder="Why does this matter? What outcome are we after?" />
          </label>
          {!identity.isOwner && (
            <p className="text-[11.5px] text-slate-500 bg-slate-50 border border-slate-200 rounded-md p-2 inline-flex items-start gap-1.5">
              <Icon name="info" size={12} className="mt-0.5 shrink-0 text-slate-400" />
              You're adding this as a viewer. The planner owner can update RAG, priority, and other fields later.
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary"><Icon name="plus" size={13} />Create project</button>
        </div>
      </form>
    </div>
  )
}
