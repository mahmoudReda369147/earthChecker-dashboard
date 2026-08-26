import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Download, Eye, Loader2, FileText, User, Calendar } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import DataTable  from '../../../components/ui/DataTable'
import { useSubmissions } from '../apiHooks'

const PER_PAGE = 10

const COLUMNS = [
  { key: '_index',      label: '#',          align: 'right',  width: 52  },
  { key: 'form',        label: 'Form',       align: 'left'               },
  { key: 'module',      label: 'Module',     align: 'left'               },
  { key: 'cycle',       label: 'Cycle',      align: 'left'               },
  { key: 'submittedBy', label: 'Submitted By', align: 'left'             },
  { key: 'answers',     label: 'Answers',    align: 'center', width: 80  },
  { key: 'date',        label: 'Date',       align: 'left'               },
  { key: 'actions',     label: 'Actions',    align: 'center', width: 60  },
]

export default function SubmissionsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage]     = useState(1)

  const { data, isLoading } = useSubmissions({
    page,
    limit: PER_PAGE,
    search,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  const submissions = data?.data?.submissions ?? []
  const pagination  = data?.data?.pagination  ?? {}

  const renderCell = (key, row, rowIndex) => {
    const globalIndex = ((pagination.page ?? page) - 1) * PER_PAGE + rowIndex + 1
    switch (key) {
      case '_index':
        return <span className="text-[0.82rem] font-semibold text-text-muted">#{globalIndex}</span>

      case 'form':
        return (
          <div className="flex items-center gap-2 min-w-0">
            <FileText size={13} className="text-cyan shrink-0" />
            <span className="text-[0.82rem] text-text-primary truncate">{row.formId?.name ?? '—'}</span>
          </div>
        )

      case 'module':
        return <span className="text-[0.78rem] text-steel truncate">{row.moduleId?.title ?? row.moduleId?.name ?? '—'}</span>

      case 'cycle':
        return (
          <span className="font-orbitron text-[0.65rem] text-copper tracking-[0.04em]">
            {row.cycleId?.name ?? '—'}
          </span>
        )

      case 'submittedBy':
        return (
          <div className="flex items-center gap-2 min-w-0">
            {row.submittedBy?.image ? (
              <img src={row.submittedBy.image} alt="" className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)] flex items-center justify-center">
                <User size={10} className="text-cyan" />
              </div>
            )}
            <span className="text-[0.78rem] text-text-primary truncate">{row.submittedBy?.name ?? '—'}</span>
          </div>
        )

      case 'answers':
        return (
          <span className="text-[0.75rem] font-semibold text-text-muted">
            {row.answers?.length ?? 0}
          </span>
        )

      case 'date':
        return (
          <span className="flex items-center gap-1.5 text-[0.72rem] text-text-muted whitespace-nowrap">
            <Calendar size={10} />
            {new Date(row.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        )

      case 'actions':
        return (
          <button
            title="View Analyses"
            onClick={() => navigate(`/dashboard/submissions/${row._id}/analyses`)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[rgba(0,212,255,0.2)] text-cyan bg-[rgba(0,212,255,0.04)] hover:bg-[rgba(0,212,255,0.12)] hover:border-[rgba(0,212,255,0.45)] transition-all duration-150"
          >
            <Eye size={13} strokeWidth={2} />
          </button>
        )

      default:
        return null
    }
  }

  return (
    <div>
      <PageHeader
        title="Submissions"
        subtitle="All form submissions across your cycles"
        badge={`${pagination.total ?? 0} Records`}
      />

      {/* Search */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative">
          <Search size={13} stroke="#3d4f63" strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by form name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="input-glass w-[260px] text-[0.8rem] py-2 pl-[34px] pr-3"
          />
        </div>
        <span className="ml-auto text-[0.72rem] text-text-muted">
          {pagination.total ?? 0} total records
        </span>
      </div>

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
          onPageChange={setPage}
          entityLabel="submissions"
          emptyMessage="No submissions found."
        />
      )}
    </div>
  )
}
