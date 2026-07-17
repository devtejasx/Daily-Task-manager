import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Swords,
  CalendarDays,
  Trophy,
  Settings,
  Hexagon,
} from "lucide-react";

export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "missions", label: "Missions", icon: Swords },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "achievements", label: "Achievements", icon: Trophy },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ view, setView }) {
  return (
    <motion.aside
      className="fixed z-40 bottom-0 inset-x-0 lg:inset-x-auto lg:top-0 lg:left-0 lg:h-full lg:w-[92px] xl:w-60
        glass border-t lg:border-t-0 lg:border-r border-violet-500/15 flex lg:flex-col"
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* emblem */}
      <div className="hidden lg:flex items-center gap-3 px-5 xl:px-6 h-20 border-b border-violet-500/15">
        <div className="relative">
          <Hexagon size={30} className="text-violet-400" style={{ filter: "drop-shadow(0 0 8px rgba(124,58,237,0.8))" }} />
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-display font-black text-cyan-300">
            A
          </span>
        </div>
        <div className="hidden xl:block">
          <p className="font-display font-black text-sm tracking-[0.2em] text-slate-100">ARISE</p>
          <p className="text-[9px] tracking-[0.3em] text-violet-300/70 font-semibold">COMMAND CENTER</p>
        </div>
      </div>

      <nav className="flex-1 flex lg:flex-col justify-around lg:justify-start gap-1 p-2 lg:p-3 lg:mt-4">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = view === id;
          return (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`relative flex flex-col lg:flex-row items-center lg:gap-3 gap-1 px-3 py-2.5 lg:px-4 lg:py-3 rounded-xl
                transition-colors duration-300 group flex-1 lg:flex-none justify-center lg:justify-start
                ${active ? "text-cyan-200" : "text-slate-400 hover:text-violet-200"}`}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-xl neon-border bg-violet-600/15"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              {/* floating indicator */}
              {active && (
                <motion.span
                  layoutId="nav-dot"
                  className="absolute lg:left-0.5 lg:top-1/2 lg:-translate-y-1/2 top-0.5 left-1/2 -translate-x-1/2 lg:translate-x-0
                    w-1 h-1 lg:w-1 lg:h-6 rounded-full bg-cyan-300 animate-float-slow"
                  style={{ boxShadow: "0 0 10px #06b6d4, 0 0 20px #06b6d4" }}
                />
              )}
              <Icon
                size={20}
                className={`relative transition-all duration-300 ${
                  active
                    ? "drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]"
                    : "group-hover:drop-shadow-[0_0_8px_rgba(124,58,237,0.9)]"
                }`}
              />
              <span className="relative text-[10px] lg:hidden xl:block xl:text-sm font-semibold tracking-wide">
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="hidden xl:block px-6 pb-6 text-[10px] text-slate-500 tracking-widest">
        SYSTEM v0.1 · ONLINE
        <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse" />
      </div>
    </motion.aside>
  );
}
