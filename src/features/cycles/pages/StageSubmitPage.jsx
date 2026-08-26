import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Loader2, AlertTriangle, X, Send, Upload, Check,
  AlignLeft, Hash, Image, Star, Calendar,
  MessageSquare, ChevronDown, List,
} from 'lucide-react'
import Dropdown from '../../../components/ui/Dropdown'
import DatePicker from '../../../components/ui/DatePicker'
import { useStageForm } from '../../stages/apiHooks'
import { useSubmitForm } from '../../submissions/apiHooks'
import api from '../../../lib/axios'

/* ── Type metadata ─────────────────────────────────────── */
const TYPE_META = {
  short_text: { label: 'Short Answer',    Icon: AlignLeft     },
  paragraph:  { label: 'Paragraph',       Icon: AlignLeft     },
  number:     { label: 'Number',          Icon: Hash          },
  radio:      { label: 'Multiple Choice', Icon: List          },
  checkbox:   { label: 'Checkboxes',      Icon: List          },
  select:     { label: 'Dropdown',        Icon: ChevronDown   },
  image:      { label: 'Image Upload',    Icon: Image         },
  rating:     { label: 'Rating',          Icon: Star          },
  date:       { label: 'Date',            Icon: Calendar      },
  note:       { label: 'Section Header',  Icon: MessageSquare },
}

/* ── Upload image helper ─────────────────────────────────── */
async function uploadImage(file) {
  const fd = new FormData()
  fd.append('image', file)
  const res = await api.post('/upload/image?folder=submissions', fd)
  return res.data?.data?.url ?? ''
}

/* ═══════════════════════════════════════════════════════════
   Section field renderer (same style as FormPreviewPage)
   ═══════════════════════════════════════════════════════════ */
function SectionField({ section, idx, answer, onChange, isActive, onClick }) {
  const meta = TYPE_META[section.type] ?? TYPE_META.short_text
  const { Icon } = meta
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  /* Note / section header */
  if (section.type === 'note') {
    return (
      <div className="rounded-xl overflow-hidden bg-[rgba(0,212,255,0.03)] border border-[rgba(0,212,255,0.15)] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="h-1 bg-gradient-to-r from-cyan via-[rgba(0,180,255,0.6)] to-transparent" />
        <div className="px-6 py-5 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)] shrink-0 mt-0.5">
            <MessageSquare size={14} className="text-cyan" />
          </div>
          <div>
            <h3 className="font-orbitron text-[0.95rem] font-bold text-text-primary leading-tight">
              {section.title || '(Section Header)'}
            </h3>
            {section.descriptions && (
              <p className="text-[0.8rem] text-steel mt-1.5 leading-[1.6]">{section.descriptions}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  const isAnswered =
    answer !== undefined &&
    answer !== '' &&
    answer !== null &&
    !(Array.isArray(answer) && answer.length === 0)

  return (
    <div
      onClick={onClick}
      className={`rounded-xl overflow-hidden bg-[rgba(8,12,24,0.92)] backdrop-blur-xl border shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-all duration-200 cursor-default ${
        isActive
          ? 'border-[rgba(0,212,255,0.28)] shadow-[0_4px_32px_rgba(0,0,0,0.55),0_0_0_1px_rgba(0,212,255,0.06)]'
          : 'border-[rgba(143,163,184,0.08)] hover:border-[rgba(0,212,255,0.15)]'
      }`}
    >
      <div className={`h-[3px] transition-all duration-300 ${
        isActive
          ? 'bg-gradient-to-r from-cyan via-[rgba(0,180,255,0.8)] to-[rgba(0,212,255,0.2)]'
          : isAnswered
          ? 'bg-[rgba(0,212,255,0.18)]'
          : 'bg-transparent'
      }`} />

      <div className="p-5 sm:p-6">
        {/* Card header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center border shrink-0 mt-0.5 transition-all ${
              isActive
                ? 'bg-[rgba(0,212,255,0.15)] border-[rgba(0,212,255,0.4)]'
                : 'bg-[rgba(0,212,255,0.06)] border-[rgba(0,212,255,0.15)]'
            }`}>
              <span className="font-orbitron text-[0.58rem] font-bold text-cyan">{idx + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[0.9rem] font-semibold text-text-primary leading-[1.4]">
                {section.title || '(Untitled question)'}
                {section.isRequired && <span className="text-copper ml-1">*</span>}
              </p>
              {section.descriptions && (
                <p className="text-[0.75rem] text-steel mt-1 leading-[1.5]">{section.descriptions}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[rgba(143,163,184,0.05)] border border-[rgba(143,163,184,0.1)] shrink-0">
            <Icon size={10} className="text-steel" />
            <span className="text-[0.58rem] font-semibold text-text-muted uppercase tracking-[0.08em] whitespace-nowrap hidden sm:block">
              {meta.label}
            </span>
          </div>
        </div>

        {/* Answer area */}
        <div className="pl-10">

          {section.type === 'short_text' && (
            <input type="text" value={answer ?? ''} onChange={(e) => onChange(e.target.value)}
              placeholder="Your answer" className="input-glass w-full" />
          )}

          {section.type === 'paragraph' && (
            <textarea value={answer ?? ''} onChange={(e) => onChange(e.target.value)}
              placeholder="Your answer" rows={4} className="input-glass w-full resize-none" />
          )}

          {section.type === 'textarea' && (
            <textarea value={answer ?? ''} onChange={(e) => onChange(e.target.value)}
              placeholder={section.descriptions || 'Your answer'} rows={4} className="input-glass w-full resize-none" />
          )}

          {section.type === 'number' && (
            <input type="number" value={answer ?? ''} onChange={(e) => onChange(e.target.value)}
              placeholder="0"
              min={section.setting?.min ?? undefined}
              max={section.setting?.max ?? undefined}
              className="input-glass w-48" />
          )}

          {section.type === 'radio' && (
            <div className="space-y-3">
              {(section.options ?? []).map((opt, i) => {
                const arr = Array.isArray(answer) ? answer : (answer ? [answer] : [])
                const selected = arr.includes(opt)
                return (
                  <label key={i} className="flex items-center gap-3 cursor-pointer group">
                    <div onClick={() => onChange(selected ? arr.filter((v) => v !== opt) : [...arr, opt])}
                      className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                        selected
                          ? 'border-cyan bg-[rgba(0,212,255,0.12)]'
                          : 'border-[rgba(143,163,184,0.28)] group-hover:border-[rgba(0,212,255,0.4)]'
                      }`}>
                      {selected && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="3.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-[0.85rem] transition-colors ${
                      selected ? 'text-text-primary' : 'text-steel group-hover:text-text-primary'
                    }`}>{opt}</span>
                  </label>
                )
              })}
            </div>
          )}

          {section.type === 'checkbox' && (
            <div className="space-y-3">
              {(section.options ?? []).map((opt, i) => {
                const selected = Array.isArray(answer) ? answer.includes(opt) : false
                return (
                  <label key={i} className="flex items-center gap-3 cursor-pointer group">
                    <div onClick={() => {
                        const arr = Array.isArray(answer) ? answer : []
                        onChange(selected ? arr.filter((v) => v !== opt) : [...arr, opt])
                      }}
                      className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                        selected
                          ? 'border-cyan bg-[rgba(0,212,255,0.12)]'
                          : 'border-[rgba(143,163,184,0.28)] group-hover:border-[rgba(0,212,255,0.4)]'
                      }`}>
                      {selected && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="3.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-[0.85rem] transition-colors ${
                      selected ? 'text-text-primary' : 'text-steel group-hover:text-text-primary'
                    }`}>{opt}</span>
                  </label>
                )
              })}
            </div>
          )}

          {section.type === 'select' && (
            <Dropdown
              value={answer ?? ''}
              onChange={onChange}
              options={(section.options ?? []).map((o) => ({ value: o, label: o }))}
              placeholder="Select an option"
            />
          )}

          {section.type === 'image' && (
            <div className="space-y-2">
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setUploading(true)
                  try { onChange(await uploadImage(file)) }
                  finally { setUploading(false) }
                }}
              />
              {answer ? (
                <div className="relative group w-full">
                  <img src={answer} alt="upload" className="w-full max-h-64 object-cover rounded-xl border border-[rgba(0,212,255,0.2)]" />
                  <button type="button" onClick={() => onChange('')}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[rgba(6,8,16,0.8)] border border-[rgba(200,121,65,0.4)] flex items-center justify-center text-copper hover:bg-[rgba(200,121,65,0.15)] transition-all">
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="w-full rounded-xl border-2 border-dashed border-[rgba(143,163,184,0.18)] p-8 text-center cursor-pointer hover:border-[rgba(0,212,255,0.35)] hover:bg-[rgba(0,212,255,0.02)] transition-all group disabled:opacity-50">
                  <div className="w-12 h-12 rounded-xl bg-[rgba(0,212,255,0.06)] border border-[rgba(0,212,255,0.15)] flex items-center justify-center mx-auto mb-3 group-hover:bg-[rgba(0,212,255,0.1)] transition-all">
                    {uploading ? <Loader2 size={20} className="animate-spin text-cyan" /> : <Upload size={20} className="text-steel" />}
                  </div>
                  <p className="text-[0.82rem] font-medium text-steel">
                    {uploading ? 'Uploading…' : 'Click to upload image'}
                  </p>
                  <p className="text-[0.68rem] text-text-muted mt-1">JPEG · PNG · WEBP</p>
                </button>
              )}
              {section.assignedBotId && (
                <p className="text-[0.68rem] text-copper flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-copper inline-block animate-pulse" />
                  AI agent will analyze this image
                </p>
              )}
            </div>
          )}

          {section.type === 'rating' && (
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => onChange(n)}
                  className="transition-all duration-150 hover:scale-110 active:scale-95">
                  <svg width="32" height="32" viewBox="0 0 24 24"
                    fill={(answer ?? 0) >= n ? '#c87941' : 'none'}
                    stroke={(answer ?? 0) >= n ? '#c87941' : 'rgba(143,163,184,0.3)'}
                    strokeWidth="1.5"
                    style={{ filter: (answer ?? 0) >= n ? 'drop-shadow(0 0 5px rgba(200,121,65,0.55))' : 'none' }}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
              ))}
              {(answer ?? 0) > 0 && (
                <span className="ml-2 text-[0.75rem] text-copper font-semibold">{answer} / 5</span>
              )}
            </div>
          )}

          {section.type === 'date' && (
            <DatePicker value={answer ?? ''} onChange={onChange} placeholder="Select a date" />
          )}

        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Stage Submit Page
   ═══════════════════════════════════════════════════════════ */
export default function StageSubmitPage() {
  const { stageId } = useParams()
  const navigate = useNavigate()

  const { data: stageData, isLoading, isError, error: fetchError } = useStageForm(stageId)
  const { mutateAsync: submitForm, isPending } = useSubmitForm()

  const stage = stageData?.stage
  const cycle = stageData?.cycle
  const form  = stage?.formId

  const [answers,   setAnswers]   = useState({})
  const [activeIdx, setActiveIdx] = useState(null)
  const [error,     setError]     = useState('')
  const [success,   setSuccess]   = useState(false)

  const setAnswer = (id, value) => setAnswers((prev) => ({ ...prev, [id]: value }))

  /* Loading */
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={32} className="animate-spin text-cyan" />
        <span className="font-orbitron text-[0.6rem] font-bold tracking-[0.18em] uppercase text-text-muted">
          Loading stage…
        </span>
      </div>
    </div>
  )

  /* Error / not found / locked / submitted */
  if (isError || !form || !cycle) {
    const msg = fetchError?.response?.data?.message || 'This stage is not available.'
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-[rgba(200,121,65,0.08)] border border-[rgba(200,121,65,0.2)] flex items-center justify-center mb-2">
          <AlertTriangle size={28} className="text-copper" />
        </div>
        <h2 className="font-orbitron text-[1rem] font-bold text-text-primary">Access Denied</h2>
        <p className="text-[0.82rem] text-steel max-w-[320px]">{msg}</p>
        <button onClick={() => navigate(-1)}
          className="btn-ghost text-[0.72rem] mt-2 py-[9px] px-[18px]">
          Go back
        </button>
      </div>
    )
  }

  const sections = form.sections ?? []
  const inputSections = sections.filter((s) => s.type !== 'note')
  const total = inputSections.length
  const answered = inputSections.filter((s) => {
    const ans = answers[s._id]
    return ans !== undefined && ans !== '' && ans !== null &&
      !(Array.isArray(ans) && ans.length === 0)
  }).length
  const progress = total > 0 ? Math.round((answered / total) * 100) : 0

  const goBack = () => navigate(-1)

  const handleSubmit = async () => {
    setError('')

    /* Validate required fields */
    for (const section of sections) {
      if (section.type === 'note') continue
      if (section.isRequired && !answers[section._id]?.toString().trim()) {
        setError(`"${section.title || 'A field'}" is required.`)
        return
      }
    }

    const payload = {
      cycleId: stage.cycleId,
      formId:  form._id,
      answers: sections
        .filter((s) => s.type !== 'note')
        .map((s) => ({
          fieldId:    s._id,
          fieldLabel: s.title,
          fieldType:  s.type,
          value:      answers[s._id] ?? '',
          ...(s.type === 'image' && s.assignedBotId ? { assignedAgent: s.assignedBotId } : {}),
        })),
    }

    try {
      await submitForm(payload)
      setSuccess(true)
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Submission failed. Please try again.')
    }
  }

  /* Success screen */
  if (success) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 text-center px-4">
      <div className="w-20 h-20 rounded-2xl bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.25)] flex items-center justify-center">
        <Check size={36} className="text-emerald-400" />
      </div>
      <h2 className="font-orbitron text-[1.15rem] font-bold text-text-primary">Stage Submitted</h2>
      <p className="text-[0.85rem] text-steel max-w-[320px]">
        Your submission for "{form.name}" has been recorded successfully.
      </p>
      <button onClick={goBack}
        className="btn-primary text-[0.75rem] mt-2 py-[11px] px-6">
        Back to Stages
      </button>
    </div>
  )

  return (
    <div className="min-h-screen">

      {/* Fixed top bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-14 bg-[rgba(6,8,16,0.97)] backdrop-blur-xl border-b border-[rgba(0,212,255,0.08)] flex items-center px-5 gap-4 shadow-[0_2px_24px_rgba(0,0,0,0.55)]">

          {/* Left — back */}
          <button onClick={goBack}
            className="flex items-center gap-2 text-[0.78rem] font-medium text-steel hover:text-text-primary transition-colors shrink-0 group">
            <div className="w-7 h-7 rounded-lg border border-[rgba(143,163,184,0.15)] flex items-center justify-center group-hover:border-[rgba(0,212,255,0.3)] group-hover:bg-[rgba(0,212,255,0.06)] group-hover:text-cyan transition-all">
              <X size={12} />
            </div>
            <span className="hidden sm:inline">Back to stages</span>
          </button>

          {/* Center — badge + form name */}
          <div className="flex-1 flex flex-col items-center justify-center min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Send size={10} className="text-cyan" />
              <span className="font-orbitron text-[0.52rem] font-bold tracking-[0.2em] uppercase text-cyan">
                Submit Stage
              </span>
            </div>
            <p className="text-[0.75rem] font-semibold text-text-primary truncate max-w-[260px] sm:max-w-[440px] leading-tight">
              {form.name || 'Untitled Form'}
            </p>
          </div>

          {/* Right — progress */}
          <div className="flex items-center gap-3 shrink-0">
            {total > 0 && (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-[0.65rem] text-text-muted tabular-nums">{answered}/{total}</span>
                <div className="w-20 h-1.5 rounded-full bg-[rgba(143,163,184,0.1)] overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan to-[rgba(0,180,255,0.8)] transition-all duration-500"
                    style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
            <span className="text-[0.6rem] text-text-muted px-2 py-1 rounded border border-[rgba(143,163,184,0.1)] bg-[rgba(143,163,184,0.04)] whitespace-nowrap">
              {cycle.name}
            </span>
          </div>
        </div>

        {/* Full-width progress line */}
        {total > 0 && (
          <div className="h-[2px] bg-[rgba(0,212,255,0.05)]">
            <div className="h-full bg-gradient-to-r from-cyan via-[rgba(0,180,255,0.9)] to-[rgba(0,212,255,0.4)] transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      {/* Scrollable content */}
      <div className="pt-16 pb-28 flex justify-center px-4">
        <div className="w-full max-w-[680px] py-8 space-y-4">

          {/* Form header card */}
          <div className="rounded-xl overflow-hidden bg-[rgba(8,12,24,0.92)] backdrop-blur-xl border border-[rgba(0,212,255,0.12)] shadow-[0_4px_28px_rgba(0,0,0,0.55)]">
            <div className="h-2.5 bg-gradient-to-r from-cyan via-[rgba(0,180,255,0.8)] to-[rgba(0,212,255,0.25)]" />
            <div className="px-6 sm:px-8 py-6">
              <h1 className="font-orbitron text-[1.3rem] sm:text-[1.45rem] font-extrabold text-text-primary tracking-[-0.01em] leading-[1.2]">
                {form.name || 'Untitled Form'}
              </h1>
              {form.description && (
                <p className="text-[0.85rem] text-steel mt-2.5 leading-[1.7]">{form.description}</p>
              )}
              {total > 0 && (
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[rgba(143,163,184,0.07)]">
                  <span className="text-[0.68rem] text-text-muted">
                    {total} question{total !== 1 ? 's' : ''}
                  </span>
                  {sections.some((s) => s.isRequired) && (
                    <>
                      <span className="text-text-muted text-[0.6rem]">·</span>
                      <span className="text-[0.68rem] text-copper">* Required fields</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Empty state */}
          {sections.length === 0 && (
            <div className="rounded-xl bg-[rgba(8,12,24,0.92)] backdrop-blur-xl border border-[rgba(143,163,184,0.07)] flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.1)] flex items-center justify-center">
                <MessageSquare size={24} className="text-[rgba(0,212,255,0.25)]" />
              </div>
              <p className="text-[0.82rem] text-text-muted">No questions in this form yet.</p>
            </div>
          )}

          {/* Section cards */}
          {sections.map((section, idx) => (
            <SectionField
              key={section._id ?? idx}
              section={section}
              idx={idx}
              answer={answers[section._id]}
              onChange={(v) => { setAnswer(section._id, v); setActiveIdx(idx) }}
              isActive={activeIdx === idx}
              onClick={() => setActiveIdx(idx)}
            />
          ))}

          {/* Footer submit card */}
          {sections.length > 0 && (
            <div className="rounded-xl overflow-hidden bg-[rgba(8,12,24,0.92)] backdrop-blur-xl border border-[rgba(143,163,184,0.08)] shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
              <div className="px-6 py-5 space-y-4">

                {error && (
                  <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-[rgba(200,121,65,0.07)] border border-[rgba(200,121,65,0.22)]">
                    <AlertTriangle size={13} className="text-copper shrink-0 mt-0.5" />
                    <p className="text-[0.78rem] text-copper">{error}</p>
                  </div>
                )}

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <button type="button" onClick={handleSubmit} disabled={isPending}
                      className="btn-primary flex items-center gap-2.5 px-6 py-[10px] font-orbitron text-[0.68rem] font-bold tracking-[0.1em] uppercase disabled:opacity-50 disabled:cursor-not-allowed">
                      {isPending
                        ? <><Loader2 size={12} className="animate-spin" /> Submitting…</>
                        : <><Send size={12} /> Submit Stage</>
                      }
                    </button>
                  </div>

                  <button type="button" onClick={() => { setAnswers({}); setActiveIdx(null); setError('') }}
                    className="text-[0.72rem] text-text-muted hover:text-steel transition-colors whitespace-nowrap">
                    Clear form
                  </button>
                </div>
              </div>

              {/* Completion progress */}
              {total > 0 && (
                <div className="px-6 pb-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[0.63rem] text-text-muted">Completion</span>
                    <span className="text-[0.63rem] font-bold text-cyan tabular-nums">{progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[rgba(143,163,184,0.1)] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan to-[rgba(0,180,255,0.7)] transition-all duration-500"
                      style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
