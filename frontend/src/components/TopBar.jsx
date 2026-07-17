import { motion } from "framer-motion";
import { Search, Bell, Moon, Sun, UserCircle2, Flame } from "lucide-react";
import XPBar from "./XPBar";
import RankBadge from "./RankBadge";
import { useCountUp } from "../hooks/useCountUp";

export default function TopBar({ levelInfo, rank, streak, search, setSearch, dimmed, setDimmed, user }) {
  const xpInLevel = useCountUp(levelInfo.xpInLevel);
  const hunterName = (user?.displayName || user?.email?.split("@")[0] || "Hunter").toUpperCase();

  return (
    <motion.header
      className="sticky top-0 z-30 glass border-b border-violet-500/15 px-4 sm:px-6 py-3"
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center gap-3 sm:gap-5">
        {/* hunter profile */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0">
            <UserCircle2 size={34} className="text-violet-300" style={{ filter: "drop-shadow(0 0 8px rgba(124,58,237,0.7))" }} />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0b1120] shadow-[0_0_6px_#10b981]" />
          </div>
          <div className="hidden md:block min-w-0">
            <p className="font-display font-bold text-[13px] text-slate-100 truncate">HUNTER {hunterName}</p>
            <p className="text-[10px] tracking-[0.2em] text-cyan-300/80 font-semibold">
              LV. {levelInfo.level} · SHADOW DIVISION
            </p>
          </div>
        </div>

        {/* search */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search missions..."
            className="holo-input w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
          {/* streak */}
          <motion.div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-amber-400/30 bg-amber-400/10"
            animate={streak > 0 ? { boxShadow: ["0 0 8px rgba(245,158,11,0.2)", "0 0 18px rgba(245,158,11,0.5)", "0 0 8px rgba(245,158,11,0.2)"] } : {}}
            transition={{ duration: 2.2, repeat: Infinity }}
            title={`Daily streak: ${streak} days`}
          >
            <Flame size={15} className={streak > 0 ? "text-amber-400" : "text-slate-600"} style={streak > 0 ? { filter: "drop-shadow(0 0 6px rgba(245,158,11,0.9))" } : {}} />
            <span className="font-display font-bold text-sm text-amber-300">{streak}</span>
          </motion.div>

          {/* notifications */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="relative p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-cyan-400/10 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444] animate-pulse" />
          </motion.button>

          {/* theme (brightness) toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setDimmed((d) => !d)}
            className="p-2 rounded-xl text-slate-400 hover:text-violet-300 hover:bg-violet-500/10 transition-colors"
            aria-label="Toggle theme"
          >
            {dimmed ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>

          {/* rank + level xp */}
          <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-white/10">
            <RankBadge rank={rank} size={38} />
            <div className="hidden sm:block w-28 lg:w-40">
              <div className="flex justify-between text-[9px] font-bold tracking-widest text-slate-400 mb-1">
                <span className="text-cyan-300">LV. {levelInfo.level}</span>
                <span>
                  {xpInLevel.toLocaleString()}/{levelInfo.xpNeeded.toLocaleString()}
                </span>
              </div>
              <XPBar progress={levelInfo.progress} height={6} />
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
