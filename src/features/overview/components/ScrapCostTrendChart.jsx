import { DollarSign, TrendingDown } from 'lucide-react'
import GlassPanel from './GlassPanel'

export default function ScrapCostTrendChart({ data = [], className = '' }) {
  const maxCost = Math.max(...data.map((d) => d.cost || 0), 2000)

  return (
    <GlassPanel
      title="Daily Scrap & Financial Loss Trend"
      subtitle="7-day aggregated financial wastage in EGP and scrap quantity"
      icon={DollarSign}
      badge="Financial Impact"
      className={className}
    >
      <div className="space-y-4">
        {/* Daily Bar Chart Visualizer */}
        <div className="h-48 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-white/10">
          {data.map((item, idx) => {
            const barHeight = Math.max(12, ((item.cost || 0) / maxCost) * 100)
            const isHighest = item.cost === maxCost && maxCost > 0

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                {/* Tooltip */}
                <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 border border-amber-500/40 p-2 rounded-lg text-[0.68rem] font-orbitron whitespace-nowrap z-20 pointer-events-none shadow-2xl">
                  <p className="text-amber-400 font-bold">{item.date}</p>
                  <p className="text-text-primary">Wastage: {item.cost.toLocaleString()} EGP</p>
                  <p className="text-copper">Scrap: {item.units} pcs</p>
                </div>

                {/* Bar */}
                <div className="w-full max-w-[36px] flex flex-col justify-end h-full">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      isHighest
                        ? 'bg-gradient-to-t from-amber-600 to-copper shadow-[0_0_15px_rgba(200,121,65,0.6)] animate-pulse'
                        : 'bg-gradient-to-t from-amber-500/30 to-amber-400/80 group-hover:to-amber-400'
                    }`}
                    style={{ height: `${barHeight}%` }}
                  />
                </div>

                {/* Date Label */}
                <span className="text-[0.68rem] font-orbitron font-semibold text-text-muted">
                  {item.date}
                </span>
              </div>
            )
          })}
        </div>

        {/* Footer Summary Pills */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between">
            <span className="text-xs text-steel font-medium">Peak Day Loss</span>
            <span className="font-orbitron text-xs font-bold text-copper flex items-center gap-1">
              <TrendingDown size={12} /> {maxCost.toLocaleString()} EGP
            </span>
          </div>
          <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between">
            <span className="text-xs text-steel font-medium">Avg Daily Scrap</span>
            <span className="font-orbitron text-xs font-bold text-amber-400">
              {Math.round((data.reduce((acc, d) => acc + (d.units || 0), 0) / Math.max(1, data.length)))} pcs/day
            </span>
          </div>
        </div>
      </div>
    </GlassPanel>
  )
}
