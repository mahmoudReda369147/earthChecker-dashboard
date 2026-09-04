import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Layers,
  FileText,
  Bot,
  Users,
  RefreshCw,
  ClipboardCheck,
  Settings,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useMe } from "../../features/auth/apiHooks";

const NAV_ITEMS = [
  { label: "Overview", path: "/dashboard/overview", icon: LayoutDashboard },
  { label: "Modules", path: "/dashboard/modules", icon: Layers },
  // { label: 'Forms',       path: '/dashboard/forms',       icon: FileText        },
  { label: "AI Agents", path: "/dashboard/agents", icon: Bot },
  { label: "Staff", path: "/dashboard/staff", icon: Users },
  { label: "Cycles", path: "/dashboard/cycles", icon: RefreshCw },
  {
    label: "Submissions",
    path: "/dashboard/submissions",
    icon: ClipboardCheck,
  },
  { label: "Settings", path: "/dashboard/settings", icon: Settings, ceoOnly: true },
];

/* ─── Grid SVG as data URL ──────────────────────────────────────────────── */
const GRID_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Cpath d='M 32 0 L 0 0 0 32' fill='none' stroke='rgba(0,212,255,0.052)' stroke-width='0.5'/%3E%3C/svg%3E")`;

export default function Sidebar({ collapsed, onToggle }) {
  const { data: me } = useMe();
  const filteredNavItems = NAV_ITEMS.filter(
    (item) => !item.ceoOnly || me?.role === "ceo"
  );
  return (
    <aside
      className="fixed top-0 left-0 h-screen z-[40] flex flex-col transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden"
      style={{ width: collapsed ? 64 : 256 }}
    >
      {/* ── Layer 1: Base gradient ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #06080e 0%, #07091a 40%, #060c18 100%)",
        }}
      />

      {/* ── Layer 2: Grid mesh ── */}
      <div
        className="absolute inset-0 opacity-100"
        style={{
          backgroundImage: GRID_BG,
          backgroundSize: "32px 32px",
        }}
      />

      {/* ── Layer 3: Radial ambient glow — bottom centre ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[300px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 140% 60% at 50% 100%, rgba(0,212,255,0.065) 0%, transparent 70%)",
        }}
      />

      {/* ── Layer 4: Radial ambient glow — top ── */}
      <div
        className="absolute top-0 left-0 right-0 h-[120px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 50% 0%, rgba(0,212,255,0.035) 0%, transparent 100%)",
        }}
      />

      {/* ── Layer 5: Animated scan sweep line ── */}
      <div
        className="absolute left-0 right-0 h-[1px] pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(0,212,255,0.4) 40%, rgba(0,212,255,0.65) 50%, rgba(0,212,255,0.4) 60%, transparent 100%)",
          boxShadow:
            "0 0 6px rgba(0,212,255,0.38), 0 0 12px rgba(0,212,255,0.18)",
          animation: "scanSweep 7s linear infinite",
        }}
      />

      {/* ── Layer 6: Right border glow ── */}
      <div
        className="absolute top-0 right-0 w-px h-full pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(0,212,255,0.18) 30%, rgba(0,212,255,0.30) 50%, rgba(0,212,255,0.18) 70%, transparent 100%)",
          boxShadow: "0 0 8px rgba(0,212,255,0.10)",
        }}
      />

      {/* ── Layer 7: Content ── */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Logo row */}
        <div
          className="flex items-center gap-3 px-4 h-16 shrink-0 overflow-hidden"
          style={{ borderBottom: "1px solid rgba(0,212,255,0.08)" }}
        >
          {!collapsed ? (
            <img
              src="/logo_1.svg"
              alt="Logo"
              className="h-11 w-auto shrink-0 object-contain"
              style={{ filter: "drop-shadow(0 0 10px rgba(0,212,255,0.5))" }}
            />
          ) : (
            <img
              src="/logo.svg"
              alt="Logo"
              className="h-11 w-auto shrink-0 object-contain"
              style={{ filter: "drop-shadow(0 0 10px rgba(0,212,255,0.5))" }}
            />
          )}
          {!collapsed && (
            <span className="font-orbitron text-[0.75rem] font-black tracking-[0.16em] uppercase whitespace-nowrap bg-gradient-to-r from-cyan to-cyan-dark bg-clip-text text-transparent" />
          )}
          <button
            onClick={onToggle}
            title={collapsed ? "Expand" : "Collapse"}
            className="ml-auto shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-text-muted transition-all duration-200 hover:text-cyan hover:bg-[rgba(0,212,255,0.08)]"
          >
            {collapsed ? (
              <ChevronRight size={13} strokeWidth={2.2} />
            ) : (
              <ChevronLeft size={13} strokeWidth={2.2} />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 overflow-y-auto overflow-x-hidden py-4 [scrollbar-width:none]"
          style={{ padding: collapsed ? "16px 8px" : "16px 10px" }}
        >
          {!collapsed && (
            <div className="flex items-center gap-2 px-2 mb-3">
              <div
                className="h-px flex-1"
                style={{ background: "rgba(0,212,255,0.1)" }}
              />
              <p className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-text-muted font-orbitron shrink-0">
                Menu
              </p>
              <div
                className="h-px flex-1"
                style={{ background: "rgba(0,212,255,0.1)" }}
              />
            </div>
          )}

          <ul className="list-none flex flex-col gap-[3px]">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `group relative flex items-center rounded-lg transition-all duration-200 no-underline cursor-pointer overflow-hidden ${
                        collapsed
                          ? "w-10 h-10 justify-center mx-auto"
                          : "gap-3 px-3 py-[10px]"
                      } ${isActive ? "text-cyan" : "text-[#526070] hover:text-[#9ab0be]"}`
                    }
                    style={({ isActive }) =>
                      isActive
                        ? {
                            background:
                              "linear-gradient(90deg, rgba(0,212,255,0.12) 0%, rgba(0,212,255,0.03) 100%)",
                            border: "1px solid rgba(0,212,255,0.18)",
                            boxShadow:
                              "inset 0 1px 0 rgba(0,212,255,0.08), 0 0 20px rgba(0,212,255,0.04)",
                          }
                        : {
                            background: "transparent",
                            border: "1px solid transparent",
                          }
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {/* Hover fill */}
                        {!isActive && (
                          <span
                            className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            style={{ background: "rgba(0,212,255,0.04)" }}
                          />
                        )}

                        {/* Left accent bar */}
                        {isActive && !collapsed && (
                          <span
                            className="absolute left-0 top-[18%] bottom-[18%] w-[3px] rounded-r-full"
                            style={{
                              background:
                                "linear-gradient(180deg, rgba(0,212,255,0.3), #00d4ff, rgba(0,212,255,0.3))",
                              boxShadow:
                                "0 0 8px rgba(0,212,255,0.8), 0 0 20px rgba(0,212,255,0.35)",
                            }}
                          />
                        )}

                        {/* Collapsed active indicator */}
                        {isActive && collapsed && (
                          <span
                            className="absolute top-0 left-0 right-0 h-[2px] rounded-b-full"
                            style={{
                              background:
                                "linear-gradient(90deg, transparent, #00d4ff, transparent)",
                              boxShadow: "0 0 6px rgba(0,212,255,0.7)",
                            }}
                          />
                        )}

                        {/* Icon */}
                        <span
                          className={`relative shrink-0 transition-all duration-200 ${collapsed ? "" : "ml-1"}`}
                          style={
                            isActive
                              ? {
                                  color: "#00d4ff",
                                  filter:
                                    "drop-shadow(0 0 6px rgba(0,212,255,0.7))",
                                }
                              : {}
                          }
                        >
                          <Icon size={16} strokeWidth={1.8} />
                        </span>

                        {/* Label */}
                        {!collapsed && (
                          <span
                            className={`relative text-[0.84rem] leading-none flex-1 ${isActive ? "font-semibold" : "font-medium"}`}
                          >
                            {item.label}
                          </span>
                        )}

                        {/* Active pulse dot */}
                        {!collapsed && isActive && (
                          <span
                            className="relative w-[5px] h-[5px] rounded-full shrink-0 animate-dot-pulse"
                            style={{
                              background: "#00d4ff",
                              boxShadow: "0 0 8px rgba(0,212,255,0.9)",
                            }}
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div
          className={`shrink-0 ${collapsed ? "px-2 py-3" : "px-3 py-3"}`}
          style={{ borderTop: "1px solid rgba(0,212,255,0.08)" }}
        >
          {collapsed ? (
            <div
              className="w-[8px] h-[8px] rounded-full mx-auto animate-dot-pulse"
              style={{
                background: "#00d4ff",
                boxShadow: "0 0 8px rgba(0,212,255,0.9)",
              }}
            />
          ) : (
            <div
              className="px-3 py-2.5 rounded-lg relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, rgba(200,121,65,0.08) 0%, rgba(200,121,65,0.02) 100%)",
                border: "1px solid rgba(200,121,65,0.16)",
              }}
            >
              <div className="flex items-center gap-2 mb-[3px]">
                <span
                  className="w-[7px] h-[7px] rounded-full shrink-0 animate-dot-pulse"
                  style={{
                    background: "#c87941",
                    boxShadow: "0 0 6px rgba(200,121,65,0.8)",
                  }}
                />
                <p className="font-orbitron text-[0.57rem] font-bold tracking-[0.15em] uppercase text-copper">
                  AI Engine
                </p>
              </div>
              <p className="text-[0.72rem] text-steel leading-none">
                Ready · 3 agents active
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
