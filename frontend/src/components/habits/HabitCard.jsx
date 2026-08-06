import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Flame, Trash2, ChevronDown, Zap } from "lucide-react";
import { iconByName } from "../../game/icons";
import { HABIT_CADENCES, localISO } from "../../game/constants";
import { habitStats } from "../../utils/habits";
import HabitCalendar from "./HabitCalendar";

/** Thin progress bar tinted with the habit's own colour. */
function Meter({ label, done, target, color }) {
  const ratio = target === 0 ? 0 : Math.min(1, done / target);
  return (
    <div className="flex-1 min-w-24">
      <div className="flex justify-between text-[9px] font-bold tracking-[0.18em] text-slate-500 mb-1">
        <span>{label}</span>
        <span style={{ color }}>
          {done}/{target}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color, boxShadow: `0 0 8px ${color}` }}
          initial={{ width: 0 }}
          animate={{ width: `${ratio * 100}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

function HabitCard({ habit, onToggleDay, onDelete, delay = 0 }) {
  const [open, setOpen] = useState(false);
  const today = localISO();
  const stats = habitStats(habit, today);
  const Icon = iconByName(habit.icon);
  const cadence = HABIT_CADENCES[habit.cadence]?.label ?? "Every day";

  return (
    <motion.article
      className="glass holo-scan neon-border rounded-2xl p-4 sm:p-5 group"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* today's tick */}
        <button
          type="button"
          onClick={() => onToggleDay(habit.id, today)}
          aria-pressed={stats.doneToday}
          aria-label={
            stats.doneToday ? `Un-log ${habit.title} for today` : `Log ${habit.title} for today`
          }
          className="relative mt-0.5 shrink-0 w-11 h-11 rounded-xl border flex items-center justify-center transition-all duration-300 hover:scale-105
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
          style={
            stats.doneToday
              ? {
                  borderColor: `${habit.color}99`,
                  background: `${habit.color}22`,
                  boxShadow: `0 0 18px ${habit.color}77`,
                }
              : { borderColor: "rgba(148,163,184,0.25)", background: "rgba(148,163,184,0.05)" }
          }
        >
          {stats.doneToday ? (
            <Check size={20} style={{ color: habit.color }} aria-hidden />
          ) : (
            <Icon size={18} className="text-slate-500" aria-hidden />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-display font-bold text-sm tracking-wide text-slate-100 truncate">
                {habit.title}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {cadence} · +{habit.xp} XP per log
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <span
                className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg border"
                style={{
                  color: stats.streak > 0 ? "#f59e0b" : "#64748b",
                  borderColor: stats.streak > 0 ? "#f59e0b44" : "rgba(148,163,184,0.2)",
                  background: stats.streak > 0 ? "#f59e0b12" : "transparent",
                }}
                title={`Current streak · best ${stats.best}d`}
              >
                <Flame size={12} aria-hidden />
                {stats.streak}d
              </span>
              <button
                type="button"
                onClick={() => onDelete(habit.id)}
                aria-label={`Delete habit: ${habit.title}`}
                className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all
                  opacity-100 sm:opacity-0 sm:group-hover:opacity-100
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
              >
                <Trash2 size={15} aria-hidden />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-3">
            <Meter label="THIS WEEK" done={stats.week.done} target={stats.week.target} color={habit.color} />
            <Meter label="THIS MONTH" done={stats.month.done} target={stats.month.target} color="#a78bfa" />
          </div>

          <div className="flex items-center justify-between gap-2 mt-3">
            <p className="text-[10px] tracking-[0.15em] font-semibold text-slate-500">
              <Zap size={10} className="inline -mt-0.5 text-amber-300/80" aria-hidden />{" "}
              {stats.totalDone} LOGS · {Math.round(stats.consistency * 100)}% CONSISTENCY · BEST{" "}
              {stats.best}D
            </p>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.2em] text-cyan-300/80 hover:text-cyan-200 transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 rounded"
            >
              CALENDAR
              <ChevronDown
                size={12}
                className={`transition-transform ${open ? "rotate-180" : ""}`}
                aria-hidden
              />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="cal"
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="pt-4 mt-4 border-t border-white/5">
              <HabitCalendar
                habit={habit}
                onToggleDay={(iso) => onToggleDay(habit.id, iso)}
              />
              <p className="text-[9px] tracking-[0.2em] text-slate-600 mt-3">
                TAP ANY PAST DAY TO BACK-FILL IT
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

export default memo(HabitCard);
