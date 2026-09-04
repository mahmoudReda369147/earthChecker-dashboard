import { useNavigate, Link, useSearchParams } from "react-router-dom";
import {
  Search,
  CheckCircle,
  AlertTriangle,
  Plus,
  LayoutGrid,
  ChevronRight,
  DollarSign,
  Activity,
  TrendingUp,
  TrendingDown,
  Layers,
  Sun,
  Moon,
  AlertOctagon,
  ArrowUpRight,
  RefreshCw,
  Eye,
  Calendar,
  X,
} from "lucide-react";
import PageHeader from "../../../components/ui/PageHeader";
import StatusBadge from "../../../components/ui/StatusBadge";
import DataTable from "../../../components/ui/DataTable";
import AiAgentsPerformanceChart from "../components/AiAgentsPerformanceChart";
import AiVerdictDistributionChart from "../components/AiVerdictDistributionChart";
import { useOverviewStats } from "../apiHooks";

/* ═══════════════════════════════════════════════════════════
   1. SVG SPARKLINE HELPER
   ═══════════════════════════════════════════════════════════ */
function Sparkline({ data = [0], color = "#00d4ff", height = 36 }) {
  const safeData = data.length > 0 ? data : [0, 0];
  const min = Math.min(...safeData);
  const max = Math.max(...safeData);
  const range = max - min || 1;
  const width = 120;

  const points = safeData
    .map((val, i) => {
      const x = (i / Math.max(1, safeData.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(" ");

  const fillPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient
          id={`grad-${color.replace("#", "")}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <polygon
        points={fillPoints}
        fill={`url(#grad-${color.replace("#", "")})`}
      />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

const CYCLE_COLS = [
  { key: "id", label: "ID", width: "100px" },
  { key: "module", label: "Module", width: "160px" },
  { key: "batches", label: "Batches", align: "center", width: "90px" },
  { key: "accepted", label: "Accepted", align: "center", width: "100px" },
  { key: "status", label: "Status", align: "center", width: "160px" },
  { key: "stages", label: "Stages", align: "center", width: "90px" },
  { key: "actions", label: "Actions", align: "right", width: "110px" },
];

const cyanBtn =
  "w-7 h-7 rounded-lg flex items-center justify-center transition-all text-cyan border border-[rgba(0,212,255,0.2)] hover:border-[rgba(0,212,255,0.5)] hover:bg-[rgba(0,212,255,0.06)]";

function renderCycleCell(key, row) {
  const cycleId = row.rawId || row.id;
  switch (key) {
    case "id":
      return (
        <span className="font-orbitron text-[0.68rem] font-bold text-cyan tracking-[0.06em]">
          {row.id}
        </span>
      );
    case "module":
      return <span className="text-[0.78rem] text-steel">{row.module}</span>;
    case "batches":
      return <span className="text-[0.78rem] text-steel">{row.batches}</span>;
    case "accepted":
      return (
        <span className="text-[0.78rem] text-steel">
          <span className="text-cyan font-semibold">{row.accepted}</span>/
          {row.batches}
        </span>
      );
    case "status":
      return (
        <div className="flex flex-col items-center gap-1">
          <StatusBadge status={row.status} />
        </div>
      );
    case "stages":
      return (
        <Link
          to={`/dashboard/cycles/${cycleId}/stages`}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[0.7rem] font-semibold text-cyan border border-[rgba(0,212,255,0.2)] bg-[rgba(0,212,255,0.04)] hover:border-[rgba(0,212,255,0.45)] hover:bg-[rgba(0,212,255,0.1)] transition-all"
        >
          <Eye size={11} /> Stages
        </Link>
      );
    case "actions":
      return (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            to={`/dashboard/cycles/${cycleId}`}
            title="View details"
            className={cyanBtn}
          >
            <Eye size={12} />
          </Link>
        </div>
      );
    default:
      return null;
  }
}

/* ── Glass Panel Container ── */
function GlassPanel({
  children,
  title,
  subtitle,
  icon: Icon,
  badge,
  action,
  className = "",
}) {
  return (
    <div
      className={`relative rounded-2xl bg-[#060a14]/90 backdrop-blur-2xl border border-[rgba(0,212,255,0.12)] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col ${className}`}
    >
      <div className="h-[2px] bg-gradient-to-r from-cyan/80 via-blue-500/50 to-transparent" />
      {(title || action) && (
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-8 h-8 rounded-xl bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)] flex items-center justify-center text-cyan shadow-[0_0_10px_rgba(0,212,255,0.15)]">
                <Icon size={16} />
              </div>
            )}
            <div>
              <h3 className="font-orbitron text-sm font-bold text-text-primary tracking-wide flex items-center gap-2">
                {title}
                {badge && (
                  <span className="text-[0.62rem] font-orbitron px-2 py-0.5 rounded-full bg-cyan/10 border border-cyan/20 text-cyan">
                    {badge}
                  </span>
                )}
              </h3>
              {subtitle && (
                <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          {action}
        </div>
      )}
      <div className="p-5 flex-1">{children}</div>
    </div>
  );
}

/* Helper to attach icons to API KPI items */
function getKpiIcon(key) {
  switch (key) {
    case "totalInspections":
      return <Search size={18} className="text-cyan" />;
    case "totalAcceptedCycles":
    case "acceptanceRate":
      return <CheckCircle size={18} className="text-emerald-400" />;
    case "totalRejectedCycles":
    case "rejectionFlags":
      return <AlertTriangle size={18} className="text-copper" />;
    case "wastageCost":
      return <DollarSign size={18} className="text-amber-400" />;
    default:
      return <Activity size={18} className="text-cyan" />;
  }
}

/* ═══════════════════════════════════════════════════════════
   MAIN OVERVIEW PAGE COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function OverviewPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const fromDate = searchParams.get("fromDate") || "";
  const toDate = searchParams.get("toDate") || "";

  const updateDateParam = (newFrom, newTo) => {
    const nextParams = new URLSearchParams(searchParams);
    if (newFrom) nextParams.set("fromDate", newFrom);
    else nextParams.delete("fromDate");

    if (newTo) nextParams.set("toDate", newTo);
    else nextParams.delete("toDate");

    setSearchParams(nextParams, { replace: true });
  };

  const formatDateStr = (d) => d.toISOString().split("T")[0];

  const todayStr = formatDateStr(new Date());
  const d7Str = formatDateStr(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000));
  const d30Str = formatDateStr(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000));
  const firstMonthStr = formatDateStr(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  const activePreset =
    !fromDate && !toDate
      ? "all"
      : fromDate === todayStr && toDate === todayStr
      ? "today"
      : fromDate === d7Str && toDate === todayStr
      ? "7days"
      : fromDate === d30Str && toDate === todayStr
      ? "30days"
      : fromDate === firstMonthStr && toDate === todayStr
      ? "thisMonth"
      : "custom";

  const { data, isLoading, isFetching, refetch } = useOverviewStats({
    fromDate,
    toDate,
  });

  const kpiCards = data?.kpiCards ?? [];
  const topDefectTypes = data?.topDefectTypes ?? [];
  const defectsByModule = data?.defectsByModule ?? [];
  const hourlyTimeline = data?.hourlyTimeline ?? [];
  const shiftComparison = data?.shiftComparison ?? {
    morning: {
      shift: "Morning Shift (06:00 - 14:00)",
      total: 0,
      passRate: "100.0%",
      defects: 0,
      wastage: "$0",
      speed: "0.0 items/min",
    },
    evening: {
      shift: "Evening Shift (14:00 - 22:00)",
      total: 0,
      passRate: "100.0%",
      defects: 0,
      wastage: "$0",
      speed: "0.0 items/min",
    },
  };
  const aiHealth = data?.aiHealth ?? {
    avgConfidence: "100.0% Avg Score",
    reviewQueueCount: 0,
  };
  const aiAgents = data?.aiAgents ?? [];
  const aiVerdictDistribution = data?.aiVerdictDistribution ?? {
    total: 0,
    pass: 0,
    fail: 0,
    disliked: 0,
    passRate: "100.0%",
  };
  const recentCycles = data?.recentCycles ?? [];

  return (
    <div className="space-y-6 pb-24">
      {/* ── Page Header ── */}
      <PageHeader
        title="Operations & Defect Intelligence"
        subtitle="Real-time quality monitoring, root-cause defect analysis, and AI model health"
        badge={`Live System • ${aiHealth.avgConfidence}`}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-cyan/40 text-steel hover:text-cyan text-xs font-orbitron font-semibold flex items-center gap-1.5 transition-all"
              title="Refresh Real Backend Data"
            >
              <RefreshCw
                size={13}
                className={isFetching ? "animate-spin text-cyan" : ""}
              />
              {isFetching ? "Refreshing..." : "Refresh"}
            </button>

            <button
              onClick={() => navigate("/dashboard/cycles/create")}
              className="btn-primary text-[0.75rem] py-[9px] px-[18px] flex items-center gap-1.5"
            >
              <Plus size={14} /> Start New Inspection Cycle
            </button>
          </div>
        }
      />

      {/* ── High-End Glassmorphic Timeline Date Filter Bar ── */}
      <div className="relative rounded-2xl bg-[#060a14]/90 backdrop-blur-2xl border border-[rgba(0,212,255,0.18)] p-4 sm:p-5 shadow-[0_12px_32px_rgba(0,0,0,0.45)] overflow-hidden space-y-4">
        {/* Top Glowing Gradient Line */}
        <div className="h-[2px] absolute top-0 left-0 right-0 bg-gradient-to-r from-cyan via-blue-500 to-transparent" />

        {/* ── ROW 1: Status on Left, Side-by-Side Date Pickers on Right ── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left: Badge & All-Time Records status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-cyan font-orbitron text-xs font-bold tracking-wider">
              <div className="w-8 h-8 rounded-xl bg-cyan/10 border border-cyan/30 flex items-center justify-center text-cyan shadow-[0_0_12px_rgba(0,212,255,0.2)]">
                <Calendar size={15} />
              </div>
              <span className="uppercase">Timeline Filter</span>
            </div>

            {/* All-Time Records or Active Filter badge */}
            {(fromDate || toDate) ? (
              <span className="px-2.5 py-1 rounded-lg bg-cyan/10 border border-cyan/30 text-cyan font-orbitron text-[0.68rem] font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-ping" />
                Filtered Range
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-orbitron text-[0.68rem] font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                All-Time Records
              </span>
            )}
          </div>

          {/* Right: Side by side From & To Date inputs */}
          <div className="flex flex-wrap items-center gap-2">
            {/* From Date */}
            <div className="flex items-center gap-2 bg-black/50 border border-white/10 hover:border-cyan/40 focus-within:border-cyan focus-within:shadow-[0_0_10px_rgba(0,212,255,0.2)] px-3 py-1.5 rounded-xl transition-all">
              <span className="text-[0.65rem] font-orbitron font-semibold text-text-muted uppercase">From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => updateDateParam(e.target.value, toDate)}
                className="bg-transparent text-text-primary outline-none font-orbitron text-xs cursor-pointer [color-scheme:dark]"
              />
            </div>

            <span className="text-steel font-orbitron text-xs text-text-muted">→</span>

            {/* To Date */}
            <div className="flex items-center gap-2 bg-black/50 border border-white/10 hover:border-cyan/40 focus-within:border-cyan focus-within:shadow-[0_0_10px_rgba(0,212,255,0.2)] px-3 py-1.5 rounded-xl transition-all">
              <span className="text-[0.65rem] font-orbitron font-semibold text-text-muted uppercase">To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => updateDateParam(fromDate, e.target.value)}
                className="bg-transparent text-text-primary outline-none font-orbitron text-xs cursor-pointer [color-scheme:dark]"
              />
            </div>

            {/* Reset button if filter is active */}
            {(fromDate || toDate) && (
              <button
                onClick={() => updateDateParam("", "")}
                className="px-3 py-1.5 rounded-xl bg-copper/15 border border-copper/40 text-copper text-xs font-orbitron font-semibold hover:bg-copper/25 hover:border-copper/60 transition-all flex items-center gap-1.5 cursor-pointer shadow-glow-sm ml-1"
                title="Reset date filter"
              >
                <X size={13} /> Reset
              </button>
            )}
          </div>
        </div>

        {/* ── ROW 2: Quick Presets aligned at the END of the NEXT line ── */}
        <div className="flex flex-wrap items-center justify-between pt-3 border-t border-white/5 gap-3">
          <span className="text-[0.65rem] font-orbitron font-semibold text-text-muted uppercase tracking-wider">
            Quick Ranges:
          </span>

          <div className="flex flex-wrap items-center gap-1 bg-black/60 border border-white/10 p-1.5 rounded-xl text-[0.7rem] font-orbitron ml-auto">
            <button
              onClick={() => updateDateParam("", "")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activePreset === "all"
                  ? "bg-cyan/20 border border-cyan/40 text-cyan font-bold shadow-[0_0_10px_rgba(0,212,255,0.25)]"
                  : "text-steel hover:text-white hover:bg-white/5"
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => updateDateParam(todayStr, todayStr)}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activePreset === "today"
                  ? "bg-cyan/20 border border-cyan/40 text-cyan font-bold shadow-[0_0_10px_rgba(0,212,255,0.25)]"
                  : "text-steel hover:text-white hover:bg-white/5"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => updateDateParam(d7Str, todayStr)}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activePreset === "7days"
                  ? "bg-cyan/20 border border-cyan/40 text-cyan font-bold shadow-[0_0_10px_rgba(0,212,255,0.25)]"
                  : "text-steel hover:text-white hover:bg-white/5"
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => updateDateParam(d30Str, todayStr)}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activePreset === "30days"
                  ? "bg-cyan/20 border border-cyan/40 text-cyan font-bold shadow-[0_0_10px_rgba(0,212,255,0.25)]"
                  : "text-steel hover:text-white hover:bg-white/5"
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => updateDateParam(firstMonthStr, todayStr)}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activePreset === "thisMonth"
                  ? "bg-cyan/20 border border-cyan/40 text-cyan font-bold shadow-[0_0_10px_rgba(0,212,255,0.25)]"
                  : "text-steel hover:text-white hover:bg-white/5"
              }`}
            >
              This Month
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center rounded-2xl bg-[#060a14]/90 border border-white/10">
          <RefreshCw
            size={28}
            className="animate-spin text-cyan mx-auto mb-3"
          />
          <p className="text-sm font-orbitron text-steel">
            Loading Real Backend Operational Intelligence...
          </p>
        </div>
      ) : (
        <>
          {/* ── 1. TOP KPI CARDS WITH SPARKLINE TRENDS ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiCards.map((kpi, i) => (
              <div
                key={i}
                className="relative rounded-2xl bg-[#060a14]/90 backdrop-blur-2xl border border-[rgba(0,212,255,0.15)] p-5 overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:border-[rgba(0,212,255,0.35)] transition-all duration-300 group"
              >
                <div
                  className="h-[2px] absolute top-0 left-0 right-0"
                  style={{ background: kpi.accentColor }}
                />

                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-glass">
                    {getKpiIcon(kpi.key)}
                  </div>

                  {/* Delta Tag */}
                  <div
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.68rem] font-orbitron font-bold border ${
                      kpi.isUp
                        ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                        : "bg-copper/10 border-copper/25 text-copper"
                    }`}
                  >
                    {kpi.isUp ? (
                      <TrendingUp size={11} />
                    ) : (
                      <TrendingDown size={11} />
                    )}
                    {kpi.delta}
                  </div>
                </div>

                {/* Value & Label */}
                <div>
                  <p className="font-orbitron text-2xl md:text-3xl font-black text-text-primary tracking-tight">
                    {kpi.value}
                  </p>
                  <p className="text-xs font-semibold text-steel mt-1">
                    {kpi.label}
                  </p>
                </div>

                {/* Sparkline & Sublabel */}
                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-3">
                  <span className="text-[0.68rem] text-text-muted truncate">
                    {kpi.sublabel}
                  </span>
                  <Sparkline
                    data={kpi.sparkData}
                    color={kpi.accentColor}
                    height={28}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* ── 3. AI AGENTS PERFORMANCE MATRIX & DECISION DISTRIBUTION ── */}
          <div className="space-y-6">
            <AiAgentsPerformanceChart data={aiAgents} className="w-full" />
            <AiVerdictDistributionChart
              data={aiVerdictDistribution}
              className="w-full"
            />
          </div>

          {/* ── 4. DEFECT ANALYTICS SECTION ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Top Defect Types Chart */}
            <GlassPanel
              title="Top Defect Types (Today)"
              subtitle="Root-cause classification to identify faulty production line machinery"
              icon={AlertTriangle}
              badge={`${topDefectTypes.length} Categories`}
              className="lg:col-span-7"
            >
              {topDefectTypes.length === 0 ? (
                <div className="p-8 text-center text-xs font-orbitron text-steel">
                  No quality defects recorded yet. All inspected items meet
                  compliance standards.
                </div>
              ) : (
                <div className="space-y-5">
                  {topDefectTypes.map((defect, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-orbitron">
                        <span className="text-text-primary font-bold flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ background: defect.color }}
                          />
                          {defect.name}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-text-muted text-[0.7rem]">
                            Source: {defect.machine}
                          </span>
                          <span className="text-text-primary font-bold">
                            {defect.count} items ({defect.percentage}%)
                          </span>
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
              )}
            </GlassPanel>

            {/* Defects by Production Module */}
            <GlassPanel
              title="Defects by Production Module"
              subtitle="Module rejection frequency across active inspection runs"
              icon={Layers}
              className="lg:col-span-5"
            >
              {defectsByModule.length === 0 ? (
                <div className="p-8 text-center text-xs font-orbitron text-steel">
                  No production modules found or analyzed.
                </div>
              ) : (
                <div className="space-y-4">
                  {defectsByModule.map((mod, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-black/20 border border-white/5 space-y-2 hover:border-white/15 transition-all"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-text-primary truncate max-w-[200px]">
                          {mod.moduleName}
                        </span>
                        <span className="font-orbitron font-bold text-copper">
                          {mod.defects} Defects ({mod.rate})
                        </span>
                      </div>

                      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min(100, Math.max(5, (mod.defects / Math.max(1, mod.total)) * 100))}%`,
                            background: mod.barColor,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassPanel>
          </div>

          {/* ── 5. TIME-BASED TRENDS & SHIFT COMPARISON ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Acceptance vs. Rejection Timeline */}
            <GlassPanel
              title={fromDate || toDate ? "Hourly Throughput & Defect Spikes (24 Hours)" : "Hourly Throughput & Defect Spikes (Today: 07:00 - Current Hour)"}
              subtitle="Identify exact operational shifts or timestamps when quality degraded"
              icon={Activity}
              action={
                <div className="flex items-center gap-2 text-xs font-orbitron text-text-muted">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyan" /> Passed
                  </span>
                  <span className="inline-flex items-center gap-1 ml-2">
                    <span className="w-2 h-2 rounded-full bg-copper" /> Rejected
                  </span>
                </div>
              }
              className="lg:col-span-8"
            >
              <div className="overflow-x-auto pb-2 custom-scrollbar">
                <div className="h-56 flex items-end justify-between gap-6 pt-6 pb-2 px-4 border-b border-white/10 min-w-[950px]">
                  {hourlyTimeline.map((slot, i) => {
                    const maxVal = Math.max(
                      ...hourlyTimeline.map((s) => s.total || 0),
                      10,
                    );
                    const passHeight = ((slot.pass || 0) / maxVal) * 100;
                    const failHeight = ((slot.fail || 0) / maxVal) * 100;

                    return (
                      <div
                        key={i}
                        className="flex-1 min-w-[36px] flex flex-col items-center gap-2 h-full justify-end group relative"
                      >
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
                            className={`w-full rounded-t-md transition-all ${slot.hasSpike ? "bg-copper shadow-[0_0_12px_rgba(200,121,65,0.6)] animate-pulse" : "bg-copper/80"}`}
                            style={{ height: `${failHeight}%` }}
                          />
                          {/* Pass segment */}
                          <div
                            className="w-full rounded-b-md bg-cyan/70 group-hover:bg-cyan transition-all"
                            style={{ height: `${passHeight}%` }}
                          />
                        </div>

                        {/* Time label */}
                        <span
                          className={`text-[0.68rem] font-orbitron font-semibold whitespace-nowrap ${slot.hasSpike ? "text-copper font-bold" : "text-text-muted"}`}
                        >
                          {slot.time}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </GlassPanel>

            {/* Shift Comparison & Financial Wastage */}
            <GlassPanel
              title="Shift Performance Comparison"
              subtitle="Operational quality metrics comparing Morning vs Evening shifts"
              icon={Sun}
              className="lg:col-span-4"
            >
              <div className="space-y-4">
                {/* Morning Shift Card */}
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-orbitron font-bold text-emerald-400 flex items-center gap-1.5">
                      <Sun size={14} /> Morning Shift
                    </span>
                    <span className="text-xs font-orbitron font-extrabold text-emerald-400">
                      {shiftComparison.morning.passRate} Quality Rate
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-steel pt-1">
                    <div>
                      Inspected:{" "}
                      <strong className="text-text-primary">
                        {shiftComparison.morning.total}
                      </strong>
                    </div>
                    <div>
                      Defects:{" "}
                      <strong className="text-copper">
                        {shiftComparison.morning.defects}
                      </strong>
                    </div>
                    <div>
                      Wastage:{" "}
                      <strong className="text-amber-400">
                        {shiftComparison.morning.wastage}
                      </strong>
                    </div>
                    <div>
                      Speed:{" "}
                      <strong className="text-cyan">
                        {shiftComparison.morning.speed}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Evening Shift Card */}
                <div className="p-4 rounded-xl bg-copper/5 border border-copper/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-orbitron font-bold text-copper flex items-center gap-1.5">
                      <Moon size={14} /> Evening Shift
                    </span>
                    <span className="text-xs font-orbitron font-extrabold text-copper">
                      {shiftComparison.evening.passRate} Quality Rate
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-steel pt-1">
                    <div>
                      Inspected:{" "}
                      <strong className="text-text-primary">
                        {shiftComparison.evening.total}
                      </strong>
                    </div>
                    <div>
                      Defects:{" "}
                      <strong className="text-copper">
                        {shiftComparison.evening.defects}
                      </strong>
                    </div>
                    <div>
                      Wastage:{" "}
                      <strong className="text-amber-400">
                        {shiftComparison.evening.wastage}
                      </strong>
                    </div>
                    <div>
                      Speed:{" "}
                      <strong className="text-cyan">
                        {shiftComparison.evening.speed}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </GlassPanel>
          </div>

          {/* ── 6. LOWER SECTION: RECENT CYCLES TABLE ── */}
          <GlassPanel
            title="Recent Operational Cycles"
            subtitle="Live inspection runs executing across manufacturing modules"
            icon={LayoutGrid}
            action={
              <button
                onClick={() => navigate("/dashboard/cycles")}
                className="flex items-center gap-1 text-xs text-cyan hover:text-white transition-colors font-orbitron font-bold"
              >
                View All Cycles <ChevronRight size={13} />
              </button>
            }
          >
            <DataTable
              columns={CYCLE_COLS}
              rows={recentCycles}
              renderCell={renderCycleCell}
              total={recentCycles.length}
              page={1}
              perPage={recentCycles.length}
              hideFooter
              transparent
            />
          </GlassPanel>
        </>
      )}
    </div>
  );
}
