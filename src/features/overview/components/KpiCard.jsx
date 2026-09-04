import { Search, CheckCircle, XCircle, AlertTriangle, DollarSign, Activity, TrendingUp, TrendingDown } from 'lucide-react'
import Sparkline from './Sparkline'

function getKpiIcon(key) {
  switch (key) {
    case 'totalInspections':
      return <Search size={18} className="text-cyan" />
    case 'totalAcceptedCycles':
    case 'acceptanceRate':
      return <CheckCircle size={18} className="text-emerald-400" />
    case 'totalRejectedCycles':
      return <XCircle size={18} className="text-copper" />
    case 'rejectionFlags':
      return <AlertTriangle size={18} className="text-copper" />
    case 'wastageCost':
      return <DollarSign size={18} className="text-amber-400" />
    default:
      return <Activity size={18} className="text-cyan" />
  }
}

export default function KpiCard({ kpi }) {
  return (
    <div className="relative rounded-2xl bg-[#060a14]/90 backdrop-blur-2xl border border-[rgba(0,212,255,0.15)] p-5 overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:border-[rgba(0,212,255,0.35)] transition-all duration-300 group">
      <div className="h-[2px] absolute top-0 left-0 right-0" style={{ background: kpi.accentColor }} />

      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-glass">
          {getKpiIcon(kpi.key)}
        </div>

        {/* Delta Tag */}
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.68rem] font-orbitron font-bold border ${
          kpi.isUp
            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
            : 'bg-copper/10 border-copper/25 text-copper'
        }`}>
          {kpi.isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {kpi.delta}
        </div>
      </div>

      {/* Value & Label */}
      <div>
        <p className="font-orbitron text-2xl md:text-3xl font-black text-text-primary tracking-tight">
          {kpi.value}
        </p>
        <p className="text-xs font-semibold text-steel mt-1">{kpi.label}</p>
      </div>

      {/* Sparkline & Sublabel */}
      <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-3">
        <span className="text-[0.68rem] text-text-muted truncate">{kpi.sublabel}</span>
        <Sparkline data={kpi.sparkData} color={kpi.accentColor} height={28} />
      </div>
    </div>
  )
}
