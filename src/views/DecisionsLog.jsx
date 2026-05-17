import { useMemo, useState } from 'react'
import Icon from '../components/Icon'
import { useStore } from '../App'

export default function DecisionsLogView() {
  const { projects, setRoute } = useStore()
  const [filter, setFilter] = useState('all')

  const pending = useMemo(() => projects.filter(p => p.decision), [projects])

  const feed = useMemo(() => {
    const rows = []
    projects.forEach(p => {
      ;(p.decisions || []).forEach(d => rows.push({ ...d, kind: 'decision', project: p, sortKey: parseDate(d.date) }))
      ;(p.comments || []).forEach(c => rows.push({ ...c, kind: 'comment', project: p, sortKey: parseWhen(c.when) }))
    })
    rows.sort((a, b) => b.sortKey - a.sortKey)
    return rows
  }, [projects])

  const filteredFeed = filter === 'decisions' ? feed.filter(f => f.kind === 'decision')
    : filter === 'comments' ? feed.filter(f => f.kind === 'comment')
    : feed

  function parseDate(d) {
    const order = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const m = d && d.match(/(\d+)\s+(\w+)/)
    return m ? (order.indexOf(m[2]) * 31 + parseInt(m[1])) : -1
  }
  function parseWhen(w) {
    if (!w) return -1
    if (w === 'now' || w === 'just now') return 99999
    const h = w.match(/^(\d+)h$/); if (h) return 90000 - parseInt(h[1])
    const d = w.match(/^(\d+)d$/); if (d) return 50000 - parseInt(d[1])
    if (w === 'yesterday') return 49000
    return parseDate(w)
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8">
      <div className="mb-5 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Decisions log</h1>
          <p className="text-[13px] text-slate-500 mt-1">{feed.length} entries across {projects.length} projects · {pending.length} decisions awaiting exec</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button className={'chip ' + (filter === 'all' ? 'active' : '')} onClick={() => setFilter('all')}>All <span className="chip-count tabular-nums">{feed.length}</span></button>
          <button className={'chip ' + (filter === 'decisions' ? 'active' : '')} onClick={() => setFilter('decisions')}>Decisions <span className="chip-count tabular-nums">{feed.filter(f => f.kind === 'decision').length}</span></button>
          <button className={'chip ' + (filter === 'comments' ? 'active' : '')} onClick={() => setFilter('comments')}>Comments <span className="chip-count tabular-nums">{feed.filter(f => f.kind === 'comment').length}</span></button>
        </div>
      </div>

      {pending.length > 0 && (
        <section className="mb-6">
          <h2 className="text-[12px] uppercase tracking-wider text-slate-500 mb-2 font-medium">Awaiting exec decision</h2>
          <div className="flex flex-col gap-2">
            {pending.map(p => (
              <button key={p.id} onClick={() => setRoute({ tab: 'project', projectId: p.id })}
                className="card-hover text-left bg-indigo-50/60 border border-indigo-200/70 rounded-lg p-4 flex items-start gap-3">
                <div className="h-8 w-8 rounded-md bg-white border border-indigo-200 grid place-items-center text-indigo-600 shrink-0"><Icon name="git-pull-request-draft" size={14} /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-indigo-900">{p.name}</div>
                  <div className="text-[12px] text-indigo-900/80 mt-0.5">{p.askText || 'Decision required — see project detail.'}</div>
                </div>
                <span className="text-[11px] text-indigo-700 bg-white border border-indigo-200 rounded-full px-2 py-0.5 shrink-0">by {import_fmtDate(p.target)}</span>
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
            <button key={f.kind + '-' + f.id + '-' + i} onClick={() => setRoute({ tab: 'project', projectId: f.project.id })}
              className="w-full text-left p-4 grid grid-cols-[72px_28px_1fr_auto] gap-3 items-start hover:bg-slate-50">
              <div className="text-[12px] text-slate-400 tabular-nums pt-0.5">{f.date || f.when}</div>
              <div className="h-6 w-6 rounded-md grid place-items-center mt-0.5"
                style={{ background: f.kind === 'decision' ? '#EEF2FF' : '#F1F5F9', color: f.kind === 'decision' ? '#4338CA' : '#475569' }}>
                <Icon name={f.kind === 'decision' ? 'git-branch' : 'message-square'} size={12} />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] text-slate-800">{f.text}</div>
                <div className="text-[11px] text-slate-500 mt-1 inline-flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1"><Icon name="folder" size={11} /> {f.project.name}</span>
                  <span>·</span>
                  <span>{f.actor || f.who}</span>
                  {f.kind === 'decision' && <><span>·</span><span className="text-indigo-600">Decision</span></>}
                </div>
              </div>
              <span className="text-slate-300 self-center"><Icon name="chevron-right" size={14} /></span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

// local alias to avoid import collision
function import_fmtDate(iso) {
  if (!iso || iso === 'TBD') return 'TBD'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
