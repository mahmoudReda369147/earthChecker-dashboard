import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Loader2, AlertTriangle, ArrowLeft, Pencil,
  Pause, RotateCcw, XCircle, RefreshCw, AlertOctagon,
  GitBranch, User, Calendar, CalendarClock, Layers,
} from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import Modal      from '../../../components/ui/Modal'
import { useMe }  from '../../auth/apiHooks'
import {
  useCycle, usePauseCycle, useResumeCycle,
  useCancelRequest, useCancelCycle, useRejectCancel,
} from '../apiHooks'

/* ── Status config ───────────────────────────────────────── */
const STATUS_CFG = {
  new:              { label: 'New',              color: '#00d4ff', bg: 'rgba(0,212,255,0.1)',   border: 'rgba(0,212,255,0.3)',  glow: 'rgba(0,212,255,0.15)'   },
  inProgress:       { label: 'In Progress',      color: '#22c55e', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.3)',  glow: 'rgba(34,197,94,0.15)'   },
  paused:           { label: 'Paused',           color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', glow: 'rgba(245,158,11,0.15)'  },
  cancelledRequest: { label: 'Cancel Requested', color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)', glow: 'rgba(249,115,22,0.15)'  },
  cancelled:        { label: 'Cancelled',        color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.3)',  glow: 'rgba(239,68,68,0.15)'   },
  completed:        { label: 'Completed',        color: '#a855f7', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.3)', glow: 'rgba(168,85,247,0.15)'  },
}

/* ── Message modal ───────────────────────────────────────── */
function MessageModal({ open, onClose, title, description, label, onConfirm, isPending, required = true }) {
  const [msg, setMsg] = useState('')
  const handleClose   = () => { setMsg(''); onClose() }
  const handleConfirm = () => { if (required && !msg.trim()) return; onConfirm(msg.trim()); setMsg('') }
  return (
    <Modal open={open} onClose={handleClose} title={title} size="sm">
      <div className="space-y-4">
        <p className="text-[0.85rem] text-steel leading-[1.6]">{description}</p>
        <textarea rows={3} value={msg} onChange={(e) => setMsg(e.target.value)}
          placeholder={required ? 'Required…' : 'Optional note…'}
          className="input-glass w-full resize-none text-[0.82rem]" />
        <div className="flex gap-3">
          <button className="btn-ghost flex-1 justify-center" onClick={handleClose}>Cancel</button>
          <button onClick={handleConfirm} disabled={isPending || (required && !msg.trim())}
            className="flex-1 flex items-center justify-center gap-2 py-[11px] px-6 rounded bg-[rgba(200,121,65,0.12)] border border-[rgba(200,121,65,0.4)] text-copper font-orbitron text-xs font-bold tracking-[0.08em] uppercase transition-all hover:bg-[rgba(200,121,65,0.2)] disabled:opacity-50">
            {isPending && <Loader2 size={13} className="animate-spin" />}
            {label}
          </button>
        </div>
      </div>
    </Modal>
  )
}

/* ── Confirm modal ───────────────────────────────────────── */
function ConfirmModal({ open, onClose, title, description, label, onConfirm, isPending, danger = true }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <p className="text-[0.85rem] text-steel leading-[1.6]">{description}</p>
        <div className="flex gap-3">
          <button className="btn-ghost flex-1 justify-center" onClick={onClose}>Cancel</button>
          <button onClick={onConfirm} disabled={isPending}
            className={`flex-1 flex items-center justify-center gap-2 py-[11px] px-6 rounded font-orbitron text-xs font-bold tracking-[0.08em] uppercase transition-all disabled:opacity-50 ${
              danger
                ? 'bg-[rgba(200,121,65,0.12)] border border-[rgba(200,121,65,0.4)] text-copper hover:bg-[rgba(200,121,65,0.2)]'
                : 'bg-[rgba(52,211,153,0.1)] border border-[rgba(52,211,153,0.35)] text-emerald-400 hover:bg-[rgba(52,211,153,0.18)]'
            }`}>
            {isPending && <Loader2 size={13} className="animate-spin" />}
            {label}
          </button>
        </div>
      </div>
    </Modal>
  )
}

/* ── Detail card ─────────────────────────────────────────── */
function DetailCard({ icon: Icon, label, children, accent }) {
  return (
    <div className="rounded-xl bg-bg-glass backdrop-blur-xl border border-[rgba(143,163,184,0.1)] p-4 space-y-2.5">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md flex items-center justify-center"
          style={{ background: accent ? `${accent}18` : 'rgba(143,163,184,0.08)', border: `1px solid ${accent ? `${accent}30` : 'rgba(143,163,184,0.12)'}` }}>
          <Icon size={11} style={{ color: accent ?? '#8fa3b8' }} />
        </div>
        <span className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-text-muted">{label}</span>
      </div>
      <div className="text-[0.82rem] text-text-primary pl-0.5">{children}</div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   Page
   ════════════════════════════════════════════════════════════ */
export default function CycleDetailPage() {
  const { cycleId } = useParams()
  const navigate    = useNavigate()

  const { data: me } = useMe()
  const isCeo        = me?.role === 'ceo'
  const isSupervisor = me?.role === 'supervisor'

  const { data: cycle, isLoading, isError } = useCycle(cycleId)

  const { mutateAsync: pauseCycle,   isPending: pausing    } = usePauseCycle()
  const { mutateAsync: resumeCycle,  isPending: resuming   } = useResumeCycle()
  const { mutateAsync: cancelReq,    isPending: reqing     } = useCancelRequest()
  const { mutateAsync: cancelCycle,  isPending: cancelling } = useCancelCycle()
  const { mutateAsync: rejectCancel, isPending: rejecting  } = useRejectCancel()

  const [pauseModal,     setPauseModal]     = useState(false)
  const [cancelReqModal, setCancelReqModal] = useState(false)
  const [cancelModal,    setCancelModal]    = useState(false)
  const [rejectModal,    setRejectModal]    = useState(false)

  const doPause     = async (msg) => { await pauseCycle({ id: cycleId, message: msg });  setPauseModal(false)     }
  const doCancelReq = async (msg) => { await cancelReq({ id: cycleId, message: msg });  setCancelReqModal(false) }
  const doCancel    = async ()    => { await cancelCycle(cycleId);                       setCancelModal(false)    }
  const doReject    = async ()    => { await rejectCancel(cycleId);                      setRejectModal(false)    }
  const doResume    = async ()    => { await resumeCycle(cycleId) }

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={28} className="animate-spin text-cyan" />
    </div>
  )
  if (isError || !cycle) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-copper">
      <AlertTriangle size={28} />
      <p className="text-[0.82rem]">Failed to load cycle.</p>
    </div>
  )

  const s          = cycle.status
  const st         = STATUS_CFG[s] ?? STATUS_CFG.new
  const isTerminal = s === 'cancelled' || s === 'completed'
  const pct        = Math.min(100, Math.max(0, cycle.progress ?? 0))
  const barColor   = pct === 100 ? '#a855f7' : pct > 50 ? '#22c55e' : '#00d4ff'

  /* Supervisor avatar parts */
  const sup     = cycle.assignedSupervisor
  const supParts = (sup?.name || '').trim().split(' ')
  const supInit  = ((supParts[0]?.[0] ?? '') + (supParts[1]?.[0] ?? '')).toUpperCase()

  return (
    <div className="space-y-5">

      <PageHeader
        title={cycle.name}
        subtitle={`Cycle · ${cycle.cycleId}`}
        badge="Cycles"
        actions={
          <button className="btn-ghost text-[0.72rem] py-[9px] px-[18px]"
            onClick={() => navigate('/dashboard/cycles')}>
            <ArrowLeft size={13} /> Back
          </button>
        }
      />

      {/* ── Hero card ──────────────────────────────────────── */}
      <div className="rounded-xl bg-bg-glass backdrop-blur-xl border border-[rgba(0,212,255,0.08)] overflow-hidden">
        <div className="h-[3px] bg-gradient-to-r from-cyan via-[rgba(0,180,255,0.5)] to-transparent" />
        <div className="p-6">

          {/* Top row: status + edit */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <span
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[0.72rem] font-bold border"
              style={{ color: st.color, borderColor: st.border, background: st.bg, boxShadow: `0 0 12px ${st.glow}` }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: st.color }} />
              {st.label}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/dashboard/cycles/${cycleId}/stages`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[0.72rem] font-semibold transition-all
                  text-cyan border-[rgba(0,212,255,0.2)] hover:border-[rgba(0,212,255,0.5)] hover:bg-[rgba(0,212,255,0.06)]"
              >
                <Layers size={12} /> Stages
              </button>
              {!isTerminal && (isCeo || isSupervisor) && (
                <button
                  onClick={() => navigate(`/dashboard/cycles/${cycleId}/edit`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[0.72rem] font-semibold transition-all
                    text-steel border-[rgba(143,163,184,0.2)] hover:border-[rgba(0,212,255,0.4)] hover:text-cyan"
                >
                  <Pencil size={12} /> Edit
                </button>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-text-muted">Progress</span>
              <span className="font-orbitron text-[0.75rem] font-bold" style={{ color: barColor }}>{pct}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-[rgba(143,163,184,0.08)] border border-[rgba(143,163,184,0.08)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${barColor}, ${barColor}bb)`, boxShadow: `0 0 10px ${barColor}60` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Actions card (only if not terminal) ────────────── */}
      {!isTerminal && (
        <div className="rounded-xl bg-bg-glass backdrop-blur-xl border border-[rgba(0,212,255,0.08)] overflow-hidden">
          <div className="h-[3px] bg-gradient-to-r from-cyan via-[rgba(0,180,255,0.5)] to-transparent" />
          <div className="p-5">
            <p className="font-orbitron text-[0.6rem] font-bold tracking-[0.16em] uppercase text-text-muted mb-4">
              Actions
            </p>
            <div className="flex flex-wrap gap-2.5">

              {/* Resume */}
              {s === 'paused' && (isCeo || isSupervisor) && (
                <button
                  onClick={doResume} disabled={resuming}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border text-[0.75rem] font-semibold transition-all disabled:opacity-50
                    text-cyan border-[rgba(0,212,255,0.25)] bg-[rgba(0,212,255,0.04)] hover:bg-[rgba(0,212,255,0.1)] hover:border-[rgba(0,212,255,0.5)]"
                >
                  {resuming ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
                  Resume
                </button>
              )}

              {/* Pause */}
              {s === 'inProgress' && (isCeo || isSupervisor) && (
                <button
                  onClick={() => setPauseModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border text-[0.75rem] font-semibold transition-all
                    text-amber-400 border-[rgba(251,191,36,0.25)] bg-[rgba(251,191,36,0.04)] hover:bg-[rgba(251,191,36,0.1)] hover:border-[rgba(251,191,36,0.5)]"
                >
                  <Pause size={13} /> Pause
                </button>
              )}

              {/* Cancel Request */}
              {(s === 'inProgress' || s === 'paused') && isSupervisor && (
                <button
                  onClick={() => setCancelReqModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border text-[0.75rem] font-semibold transition-all
                    text-orange-400 border-[rgba(249,115,22,0.25)] bg-[rgba(249,115,22,0.04)] hover:bg-[rgba(249,115,22,0.1)] hover:border-[rgba(249,115,22,0.5)]"
                >
                  <AlertOctagon size={13} /> Request Cancel
                </button>
              )}

              {/* Reject & Resume */}
              {s === 'cancelledRequest' && isCeo && (
                <button
                  onClick={() => setRejectModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border text-[0.75rem] font-semibold transition-all
                    text-emerald-400 border-[rgba(52,211,153,0.25)] bg-[rgba(52,211,153,0.04)] hover:bg-[rgba(52,211,153,0.1)] hover:border-[rgba(52,211,153,0.5)]"
                >
                  <RefreshCw size={13} /> Reject &amp; Resume
                </button>
              )}

              {/* Cancel */}
              {['new','inProgress','paused','cancelledRequest'].includes(s) && isCeo && (
                <button
                  onClick={() => setCancelModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border text-[0.75rem] font-semibold transition-all
                    text-copper border-[rgba(200,121,65,0.25)] bg-[rgba(200,121,65,0.04)] hover:bg-[rgba(200,121,65,0.1)] hover:border-[rgba(200,121,65,0.5)]"
                >
                  <XCircle size={13} /> Cancel Cycle
                </button>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ── Details grid ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        <DetailCard icon={GitBranch} label="Module" accent="#00d4ff">
          <span className="text-steel">{cycle.moduleId?.name ?? cycle.moduleId?.title ?? '—'}</span>
        </DetailCard>

        <DetailCard icon={User} label="Assigned Supervisor" accent="#c87941">
          {sup ? (
            <div className="flex items-center gap-2.5">
              {sup.image
                ? <img src={sup.image} alt={sup.name} className="w-7 h-7 rounded-full object-cover border border-[rgba(200,121,65,0.3)] shrink-0" />
                : <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-orbitron text-[0.6rem] font-bold"
                    style={{ background: 'rgba(200,121,65,0.12)', color: '#c87941', border: '1px solid rgba(200,121,65,0.25)' }}>
                    {supInit}
                  </div>
              }
              <div>
                <p className="text-[0.8rem] font-semibold text-text-primary leading-none">{sup.name}</p>
                <p className="text-[0.68rem] text-text-muted mt-0.5">{sup.email}</p>
              </div>
            </div>
          ) : <span className="text-text-muted">—</span>}
        </DetailCard>

        <DetailCard icon={Calendar} label="Created" accent="#8fa3b8">
          <span className="text-steel">
            {new Date(cycle.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </DetailCard>

        {cycle.updatedAt && cycle.updatedAt !== cycle.createdAt && (
          <DetailCard icon={CalendarClock} label="Last Updated" accent="#8fa3b8">
            <span className="text-steel">
              {new Date(cycle.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </DetailCard>
        )}

        {/* Pause reason */}
        {s === 'paused' && cycle.pauseMessage && (
          <DetailCard icon={Pause} label="Pause Reason" accent="#f59e0b">
            <p className="text-steel italic leading-[1.6]">"{cycle.pauseMessage}"</p>
          </DetailCard>
        )}

        {/* Cancel request reason */}
        {s === 'cancelledRequest' && cycle.cancelRequestMessage && (
          <DetailCard icon={AlertOctagon} label="Cancel Request Reason" accent="#f97316">
            <p className="text-orange-300 italic leading-[1.6]">"{cycle.cancelRequestMessage}"</p>
          </DetailCard>
        )}

      </div>

      {/* Modals */}
      <MessageModal
        open={pauseModal} onClose={() => setPauseModal(false)}
        title="Pause Cycle"
        description={`Pause "${cycle.name}"?${isSupervisor ? ' A reason is required.' : ' Add an optional note.'}`}
        label="Pause" required={isSupervisor}
        onConfirm={doPause} isPending={pausing}
      />
      <MessageModal
        open={cancelReqModal} onClose={() => setCancelReqModal(false)}
        title="Request Cancellation"
        description={`Request cancellation for "${cycle.name}". Provide a reason for the CEO to review.`}
        label="Send Request" required
        onConfirm={doCancelReq} isPending={reqing}
      />
      <ConfirmModal
        open={cancelModal} onClose={() => setCancelModal(false)}
        title="Cancel Cycle"
        description={`Cancel "${cycle.name}"? This cannot be undone.`}
        label="Cancel Cycle"
        onConfirm={doCancel} isPending={cancelling}
      />
      <ConfirmModal
        open={rejectModal} onClose={() => setRejectModal(false)}
        title="Reject Cancel Request"
        description={`Reject the cancellation request for "${cycle.name}" and resume it as In Progress?`}
        label="Reject & Resume" danger={false}
        onConfirm={doReject} isPending={rejecting}
      />
    </div>
  )
}
