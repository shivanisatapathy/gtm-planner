import { useState, useMemo, useRef } from 'react'
import Icon from '../components/Icon'
import { useStore, useClickOutside } from '../App'
import { ragMeta, priorityMeta, gtmStages, gtmRags, gtmPriorities, gtmCategories, computeScore, fmtDate } from '../data'

export default function ProjectDetailView() {
  const { projects, route, setRoute } = useStore()
  const project = useMemo(() => {
    if (route.projectId) return projects.find(p => p.id === route.projectId) || projects[0]
    return projects[0]
  }, [projects, route.projectId])

  if (!project) {
    return (
      <div className="max-w-[1100px] mx-auto px-6 py-16 text-center text-slate-500">
        No project selected. <button className="text-indigo-600 hover:underline" onClick={() => setRoute({ tab: 'dashboard' })}>Go to dashboard</button>.
      </div>
    )
  }
  return <ProjectDetailInner key={project.id} project={project} />
}

function ProjectDetailInner({ project }) {
  const { updateProject, deleteProject, setRoute, viewMode, identity } = useStore()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const canEdit = identity.isOwner

  function patch(p) { updateProject(project.id, p) }
  function patchScoring(p) {
    const next = { ...(project.scoring || {}), ...p }
    updateProject(project.id, { scoring: next, score: computeScore(next) })
  }

  const r = ragMeta[project.rag]
  const pr = priorityMeta[project.priority]

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8">
      <div className="mb-4 flex items-center gap-2 text-[12px] text-slate-500">
        <button onClick={() => setRoute({ tab: 'dashboard' })} className="inline-flex items-center gap-1 hover:text-[#0B0D12]">
          <Icon name="arrow-left" size={13} /> Dashboard
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700">{project.category}</span>
        <span className="text-slate-300">/</span>
        <span className="text-[#0B0D12] font-medium truncate">{project.name}</span>
      </div>

      <div className="bg-white rounded-xl shadow-card p-6 mb-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 flex-1">
            <Editable tag="h1" value={project.name} canEdit={canEdit} onCommit={v => patch({ name: v })}
              className="text-[24px] font-semibold tracking-tight leading-tight" />
            <div className="text-[12px] text-slate-500 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="inline-flex items-center gap-1.5">
                <span className="text-slate-400">Category</span>
                <FieldPicker value={project.category} options={gtmCategories} canEdit={canEdit} onChange={v => patch({ category: v })} />
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="text-slate-400">Owner</span>
                <Editable tag="span" canEdit={canEdit} value={project.owner || '—'} onCommit={v => patch({ owner: v.trim() || 'Shivani' })} className="text-slate-700" />
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="text-slate-400">Sponsor</span>
                <Editable tag="span" canEdit={canEdit} value={project.sponsor || '—'} onCommit={v => patch({ sponsor: v })} className="text-slate-700" />
              </span>
              <span className="text-slate-400">Updated <span className="text-slate-700">{project.updated}</span></span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canEdit ? (
              <button onClick={() => patch({ focus: !project.focus })}
                className={'btn-ghost ' + (project.focus ? '!text-amber-600 !border-amber-300 !bg-amber-50' : '')}>
                <Icon name="star" size={13} className={project.focus ? 'text-amber-500' : ''} />
                {project.focus ? 'Pinned to focus' : 'Pin to focus'}
              </button>
            ) : (
              project.focus && (
                <span className="inline-flex items-center gap-1 h-8 px-2.5 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-[12px] font-medium">
                  <Icon name="star" size={13} className="text-amber-500" /> Focus
                </span>
              )
            )}
            {canEdit && <button className="btn-ghost danger" onClick={() => setConfirmDelete(true)}><Icon name="trash-2" size={13} /></button>}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <PickerChip label="Stage" value={project.stage} options={gtmStages} canEdit={canEdit}
            renderValue={v => <span className="font-medium">{v}</span>} onChange={v => patch({ stage: v })} />
          <PickerChip label="RAG" value={project.rag} options={gtmRags} canEdit={canEdit}
            renderValue={v => { const m = ragMeta[v]; return <span className="inline-flex items-center gap-1.5 font-medium" style={{ color: m.chipText }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: m.dot }}></span>{m.label}</span> }}
            renderOption={v => { const m = ragMeta[v]; return <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: m.dot }}></span>{m.label}</span> }}
            chipBg={r.chipBg} onChange={v => patch({ rag: v })} />
          <PickerChip label="Priority" value={project.priority} options={gtmPriorities} canEdit={canEdit}
            renderValue={v => <span className="font-medium" style={{ color: priorityMeta[v].text }}>{priorityMeta[v].label}</span>}
            renderOption={v => priorityMeta[v].label} chipBg={pr.bg} onChange={v => patch({ priority: v })} />
          <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-slate-50 border border-slate-200 text-[12px] text-slate-700" title="Computed from scoring sliders">
            <Icon name="trending-up" size={12} className="text-slate-400" />
            Score <span className="font-semibold tabular-nums ml-1">{project.score}</span>
          </span>
          <DateChip value={project.target} canEdit={canEdit} onChange={v => patch({ target: v })} />
          {canEdit && (
            <PickerChip label="Decision" value={project.decision ? 'yes' : 'no'} options={['yes', 'no']} canEdit={canEdit}
              renderValue={v => v === 'yes' ? <span className="inline-flex items-center gap-1 font-medium text-indigo-700"><Icon name="git-pull-request-draft" size={11} />Needed</span> : <span className="text-slate-500 font-medium">None</span>}
              renderOption={v => v === 'yes' ? 'Needs decision' : 'No decision pending'}
              chipBg={project.decision ? '#EEF2FF' : '#fff'} onChange={v => patch({ decision: v === 'yes' })} />
          )}
          {!canEdit && project.decision && (
            <span className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md bg-indigo-50 text-indigo-700 text-[12px] font-medium border border-indigo-100">
              <Icon name="git-pull-request-draft" size={12} /> Decision needed
            </span>
          )}
        </div>

        <div className="mt-4">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1.5">Stakeholders</div>
          <StakeholderChips items={project.stakeholders || []} canEdit={canEdit} onChange={v => patch({ stakeholders: v })} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <Section title="Why this matters" className="lg:col-span-2">
          <Editable tag="div" canEdit={canEdit} value={project.businessCase || '—'} onCommit={v => patch({ businessCase: v })} />
        </Section>
        <Section title="RAG reason">
          <Editable tag="div" canEdit={canEdit} value={project.ragReason || '—'} onCommit={v => patch({ ragReason: v })} />
        </Section>
        <Section title="Success metrics" className="lg:col-span-2">
          <Editable tag="div" canEdit={canEdit} value={project.successMetrics || '—'} onCommit={v => patch({ successMetrics: v })} />
        </Section>
        <Section title="Target date">
          <DateField value={project.target} canEdit={canEdit} onChange={v => patch({ target: v })} />
        </Section>
        <Section title="Estimated cost">
          <Editable tag="div" canEdit={canEdit} value={project.estCost || '—'} onCommit={v => patch({ estCost: v })} />
        </Section>
        <Section title="Revenue impact" className="lg:col-span-2">
          <Editable tag="div" canEdit={canEdit} value={project.revenueImpact || '—'} onCommit={v => patch({ revenueImpact: v })} />
        </Section>
      </div>

      <div className="bg-indigo-50/60 border border-indigo-200/70 rounded-xl p-5 mb-5">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-md bg-white border border-indigo-200 grid place-items-center text-indigo-600 shrink-0">
            <Icon name="megaphone" size={15} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[14px] font-semibold tracking-tight text-indigo-900 mb-2">Asks of leadership</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-indigo-700/80 font-medium mb-1">The ask</div>
                <Editable tag="div" canEdit={canEdit} value={project.askText || (canEdit ? 'Click to add the ask…' : 'No outstanding ask.')} onCommit={v => patch({ askText: v })} className="text-[13px] text-indigo-900/90 leading-relaxed" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-indigo-700/80 font-medium mb-1">Shivani's recommendation</div>
                <Editable tag="div" canEdit={canEdit} value={project.askRecommendation || (canEdit ? 'Click to add a recommendation…' : '—')} onCommit={v => patch({ askRecommendation: v })} className="text-[13px] text-indigo-900/90 leading-relaxed" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'ops' && (
        <div className="bg-white rounded-xl shadow-card p-6 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-semibold tracking-tight">Operational detail</h3>
            <span className="text-[11px] uppercase tracking-wider text-slate-400">Ops view</span>
          </div>
          <div className="mb-5">
            <h4 className="text-[12px] font-medium text-slate-500 uppercase tracking-wider mb-2">Next actions</h4>
            <ListEditor items={project.nextActions || []} canEdit={canEdit} onChange={v => patch({ nextActions: v })} placeholder="Add a next action…" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <BucketList title="Blockers" tone="rose" items={project.blockers || []} canEdit={canEdit} onChange={v => patch({ blockers: v })} />
            <BucketList title="Dependencies" tone="indigo" items={project.dependencies || []} canEdit={canEdit} onChange={v => patch({ dependencies: v })} />
            <BucketList title="Risks" tone="amber" items={project.risks || []} canEdit={canEdit} onChange={v => patch({ risks: v })} />
          </div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[12px] font-medium text-slate-500 uppercase tracking-wider">Scoring</h4>
            <div className="text-[11px] text-slate-500 inline-flex items-center gap-1.5"><Icon name="info" size={11} />Sliders compute the priority score above</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Slider label="Revenue impact" canEdit={canEdit} value={project.scoring?.revenueImpact ?? 5} onChange={v => patchScoring({ revenueImpact: v })} />
            <Slider label="Strategic fit"  canEdit={canEdit} value={project.scoring?.strategicFit    ?? 5} onChange={v => patchScoring({ strategicFit: v })} />
            <Slider label="Risk if delayed" canEdit={canEdit} value={project.scoring?.riskIfDelayed  ?? 5} onChange={v => patchScoring({ riskIfDelayed: v })} />
            <Slider label="Time to value"  canEdit={canEdit} value={project.scoring?.timeToValue     ?? 5} onChange={v => patchScoring({ timeToValue: v })} sub="fast = high" />
            <Slider label="Effort"         canEdit={canEdit} value={project.scoring?.effort          ?? 5} onChange={v => patchScoring({ effort: v })} sub="high = more" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DecisionsCard project={project} />
        <CommentsCard project={project} />
      </div>

      {confirmDelete && (
        <div className="modal-backdrop" onClick={() => setConfirmDelete(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-semibold tracking-tight">Delete project?</h3>
            <p className="text-[13px] text-slate-600 mt-1">"{project.name}" will be removed from the planner. This cannot be undone.</p>
            <div className="flex justify-end gap-2 mt-5">
              <button className="btn-ghost" onClick={() => setConfirmDelete(false)}>Cancel</button>
              <button className="btn-ghost danger" onClick={() => deleteProject(project.id)}><Icon name="trash-2" size={13} /> Delete project</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ title, children, className = '' }) {
  return (
    <section className={'bg-white rounded-xl shadow-card p-5 ' + className}>
      <h3 className="text-[12px] font-medium text-slate-500 uppercase tracking-wider mb-2">{title}</h3>
      <div className="text-[13px] text-slate-700 leading-relaxed">{children}</div>
    </section>
  )
}

function DateChip({ value, canEdit, onChange }) {
  const ref = useRef(null)
  const iso = value && value !== 'TBD' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : ''
  function openPicker() {
    if (!canEdit || !ref.current) return
    if (ref.current.showPicker) ref.current.showPicker(); else ref.current.focus()
  }
  return (
    <span className={'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-slate-50 border border-slate-200 text-[12px] text-slate-700 ' + (canEdit ? 'cursor-pointer hover:bg-slate-100' : '')} onClick={openPicker}>
      <Icon name="calendar" size={12} className="text-slate-400" />
      <span className="text-slate-400">Target:</span>
      <span className="font-medium">{fmtDate(value)}</span>
      {canEdit && <input type="date" ref={ref} value={iso} onChange={e => onChange(e.target.value || 'TBD')} className="sr-only pointer-events-none" tabIndex="-1" aria-hidden="true" />}
      {canEdit && <Icon name="chevron-down" size={11} className="text-slate-400" />}
    </span>
  )
}

function DateField({ value, canEdit, onChange }) {
  const iso = value && value !== 'TBD' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : ''
  if (!canEdit) return <span className="text-slate-700">{fmtDate(value)}</span>
  return (
    <div className="flex items-center gap-2">
      <input type="date" value={iso} onChange={e => onChange(e.target.value || 'TBD')} className="h-8 px-2.5 rounded-md border border-slate-200 text-[13px] bg-white" />
      {iso && <button onClick={() => onChange('TBD')} className="text-[11px] text-slate-400 hover:text-rose-500 inline-flex items-center gap-1"><Icon name="x" size={11} /> Clear</button>}
      {!iso && <span className="text-[12px] text-slate-400 italic">No target date</span>}
    </div>
  )
}

function Editable({ tag = 'div', value, canEdit, onCommit, className = '' }) {
  const cls = 'whitespace-pre-wrap ' + (canEdit ? 'editable ' : '') + className
  if (tag === 'h1') return <h1 contentEditable={canEdit} suppressContentEditableWarning className={cls} onBlur={e => canEdit && onCommit(e.target.innerText)}>{value}</h1>
  if (tag === 'span') return <span contentEditable={canEdit} suppressContentEditableWarning className={cls} onBlur={e => canEdit && onCommit(e.target.innerText)}>{value}</span>
  return <div contentEditable={canEdit} suppressContentEditableWarning className={cls} onBlur={e => canEdit && onCommit(e.target.innerText)}>{value}</div>
}

function FieldPicker({ value, options, onChange, canEdit }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useClickOutside(ref, () => setOpen(false))
  if (!canEdit) return <span className="text-slate-700">{value}</span>
  return (
    <span className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)} className="text-slate-700 hover:text-indigo-600 inline-flex items-center gap-1 -mx-1 px-1 rounded hover:bg-slate-50">
        {value}<Icon name="chevron-down" size={10} className="text-slate-400" />
      </button>
      {open && (
        <div className="menu" style={{ top: 22, left: 0, minWidth: 180 }}>
          {options.map(o => (
            <button key={o} className="menu-item" onClick={() => { onChange(o); setOpen(false) }}>
              {value === o ? <Icon name="check" size={13} className="text-indigo-600" /> : <span style={{ width: 13 }} />}
              {o}
            </button>
          ))}
        </div>
      )}
    </span>
  )
}

function PickerChip({ label, value, options, onChange, renderValue, renderOption, chipBg, canEdit }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useClickOutside(ref, () => setOpen(false))
  return (
    <span className="relative" ref={ref}>
      <button onClick={() => canEdit && setOpen(v => !v)} disabled={!canEdit}
        className={'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-slate-200 text-[12px] ' + (canEdit ? 'hover:bg-slate-50 cursor-pointer' : 'cursor-default')}
        style={{ background: chipBg || '#fff' }}>
        <span className="text-slate-400">{label}:</span>
        {renderValue ? renderValue(value) : <span className="font-medium">{value}</span>}
        {canEdit && <Icon name="chevron-down" size={11} className="text-slate-400" />}
      </button>
      {open && (
        <div className="menu" style={{ top: 32, left: 0, minWidth: 180 }}>
          {options.map(o => (
            <button key={o} className="menu-item" onClick={() => { onChange(o); setOpen(false) }}>
              {value === o ? <Icon name="check" size={13} className="text-indigo-600" /> : <span style={{ width: 13 }} />}
              {renderOption ? renderOption(o) : o}
            </button>
          ))}
        </div>
      )}
    </span>
  )
}

function StakeholderChips({ items, canEdit, onChange }) {
  const [draft, setDraft] = useState('')
  function add() {
    const v = draft.trim(); if (!v || items.includes(v)) { setDraft(''); return }
    onChange([...items, v]); setDraft('')
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {items.map(s => (
        <span key={s} className="inline-flex items-center gap-1.5 h-7 pl-1.5 pr-2 rounded-full bg-slate-100 text-slate-700 text-[12px] group">
          <span className="h-5 w-5 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 text-white text-[9px] grid place-items-center font-semibold">{s.split(' ').map(x => x[0]).slice(0,2).join('')}</span>
          {s}
          {canEdit && <button onClick={() => onChange(items.filter(x => x !== s))} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 -mr-0.5"><Icon name="x" size={12} /></button>}
        </span>
      ))}
      {canEdit && (
        <span className="inline-flex items-center">
          <input value={draft} onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } if (e.key === 'Backspace' && !draft && items.length) onChange(items.slice(0, -1)) }}
            placeholder="+ Add stakeholder"
            className="h-7 px-2 rounded-full border border-dashed border-slate-300 text-[12px] bg-transparent focus:bg-white focus:border-indigo-400 outline-none w-[160px]" />
        </span>
      )}
      {items.length === 0 && !canEdit && <span className="text-[12px] text-slate-400 italic">No stakeholders listed</span>}
    </div>
  )
}

function ListEditor({ items, onChange, placeholder, canEdit }) {
  const [draft, setDraft] = useState('')
  function add() { if (!draft.trim()) return; onChange([...items, draft.trim()]); setDraft('') }
  return (
    <div className="flex flex-col gap-1.5">
      {items.map((it, i) => (
        <div key={i} className="flex items-start gap-2 group">
          <span className="h-5 w-5 rounded-md border border-slate-300 grid place-items-center text-slate-300 hover:text-indigo-500 cursor-pointer mt-0.5"><Icon name="check" size={11} /></span>
          <span contentEditable={canEdit} suppressContentEditableWarning
            onBlur={e => { if (!canEdit) return; const n = items.slice(); n[i] = e.target.innerText; onChange(n) }}
            className={'flex-1 text-[13px] text-slate-700 ' + (canEdit ? 'editable' : '')}>{it}</span>
          {canEdit && <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500"><Icon name="x" size={13} /></button>}
        </div>
      ))}
      {items.length === 0 && !canEdit && <div className="text-[12px] text-slate-400 italic">No next actions logged.</div>}
      {canEdit && (
        <div className="flex items-center gap-2 mt-1">
          <input value={draft} onChange={e => setDraft(e.target.value)} placeholder={placeholder} onKeyDown={e => e.key === 'Enter' && add()}
            className="flex-1 h-8 px-2.5 rounded-md border border-slate-200 text-[13px]" />
          <button onClick={add} className="btn-ghost" type="button"><Icon name="plus" size={13} /> Add</button>
        </div>
      )}
    </div>
  )
}

function BucketList({ title, tone, items, canEdit, onChange }) {
  const toneMap = { rose: { dot: '#F43F5E', bg: '#FFF1F2', text: '#9F1239' }, amber: { dot: '#F59E0B', bg: '#FFFBEB', text: '#92400E' }, indigo: { dot: '#6366F1', bg: '#EEF2FF', text: '#3730A3' } }
  const t = toneMap[tone]
  const [draft, setDraft] = useState('')
  function add() { if (!draft.trim()) return; onChange([...items, draft.trim()]); setDraft('') }
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <h5 className="text-[11px] uppercase tracking-wider font-medium mb-2 inline-flex items-center gap-1.5" style={{ color: t.text }}>
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: t.dot }}></span>{title}
      </h5>
      <ul className="flex flex-col gap-1 mb-2">
        {items.length === 0 && <li className="text-[12px] text-slate-400 italic">None</li>}
        {items.map((it, i) => (
          <li key={i} className="text-[12px] text-slate-700 inline-flex items-start gap-2 group">
            <span className="text-slate-300 mt-0.5">·</span>
            <span contentEditable={canEdit} suppressContentEditableWarning
              onBlur={e => { if (!canEdit) return; const n = items.slice(); n[i] = e.target.innerText; onChange(n) }}
              className={'flex-1 ' + (canEdit ? 'editable' : '')}>{it}</span>
            {canEdit && <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500"><Icon name="x" size={11} /></button>}
          </li>
        ))}
      </ul>
      {canEdit && (
        <div className="flex items-center gap-1">
          <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder="Add…"
            className="flex-1 h-7 px-2 rounded border border-slate-200 text-[12px]" />
          <button onClick={add} className="h-7 w-7 grid place-items-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50"><Icon name="plus" size={12} /></button>
        </div>
      )}
    </div>
  )
}

function Slider({ label, value, onChange, canEdit, sub }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[12px] mb-1.5">
        <span className="text-slate-600">{label}{sub && <span className="text-[10px] text-slate-400 ml-1">({sub})</span>}</span>
        <span className="font-semibold tabular-nums">{value}<span className="text-slate-400 font-normal">/10</span></span>
      </div>
      <input type="range" min="0" max="10" step="1" value={value} disabled={!canEdit} onChange={e => onChange(parseInt(e.target.value, 10))} className="w-full accent-indigo-600 disabled:opacity-50" />
    </div>
  )
}

function DecisionsCard({ project }) {
  const { updateProject, identity } = useStore()
  const [text, setText] = useState('')
  function add() {
    if (!text.trim()) return
    const d = { id: 'd-' + Math.random().toString(36).slice(2,8), date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }), actor: identity.name, text: text.trim() }
    updateProject(project.id, { decisions: [d, ...(project.decisions || [])] }); setText('')
  }
  function remove(id) { updateProject(project.id, { decisions: (project.decisions || []).filter(d => d.id !== id) }) }
  function edit(id, t) { updateProject(project.id, { decisions: (project.decisions || []).map(d => d.id === id ? { ...d, text: t } : d) }) }
  return (
    <section className="bg-white rounded-xl shadow-card p-5">
      <h3 className="text-[13px] font-semibold tracking-tight mb-3 inline-flex items-center gap-1.5"><Icon name="git-branch" size={13} className="text-slate-400" /> Decisions log</h3>
      <div className="flex flex-col gap-2 mb-3">
        {(project.decisions || []).length === 0 && <div className="text-[12px] text-slate-400 italic">No decisions logged yet.</div>}
        {(project.decisions || []).map(d => {
          const canModify = identity.isOwner || d.actor === identity.name
          return (
            <div key={d.id} className="text-[12px] flex gap-2 group">
              <div className="w-14 shrink-0 text-slate-400 tabular-nums pt-0.5">{d.date}</div>
              <div className="flex-1 min-w-0">
                <span contentEditable={canModify} suppressContentEditableWarning onBlur={e => canModify && edit(d.id, e.target.innerText)} className={'text-slate-700 ' + (canModify ? 'editable' : '')}>{d.text}</span>
                <span className="text-slate-400"> — {d.actor}</span>
              </div>
              {canModify && <button onClick={() => remove(d.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 shrink-0 self-start mt-0.5"><Icon name="x" size={12} /></button>}
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-1.5 pt-3 border-t border-slate-100">
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder="Log a decision…" className="flex-1 h-8 px-2.5 rounded-md border border-slate-200 text-[13px]" />
        <button onClick={add} className="btn-ghost"><Icon name="plus" size={13} /> Log</button>
      </div>
    </section>
  )
}

function CommentsCard({ project }) {
  const { updateProject, identity } = useStore()
  const [text, setText] = useState('')
  function add() {
    if (!text.trim()) return
    const c = { id: 'c-' + Math.random().toString(36).slice(2,8), who: identity.name, when: 'now', text: text.trim() }
    updateProject(project.id, { comments: [...(project.comments || []), c] }); setText('')
  }
  function remove(id) { updateProject(project.id, { comments: (project.comments || []).filter(c => c.id !== id) }) }
  function edit(id, t) { updateProject(project.id, { comments: (project.comments || []).map(c => c.id === id ? { ...c, text: t } : c) }) }
  return (
    <section className="bg-white rounded-xl shadow-card p-5">
      <h3 className="text-[13px] font-semibold tracking-tight mb-3 inline-flex items-center gap-1.5"><Icon name="message-square" size={13} className="text-slate-400" /> Comments</h3>
      <div className="flex flex-col gap-3 mb-3">
        {(project.comments || []).length === 0 && <div className="text-[12px] text-slate-400 italic">No comments yet.</div>}
        {(project.comments || []).map(c => {
          const canModify = identity.isOwner || c.who === identity.name
          return (
            <div key={c.id} className="flex items-start gap-2 group">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-300 to-violet-400 text-white text-[10px] grid place-items-center font-semibold shrink-0">{c.who.split(' ').map(x => x[0]).slice(0,2).join('')}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px]"><span className="font-medium">{c.who}</span> <span className="text-slate-400">· {c.when}</span></div>
                <div className="text-[13px] text-slate-700 mt-0.5">
                  <span contentEditable={canModify} suppressContentEditableWarning onBlur={e => canModify && edit(c.id, e.target.innerText)} className={canModify ? 'editable' : ''}>{c.text}</span>
                </div>
              </div>
              {canModify && <button onClick={() => remove(c.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 self-start mt-1"><Icon name="x" size={12} /></button>}
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-1.5 pt-3 border-t border-slate-100">
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder="Add a comment…" className="flex-1 h-8 px-2.5 rounded-md border border-slate-200 text-[13px]" />
        <button onClick={add} className="btn-ghost"><Icon name="send" size={13} /></button>
      </div>
    </section>
  )
}
