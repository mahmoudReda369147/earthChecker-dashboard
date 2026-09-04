import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Eye,
  Loader2,
  FileText,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  GitBranch,
  RotateCcw,
} from "lucide-react";
import PageHeader from "../../../components/ui/PageHeader";
import DataTable from "../../../components/ui/DataTable";
import SubmissionFilters from "../components/SubmissionFilters";
import { useSubmissions } from "../apiHooks";
import { useMe } from "../../auth/apiHooks";
import { useModules } from "../../modules/apiHooks";
import { useCycles } from "../../cycles/apiHooks";
import { useStaff } from "../../staff/apiHooks";

const PER_PAGE = 10;

const COLUMNS = [
  { key: "_index", label: "#", width: "50px" },
  { key: "submissionId", label: "ID", width: "110px" },
  { key: "form", label: "Form", width: "160px" },
  { key: "module", label: "Module", width: "140px" },
  { key: "cycle", label: "Cycle", width: "150px" },
  { key: "submittedBy", label: "Submitted By", align: "left" },
  { key: "scrap", label: "Est. Scrap", align: "center", width: 100 },
  { key: "scrapCost", label: "Scrap Cost", align: "center", width: 110 },
  { key: "complianceStatus", label: "Status", align: "center", width: 140 },
  { key: "date", label: "Date", align: "left" },
  { key: "actions", label: "Actions", align: "center", width: 60 },
];

export default function SubmissionsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  /* Filter States synced with URL Query Params */
  const search = searchParams.get("search") || "";
  const moduleId = searchParams.get("moduleId") || "";
  const cycleId = searchParams.get("cycleId") || "";
  const status = searchParams.get("status") || "";
  const submittedBy = searchParams.get("submittedBy") || "";
  const fromDate = searchParams.get("fromDate") || "";
  const toDate = searchParams.get("toDate") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const updateParam = (key, value, resetPage = true) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    if (resetPage && key !== "page") {
      nextParams.delete("page");
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleDateRangeChange = (newFrom, newTo) => {
    const nextParams = new URLSearchParams(searchParams);
    if (newFrom) {
      nextParams.set("fromDate", newFrom);
    } else {
      nextParams.delete("fromDate");
    }
    if (newTo) {
      nextParams.set("toDate", newTo);
    } else {
      nextParams.delete("toDate");
    }
    nextParams.delete("page");
    setSearchParams(nextParams, { replace: true });
  };

  /* Fetch Current User & Staff Data (including CEO / caller) */
  const { data: me } = useMe();
  const { data: modulesData } = useModules({ limit: 200, isDeleted: false });
  const { data: cyclesData } = useCycles({
    limit: 200,
    isDeleted: false,
    ...(moduleId ? { moduleId } : {}),
  });
  const { data: staffData } = useStaff({ limit: 200, includeSelf: true });

  const modulesList = modulesData?.modules ?? [];
  const rawCycles = cyclesData?.cycles ?? [];
  const staffList = staffData?.staff ?? [];

  /* Combine staff with current user (CEO) if missing */
  const allUsersMap = new Map();
  if (me?._id) allUsersMap.set(me._id.toString(), me);
  staffList.forEach((s) => {
    if (s?._id) allUsersMap.set(s._id.toString(), s);
  });
  const combinedStaffList = Array.from(allUsersMap.values());

  /* Filter cycles by selected module (Case 1: if no module selected, show all cycles. Case 2: if module selected, show cycles for that module) */
  const cyclesList = rawCycles.filter((c) => {
    if (!moduleId) return true;
    const mId = c.moduleId?._id
      ? c.moduleId._id.toString()
      : c.moduleId?.toString();
    return mId === moduleId.toString();
  });

  /* Handle Module selection & clear cycle if it doesn't belong to the selected module */
  const handleModuleChange = (newModuleId) => {
    const nextParams = new URLSearchParams(searchParams);
    if (newModuleId) {
      nextParams.set("moduleId", newModuleId);
    } else {
      nextParams.delete("moduleId");
    }
    nextParams.delete("page");

    if (newModuleId && cycleId) {
      const selectedCycle = rawCycles.find((c) => c._id === cycleId);
      const cModId = selectedCycle?.moduleId?._id
        ? selectedCycle.moduleId._id.toString()
        : selectedCycle?.moduleId?.toString();
      if (cModId !== newModuleId) {
        nextParams.delete("cycleId");
      }
    }
    setSearchParams(nextParams, { replace: true });
  };

  /* Fetch Submissions using backend filters */
  const { data, isLoading } = useSubmissions({
    page,
    limit: PER_PAGE,
    search,
    moduleId,
    cycleId,
    status,
    submittedBy,
    fromDate,
    toDate,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const submissions = data?.data?.submissions ?? [];
  const pagination = data?.data?.pagination ?? {};

  /* Dropdown Options */
  const moduleOptions = [
    { value: "", label: "All Modules" },
    ...modulesList.map((m) => ({
      value: m._id,
      label: m.title || m.name,
      icon: <GitBranch size={13} />,
    })),
  ];

  const cycleOptions = [
    { value: "", label: "All Cycles" },
    ...cyclesList.map((c) => ({
      value: c._id,
      label: c.name || c._id,
      icon: <RotateCcw size={13} />,
    })),
  ];

  const statusOptions = [
    { value: "", label: "All Statuses" },
    {
      value: "compliance",
      label: "Compliance",
      icon: <CheckCircle2 size={13} className="text-emerald-400" />,
    },
    {
      value: "not compliance",
      label: "Not Compliance",
      icon: <XCircle size={13} className="text-copper" />,
    },
    {
      value: "completed",
      label: "Completed",
      icon: <CheckCircle2 size={13} className="text-cyan" />,
    },
  ];

  const staffOptions = [
    { value: "", label: "All Submitted By" },
    ...combinedStaffList.map((s) => ({
      value: s._id,
      label: `${s.name} (${s.role || "user"})`,
      icon: <User size={13} />,
    })),
  ];

  const hasActiveFilters = Boolean(
    search || moduleId || cycleId || status || submittedBy || fromDate || toDate,
  );

  const clearAllFilters = () => {
    setSearchParams({}, { replace: true });
  };

  const renderCell = (key, row, rowIndex) => {
    const globalIndex =
      ((pagination.page ?? page) - 1) * PER_PAGE + rowIndex + 1;
    switch (key) {
      case "_index":
        return (
          <span className="text-[0.82rem] font-semibold text-text-muted">
            #{globalIndex}
          </span>
        );

      case "form":
        return (
          <div className="flex items-center gap-2 min-w-0">
            <FileText size={13} className="text-cyan shrink-0" />
            <span className="text-[0.82rem] text-text-primary truncate">
              {row.formId?.name ?? "—"}
            </span>
          </div>
        );

      case "module":
        return (
          <span className="text-[0.78rem] text-steel truncate">
            {row.moduleId?.title ?? row.moduleId?.name ?? "—"}
          </span>
        );

      case "cycle":
        return (
          <span className="font-orbitron text-[0.65rem] text-copper tracking-[0.04em]">
            {row.cycleId?.name ?? "—"}
          </span>
        );

      case "submittedBy":
        return (
          <div className="flex items-center gap-2 min-w-0">
            {row.submittedBy?.image ? (
              <img
                src={row.submittedBy.image}
                alt=""
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)] flex items-center justify-center">
                <User size={10} className="text-cyan" />
              </div>
            )}
            <span className="text-[0.78rem] text-text-primary truncate">
              {row.submittedBy?.name ?? "—"}
            </span>
          </div>
        );

      case "scrap": {
        const val = row.scrap ?? 0;
        return (
          <span
            className={`text-[0.78rem] font-bold font-mono ${val > 0 ? "text-copper" : "text-emerald-400"}`}
          >
            {val} {val === 1 ? "pc" : "pcs"}
          </span>
        );
      }

      case "scrapCost": {
        const val = row.scrapCost ?? 0;
        return (
          <span
            className={`text-[0.78rem] font-bold font-mono ${val > 0 ? "text-copper" : "text-steel"}`}
          >
            {val > 0
              ? `${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EGP`
              : "0 EGP"}
          </span>
        );
      }

      case "complianceStatus": {
        const val = row.complianceStatus || row.status || "compliance";
        const isCompliant = val === "compliance" || val === "compliant";
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-wider ${
              isCompliant
                ? "bg-[rgba(16,185,129,0.12)] text-emerald-400 border border-[rgba(16,185,129,0.25)]"
                : "bg-[rgba(200,121,65,0.12)] text-copper border border-[rgba(200,121,65,0.25)]"
            }`}
          >
            {isCompliant ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
            {isCompliant ? "Compliance" : "Not Compliance"}
          </span>
        );
      }

      case "date":
        return (
          <span className="flex items-center gap-1.5 text-[0.72rem] text-text-muted whitespace-nowrap">
            <Calendar size={10} />
            {new Date(row.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        );

      case "actions":
        return (
          <button
            title="View Analyses"
            onClick={() =>
              navigate(`/dashboard/submissions/${row._id}/analyses`)
            }
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[rgba(0,212,255,0.2)] text-cyan bg-[rgba(0,212,255,0.04)] hover:bg-[rgba(0,212,255,0.12)] hover:border-[rgba(0,212,255,0.45)] transition-all duration-150"
          >
            <Eye size={13} strokeWidth={2} />
          </button>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <PageHeader
        title="Submissions"
        subtitle="All form submissions across your cycles"
        badge={`${pagination.total ?? 0} Records`}
      />

      <SubmissionFilters
        search={search}
        onSearchChange={(val) => updateParam("search", val)}
        moduleId={moduleId}
        onModuleChange={handleModuleChange}
        cycleId={cycleId}
        onCycleChange={(val) => updateParam("cycleId", val)}
        status={status}
        onStatusChange={(val) => updateParam("status", val)}
        submittedBy={submittedBy}
        onSubmittedByChange={(val) => updateParam("submittedBy", val)}
        fromDate={fromDate}
        toDate={toDate}
        onDateRangeChange={handleDateRangeChange}
        moduleOptions={moduleOptions}
        cycleOptions={cycleOptions}
        statusOptions={statusOptions}
        staffOptions={staffOptions}
        hasActiveFilters={hasActiveFilters}
        onClearAll={clearAllFilters}
        totalRecords={pagination.total ?? 0}
        showingRecords={submissions.length}
      />

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={24} className="animate-spin text-cyan" />
        </div>
      ) : (
        <DataTable
          columns={COLUMNS}
          rows={submissions}
          renderCell={renderCell}
          total={pagination.total ?? 0}
          page={page}
          perPage={PER_PAGE}
          onPageChange={(p) => updateParam("page", p > 1 ? p.toString() : "", false)}
          entityLabel="submissions"
          emptyMessage="No submissions found matching your filters."
        />
      )}
    </div>
  );
}
