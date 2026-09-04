import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader2,
  AlertTriangle,
  ArrowLeft,
  Lock,
  CheckCircle2,
  ChevronRight,
  FileText,
  User,
  Clock,
  Sparkles,
  Layers,
  ShieldCheck,
  Activity,
  Eye,
  Play,
  AlertOctagon,
  Check,
  HelpCircle,
  GitBranch,
} from "lucide-react";
import PageHeader from "../../../components/ui/PageHeader";
import { useMe } from "../../auth/apiHooks";
import { useCycle } from "../apiHooks";
import { useCycleStages } from "../../stages/apiHooks";

/* ── Status Configuration ───────────────────────────────────── */
const CYCLE_STATUS = {
  new: {
    label: "New",
    color: "#00d4ff",
    bg: "rgba(0,212,255,0.1)",
    border: "rgba(0,212,255,0.3)",
    glow: "rgba(0,212,255,0.2)",
  },
  inProgress: {
    label: "In Progress",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.3)",
    glow: "rgba(34,197,94,0.2)",
  },
  paused: {
    label: "Paused",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.3)",
    glow: "rgba(245,158,11,0.2)",
  },
  cancelledRequest: {
    label: "Cancel Requested",
    color: "#f97316",
    bg: "rgba(249,115,22,0.1)",
    border: "rgba(249,115,22,0.3)",
    glow: "rgba(249,115,22,0.2)",
  },
  cancelled: {
    label: "Cancelled",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.3)",
    glow: "rgba(239,68,68,0.2)",
  },
  completed: {
    label: "Completed",
    color: "#a855f7",
    bg: "rgba(168,85,247,0.1)",
    border: "rgba(168,85,247,0.3)",
    glow: "rgba(168,85,247,0.2)",
  },
};

/* ── Individual Stage Card Component ────────────────────────── */
function StageCard({ index, stage, onSubmit, canSubmit }) {
  const form = stage.formId;
  const isSubmitted = stage.status === "submitted";
  const isAvailable = stage.status === "available" && canSubmit;
  const isLocked =
    stage.status === "locked" || (stage.status === "available" && !canSubmit);

  const sections = form?.sections ?? [];
  const fieldCount = sections.filter((s) => s.type !== "note").length;
  const hasAiAgent = sections.some((s) => s.type === "image" && s.agentId);

  const accent = isSubmitted ? "#22c55e" : isAvailable ? "#00d4ff" : "#4a5568";

  return (
    <div
      onClick={isAvailable ? onSubmit : undefined}
      className={`group relative rounded-2xl border backdrop-blur-xl transition-all duration-300 overflow-hidden flex flex-col ${
        isSubmitted
          ? "bg-[rgba(6,16,12,0.6)] border-[rgba(34,197,94,0.2)] hover:border-[rgba(34,197,94,0.4)] shadow-[0_0_20px_rgba(34,197,94,0.05)]"
          : isAvailable
            ? "bg-[rgba(6,12,24,0.7)] border-[rgba(0,212,255,0.25)] hover:border-[rgba(0,212,255,0.5)] shadow-[0_0_25px_rgba(0,212,255,0.08)] hover:shadow-[0_8px_35px_rgba(0,212,255,0.18)] cursor-pointer hover:-translate-y-1"
            : "bg-[rgba(10,14,24,0.5)] border-[rgba(143,163,184,0.1)] opacity-75"
      }`}
    >
      {/* Glow Header Accent Bar */}
      <div
        className="h-[3px] w-full transition-all duration-300"
        style={{
          background: isSubmitted
            ? "linear-gradient(90deg, #22c55e, #10b981)"
            : isAvailable
              ? "linear-gradient(90deg, #00d4ff, #008cc8)"
              : "rgba(143,163,184,0.15)",
        }}
      />

      {/* Stage Card Header */}
      <div className="p-5 pb-4 flex items-start justify-between gap-3 border-b border-white/[0.05]">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-orbitron text-xs font-black shrink-0 transition-transform group-hover:scale-105"
            style={{
              background: `${accent}18`,
              border: `1px solid ${accent}35`,
              color: accent,
              boxShadow: isAvailable ? `0 0 12px ${accent}25` : "none",
            }}
          >
            #{index + 1}
          </div>

          <div>
            <h3
              className={`font-orbitron text-sm font-bold leading-tight ${isLocked ? "text-steel/70" : "text-text-primary"}`}
            >
              {form?.name ?? `Stage #${index + 1}`}
            </h3>
            <p className="text-[0.68rem] text-text-muted mt-0.5 font-orbitron">
              Stage Order: Sequence {index + 1}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.62rem] font-orbitron font-bold uppercase tracking-wider shrink-0 border"
          style={{
            background: `${accent}15`,
            borderColor: `${accent}30`,
            color: accent,
            boxShadow: isAvailable ? `0 0 10px ${accent}20` : "none",
          }}
        >
          {isSubmitted ? (
            <>
              <CheckCircle2 size={11} /> Completed
            </>
          ) : isAvailable ? (
            <>
              <span
                className="w-1.5 h-1.5 rounded-full animate-ping"
                style={{ background: accent }}
              />{" "}
              Ready
            </>
          ) : (
            <>
              <Lock size={11} /> Locked
            </>
          )}
        </span>
      </div>

      {/* Stage Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Description */}
        <p
          className={`text-xs leading-relaxed line-clamp-2 ${isLocked ? "text-text-muted/60" : "text-steel"}`}
        >
          {form?.description ||
            "Execute form stage answers and image inspections."}
        </p>

        {/* Form Features Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/10 text-[0.68rem] text-steel font-medium">
            <FileText size={11} className="text-cyan" />
            {fieldCount} {fieldCount === 1 ? "Question" : "Questions"}
          </span>

          {hasAiAgent && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.25)] text-[0.68rem] text-purple-300 font-medium">
              <Sparkles size={11} className="text-purple-400" />
              AI Agent Vision
            </span>
          )}
        </div>

        {/* Footer Meta / Action CTA */}
        <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between gap-3 text-xs">
          {isSubmitted ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-[0.7rem] text-emerald-400/80 font-medium flex items-center gap-1.5">
                <User size={12} /> {stage.submittedBy?.name ?? "Inspector"}
              </span>
              {stage.submittedAt && (
                <span className="text-[0.68rem] text-text-muted flex items-center gap-1">
                  <Clock size={11} />
                  {new Date(stage.submittedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              )}
            </div>
          ) : isAvailable ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-[0.7rem] text-cyan font-orbitron font-semibold">
                Form Unlocked &amp; Ready
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[rgba(0,212,255,0.12)] border border-[rgba(0,212,255,0.3)] text-cyan text-xs font-orbitron font-bold group-hover:bg-[rgba(0,212,255,0.25)] transition-all">
                Fill Form{" "}
                <ChevronRight
                  size={13}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-text-muted/70 text-[0.7rem]">
              <Lock size={12} className="text-text-muted/50" />
              <span>Complete Stage #{index} to unlock</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   Cycle Stages Page Component
   ════════════════════════════════════════════════════════════ */
export default function CycleStagesPage() {
  const { cycleId } = useParams();
  const navigate = useNavigate();
  const { data: me } = useMe();

  const { data: cycle, isLoading: loadingCycle } = useCycle(cycleId);
  const { data: stages, isLoading: loadingStages } = useCycleStages(cycleId);

  const [filter, setFilter] = useState("all"); // 'all' | 'ready' | 'completed' | 'locked'

  const isLoading = loadingCycle || loadingStages;

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-cyan/20 border-t-cyan animate-spin" />
        <span className="font-orbitron text-xs tracking-widest text-text-muted uppercase">
          Loading Stage Pipeline…
        </span>
      </div>
    );

  if (!cycle)
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-3 text-copper bg-bg-glass rounded-2xl border border-[rgba(200,121,65,0.2)] p-8">
        <AlertTriangle size={36} />
        <p className="font-orbitron text-sm">Cycle Pipeline Not Found</p>
        <button
          onClick={() => navigate("/dashboard/cycles")}
          className="btn-ghost text-xs mt-2"
        >
          <ArrowLeft size={13} /> Return to Cycles
        </button>
      </div>
    );

  /* Role access check */
  const uid = me?._id;
  const isCeo = me?.role === "ceo";
  const supId = cycle.assignedSupervisor?._id ?? cycle.assignedSupervisor;
  const workerId = cycle.assignedWorker?._id ?? cycle.assignedWorker;
  const hasAccess = isCeo || supId === uid || workerId === uid;

  if (!hasAccess)
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-3 text-copper bg-bg-glass rounded-2xl border border-[rgba(200,121,65,0.2)] p-8">
        <Lock size={36} />
        <p className="font-orbitron text-sm">
          Access Restricted to Assigned Team Members
        </p>
        <button
          onClick={() => navigate("/dashboard/cycles")}
          className="btn-ghost text-xs mt-2"
        >
          <ArrowLeft size={13} /> Return to Dashboard
        </button>
      </div>
    );

  const st = CYCLE_STATUS[cycle.status] ?? CYCLE_STATUS.new;
  const pct = Math.min(100, Math.max(0, cycle.progress ?? 0));
  const canSubmit = ["new", "inProgress"].includes(cycle.status);
  const totalStages = stages?.length ?? 0;
  const doneStages = (stages ?? []).filter(
    (s) => s.status === "submitted",
  ).length;

  /* Filter stages */
  const filteredStages = (stages ?? []).filter((s) => {
    if (filter === "ready") return s.status === "available" && canSubmit;
    if (filter === "completed") return s.status === "submitted";
    if (filter === "locked")
      return s.status === "locked" || (s.status === "available" && !canSubmit);
    return true;
  });

  return (
    <div className="space-y-6 pb-24">
      {/* Page Header */}
      <PageHeader
        title="Cycle Stage Pipeline"
        subtitle={`Execution Pipeline for ${cycle.name}`}
        badge="Stage Workflow"
        actions={
          <button
            className="btn-ghost text-[0.75rem] py-[9px] px-[16px] flex items-center gap-1.5"
            onClick={() => navigate(`/dashboard/cycles/${cycleId}`)}
          >
            <ArrowLeft size={13} /> Back to Cycle Detail
          </button>
        }
      />

      {/* Cyber Hero Summary Header */}
      <div className="relative rounded-2xl bg-[#060a14]/90 backdrop-blur-2xl border border-[rgba(0,212,255,0.18)] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
        {/* Glow accent header line */}
        <div className="h-[2px] bg-gradient-to-r from-[#00d4ff] via-[#0088ff] to-[#a855f7]" />

        <div className="p-6 md:p-8 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-8">
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Status Pill */}
              <span
                className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full text-xs font-orbitron font-bold uppercase tracking-widest border"
                style={{
                  color: st.color,
                  borderColor: st.border,
                  background: st.bg,
                  boxShadow: `0 0 16px ${st.glow}`,
                }}
              >
                {st.label}
              </span>

              {/* Compliance Status Pill */}
              {cycle.complianceStatus === "accepted" ? (
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-orbitron font-bold uppercase tracking-wider text-[#10b981] bg-[rgba(16,185,129,0.12)] border border-[rgba(16,185,129,0.3)] shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 size={13} /> Accepted
                </span>
              ) : cycle.complianceStatus === "rejected" ? (
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-orbitron font-bold uppercase tracking-wider text-[#ef4444] bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.3)] shadow-[0_0_12px_rgba(239,68,68,0.2)]">
                  <AlertOctagon size={13} /> Rejected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-orbitron font-bold uppercase tracking-wider text-text-muted bg-white/[0.04] border border-white/10">
                  <Clock size={13} /> Pending
                </span>
              )}

              {/* Module Name Pill */}
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-orbitron text-text-muted bg-white/[0.04] border border-white/10">
                <GitBranch size={13} className="text-cyan shrink-0" />
                Module:{" "}
                <strong className="text-text-primary">
                  {cycle.moduleId?.title ??
                    cycle.moduleId?.name ??
                    "Standard Module"}
                </strong>
              </span>
            </div>

            <div>
              <h2 className="font-orbitron text-2xl md:text-3xl font-black text-text-primary tracking-wide">
                {cycle.name}
              </h2>
              <p className="text-steel text-xs md:text-sm mt-1.5 leading-relaxed max-w-xl">
                Automated quality inspection run executing across form stages.
              </p>
            </div>
          </div>

          {/* Right Column: Dark Inner Card with Circular Progress Meter */}
          <div className="w-full lg:w-auto min-w-[280px] p-6 rounded-2xl bg-[#030611]/80 border border-white/[0.06] flex flex-col items-center justify-center shrink-0 shadow-inner">
            <div className="relative flex items-center justify-center">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="9"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  stroke={pct === 100 ? "#a855f7" : "#00d4ff"}
                  strokeWidth="9"
                  strokeDasharray="364.42"
                  strokeDashoffset={364.42 - (364.42 * pct) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                  style={{
                    filter: `drop-shadow(0 0 8px ${pct === 100 ? "#a855f760" : "#00d4ff60"})`,
                  }}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span
                  className="font-orbitron text-2xl font-black tracking-wide"
                  style={{ color: pct === 100 ? "#a855f7" : "#00d4ff" }}
                >
                  {pct}%
                </span>
                <span className="text-[0.58rem] font-bold uppercase tracking-[0.2em] text-text-muted font-orbitron mt-0.5">
                  PROGRESS
                </span>
              </div>
            </div>
            <p className="text-xs text-steel/80 mt-4 font-orbitron text-center font-medium">
              {pct === 100
                ? "All Stages Completed"
                : `${doneStages} of ${totalStages} Stages Completed`}
            </p>
          </div>
        </div>
      </div>

      {/* Paused or Completed Warning Banner */}
      {!canSubmit && !["cancelled", "completed"].includes(cycle.status) && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.25)] text-amber-400 text-xs font-medium">
          <AlertTriangle size={18} className="shrink-0" />
          <div>
            <p className="font-orbitron font-bold uppercase tracking-wider text-[0.7rem]">
              Cycle Currently Paused
            </p>
            <p className="text-amber-300/80 mt-0.5">
              Stage form submissions are temporarily disabled until a supervisor
              or executive resumes the cycle.
            </p>
          </div>
        </div>
      )}

      {cycle.status === "completed" && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-[rgba(168,85,247,0.08)] border border-[rgba(168,85,247,0.25)] text-purple-300 text-xs font-medium">
          <CheckCircle2 size={18} className="shrink-0 text-purple-400" />
          <div>
            <p className="font-orbitron font-bold uppercase tracking-wider text-[0.7rem]">
              All Pipeline Stages Finished
            </p>
            <p className="text-purple-300/80 mt-0.5">
              Every stage form in this cycle has been completed and archived.
            </p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-black/40 border border-[rgba(0,212,255,0.12)]">
          <button
            onClick={() => setFilter("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-orbitron font-bold transition-all ${
              filter === "all"
                ? "bg-[rgba(0,212,255,0.15)] text-cyan border border-[rgba(0,212,255,0.3)]"
                : "text-steel hover:text-text-primary"
            }`}
          >
            All Stages ({stages?.length ?? 0})
          </button>
          <button
            onClick={() => setFilter("ready")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-orbitron font-bold transition-all ${
              filter === "ready"
                ? "bg-[rgba(0,212,255,0.15)] text-cyan border border-[rgba(0,212,255,0.3)]"
                : "text-steel hover:text-text-primary"
            }`}
          >
            Ready to Fill
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-orbitron font-bold transition-all ${
              filter === "completed"
                ? "bg-[rgba(16,185,129,0.15)] text-emerald-400 border border-[rgba(16,185,129,0.3)]"
                : "text-steel hover:text-text-primary"
            }`}
          >
            Completed ({doneStages})
          </button>
          <button
            onClick={() => setFilter("locked")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-orbitron font-bold transition-all ${
              filter === "locked"
                ? "bg-white/10 text-steel border border-white/15"
                : "text-steel hover:text-text-primary"
            }`}
          >
            Locked
          </button>
        </div>
      </div>

      {/* Stages Grid */}
      {filteredStages.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl bg-bg-glass border border-[rgba(0,212,255,0.08)] text-center">
          <FileText size={36} className="text-steel/40 mb-3" />
          <p className="text-steel text-sm font-medium">
            No stages match the selected filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStages.map((stage, index) => (
            <StageCard
              key={stage._id}
              index={index}
              stage={stage}
              canSubmit={canSubmit}
              onSubmit={() => navigate(`/stage-submit/${stage._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
