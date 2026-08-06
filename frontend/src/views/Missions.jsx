import { motion } from "framer-motion";
import { Plus, Target, GripVertical, FilterX } from "lucide-react";
import MissionList from "../components/MissionList";
import FilterBar from "../components/filters/FilterBar";
import { DAILY_REQUIRED } from "../game/constants";

/**
 * The mission board. Filtering is owned by App (so the top-bar search and
 * this page's filter rail stay in sync) and handed down as `filterProps`.
 */
export default function Missions({
  missions,
  totalMissions = 0,
  filterProps,
  dailySelected,
  onComplete,
  onDelete,
  onOpenAdd,
  onToggleDaily,
  onSkipOccurrence,
  onToggleRecurrencePaused,
  onReorder,
}) {
  const filtersActive = (filterProps?.activeCount ?? 0) > 0;
  const boardEmpty = totalMissions === 0;

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
            Forge your own missions, then mark{" "}
            <Target size={12} className="inline text-violet-300 -mt-0.5" aria-hidden /> on{" "}
            {DAILY_REQUIRED} of them as today's required daily quest ({dailySelected.length}/
            {DAILY_REQUIRED} assigned).
          </p>
        </div>
        <motion.button
          onClick={onOpenAdd}
          className="inline-flex items-center gap-2 font-display font-bold text-xs tracking-[0.2em] text-white rounded-xl px-4 py-2.5
            bg-gradient-to-r from-violet-600 to-cyan-500 shadow-[0_0_20px_rgba(124,58,237,0.5)]
            hover:shadow-[0_0_32px_rgba(6,182,212,0.6)] transition-shadow
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={15} aria-hidden /> NEW MISSION
        </motion.button>
      </motion.div>

      <FilterBar {...filterProps} resultCount={missions.length} totalCount={totalMissions} />

      {missions.length > 0 && (
        <>
          <p className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] font-semibold text-slate-600">
            <GripVertical size={12} aria-hidden />
            DRAG A CARD TO REORDER · SPACE THEN ARROWS WITH A KEYBOARD
          </p>
          <MissionList
            missions={missions}
            onReorder={onReorder}
            onComplete={onComplete}
            onDelete={onDelete}
            dailySelected={dailySelected}
            dailyFull={dailySelected.length >= DAILY_REQUIRED}
            onToggleDaily={onToggleDaily}
            onSkipOccurrence={onSkipOccurrence}
            onToggleRecurrencePaused={onToggleRecurrencePaused}
          />
        </>
      )}

      {missions.length === 0 && (
        <div className="glass rounded-2xl p-8 text-center flex flex-col items-center">
          <div className="p-3 rounded-xl border border-violet-400/25 bg-violet-500/10 mb-4">
            {filtersActive ? (
              <FilterX size={22} className="text-violet-300" aria-hidden />
            ) : (
              <Target size={22} className="text-violet-300" aria-hidden />
            )}
          </div>
          <h3 className="font-display font-bold text-slate-200 tracking-wide">
            {filtersActive && !boardEmpty ? "NO MISSIONS MATCH THESE FILTERS" : "NO MISSIONS ASSIGNED"}
          </h3>
          <p className="text-sm text-slate-500 mt-1.5 max-w-sm">
            {filtersActive && !boardEmpty
              ? "Loosen a filter or clear them all to see the rest of the board."
              : "Create your first mission to begin your ascent."}
          </p>
          {filtersActive && !boardEmpty ? (
            <button
              onClick={filterProps.reset}
              className="mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold tracking-[0.15em] text-cyan-300
                border border-cyan-400/30 bg-cyan-400/10 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-shadow
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
            >
              <FilterX size={14} aria-hidden /> CLEAR FILTERS
            </button>
          ) : (
            <button
              onClick={onOpenAdd}
              className="mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold tracking-[0.15em] text-white
                bg-gradient-to-r from-violet-600 to-cyan-500 shadow-[0_0_18px_rgba(124,58,237,0.5)]
                hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-shadow
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
            >
              <Plus size={14} aria-hidden /> NEW MISSION
            </button>
          )}
        </div>
      )}
    </div>
  );
}
