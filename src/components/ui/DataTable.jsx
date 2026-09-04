import { ChevronLeft, ChevronRight } from 'lucide-react'

/* ─── DataTable ────────────────────────────────────────────────────────────
 *  Props
 *    columns     [{key, label, align?: 'left'|'center'|'right', width?}]
 *    rows        any[]
 *    renderCell  (colKey: string, row: any, rowIndex: number) => ReactNode
 *    total       total record count (for footer text)
 *    page        current page (1-indexed)
 *    perPage     rows per page
 *    onPageChange (page: number) => void
 *    emptyMessage optional empty-state text
 * ─────────────────────────────────────────────────────────────────────── */

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = [1]
  if (current > 3) pages.push('…')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i)
  if (current < total - 2) pages.push('…')
  pages.push(total)
  return pages
}

export default function DataTable({
  columns = [],
  rows = [],
  renderCell,
  total = 0,
  page = 1,
  perPage = 5,
  onPageChange,
  emptyMessage = 'No records found.',
  entityLabel = 'records',
  hideFooter = false,
  transparent = false,
}) {
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const from = Math.min((page - 1) * perPage + 1, total)
  const to   = Math.min(page * perPage, total)

  const alignClass = (a) =>
    a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left'

  return (
    <div className={transparent ? 'overflow-hidden' : 'rounded-xl overflow-hidden bg-[rgba(8,14,26,0.85)] backdrop-blur-lg border border-[rgba(143,163,184,0.1)] shadow-[0_8px_40px_rgba(0,0,0,0.45)]'}>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">

          {/* Header */}
          <thead>
            <tr className="border-b border-b-[rgba(0,212,255,0.12)]" style={{ background: 'linear-gradient(180deg, rgba(0,212,255,0.05) 0%, rgba(0,0,0,0.25) 100%)' }}>
              {columns.map((col, i) => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={`
                    px-5 py-4
                    font-orbitron text-[0.6rem] font-bold tracking-[0.14em] uppercase text-text-primary
                    whitespace-nowrap
                    ${i < columns.length - 1 ? 'border-r border-r-[rgba(143,163,184,0.1)]' : ''}
                    ${alignClass(col.align)}
                  `}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-12 text-center text-[0.85rem] text-text-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-b-[rgba(143,163,184,0.06)] hover:bg-[rgba(0,212,255,0.04)] transition-all duration-150 group"
                >
                  {columns.map((col, i) => (
                    <td
                      key={col.key}
                      style={col.width ? { width: col.width, minWidth: col.width } : undefined}
                      className={`px-5 py-4 whitespace-nowrap ${i < columns.length - 1 ? 'border-r border-r-[rgba(143,163,184,0.07)]' : ''} ${alignClass(col.align)}`}
                    >
                      {renderCell(col.key, row, rowIndex)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer ── */}
      {!hideFooter && <div className="flex items-center justify-between px-5 py-3.5 border-t border-t-[rgba(143,163,184,0.07)] bg-[rgba(255,255,255,0.015)]">
        {/* Count */}
        <p className="text-[0.75rem] text-text-muted">
          Showing{' '}
          <span className="text-text-primary font-semibold">{from}–{to}</span>
          {' '}of{' '}
          <span className="text-text-primary font-semibold">{total}</span>
          {' '}{entityLabel}
        </p>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            {/* Prev */}
            <button
              onClick={() => onPageChange?.(Math.max(1, page - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded border border-[rgba(143,163,184,0.12)] text-steel transition-all hover:border-[rgba(0,212,255,0.3)] hover:text-cyan disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={13} strokeWidth={2} />
            </button>

            {/* Page numbers */}
            {getPageNumbers(page, totalPages).map((p, i) =>
              p === '…' ? (
                <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-[0.72rem] text-text-muted">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange?.(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded text-[0.78rem] font-semibold transition-all ${
                    p === page
                      ? 'bg-cyan text-bg-primary shadow-[0_0_12px_rgba(0,212,255,0.35)]'
                      : 'border border-[rgba(143,163,184,0.12)] text-steel hover:border-[rgba(0,212,255,0.3)] hover:text-cyan'
                  }`}
                >
                  {p}
                </button>
              )
            )}

            {/* Next */}
            <button
              onClick={() => onPageChange?.(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded border border-[rgba(143,163,184,0.12)] text-steel transition-all hover:border-[rgba(0,212,255,0.3)] hover:text-cyan disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={13} strokeWidth={2} />
            </button>
          </div>
        )}
      </div>}
    </div>
  )
}
