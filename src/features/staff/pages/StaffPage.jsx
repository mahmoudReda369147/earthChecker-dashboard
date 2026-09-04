import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Loader2, AlertTriangle, Plus, Pencil, Trash2,
  UserCheck, UserX, Search, Users,
} from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import Modal      from '../../../components/ui/Modal'
import DataTable  from '../../../components/ui/DataTable'
import StaffFilters from '../components/StaffFilters'
import { useMe }  from '../../auth/apiHooks'
import { useStaff, useUpdateStaff, useDeleteStaff } from '../apiHooks'

const ROLE_RANK = { ceo: 3, supervisor: 2, worker: 1 }

const ROLE_STYLE = {
  ceo:        { label: 'CEO',        className: 'bg-[rgba(0,212,255,0.08)] text-cyan border-[rgba(0,212,255,0.22)]' },
  supervisor: { label: 'Supervisor', className: 'bg-[rgba(200,121,65,0.09)] text-copper border-[rgba(200,121,65,0.25)]' },
  worker:     { label: 'Worker',     className: 'bg-[rgba(143,163,184,0.08)] text-steel border-[rgba(143,163,184,0.2)]' },
}

const COLUMNS = [
  { key: 'name',      label: 'Name'       },
  { key: 'email',     label: 'Email'      },
  { key: 'role',      label: 'Role',      align: 'center', width: '120px' },
  { key: 'status',    label: 'Status',    align: 'center', width: '110px' },
  { key: 'createdBy', label: 'Added By',  width: '140px'  },
  { key: 'createdAt', label: 'Date',      width: '110px'  },
  { key: 'actions',   label: 'Actions',   align: 'right',  width: '110px' },
]

const PER_PAGE = 10

/* Avatar: shows image if available, else initials */
function Avatar({ name, image }) {
  const parts    = (name || '?').trim().split(' ')
  const initials = ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className="w-8 h-8 rounded-full object-cover shrink-0 border border-[rgba(0,212,255,0.18)]"
      />
    )
  }
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-orbitron text-[0.62rem] font-bold text-cyan bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.18)]">
      {initials}
    </div>
  )
}

export default function StaffPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const { data: me } = useMe()
  const myRank       = ROLE_RANK[me?.role] ?? 0
  const canManage    = me?.role === 'ceo' || me?.role === 'supervisor'

  /* Filter States synced with URL Query Params */
  const search          = searchParams.get('search') || ''
  const roleFilter      = searchParams.get('role') || ''
  const statusFilter    = searchParams.get('status') || ''
  const createdByFilter = searchParams.get('createdBy') || ''
  const fromDate        = searchParams.get('fromDate') || ''
  const toDate          = searchParams.get('toDate') || ''
  const page            = parseInt(searchParams.get('page') || '1', 10)

  const updateParam = (key, value, resetPage = true) => {
    const nextParams = new URLSearchParams(searchParams)
    if (value) {
      nextParams.set(key, value)
    } else {
      nextParams.delete(key)
    }
    if (resetPage && key !== 'page') {
      nextParams.delete('page')
    }
    setSearchParams(nextParams, { replace: true })
  }

  const handleDateRangeChange = (newFrom, newTo) => {
    const nextParams = new URLSearchParams(searchParams)
    if (newFrom) {
      nextParams.set("fromDate", newFrom)
    } else {
      nextParams.delete("fromDate")
    }
    if (newTo) {
      nextParams.set("toDate", newTo)
    } else {
      nextParams.delete("toDate")
    }
    nextParams.delete("page")
    setSearchParams(nextParams, { replace: true })
  }

  /* Fetch all staff for creator dropdown options */
  const { data: allStaffData } = useStaff({ limit: 200, includeSelf: true })
  const allStaffList = allStaffData?.staff ?? []
  
  const creatorMap = new Map()
  allStaffList.forEach((s) => {
    if (s.createdBy) {
      const cId   = s.createdBy._id ? s.createdBy._id.toString() : s.createdBy.toString()
      const cName = s.createdBy.name ?? 'Creator'
      if (!creatorMap.has(cId)) {
        creatorMap.set(cId, { value: cId, label: cName })
      }
    }
  })
  const addedByOptions = [
    { value: '', label: 'All Creators' },
    ...Array.from(creatorMap.values()),
  ]

  const { data, isLoading, isError } = useStaff({
    page,
    limit: PER_PAGE,
    search,
    role: roleFilter,
    status: statusFilter,
    createdBy: createdByFilter,
    fromDate,
    toDate,
  })

  const { mutateAsync: updateStaff, isPending: updating } = useUpdateStaff()
  const { mutateAsync: deleteStaff, isPending: deleting } = useDeleteStaff()

  const staff = data?.staff ?? []
  const total = data?.pagination?.total ?? 0

  const [deactivateTarget, setDeactivateTarget] = useState(null)   // confirm modal
  const [reactivateTarget, setReactivateTarget] = useState(null)

  const handleDeactivate = async () => {
    await deleteStaff(deactivateTarget._id)
    setDeactivateTarget(null)
  }

  const handleReactivate = async () => {
    await updateStaff({ id: reactivateTarget._id, isActive: true })
    setReactivateTarget(null)
  }

  const canActOn = (member) => ROLE_RANK[member.role] <= myRank

  const renderCell = (key, member) => {
    switch (key) {
      case 'name':
        return (
          <div className="flex items-center gap-3">
            <Avatar name={member.name} image={member.image} />
            <span className="text-[0.82rem] font-semibold text-text-primary">{member.name}</span>
          </div>
        )
      case 'email':
        return <span className="text-[0.78rem] text-steel">{member.email}</span>
      case 'role': {
        const s = ROLE_STYLE[member.role] ?? ROLE_STYLE.worker
        return (
          <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded text-[0.67rem] font-bold border ${s.className}`}>
            {s.label}
          </span>
        )
      }
      case 'status':
        return member.isActive ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[0.67rem] font-bold bg-[rgba(0,200,100,0.08)] text-emerald-400 border border-[rgba(0,200,100,0.2)]">
            <UserCheck size={10} /> Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[0.67rem] font-bold bg-[rgba(200,121,65,0.08)] text-copper border border-[rgba(200,121,65,0.2)]">
            <UserX size={10} /> Inactive
          </span>
        )
      case 'createdBy':
        return <span className="text-[0.78rem] text-steel">{member.createdBy?.name ?? '—'}</span>
      case 'createdAt':
        return <span className="text-[0.75rem] text-text-muted">{new Date(member.createdAt).toLocaleDateString()}</span>
      case 'actions':
        if (!canManage || !canActOn(member)) return null
        return (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => navigate(`/dashboard/staff/${member._id}/edit`)}
              title="Edit"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-steel border border-[rgba(143,163,184,0.15)] hover:border-[rgba(0,212,255,0.35)] hover:text-cyan transition-all"
            >
              <Pencil size={13} />
            </button>
            {member.isActive ? (
              <button
                onClick={() => setDeactivateTarget(member)}
                title="Deactivate"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-copper border border-[rgba(200,121,65,0.2)] hover:border-[rgba(200,121,65,0.5)] hover:bg-[rgba(200,121,65,0.08)] transition-all"
              >
                <Trash2 size={13} />
              </button>
            ) : (
              <button
                onClick={() => setReactivateTarget(member)}
                title="Reactivate"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-400 border border-[rgba(0,200,100,0.2)] hover:border-[rgba(0,200,100,0.5)] hover:bg-[rgba(0,200,100,0.06)] transition-all"
              >
                <UserCheck size={13} />
              </button>
            )}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div>
      <PageHeader
        title="Staff"
        subtitle="Manage your organisation's team members"
        badge="People"
        actions={
          canManage && (
            <button
              className="btn-primary text-[0.72rem] py-[9px] px-[18px]"
              onClick={() => navigate('/dashboard/staff/create')}
            >
              <Plus size={13} /> Add Staff
            </button>
          )
        }
      />

      {/* High-End Staff Filters Section */}
      <StaffFilters
        search={search}
        onSearchChange={(val) => updateParam('search', val)}
        role={roleFilter}
        onRoleChange={(val) => updateParam('role', val)}
        status={statusFilter}
        onStatusChange={(val) => updateParam('status', val)}
        createdBy={createdByFilter}
        onCreatedByChange={(val) => updateParam('createdBy', val)}
        fromDate={fromDate}
        toDate={toDate}
        onDateRangeChange={handleDateRangeChange}
        addedByOptions={addedByOptions}
        hasActiveFilters={Boolean(
          search || roleFilter || statusFilter || createdByFilter || fromDate || toDate
        )}
        onClearAll={() => setSearchParams({}, { replace: true })}
        totalRecords={total}
        showingRecords={staff.length}
      />

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={24} className="animate-spin text-cyan" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center h-40 gap-3 text-copper">
          <AlertTriangle size={28} />
          <p className="text-[0.82rem]">Failed to load staff.</p>
        </div>
      ) : (
        <DataTable
          columns={COLUMNS}
          rows={staff}
          renderCell={renderCell}
          total={total}
          page={page}
          perPage={PER_PAGE}
          onPageChange={(p) => updateParam('page', p > 1 ? p.toString() : '', false)}
          emptyMessage="No staff members found."
          entityLabel="staff"
        />
      )}

      {/* Deactivate Modal */}
      <Modal open={!!deactivateTarget} onClose={() => setDeactivateTarget(null)} title="Deactivate Staff" size="sm">
        <div className="space-y-4">
          <p className="text-[0.85rem] text-steel leading-[1.6]">
            Are you sure you want to deactivate{' '}
            <span className="text-text-primary font-semibold">{deactivateTarget?.name}</span>?
            They will no longer be able to log in.
          </p>
          <div className="flex gap-3 pt-1">
            <button className="btn-ghost flex-1 justify-center" onClick={() => setDeactivateTarget(null)}>Cancel</button>
            <button
              onClick={handleDeactivate}
              disabled={deleting}
              className="flex-1 flex items-center justify-center gap-2 py-[11px] px-6 rounded bg-[rgba(200,121,65,0.12)] border border-[rgba(200,121,65,0.4)] text-copper font-orbitron text-xs font-bold tracking-[0.08em] uppercase transition-all hover:bg-[rgba(200,121,65,0.2)] disabled:opacity-50"
            >
              {deleting ? <Loader2 size={13} className="animate-spin" /> : <UserX size={13} />}
              {deleting ? 'Processing…' : 'Deactivate'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Reactivate Modal */}
      <Modal open={!!reactivateTarget} onClose={() => setReactivateTarget(null)} title="Reactivate Staff" size="sm">
        <div className="space-y-4">
          <p className="text-[0.85rem] text-steel leading-[1.6]">
            Reactivate{' '}
            <span className="text-text-primary font-semibold">{reactivateTarget?.name}</span>?
            They will be able to log in again.
          </p>
          <div className="flex gap-3 pt-1">
            <button className="btn-ghost flex-1 justify-center" onClick={() => setReactivateTarget(null)}>Cancel</button>
            <button
              onClick={handleReactivate}
              disabled={updating}
              className="flex-1 flex items-center justify-center gap-2 py-[11px] px-6 rounded bg-[rgba(0,200,100,0.08)] border border-[rgba(0,200,100,0.35)] text-emerald-400 font-orbitron text-xs font-bold tracking-[0.08em] uppercase transition-all hover:bg-[rgba(0,200,100,0.14)] disabled:opacity-50"
            >
              {updating ? <Loader2 size={13} className="animate-spin" /> : <UserCheck size={13} />}
              {updating ? 'Processing…' : 'Reactivate'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
