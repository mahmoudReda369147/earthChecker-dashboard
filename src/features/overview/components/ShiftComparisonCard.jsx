import { Sun, Moon } from 'lucide-react'
import GlassPanel from './GlassPanel'

export default function ShiftComparisonCard({ data, className = '' }) {
  const morning = data?.morning ?? {
    shift: 'Morning Shift (06:00 - 14:00)', total: 0, passRate: '0%', defects: 0, wastage: '$0', speed: '0 items/min',
  }
  const evening = data?.evening ?? {
    shift: 'Evening Shift (14:00 - 22:00)', total: 0, passRate: '0%', defects: 0, wastage: '$0', speed: '0 items/min',
  }

  return (
    <GlassPanel
      title="Shift Performance Comparison"
      subtitle="Operational quality metrics comparing Morning vs Evening shifts"
      icon={Sun}
      className={className}
    >
      <div className="space-y-4">
        {/* Morning Shift Card */}
        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-orbitron font-bold text-emerald-400 flex items-center gap-1.5">
              <Sun size={14} /> Morning Shift
            </span>
            <span className="text-xs font-orbitron font-extrabold text-emerald-400">
              {morning.passRate} Quality Rate
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-steel pt-1">
            <div>Inspected: <strong className="text-text-primary">{morning.total}</strong></div>
            <div>Defects: <strong className="text-copper">{morning.defects}</strong></div>
            <div>Wastage: <strong className="text-amber-400">{morning.wastage}</strong></div>
            <div>Speed: <strong className="text-cyan">{morning.speed}</strong></div>
          </div>
        </div>

        {/* Evening Shift Card */}
        <div className="p-4 rounded-xl bg-copper/5 border border-copper/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-orbitron font-bold text-copper flex items-center gap-1.5">
              <Moon size={14} /> Evening Shift
            </span>
            <span className="text-xs font-orbitron font-extrabold text-copper">
              {evening.passRate} Quality Rate
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-steel pt-1">
            <div>Inspected: <strong className="text-text-primary">{evening.total}</strong></div>
            <div>Defects: <strong className="text-copper">{evening.defects}</strong></div>
            <div>Wastage: <strong className="text-amber-400">{evening.wastage}</strong></div>
            <div>Speed: <strong className="text-cyan">{evening.speed}</strong></div>
          </div>
        </div>
      </div>
    </GlassPanel>
  )
}
