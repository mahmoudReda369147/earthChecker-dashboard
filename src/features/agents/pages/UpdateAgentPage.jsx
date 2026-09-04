import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Loader2, ImagePlus, Upload, CheckCircle2, XCircle, Brain } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAgent, useUpdateAgent } from '../apiHooks'

/* ─── Image Drop Zone ───────────────────────────────────────── */
function ImageDrop({ label, name, existingUrl, file, onChange, stateIcon }) {
  const ref     = useRef(null)
  const preview = file ? URL.createObjectURL(file) : existingUrl
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[0.7rem] font-semibold text-steel">{label}</label>
      <button type="button" onClick={() => ref.current?.click()}
        className="relative h-[110px] rounded-xl border border-dashed border-[rgba(0,212,255,0.18)] bg-[rgba(0,212,255,0.02)] flex flex-col items-center justify-center gap-2 text-text-muted hover:border-[rgba(0,212,255,0.4)] hover:bg-[rgba(0,212,255,0.05)] transition-all overflow-hidden group">
        {preview ? (
          <>
            <img src={preview} alt={label} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-[rgba(6,8,16,0.55)] opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
              <Upload size={18} className="text-cyan" />
            </div>
          </>
        ) : (
          <>
            {stateIcon ?? <ImagePlus size={22} />}
            <span className="text-[0.65rem]">Click to upload</span>
          </>
        )}
      </button>
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={(e) => onChange(name, e.target.files?.[0])} />
    </div>
  )
}

/* ════════════════════════════════════════════════════════════ */
export default function UpdateAgentPage() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const { data: agent, isLoading, isError } = useAgent(id)
  const { mutateAsync: updateAgent, isPending } = useUpdateAgent()

  const [form, setForm] = useState({
    name: '',
    description: '',
    userPrompt: '',
    tolerance: 50,
    complianceThreshold: 80,
    criticalInspection: false,
  })
  const [files, setFiles] = useState({ image: null, passImage: null, failImage: null, thinkingImage: null })

  // Populate form once agent loads
  useEffect(() => {
    if (agent) {
      setForm({
        name:                agent.name                ?? '',
        description:         agent.description         ?? '',
        userPrompt:          agent.userPrompt          ?? '',
        tolerance:           agent.tolerance           ?? 50,
        complianceThreshold: agent.complianceThreshold ?? 80,
        criticalInspection:  agent.criticalInspection  ?? true,
      })
    }
  }, [agent])

  const set     = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const setFile = (k, v) => setFiles(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData()
    fd.append('name',                form.name)
    fd.append('description',         form.description)
    fd.append('userPrompt',          form.userPrompt)
    fd.append('tolerance',           form.tolerance)
    fd.append('complianceThreshold', form.complianceThreshold)
    fd.append('criticalInspection',  form.criticalInspection)
    // Send new file, or pass existing URL as string so backend keeps it
    if (files.image)              fd.append('image',          files.image)
    else if (agent?.image)        fd.append('image',          agent.image)
    if (files.passImage)          fd.append('passImage',      files.passImage)
    else if (agent?.passImage)    fd.append('passImage',      agent.passImage)
    if (files.failImage)          fd.append('failImage',      files.failImage)
    else if (agent?.failImage)    fd.append('failImage',      agent.failImage)
    if (files.thinkingImage)       fd.append('thinkingImage',  files.thinkingImage)
    else if (agent?.thinkingImage) fd.append('thinkingImage',  agent.thinkingImage)
    await updateAgent({ id, formData: fd })
    navigate('/dashboard/agents')
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={32} className="animate-spin text-cyan" />
    </div>
  )

  if (isError || (!isLoading && !agent)) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
      <p className="text-copper font-orbitron text-sm font-bold">Agent not found or invalid agent ID</p>
      <button
        onClick={() => navigate('/dashboard/agents')}
        className="px-4 py-2 rounded-xl bg-cyan/10 border border-cyan/30 text-cyan text-xs font-orbitron font-semibold hover:bg-cyan/20 transition-all cursor-pointer"
      >
        ← Back to AI Agents
      </button>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-7">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/dashboard/agents')}
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-[rgba(143,163,184,0.2)] text-steel hover:text-cyan hover:border-cyan transition-all">
            <ArrowLeft size={14} />
          </button>
          <div>
            <h1 className="font-orbitron text-[1.2rem] font-bold text-text-primary tracking-tight">
              Update Agent — <span className="text-cyan">{agent?.name}</span>
            </h1>
            <p className="text-[0.75rem] text-steel mt-0.5">Edit agent configuration</p>
          </div>
        </div>
        <button type="submit" form="update-agent-form" disabled={isPending || !form.name.trim()}
          className="btn-primary text-[0.73rem] py-[10px] px-5 shrink-0 disabled:opacity-50">
          {isPending ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          {isPending ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <form id="update-agent-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Left ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Basic info */}
          <div className="rounded-xl bg-bg-glass border border-[rgba(143,163,184,0.1)] p-5 space-y-4">
            <h2 className="text-[0.8rem] font-bold text-text-primary font-orbitron tracking-wide">Basic Info</h2>
            <div>
              <label className="block mb-1.5 text-[0.73rem] font-semibold text-steel">Agent Name *</label>
              <input type="text" className="input-glass" value={form.name}
                onChange={e => set('name', e.target.value)} required />
            </div>
            <div>
              <label className="block mb-1.5 text-[0.73rem] font-semibold text-steel">Description</label>
              <textarea rows={2} className="input-glass resize-none" value={form.description}
                onChange={e => set('description', e.target.value)} />
            </div>
          </div>

          {/* Instructions */}
          <div className="rounded-xl bg-bg-glass border border-[rgba(143,163,184,0.1)] p-5 space-y-3">
            <div>
              <h2 className="text-[0.8rem] font-bold text-text-primary font-orbitron tracking-wide">Agent Instructions</h2>
              <p className="text-[0.7rem] text-steel mt-0.5">Describe what this agent should inspect and how it should classify results</p>
            </div>
            <textarea rows={6} className="input-glass resize-none font-mono text-[0.73rem] leading-[1.7]"
              value={form.userPrompt} onChange={e => set('userPrompt', e.target.value)} />
          </div>

          {/* State Visuals */}
          <div className="rounded-xl bg-bg-glass border border-[rgba(143,163,184,0.1)] p-5 space-y-3">
            <h2 className="text-[0.8rem] font-bold text-text-primary font-orbitron tracking-wide">State Visuals</h2>
            <div className="grid grid-cols-3 gap-3">
              <ImageDrop label="Main Image"    name="image"         file={files.image}         existingUrl={agent?.image}         onChange={setFile} stateIcon={<ImagePlus size={24} className="text-[rgba(0,212,255,0.3)]" />} />
              <ImageDrop label="Pass State"    name="passImage"     file={files.passImage}     existingUrl={agent?.passImage}     onChange={setFile} stateIcon={<CheckCircle2 size={28} className="text-[#22c55e]" />} />
              <ImageDrop label="Fail State"    name="failImage"     file={files.failImage}     existingUrl={agent?.failImage}     onChange={setFile} stateIcon={<XCircle size={28} className="text-copper" />} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <ImageDrop label="Thinking State" name="thinkingImage" file={files.thinkingImage} existingUrl={agent?.thinkingImage} onChange={setFile} stateIcon={<Brain size={28} className="text-cyan" />} />
            </div>
          </div>
        </div>

        {/* ── Right ── */}
        <div className="space-y-5">
          {/* Threshold */}
          <div className="rounded-xl bg-bg-glass border border-[rgba(143,163,184,0.1)] p-5 space-y-4">
            <div>
              <h2 className="text-[0.8rem] font-bold text-text-primary font-orbitron tracking-wide">Confidence Threshold</h2>
              <p className="text-[0.7rem] text-steel mt-0.5">Minimum confidence level for automatic approval</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[0.7rem] text-steel">50%</span>
                <span className="font-orbitron text-[1.3rem] font-bold text-cyan">{form.tolerance}%</span>
                <span className="text-[0.7rem] text-steel">100%</span>
              </div>
              <input type="range" min={50} max={100} step={1} value={form.tolerance}
                onChange={e => set('tolerance', Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, #00d4ff ${(form.tolerance - 50) * 2}%, rgba(143,163,184,0.15) ${(form.tolerance - 50) * 2}%)` }} />
            </div>
          </div>

          {/* Compliance Threshold */}
          <div className="rounded-xl bg-bg-glass border border-[rgba(143,163,184,0.1)] p-5 space-y-4">
            <div>
              <h2 className="text-[0.8rem] font-bold text-text-primary font-orbitron tracking-wide">Compliance Threshold</h2>
              <p className="text-[0.7rem] text-steel mt-0.5">Required compliance percentage rate</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[0.7rem] text-steel">0%</span>
                <span className="font-orbitron text-[1.3rem] font-bold text-cyan">{form.complianceThreshold}%</span>
                <span className="text-[0.7rem] text-steel">100%</span>
              </div>
              <input type="range" min={0} max={100} step={1} value={form.complianceThreshold}
                onChange={e => set('complianceThreshold', Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, #00d4ff ${form.complianceThreshold}%, rgba(143,163,184,0.15) ${form.complianceThreshold}%)` }} />
            </div>
          </div>

          {/* Critical Inspection Switch */}
          <div className="rounded-xl bg-bg-glass border border-[rgba(143,163,184,0.1)] p-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[0.8rem] font-bold text-text-primary font-orbitron tracking-wide">Critical Inspection</h2>
              <p className="text-[0.7rem] text-steel mt-0.5">Flag inspection as critical</p>
            </div>
            <button
              type="button"
              onClick={() => set('criticalInspection', !form.criticalInspection)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                form.criticalInspection ? 'bg-cyan' : 'bg-[rgba(143,163,184,0.2)]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#060810] shadow-lg ring-0 transition duration-200 ease-in-out ${
                  form.criticalInspection ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Preview */}
          <div className="rounded-xl bg-bg-glass border border-[rgba(143,163,184,0.1)] p-5 space-y-4">
            <h2 className="text-[0.8rem] font-bold text-text-primary font-orbitron tracking-wide">Simulation Preview</h2>
            <div className="h-[100px] rounded-lg border border-dashed border-[rgba(143,163,184,0.12)] bg-[rgba(0,0,0,0.2)] flex flex-col items-center justify-center gap-2 text-text-muted">
              <span className="text-[0.65rem]">Run simulation to preview</span>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Expected Accuracy', value: `~${Math.round(form.tolerance * 0.98)}%`, color: '#00d4ff' },
                { label: 'False Positives',   value: `~${Math.max(1, 100 - form.tolerance)}%`,  color: '#f97316' },
                { label: 'Running Time',      value: '~12 min',                                 color: '#8fa3b8' },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-[0.7rem] text-steel">{s.label}</span>
                  <span className="text-[0.8rem] font-bold" style={{ color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
            <button type="button"
              className="w-full py-[10px] rounded-lg bg-cyan text-[#060810] font-orbitron text-[0.72rem] font-bold tracking-wide hover:brightness-110 transition-all">
              ▷ Run Simulation
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
