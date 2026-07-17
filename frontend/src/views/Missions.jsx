import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Target } from "lucide-react";
import MissionCard from "../components/MissionCard";
import { DAILY_REQUIRED } from "../game/constants";

const FILTERS = [
  { id: "all", label: "ALL" },
  { id: "active", label: "ACTIVE" },
  { id: "daily", label: "DAILY" },
  { id: "completed", label: "CLEARED" },
];

export default function Missions({ missions, dailySelected, onComplete, onDelete, onOpenAdd, onToggleDaily }) {
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

      <div className="grid gap-3 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {shown.map((m, index) => (
            <MissionCard
              key={m.id}
              mission={m}
              onComplete={onComplete}
              onDelete={onDelete}
              isDaily={dailySelected.includes(m.id)}
              dailyFull={dailySelected.length >= DAILY_REQUIRED}
              onToggleDaily={onToggleDaily}
              enterDelay={0.05 + index * 0.05}
            />
          ))}
        </AnimatePresence>
        {shown.length === 0 && (
          <p className="text-sm text-slate-500 glass rounded-xl p-6 text-center md:col-span-2">
            No missions in this sector.
          </p>
        )}
      </div>
    </div>
  );
}
