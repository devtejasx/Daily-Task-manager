import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Target, GripVertical } from "lucide-react";
import MissionList from "../components/MissionList";
import { DAILY_REQUIRED } from "../game/constants";

const FILTERS = [
  { id: "all", label: "ALL" },
  { id: "active", label: "ACTIVE" },
  { id: "daily", label: "DAILY" },
  { id: "completed", label: "CLEARED" },
];

export default function Missions({
  missions,
  dailySelected,
  onComplete,
  onDelete,
  onOpenAdd,
  onToggleDaily,
  onSkipOccurrence,
  onToggleRecurrencePaused,
  onReorder,
}) {
  const [filter, setFilter] = useState("all");
  const shown = missions.filter((m) => {
    if (filter === "all") return true;
    if (filter === "daily") return dailySelected.includes(m.id);
    return m.status === filter;
  });

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
            MISSION BOARD
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Forge your own missions, then mark <Target size={12} className="inline text-violet-300 -mt-0.5" /> on{" "}
            {DAILY_REQUIRED} of them as today's required daily quest ({dailySelected.length}/{DAILY_REQUIRED} assigned).
          </p>
        </div>
        <motion.button
          onClick={onOpenAdd}
          className="inline-flex items-center gap-2 font-display font-bold text-xs tracking-[0.2em] text-white rounded-xl px-4 py-2.5
            bg-gradient-to-r from-violet-600 to-cyan-500 shadow-[0_0_20px_rgba(124,58,237,0.5)]
            hover:shadow-[0_0_32px_rgba(6,182,212,0.6)] transition-shadow"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={15} /> NEW MISSION
        </motion.button>
      </motion.div>

      {/* filter tabs */}
      <motion.div
        className="flex gap-1.5 glass rounded-xl p-1.5 w-fit"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`relative px-4 py-1.5 rounded-lg text-[11px] font-bold tracking-[0.2em] transition-colors ${
              filter === f.id ? "text-cyan-200" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {filter === f.id && (
              <motion.span
                layoutId="filter-active"
                className="absolute inset-0 rounded-lg bg-cyan-400/10 border border-cyan-400/30"
                style={{ boxShadow: "0 0 14px rgba(6,182,212,0.25)" }}
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">{f.label}</span>
          </button>
        ))}
      </motion.div>

      <p className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] font-semibold text-slate-600">
        <GripVertical size={12} aria-hidden />
        DRAG A CARD TO REORDER · SPACE THEN ARROWS WITH A KEYBOARD
      </p>

      {shown.length > 0 && (
        <MissionList
          missions={shown}
          onReorder={onReorder}
          onComplete={onComplete}
          onDelete={onDelete}
          dailySelected={dailySelected}
          dailyFull={dailySelected.length >= DAILY_REQUIRED}
          onToggleDaily={onToggleDaily}
          onSkipOccurrence={onSkipOccurrence}
          onToggleRecurrencePaused={onToggleRecurrencePaused}
        />
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {shown.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center md:col-span-2 flex flex-col items-center">
            <div className="p-3 rounded-xl border border-violet-400/25 bg-violet-500/10 mb-4">
              <Target size={22} className="text-violet-300" />
            </div>
            <h3 className="font-display font-bold text-slate-200 tracking-wide">
              {filter === "completed" ? "NO MISSIONS COMPLETED YET" : "NO MISSIONS ASSIGNED"}
            </h3>
            <p className="text-sm text-slate-500 mt-1.5 max-w-sm">
              {filter === "completed"
                ? "Complete your first mission to begin your progress."
                : filter === "daily"
                ? "Mark up to four missions as today's daily quest from the board."
                : "Create your first mission to begin your ascent."}
            </p>
            {filter !== "completed" && (
              <button
                onClick={onOpenAdd}
                className="mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold tracking-[0.15em] text-white
                  bg-gradient-to-r from-violet-600 to-cyan-500 shadow-[0_0_18px_rgba(124,58,237,0.5)]
                  hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-shadow"
              >
                <Plus size={14} /> NEW MISSION
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
