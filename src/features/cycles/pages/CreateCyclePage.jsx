import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Loader2, ArrowLeft, Plus, Save,
  RotateCcw, User,
  GitBranch, AlertCircle, Boxes, DollarSign, Hash,
} from 'lucide-react'
import PageHeader     from '../../../components/ui/PageHeader'
import Dropdown       from '../../../components/ui/Dropdown'
import { useMe }      from '../../auth/apiHooks'
import { useModules } from '../../modules/apiHooks'
import { useStaff }   from '../../staff/apiHooks'
import { useCycle, useCreateCycle, useUpdateCycle } from '../apiHooks'

/* ── Status display config ─────────────────────────────────── */
const STATUS_CFG = {
  new:              { label: 'New',              color: '#00d4ff', bg: 'rgba(0,212,255,0.1)',    border: 'rgba(0,212,255,0.25)' },
  inProgress:       { label: 'In Progress',      color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)' },
  paused:           { label: 'Paused',           color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)' },
  cancelledRequest: { label: 'Cancel Requested', color: '#f97316', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.25)' },
  cancelled:        { label: 'Cancelled',        color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)' },
  completed:        { label: 'Completed',        color: '#a855f7', bg: 'rgba(168,85,247,0.1)',  border: 'rgba(168,85,247,0.25)' },
}

/* ── Cycle preview card (left column) ───────────────────────── */
function CyclePreview({ form, moduleName, supervisorName }) {
  const st = STATUS_CFG[form.status ?? 'new'] ?? STATUS_CFG.new

  return (
    <div className="flex flex-col gap-4">
      {/* Main preview */}
      <div className="rounded-xl bg-bg-glass backdrop-blur-xl border border-[rgba(0,212,255,0.08)] overflow-hidden">
        <div className="h-[3px] bg-gradient-to-r from-cyan via-[rgba(0,180,255,0.5)] to-transparent" />
        <div className="p-6 space-y-5">
          <p className="font-orbitron text-[0.58rem] font-bold tracking-[0.18em] uppercase text-text-muted">
            Preview
          </p>

          {/* Cycle icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center border"
              style={{ background: 'rgba(0,212,255,0.07)', borderColor: 'rgba(0,212,255,0.2)' }}>
              <RotateCcw size={28} className="text-cyan" />
            </div>
          </div>

          {/* Name */}
          <div className="text-center">
            <p className="font-orbitron text-[0.9rem] font-bold text-text-primary leading-tight">
              {form.name.trim() || 'Cycle Name'}
            </p>
            {/* Status badge */}
            <span
              className="inline-flex mt-2 items-center px-3 py-0.5 rounded-full text-[0.67rem] font-bold border"
              style={{ color: st.color, borderColor: st.border, background: st.bg }}
            >
              {st.label}
            </span>
          </div>

          {/* Details */}
          <div className="space-y-2.5 pt-3 border-t border-[rgba(143,163,184,0.07)]">
            <div className="flex items-center gap-2">
              <GitBranch size={11} className="text-text-muted shrink-0" />
              <span className="text-[0.72rem] text-steel truncate">
                {moduleName || 'No module selected'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User size={11} className="text-text-muted shrink-0" />
              <span className="text-[0.72rem] text-steel truncate">
                {supervisorName || 'No supervisor'}
              </span>
            </div>

            {/* Batch & Cost Metrics in Preview */}
            {(form.totalBatchSize !== '' || form.sampleSize !== '' || form.unitCost !== '') && (
              <div className="pt-2 border-t border-[rgba(143,163,184,0.07)] space-y-1 text-[0.7rem]">
                {form.totalBatchSize !== '' && (
                  <div className="flex justify-between items-center text-steel">
                    <span>Batch Size:</span>
                    <span className="font-orbitron font-bold text-text-primary">{form.totalBatchSize}</span>
                  </div>
                )}
                {form.sampleSize !== '' && (
                  <div className="flex justify-between items-center text-steel">
                    <span>Sample Size:</span>
                    <span className="font-orbitron font-bold text-cyan">{form.sampleSize}</span>
                  </div>
                )}
                {form.unitCost !== '' && (
                  <div className="flex justify-between items-center text-steel">
                    <span>Unit Cost:</span>
                    <span className="font-orbitron font-bold text-emerald-400">${form.unitCost}</span>
                  </div>
                )}
              </div>
            )}

            {/* Progress bar */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between items-center">
                <span className="text-[0.68rem] text-text-muted">Progress</span>
                <span className="font-orbitron text-[0.68rem] font-bold text-cyan">{form.progress ?? 0}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[rgba(143,163,184,0.1)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan to-[rgba(0,180,255,0.7)] transition-all duration-300"
                  style={{ width: `${form.progress ?? 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info card */}
      <div className="rounded-xl bg-bg-glass backdrop-blur-xl border border-[rgba(143,163,184,0.07)] p-4 space-y-2">
        <p className="font-orbitron text-[0.58rem] font-bold tracking-[0.14em] uppercase text-text-muted">
          How it works
        </p>
        {[
          'New cycle starts with status "New"',
          'CEO assigns to a supervisor',
          'Supervisor can start, pause, or request cancel',
          'CEO completes or cancels the cycle',
        ].map((txt) => (
          <div key={txt} className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan mt-1.5 shrink-0" />
            <p className="text-[0.7rem] text-text-muted leading-[1.5]">{txt}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Field wrapper ──────────────────────────────────────────── */
function Field({ label, required, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-[0.72rem] font-bold text-text-muted uppercase tracking-[0.08em]">
        {label}
        {required && <span className="text-copper">*</span>}
      </label>
      {children}
      {hint && <p className="text-[0.7rem] text-text-muted leading-[1.5]">{hint}</p>}
    </div>
  )
}


/* ════════════════════════════════════════════════════════════
   Page
   ════════════════════════════════════════════════════════════ */
export default function CreateCyclePage() {
  const { cycleId } = useParams()
  const navigate    = useNavigate()
  const isEditMode  = !!cycleId

  const { data: me } = useMe()
  const isCeo        = me?.role === 'ceo'

  /* ── Data fetching ── */
  const { data: cycleData, isLoading: loadingCycle } = useCycle(cycleId)

  const { data: modulesData, isLoading: loadingModules } =
    useModules({ limit: 200, isDeleted: false })

  const { data: staffData,   isLoading: loadingStaff   } = useStaff({ role: 'supervisor', limit: 200 })
  const { data: workersData, isLoading: loadingWorkers } = useStaff({ role: 'worker',     limit: 200 })

  const modules     = modulesData?.modules   ?? []
  const supervisors = staffData?.staff       ?? []
  const workers     = workersData?.staff     ?? []

  /* ── Mutations ── */
  const { mutateAsync: createCycle, isPending: creating } = useCreateCycle()
  const { mutateAsync: updateCycle, isPending: updating  } = useUpdateCycle()

  /* ── Form state ── */
  const [form, setForm] = useState({
    name:               '',
    moduleId:           '',
    assignedSupervisor: '',
    assignedWorker:     '',
    status:             'new',
    totalBatchSize:     '',
    sampleSize:         '',
    unitCost:           '',
  })
  const [error, setError] = useState('')

  /* ── Populate for edit mode ── */
  useEffect(() => {
    if (cycleData) {
      setForm({
        name:               cycleData.name               ?? '',
        moduleId:           cycleData.moduleId?._id           ?? cycleData.moduleId           ?? '',
        assignedSupervisor: cycleData.assignedSupervisor?._id ?? cycleData.assignedSupervisor ?? '',
        assignedWorker:     cycleData.assignedWorker?._id     ?? cycleData.assignedWorker     ?? '',
        status:             cycleData.status ?? 'new',
        totalBatchSize:     cycleData.totalBatchSize     ?? '',
        sampleSize:         cycleData.sampleSize         ?? '',
        unitCost:           cycleData.unitCost           ?? '',
      })
    }
  }, [cycleData])

  /* ── Auto-assign supervisor (supervisor role creating) ── */
  useEffect(() => {
    if (!isCeo && me?._id && !isEditMode) {
      setForm((f) => ({ ...f, assignedSupervisor: me._id }))
    }
  }, [isCeo, me, isEditMode])

  const set   = (key) => (val) => { setForm((f) => ({ ...f, [key]: val })); setError('') }
  const setEv = (key) => (e)   => set(key)(e.target.value)

  /* ── Derived display values for preview ── */
  const selectedModule     = modules.find((m) => m._id === form.moduleId)
  const selectedSupervisor = supervisors.find((s) => s._id === form.assignedSupervisor)
    ?? ((!isCeo && me) ? me : null)

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.name.trim())    { setError('Cycle name is required.');       return }
    if (!form.moduleId)       { setError('Please select a module.');       return }
    if (!form.assignedSupervisor && isCeo) { setError('Please assign a supervisor.'); return }

    try {
      const payload = {
        name:           form.name.trim(),
        moduleId:       form.moduleId,
        ...(isCeo ? { assignedSupervisor: form.assignedSupervisor } : {}),
        assignedWorker: form.assignedWorker || null,
        totalBatchSize: form.totalBatchSize !== '' ? Number(form.totalBatchSize) : 0,
        sampleSize:     form.sampleSize     !== '' ? Number(form.sampleSize)     : 0,
        unitCost:       form.unitCost       !== '' ? Number(form.unitCost)       : 0,
      }

      if (isEditMode) {
        await updateCycle({ id: cycleId, ...payload })
      } else {
        await createCycle(payload)
      }
      navigate('/dashboard/cycles')
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Something went wrong. Please try again.')
    }
  }

  const isPending = creating || updating

  /* ── Loading state (edit) ── */
  if (isEditMode && loadingCycle) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={28} className="animate-spin text-cyan" />
    </div>
  )

  return (
    <div>
      <PageHeader
        title={isEditMode ? 'Edit Cycle' : 'New Cycle'}
        subtitle={isEditMode ? 'Update cycle details' : 'Create a new operational cycle'}
        badge="Cycles"
        actions={
          <button className="btn-ghost text-[0.72rem] py-[9px] px-[18px]"
            onClick={() => navigate('/dashboard/cycles')}>
            <ArrowLeft size={13} /> Back
          </button>
        }
      />

      <form onSubmit={handleSubmit}>
        <div className="flex gap-6 items-start">

          {/* ── LEFT: Preview card ──────────────────────── */}
          <div className="hidden lg:block w-[260px] shrink-0">
            <CyclePreview
              form={form}
              moduleName={selectedModule?.title || selectedModule?.name}
              supervisorName={selectedSupervisor?.name}
            />
          </div>

          {/* ── RIGHT: Form sections ──────────────────── */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">

            {/* Section: Cycle Info */}
            <div className="rounded-xl bg-bg-glass backdrop-blur-xl border border-[rgba(0,212,255,0.08)]">
              <div className="h-[3px] rounded-t-xl bg-gradient-to-r from-cyan via-[rgba(0,180,255,0.5)] to-transparent" />
              <div className="p-5">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-7 h-7 rounded-lg bg-[rgba(0,212,255,0.07)] border border-[rgba(0,212,255,0.14)] flex items-center justify-center">
                    <RotateCcw size={13} className="text-cyan" />
                  </div>
                  <span className="font-orbitron text-[0.72rem] font-bold text-text-primary tracking-[0.06em]">
                    Cycle Information
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Cycle Name" required>
                    <div className="relative">
                      <RotateCcw size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                      <input
                        type="text"
                        value={form.name}
                        onChange={setEv('name')}
                        placeholder="e.g. Q2 Data Collection"
                        autoComplete="off"
                        className="input-glass w-full pl-9"
                      />
                    </div>
                  </Field>

                  <Field label="Module" required hint={isEditMode && form.status !== 'new' ? 'Module cannot be changed once the cycle has started.' : undefined}>
                    {loadingModules ? (
                      <div className="input-glass flex items-center gap-2 opacity-60">
                        <Loader2 size={12} className="animate-spin text-cyan" />
                        <span className="text-[0.78rem] text-text-muted">Loading modules…</span>
                      </div>
                    ) : (
                      <Dropdown
                        value={form.moduleId}
                        onChange={set('moduleId')}
                        placeholder="— Select a module —"
                        disabled={isEditMode && form.status !== 'new'}
                        options={modules.map((m) => ({ value: m._id, label: m.title || m.name }))}
                      />
                    )}
                  </Field>

                  {/* Status (edit only, read-only display) */}
                  {isEditMode && (
                    <Field label="Current Status" hint="Change status from the cycle detail page.">
                      {(() => {
                        const st = STATUS_CFG[form.status] ?? STATUS_CFG.new
                        return (
                          <div
                            className="input-glass flex items-center gap-2 opacity-80 cursor-not-allowed"
                          >
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: st.color }} />
                            <span className="text-[0.82rem]" style={{ color: st.color }}>{st.label}</span>
                          </div>
                        )
                      })()}
                    </Field>
                  )}
                </div>
              </div>
            </div>

            {/* Section: Batch & Cost Parameters */}
            <div className="rounded-xl bg-bg-glass backdrop-blur-xl border border-[rgba(0,212,255,0.08)]">
              <div className="h-[3px] rounded-t-xl bg-gradient-to-r from-cyan via-[rgba(0,180,255,0.5)] to-transparent" />
              <div className="p-5">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-7 h-7 rounded-lg bg-[rgba(0,212,255,0.07)] border border-[rgba(0,212,255,0.14)] flex items-center justify-center">
                    <Boxes size={13} className="text-cyan" />
                  </div>
                  <span className="font-orbitron text-[0.72rem] font-bold text-text-primary tracking-[0.06em]">
                    Batch &amp; Inspection Parameters
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field label="Total Batch Size" hint="Total batch quantity produced">
                    <div className="relative">
                      <Boxes size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={form.totalBatchSize}
                        onChange={setEv('totalBatchSize')}
                        placeholder="e.g. 1000"
                        className="input-glass w-full pl-9"
                      />
                    </div>
                  </Field>

                  <Field label="Sample Size" hint="Quantity sampled for quality check">
                    <div className="relative">
                      <Hash size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={form.sampleSize}
                        onChange={setEv('sampleSize')}
                        placeholder="e.g. 50"
                        className="input-glass w-full pl-9"
                      />
                    </div>
                  </Field>

                  <Field label="Unit Cost ($)" hint="Cost per item/unit">
                    <div className="relative">
                      <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={form.unitCost}
                        onChange={setEv('unitCost')}
                        placeholder="e.g. 15.50"
                        className="input-glass w-full pl-9"
                      />
                    </div>
                  </Field>
                </div>
              </div>
            </div>

            {/* Section: Assignment */}
            <div className="rounded-xl bg-bg-glass backdrop-blur-xl border border-[rgba(0,212,255,0.08)]">
              <div className="h-[3px] rounded-t-xl bg-gradient-to-r from-cyan via-[rgba(0,180,255,0.5)] to-transparent" />
              <div className="p-5">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-7 h-7 rounded-lg bg-[rgba(0,212,255,0.07)] border border-[rgba(0,212,255,0.14)] flex items-center justify-center">
                    <User size={13} className="text-cyan" />
                  </div>
                  <span className="font-orbitron text-[0.72rem] font-bold text-text-primary tracking-[0.06em]">
                    Assignment
                  </span>
                </div>

                <div className="space-y-4">
                {isCeo ? (
                  /* CEO picks supervisor */
                  <Field label="Assigned Supervisor" required>
                    {loadingStaff ? (
                      <div className="input-glass flex items-center gap-2 opacity-60">
                        <Loader2 size={12} className="animate-spin text-cyan" />
                        <span className="text-[0.78rem] text-text-muted">Loading supervisors…</span>
                      </div>
                    ) : supervisors.length === 0 ? (
                      <div className="input-glass flex items-center gap-2 text-copper">
                        <AlertCircle size={13} className="shrink-0" />
                        <span className="text-[0.78rem]">No supervisors found. Create staff first.</span>
                      </div>
                    ) : (
                      <Dropdown
                        value={form.assignedSupervisor}
                        onChange={set('assignedSupervisor')}
                        placeholder="— Select a supervisor —"
                        options={supervisors.map((s) => ({ value: s._id, label: `${s.name} (${s.email})` }))}
                      />
                    )}
                  </Field>
                ) : (
                  /* Supervisor sees themselves (read-only) */
                  <div className="flex items-center gap-4 p-4 rounded-xl border"
                    style={{ background: 'rgba(0,212,255,0.04)', borderColor: 'rgba(0,212,255,0.14)' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-orbitron text-[0.9rem] font-black"
                      style={{ background: 'rgba(200,121,65,0.12)', color: '#c87941' }}>
                      {(me?.name ?? '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[0.82rem] font-semibold text-text-primary">{me?.name}</p>
                      <p className="text-[0.72rem] text-text-muted">{me?.email}</p>
                    </div>
                    <span className="ml-auto text-[0.68rem] text-text-muted italic">Auto-assigned</span>
                  </div>
                )}

                {/* Worker assignment (CEO + Supervisor) */}
                <Field label="Assigned Worker" hint="Optional — can also be assigned later.">
                  {loadingWorkers ? (
                    <div className="input-glass flex items-center gap-2 opacity-60">
                      <Loader2 size={12} className="animate-spin text-cyan" />
                      <span className="text-[0.78rem] text-text-muted">Loading workers…</span>
                    </div>
                  ) : (
                    <Dropdown
                      value={form.assignedWorker}
                      onChange={set('assignedWorker')}
                      placeholder="— Select a worker (optional) —"
                      options={[
                        { value: '', label: 'None' },
                        ...workers.map((w) => ({ value: w._id, label: `${w.name} (${w.email})` })),
                      ]}
                    />
                  )}
                </Field>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-[rgba(200,121,65,0.07)] border border-[rgba(200,121,65,0.22)]">
                <AlertCircle size={14} className="text-copper shrink-0 mt-0.5" />
                <p className="text-[0.8rem] text-copper leading-[1.5]">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                className="btn-ghost text-[0.72rem] py-[11px] px-[24px]"
                onClick={() => navigate('/dashboard/cycles')}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="btn-primary text-[0.72rem] py-[11px] px-[28px] flex-1 max-w-[220px] justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending
                  ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
                  : isEditMode
                  ? <><Save size={13} /> Save Changes</>
                  : <><Plus size={13} /> Create Cycle</>
                }
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
