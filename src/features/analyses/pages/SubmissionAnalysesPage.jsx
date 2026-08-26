import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, CheckCircle2, XCircle, Bot, Image as ImageIcon, ThumbsUp, ThumbsDown } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import { useSubmissionAnalyses, useRateAnalysis } from '../apiHooks'

export default function SubmissionAnalysesPage() {
  const { submissionId } = useParams()
  const navigate = useNavigate()
  const { data, isLoading } = useSubmissionAnalyses(submissionId)

  const analyses  = data?.data?.analyses  ?? []
  const submission = data?.data?.submission

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 size={28} className="animate-spin text-cyan" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="AI Analyses"
        subtitle={submission ? `Submission for form: ${submission.formId?.name ?? submissionId}` : 'Submission analyses'}
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
          <p className="text-text-muted text-[0.75rem] mt-1">Analyses are created when image fields have an assigned AI agent.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {analyses.map((analysis) => (
            <AnalysisCard key={analysis._id} analysis={analysis} submissionId={submissionId} />
          ))}
        </div>
      )}
    </div>
  )
}

function AnalysisCard({ analysis, submissionId }) {
  const { aiResult, agentId: agent, imageUrls, userRating } = analysis
  const isPassed = aiResult.result === 'pass'
  const [activeImage, setActiveImage] = useState(0)
  const rateMutation = useRateAnalysis(submissionId)

  return (
    <div className="bg-bg-glass backdrop-blur-xl border border-[rgba(0,212,255,0.08)] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-3.5 border-b ${
        isPassed
          ? 'border-[rgba(16,185,129,0.15)] bg-[rgba(16,185,129,0.04)]'
          : 'border-[rgba(200,121,65,0.15)] bg-[rgba(200,121,65,0.04)]'
      }`}>
        <div className="flex items-center gap-3">
          {agent?.image ? (
            <img src={agent.image} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)] flex items-center justify-center">
              <Bot size={14} className="text-cyan" />
            </div>
          )}
          <p className="text-[0.82rem] font-semibold text-text-primary">{agent?.name ?? 'AI Agent'}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Confidence */}
          <div className="text-right">
            <p className="text-[0.65rem] text-text-muted uppercase tracking-wider">Confidence</p>
            <p className="font-orbitron text-[0.85rem] font-bold text-text-primary">{aiResult.confidence.toFixed(1)}%</p>
          </div>

          {/* Result badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.72rem] font-bold uppercase tracking-wider ${
            isPassed
              ? 'bg-[rgba(16,185,129,0.12)] text-emerald-400 border border-[rgba(16,185,129,0.25)]'
              : 'bg-[rgba(200,121,65,0.12)] text-copper border border-[rgba(200,121,65,0.25)]'
          }`}>
            {isPassed ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
            {aiResult.result}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Fail reason */}
        {!isPassed && aiResult.reason && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-[rgba(200,121,65,0.06)] border border-[rgba(200,121,65,0.12)]">
            <p className="text-[0.68rem] text-copper font-semibold uppercase tracking-wider mb-1">Fail Reason</p>
            <p className="text-[0.8rem] text-text-primary leading-relaxed">{aiResult.reason}</p>
          </div>
        )}

        {/* Images */}
        {imageUrls?.length > 0 && (
          <div>
            <p className="flex items-center gap-1.5 text-[0.68rem] text-text-muted uppercase tracking-wider mb-2.5">
              <ImageIcon size={11} />
              Analyzed Images ({imageUrls.length})
            </p>
            <div className="flex gap-3">
              {/* Main image */}
              <div className="flex-1 min-w-0 rounded-xl overflow-hidden border border-[rgba(0,212,255,0.08)] aspect-video">
                <img
                  src={imageUrls[activeImage]}
                  alt={`Analysis image ${activeImage + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnails column */}
              {imageUrls.length > 1 && (
                <div className="flex flex-col gap-2 w-16 shrink-0">
                  {imageUrls.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        i === activeImage
                          ? 'border-cyan shadow-[0_0_8px_rgba(0,212,255,0.3)]'
                          : 'border-[rgba(0,212,255,0.08)] opacity-60 hover:opacity-100 hover:border-[rgba(0,212,255,0.2)]'
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

        {/* Confidence bar + Rating */}
        <div className="mt-4 flex items-end gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[0.68rem] text-text-muted">AI Confidence</span>
              <span className="text-[0.68rem] font-semibold text-text-primary">{aiResult.confidence.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-[rgba(143,163,184,0.1)] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isPassed ? 'bg-emerald-400' : 'bg-copper'
                }`}
                style={{ width: `${aiResult.confidence}%` }}
              />
            </div>
          </div>

          {/* Like / Dislike */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => rateMutation.mutate({ analysisId: analysis._id, action: 'like' })}
              disabled={rateMutation.isPending}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.72rem] font-medium transition-all border ${
                userRating === 'like'
                  ? 'bg-[rgba(16,185,129,0.15)] border-[rgba(16,185,129,0.35)] text-emerald-400'
                  : 'bg-white/[0.03] border-[rgba(143,163,184,0.12)] text-steel hover:bg-[rgba(16,185,129,0.08)] hover:border-[rgba(16,185,129,0.2)] hover:text-emerald-400'
              }`}
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
            >
              <ThumbsDown size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
