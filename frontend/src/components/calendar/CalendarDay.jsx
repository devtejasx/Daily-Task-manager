import { useDroppable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { missionsForDay } from "../../utils/calendar";
import MissionChip from "./MissionChip";

/**
 * One day cell. Doubles as a dnd-kit drop target, so dragging a mission
 * onto it re-schedules the mission to that date.
 */
export default function CalendarDay({
  cell,
  missions,
  today,
  expanded = false,
  onQuickAdd,
  index = 0,
}) {
  const { setNodeRef, isOver } = useDroppable({ id: cell.iso, data: { iso: cell.iso } });
  const dayMissions = missionsForDay(missions, cell.iso);
  const isToday = cell.iso === today;
  const visible = expanded ? dayMissions : dayMissions.slice(0, 3);

  return (
    <motion.div
      ref={setNodeRef}
      className={`group relative rounded-xl p-1.5 sm:p-2 border transition-colors overflow-hidden
        ${expanded ? "min-h-40" : "min-h-16 sm:min-h-24"}
        ${cell.outside ? "opacity-40" : ""}
        ${
          isOver
            ? "border-cyan-400/80 bg-cyan-400/15 shadow-[0_0_20px_rgba(6,182,212,0.45)]"
            : isToday
            ? "border-cyan-400/60 bg-cyan-400/10 shadow-[0_0_16px_rgba(6,182,212,0.3)]"
            : "border-white/5 bg-white/[0.02] hover:bg-violet-500/10 hover:border-violet-400/30"
        }`}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: cell.outside ? 0.4 : 1, scale: 1 }}
      transition={{ delay: 0.1 + index * 0.006 }}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-[10px] sm:text-xs font-bold ${
            isToday ? "text-cyan-300" : "text-slate-400"
          }`}
        >
          {cell.day}
        </span>
        {onQuickAdd && (
          <button
            type="button"
            onClick={() => onQuickAdd(cell.iso)}
            aria-label={`Add a mission on ${cell.iso}`}
            className="p-0.5 rounded text-slate-600 hover:text-cyan-300 hover:bg-cyan-400/10 transition-colors
              opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
          >
            <Plus size={11} aria-hidden />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-0.5 mt-1">
        {visible.map((m) => (
          <MissionChip key={`${m.id}-${cell.iso}`} mission={m} iso={cell.iso} compact={!expanded} />
        ))}
        {!expanded && dayMissions.length > 3 && (
          <span className="text-[8px] text-slate-500 font-bold pl-1">
            +{dayMissions.length - 3} more
          </span>
        )}
      </div>
    </motion.div>
  );
}
