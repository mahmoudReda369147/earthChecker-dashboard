import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Plus, ThumbsUp, ThumbsDown, Pencil, Trash2,
  ChevronLeft, ChevronRight, Loader2, ImagePlus, AlertTriangle, X,
} from 'lucide-react'
import { useAgents, useDeleteAgent } from '../apiHooks'

/* ─── helpers ─────────────────────────────────────────────── */
function fmt(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(n)
}

/* ─── SVG Ring ─────────────────────────────────────────────── */
function Ring({ value, size = 44, strokeW = 3.5, color = '#22c55e', bg = 'rgba(34,197,94,0.15)' }) {
  const r    = (size - strokeW * 2) / 2
  const circ = 2 * Math.PI * r
  const dash = circ - (Math.min(value, 100) / 100) * circ
  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={bg} strokeWidth={strokeW} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeW}
          strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${color}88)` }} />
      </svg>
      <span className="absolute font-bold text-[0.6rem] leading-none" style={{ color }}>{value}</span>
    </div>
  )
}

/* ─── Stat Circle ─────────────────────────────────────────── */
function StatCircle({ value, color, bg }) {
  return (
    <div
      className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[0.6rem] font-bold shrink-0"
      style={{ background: bg, color, boxShadow: `0 0 8px ${color}44` }}
    >
      {fmt(value)}
    </div>
  )
}

/* ─── Agent Card ─────────────────────────────────────────────── */
function AgentCard({ agent, onEdit, onDelete }) {
  const stats    = agent.analysisStats ?? {}
  const total    = stats.total ?? 0
  const passRate = total > 0 ? Math.round(((stats.pass ?? 0) / total) * 100) : 0

  return (
    <div className="rounded-xl overflow-hidden bg-bg-glass backdrop-blur-xl border border-[rgba(143,163,184,0.13)] shadow-glass transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(0,212,255,0.25)] hover:shadow-glass-hover group">

      {/* ── Image ── */}
      <div className="relative h-[188px] overflow-hidden bg-[rgba(0,212,255,0.03)] cursor-pointer" onClick={() => onEdit(agent._id)}>
        {agent.image ? (
          <img
            src={agent.image}
            alt={agent.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 opacity-40 group-hover:opacity-60 transition-opacity">
              <ImagePlus size={32} className="text-cyan" />
              <span className="text-[0.65rem] text-steel">No image</span>
            </div>
          </div>
        )}

        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(6,8,16,0.75)] via-transparent to-transparent" />

        {/* Hover CTA */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <span className="px-4 py-1.5 rounded-full bg-[rgba(0,212,255,0.18)] border border-[rgba(0,212,255,0.4)] text-cyan text-[0.72rem] font-semibold backdrop-blur-sm shadow-glow-sm">
            View Agent →
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-5 pt-4 pb-5 flex flex-col gap-3.5">

        {/* Title + description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-orbitron text-[0.9rem] font-bold text-text-primary leading-snug group-hover:text-cyan transition-colors line-clamp-1">
              {agent.name}
            </h3>
            {agent.criticalInspection && (
              <span className="px-2 py-0.5 rounded-full bg-[rgba(200,121,65,0.15)] border border-[rgba(200,121,65,0.3)] text-copper text-[0.62rem] font-bold tracking-wide uppercase shrink-0">
                Critical
              </span>
            )}
          </div>
          <p className="text-[0.76rem] text-steel leading-[1.65] line-clamp-2 min-h-[2.4em]">
            {agent.description || 'No description provided.'}
          </p>
          <div className="flex items-center gap-2 pt-1 text-[0.68rem] text-text-muted">
            <span>Compliance Threshold:</span>
            <span className="font-orbitron font-semibold text-cyan">{agent.complianceThreshold ?? 80}%</span>
          </div>
        </div>

        {/* Stats bar — dark rounded row */}
        <div className="flex items-center gap-2.5 py-2.5 px-3 rounded-lg bg-[rgba(0,0,0,0.3)] border border-[rgba(143,163,184,0.07)]">
          {/* Pass rate ring */}
          <Ring value={passRate} size={42} strokeW={3} color="#22c55e" bg="rgba(34,197,94,0.15)" />

          {/* Total */}
          <div className="flex-1 min-w-0 pl-0.5">
            <p className="text-[0.5rem] text-text-muted uppercase tracking-[0.08em] font-medium">Total</p>
            <p className="text-[1rem] font-bold text-text-primary leading-tight">{fmt(total)}</p>
          </div>

          {/* Pass label + circle */}
          <div className="flex flex-col items-center gap-1">
            <p className="text-[0.48rem] text-text-muted uppercase tracking-[0.06em]">Pass</p>
            <StatCircle value={stats.pass ?? 0} color="#22c55e" bg="rgba(34,197,94,0.15)" />
          </div>

          {/* Fail circle */}
          <div className="flex flex-col items-center gap-1">
            <p className="text-[0.48rem] text-text-muted uppercase tracking-[0.06em]">Fail</p>
            <StatCircle value={stats.fail ?? 0} color="#ef4444" bg="rgba(239,68,68,0.15)" />
          </div>
        </div>

        {/* Likes / Dislikes row */}
        <div className="flex items-center gap-4 px-1">
          <div className="flex items-center gap-1.5">
            <ThumbsUp size={13} strokeWidth={1.8} className="text-cyan" />
            <span className="text-[0.72rem] font-semibold text-text-primary">{fmt(stats.likes ?? 0)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ThumbsDown size={13} strokeWidth={1.8} className="text-copper" />
            <span className="text-[0.72rem] font-semibold text-text-primary">{fmt(stats.dislikes ?? 0)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1 border-t border-[rgba(143,163,184,0.08)]">
          <button
            onClick={() => onEdit(agent._id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[0.73rem] font-semibold text-steel border border-[rgba(143,163,184,0.16)] bg-transparent transition-all hover:border-[rgba(0,212,255,0.3)] hover:text-text-primary hover:bg-[rgba(0,212,255,0.04)]"
          >
            <Pencil size={11} /> Update
          </button>
          <button
            onClick={() => onDelete(agent)}
            title="Delete agent"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[0.73rem] font-semibold text-copper border border-[rgba(200,121,65,0.22)] bg-[rgba(200,121,65,0.04)] transition-all hover:border-[rgba(200,121,65,0.5)] hover:bg-[rgba(200,121,65,0.1)]"
          >
            <Trash2 size={11} /> Delete
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Pagination ─────────────────────────────────────────────── */
function Pagination({ pagination, onPage }) {
  if (!pagination || pagination.totalPages <= 1) return null
  const { page, totalPages } = pagination

  const pages = []
  const last  = totalPages
  const add   = (n) => { if (n >= 1 && n <= last && !pages.includes(n)) pages.push(n) }
  add(1)
  for (let i = page - 1; i <= page + 1; i++) add(i)
  add(last)
  pages.sort((a, b) => a - b)

  const items = []
  for (let i = 0; i < pages.length; i++) {
    if (i > 0 && pages[i] - pages[i - 1] > 1) items.push('...')
    items.push(pages[i])
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10">
      <button onClick={() => onPage(page - 1)} disabled={!pagination.hasPrev}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-steel border border-[rgba(143,163,184,0.15)] bg-bg-glass hover:border-cyan-muted hover:text-cyan disabled:opacity-30 transition-all">
        <ChevronLeft size={13} />
      </button>
      {items.map((item, i) =>
        item === '...' ? (
          <span key={`dots-${i}`} className="w-6 text-center text-[0.72rem] text-text-muted select-none">…</span>
        ) : (
          <button key={item} onClick={() => onPage(item)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-[0.78rem] font-semibold transition-all ${
              page === item
                ? 'bg-cyan text-[#060810] shadow-[0_0_16px_rgba(0,212,255,0.45)]'
                : 'border border-[rgba(143,163,184,0.15)] bg-bg-glass text-steel hover:border-cyan-muted hover:text-cyan'
            }`}>{item}</button>
        )
      )}
      <button onClick={() => onPage(page + 1)} disabled={!pagination.hasNext}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-steel border border-[rgba(143,163,184,0.15)] bg-bg-glass hover:border-cyan-muted hover:text-cyan disabled:opacity-30 transition-all">
        <ChevronRight size={13} />
      </button>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════ */
export default function AIAgentsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parseInt(searchParams.get('page') || '1', 10)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data, isLoading, isError } = useAgents({ page, limit: 9 })
  const { mutateAsync: deleteAgent, isPending: deleting } = useDeleteAgent()

  const agents     = data?.agents     ?? []
  const pagination = data?.pagination ?? null

  const setPage = (p) => {
    const nextParams = new URLSearchParams(searchParams)
    if (p > 1) {
      nextParams.set('page', p)
    } else {
      nextParams.delete('page')
    }
    setSearchParams(nextParams, { replace: true })
  }

  const handleDelete = async () => {
    await deleteAgent(deleteTarget._id)
    setDeleteTarget(null)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-7">
        <div>
          <h1 className="font-orbitron text-[1.45rem] font-bold text-text-primary tracking-tight">AI Agents</h1>
          <p className="text-[0.78rem] text-steel mt-1">
            Manage your AI-powered quality inspection agents
          </p>
        </div>
        <button onClick={() => navigate('/dashboard/agents/create')} className="btn-primary text-[0.73rem] py-[10px] px-5 shrink-0">
          <Plus size={13} strokeWidth={2.5} /> Create Agent
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-cyan" />
        </div>
      )}
      {isError && (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-copper">
          <AlertTriangle size={32} />
          <p className="text-[0.85rem]">Failed to load agents. Please try again.</p>
        </div>
      )}
      {!isLoading && !isError && agents.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-text-muted">
          <ImagePlus size={40} className="text-[rgba(0,212,255,0.15)]" />
          <p className="text-[0.85rem]">No agents yet. Create your first one!</p>
        </div>
      )}
      {!isLoading && agents.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {agents.map(agent => (
              <AgentCard key={agent._id} agent={agent}
                onEdit={(id) => navigate(`/dashboard/agents/${id}/update`)}
                onDelete={setDeleteTarget} />
            ))}
          </div>
          <Pagination pagination={pagination} onPage={setPage} />
        </>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(6,8,16,0.75)] backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-bg-glass border border-[rgba(143,163,184,0.12)] p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <h3 className="font-orbitron text-[1rem] font-bold text-text-primary">Delete Agent</h3>
              <button onClick={() => setDeleteTarget(null)} className="text-steel hover:text-text-primary">
                <X size={16} />
              </button>
            </div>
            <p className="text-[0.83rem] text-steel leading-[1.7]">
              Are you sure you want to delete{' '}
              <span className="text-text-primary font-semibold">{deleteTarget.name}</span>?
            </p>
            <div className="flex gap-3 pt-1">
              <button className="btn-ghost flex-1 justify-center" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button disabled={deleting} onClick={handleDelete}
                className="flex-1 flex items-center justify-center gap-2 py-[11px] px-6 rounded bg-[rgba(200,121,65,0.12)] border border-[rgba(200,121,65,0.4)] text-copper font-orbitron text-xs font-bold tracking-[0.08em] uppercase transition-all hover:bg-[rgba(200,121,65,0.2)] disabled:opacity-50">
                {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
