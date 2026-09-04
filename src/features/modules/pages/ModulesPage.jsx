import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Loader2, ImagePlus, X, Plus, Trash2, Pencil,
  AlertTriangle, User, Calendar, Layers,
} from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import Modal      from '../../../components/ui/Modal'
import { useModules, useCreateModule, useUpdateModule, useDeleteModule } from '../apiHooks'
import { uploadImage } from '../../../utils/uploadImage'

/* ═══════════════════════════════════════════════════════════
   Image Picker
   ═══════════════════════════════════════════════════════════ */
function ImagePicker({ value, onChange }) {
  const ref = useRef(null)
  const [prev,      setPrev]      = useState(value || '')
  const [uploading, setUploading] = useState(false)
  const [progress,  setProgress]  = useState(0)
  const [error,     setError]     = useState('')

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)
    setProgress(0)
    try {
      const url = await uploadImage(file, setProgress, 'modules')
      setPrev(url)
      onChange(url)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const clear = () => { setPrev(''); onChange('') }

  return (
    <div className="space-y-2">
      <label className="block text-[0.75rem] font-semibold text-steel">Module Image</label>

      {prev ? (
        <div className="relative rounded-xl overflow-hidden h-[140px] border border-[rgba(0,212,255,0.15)]">
          <img src={prev} alt="preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(6,8,16,0.4)] to-transparent" />
          <button
            type="button"
            onClick={clear}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[rgba(6,8,16,0.65)] backdrop-blur-sm flex items-center justify-center text-white hover:bg-[rgba(200,121,65,0.75)] transition-all"
          >
            <X size={11} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className="w-full h-[140px] rounded-xl border border-dashed border-[rgba(0,212,255,0.18)] bg-[rgba(0,212,255,0.02)] flex flex-col items-center justify-center gap-2.5 text-text-muted hover:border-[rgba(0,212,255,0.4)] hover:bg-[rgba(0,212,255,0.03)] hover:text-cyan transition-all disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 size={20} className="animate-spin text-cyan" />
              <span className="text-[0.72rem]">Uploading {progress}%</span>
              <div className="w-28 h-1 rounded-full bg-[rgba(143,163,184,0.1)] overflow-hidden">
                <div className="h-full rounded-full bg-cyan transition-all" style={{ width: `${progress}%` }} />
              </div>
            </>
          ) : (
            <>
              <ImagePlus size={20} />
              <span className="text-[0.72rem]">Click to upload image</span>
              <span className="text-[0.62rem] text-text-muted">JPEG · PNG · WEBP · max 5 MB</span>
            </>
          )}
        </button>
      )}

      {error && (
        <p className="text-[0.72rem] text-copper flex items-center gap-1.5">
          <AlertTriangle size={11} />{error}
        </p>
      )}
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Module Card
   ═══════════════════════════════════════════════════════════ */
function ModuleCard({ mod, onEdit, onDelete, onView }) {
  return (
    <div className="rounded-xl overflow-hidden bg-bg-glass backdrop-blur-xl border border-[rgba(143,163,184,0.13)] shadow-glass transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(0,212,255,0.25)] hover:shadow-glass-hover group">

      {/* ── Image ── */}
      <div
        className="relative h-[188px] overflow-hidden bg-[rgba(0,212,255,0.03)] cursor-pointer"
        onClick={() => onView(mod)}
      >
        {mod.image ? (
          <img
            src={mod.image}
            alt={mod.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 opacity-40 group-hover:opacity-60 transition-opacity">
              <ImagePlus size={32} className="text-cyan" />
              <span className="text-[0.65rem] text-steel">No image</span>
            </div>
          </div>
        )}

        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(6,8,16,0.75)] via-transparent to-transparent" />

        {/* Hover CTA */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <span className="px-4 py-1.5 rounded-full bg-[rgba(0,212,255,0.18)] border border-[rgba(0,212,255,0.4)] text-cyan text-[0.72rem] font-semibold backdrop-blur-sm shadow-glow-sm">
            Open Module →
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-5 pt-4 pb-5 flex flex-col gap-4">

        {/* Title + description */}
        <div className="cursor-pointer space-y-1.5" onClick={() => onView(mod)}>
          <h3 className="font-orbitron text-[0.9rem] font-bold text-text-primary leading-snug group-hover:text-cyan transition-colors line-clamp-1">
            {mod.title}
          </h3>
          <p className="text-[0.76rem] text-steel leading-[1.65] line-clamp-2 min-h-[2.4em]">
            {mod.description || 'No description provided.'}
          </p>
        </div>

        {/* Meta chips */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-[0.65rem] text-text-muted">
            <User size={10} className="shrink-0" />
            <span className="truncate max-w-[100px]">{mod.creatorId?.name ?? '—'}</span>
          </div>
          <div className="w-px h-3 bg-[rgba(143,163,184,0.18)]" />
          <div className="flex items-center gap-1.5 text-[0.65rem] text-text-muted">
            <Calendar size={10} className="shrink-0" />
            <span>{new Date(mod.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1 border-t border-[rgba(143,163,184,0.08)]">
          <button
            onClick={() => onView(mod)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[0.73rem] font-semibold text-cyan border border-[rgba(0,212,255,0.22)] bg-[rgba(0,212,255,0.05)] transition-all hover:border-[rgba(0,212,255,0.45)] hover:bg-[rgba(0,212,255,0.1)] hover:shadow-glow-sm"
          >
            <Layers size={12} /> View
          </button>
          <button
            onClick={() => onEdit(mod)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[0.73rem] font-semibold text-steel border border-[rgba(143,163,184,0.16)] bg-transparent transition-all hover:border-[rgba(0,212,255,0.3)] hover:text-text-primary hover:bg-[rgba(0,212,255,0.04)]"
          >
            <Pencil size={11} /> Edit
          </button>
          <button
            onClick={() => onDelete(mod)}
            title="Delete module"
            className="w-[38px] h-[38px] flex items-center justify-center rounded-lg text-copper border border-[rgba(200,121,65,0.22)] bg-[rgba(200,121,65,0.04)] transition-all hover:border-[rgba(200,121,65,0.5)] hover:bg-[rgba(200,121,65,0.1)]"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════ */
export default function ModulesPage() {
  const navigate = useNavigate()

  const { data, isLoading, isError } = useModules()
  const { mutateAsync: createModule, isPending: creating } = useCreateModule()
  const { mutateAsync: updateModule, isPending: updating } = useUpdateModule()
  const { mutateAsync: deleteModule, isPending: deleting } = useDeleteModule()

  const modules = data?.modules ?? []

  const [createOpen,   setCreateOpen]   = useState(false)
  const [editTarget,   setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form,         setForm]         = useState({ title: '', description: '', image: '' })
  const [editForm,     setEditForm]     = useState({ title: '', description: '', image: '' })

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    await createModule({ title: form.title, description: form.description, image: form.image })
    setForm({ title: '', description: '', image: '' })
    setCreateOpen(false)
  }

  const openEdit = (mod) => {
    setEditForm({ title: mod.title, description: mod.description || '', image: mod.image || '' })
    setEditTarget(mod)
  }
  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!editForm.title.trim()) return
    await updateModule({ id: editTarget._id, ...editForm })
    setEditTarget(null)
  }

  const handleDelete = async () => {
    await deleteModule(deleteTarget._id)
    setDeleteTarget(null)
  }

  /* ── Loading ── */
  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <Loader2 size={28} className="animate-spin text-cyan" />
      <span className="font-orbitron text-[0.58rem] font-bold tracking-[0.18em] uppercase text-text-muted">
        Loading modules…
      </span>
    </div>
  )

  /* ── Error ── */
  if (isError) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="w-14 h-14 rounded-2xl bg-[rgba(200,121,65,0.07)] border border-[rgba(200,121,65,0.18)] flex items-center justify-center">
        <AlertTriangle size={22} className="text-copper" />
      </div>
      <p className="text-[0.82rem] text-steel">Failed to load modules.</p>
      <button onClick={() => window.location.reload()} className="btn-ghost text-[0.72rem] py-[8px] px-[16px] mt-1">
        Retry
      </button>
    </div>
  )

  return (
    <div>
      <PageHeader
        title="Modules"
        subtitle={`${modules.length} module${modules.length !== 1 ? 's' : ''} · ${data?.pagination?.total ?? 0} total`}
        actions={
          <button className="btn-primary text-[0.72rem] py-[9px] px-[18px]" onClick={() => setCreateOpen(true)}>
            <Plus size={13} /> New Module
          </button>
        }
      />

      {/* ── Grid / empty ── */}
      {modules.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-text-muted">
          <Layers size={40} className="text-[rgba(0,212,255,0.15)]" />
          <p className="text-[0.85rem]">No modules yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {modules.map((mod) => (
            <ModuleCard
              key={mod._id}
              mod={mod}
              onView={(m) => navigate(`/dashboard/modules/${m._id}`)}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* ── Create Modal ── */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Module">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block mb-1.5 text-[0.75rem] font-semibold text-steel">Module Title *</label>
            <input
              type="text"
              placeholder="e.g. T-Shirt Quality Check"
              className="input-glass"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block mb-1.5 text-[0.75rem] font-semibold text-steel">Description</label>
            <textarea
              rows={3}
              placeholder="Describe the inspection purpose..."
              className="input-glass resize-none"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <ImagePicker value={form.image} onChange={(url) => setForm({ ...form, image: url })} />
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-ghost flex-1 justify-center" onClick={() => setCreateOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={creating || !form.title.trim()}>
              {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              {creating ? 'Creating…' : 'Create Module'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title={`Update — ${editTarget?.title}`}>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block mb-1.5 text-[0.75rem] font-semibold text-steel">Module Title *</label>
            <input
              type="text"
              className="input-glass"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block mb-1.5 text-[0.75rem] font-semibold text-steel">Description</label>
            <textarea
              rows={3}
              className="input-glass resize-none"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            />
          </div>
          <ImagePicker value={editForm.image} onChange={(url) => setEditForm({ ...editForm, image: url })} />
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-ghost flex-1 justify-center" onClick={() => setEditTarget(null)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={updating || !editForm.title.trim()}>
              {updating ? <Loader2 size={14} className="animate-spin" /> : <Pencil size={14} />}
              {updating ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Module" size="sm">
        <div className="space-y-4">
          <p className="text-[0.85rem] text-steel leading-[1.6]">
            Are you sure you want to delete{' '}
            <span className="text-text-primary font-semibold">{deleteTarget?.title}</span>?
            The module will be soft-deleted and hidden from the list.
          </p>
          <div className="flex gap-3 pt-1">
            <button className="btn-ghost flex-1 justify-center" onClick={() => setDeleteTarget(null)}>
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 flex items-center justify-center gap-2 py-[11px] px-6 rounded bg-[rgba(200,121,65,0.1)] border border-[rgba(200,121,65,0.38)] text-copper font-orbitron text-xs font-bold tracking-[0.08em] uppercase transition-all hover:bg-[rgba(200,121,65,0.18)] disabled:opacity-50"
            >
              {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              {deleting ? 'Deleting…' : 'Delete Module'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
