export default function GlassPanel({ children, title, subtitle, icon: Icon, badge, action, className = '' }) {
  return (
    <div className={`relative rounded-2xl bg-[#060a14]/90 backdrop-blur-2xl border border-[rgba(0,212,255,0.12)] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col ${className}`}>
      <div className="h-[2px] bg-gradient-to-r from-cyan/80 via-blue-500/50 to-transparent" />
      {(title || action) && (
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-8 h-8 rounded-xl bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)] flex items-center justify-center text-cyan shadow-[0_0_10px_rgba(0,212,255,0.15)]">
                <Icon size={16} />
              </div>
            )}
            <div>
              <h3 className="font-orbitron text-sm font-bold text-text-primary tracking-wide flex items-center gap-2">
                {title}
                {badge && (
                  <span className="text-[0.62rem] font-orbitron px-2 py-0.5 rounded-full bg-cyan/10 border border-cyan/20 text-cyan">
                    {badge}
                  </span>
                )}
              </h3>
              {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action}
        </div>
      )}
      {children && <div className="p-5 flex-1">{children}</div>}
    </div>
  )
}
