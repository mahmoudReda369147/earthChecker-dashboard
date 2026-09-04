import { Layers } from 'lucide-react'
import GlassPanel from './GlassPanel'

export default function DefectsByModuleChart({ data = [], className = '' }) {
  return (
    <GlassPanel
      title="Defects by Production Module"
      subtitle="Module rejection frequency across active inspection runs"
      icon={Layers}
      className={className}
    >
      <div className="space-y-4">
        {data.map((mod, i) => (
          <div
            key={i}
            className="p-3.5 rounded-xl bg-black/20 border border-white/5 space-y-2 hover:border-white/15 transition-all"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-text-primary truncate max-w-[200px]">{mod.moduleName}</span>
              <span className="font-orbitron font-bold text-copper">{mod.defects} Defects ({mod.rate})</span>
            </div>

            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(5, (mod.defects / Math.max(1, mod.total)) * 100))}%`, background: mod.barColor }}
              />
            </div>
          </div>
        ))}
      </div>
    </GlassPanel>
  )
}
