import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader2,
  AlertTriangle,
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  FileText,
  Calendar,
  User,
  ImageIcon,
  Eye,
  ArrowUpDown,
  Tag,
  X,
} from "lucide-react";
import Modal from "../../../components/ui/Modal";
import DataTable from "../../../components/ui/DataTable";
import { useModule, useUpdateModule } from "../apiHooks";
import { useForms, useDeleteForm } from "../../forms/apiHooks";

const COLUMNS = [
  { key: "name", label: "Form Name" },
  { key: "description", label: "Description" },
  { key: "sections", label: "Sections", align: "center", width: "110px" },
  { key: "createdBy", label: "Created By", width: "150px" },
  { key: "createdAt", label: "Date", width: "120px" },
  { key: "actions", label: "Actions", align: "right", width: "130px" },
];

const PER_PAGE = 10;

export default function ModuleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [newProblemInput, setNewProblemInput] = useState("");

  const {
    data: module,
    isLoading: moduleLoading,
    isError: moduleError,
  } = useModule(id);
  const { data: formsData, isLoading: formsLoading } = useForms({
    moduleId: id,
    page,
    limit: PER_PAGE,
    sortBy: "order",
    sortOrder: "asc",
  });
  const { mutateAsync: deleteForm, isPending: deleting } = useDeleteForm();
  const { mutateAsync: updateModule, isPending: updatingModule } = useUpdateModule();

  const forms = formsData?.forms ?? [];
  const total = formsData?.pagination?.total ?? 0;

  // Real backend problem types array from DB
  const problemTypes = module?.problemTypes ?? [];

  const handleAddProblemType = async (e) => {
    e.preventDefault();
    const trimmed = newProblemInput.trim();
    if (!trimmed || problemTypes.includes(trimmed)) return;

    const updated = [...problemTypes, trimmed];
    await updateModule({ id, problemTypes: updated });
    setNewProblemInput("");
  };

  const handleRemoveProblemType = async (typeToRemove) => {
    const updated = problemTypes.filter((t) => t !== typeToRemove);
    await updateModule({ id, problemTypes: updated });
  };

  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleDelete = async () => {
    await deleteForm(deleteTarget._id);
    setDeleteTarget(null);
  };

  const renderCell = (key, form) => {
    switch (key) {
      case "name":
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[rgba(0,212,255,0.06)] border border-[rgba(0,212,255,0.1)] flex items-center justify-center shrink-0">
              <FileText size={14} className="text-cyan" />
            </div>
            <span className="text-[0.82rem] font-semibold text-text-primary">
              {form.name}
            </span>
          </div>
        );
      case "description":
        return (
          <span className="text-[0.78rem] text-steel line-clamp-1 max-w-[200px] block">
            {form.description || "—"}
          </span>
        );
      case "sections":
        return (
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded text-[0.68rem] font-bold bg-[rgba(0,212,255,0.08)] text-cyan border border-[rgba(0,212,255,0.15)]">
            {form.sections?.length ?? 0}
          </span>
        );
      case "createdBy":
        return (
          <span className="text-[0.78rem] text-steel">
            {form.createdBy?.name ?? "—"}
          </span>
        );
      case "createdAt":
        return (
          <span className="text-[0.75rem] text-text-muted">
            {new Date(form.createdAt).toLocaleDateString()}
          </span>
        );
      case "actions":
        return (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => window.open(`/form-preview/${form._id}`, "_blank")}
              title="Preview form"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-steel border border-[rgba(143,163,184,0.15)] hover:border-[rgba(0,212,255,0.35)] hover:text-cyan transition-all"
            >
              <Eye size={13} />
            </button>
            <button
              onClick={() =>
                navigate(`/dashboard/modules/${id}/forms/${form._id}/edit`)
              }
              title="Edit form"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-steel border border-[rgba(143,163,184,0.15)] hover:border-[rgba(0,212,255,0.35)] hover:text-cyan transition-all"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => setDeleteTarget(form)}
              title="Delete form"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-copper border border-[rgba(200,121,65,0.2)] hover:border-[rgba(200,121,65,0.5)] hover:bg-[rgba(200,121,65,0.08)] transition-all"
            >
              <Trash2 size={13} />
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  if (moduleLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-cyan" />
      </div>
    );

  if (moduleError || !module)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-copper">
        <AlertTriangle size={32} />
        <p className="text-[0.85rem]">Module not found or failed to load.</p>
        <button
          className="btn-ghost text-[0.72rem]"
          onClick={() => navigate("/dashboard/modules")}
        >
          <ArrowLeft size={13} /> Back to Modules
        </button>
      </div>
    );

  return (
    <div>
      {/* ── Module Hero Card ── */}
      <div className="rounded-xl overflow-hidden bg-bg-glass backdrop-blur-lg border border-[rgba(0,212,255,0.08)] mb-8">
        {/* Top accent */}
        <div className="h-1 bg-gradient-to-r from-cyan via-[rgba(0,180,255,0.6)] to-transparent" />

        <div className="p-5 sm:p-6">
          {/* Back link */}
          <button
            onClick={() => navigate("/dashboard/modules")}
            className="flex items-center gap-1.5 text-[0.72rem] text-text-muted hover:text-cyan transition-colors mb-4 group"
          >
            <ArrowLeft
              size={12}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            <span>Back to Modules</span>
          </button>

          <div className="flex gap-5 items-start">
            {/* Image */}
            {module.image ? (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-[rgba(0,212,255,0.15)] shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
                <img
                  src={module.image}
                  alt={module.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl shrink-0 flex items-center justify-center bg-[rgba(0,212,255,0.04)] border border-[rgba(0,212,255,0.12)]">
                <ImageIcon size={24} className="text-[rgba(0,212,255,0.25)]" />
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="badge-cyan mb-1.5 inline-flex text-[0.6rem]">
                    Module
                  </span>
                  <h1
                    className="font-orbitron font-extrabold text-text-primary tracking-[-0.01em] leading-[1.2]"
                    style={{ fontSize: "clamp(1.15rem, 3vw, 1.5rem)" }}
                  >
                    {module.title}
                  </h1>
                  {module.description && (
                    <p className="text-[0.82rem] text-steel mt-1.5 leading-[1.6] line-clamp-2">
                      {module.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <button
                    className="btn-ghost text-[0.72rem] py-[8px] px-[14px]"
                    onClick={() =>
                      navigate(`/dashboard/modules/${id}/forms/order`)
                    }
                  >
                    <ArrowUpDown size={13} /> Order
                  </button>
                  <button
                    className="btn-primary text-[0.72rem] py-[8px] px-[14px]"
                    onClick={() =>
                      navigate(`/dashboard/modules/${id}/forms/create`)
                    }
                  >
                    <Plus size={13} /> New Form
                  </button>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-[rgba(143,163,184,0.08)]">
                <div className="flex items-center gap-1.5 text-[0.72rem] text-text-muted">
                  <User size={11} className="text-steel" />
                  <span>{module.creatorId?.name ?? "—"}</span>
                </div>
                <div className="w-px h-3 bg-[rgba(143,163,184,0.12)]" />
                <div className="flex items-center gap-1.5 text-[0.72rem] text-text-muted">
                  <Calendar size={11} className="text-steel" />
                  <span>{new Date(module.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="w-px h-3 bg-[rgba(143,163,184,0.12)]" />
                <div className="flex items-center gap-1.5 text-[0.72rem] font-semibold text-cyan">
                  <FileText size={11} />
                  <span>
                    {total} form{total !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Module Defect & Problem Types Library (Dynamic Backend Data) ── */}
      <div className="rounded-xl overflow-hidden bg-[#060a14]/90 backdrop-blur-lg border border-[rgba(200,121,65,0.2)] p-5 sm:p-6 mb-8 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[rgba(200,121,65,0.12)] border border-[rgba(200,121,65,0.3)] flex items-center justify-center text-copper">
              <Tag size={16} />
            </div>
            <div>
              <h2 className="font-orbitron text-sm font-bold text-text-primary tracking-wide flex items-center gap-2">
                Module Defect Problem Types
                <span className="text-[0.62rem] font-orbitron px-2 py-0.5 rounded-full bg-copper/20 text-copper border border-copper/30 font-bold">
                  {problemTypes.length} Configured
                </span>
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Configured defect categories stored in database used by AI Agents to classify failure root-causes
              </p>
            </div>
          </div>
        </div>

        {/* Tags List */}
        {problemTypes.length === 0 ? (
          <p className="text-xs text-text-muted italic mb-4">
            No problem types configured for this module yet. Add defect types below!
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 mb-4">
            {problemTypes.map((type, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-orbitron font-semibold bg-white/[0.04] border border-white/10 text-text-primary group hover:border-copper/40 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-copper" />
                {type}
                <button
                  type="button"
                  onClick={() => handleRemoveProblemType(type)}
                  disabled={updatingModule}
                  title="Remove problem type"
                  className="text-text-muted hover:text-copper transition-colors ml-1"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Add New Tag Input */}
        <form onSubmit={handleAddProblemType} className="flex items-center gap-2 max-w-md">
          <input
            type="text"
            value={newProblemInput}
            onChange={(e) => setNewProblemInput(e.target.value)}
            placeholder="Add defect problem type (e.g., Stitching Flaw)..."
            className="flex-1 text-xs bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-copper transition-colors"
          />
          <button
            type="submit"
            disabled={updatingModule || !newProblemInput.trim()}
            className="btn-copper text-xs py-2 px-3 flex items-center gap-1 shrink-0 disabled:opacity-50"
          >
            {updatingModule ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
            Add Type
          </button>
        </form>
      </div>

      {/* ── Forms Section Header ── */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="font-orbitron text-[0.85rem] font-bold text-text-primary tracking-[0.04em]">
          Forms
        </h2>
        <span className="text-[0.68rem] text-text-muted px-2 py-0.5 rounded bg-[rgba(143,163,184,0.06)] border border-[rgba(143,163,184,0.1)]">
          {total}
        </span>
      </div>

      {/* ── Table ── */}
      {formsLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={24} className="animate-spin text-cyan" />
        </div>
      ) : (
        <DataTable
          columns={COLUMNS}
          rows={forms}
          renderCell={renderCell}
          total={total}
          page={page}
          perPage={PER_PAGE}
          onPageChange={setPage}
          emptyMessage="No forms yet. Create your first one!"
          entityLabel="forms"
        />
      )}

      {/* ── Delete Modal ── */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Form"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-[0.85rem] text-steel leading-[1.6]">
            Are you sure you want to delete{" "}
            <span className="text-text-primary font-semibold">
              {deleteTarget?.name}
            </span>
            ? The form will be soft-deleted and hidden from the list.
          </p>
          <div className="flex gap-3 pt-1">
            <button
              className="btn-ghost flex-1 justify-center"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 flex items-center justify-center gap-2 py-[11px] px-6 rounded bg-[rgba(200,121,65,0.12)] border border-[rgba(200,121,65,0.4)] text-copper font-orbitron text-xs font-bold tracking-[0.08em] uppercase transition-all hover:bg-[rgba(200,121,65,0.2)] disabled:opacity-50"
            >
              {deleting ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Trash2 size={13} />
              )}
              {deleting ? "Deleting…" : "Delete Form"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
