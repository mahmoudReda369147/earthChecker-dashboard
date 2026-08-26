import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

function formatDisplay(dateStr) {
  if (!dateStr) return null
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${SHORT_MONTHS[m - 1]} ${d}, ${y}`
}

function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default function DatePicker({
  value = '',
  onChange,
  placeholder = 'Select date',
  disabled = false,
  className = '',
}) {
  const today = new Date()
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate())

  const initYear = value ? Number(value.split('-')[0]) : today.getFullYear()
  const initMonth = value ? Number(value.split('-')[1]) - 1 : today.getMonth()

  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState(initYear)
  const [viewMonth, setViewMonth] = useState(initMonth)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  const triggerRef = useRef(null)
  const panelRef = useRef(null)

  // Sync view when value changes externally
  useEffect(() => {
    if (value) {
      const [y, m] = value.split('-').map(Number)
      setViewYear(y)
      setViewMonth(m - 1)
    }
  }, [value])

  // Position the dropdown
  const updatePos = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const panelHeight = 340
    const spaceBelow = window.innerHeight - rect.bottom
    const top = spaceBelow >= panelHeight
      ? rect.bottom + 6
      : rect.top - panelHeight - 6
    setPos({ top, left: rect.left })
  }, [])

  useEffect(() => {
    if (!open) return
    updatePos()
  }, [open, viewMonth, viewYear, updatePos])

  // Reposition on scroll/resize
  useEffect(() => {
    if (!open) return
    const handler = () => updatePos()
    window.addEventListener('scroll', handler, true)
    window.addEventListener('resize', handler)
    return () => {
      window.removeEventListener('scroll', handler, true)
      window.removeEventListener('resize', handler)
    }
  }, [open, updatePos])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function prevMonth() {
    setViewMonth((m) => {
      if (m === 0) { setViewYear((y) => y - 1); return 11 }
      return m - 1
    })
  }

  function nextMonth() {
    setViewMonth((m) => {
      if (m === 11) { setViewYear((y) => y + 1); return 0 }
      return m + 1
    })
  }

  function selectDate(day) {
    const dateStr = toDateStr(viewYear, viewMonth, day)
    onChange?.(dateStr)
    setOpen(false)
  }

  // Build calendar grid
  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)
  const prevMonthDays = getDaysInMonth(
    viewMonth === 0 ? viewYear - 1 : viewYear,
    viewMonth === 0 ? 11 : viewMonth - 1,
  )

  const cells = []
  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, current: false })
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true })
  }
  // Next month leading days
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, current: false })
  }

  const displayText = formatDisplay(value)

  return (
    <>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`
          flex items-center gap-2.5 w-full px-4 py-2.5
          bg-[rgba(255,255,255,0.03)] backdrop-blur-sm
          border border-[rgba(143,163,184,0.2)]
          rounded-xl text-sm text-left
          transition-all duration-300 ease-out
          hover:border-[rgba(0,212,255,0.35)] hover:shadow-[0_0_20px_rgba(0,212,255,0.06)]
          focus:outline-none focus:border-[rgba(0,212,255,0.5)] focus:shadow-[0_0_24px_rgba(0,212,255,0.1)]
          disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[rgba(143,163,184,0.2)]
          ${open ? 'border-[rgba(0,212,255,0.5)] shadow-[0_0_24px_rgba(0,212,255,0.1)]' : ''}
          ${className}
        `}
      >
        <Calendar size={16} className="text-steel shrink-0" />
        <span className={displayText ? 'text-text-primary' : 'text-text-muted'}>
          {displayText || placeholder}
        </span>
      </button>

      {/* Calendar portal */}
      {open && createPortal(
        <div
          ref={panelRef}
          className="fixed z-[9999] animate-fade-in-up"
          style={{
            top: pos.top,
            left: pos.left,
            minWidth: 296,
          }}
        >
          <div
            className="
              rounded-2xl overflow-hidden
              bg-[rgba(8,12,20,0.98)] backdrop-blur-2xl
              border border-[rgba(0,212,255,0.12)]
              shadow-[0_24px_64px_rgba(0,0,0,0.7),0_0_48px_rgba(0,212,255,0.06)]
            "
          >
            {/* Month / Year header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(143,163,184,0.1)]">
              <button
                type="button"
                onClick={prevMonth}
                className="
                  w-8 h-8 rounded-lg flex items-center justify-center
                  text-steel transition-all duration-200
                  hover:bg-[rgba(255,255,255,0.06)] hover:text-[#00d4ff]
                "
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-orbitron text-[0.8rem] font-bold text-text-primary tracking-[0.06em] select-none">
                {MONTHS[viewMonth]} {viewYear}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="
                  w-8 h-8 rounded-lg flex items-center justify-center
                  text-steel transition-all duration-200
                  hover:bg-[rgba(255,255,255,0.06)] hover:text-[#00d4ff]
                "
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 px-3 pt-3 pb-1">
              {DAYS.map((d) => (
                <div
                  key={d}
                  className="text-center text-[0.65rem] font-semibold text-text-muted uppercase tracking-wider py-1 select-none"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-0.5 px-3 pb-3">
              {cells.map((cell, idx) => {
                const dateStr = cell.current
                  ? toDateStr(viewYear, viewMonth, cell.day)
                  : null
                const isSelected = cell.current && dateStr === value
                const isToday = cell.current && dateStr === todayStr

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={!cell.current}
                    onClick={() => cell.current && selectDate(cell.day)}
                    className={`
                      relative w-9 h-9 rounded-lg text-[0.8rem]
                      flex items-center justify-center
                      transition-all duration-200 ease-out
                      ${!cell.current
                        ? 'text-[rgba(143,163,184,0.2)] cursor-default'
                        : isSelected
                          ? 'bg-[rgba(0,212,255,0.2)] text-[#00d4ff] font-bold shadow-[0_0_16px_rgba(0,212,255,0.15)]'
                          : 'text-text-primary hover:bg-[rgba(255,255,255,0.06)] cursor-pointer'
                      }
                      ${isToday && !isSelected
                        ? 'ring-1 ring-[rgba(200,121,65,0.5)] text-[#c87941]'
                        : ''
                      }
                    `}
                  >
                    {cell.day}
                    {isSelected && (
                      <span className="absolute inset-0 rounded-lg ring-1 ring-[rgba(0,212,255,0.5)] pointer-events-none" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
