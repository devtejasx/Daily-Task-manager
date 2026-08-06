import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Repeat, Check } from "lucide-react";
import { PRIORITIES } from "../../game/constants";
import { spanPosition } from "../../utils/calendar";

/** Rounded edges tell you where a multi-day mission starts and ends. */
const SPAN_RADIUS = {
  single: "rounded",
  start: "rounded-l rounded-r-none",
  middle: "rounded-none",
  end: "rounded-r rounded-l-none",
};

/**
 * A draggable mission chip inside a calendar day.
 * Colour comes from the mission's priority, so the month reads as a
 * heat map of what matters.
 */
export default function MissionChip({ mission, iso, compact = false }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `${mission.id}::${iso}`,
    data: { missionId: mission.id, fromISO: iso },
  });

  const priority = PRIORITIES[mission.priority] ?? PRIORITIES.MEDIUM;
  const completed = mission.status === "completed";
  const position = spanPosition(mission, iso);
  // Only the first day of a span carries the title; later days are a bar.
  const showTitle = position === "single" || position === "start";

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Translate.toString(transform),
        color: completed ? "#64748b" : priority.color,
        borderColor: `${priority.color}${completed ? "22" : "55"}`,
        background: `${priority.color}${completed ? "0a" : "1a"}`,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 40 : undefined,
      }}
      title={`${mission.title}${mission.dueTime ? ` · ${mission.dueTime}` : ""}${
        mission.recurrence ? " · repeats" : ""
      }`}
      aria-label={`${mission.title}. Drag to move to another day.`}
      className={`w-full flex items-center gap-1 border px-1 py-0.5 text-left truncate cursor-grab active:cursor-grabbing touch-none
        transition-shadow hover:shadow-[0_0_10px_currentColor]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70
        ${SPAN_RADIUS[position]} ${compact ? "text-[9px]" : "text-[10px]"}
        ${completed ? "line-through" : "font-semibold"}`}
    >
      {completed && <Check size={8} className="shrink-0" aria-hidden />}
      {mission.recurrence && !completed && <Repeat size={8} className="shrink-0" aria-hidden />}
      <span className="truncate">{showTitle ? mission.title : "·"}</span>
    </button>
  );
}
