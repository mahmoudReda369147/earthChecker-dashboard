import { Activity } from 'lucide-react'
import GlassPanel from './GlassPanel'

export default function HourlyTimelineChart({ data = [], className = '' }) {
  const maxVal = Math.max(...data.map((s) => s.total || 1), 700)

  return (
    <GlassPanel
      title="Hourly Throughput & Defect Spikes"
      subtitle="Identify exact operational shifts or timestamps when quality degraded"
      icon={Activity}
      action={
        <div className="flex items-center gap-2 text-xs font-orbitron text-text-muted">
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan" /> Passed</span>
          <span className="inline-flex items-center gap-1 ml-2"><span className="w-2 h-2 rounded-full bg-copper" /> Rejected</span>
        </div>
      }
      className={className}
    >
      <div className="overflow-x-auto pb-2 custom-scrollbar">
        <div className="h-56 flex items-end justify-between gap-6 pt-6 pb-2 px-4 border-b border-white/10 min-w-[950px]">
          {data.map((slot, i) => {
            const passHeight = ((slot.pass || 0) / maxVal) * 100
            const failHeight = ((slot.fail || 0) / maxVal) * 100

            return (
              <div key={i} className="flex-1 min-w-[36px] flex flex-col items-center gap-2 h-full justify-end group relative">

                {/* Tooltip on hover */}
                <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 border border-cyan/30 p-2 rounded-lg text-[0.68rem] font-orbitron whitespace-nowrap z-20 pointer-events-none shadow-xl">
                  <p className="text-cyan font-bold">{slot.time}</p>
                  <p className="text-emerald-400">Passed: {slot.pass}</p>
                  <p className="text-copper">Rejected: {slot.fail}</p>
                  <p className="text-text-muted">Total: {slot.total}</p>
                </div>

                {/* Stacked Bar */}
                <div className="w-full max-w-[38px] flex flex-col items-center gap-1 justify-end h-full">
                  {/* Fail segment */}
                  <div
                    className={`w-full rounded-t-md transition-all ${slot.hasSpike ? 'bg-copper shadow-[0_0_12px_rgba(200,121,65,0.6)] animate-pulse' : 'bg-copper/80'}`}
                    style={{ height: `${failHeight}%` }}
                  />
                  {/* Pass segment */}
                  <div
                    className="w-full rounded-b-md bg-cyan/70 group-hover:bg-cyan transition-all"
                    style={{ height: `${passHeight}%` }}
                  />
                </div>

                {/* Time label */}
                <span className={`text-[0.68rem] font-orbitron font-semibold whitespace-nowrap ${slot.hasSpike ? 'text-copper font-bold' : 'text-text-muted'}`}>
                  {slot.time}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </GlassPanel>
  )
}
