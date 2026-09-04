import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader2,
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  GripVertical,
  ChevronDown,
  AlignLeft,
  Hash,
  Image,
  Star,
  Calendar,
  MessageSquare,
  Settings2,
  Check,
  AlertTriangle,
  List,
  Eye,
} from "lucide-react";
import { useCreateForm, useUpdateForm, useForm } from "../apiHooks";
import { useAgents } from "../../agents/apiHooks";
import Dropdown from "../../../components/ui/Dropdown";

/* ═══════════════════════════════════════════════════════════
   Section type definitions
   ═══════════════════════════════════════════════════════════ */
const SECTION_TYPES = [
  { value: "short_text", label: "Short answer", icon: AlignLeft },
  { value: "paragraph", label: "Paragraph", icon: AlignLeft },
  { value: "number", label: "Number", icon: Hash },
  { value: "radio", label: "Multiple choice", icon: List },
  { value: "checkbox", label: "Checkboxes", icon: List },
  { value: "select", label: "Dropdown", icon: ChevronDown },
  { value: "image", label: "Image / AI scan", icon: Image },
  { value: "rating", label: "Linear scale", icon: Star },
  { value: "date", label: "Date", icon: Calendar },
  { value: "note", label: "Section header", icon: MessageSquare },
];

const CHOICE_TYPES = ["radio", "checkbox", "select"];

function makeSection(type = "radio") {
  return {
    _lid: Date.now() + Math.random(),
    type,
    title: "",
    descriptions: "",
    options: CHOICE_TYPES.includes(type) ? ["Option 1", "Option 2"] : [],
    assignedBotId: "",
    isRequired: false,
    setting: {
      max: null,
      min: null,
      length: null,
      size: null,
      sizeMode: "sampleSizeBased",
      unitCost: 0,
    },
    _showDesc: false,
    _showSettings: false,
    _showSampleSize: false,
  };
}

/* ═══════════════════════════════════════════════════════════
   TypeDropdown — mini dropdown inside section card
   ═══════════════════════════════════════════════════════════ */
function TypeDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const curr = SECTION_TYPES.find((t) => t.value === value) ?? SECTION_TYPES[0];

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 pl-3 pr-2 py-2 rounded-lg border border-[rgba(143,163,184,0.2)] bg-[rgba(255,255,255,0.03)] hover:border-[rgba(0,212,255,0.3)] transition-all text-[0.78rem] text-steel min-w-[160px] justify-between"
      >
        <span className="flex items-center gap-2">
          <curr.icon size={14} className="text-cyan shrink-0" />
          {curr.label}
        </span>
        <ChevronDown
          size={13}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 rounded-xl bg-[rgba(8,12,20,0.98)] border border-[rgba(0,212,255,0.15)] shadow-[0_16px_48px_rgba(0,0,0,0.6)] z-50 overflow-hidden">
          {SECTION_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => {
                onChange(t.value);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-[0.78rem] transition-all ${
                t.value === value
                  ? "bg-[rgba(0,212,255,0.08)] text-cyan"
                  : "text-steel hover:bg-white/[0.04] hover:text-text-primary"
              }`}
            >
              <t.icon size={13} className="shrink-0" />
              {t.label}
              {t.value === value && <Check size={12} className="ml-auto" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SectionCard — always expanded, never collapses
   ═══════════════════════════════════════════════════════════ */
function SectionCard({
  section,
  idx,
  isActive,
  agents = [],
  error,
  onActivate,
  onChange,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}) {
  const set = (key, val) => onChange({ ...section, [key]: val });
  const setSetting = (key, val) =>
    onChange({ ...section, setting: { ...section.setting, [key]: val } });
  const updateSettings = (newSettings) =>
    onChange({ ...section, setting: { ...section.setting, ...newSettings } });

  const addOption = () =>
    set("options", [
      ...section.options,
      `Option ${section.options.length + 1}`,
    ]);

  const updateOption = (i, val) =>
    set(
      "options",
      section.options.map((o, j) => (j === i ? val : o)),
    );

  const removeOption = (i) => {
    if (section.options.length <= 2) return;
    set(
      "options",
      section.options.filter((_, j) => j !== i),
    );
  };

  /* Build AI agent options for Dropdown */
  const agentOptions = [
    { value: "", label: "No AI — manual review" },
    ...agents.map((a) => ({ value: a._id, label: a.name })),
  ];

  /* Border colour: error > active > default */
  const borderClass = error
    ? "border-[rgba(200,121,65,0.55)] ring-1 ring-[rgba(200,121,65,0.2)]"
    : isActive
      ? "border-[rgba(0,212,255,0.25)] ring-1 ring-[rgba(0,212,255,0.1)]"
      : "border-[rgba(143,163,184,0.1)] hover:border-[rgba(0,212,255,0.15)]";

  const bgClass = isActive
    ? "bg-[rgba(8,12,24,0.92)]"
    : "bg-[rgba(8,12,24,0.6)]";

  return (
    <div
      onClick={onActivate}
      className={`relative rounded-xl border transition-all duration-200 cursor-pointer group ${bgClass} ${borderClass} ${isActive ? "shadow-[0_4px_24px_rgba(0,0,0,0.4)]" : ""}`}
    >
      {/* Left bar — cyan when active, copper when error */}
      <div
        className={`absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full transition-colors ${
          error ? "bg-copper" : isActive ? "bg-cyan" : "bg-transparent"
        }`}
      />

      <div className="p-5 pl-6">
        {/* ── Row 1: Drag handle + title input + type dropdown ── */}
        <div className="flex items-start gap-3">
          {/* Drag handle + number */}
          <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
            <GripVertical
              size={14}
              className="text-[rgba(143,163,184,0.3)] cursor-grab group-hover:text-[rgba(143,163,184,0.6)] transition-colors"
            />
            <span className="text-[0.6rem] text-text-muted font-mono">
              {idx + 1}
            </span>
          </div>

          {/* Title input */}
          <div className="flex-1 min-w-0">
            {section.type === "note" ? (
              <>
                <input
                  type="text"
                  placeholder="Section title *"
                  value={section.title}
                  onChange={(e) => set("title", e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className={`w-full bg-transparent border-0 outline-none text-[1.1rem] font-semibold text-text-primary pb-1 placeholder:text-text-muted/40 transition-colors border-b-2 ${
                    error
                      ? "border-b-copper"
                      : "border-b-[rgba(143,163,184,0.2)] focus:border-b-cyan"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={section.descriptions}
                  onChange={(e) => set("descriptions", e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-transparent border-0 border-b border-b-[rgba(143,163,184,0.1)] focus:border-b-[rgba(0,212,255,0.4)] outline-none text-[0.85rem] text-steel mt-2 pb-1 placeholder:text-text-muted/30 transition-colors"
                />
              </>
            ) : (
              <input
                type="text"
                placeholder="Question *"
                value={section.title}
                onChange={(e) => set("title", e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className={`w-full bg-transparent border-0 outline-none text-[1rem] font-semibold text-text-primary pb-1 placeholder:text-text-muted/40 transition-colors border-b-2 ${
                  error
                    ? "border-b-copper"
                    : "border-b-[rgba(143,163,184,0.2)] focus:border-b-cyan"
                }`}
              />
            )}

            {/* Inline validation error */}
            {error && (
              <p className="flex items-center gap-1 mt-1 text-[0.68rem] text-copper">
                <AlertTriangle size={10} /> {error}
              </p>
            )}
          </div>

          {/* Type dropdown — always visible for non-note sections */}
          {section.type !== "note" && (
            <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
              <TypeDropdown
                value={section.type}
                onChange={(val) => {
                  const needsOpts = CHOICE_TYPES.includes(val);
                  const hadOpts = CHOICE_TYPES.includes(section.type);
                  if (needsOpts && !hadOpts)
                    onChange({
                      ...section,
                      type: val,
                      options: ["Option 1", "Option 2"],
                    });
                  else if (!needsOpts && hadOpts)
                    onChange({ ...section, type: val, options: [] });
                  else onChange({ ...section, type: val });
                }}
              />
            </div>
          )}
        </div>

        {/* ── Help text input (when toggled on) ── */}
        {section._showDesc && section.type !== "note" && (
          <div className="mt-3 ml-7">
            <input
              type="text"
              placeholder="Description / help text"
              value={section.descriptions}
              onChange={(e) => set("descriptions", e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-transparent border-0 border-b border-b-[rgba(143,163,184,0.15)] focus:border-b-[rgba(0,212,255,0.35)] outline-none text-[0.82rem] text-steel pb-1 placeholder:text-text-muted/30 transition-colors"
            />
          </div>
        )}

        {/* ── Answer area — always expanded ── */}
        <div className="mt-4 ml-7" onClick={(e) => e.stopPropagation()}>
          {/* Choice types */}
          {CHOICE_TYPES.includes(section.type) && (
            <div className="space-y-2">
              {section.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 shrink-0 border border-[rgba(143,163,184,0.3)] ${
                      section.type === "checkbox" ? "rounded" : "rounded-full"
                    }`}
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    className="flex-1 bg-transparent border-0 border-b border-b-[rgba(143,163,184,0.15)] focus:border-b-[rgba(0,212,255,0.4)] outline-none text-[0.85rem] text-steel pb-0.5 transition-colors"
                  />
                  {section.options.length > 2 ? (
                    <button
                      type="button"
                      onClick={() => removeOption(i)}
                      className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-copper transition-colors rounded"
                    >
                      <Trash2 size={12} />
                    </button>
                  ) : (
                    <div className="w-6 h-6" />
                  )}
                </div>
              ))}
              <p className="text-[0.65rem] text-text-muted ml-7">
                Minimum 2 options required
              </p>
              <button
                type="button"
                onClick={addOption}
                className="flex items-center gap-2 mt-1 text-[0.78rem] text-cyan hover:text-[rgba(0,212,255,0.7)] transition-colors"
              >
                <Plus size={13} /> Add option
              </button>
            </div>
          )}

          {/* Short text / paragraph */}
          {(section.type === "short_text" || section.type === "paragraph") && (
            <div
              className={`border-b border-b-[rgba(143,163,184,0.25)] text-[0.82rem] text-text-muted pb-1 ${section.type === "paragraph" ? "min-h-[48px]" : ""}`}
            >
              {section.type === "short_text"
                ? "Short answer text"
                : "Long answer text"}
            </div>
          )}

          {/* Number */}
          {section.type === "number" && (
            <div className="border-b border-b-[rgba(143,163,184,0.25)] text-[0.82rem] text-text-muted pb-1">
              Number
            </div>
          )}

          {/* Image */}
          {section.type === "image" && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(0,212,255,0.04)] border border-[rgba(0,212,255,0.1)]">
                <Image
                  size={20}
                  className="text-[rgba(0,212,255,0.4)] shrink-0"
                />
                <span className="text-[0.78rem] text-steel">
                  Respondent will upload or capture an image
                </span>
              </div>

              {/* Sample size requirement selector (Expanded via button side-by-side with Hint) */}
              {section._showSampleSize && (
                <div className="p-3.5 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(143,163,184,0.12)] space-y-3 transition-all animate-in fade-in duration-200">
                  <label className="block text-[0.7rem] font-bold text-steel uppercase tracking-[0.08em]">
                    Image Sample Size Option
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        updateSettings({
                          sizeMode: "sampleSizeBased",
                          size: null,
                        })
                      }
                      className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all text-left ${
                        (section.setting?.sizeMode ?? "sampleSizeBased") ===
                        "sampleSizeBased"
                          ? "bg-[rgba(0,212,255,0.08)] border-[rgba(0,212,255,0.4)] text-cyan font-medium"
                          : "bg-transparent border-[rgba(143,163,184,0.15)] text-text-muted hover:border-[rgba(143,163,184,0.3)]"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          (section.setting?.sizeMode ?? "sampleSizeBased") ===
                          "sampleSizeBased"
                            ? "border-cyan bg-[rgba(0,212,255,0.15)]"
                            : "border-[rgba(143,163,184,0.3)]"
                        }`}
                      >
                        {(section.setting?.sizeMode ?? "sampleSizeBased") ===
                          "sampleSizeBased" && (
                          <div className="w-2 h-2 rounded-full bg-cyan" />
                        )}
                      </div>
                      <span className="text-[0.78rem]">Sample size based</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateSettings({ sizeMode: "customSize" })}
                      className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all text-left ${
                        section.setting?.sizeMode === "customSize"
                          ? "bg-[rgba(0,212,255,0.08)] border-[rgba(0,212,255,0.4)] text-cyan font-medium"
                          : "bg-transparent border-[rgba(143,163,184,0.15)] text-text-muted hover:border-[rgba(143,163,184,0.3)]"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          section.setting?.sizeMode === "customSize"
                            ? "border-cyan bg-[rgba(0,212,255,0.08)] border-[rgba(0,212,255,0.4)] text-cyan font-medium"
                            : "bg-transparent border-[rgba(143,163,184,0.15)] text-text-muted hover:border-[rgba(143,163,184,0.3)]"
                        }`}
                      >
                        {section.setting?.sizeMode === "customSize" && (
                          <div className="w-2 h-2 rounded-full bg-cyan" />
                        )}
                      </div>
                      <span className="text-[0.78rem]">Customize size</span>
                    </button>
                  </div>

                  {/* If Customize size is selected, show Size field (Required) */}
                  {section.setting?.sizeMode === "customSize" && (
                    <div className="pt-2.5 border-t border-[rgba(143,163,184,0.08)] space-y-1.5">
                      <label className="block text-[0.72rem] font-semibold text-steel">
                        Size <span className="text-copper">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="Enter custom size (e.g. 5)"
                        value={section.setting?.size ?? ""}
                        onChange={(e) => {
                          const val =
                            e.target.value === ""
                              ? null
                              : Number(e.target.value);
                          setSetting("size", val);
                        }}
                        className="input-glass text-[0.82rem] w-full"
                      />
                    </div>
                  )}

                  {/* Unit Price (سعر القطعة) */}
                  <div className="pt-2.5 border-t border-[rgba(143,163,184,0.08)] space-y-1.5">
                    <label className="block text-[0.72rem] font-semibold text-steel">
                      سعر القطعة (Unit Price)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={section.setting?.unitCost ?? ""}
                        onChange={(e) => {
                          const val =
                            e.target.value === "" ? 0 : Number(e.target.value);
                          setSetting("unitCost", val);
                        }}
                        className="input-glass text-[0.82rem] w-full pr-12 font-mono font-bold text-cyan"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.68rem] text-steel font-orbitron font-bold">
                        EGP
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Rating */}
          {section.type === "rating" && (
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className="w-9 h-9 rounded-full border border-[rgba(0,212,255,0.2)] flex items-center justify-center text-[0.78rem] text-text-muted"
                >
                  {n}
                </div>
              ))}
            </div>
          )}

          {/* Date */}
          {section.type === "date" && (
            <div className="flex items-center gap-2 border-b border-b-[rgba(143,163,184,0.25)] pb-1 text-[0.82rem] text-text-muted">
              <Calendar size={14} className="text-[rgba(0,212,255,0.4)]" />
              MM / DD / YYYY
            </div>
          )}

          {/* AI Agent selector — image type only, uses global Dropdown */}
          {section.type === "image" && (
            <div className="mt-3">
              <label className="block text-[0.72rem] font-semibold text-steel mb-1.5">
                Assign AI Agent
              </label>
              <Dropdown
                value={section.assignedBotId}
                onChange={(val) => set("assignedBotId", val)}
                options={agentOptions}
                placeholder="No AI — manual review"
              />
              {section.assignedBotId && (
                <p className="mt-1.5 text-[0.68rem] text-copper">
                  AI agent will auto-analyze this image and return a decision
                  score.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Footer toolbar — always visible ── */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-between px-5 py-3 border-t border-t-[rgba(143,163,184,0.08)]"
      >
        {/* Left tools */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={isFirst}
            onClick={onMoveUp}
            title="Move up"
            className="w-7 h-7 flex items-center justify-center rounded text-text-muted hover:text-cyan hover:bg-[rgba(0,212,255,0.06)] disabled:opacity-30 transition-all"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
          <button
            type="button"
            disabled={isLast}
            onClick={onMoveDown}
            title="Move down"
            className="w-7 h-7 flex items-center justify-center rounded text-text-muted hover:text-cyan hover:bg-[rgba(0,212,255,0.06)] disabled:opacity-30 transition-all"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <div className="w-px h-4 bg-[rgba(143,163,184,0.15)] mx-1" />

          {/* Hint toggle */}
          {section.type !== "note" && (
            <button
              type="button"
              onClick={() => set("_showDesc", !section._showDesc)}
              title="Toggle help text"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[0.7rem] transition-all ${
                section._showDesc
                  ? "bg-[rgba(0,212,255,0.1)] text-cyan border border-[rgba(0,212,255,0.2)]"
                  : "text-text-muted hover:bg-white/[0.04] hover:text-steel border border-transparent"
              }`}
            >
              <MessageSquare size={11} /> Hint
            </button>
          )}

          {/* Sample Size Option toggle (Image type only) */}
          {section.type === "image" && (
            <button
              type="button"
              onClick={() => set("_showSampleSize", !section._showSampleSize)}
              title="Toggle Image Sample Size Option"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[0.7rem] transition-all ${
                section._showSampleSize
                  ? "bg-[rgba(0,212,255,0.1)] text-cyan border border-[rgba(0,212,255,0.2)]"
                  : "text-text-muted hover:bg-white/[0.04] hover:text-steel border border-transparent"
              }`}
            >
              <Settings2 size={11} /> Setting
            </button>
          )}
        </div>

        {/* Right tools */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onDuplicate}
            title="Duplicate"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[0.7rem] text-text-muted hover:bg-white/[0.04] hover:text-steel border border-transparent transition-all"
          >
            <Copy size={11} /> Duplicate
          </button>

          <div className="w-px h-4 bg-[rgba(143,163,184,0.15)] mx-1" />

          {/* Required toggle */}
          {section.type !== "note" && (
            <label className="flex items-center gap-1.5 cursor-pointer select-none px-1">
              <span className="text-[0.7rem] text-text-muted">Required</span>
              <div
                onClick={() => set("isRequired", !section.isRequired)}
                className={`w-9 h-5 rounded-full transition-all relative cursor-pointer ${
                  section.isRequired ? "bg-cyan" : "bg-[rgba(143,163,184,0.2)]"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                    section.isRequired ? "left-[18px]" : "left-0.5"
                  }`}
                />
              </div>
            </label>
          )}

          <div className="w-px h-4 bg-[rgba(143,163,184,0.15)] mx-1" />

          <button
            type="button"
            onClick={onDelete}
            title="Delete section"
            className="w-7 h-7 flex items-center justify-center rounded text-text-muted hover:text-copper hover:bg-[rgba(200,121,65,0.08)] transition-all"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   AddSectionSidebar — sticky panel, default open, no auto-close
   ═══════════════════════════════════════════════════════════ */
function AddSectionSidebar({ onAdd }) {
  const [open, setOpen] = useState(true); // default open

  return (
    <div className="w-52">
      {/* Header / toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[rgba(8,12,24,0.85)] border border-[rgba(0,212,255,0.15)] text-[0.75rem] font-semibold text-steel hover:text-cyan hover:border-[rgba(0,212,255,0.3)] transition-all mb-1"
      >
        <span className="flex items-center gap-2">
          <Plus size={13} className="text-cyan" />
          Add Question
        </span>
        <ChevronDown
          size={13}
          className={`text-steel transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="rounded-xl overflow-hidden bg-[rgba(8,12,24,0.85)] border border-[rgba(0,212,255,0.12)]">
          {SECTION_TYPES.map((t, i) => (
            <button
              key={t.value}
              type="button"
              onClick={() => onAdd(t.value)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-[0.78rem] text-steel hover:bg-[rgba(0,212,255,0.07)] hover:text-text-primary transition-colors ${
                i < SECTION_TYPES.length - 1
                  ? "border-b border-b-[rgba(143,163,184,0.05)]"
                  : ""
              }`}
            >
              <t.icon size={13} className="text-cyan shrink-0" />
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════ */
export default function CreateFormPage() {
  const { id: moduleId, formId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!formId;

  const { mutateAsync: createForm, isPending: creating } = useCreateForm();
  const { mutateAsync: updateForm, isPending: updating } = useUpdateForm();
  const { data: existingForm, isLoading: loadingForm } = useForm(
    isEditMode ? formId : null,
  );
  const { data: agentsData } = useAgents({ limit: 100 });
  const agents = agentsData?.agents ?? [];

  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [sections, setSections] = useState([makeSection("radio")]);
  const [activeIdx, setActiveIdx] = useState(0);

  /* Validation */
  const [formTitleError, setFormTitleError] = useState(false);
  const [sectionErrors, setSectionErrors] = useState({});
  const [apiError, setApiError] = useState("");

  /* Populate in edit mode */
  useEffect(() => {
    if (isEditMode && existingForm) {
      setFormName(existingForm.name ?? "");
      setFormDesc(existingForm.description ?? "");
      setSections(
        (existingForm.sections ?? []).map((s) => ({
          ...s,
          _lid: s._id ?? Date.now() + Math.random(),
          _showDesc: !!s.descriptions,
          _showSettings: false,
          _showSampleSize:
            s.setting?.sizeMode === "customSize" ||
            !!s.setting?.size ||
            !!s.setting?.unitCost,
          setting: {
            max: s.setting?.max ?? null,
            min: s.setting?.min ?? null,
            length: s.setting?.length ?? null,
            size: s.setting?.size ?? null,
            sizeMode: s.setting?.sizeMode || "sampleSizeBased",
            unitCost: s.setting?.unitCost ?? 0,
          },
          assignedBotId: s.assignedBotId?._id ?? s.assignedBotId ?? "",
          options: Array.isArray(s.options) ? s.options : [],
        })),
      );
    }
  }, [isEditMode, existingForm]);

  /* Section helpers */
  const addSection = (type) => {
    const s = makeSection(type);
    setSections((prev) => [...prev, s]);
    setActiveIdx(sections.length);
    if (sectionErrors._empty) {
      setSectionErrors((prev) => {
        const n = { ...prev };
        delete n._empty;
        return n;
      });
    }
  };

  const updateSection = (idx, updated) =>
    setSections((prev) => prev.map((s, i) => (i === idx ? updated : s)));

  const duplicateSection = (idx) => {
    const copy = { ...sections[idx], _lid: Date.now() + Math.random() };
    const next = [...sections];
    next.splice(idx + 1, 0, copy);
    setSections(next);
    setActiveIdx(idx + 1);
  };

  const deleteSection = (idx) => {
    setSections((prev) => prev.filter((_, i) => i !== idx));
    setActiveIdx((prev) => Math.max(0, prev > idx ? prev - 1 : prev));
  };

  const moveSection = (idx, dir) => {
    const next = [...sections];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setSections(next);
    setActiveIdx(target);
  };

  /* Validate */
  const validate = () => {
    let valid = true;
    const secErrs = {};

    if (!formName.trim()) {
      setFormTitleError(true);
      valid = false;
    } else {
      setFormTitleError(false);
    }

    if (sections.length === 0) {
      setSectionErrors({ _empty: "At least one question is required" });
      valid = false;
      return valid;
    }

    sections.forEach((s) => {
      if (!s.title.trim()) {
        secErrs[s._lid] = "Question title is required";
        valid = false;
      } else if (CHOICE_TYPES.includes(s.type) && s.options.length < 2) {
        secErrs[s._lid] = "At least 2 options are required";
        valid = false;
      } else if (s.type === "image" && s.setting?.sizeMode === "customSize") {
        const sz = Number(s.setting?.size);
        if (
          s.setting?.size === null ||
          s.setting?.size === undefined ||
          isNaN(sz) ||
          sz <= 0
        ) {
          secErrs[s._lid] =
            "Size is required and must be greater than 0 for Customize size";
          valid = false;
        }
      }
    });

    setSectionErrors(secErrs);

    if (Object.keys(secErrs).length > 0) {
      const firstErrIdx = sections.findIndex((s) => secErrs[s._lid]);
      if (firstErrIdx !== -1) setActiveIdx(firstErrIdx);
    }

    return valid;
  };

  /* Serialize */
  const serializeSections = () =>
    sections.map(
      ({ _lid, _showDesc, _showSettings, _showSampleSize, ...s }) => ({
        ...s,
        assignedBotId: s.assignedBotId || null,
        setting: {
          max: s.setting?.max ?? null,
          min: s.setting?.min ?? null,
          length: s.setting?.length ?? null,
          size:
            s.setting?.sizeMode === "customSize"
              ? (s.setting?.size ?? null)
              : null,
          sizeMode: s.setting?.sizeMode || "sampleSizeBased",
          unitCost: Number(s.setting?.unitCost) || 0,
        },
      }),
    );

  /* Save */
  const handleSave = async () => {
    if (!validate()) return;
    setApiError("");
    try {
      if (isEditMode) {
        await updateForm({
          id: formId,
          name: formName,
          description: formDesc,
          sections: serializeSections(),
        });
      } else {
        await createForm({
          name: formName,
          description: formDesc,
          moduleId,
          sections: serializeSections(),
        });
      }
      navigate(`/dashboard/modules/${moduleId}`);
    } catch (err) {
      setApiError(err?.response?.data?.message ?? "Failed to save form.");
    }
  };

  const handlePreview = () => {
    if (isEditMode) {
      window.open(`/form-preview/${formId}`, "_blank");
    } else {
      const data = {
        name: formName,
        description: formDesc,
        sections: serializeSections(),
      };
      sessionStorage.setItem("__formPreview__", JSON.stringify(data));
      window.open("/form-preview", "_blank");
    }
  };

  const handleFormNameChange = (val) => {
    setFormName(val);
    if (val.trim()) setFormTitleError(false);
  };

  const handleSectionChange = (idx, updated) => {
    updateSection(idx, updated);
    const lid = sections[idx]?._lid;
    if (lid && sectionErrors[lid]) {
      setSectionErrors((prev) => {
        const n = { ...prev };
        delete n[lid];
        return n;
      });
    }
  };

  const isSaving = creating || updating;
  const hasAnyError =
    formTitleError || Object.keys(sectionErrors).length > 0 || !!apiError;

  if (isEditMode && loadingForm)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-cyan" />
      </div>
    );

  /* ════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => navigate(`/dashboard/modules/${moduleId}`)}
          className="btn-ghost text-[0.75rem] py-[9px] px-[16px]"
        >
          <ArrowLeft size={13} /> Back
        </button>

        <div className="flex items-center gap-3">
          {hasAnyError && (
            <span className="flex items-center gap-1.5 text-[0.75rem] text-copper">
              <AlertTriangle size={13} />
              {apiError || "Please fix the errors below"}
            </span>
          )}
          <button
            type="button"
            onClick={handlePreview}
            className="btn-ghost text-[0.75rem] py-[10px] px-[18px]"
          >
            <Eye size={14} /> Preview
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary text-[0.75rem] py-[10px] px-[22px] min-w-[110px] justify-center"
          >
            {isSaving ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Check size={14} />{" "}
                {isEditMode ? "Save Changes" : "Publish Form"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="flex gap-5 items-start">
        {/* ── Main form area ── */}
        <div className="flex-1 min-w-0 max-w-[760px] mx-auto space-y-3">
          {/* Form Header Card */}
          <div
            className={`relative rounded-xl overflow-hidden border bg-[rgba(8,12,24,0.92)] shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-all ${
              formTitleError
                ? "border-[rgba(200,121,65,0.5)]"
                : "border-[rgba(0,212,255,0.12)]"
            }`}
          >
            <div
              className={`h-2.5 ${formTitleError ? "bg-copper" : "bg-gradient-to-r from-cyan via-[rgba(0,180,255,0.8)] to-[rgba(0,212,255,0.4)]"}`}
            />
            <div className="px-7 py-6">
              <input
                type="text"
                placeholder="Untitled form *"
                value={formName}
                onChange={(e) => handleFormNameChange(e.target.value)}
                className={`w-full bg-transparent border-0 outline-none text-[1.5rem] font-semibold text-text-primary pb-2 placeholder:text-text-muted/40 transition-colors border-b-2 ${
                  formTitleError
                    ? "border-b-copper"
                    : "border-b-[rgba(143,163,184,0.2)] focus:border-b-cyan"
                }`}
              />
              {formTitleError && (
                <p className="flex items-center gap-1 mt-1 text-[0.72rem] text-copper">
                  <AlertTriangle size={11} /> Form title is required
                </p>
              )}
              <input
                type="text"
                placeholder="Form description"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                className="w-full mt-3 bg-transparent border-0 border-b border-b-[rgba(143,163,184,0.15)] focus:border-b-[rgba(0,212,255,0.4)] outline-none text-[0.9rem] text-steel pb-1 placeholder:text-text-muted/30 transition-colors"
              />
            </div>
          </div>

          {/* Section cards */}
          {sections.map((section, idx) => (
            <SectionCard
              key={section._lid}
              section={section}
              idx={idx}
              isActive={activeIdx === idx}
              isFirst={idx === 0}
              isLast={idx === sections.length - 1}
              agents={agents}
              error={sectionErrors[section._lid]}
              onActivate={() => setActiveIdx(idx)}
              onChange={(updated) => handleSectionChange(idx, updated)}
              onDuplicate={() => duplicateSection(idx)}
              onDelete={() => deleteSection(idx)}
              onMoveUp={() => moveSection(idx, -1)}
              onMoveDown={() => moveSection(idx, 1)}
            />
          ))}

          {sectionErrors._empty && (
            <p className="flex items-center justify-center gap-1.5 py-3 text-[0.78rem] text-copper">
              <AlertTriangle size={13} /> {sectionErrors._empty}
            </p>
          )}

          {/* Add question inline */}
          <button
            type="button"
            onClick={() => addSection("radio")}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border border-dashed border-[rgba(0,212,255,0.15)] text-[0.8rem] text-text-muted hover:border-[rgba(0,212,255,0.35)] hover:text-cyan hover:bg-[rgba(0,212,255,0.02)] transition-all"
          >
            <Plus size={15} /> Add question
          </button>

          {/* Bottom save */}
          <div className="flex items-center justify-between pt-2 pb-6">
            <span className="text-[0.72rem] text-text-muted">
              {sections.length} section{sections.length !== 1 ? "s" : ""}
            </span>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary text-[0.75rem] py-[10px] px-[24px] justify-center"
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Check size={14} />{" "}
                  {isEditMode ? "Save Changes" : "Publish Form"}
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Right: sticky sidebar — default open ── */}
        <div className="sticky top-6 shrink-0 hidden xl:block">
          <AddSectionSidebar onAdd={addSection} />
        </div>
      </div>
    </div>
  );
}
