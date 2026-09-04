import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  Pencil,
} from "lucide-react";
import GlassPanel from "./GlassPanel";

export default function AiAgentsPerformanceChart({
  data = [],
  className = "",
}) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all' | 'critical' | 'high'

  const rawAgents = data.length > 0 ? data : [];

  const filteredAgents = useMemo(() => {
    if (filter === "critical") {
      return rawAgents.filter((a) => a.critical);
    }
    if (filter === "high") {
      return rawAgents.filter((a) => parseFloat(a.accuracyRate || "0") >= 95);
    }
    return rawAgents;
  }, [rawAgents, filter]);

  // Summary Metrics across agents
  const totalInspectionsSum = useMemo(() => {
    return rawAgents.reduce((acc, a) => acc + (a.totalInspections || 0), 0);
  }, [rawAgents]);

  return (
    <GlassPanel
      title="AI Inspection Agents Performance Matrix"
      subtitle="Detailed workload, accuracy rate, and confidence scores across all active AI inspection agents"
      icon={Bot}
      badge={`${rawAgents.length} Active Agents`}
      action={
        <div className="flex items-center gap-2">
          {/* Quick Filter Pill Buttons */}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan/40 text-steel hover:text-cyan text-xs font-orbitron font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-glass"
          >
            {isExpanded ? (
              <>
                Collapse <ChevronUp size={14} />
              </>
            ) : (
              <>
                Expand Matrix ({rawAgents.length} Agents){" "}
                <ChevronDown size={14} />
              </>
            )}
          </button>
        </div>
      }
      className={className}
    >
      {isExpanded && (
        <div className="space-y-4">
          {/* Top Info Strip */}

          {/* Dynamic Grid: 2 agents per row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredAgents.map((agent, i) => {
              const passPct =
                agent.totalInspections > 0
                  ? Math.round((agent.passCount / agent.totalInspections) * 100)
                  : Number(agent.accuracyRate?.replace("%", "")) || 95;

              const isHighPerformer =
                parseFloat(agent.accuracyRate || "0") >= 95;

              const agentId = agent._id || agent.id;

              return (
                <div
                  key={agentId || i}
                  onClick={() =>
                    navigate(`/dashboard/agents/${agentId}/update`)
                  }
                  title={`Click to edit ${agent.name}`}
                  className="p-4 rounded-xl bg-[#090f1d]/90 backdrop-blur-md border border-[rgba(0,212,255,0.12)] hover:border-cyan/50 hover:shadow-[0_0_20px_rgba(0,212,255,0.18)] transition-all duration-300 space-y-3.5 relative overflow-hidden group flex flex-col justify-between cursor-pointer"
                >
                  {/* Top Accent Line */}
                  <div
                    className={`h-[2.5px] absolute top-0 left-0 right-0 transition-opacity ${
                      agent.critical
                        ? "bg-gradient-to-r from-copper via-amber-500 to-transparent"
                        : "bg-gradient-to-r from-cyan via-blue-500 to-transparent"
                    }`}
                  />

                  {/* Agent Header */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="w-9 h-9 rounded-xl bg-cyan/10 border border-cyan/30 flex items-center justify-center text-cyan shadow-[0_0_12px_rgba(0,212,255,0.2)] shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                        {agent.image ? (
                          <img
                            src={agent.image}
                            alt={agent.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Bot size={18} />
                        )}
                      </div>

                      {/* Accuracy Rate Badge & Edit Pill */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* <span className="text-[0.62rem] font-orbitron px-2 py-0.5 rounded-md bg-cyan/10 border border-cyan/30 text-cyan opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 font-semibold shadow-glow-sm">
                          <Pencil size={10} /> Edit
                        </span> */}
                        <div className="text-right shrink-0">
                          <span className="text-[0.58rem] font-orbitron text-text-muted block uppercase tracking-wider">
                            Pass Rate
                          </span>
                          <span
                            className={`font-orbitron text-sm font-black ${isHighPerformer ? "text-emerald-400" : "text-cyan"}`}
                          >
                            {agent.accuracyRate}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Agent Name & Tag */}
                    <div>
                      <h4
                        className="font-orbitron text-xs font-bold text-text-primary group-hover:text-cyan transition-colors line-clamp-1 flex items-center gap-1.5"
                        title={agent.name}
                      >
                        {agent.name}
                      </h4>
                      {/* <div className="flex items-center gap-2 mt-1">
                        {agent.critical ? (
                          <span className="text-[0.58rem] font-orbitron px-2 py-0.5 rounded bg-copper/20 border border-copper/40 text-copper font-semibold">
                            Critical QC
                          </span>
                        ) : (
                          <span className="text-[0.58rem] font-orbitron px-2 py-0.5 rounded bg-cyan/10 border border-cyan/20 text-cyan font-semibold">
                            Standard QC
                          </span>
                        )}
                        <span className="text-[0.6rem] text-text-muted font-orbitron">
                          Thresh: {agent.complianceThreshold}%
                        </span>
                      </div> */}
                    </div>
                  </div>

                  {/* Workload Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[0.65rem] font-orbitron text-steel">
                      <span>
                        Workload:{" "}
                        <strong className="text-text-primary">
                          {(agent.totalInspections || 0).toLocaleString()}
                        </strong>
                      </span>
                      <span className="text-emerald-400 font-semibold">
                        Pass Rate: {agent.accuracyRate || `${passPct}%`}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-black/60 border border-white/10 overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-cyan to-blue-500 shadow-[0_0_10px_rgba(0,212,255,0.4)] transition-all duration-700"
                        style={{ width: `${Math.max(5, passPct)}%` }}
                      />
                    </div>
                  </div>

                  {/* Bottom Metrics Pill */}
                  <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[0.65rem] font-orbitron">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">
                        P : {(agent.passCount || 0).toLocaleString()}
                      </span>
                      <span className="text-copper font-bold">
                        F : {(agent.failCount || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-text-muted">
                      <span
                        className="flex items-center gap-0.5 text-emerald-400/90"
                        title="Likes"
                      >
                        <ThumbsUp size={10} /> {agent.likes || 0}
                      </span>
                      <span
                        className="flex items-center gap-0.5 text-copper/90"
                        title="Dislikes"
                      >
                        <ThumbsDown size={10} /> {agent.dislikes || 0}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </GlassPanel>
  );
}
