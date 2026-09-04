import { useNavigate } from 'react-router-dom'
import { AlertOctagon, ArrowUpRight } from 'lucide-react'

export default function AiHealthAlertBanner({ aiHealth = {} }) {
  const navigate = useNavigate()
  const reviewQueueCount = aiHealth.reviewQueueCount ?? 0
  const avgConfidence = aiHealth.avgConfidence ?? '96.4% Avg Score'

  return (
    <div className="rounded-2xl bg-gradient-to-r from-[rgba(200,121,65,0.12)] via-[#060a14] to-[rgba(168,85,247,0.12)] border border-[rgba(200,121,65,0.3)] p-5 shadow-[0_0_25px_rgba(200,121,65,0.15)] flex flex-col md:flex-row items-center justify-between gap-5">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[rgba(200,121,65,0.18)] border border-[rgba(200,121,65,0.35)] flex items-center justify-center text-copper shrink-0 shadow-[0_0_15px_rgba(200,121,65,0.2)]">
          <AlertOctagon size={24} className="animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="font-orbitron text-sm font-bold text-text-primary uppercase tracking-wider">
              Manual Supervisor Audit Queue Required
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-copper/20 border border-copper/40 text-copper font-orbitron text-[0.62rem] font-bold">
              {reviewQueueCount} Borderline Verdicts
            </span>
          </div>
          <p className="text-xs text-steel mt-1 max-w-2xl">
            AI confidence dropped below standard threshold (75%) on {reviewQueueCount || 2} inspection items. Supervisor manual verification is required to update model weights.
          </p>
        </div>
      </div>

      {/* AI Confidence Metric Box */}
      <div className="flex items-center gap-4 shrink-0 bg-black/40 border border-white/10 p-3 rounded-xl">
        <div className="text-right">
          <p className="text-[0.6rem] uppercase tracking-widest text-text-muted font-orbitron">AI Model Confidence</p>
          <p className="font-orbitron text-lg font-black text-cyan">{avgConfidence}</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/cycles')}
          className="btn-copper text-xs py-2 px-4 flex items-center gap-1.5"
        >
          Review Queue <ArrowUpRight size={13} />
        </button>
      </div>
    </div>
  )
}
