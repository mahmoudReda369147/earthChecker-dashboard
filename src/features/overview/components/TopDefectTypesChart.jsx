import { AlertTriangle } from 'lucide-react'
import GlassPanel from './GlassPanel'

export default function TopDefectTypesChart({ data = [], className = '' }) {
  return (
    <GlassPanel
      title="Top Defect Types (Today)"
      subtitle="Root-cause classification to identify faulty production line machinery"
      icon={AlertTriangle}
      badge={`${data.length} Categories`}
      className={className}
    >
      <div className="space-y-5">
        {data.map((defect, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-orbitron">
              <span className="text-text-primary font-bold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: defect.color }} />
                {defect.name}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-text-muted text-[0.7rem]">Source: {defect.machine}</span>
                <span className="text-text-primary font-bold">{defect.count} items ({defect.percentage}%)</span>
              </div>
            </div>

            {/* Progress Distribution Bar */}
            <div className="h-3 rounded-full bg-black/40 border border-white/10 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${defect.percentage}%`,
                  background: defect.color,
                  boxShadow: `0 0 10px ${defect.color}60`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </GlassPanel>
  )
}
