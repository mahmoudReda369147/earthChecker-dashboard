import { useState } from "react";
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  GitBranch,
  Filter,
  Pin,
  PinOff,
  X,
  Activity,
  Calendar,
} from "lucide-react";
import Dropdown from "../../../components/ui/Dropdown";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "new", label: "New" },
  { value: "inProgress", label: "In Progress" },
  { value: "paused", label: "Paused" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
];

const COMPLIANCE_OPTIONS = [
  { value: "", label: "All Compliance" },
  {
    value: "accepted",
    label: "Accepted",
    icon: <CheckCircle2 size={13} className="text-emerald-400" />,
  },
  {
    value: "rejected",
    label: "Rejected",
    icon: <XCircle size={13} className="text-red-400" />,
  },
  {
    value: "pending",
    label: "Pending",
    icon: <Clock size={13} className="text-text-muted" />,
  },
];

export default function CycleFilters({
  search,
  onSearchChange,
  moduleId,
  onModuleChange,
  status,
  onStatusChange,
  complianceStatus,
  onComplianceStatusChange,
  fromDate = "",
  toDate = "",
  onDateRangeChange,
  moduleOptions = [],
  hasActiveFilters = false,
  onClearAll,
  totalRecords = 0,
  showingRecords = 0,
}) {
  const [isSticky, setIsSticky] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);

  const formatDateStr = (d) => d.toISOString().split("T")[0];

  const handlePreset = (preset) => {
    if (!onDateRangeChange) return;
    const today = new Date();
    const todayStr = formatDateStr(today);

    if (preset === "today") {
      onDateRangeChange(todayStr, todayStr);
    } else if (preset === "7days") {
      const d7 = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
      onDateRangeChange(formatDateStr(d7), todayStr);
    } else if (preset === "30days") {
      const d30 = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
      onDateRangeChange(formatDateStr(d30), todayStr);
    } else if (preset === "thisMonth") {
      const firstMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      onDateRangeChange(formatDateStr(firstMonth), todayStr);
    }
  };

  return (
    <div
      className={
        isSticky
          ? "sticky top-16 z-20 -mx-6 lg:-mx-8 px-6 lg:px-8 pt-2 pb-4 bg-[rgba(255,255,255,0.08)] backdrop-blur-2xl border-b border-[rgba(255,255,255,0.18)] mb-6 shadow-[0_12px_40px_rgba(0,0,0,0.5)] transition-all duration-300"
          : "mb-6 transition-all duration-300"
      }
    >
      <div className="rounded-2xl border border-[rgba(0,212,255,0.15)] bg-gradient-to-b from-[rgba(15,23,42,0.96)] to-[rgba(11,19,38,0.98)] p-5 space-y-4 shadow-xl">
        {/* Filter Section Header */}
        <div className="flex items-center justify-between border-b border-[rgba(143,163,184,0.08)] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)] text-cyan">
              <Filter size={14} />
            </div>
            <span className="text-[0.8rem] font-bold tracking-wider text-text-primary uppercase">
              Cycle Filters & Controls
            </span>
            {hasActiveFilters && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-[rgba(0,212,255,0.15)] text-cyan border border-[rgba(0,212,255,0.3)]">
                Active
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-[0.73rem] text-text-muted">
            <span>
              Showing{" "}
              <strong className="text-cyan font-orbitron">
                {showingRecords}
              </strong>{" "}
              of{" "}
              <strong className="text-text-primary font-orbitron">
                {totalRecords}
              </strong>{" "}
              cycles
            </span>

            {/* Date Range Filter Icon Button */}
            <button
              type="button"
              onClick={() => setIsDateOpen((prev) => !prev)}
              title={
                fromDate || toDate
                  ? `Date Active: ${fromDate || "..."} → ${toDate || "..."}`
                  : "Toggle Date Range Filter"
              }
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[0.72rem] transition-all border cursor-pointer ${
                fromDate || toDate
                  ? "bg-cyan/20 text-cyan border-cyan/50 shadow-[0_0_12px_rgba(0,212,255,0.3)] font-bold"
                  : isDateOpen
                  ? "bg-[rgba(0,212,255,0.12)] text-cyan border-[rgba(0,212,255,0.3)] font-semibold"
                  : "bg-[rgba(255,255,255,0.04)] text-steel border-[rgba(143,163,184,0.15)] hover:text-text-primary hover:bg-[rgba(255,255,255,0.08)]"
              }`}
            >
              <Calendar size={13} className={fromDate || toDate ? "text-cyan" : ""} />
              <span>{fromDate || toDate ? "Date Filtered" : "Date Range"}</span>
              {(fromDate || toDate) && (
                <span className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
              )}
            </button>

            {/* Pin / Fix Toggle Button */}
            <button
              type="button"
              onClick={() => setIsSticky((prev) => !prev)}
              title={
                isSticky
                  ? "Unpin filter section"
                  : "Pin filter section to top when scrolling"
              }
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[0.72rem] font-medium transition-all border cursor-pointer ${
                isSticky
                  ? "bg-[rgba(0,212,255,0.18)] text-cyan border-[rgba(0,212,255,0.4)] shadow-[0_0_12px_rgba(0,212,255,0.25)]"
                  : "bg-[rgba(255,255,255,0.04)] text-steel border-[rgba(143,163,184,0.15)] hover:text-text-primary hover:bg-[rgba(255,255,255,0.08)]"
              }`}
            >
              {isSticky ? (
                <Pin size={12} className="rotate-45 text-cyan" />
              ) : (
                <PinOff size={12} />
              )}
              <span>{isSticky ? "Fixed" : "Pin"}</span>
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={onClearAll}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.08)] text-copper hover:bg-[rgba(239,68,68,0.18)] hover:text-red-300 transition-all font-medium cursor-pointer"
              >
                <X size={12} /> Reset All
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Date Range Filter Bar */}
        {(isDateOpen || fromDate || toDate) && (
          <div className="p-3.5 rounded-xl bg-black/40 border border-[rgba(0,212,255,0.18)] space-y-3 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-cyan font-orbitron text-xs font-bold tracking-wider">
                <Calendar size={14} />
                <span>Date Range Filter</span>
                {(fromDate || toDate) && (
                  <span className="px-2 py-0.5 rounded-full text-[0.62rem] bg-cyan/15 border border-cyan/30 text-cyan">
                    Filtered
                  </span>
                )}
              </div>

              {/* Side-by-side From & To Inputs */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 bg-black/60 border border-white/10 hover:border-cyan/40 focus-within:border-cyan px-2.5 py-1 rounded-xl transition-all">
                  <span className="text-[0.62rem] font-orbitron font-semibold text-text-muted uppercase">From:</span>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => onDateRangeChange && onDateRangeChange(e.target.value, toDate)}
                    className="bg-transparent text-text-primary outline-none font-orbitron text-xs cursor-pointer [color-scheme:dark]"
                  />
                </div>

                <span className="text-steel font-orbitron text-xs">→</span>

                <div className="flex items-center gap-2 bg-black/60 border border-white/10 hover:border-cyan/40 focus-within:border-cyan px-2.5 py-1 rounded-xl transition-all">
                  <span className="text-[0.62rem] font-orbitron font-semibold text-text-muted uppercase">To:</span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => onDateRangeChange && onDateRangeChange(fromDate, e.target.value)}
                    className="bg-transparent text-text-primary outline-none font-orbitron text-xs cursor-pointer [color-scheme:dark]"
                  />
                </div>

                {(fromDate || toDate) && (
                  <button
                    type="button"
                    onClick={() => onDateRangeChange && onDateRangeChange("", "")}
                    className="px-2.5 py-1 rounded-lg bg-copper/15 border border-copper/40 text-copper text-xs font-orbitron font-semibold hover:bg-copper/25 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <X size={12} /> Clear Date
                  </button>
                )}
              </div>
            </div>

            {/* Quick Range Presets */}
            <div className="flex flex-wrap items-center justify-between pt-2 border-t border-white/5 gap-2">
              <span className="text-[0.62rem] font-orbitron font-semibold text-text-muted uppercase tracking-wider">
                Quick Ranges:
              </span>
              <div className="flex flex-wrap items-center gap-1 font-orbitron text-[0.68rem]">
                <button
                  type="button"
                  onClick={() => handlePreset("today")}
                  className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:border-cyan/40 hover:bg-cyan/10 text-steel hover:text-cyan transition-all cursor-pointer"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset("7days")}
                  className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:border-cyan/40 hover:bg-cyan/10 text-steel hover:text-cyan transition-all cursor-pointer"
                >
                  Last 7 Days
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset("30days")}
                  className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:border-cyan/40 hover:bg-cyan/10 text-steel hover:text-cyan transition-all cursor-pointer"
                >
                  Last 30 Days
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset("thisMonth")}
                  className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:border-cyan/40 hover:bg-cyan/10 text-steel hover:text-cyan transition-all cursor-pointer"
                >
                  This Month
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4 Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
          {/* Cycle Search */}
          <div className="space-y-1.5">
            <label className="text-[0.65rem] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Search size={11} className="text-cyan" /> Search Name / ID
            </label>
            <div className="relative">
              <Search
                size={13}
                stroke="#3d4f63"
                strokeWidth={2}
                className="absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                type="text"
                placeholder="Search cycle name or ID..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="input-glass w-full text-[0.8rem] py-2 pl-[34px] pr-8 focus:border-cyan focus:ring-1 focus:ring-[rgba(0,212,255,0.3)] transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* 1. Module Name Filter */}
          <div className="space-y-1.5">
            <label className="text-[0.65rem] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <GitBranch size={11} className="text-cyan" /> Module Name
            </label>
            <Dropdown
              value={moduleId}
              onChange={onModuleChange}
              options={moduleOptions}
              placeholder="All Modules"
            />
          </div>

          {/* 2. Status Filter */}
          <div className="space-y-1.5">
            <label className="text-[0.65rem] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Activity size={11} className="text-copper" /> Cycle Status
            </label>
            <Dropdown
              value={status}
              onChange={onStatusChange}
              options={STATUS_OPTIONS}
              placeholder="All Statuses"
            />
          </div>

          {/* 3. Compliance Status Filter */}
          <div className="space-y-1.5">
            <label className="text-[0.65rem] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 size={11} className="text-emerald-400" /> Compliance Status
            </label>
            <Dropdown
              value={complianceStatus}
              onChange={onComplianceStatusChange}
              options={COMPLIANCE_OPTIONS}
              placeholder="All Compliance"
            />
          </div>
        </div>

        {/* ── Interactive Active Filter Chips Bar ── */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[rgba(143,163,184,0.08)]">
            <span className="text-[0.66rem] font-bold uppercase text-text-muted tracking-wider mr-1">
              Applied Filters:
            </span>

            {search && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[0.72rem] bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.25)] text-cyan shadow-sm">
                <Search size={10} /> Search: "{search}"
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="hover:text-white transition-colors ml-0.5"
                >
                  <X size={11} />
                </button>
              </span>
            )}

            {moduleId && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[0.72rem] bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.25)] text-cyan shadow-sm">
                <GitBranch size={10} /> Module Selected
                <button
                  type="button"
                  onClick={() => onModuleChange("")}
                  className="hover:text-white transition-colors ml-0.5"
                >
                  <X size={11} />
                </button>
              </span>
            )}

            {status && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[0.72rem] bg-[rgba(200,121,65,0.12)] border border-[rgba(200,121,65,0.3)] text-copper shadow-sm">
                <Activity size={10} /> Status: {status}
                <button
                  type="button"
                  onClick={() => onStatusChange("")}
                  className="hover:text-white transition-colors ml-0.5"
                >
                  <X size={11} />
                </button>
              </span>
            )}

            {complianceStatus && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[0.72rem] bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.25)] text-emerald-400 shadow-sm">
                <CheckCircle2 size={10} /> Compliance: {complianceStatus}
                <button
                  type="button"
                  onClick={() => onComplianceStatusChange("")}
                  className="hover:text-white transition-colors ml-0.5"
                >
                  <X size={11} />
                </button>
              </span>
            )}

            {(fromDate || toDate) && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[0.72rem] bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.25)] text-cyan shadow-sm">
                <Calendar size={10} /> Date: {fromDate || "..."} → {toDate || "..."}
                <button
                  type="button"
                  onClick={() => onDateRangeChange && onDateRangeChange("", "")}
                  className="hover:text-white transition-colors ml-0.5"
                >
                  <X size={11} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
