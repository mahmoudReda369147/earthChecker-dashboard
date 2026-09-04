import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  Bot,
  Image as ImageIcon,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  Layers,
  AlertTriangle,
  Tag,
} from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import { useSubmissionAnalyses, useRateAnalysis } from '../apiHooks'

export default function SubmissionAnalysesPage() {
  const { submissionId } = useParams()
  const navigate = useNavigate()
  const { data, isLoading } = useSubmissionAnalyses(submissionId)

  const analyses = data?.data?.analyses ?? []
  const submission = data?.data?.submission

  /* Manage expanded/collapsed state for each section */
  const [collapsedSections, setCollapsedSections] = useState({})

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 size={28} className="animate-spin text-cyan" />
      </div>
    )
  }

  /* Helper to resolve section name */
  const getSectionName = (fieldId) => {
    if (!fieldId) return 'General Inspection'
    // 1. Check in submission answers
    const ans = submission?.answers?.find(
      (a) => a.fieldId?.toString() === fieldId?.toString()
    )
    if (ans?.fieldLabel) return ans.fieldLabel

    // 2. Check in form sections
    const sec = submission?.formId?.sections?.find(
      (s) => s._id?.toString() === fieldId?.toString()
    )
    if (sec?.title) return sec.title

    return 'Inspection Section'
  }

  /* Group analyses by fieldId (Section) */
  const grouped = analyses.reduce((acc, analysis) => {
    const key = analysis.fieldId?.toString() || 'default'
    if (!acc[key]) {
      acc[key] = {
        sectionId: key,
        sectionName: getSectionName(analysis.fieldId),
        items: [],
      }
    }
    acc[key].items.push(analysis)
    return acc
  }, {})

  const sectionGroups = Object.values(grouped)

  const toggleSection = (secId) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [secId]: !prev[secId],
    }))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Analyses"
        subtitle={
          submission
            ? `Submission for form: ${submission.formId?.name ?? submissionId}`
            : 'Submission analyses'
        }
        badge={`${analyses.length} ${analyses.length === 1 ? 'Analysis' : 'Analyses'}`}
        actions={
          <button onClick={() => navigate(-1)} className="btn-ghost text-[0.72rem] py-[9px] px-[18px]">
            <ArrowLeft size={13} strokeWidth={2} />
            Back
          </button>
        }
      />

      {analyses.length === 0 ? (
        <div className="bg-bg-glass backdrop-blur-xl border border-[rgba(0,212,255,0.08)] rounded-2xl p-10 text-center">
          <Bot size={40} className="text-steel mx-auto mb-3 opacity-40" />
          <p className="text-steel text-[0.88rem]">No AI analyses found for this submission.</p>
          <p className="text-text-muted text-[0.75rem] mt-1">
            Analyses are created when image fields have an assigned AI agent.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sectionGroups.map((group) => {
            const isCollapsed = Boolean(collapsedSections[group.sectionId])
            const passCount = group.items.filter((a) => a.aiResult?.result === 'pass').length
            const failCount = group.items.filter((a) => a.aiResult?.result === 'fail').length

            return (
              <div
                key={group.sectionId}
                className="rounded-2xl bg-[rgba(8,12,24,0.92)] backdrop-blur-xl border border-[rgba(143,163,184,0.12)] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.35)] transition-all"
              >
                {/* Expandable Section Header */}
                <button
                  type="button"
                  onClick={() => toggleSection(group.sectionId)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(0,212,255,0.03)] border-b border-[rgba(143,163,184,0.1)] transition-all group cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)] flex items-center justify-center text-cyan group-hover:scale-105 transition-transform">
                      <Layers size={16} />
                    </div>
                    <div>
                      <h3 className="font-orbitron text-[0.95rem] font-bold text-text-primary group-hover:text-cyan transition-colors">
                        {group.sectionName}
                      </h3>
                      <p className="text-[0.72rem] text-text-muted mt-0.5">
                        {group.items.length} {group.items.length === 1 ? 'image analysis' : 'image analyses'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status badges summary */}
                    <div className="flex items-center gap-2">
                      {passCount > 0 && (
                        <span className="px-2.5 py-1 rounded-full bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.25)] text-emerald-400 text-[0.68rem] font-bold">
                          {passCount} PASS
                        </span>
                      )}
                      {failCount > 0 && (
                        <span className="px-2.5 py-1 rounded-full bg-[rgba(200,121,65,0.1)] border border-[rgba(200,121,65,0.25)] text-copper text-[0.68rem] font-bold">
                          {failCount} FAIL
                        </span>
                      )}
                    </div>

                    <div className="w-7 h-7 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(143,163,184,0.15)] flex items-center justify-center text-steel group-hover:text-cyan group-hover:border-[rgba(0,212,255,0.3)] transition-all">
                      {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                    </div>
                  </div>
                </button>

                {/* Collapsible Content */}
                {!isCollapsed && (
                  <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {group.items.map((analysis) => (
                      <AnalysisCard
                        key={analysis._id}
                        analysis={analysis}
                        submissionId={submissionId}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function AnalysisCard({ analysis, submissionId }) {
  const { aiResult, agentId: agent, imageUrls, userRating, problemType } = analysis
  const isPassed = aiResult?.result === 'pass'
  const displayProblemType = problemType || aiResult?.problemType || null
  const [activeImage, setActiveImage] = useState(0)
  const rateMutation = useRateAnalysis(submissionId)

  return (
    <div className="bg-bg-glass backdrop-blur-xl border border-[rgba(0,212,255,0.08)] rounded-2xl overflow-hidden flex flex-col justify-between">
      <div>
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-3.5 border-b ${
            isPassed
              ? 'border-[rgba(16,185,129,0.15)] bg-[rgba(16,185,129,0.04)]'
              : 'border-[rgba(200,121,65,0.15)] bg-[rgba(200,121,65,0.04)]'
          }`}
        >
          <div className="flex items-center gap-3">
            {agent?.image ? (
              <img src={agent.image} alt="" className="w-8 h-8 rounded-full object-cover border border-[rgba(0,212,255,0.2)]" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)] flex items-center justify-center">
                <Bot size={14} className="text-cyan" />
              </div>
            )}
            <div>
              <p className="text-[0.82rem] font-semibold text-text-primary">{agent?.name ?? 'AI Agent'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Confidence */}
            <div className="text-right">
              <p className="text-[0.62rem] text-text-muted uppercase tracking-wider">Confidence</p>
              <p className="font-orbitron text-[0.85rem] font-bold text-text-primary">
                {(aiResult?.confidence ?? 0).toFixed(1)}%
              </p>
            </div>

            {/* Result badge */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.72rem] font-bold uppercase tracking-wider ${
                isPassed
                  ? 'bg-[rgba(16,185,129,0.12)] text-emerald-400 border border-[rgba(16,185,129,0.25)]'
                  : 'bg-[rgba(200,121,65,0.12)] text-copper border border-[rgba(200,121,65,0.25)]'
              }`}
            >
              {isPassed ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
              {aiResult?.result}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Problem Type Display */}
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[rgba(0,212,255,0.03)] border border-[rgba(0,212,255,0.12)]">
            <div className="flex items-center gap-2 text-steel text-[0.75rem]">
              <Tag size={13} className="text-cyan shrink-0" />
              <span className="font-medium text-text-muted">Problem Type:</span>
            </div>
            <span
              className={`text-[0.78rem] font-semibold px-2.5 py-0.5 rounded-md ${
                displayProblemType
                  ? 'bg-[rgba(0,212,255,0.1)] text-cyan border border-[rgba(0,212,255,0.2)]'
                  : 'text-steel italic'
              }`}
            >
              {displayProblemType || 'None specified'}
            </span>
          </div>

          {/* Fail reason if failed */}
          {!isPassed && aiResult?.reason && (
            <div className="px-4 py-3 rounded-xl bg-[rgba(200,121,65,0.06)] border border-[rgba(200,121,65,0.15)]">
              <div className="flex items-center gap-1.5 mb-1">
                <AlertTriangle size={12} className="text-copper" />
                <p className="text-[0.68rem] text-copper font-semibold uppercase tracking-wider">Fail Reason</p>
              </div>
              <p className="text-[0.8rem] text-text-primary leading-relaxed">{aiResult.reason}</p>
            </div>
          )}

          {/* Images */}
          {imageUrls?.length > 0 && (
            <div>
              <p className="flex items-center gap-1.5 text-[0.68rem] text-text-muted uppercase tracking-wider mb-2.5">
                <ImageIcon size={11} />
                Analyzed Image ({imageUrls.length})
              </p>
              <div className="flex gap-3">
                <div className="flex-1 min-w-0 rounded-xl overflow-hidden border border-[rgba(0,212,255,0.12)] aspect-video bg-[rgba(0,0,0,0.3)]">
                  <img
                    src={imageUrls[activeImage]}
                    alt={`Analysis image ${activeImage + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {imageUrls.length > 1 && (
                  <div className="flex flex-col gap-2 w-16 shrink-0">
                    {imageUrls.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          i === activeImage
                            ? 'border-cyan shadow-[0_0_8px_rgba(0,212,255,0.3)]'
                            : 'border-[rgba(0,212,255,0.08)] opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Rating */}
      <div className="p-5 pt-0">
        <div className="pt-3 border-t border-t-[rgba(143,163,184,0.08)] flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[0.68rem] text-text-muted">AI Confidence</span>
              <span className="text-[0.68rem] font-semibold text-text-primary">
                {(aiResult?.confidence ?? 0).toFixed(1)}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[rgba(143,163,184,0.1)] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isPassed ? 'bg-emerald-400' : 'bg-copper'
                }`}
                style={{ width: `${aiResult?.confidence ?? 0}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => rateMutation.mutate({ analysisId: analysis._id, action: 'like' })}
              disabled={rateMutation.isPending}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.72rem] font-medium transition-all border ${
                userRating === 'like'
                  ? 'bg-[rgba(16,185,129,0.15)] border-[rgba(16,185,129,0.35)] text-emerald-400'
                  : 'bg-white/[0.03] border-[rgba(143,163,184,0.12)] text-steel hover:bg-[rgba(16,185,129,0.08)] hover:border-[rgba(16,185,129,0.2)] hover:text-emerald-400'
              }`}
              title="Like analysis"
            >
              <ThumbsUp size={12} />
            </button>
            <button
              onClick={() => rateMutation.mutate({ analysisId: analysis._id, action: 'dislike' })}
              disabled={rateMutation.isPending}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.72rem] font-medium transition-all border ${
                userRating === 'dislike'
                  ? 'bg-[rgba(200,121,65,0.15)] border-[rgba(200,121,65,0.35)] text-copper'
                  : 'bg-white/[0.03] border-[rgba(143,163,184,0.12)] text-steel hover:bg-[rgba(200,121,65,0.08)] hover:border-[rgba(200,121,65,0.2)] hover:text-copper'
              }`}
              title="Dislike analysis"
            >
              <ThumbsDown size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
