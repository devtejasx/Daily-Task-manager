import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { DIFFICULTIES } from "../data/missions";
import { localISO, addDaysISO } from "../game/constants";

function dateLabel(iso) {
  const today = localISO();
  if (iso === today) return "Today";
  if (iso === addDaysISO(today, -1)) return "Yesterday";
  return new Date(iso + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function HistoryTimeline({ history, limit = 12 }) {
  const items = history.slice(0, limit);
  if (items.length === 0) {
    return <p className="text-sm text-slate-500 py-6 text-center">No missions cleared yet. Your legend awaits.</p>;
  }

  let lastDate = null;
  return (
    <div className="relative pl-5">
      {/* spine */}
      <div className="absolute left-1.5 top-1 bottom-1 w-px bg-gradient-to-b from-violet-500/50 via-cyan-400/30 to-transparent" />
      <div className="space-y-1">
        {items.map((h, i) => {
          const showDate = h.completedAt !== lastDate;
          lastDate = h.completedAt;
          const diff = DIFFICULTIES[h.difficulty] ?? DIFFICULTIES.C;
          return (
            <motion.div
              key={`${h.id}-${h.completedAt}-${i}`}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 + i * 0.04 }}
            >
              {showDate && (
                <p className="text-[10px] font-bold tracking-[0.25em] text-violet-300/70 pt-3 pb-1">
                  {dateLabel(h.completedAt).toUpperCase()}
                </p>
              )}
              <div className="relative flex items-center gap-3 py-1.5 group">
                {/* node */}
                <span
                  className="absolute -left-5 w-2.5 h-2.5 rounded-full border-2 border-[#0b1120]"
                  style={{ background: diff.color, boxShadow: `0 0 8px ${diff.color}` }}
                />
                <span className="text-sm text-slate-300 truncate group-hover:text-slate-100 transition-colors">
                  {h.title}
                </span>
                <span className="ml-auto flex items-center gap-1 text-[11px] font-bold text-amber-300/80 shrink-0">
                  <Zap size={11} className="fill-amber-300/40" />+{h.xp}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
