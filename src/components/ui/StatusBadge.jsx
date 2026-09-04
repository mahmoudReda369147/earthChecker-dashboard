const STATUS_MAP = {
  // Cycle statuses (Exact parity with CyclesPage)
  new:              { label: 'New',              color: '#8fa3b8', bg: 'rgba(143,163,184,0.08)', border: 'rgba(143,163,184,0.2)'  },
  inprogress:       { label: 'In Progress',      color: '#00d4ff', bg: 'rgba(0,212,255,0.08)',   border: 'rgba(0,212,255,0.22)'   },
  paused:           { label: 'Paused',           color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.22)'  },
  cancelledrequest: { label: 'Cancel Requested', color: '#f97316', bg: 'rgba(249,115,22,0.09)',  border: 'rgba(249,115,22,0.28)'  },
  cancelled:        { label: 'Cancelled',        color: '#ef4444', bg: 'rgba(239,68,68,0.06)',   border: 'rgba(239,68,68,0.18)'   },
  completed:        { label: 'Completed',        color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.22)'  },
  complete:         { label: 'Completed',        color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.22)'  },

  // General fallback statuses
  accepted:   { label: 'Accepted',   color: '#00d4ff', bg: 'rgba(0,212,255,0.08)',   border: 'rgba(0,212,255,0.22)'  },
  rejected:   { label: 'Rejected',   color: '#c87941', bg: 'rgba(200,121,65,0.08)',  border: 'rgba(200,121,65,0.22)'  },
  pending:    { label: 'Pending',    color: '#8fa3b8', bg: 'rgba(143,163,184,0.08)', border: 'rgba(143,163,184,0.2)'  },
  processing: { label: 'Processing', color: '#00d4ff', bg: 'rgba(0,212,255,0.08)',   border: 'rgba(0,212,255,0.22)'  },
  draft:      { label: 'Draft',      color: '#3d4f63', bg: 'rgba(143,163,184,0.05)', border: 'rgba(143,163,184,0.12)' },
  active:     { label: 'Active',     color: '#00d4ff', bg: 'rgba(0,212,255,0.08)',   border: 'rgba(0,212,255,0.22)'  },
  inactive:   { label: 'Inactive',   color: '#3d4f63', bg: 'rgba(143,163,184,0.05)', border: 'rgba(143,163,184,0.12)' },
}

export default function StatusBadge({ status }) {
  const normalizedKey = status?.toString().toLowerCase().replace(/[\s_-]/g, '') || ''
  const s = STATUS_MAP[normalizedKey] || STATUS_MAP[status?.toString().toLowerCase()] || STATUS_MAP.new
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded text-[0.67rem] font-bold border whitespace-nowrap"
      style={{ color: s.color, background: s.bg, borderColor: s.border }}
    >
      {s.label}
    </span>
  )
}
