import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Flame, Repeat, Trophy, Percent } from "lucide-react";
import StatCard from "../components/StatCard";
import HabitCard from "../components/habits/HabitCard";
import AddHabitForm from "../components/habits/AddHabitForm";
import { localISO } from "../game/constants";
import { habitStats } from "../utils/habits";

export default function Habits({ habits = [], onAdd, onDelete, onToggleDay }) {
  const [adding, setAdding] = useState(false);
  const today = localISO();

  const ordered = useMemo(
    () => [...habits].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [habits]
  );

  // Roll every habit's numbers up into the page header.
  const summary = useMemo(() => {
    const all = ordered.map((h) => habitStats(h, today));
    const doneToday = all.filter((s) => s.doneToday).length;
    return {
      doneToday,
      total: ordered.length,
      bestStreak: all.reduce((max, s) => Math.max(max, s.streak), 0),
      allTimeBest: all.reduce((max, s) => Math.max(max, s.best), 0),
      consistency:
        all.length === 0 ? 0 : all.reduce((sum, s) => sum + s.consistency, 0) / all.length,
    };
  }, [ordered, today]);

  return (
    <div className="space-y-5">
      <motion.div
        className="flex flex-wrap items-center justify-between gap-3"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <h1 className="font-display font-black text-2xl text-slate-100 text-glow-arcane">
            DAILY DISCIPLINES
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {summary.total === 0
              ? "Habits are the quiet grind between gates."
              : `${summary.doneToday} of ${summary.total} logged today.`}
          </p>
        </div>
        <motion.button
          onClick={() => setAdding((v) => !v)}
          aria-expanded={adding}
          className="inline-flex items-center gap-2 font-display font-bold text-xs tracking-[0.2em] text-white rounded-xl px-4 py-2.5
            bg-gradient-to-r from-violet-600 to-cyan-500 shadow-[0_0_20px_rgba(124,58,237,0.5)]
            hover:shadow-[0_0_32px_rgba(6,182,212,0.6)] transition-shadow
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={15} aria-hidden /> NEW HABIT
        </motion.button>
      </motion.div>

      <AnimatePresence initial={false}>
        {adding && <AddHabitForm onAdd={onAdd} onCancel={() => setAdding(false)} />}
      </AnimatePresence>

      {ordered.length > 0 && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            icon={Repeat}
            label="Logged Today"
            value={summary.doneToday}
            suffix={`/${summary.total}`}
            accent="#06b6d4"
            delay={0.06}
          />
          <StatCard
            icon={Flame}
            label="Best Live Streak"
            value={summary.bestStreak}
            suffix=" d"
            accent="#f59e0b"
            delay={0.12}
          />
          <StatCard
            icon={Trophy}
            label="All-Time Best"
            value={summary.allTimeBest}
            suffix=" d"
            accent="#a78bfa"
            delay={0.18}
          />
          <StatCard
            icon={Percent}
            label="Avg Consistency"
            value={Math.round(summary.consistency * 100)}
            suffix="%"
            accent="#10b981"
            delay={0.24}
          />
        </div>
      )}

      {ordered.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center flex flex-col items-center">
          <div className="p-3 rounded-xl border border-violet-400/25 bg-violet-500/10 mb-4">
            <Flame size={22} className="text-violet-300" aria-hidden />
          </div>
          <h3 className="font-display font-bold text-slate-200 tracking-wide">NO HABITS YET</h3>
          <p className="text-sm text-slate-500 mt-1.5 max-w-sm">
            Missions are one-off gates. Habits are the daily grind that raises your floor — each log
            awards XP and grows a streak.
          </p>
          <button
            onClick={() => setAdding(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold tracking-[0.15em] text-white
              bg-gradient-to-r from-violet-600 to-cyan-500 shadow-[0_0_18px_rgba(124,58,237,0.5)]
              hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-shadow
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
          >
            <Plus size={14} aria-hidden /> FORGE YOUR FIRST HABIT
          </button>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {ordered.map((habit, i) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggleDay={onToggleDay}
                onDelete={onDelete}
                delay={0.05 + i * 0.05}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
