import { CheckCircle2, XCircle, ThumbsDown, ShieldCheck } from 'lucide-react'
import GlassPanel from './GlassPanel'

export default function AiVerdictDistributionChart({ data = {}, className = '' }) {
  const total = data.total || 1
  const passCount = data.pass || 0
  const failCount = data.fail || 0
  const dislikeCount = data.disliked || 0

  const passPct = Math.round((passCount / total) * 100)
  const failPct = Math.round((failCount / total) * 100)
  const dislikePct = ( (dislikeCount / total) * 100 ).toFixed(1)

  return (
    <GlassPanel
      title="AI Decision & Audit Distribution"
      subtitle="Breakdown of AI Automated Pass/Fail verdicts vs. Supervisor manual overrides"
      icon={ShieldCheck}
      badge="Model Accuracy"
      className={className}
    >
      <div className="space-y-4">
        {/* Pass Breakdown */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-orbitron">
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 size={14} /> AI Pass Verdicts
            </span>
            <span className="text-text-primary font-bold">{passCount.toLocaleString()} ({passPct}%)</span>
          </div>
          <div className="h-2.5 rounded-full bg-black/40 border border-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] transition-all duration-700"
              style={{ width: `${passPct}%` }}
            />
          </div>
        </div>

        {/* Fail Breakdown */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-orbitron">
            <span className="text-copper font-bold flex items-center gap-1.5">
              <XCircle size={14} /> AI Defect Rejections
            </span>
            <span className="text-text-primary font-bold">{failCount.toLocaleString()} ({failPct}%)</span>
          </div>
          <div className="h-2.5 rounded-full bg-black/40 border border-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-copper shadow-[0_0_10px_rgba(200,121,65,0.5)] transition-all duration-700"
              style={{ width: `${failPct}%` }}
            />
          </div>
        </div>

        {/* Supervisor Challenge / Dislikes */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-orbitron">
            <span className="text-amber-400 font-bold flex items-center gap-1.5">
              <ThumbsDown size={14} /> Supervisor Verdict Overrides
            </span>
            <span className="text-text-primary font-bold">{dislikeCount} items ({dislikePct}%)</span>
          </div>
          <div className="h-2.5 rounded-full bg-black/40 border border-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)] transition-all duration-700"
              style={{ width: `${Math.max(2, Number(dislikePct))}%` }}
            />
          </div>
        </div>

        {/* Summary Card */}
        <div className="p-3.5 rounded-xl bg-cyan/5 border border-cyan/20 flex items-center justify-between text-xs mt-2">
          <span className="text-steel font-medium">Model Precision Rate</span>
          <span className="font-orbitron font-extrabold text-cyan">{data.passRate || '96.4%'}</span>
        </div>
      </div>
    </GlassPanel>
  )
}
