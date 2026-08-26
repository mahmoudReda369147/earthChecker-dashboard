import { useParams, useNavigate } from 'react-router-dom'
import {
  Loader2, AlertTriangle, ArrowLeft, Lock,
  CheckCircle2, ChevronRight, FileText, User, Clock,
} from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import { useMe }  from '../../auth/apiHooks'
import { useCycle } from '../apiHooks'
import { useCycleStages } from '../../stages/apiHooks'

/* ── Status config ───────────────────────────────────────── */
const CYCLE_STATUS = {
  new:              { label: 'New',              color: '#00d4ff' },
  inProgress:       { label: 'In Progress',      color: '#22c55e' },
  paused:           { label: 'Paused',           color: '#f59e0b' },
  cancelledRequest: { label: 'Cancel Requested', color: '#f97316' },
  cancelled:        { label: 'Cancelled',        color: '#ef4444' },
  completed:        { label: 'Completed',        color: '#a855f7' },
}

/* ── Stage card ──────────────────────────────────────────── */
function StageCard({ index, stage, onSubmit, canSubmit }) {
  const form        = stage.formId
  const isSubmitted = stage.status === 'submitted'
  const isAvailable = stage.status === 'available' && canSubmit
  const isLocked    = stage.status === 'locked' || (stage.status === 'available' && !canSubmit)

  const fieldCount = (form?.sections ?? []).filter((s) => s.type !== 'note').length
  const accent = isSubmitted ? '#22c55e' : isAvailable ? '#00d4ff' : '#4a5568'

  return (
    <div
      className={`group relative rounded-2xl border backdrop-blur-xl transition-all duration-300 overflow-hidden flex flex-col ${
        isSubmitted
          ? 'bg-[rgba(34,197,94,0.03)] border-[rgba(34,197,94,0.15)] hover:border-[rgba(34,197,94,0.3)]'
          : isAvailable
          ? 'bg-bg-glass border-[rgba(0,212,255,0.15)] hover:border-[rgba(0,212,255,0.35)] shadow-[0_0_30px_rgba(0,212,255,0.04)] hover:shadow-[0_4px_40px_rgba(0,212,255,0.1)]'
          : 'bg-[rgba(20,24,36,0.7)] border-[rgba(143,163,184,0.1)]'
      } ${isAvailable ? 'cursor-pointer' : ''}`}
      onClick={isAvailable ? onSubmit : undefined}
    >
      {/* ── Thumbnail area (file icon) ── */}
      <div className={`relative h-[140px] flex items-center justify-center transition-all duration-300 ${
        isSubmitted
          ? 'bg-[rgba(34,197,94,0.06)]'
          : isAvailable
          ? 'bg-[rgba(0,212,255,0.04)] group-hover:bg-[rgba(0,212,255,0.07)]'
          : 'bg-[rgba(30,35,50,0.6)]'
      }`}>
        {/* Background pattern lines */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: `repeating-linear-gradient(0deg, ${accent}, ${accent} 1px, transparent 1px, transparent 20px)` }} />

        {/* File icon + lock stacked */}
        <div className="flex flex-col items-center gap-2">
          <FileText size={44} style={{ color: accent }}
            className={`transition-all duration-300 ${isAvailable ? 'opacity-60 group-hover:scale-110 group-hover:opacity-80' : isLocked ? 'opacity-40' : 'opacity-60'}`} />
          {isLocked && (
            <div className="flex items-center gap-1.5 text-[rgba(143,163,184,0.45)]">
              <Lock size={12} />
              <span className="text-[0.62rem] font-semibold uppercase tracking-[0.06em]">Locked</span>
            </div>
          )}
        </div>

        {/* Stage number — top left */}
        <div className="absolute top-3 left-3 w-7 h-7 rounded-lg flex items-center justify-center font-orbitron text-[0.6rem] font-black"
          style={{ background: `${accent}15`, border: `1px solid ${accent}30`, color: accent }}>
          {index + 1}
        </div>

        {/* Status badge — top right */}
        <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.58rem] font-bold uppercase tracking-[0.06em]"
          style={{ background: `${accent}15`, border: `1px solid ${accent}25`, color: accent }}>
          {isSubmitted ? <CheckCircle2 size={10} /> : isLocked ? <Lock size={10} /> : <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent }} />}
          {isSubmitted ? 'Done' : isAvailable ? 'Ready' : 'Locked'}
        </div>

        {/* Bottom gradient fade */}
        <div className={`absolute bottom-0 left-0 right-0 h-8 ${
          isLocked
            ? 'bg-gradient-to-t from-[rgba(20,24,36,0.8)] to-transparent'
            : 'bg-gradient-to-t from-[rgba(6,8,16,0.6)] to-transparent'
        }`} />
      </div>

      {/* ── Content area ── */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Title */}
        <h3 className={`text-[0.9rem] font-bold leading-tight ${isLocked ? 'text-[rgba(143,163,184,0.55)]' : 'text-text-primary'}`}>
          {form?.name ?? '—'}
        </h3>

        {/* Description */}
        {form?.description ? (
          <p className={`text-[0.72rem] mt-1.5 leading-[1.6] line-clamp-2 ${isLocked ? 'text-[rgba(143,163,184,0.35)]' : 'text-steel'}`}>
            {form.description}
          </p>
        ) : (
          <p className={`text-[0.72rem] mt-1.5 italic ${isLocked ? 'text-[rgba(143,163,184,0.25)]' : 'text-text-muted/30'}`}>No description</p>
        )}

        {/* Spacer */}
        <div className="flex-1 min-h-[8px]" />

        {/* Divider */}
        <div className={`h-px my-3 ${isLocked ? 'bg-[rgba(143,163,184,0.06)]' : 'bg-[rgba(143,163,184,0.07)]'}`} />

        {/* Footer: meta + action */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <span className={`flex items-center gap-1 text-[0.68rem] ${isLocked ? 'text-[rgba(143,163,184,0.35)]' : 'text-text-muted'}`}>
              <FileText size={10} />
              {fieldCount} field{fieldCount !== 1 ? 's' : ''}
            </span>

            {isSubmitted && stage.submittedBy && (
              <span className="flex items-center gap-1 text-[0.68rem] text-emerald-400/70 truncate">
                <User size={10} />
                {stage.submittedBy.name}
              </span>
            )}

            {isSubmitted && stage.submittedAt && (
              <span className="flex items-center gap-1 text-[0.68rem] text-text-muted shrink-0">
                <Clock size={10} />
                {new Date(stage.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
            )}

            {isLocked && (
              <span className="text-[0.66rem] text-[rgba(143,163,184,0.35)] truncate">
                Stage {index} first
              </span>
            )}
          </div>

          {isAvailable && (
            <span className="shrink-0 flex items-center gap-1 text-[0.7rem] font-semibold text-cyan transition-all group-hover:gap-2">
              Submit <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   Page
   ════════════════════════════════════════════════════════════ */
export default function CycleStagesPage() {
  const { cycleId } = useParams()
  const navigate    = useNavigate()
  const { data: me } = useMe()

  const { data: cycle,  isLoading: loadingCycle  } = useCycle(cycleId)
  const { data: stages, isLoading: loadingStages } = useCycleStages(cycleId)

  const isLoading = loadingCycle || loadingStages

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={28} className="animate-spin text-cyan" />
    </div>
  )

  if (!cycle) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-copper">
      <AlertTriangle size={28} /><p className="text-[0.82rem]">Cycle not found.</p>
    </div>
  )

  /* ── Role access ── */
  const uid      = me?._id
  const isCeo    = me?.role === 'ceo'
  const supId    = cycle.assignedSupervisor?._id ?? cycle.assignedSupervisor
  const workerId = cycle.assignedWorker?._id     ?? cycle.assignedWorker
  const hasAccess = isCeo || supId === uid || workerId === uid

  if (!hasAccess) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-copper">
      <AlertTriangle size={28} /><p className="text-[0.82rem]">You don't have access to this cycle.</p>
    </div>
  )

  const st  = CYCLE_STATUS[cycle.status] ?? CYCLE_STATUS.new
  const pct = Math.min(100, Math.max(0, cycle.progress ?? 0))
  const canSubmit   = ['new', 'inProgress'].includes(cycle.status)
  const totalStages = stages?.length ?? 0
  const doneStages  = (stages ?? []).filter((s) => s.status === 'submitted').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cycle Stages"
        subtitle={cycle.name}
        badge="Stages"
        actions={
          <button className="btn-ghost text-[0.72rem] py-[9px] px-[18px]"
            onClick={() => navigate(`/dashboard/cycles/${cycleId}`)}>
            <ArrowLeft size={13} /> Back to Cycle
          </button>
        }
      />

      {/* Cycle summary card */}
      <div className="rounded-2xl bg-bg-glass backdrop-blur-xl border border-[rgba(0,212,255,0.08)] overflow-hidden">
        <div className="h-[3px] bg-gradient-to-r from-cyan via-[rgba(0,180,255,0.5)] to-transparent" />
        <div className="p-5 sm:p-6 flex flex-wrap items-center gap-6">
          <div className="flex-1 min-w-0">
            <p className="font-orbitron text-[0.55rem] font-bold tracking-[0.16em] uppercase text-text-muted mb-1.5">Module</p>
            <p className="text-[0.88rem] font-semibold text-text-primary truncate">
              {cycle.moduleId?.name ?? cycle.moduleId?.title ?? '—'}
            </p>
          </div>

          <div className="text-center">
            <p className="font-orbitron text-[0.55rem] font-bold tracking-[0.16em] uppercase text-text-muted mb-1.5">Status</p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.7rem] font-bold border"
              style={{ color: st.color, borderColor: `${st.color}40`, background: `${st.color}12` }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: st.color }} />
              {st.label}
            </span>
          </div>

          <div className="text-center">
            <p className="font-orbitron text-[0.55rem] font-bold tracking-[0.16em] uppercase text-text-muted mb-1.5">Stages</p>
            <span className="font-orbitron text-[0.88rem] font-bold text-text-primary">
              {doneStages}<span className="text-text-muted font-normal text-[0.7rem]"> / {totalStages}</span>
            </span>
          </div>

          <div className="w-[180px]">
            <div className="flex justify-between items-center mb-1.5">
              <p className="font-orbitron text-[0.55rem] font-bold tracking-[0.16em] uppercase text-text-muted">Progress</p>
              <span className="font-orbitron text-[0.72rem] font-bold text-cyan">{pct}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-[rgba(143,163,184,0.08)] border border-[rgba(143,163,184,0.06)] overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: pct >= 100
                    ? 'linear-gradient(90deg, #a855f7, #c084fc)'
                    : 'linear-gradient(90deg, #00d4ff, rgba(0,180,255,0.7))',
                  boxShadow: pct > 0 ? `0 0 10px ${pct >= 100 ? 'rgba(168,85,247,0.4)' : 'rgba(0,212,255,0.4)'}` : 'none',
                }} />
            </div>
          </div>
        </div>
      </div>

      {/* Paused / locked notice */}
      {!canSubmit && !['cancelled','completed'].includes(cycle.status) && (
        <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.2)]">
          <AlertTriangle size={15} className="text-amber-400 shrink-0" />
          <p className="text-[0.8rem] text-amber-400">Cycle is paused — submissions are disabled until it resumes.</p>
        </div>
      )}
      {cycle.status === 'completed' && (
        <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-[rgba(168,85,247,0.06)] border border-[rgba(168,85,247,0.2)]">
          <CheckCircle2 size={15} className="text-purple-400 shrink-0" />
          <p className="text-[0.8rem] text-purple-400">All stages completed — this cycle is finished.</p>
        </div>
      )}

      {/* Stages grid */}
      {(!stages || stages.length === 0) ? (
        <div className="flex flex-col items-center justify-center h-40 gap-3 text-text-muted">
          <FileText size={28} className="text-[rgba(143,163,184,0.25)]" />
          <p className="text-[0.82rem]">No stages found for this cycle.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stages.map((stage, index) => (
            <StageCard
              key={stage._id}
              index={index}
              stage={stage}
              canSubmit={canSubmit}
              onSubmit={() => navigate(`/stage-submit/${stage._id}`)}
            />
          ))}
        </div>
      )}

    </div>
  )
}
