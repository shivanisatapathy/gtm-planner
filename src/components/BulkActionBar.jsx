import { useState, useRef } from 'react'
import Icon from './Icon'
import { useStore, useClickOutside } from '../App'
import { gtmStages, gtmRags, gtmPriorities, ragMeta, priorityMeta } from '../data'

export default function BulkActionBar() {
  const { selection, projects, clearSelection, bulkUpdate, bulkDelete, exportSelectedCsv } = useStore()
  const [confirmDel, setConfirmDel] = useState(false)

  const owners = [...new Set(projects.map(p => p.owner).filter(Boolean))].sort()
  const count = selection.length

  return (
    <>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#0B0D12] text-white rounded-xl shadow-pop flex items-center gap-1 px-2 py-2 flex-wrap max-w-[96vw]">
        <span className="text-[12px] font-medium px-2.5 inline-flex items-center gap-1.5">
          <Icon name="check-square" size={13} className="text-indigo-300" />
          {count} selected
        </span>
        <span className="h-5 w-px bg-white/15 mx-1" />

        <BulkMenu icon="signal" label="RAG"
          options={gtmRags.map(v => ({ value: v, label: ragMeta[v].label, dot: ragMeta[v].dot }))}
          onPick={v => bulkUpdate({ rag: v })} />

        <BulkMenu icon="flag" label="Priority"
          options={gtmPriorities.map(v => ({ value: v, label: priorityMeta[v].label, dot: priorityMeta[v].text }))}
          onPick={v => bulkUpdate({ priority: v })} />

        <BulkMenu icon="git-branch" label="Stage"
          options={gtmStages.map(v => ({ value: v, label: v }))}
          onPick={v => bulkUpdate({ stage: v })} />

        {owners.length > 0 && (
          <BulkMenu icon="user" label="Owner"
            options={owners.map(v => ({ value: v, label: v }))}
            onPick={v => bulkUpdate({ owner: v })} />
        )}

        <span className="h-5 w-px bg-white/15 mx-1" />

        <BulkToggle icon="star" label="Focus" onYes={() => bulkUpdate({ focus: true })} onNo={() => bulkUpdate({ focus: false })} />
        <BulkToggle icon="git-pull-request-draft" label="Decision" onYes={() => bulkUpdate({ decision: true })} onNo={() => bulkUpdate({ decision: false })} />

        <span className="h-5 w-px bg-white/15 mx-1" />

        <button onClick={exportSelectedCsv} className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-[12px] hover:bg-white/10">
          <Icon name="download" size={12} /> Export CSV
        </button>
        <button onClick={() => setConfirmDel(true)} className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-[12px] text-rose-300 hover:bg-rose-500/20">
          <Icon name="trash-2" size={12} /> Delete
        </button>

        <span className="h-5 w-px bg-white/15 mx-1" />

        <button onClick={clearSelection} className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-[12px] text-slate-300 hover:bg-white/10">
          <Icon name="x" size={12} /> Clear
        </button>
      </div>

      {confirmDel && (
        <div className="modal-backdrop" onClick={() => setConfirmDel(false)}>
          <div className="modal" style={{ width: 420 }} onClick={e => e.stopPropagation()}>
            <h3 className="text-[15px] font-semibold tracking-tight mb-2">Delete {count} {count === 1 ? 'project' : 'projects'}?</h3>
            <p className="text-[13px] text-slate-600 mb-5">This permanently removes the selected projects and their decisions, comments, and history. This cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button className="btn-ghost" onClick={() => setConfirmDel(false)}>Cancel</button>
              <button className="btn-ghost danger" onClick={() => { bulkDelete(); setConfirmDel(false) }}>
                <Icon name="trash-2" size={12} /> Delete {count}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function BulkMenu({ icon, label, options, onPick }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useClickOutside(ref, () => setOpen(false))
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)} className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-[12px] hover:bg-white/10">
        <Icon name={icon} size={12} /> {label}
        <Icon name="chevron-up" size={11} className="text-slate-400" />
      </button>
      {open && (
        <div className="menu" style={{ bottom: 38, left: 0, minWidth: 160 }}>
          {options.map(o => (
            <button key={o.value} className="menu-item" onClick={() => { onPick(o.value); setOpen(false) }}>
              {o.dot && <span className="h-1.5 w-1.5 rounded-full" style={{ background: o.dot }} />}
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function BulkToggle({ icon, label, onYes, onNo }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useClickOutside(ref, () => setOpen(false))
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)} className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-[12px] hover:bg-white/10">
        <Icon name={icon} size={12} /> {label}
        <Icon name="chevron-up" size={11} className="text-slate-400" />
      </button>
      {open && (
        <div className="menu" style={{ bottom: 38, left: 0, minWidth: 140 }}>
          <button className="menu-item" onClick={() => { onYes(); setOpen(false) }}><Icon name="check" size={12} className="text-emerald-600" /> Mark on</button>
          <button className="menu-item" onClick={() => { onNo(); setOpen(false) }}><Icon name="x" size={12} className="text-slate-400" /> Mark off</button>
        </div>
      )}
    </div>
  )
}
