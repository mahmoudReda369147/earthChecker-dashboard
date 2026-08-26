import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Loader2, AlertTriangle, Plus, Pencil, Trash2,
  Search, Eye,
} from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import Modal      from '../../../components/ui/Modal'
import DataTable  from '../../../components/ui/DataTable'
import Dropdown   from '../../../components/ui/Dropdown'
import { useMe }  from '../../auth/apiHooks'
import { useCycles, useDeleteCycle } from '../apiHooks'

/* ── Status config ───────────────────────────────────────── */
const STATUS = {
  new:              { label: 'New',              color: '#8fa3b8', bg: 'rgba(143,163,184,0.08)', border: 'rgba(143,163,184,0.2)'  },
  inProgress:       { label: 'In Progress',      color: '#00d4ff', bg: 'rgba(0,212,255,0.08)',   border: 'rgba(0,212,255,0.22)'   },
  paused:           { label: 'Paused',           color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.22)'  },
  cancelledRequest: { label: 'Cancel Requested', color: '#f97316', bg: 'rgba(249,115,22,0.09)',  border: 'rgba(249,115,22,0.28)'  },
  cancelled:        { label: 'Cancelled',        color: '#ef4444', bg: 'rgba(239,68,68,0.06)',   border: 'rgba(239,68,68,0.18)'   },
  completed:        { label: 'Completed',        color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.22)'  },
}

/* ── Progress bar ────────────────────────────────────────── */
function ProgressBar({ value }) {
  const pct   = Math.min(100, Math.max(0, value ?? 0))
  const color = pct === 100 ? '#34d399' : pct > 50 ? '#00d4ff' : '#f59e0b'
  return (
    <div className="flex items-center gap-2 min-w-[90px]">
      <div className="flex-1 h-1.5 rounded-full bg-[rgba(143,163,184,0.1)] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[0.68rem] text-text-muted tabular-nums w-7 text-right">{pct}%</span>
    </div>
  )
}

/* ── Status badge ────────────────────────────────────────── */
function StatusBadge({ status }) {
  const s = STATUS[status] ?? STATUS.new
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[0.67rem] font-bold border whitespace-nowrap"
      style={{ color: s.color, background: s.bg, borderColor: s.border }}>
      {s.label}
    </span>
  )
}

/* ── Supervisor cell ─────────────────────────────────────── */
function SupervisorCell({ supervisor }) {
  if (!supervisor) return <span className="text-[0.78rem] text-text-muted">—</span>
  const parts    = (supervisor.name || '').trim().split(' ')
  const initials = ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
  return (
    <div className="flex items-center gap-2">
      {supervisor.image
        ? <img src={supervisor.image} alt={supervisor.name} className="w-6 h-6 rounded-full object-cover border border-[rgba(0,212,255,0.18)] shrink-0" />
        : <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-orbitron text-[0.55rem] font-bold text-cyan bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.18)]">{initials}</div>
      }
      <span className="text-[0.78rem] text-steel">{supervisor.name}</span>
    </div>
  )
}

/* ── Confirm modal ───────────────────────────────────────── */
function ConfirmModal({ open, onClose, title, description, label, onConfirm, isPending }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <p className="text-[0.85rem] text-steel leading-[1.6]">{description}</p>
        <div className="flex gap-3">
          <button className="btn-ghost flex-1 justify-center" onClick={onClose}>Cancel</button>
          <button onClick={onConfirm} disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 py-[11px] px-6 rounded bg-[rgba(200,121,65,0.12)] border border-[rgba(200,121,65,0.4)] text-copper font-orbitron text-xs font-bold tracking-[0.08em] uppercase transition-all hover:bg-[rgba(200,121,65,0.2)] disabled:opacity-50">
            {isPending && <Loader2 size={13} className="animate-spin" />}
            {label}
          </button>
        </div>
      </div>
    </Modal>
  )
}

/* ── Columns ─────────────────────────────────────────────── */
const COLUMNS = [
  { key: 'cycleId',    label: 'ID',         width: '100px'  },
  { key: 'name',       label: 'Name'                        },
  { key: 'module',     label: 'Module',     width: '140px'  },
  { key: 'supervisor', label: 'Supervisor', width: '160px'  },
  { key: 'status',     label: 'Status',     align: 'center', width: '160px' },
  { key: 'progress',   label: 'Progress',   width: '130px'  },
  { key: 'stages',     label: 'Stages',     align: 'center', width: '90px'  },
  { key: 'actions',    label: 'Actions',    align: 'right',  width: '110px' },
]
const PER_PAGE = 10

/* ════════════════════════════════════════════════════════════
   Page
   ════════════════════════════════════════════════════════════ */
export default function CyclesPage() {
  const navigate = useNavigate()
  const { data: me } = useMe()
  const isCEO        = me?.role === 'ceo'
  const isSupervisor = me?.role === 'supervisor'

  const [page,    setPage]    = useState(1)
  const [search,  setSearch]  = useState('')
  const [statusF, setStatusF] = useState('')

  const { data, isLoading, isError } = useCycles({ page, limit: PER_PAGE, search, status: statusF })
  const cycles = data?.cycles     ?? []
  const total  = data?.pagination?.total ?? 0

  const { mutateAsync: deleteCycle, isPending: deleting } = useDeleteCycle()
  const [deleteTarget, setDeleteTarget] = useState(null)
  const doDelete = async () => { await deleteCycle(deleteTarget._id); setDeleteTarget(null) }

  const b      = 'w-7 h-7 rounded-lg flex items-center justify-center transition-all'
  const ghost  = `${b} text-steel border border-[rgba(143,163,184,0.15)] hover:border-[rgba(0,212,255,0.35)] hover:text-cyan`
  const danger = `${b} text-copper border border-[rgba(200,121,65,0.2)] hover:border-[rgba(200,121,65,0.5)] hover:bg-[rgba(200,121,65,0.08)]`
  const cyanBtn= `${b} text-cyan border border-[rgba(0,212,255,0.2)] hover:border-[rgba(0,212,255,0.5)] hover:bg-[rgba(0,212,255,0.06)]`

  const renderCell = (key, c) => {
    switch (key) {
      case 'cycleId':
        return <span className="font-orbitron text-[0.68rem] font-bold text-cyan tracking-[0.06em]">{c.cycleId}</span>
      case 'name':
        return <span className="text-[0.82rem] font-semibold text-text-primary">{c.name}</span>
      case 'module':
        return <span className="text-[0.78rem] text-steel">{c.moduleId?.title ?? c.moduleId?.name ?? '—'}</span>
      case 'supervisor':
        return <SupervisorCell supervisor={c.assignedSupervisor} />
      case 'status':
        return (
          <div className="flex flex-col items-center gap-1">
            <StatusBadge status={c.status} />
            {c.status === 'paused' && c.pauseMessage && (
              <span className="text-[0.62rem] text-text-muted italic max-w-[130px] truncate" title={c.pauseMessage}>"{c.pauseMessage}"</span>
            )}
            {c.status === 'cancelledRequest' && c.cancelRequestMessage && (
              <span className="text-[0.62rem] text-orange-400 italic max-w-[130px] truncate" title={c.cancelRequestMessage}>"{c.cancelRequestMessage}"</span>
            )}
          </div>
        )
      case 'progress':
        return <ProgressBar value={c.progress} />
      case 'stages':
        return (
          <Link
            to={`/dashboard/cycles/${c._id}/stages`}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[0.7rem] font-semibold text-cyan border border-[rgba(0,212,255,0.2)] bg-[rgba(0,212,255,0.04)] hover:border-[rgba(0,212,255,0.45)] hover:bg-[rgba(0,212,255,0.1)] transition-all"
          >
            <Eye size={11} /> Stages
          </Link>
        )
      case 'actions':
        return (
          <div className="flex items-center justify-end gap-1.5">
            {/* Preview */}
            <button
              onClick={() => navigate(`/dashboard/cycles/${c._id}`)}
              title="View details"
              className={cyanBtn}
            >
              <Eye size={12} />
            </button>
            {/* Edit (CEO & Supervisor, not terminal) */}
            {!['cancelled','completed'].includes(c.status) && (isCEO || isSupervisor) && (
              <button
                onClick={() => navigate(`/dashboard/cycles/${c._id}/edit`)}
                title="Edit"
                className={ghost}
              >
                <Pencil size={12} />
              </button>
            )}
            {/* Delete (CEO only) */}
            {isCEO && (
              <button
                onClick={() => setDeleteTarget(c)}
                title="Delete"
                className={danger}
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div>
      <PageHeader
        title="Cycles"
        subtitle="Manage inspection cycles and track progress"
        badge="Operations"
        actions={(isCEO || isSupervisor) && (
          <button className="btn-primary text-[0.72rem] py-[9px] px-[18px]"
            onClick={() => navigate('/dashboard/cycles/create')}>
            <Plus size={13} /> New Cycle
          </button>
        )}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input type="text" placeholder="Search name or ID…" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-8 pr-3 py-[9px] rounded-lg bg-bg-glass backdrop-blur-lg border border-[rgba(143,163,184,0.12)] text-[0.8rem] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-[rgba(0,212,255,0.35)] transition-colors" />
        </div>
        <div className="ml-auto">
          <Dropdown
            value={statusF}
            onChange={(val) => { setStatusF(val); setPage(1) }}
            placeholder="All Statuses"
            className="w-[180px]"
            options={[
              { value: '', label: 'All Statuses' },
              ...Object.entries(STATUS).map(([val, s]) => ({ value: val, label: s.label })),
            ]}
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40"><Loader2 size={24} className="animate-spin text-cyan" /></div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center h-40 gap-3 text-copper">
          <AlertTriangle size={28} /><p className="text-[0.82rem]">Failed to load cycles.</p>
        </div>
      ) : (
        <DataTable columns={COLUMNS} rows={cycles} renderCell={renderCell}
          total={total} page={page} perPage={PER_PAGE} onPageChange={setPage}
          emptyMessage="No cycles yet. Create your first one!"
          entityLabel="cycles"
        />
      )}

      {/* Delete confirm */}
      <ConfirmModal
        open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        title="Delete Cycle"
        description={`Permanently delete "${deleteTarget?.name}"? This action cannot be undone.`}
        label="Delete" onConfirm={doDelete} isPending={deleting}
      />
    </div>
  )
}
