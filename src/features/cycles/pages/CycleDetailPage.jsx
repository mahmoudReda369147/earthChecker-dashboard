import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader2,
  AlertTriangle,
  ArrowLeft,
  Pencil,
  Pause,
  RotateCcw,
  XCircle,
  RefreshCw,
  AlertOctagon,
  GitBranch,
  User,
  Calendar,
  CalendarClock,
  Layers,
  FileText,
  CheckCircle2,
  Bot,
  Image as ImageIcon,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Sparkles,
  Check,
  ClipboardCheck,
  ExternalLink,
  ShieldCheck,
  Activity,
  Eye,
  Zap,
  Tag,
  Boxes,
  DollarSign,
  Hash,
} from "lucide-react";
import PageHeader from "../../../components/ui/PageHeader";
import Modal from "../../../components/ui/Modal";
import { useMe } from "../../auth/apiHooks";
import {
  useCycle,
  usePauseCycle,
  useResumeCycle,
  useCancelRequest,
  useCancelCycle,
  useRejectCancel,
} from "../apiHooks";
import { useCycleSubmissions } from "../../submissions/apiHooks";
import { useRateAnalysis, useUpdateAnalysisProblemType } from "../../analyses/apiHooks";

/* ── Status Configuration ───────────────────────────────────── */
const STATUS_CFG = {
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

/* ── Message Modal ─────────────────────────────────────────── */
function MessageModal({
  open,
  onClose,
  title,
  description,
  label,
  onConfirm,
  isPending,
  required = true,
}) {
  const [msg, setMsg] = useState("");
  const handleClose = () => {
    setMsg("");
    onClose();
  };
  const handleConfirm = () => {
    if (required && !msg.trim()) return;
    onConfirm(msg.trim());
    setMsg("");
  };
  return (
    <Modal open={open} onClose={handleClose} title={title} size="sm">
      <div className="space-y-4">
        <p className="text-[0.85rem] text-steel leading-[1.6]">{description}</p>
        <textarea
          rows={3}
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder={required ? "Required reason…" : "Optional note…"}
          className="input-glass w-full resize-none text-[0.82rem]"
        />
        <div className="flex gap-3">
          <button
            className="btn-ghost flex-1 justify-center"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isPending || (required && !msg.trim())}
            className="flex-1 flex items-center justify-center gap-2 py-[11px] px-6 rounded bg-[rgba(200,121,65,0.12)] border border-[rgba(200,121,65,0.4)] text-copper font-orbitron text-xs font-bold tracking-[0.08em] uppercase transition-all hover:bg-[rgba(200,121,65,0.2)] disabled:opacity-50"
          >
            {isPending && <Loader2 size={13} className="animate-spin" />}
            {label}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ── Confirm Modal ─────────────────────────────────────────── */
function ConfirmModal({
  open,
  onClose,
  title,
  description,
  label,
  onConfirm,
  isPending,
  danger = true,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <p className="text-[0.85rem] text-steel leading-[1.6]">{description}</p>
        <div className="flex gap-3">
          <button className="btn-ghost flex-1 justify-center" onClick={onClose}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className={`flex-1 flex items-center justify-center gap-2 py-[11px] px-6 rounded font-orbitron text-xs font-bold tracking-[0.08em] uppercase transition-all disabled:opacity-50 ${
              danger
                ? "bg-[rgba(200,121,65,0.12)] border border-[rgba(200,121,65,0.4)] text-copper hover:bg-[rgba(200,121,65,0.2)]"
                : "bg-[rgba(52,211,153,0.1)] border border-[rgba(52,211,153,0.35)] text-emerald-400 hover:bg-[rgba(52,211,153,0.18)]"
            }`}
          >
            {isPending && <Loader2 size={13} className="animate-spin" />}
            {label}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ── Answer Value Component ───────────────────────────────── */
function SubmissionAnswerValue({ answer }) {
  const { fieldType, value } = answer;
  if (value === undefined || value === null || value === "") {
    return (
      <span className="text-text-muted italic text-[0.78rem]">
        No response provided
      </span>
    );
  }

  if (fieldType === "image") {
    const urls = Array.isArray(value) ? value : [value];
    return (
      <div className="flex flex-wrap gap-2.5 mt-2">
        {urls.map((url, i) => (
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="relative group rounded-xl overflow-hidden border border-[rgba(0,212,255,0.25)] block bg-black/50 shadow-glass hover:shadow-[0_0_15px_rgba(0,212,255,0.3)] transition-all duration-300"
          >
            <img
              src={url}
              alt={`Proof ${i + 1}`}
              className="w-24 h-24 object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-1.5">
              <span className="text-[0.6rem] text-cyan font-orbitron flex items-center gap-1">
                <ExternalLink size={10} /> View
              </span>
            </div>
          </a>
        ))}
      </div>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1.5 mt-1.5">
        {value.map((item, i) => (
          <span
            key={i}
            className="px-3 py-1 rounded-lg bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)] text-cyan text-[0.78rem] font-medium shadow-glass"
          >
            {String(item)}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-1 px-3 py-2 rounded-lg bg-black/20 border border-[rgba(143,163,184,0.08)]">
      <p className="text-[0.84rem] text-text-primary leading-relaxed font-medium">
        {String(value)}
      </p>
    </div>
  );
}

/* ── AI Analysis Card Component ───────────────────────────── */
function AnalysisCard({ analysis, submissionId, moduleProblemTypes = [] }) {
  const { aiResult, agentId: agent, imageUrls, userRating } = analysis;
  const isPassed = aiResult?.result === "pass";
  const [activeImage, setActiveImage] = useState(0);
  const rateMutation = useRateAnalysis(submissionId);
  const updateProblemTypeMutation = useUpdateAnalysisProblemType(submissionId);

  const currentProblemType = analysis.problemType || aiResult?.problemType || "";

  return (
    <div
      className={`rounded-2xl border backdrop-blur-xl overflow-hidden transition-all duration-300 ${
        isPassed
          ? "bg-[rgba(6,12,24,0.7)] border-[rgba(16,185,129,0.2)] hover:border-[rgba(16,185,129,0.4)] shadow-[0_0_20px_rgba(16,185,129,0.05)]"
          : "bg-[rgba(6,12,24,0.7)] border-[rgba(200,121,65,0.2)] hover:border-[rgba(200,121,65,0.4)] shadow-[0_0_20px_rgba(200,121,65,0.05)]"
      }`}
    >
      {/* Top Banner */}
      <div
        className={`flex items-center justify-between px-5 py-4 border-b ${
          isPassed
            ? "border-[rgba(16,185,129,0.15)] bg-gradient-to-r from-[rgba(16,185,129,0.08)] to-transparent"
            : "border-[rgba(200,121,65,0.15)] bg-gradient-to-r from-[rgba(200,121,65,0.08)] to-transparent"
        }`}
      >
        <div className="flex items-center gap-3.5">
          {agent?.image ? (
            <img
              src={agent.image}
              alt=""
              className="w-10 h-10 rounded-xl object-cover border border-[rgba(0,212,255,0.3)] shadow-[0_0_10px_rgba(0,212,255,0.2)]"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.25)] flex items-center justify-center shadow-[0_0_10px_rgba(0,212,255,0.15)]">
              <Bot size={18} className="text-cyan animate-pulse" />
            </div>
          )}
          <div>
            <h4 className="text-[0.88rem] font-bold text-text-primary flex items-center gap-2 font-orbitron">
              {agent?.name ?? "AI Inspection Agent"}
            </h4>
            {agent?.userPrompt && (
              <p className="text-[0.7rem] text-text-muted line-clamp-1 max-w-[280px] mt-0.5">
                {agent.userPrompt}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[0.58rem] text-text-muted uppercase font-orbitron tracking-widest">
              Confidence
            </p>
            <p className="font-orbitron text-sm font-bold text-text-primary">
              {(aiResult?.confidence ?? 0).toFixed(1)}%
            </p>
          </div>

          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-orbitron font-bold uppercase tracking-wider ${
              isPassed
                ? "bg-[rgba(16,185,129,0.15)] text-emerald-400 border border-[rgba(16,185,129,0.35)] shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                : "bg-[rgba(200,121,65,0.15)] text-copper border border-[rgba(200,121,65,0.35)] shadow-[0_0_15px_rgba(200,121,65,0.25)]"
            }`}
          >
            {isPassed ? <ShieldCheck size={14} /> : <AlertTriangle size={14} />}
            {aiResult?.result ?? "N/A"}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5 space-y-4">
        {/* Module Problem Type Classification Banner */}
        {!isPassed && (
          <div className="p-3.5 rounded-xl bg-[rgba(200,121,65,0.1)] border border-[rgba(200,121,65,0.25)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Tag size={15} className="text-copper shrink-0" />
              <div>
                <p className="text-[0.62rem] font-orbitron font-bold text-copper uppercase tracking-wider">
                  Module Defect Classification
                </p>
                <p className="text-xs text-text-primary font-semibold">
                  {currentProblemType ? currentProblemType : "Unclassified Failure"}
                </p>
              </div>
            </div>

            {/* Select / Change Defect Type */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={currentProblemType}
                onChange={(e) =>
                  updateProblemTypeMutation.mutate({
                    analysisId: analysis._id,
                    problemType: e.target.value,
                  })
                }
                disabled={updateProblemTypeMutation.isPending}
                className="bg-black/80 border border-[rgba(200,121,65,0.4)] rounded-lg text-xs px-3 py-1.5 text-copper font-orbitron font-bold focus:outline-none focus:border-copper transition-all w-full sm:w-auto"
              >
                <option value="">-- Select Problem Type --</option>
                {moduleProblemTypes.map((type, idx) => (
                  <option key={idx} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        {/* Defect or Pass Reasoning Banner */}
        {aiResult?.reason && (
          <div
            className={`p-4 rounded-xl border relative overflow-hidden ${
              isPassed
                ? "bg-[rgba(16,185,129,0.04)] border-[rgba(16,185,129,0.15)]"
                : "bg-[rgba(200,121,65,0.06)] border-[rgba(200,121,65,0.18)]"
            }`}
          >
            <div className="flex items-start gap-2.5">
              <Zap
                size={15}
                className={`shrink-0 mt-0.5 ${isPassed ? "text-emerald-400" : "text-copper"}`}
              />
              <div>
                <p
                  className={`text-[0.68rem] font-bold uppercase tracking-wider font-orbitron mb-1 ${isPassed ? "text-emerald-400" : "text-copper"}`}
                >
                  {isPassed
                    ? "AI Inspection Rationale"
                    : "Detected Quality Defect"}
                </p>
                <p className="text-[0.82rem] text-text-primary leading-relaxed">
                  {aiResult.reason}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Image Viewer */}
        {imageUrls?.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[0.68rem] text-text-muted uppercase tracking-wider font-orbitron font-semibold">
                <ImageIcon size={12} className="text-cyan" />
                Analyzed Proof Images ({imageUrls.length})
              </span>
              <a
                href={imageUrls[activeImage]}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[0.68rem] text-cyan hover:underline flex items-center gap-1 font-orbitron"
              >
                Full Resolution <ExternalLink size={10} />
              </a>
            </div>

            <div className="flex gap-3">
              <div className="flex-1 min-w-0 rounded-xl overflow-hidden border border-[rgba(0,212,255,0.15)] aspect-video bg-black/60 relative group shadow-glass">
                <img
                  src={imageUrls[activeImage]}
                  alt={`Analysis proof ${activeImage + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[0.65rem] font-orbitron text-cyan">
                  Sample #{activeImage + 1}
                </div>
              </div>

              {imageUrls.length > 1 && (
                <div className="flex flex-col gap-2 w-16 shrink-0">
                  {imageUrls.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        i === activeImage
                          ? "border-cyan shadow-[0_0_12px_rgba(0,212,255,0.4)] scale-105"
                          : "border-[rgba(0,212,255,0.1)] opacity-50 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Confidence Meter & User Audit Feedback */}
        <div className="pt-3 flex items-center justify-between gap-4 border-t border-[rgba(143,163,184,0.08)]">
          <div className="flex-1">
            <div className="flex items-center justify-between text-[0.68rem] mb-1.5 font-orbitron">
              <span className="text-text-muted">AI Model Strictness</span>
              <span className="text-text-primary font-bold">
                {(aiResult?.confidence ?? 0).toFixed(1)}% Match
              </span>
            </div>
            <div className="h-2 rounded-full bg-[rgba(143,163,184,0.1)] overflow-hidden p-0.5 border border-[rgba(143,163,184,0.1)]">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isPassed
                    ? "bg-gradient-to-r from-emerald-500 to-teal-300"
                    : "bg-gradient-to-r from-copper to-amber-500"
                }`}
                style={{ width: `${aiResult?.confidence ?? 0}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[0.62rem] uppercase tracking-wider text-text-muted font-orbitron mr-1 hidden sm:inline">
              Audit Rating:
            </span>
            <button
              onClick={() =>
                rateMutation.mutate({
                  analysisId: analysis._id,
                  action: "like",
                })
              }
              disabled={rateMutation.isPending}
              title="Validate AI verdict"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                userRating === "like"
                  ? "bg-[rgba(16,185,129,0.2)] border-[rgba(16,185,129,0.4)] text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                  : "bg-white/[0.02] border-[rgba(143,163,184,0.12)] text-steel hover:bg-[rgba(16,185,129,0.1)] hover:border-[rgba(16,185,129,0.25)] hover:text-emerald-400"
              }`}
            >
              <ThumbsUp size={13} /> Correct
            </button>
            <button
              onClick={() =>
                rateMutation.mutate({
                  analysisId: analysis._id,
                  action: "dislike",
                })
              }
              disabled={rateMutation.isPending}
              title="Challenge AI verdict"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                userRating === "dislike"
                  ? "bg-[rgba(200,121,65,0.2)] border-[rgba(200,121,65,0.4)] text-copper shadow-[0_0_12px_rgba(200,121,65,0.3)]"
                  : "bg-white/[0.02] border-[rgba(143,163,184,0.12)] text-steel hover:bg-[rgba(200,121,65,0.1)] hover:border-[rgba(200,121,65,0.25)] hover:text-copper"
              }`}
            >
              <ThumbsDown size={13} /> Incorrect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   Cycle Detail Page Component
   ════════════════════════════════════════════════════════════ */
export default function CycleDetailPage() {
  const { cycleId } = useParams();
  const navigate = useNavigate();

  const { data: me } = useMe();
  const isCeo = me?.role === "ceo";
  const isSupervisor = me?.role === "supervisor";

  const { data: cycle, isLoading, isError } = useCycle(cycleId);
  const { data: submissionsData, isLoading: loadingSubmissions } =
    useCycleSubmissions(cycleId);

  const submissions = submissionsData?.submissions ?? [];
  const analyses = submissionsData?.analyses ?? [];

  const { mutateAsync: pauseCycle, isPending: pausing } = usePauseCycle();
  const { mutateAsync: resumeCycle, isPending: resuming } = useResumeCycle();
  const { mutateAsync: cancelReq, isPending: reqing } = useCancelRequest();
  const { mutateAsync: cancelCycle, isPending: cancelling } = useCancelCycle();
  const { mutateAsync: rejectCancel, isPending: rejecting } = useRejectCancel();

  const [pauseModal, setPauseModal] = useState(false);
  const [cancelReqModal, setCancelReqModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);

  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'answers' | 'ai'
  const [expandedSubmission, setExpandedSubmission] = useState(null);

  const doPause = async (msg) => {
    await pauseCycle({ id: cycleId, message: msg });
    setPauseModal(false);
  };
  const doCancelReq = async (msg) => {
    await cancelReq({ id: cycleId, message: msg });
    setCancelReqModal(false);
  };
  const doCancel = async () => {
    await cancelCycle(cycleId);
    setCancelModal(false);
  };
  const doReject = async () => {
    await rejectCancel(cycleId);
    setRejectModal(false);
  };
  const doResume = async () => {
    await resumeCycle(cycleId);
  };

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-cyan/20 border-t-cyan animate-spin" />
          <Bot
            size={20}
            className="text-cyan absolute inset-0 m-auto animate-pulse"
          />
        </div>
        <span className="font-orbitron text-xs tracking-widest text-text-muted uppercase">
          Loading Operational Cycle…
        </span>
      </div>
    );

  if (isError || !cycle)
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-3 text-copper bg-bg-glass backdrop-blur-xl rounded-2xl border border-[rgba(200,121,65,0.2)] p-8">
        <AlertTriangle size={36} />
        <p className="font-orbitron text-sm">Operational Cycle Not Found</p>
        <button
          onClick={() => navigate("/dashboard/cycles")}
          className="btn-ghost text-xs mt-2"
        >
          <ArrowLeft size={13} /> Return to Cycles List
        </button>
      </div>
    );

  const s = cycle.status;
  const st = STATUS_CFG[s] ?? STATUS_CFG.new;
  const isTerminal = s === "cancelled" || s === "completed";
  const pct = Math.min(100, Math.max(0, cycle.progress ?? 0));
  const barColor = pct === 100 ? "#a855f7" : pct > 50 ? "#22c55e" : "#00d4ff";

  /* Supervisor avatar parts */
  const sup = cycle.assignedSupervisor;
  const supParts = (sup?.name || "").trim().split(" ");
  const supInit = (
    (supParts[0]?.[0] ?? "") + (supParts[1]?.[0] ?? "")
  ).toUpperCase();

  /* AI Stats calculation */
  const totalPass = analyses.filter(
    (a) => a.aiResult?.result === "pass",
  ).length;
  const totalFail = analyses.filter(
    (a) => a.aiResult?.result === "fail",
  ).length;
  const passRate =
    analyses.length > 0 ? Math.round((totalPass / analyses.length) * 100) : 0;

  return (
    <div className="space-y-6 pb-24">
      {/* ── Page Header ────────────────────────────────────────── */}
      <PageHeader
        title={cycle.name}
        subtitle={`Operational Cycle ID: ${cycle.cycleId}`}
        badge="Cycle Inspection Detail"
        actions={
          <div className="flex items-center gap-2">
            <button
              className="btn-ghost text-[0.75rem] py-[9px] px-[16px]"
              onClick={() => navigate("/dashboard/cycles")}
            >
              <ArrowLeft size={13} /> Back
            </button>
            <button
              onClick={() => navigate(`/dashboard/cycles/${cycleId}/stages`)}
              className="btn-primary text-[0.75rem] py-[9px] px-[18px] flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,212,255,0.25)]"
            >
              <Layers size={14} /> Open Stages
            </button>
          </div>
        }
      />

      {/* ── Futuristic Hero & Status Banner ───────────────────── */}
      <div className="relative rounded-2xl bg-[#060a14]/90 backdrop-blur-2xl border border-[rgba(0,212,255,0.18)] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
        {/* Glow accent header line */}
        <div className="h-[2px] bg-gradient-to-r from-[#00d4ff] via-[#0088ff] to-[#a855f7]" />

        <div className="p-6 md:p-8 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-8">
          {/* Left Column: Status Pills, Title & Action Toolbar */}
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

              {/* Module Name Pill */}
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-orbitron text-text-muted bg-white/[0.04] border border-white/10">
                <GitBranch size={13} className="text-cyan shrink-0" />
                Module:{" "}
                <strong className="text-text-primary">
                  {cycle.moduleId?.title ??
                    cycle.moduleId?.name ??
                    "Standard QC"}
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

            {/* Quick action buttons row */}
            {!isTerminal && (
              <div className="pt-2 flex flex-wrap gap-2.5">
                {s === "paused" && (isCeo || isSupervisor) && (
                  <button
                    onClick={doResume}
                    disabled={resuming}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-orbitron font-semibold transition-all disabled:opacity-50 text-cyan border border-[rgba(0,212,255,0.3)] bg-[rgba(0,212,255,0.08)] hover:bg-[rgba(0,212,255,0.2)] shadow-[0_0_12px_rgba(0,212,255,0.2)]"
                  >
                    {resuming ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <RotateCcw size={13} />
                    )}{" "}
                    Resume Cycle
                  </button>
                )}

                {s === "inProgress" && (isCeo || isSupervisor) && (
                  <button
                    onClick={() => setPauseModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-orbitron font-semibold transition-all text-amber-400 border border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.08)] hover:bg-[rgba(251,191,36,0.2)] shadow-[0_0_12px_rgba(251,191,36,0.2)]"
                  >
                    <Pause size={13} /> Pause Cycle
                  </button>
                )}

                {(s === "inProgress" || s === "paused") && isSupervisor && (
                  <button
                    onClick={() => setCancelReqModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-orbitron font-semibold transition-all text-orange-400 border border-[rgba(249,115,22,0.3)] bg-[rgba(249,115,22,0.08)] hover:bg-[rgba(249,115,22,0.2)] shadow-[0_0_12px_rgba(249,115,22,0.2)]"
                  >
                    <AlertOctagon size={13} /> Request Cancellation
                  </button>
                )}

                {s === "cancelledRequest" && isCeo && (
                  <button
                    onClick={() => setRejectModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-orbitron font-semibold transition-all text-emerald-400 border border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.08)] hover:bg-[rgba(52,211,153,0.2)] shadow-[0_0_12px_rgba(52,211,153,0.2)]"
                  >
                    <RefreshCw size={13} /> Reject &amp; Resume
                  </button>
                )}

                {["new", "inProgress", "paused", "cancelledRequest"].includes(
                  s,
                ) &&
                  isCeo && (
                    <button
                      onClick={() => setCancelModal(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-orbitron font-semibold transition-all text-copper border border-[rgba(200,121,65,0.3)] bg-[rgba(200,121,65,0.08)] hover:bg-[rgba(200,121,65,0.2)] shadow-[0_0_12px_rgba(200,121,65,0.2)]"
                    >
                      <XCircle size={13} /> Cancel Cycle
                    </button>
                  )}

                {(isCeo || isSupervisor) && (
                  <button
                    onClick={() =>
                      navigate(`/dashboard/cycles/${cycleId}/edit`)
                    }
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-orbitron font-semibold transition-all text-steel border border-[rgba(143,163,184,0.2)] bg-white/[0.02] hover:bg-white/[0.08] hover:text-text-primary"
                  >
                    <Pencil size={13} /> Edit Config
                  </button>
                )}
              </div>
            )}
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
                  stroke={barColor}
                  strokeWidth="9"
                  strokeDasharray="364.42"
                  strokeDashoffset={364.42 - (364.42 * pct) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                  style={{
                    filter: `drop-shadow(0 0 8px ${barColor}60)`,
                  }}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span
                  className="font-orbitron text-2xl font-black tracking-wide"
                  style={{ color: barColor }}
                >
                  {pct}%
                </span>
                <span className="text-[0.58rem] font-bold uppercase tracking-[0.2em] text-text-muted font-orbitron mt-0.5">
                  PROGRESS
                </span>
              </div>
            </div>
            <p className="text-xs text-steel/80 mt-4 font-orbitron text-center font-medium">
              {pct === 100 ? "All Stages Completed" : "Stages in Progress"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Cyber KPI Cards Row ───────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-bg-glass backdrop-blur-xl border border-[rgba(0,212,255,0.12)] p-5 shadow-glass hover:shadow-[0_0_20px_rgba(0,212,255,0.15)] transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[0.68rem] text-text-muted uppercase font-orbitron font-semibold tracking-wider">
              Submissions
            </span>
            <div className="w-9 h-9 rounded-xl bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.25)] flex items-center justify-center text-cyan shadow-[0_0_10px_rgba(0,212,255,0.2)]">
              <ClipboardCheck size={18} />
            </div>
          </div>
          <p className="font-orbitron text-2xl font-black text-text-primary">
            {submissions.length}
          </p>
          <p className="text-[0.7rem] text-steel mt-1">Form stages filled</p>
        </div>

        <div className="rounded-2xl bg-bg-glass backdrop-blur-xl border border-[rgba(168,85,247,0.15)] p-5 shadow-glass hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[0.68rem] text-text-muted uppercase font-orbitron font-semibold tracking-wider">
              AI Inspections
            </span>
            <div className="w-9 h-9 rounded-xl bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.25)] flex items-center justify-center text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
              <Bot size={18} />
            </div>
          </div>
          <p className="font-orbitron text-2xl font-black text-text-primary">
            {analyses.length}
          </p>
          <p className="text-[0.7rem] text-steel mt-1">Gemini visual checks</p>
        </div>

        <div className="rounded-2xl bg-bg-glass backdrop-blur-xl border border-[rgba(16,185,129,0.15)] p-5 shadow-glass hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all duration-300 bg-[rgba(16,185,129,0.02)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[0.68rem] text-emerald-400 uppercase font-orbitron font-semibold tracking-wider">
              Pass Rate
            </span>
            <div className="w-9 h-9 rounded-xl bg-[rgba(16,185,129,0.12)] border border-[rgba(16,185,129,0.3)] flex items-center justify-center text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              <ShieldCheck size={18} />
            </div>
          </div>
          <p className="font-orbitron text-2xl font-black text-emerald-400">
            {passRate}%
          </p>
          <p className="text-[0.7rem] text-text-muted mt-1">
            {totalPass} passed quality checks
          </p>
        </div>

        <div className="rounded-2xl bg-bg-glass backdrop-blur-xl border border-[rgba(200,121,65,0.15)] p-5 shadow-glass hover:shadow-[0_0_20px_rgba(200,121,65,0.15)] transition-all duration-300 bg-[rgba(200,121,65,0.02)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[0.68rem] text-copper uppercase font-orbitron font-semibold tracking-wider">
              Quality Defects
            </span>
            <div className="w-9 h-9 rounded-xl bg-[rgba(200,121,65,0.12)] border border-[rgba(200,121,65,0.3)] flex items-center justify-center text-copper shadow-[0_0_10px_rgba(200,121,65,0.2)]">
              <XCircle size={18} />
            </div>
          </div>
          <p className="font-orbitron text-2xl font-black text-copper">
            {totalFail}
          </p>
          <p className="text-[0.7rem] text-text-muted mt-1">
            Inspection rejections
          </p>
        </div>
      </div>

      {/* ── High-Tech Navigation Tabs ───────────────────────────── */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/40 border border-[rgba(0,212,255,0.12)] backdrop-blur-xl">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-orbitron text-xs font-bold transition-all duration-200 ${
            activeTab === "overview"
              ? "bg-[rgba(0,212,255,0.12)] border border-[rgba(0,212,255,0.3)] text-cyan shadow-[0_0_15px_rgba(0,212,255,0.2)]"
              : "text-steel hover:text-text-primary hover:bg-white/[0.03]"
          }`}
        >
          <Activity size={14} /> Overview &amp; Assigned Supervisor
        </button>

        <button
          onClick={() => setActiveTab("answers")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-orbitron text-xs font-bold transition-all duration-200 ${
            activeTab === "answers"
              ? "bg-[rgba(0,212,255,0.12)] border border-[rgba(0,212,255,0.3)] text-cyan shadow-[0_0_15px_rgba(0,212,255,0.2)]"
              : "text-steel hover:text-text-primary hover:bg-white/[0.03]"
          }`}
        >
          <FileText size={14} /> Form Answers ({submissions.length})
        </button>

        <button
          onClick={() => setActiveTab("ai")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-orbitron text-xs font-bold transition-all duration-200 ${
            activeTab === "ai"
              ? "bg-[rgba(168,85,247,0.15)] border border-[rgba(168,85,247,0.35)] text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
              : "text-steel hover:text-text-primary hover:bg-white/[0.03]"
          }`}
        >
          <Sparkles size={14} /> AI Vision Analytics ({analyses.length})
        </button>
      </div>

      {/* ── TAB CONTENT 1: OVERVIEW ────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-5 animate-fade-in">
          {/* Metadata Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Module Info Card */}
            <div className="p-5 rounded-2xl bg-bg-glass border border-[rgba(0,212,255,0.12)] space-y-3">
              <div className="flex items-center gap-2.5 text-cyan">
                <GitBranch size={16} />
                <span className="text-xs uppercase font-orbitron font-bold tracking-wider">
                  Module Category
                </span>
              </div>
              <div>
                <h4 className="text-base font-bold text-text-primary">
                  {cycle.moduleId?.title ?? cycle.moduleId?.name ?? "—"}
                </h4>
                <p className="text-xs text-text-muted mt-0.5">
                  Quality inspection template standard
                </p>
              </div>
            </div>

            {/* Batch & Cost Metrics Card */}
            <div className="p-5 rounded-2xl bg-bg-glass border border-[rgba(0,212,255,0.12)] space-y-3">
              <div className="flex items-center gap-2.5 text-cyan">
                <Boxes size={16} />
                <span className="text-xs uppercase font-orbitron font-bold tracking-wider">
                  Batch &amp; Cost Parameters
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-steel flex justify-between">
                  <span>Total Batch:</span>
                  <strong className="text-text-primary font-orbitron">
                    {cycle.totalBatchSize ?? 0}
                  </strong>
                </p>
                <p className="text-steel flex justify-between">
                  <span>Sample Size:</span>
                  <strong className="text-cyan font-orbitron">
                    {cycle.sampleSize ?? 0}
                  </strong>
                </p>
                <p className="text-steel flex justify-between">
                  <span>Unit Cost:</span>
                  <strong className="text-emerald-400 font-orbitron">
                    ${cycle.unitCost ?? 0}
                  </strong>
                </p>
              </div>
            </div>

            {/* Assigned Supervisor Card */}
            <div className="p-5 rounded-2xl bg-bg-glass border border-[rgba(200,121,65,0.15)] space-y-3">
              <div className="flex items-center gap-2.5 text-copper">
                <User size={16} />
                <span className="text-xs uppercase font-orbitron font-bold tracking-wider">
                  Assigned Supervisor
                </span>
              </div>
              {sup ? (
                <div className="flex items-center gap-3">
                  {sup.image ? (
                    <img
                      src={sup.image}
                      alt={sup.name}
                      className="w-10 h-10 rounded-full object-cover border border-[rgba(200,121,65,0.4)] shadow-[0_0_10px_rgba(200,121,65,0.2)]"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[rgba(200,121,65,0.12)] border border-[rgba(200,121,65,0.3)] text-copper font-orbitron text-xs font-bold flex items-center justify-center">
                      {supInit}
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-text-primary leading-none">
                      {sup.name}
                    </h4>
                    <p className="text-xs text-text-muted mt-1">{sup.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-text-muted italic">
                  No supervisor assigned
                </p>
              )}
            </div>

            {/* Timestamps Card */}
            <div className="p-5 rounded-2xl bg-bg-glass border border-[rgba(143,163,184,0.12)] space-y-3">
              <div className="flex items-center gap-2.5 text-steel">
                <Calendar size={16} />
                <span className="text-xs uppercase font-orbitron font-bold tracking-wider">
                  Cycle Schedule
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-steel">
                  Created:{" "}
                  <strong className="text-text-primary">
                    {new Date(cycle.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </strong>
                </p>
                {cycle.updatedAt && (
                  <p className="text-steel">
                    Updated:{" "}
                    <strong className="text-text-primary">
                      {new Date(cycle.updatedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </strong>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Reason notes if paused or cancel requested */}
          {s === "paused" && cycle.pauseMessage && (
            <div className="p-5 rounded-2xl bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.25)] space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-orbitron text-xs font-bold uppercase tracking-wider">
                <Pause size={14} /> Cycle Pause Note
              </div>
              <p className="text-sm text-text-primary italic">
                "{cycle.pauseMessage}"
              </p>
            </div>
          )}

          {s === "cancelledRequest" && cycle.cancelRequestMessage && (
            <div className="p-5 rounded-2xl bg-[rgba(249,115,22,0.06)] border border-[rgba(249,115,22,0.25)] space-y-2">
              <div className="flex items-center gap-2 text-orange-400 font-orbitron text-xs font-bold uppercase tracking-wider">
                <AlertOctagon size={14} /> Cancellation Request Reason
              </div>
              <p className="text-sm text-text-primary italic">
                "{cycle.cancelRequestMessage}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB CONTENT 2: FORM ANSWERS ────────────────────────── */}
      {activeTab === "answers" && (
        <div className="rounded-2xl bg-bg-glass backdrop-blur-xl border border-[rgba(0,212,255,0.12)] overflow-hidden shadow-glass animate-fade-in">
          <div className="p-5 border-b border-[rgba(0,212,255,0.08)] flex items-center justify-between">
            <div>
              <h3 className="font-orbitron text-base font-bold text-text-primary flex items-center gap-2">
                <FileText size={16} className="text-cyan" />
                Submitted Stage Form Answers
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Click any stage submission to inspect detailed question &amp;
                answer values
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[rgba(0,212,255,0.1)] text-cyan border border-[rgba(0,212,255,0.2)] font-orbitron text-xs font-bold">
              {submissions.length} Records
            </span>
          </div>

          {loadingSubmissions ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-cyan" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="p-12 text-center">
              <FileText
                size={40}
                className="text-steel mx-auto mb-3 opacity-30"
              />
              <p className="text-steel text-sm font-medium">
                No stage forms submitted for this cycle yet.
              </p>
              <p className="text-text-muted text-xs mt-1">
                Submitted forms will automatically register here as field
                workers complete stages.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[rgba(143,163,184,0.08)]">
              {submissions.map((sub, idx) => {
                const isExpanded = expandedSubmission === sub._id;
                const answersCount = sub.answers?.length ?? 0;

                return (
                  <div
                    key={sub._id}
                    className="transition-colors hover:bg-white/[0.01]"
                  >
                    <div
                      onClick={() =>
                        setExpandedSubmission(isExpanded ? null : sub._id)
                      }
                      className="p-5 flex items-center justify-between cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-xl bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)] font-orbitron text-xs font-bold text-cyan flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
                            {sub.formId?.name ?? "Form Stage"}
                            <span className="text-[0.68rem] font-normal text-text-muted bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
                              {answersCount}{" "}
                              {answersCount === 1 ? "answer" : "answers"}
                            </span>
                            {sub.scrap > 0 && (
                              <span className="text-[0.68rem] font-bold text-copper bg-[rgba(200,121,65,0.12)] px-2.5 py-0.5 rounded-full border border-[rgba(200,121,65,0.25)] font-mono">
                                Scrap: {sub.scrap} pcs ({sub.scrapCost ? `${sub.scrapCost.toLocaleString()} EGP` : '0 EGP'})
                              </span>
                            )}
                          </h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                            {sub.submittedBy && (
                              <span className="flex items-center gap-1.5 text-steel font-medium">
                                <User size={11} className="text-cyan" />
                                {sub.submittedBy.name}
                              </span>
                            )}
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar size={11} />
                              {new Date(sub.createdAt).toLocaleString("en-GB", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5 text-cyan">
                        {isExpanded ? "Hide Details" : "View Answers"}
                        {isExpanded ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="px-5 pb-5 pt-3 bg-black/40 border-t border-[rgba(0,212,255,0.06)] space-y-3">
                        <p className="text-[0.68rem] uppercase font-orbitron font-bold tracking-widest text-text-muted mb-2">
                          Submitted Answers Payload
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {sub.answers?.map((ans, aIdx) => (
                            <div
                              key={aIdx}
                              className="p-4 rounded-xl bg-bg-glass border border-[rgba(0,212,255,0.1)] flex flex-col justify-between shadow-glass"
                            >
                              <div>
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <span className="text-xs font-bold text-steel">
                                    {ans.fieldLabel || `Question #${aIdx + 1}`}
                                  </span>
                                  <span className="text-[0.6rem] font-orbitron font-bold uppercase tracking-wider text-cyan bg-[rgba(0,212,255,0.08)] px-2 py-0.5 rounded border border-[rgba(0,212,255,0.15)]">
                                    {ans.fieldType || "text"}
                                  </span>
                                </div>
                                <SubmissionAnswerValue answer={ans} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB CONTENT 3: AI VISION ANALYTICS ──────────────────── */}
      {activeTab === "ai" && (
        <div className="rounded-2xl bg-bg-glass backdrop-blur-xl border border-[rgba(168,85,247,0.15)] overflow-hidden shadow-glass animate-fade-in">
          <div className="p-5 border-b border-[rgba(168,85,247,0.12)] flex items-center justify-between">
            <div>
              <h3 className="font-orbitron text-base font-bold text-text-primary flex items-center gap-2">
                <Sparkles size={16} className="text-purple-400" />
                Gemini AI Vision Inspection Results
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Automated image evaluation verdicts, confidence ratings, and
                defect explanations
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[rgba(168,85,247,0.1)] text-purple-300 border border-[rgba(168,85,247,0.25)] font-orbitron text-xs font-bold">
              {analyses.length} Evaluations
            </span>
          </div>

          <div className="p-5">
            {analyses.length === 0 ? (
              <div className="p-12 text-center">
                <Bot size={40} className="text-purple-400/40 mx-auto mb-3" />
                <p className="text-steel text-sm font-medium">
                  No AI vision evaluations created for this cycle.
                </p>
                <p className="text-text-muted text-xs mt-1">
                  AI analyses are performed automatically when image fields
                  assigned to AI Agents are submitted by inspectors.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {analyses.map((analysis) => (
                  <AnalysisCard
                    key={analysis._id}
                    analysis={analysis}
                    submissionId={analysis.submissionId}
                    moduleProblemTypes={cycle?.moduleId?.problemTypes ?? []}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modals ────────────────────────────────────────────── */}
      <MessageModal
        open={pauseModal}
        onClose={() => setPauseModal(false)}
        title="Pause Operational Cycle"
        description={`Pause "${cycle.name}"?${isSupervisor ? " A reason is required." : " Add an optional note."}`}
        label="Pause Cycle"
        required={isSupervisor}
        onConfirm={doPause}
        isPending={pausing}
      />
      <MessageModal
        open={cancelReqModal}
        onClose={() => setCancelReqModal(false)}
        title="Request Cancellation"
        description={`Request cancellation for "${cycle.name}". Provide a reason for executive review.`}
        label="Send Request"
        required
        onConfirm={doCancelReq}
        isPending={reqing}
      />
      <ConfirmModal
        open={cancelModal}
        onClose={() => setCancelModal(false)}
        title="Cancel Operational Cycle"
        description={`Cancel "${cycle.name}"? This action is permanent and cannot be undone.`}
        label="Confirm Cancel"
        onConfirm={doCancel}
        isPending={cancelling}
      />
      <ConfirmModal
        open={rejectModal}
        onClose={() => setRejectModal(false)}
        title="Reject Cancel Request"
        description={`Reject cancellation request for "${cycle.name}" and resume operations?`}
        label="Reject & Resume"
        danger={false}
        onConfirm={doReject}
        isPending={rejecting}
      />
    </div>
  );
}
