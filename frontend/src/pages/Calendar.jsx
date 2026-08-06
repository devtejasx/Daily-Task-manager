import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { ChevronLeft, ChevronRight, CalendarDays, Repeat } from "lucide-react";
import CalendarDay from "../components/calendar/CalendarDay";
import { PRIORITIES, localISO } from "../game/constants";
import { monthGrid, weekGrid, monthLabel, weekLabel, shiftCursor } from "../utils/calendar";

const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const VIEWS = [
  { id: "month", label: "MONTH" },
  { id: "week", label: "WEEK" },
];

export default function Calendar({ missions = [], onMoveMission, onQuickAdd }) {
  const today = localISO();
  const [view, setView] = useState("month");
  const [cursor, setCursor] = useState(today);
  const [dragging, setDragging] = useState(null);

  const cells = useMemo(
    () => (view === "week" ? weekGrid(cursor) : monthGrid(cursor)),
    [view, cursor]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    // Long-press before a drag starts, so scrolling the calendar still works.
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = useCallback(
    ({ active, over }) => {
      setDragging(null);
      if (!over) return;
      const { missionId, fromISO } = active.data.current ?? {};
      const toISO = over.data.current?.iso;
      if (!missionId || !toISO || toISO === fromISO) return;
      onMoveMission?.(missionId, toISO);
    },
    [onMoveMission]
  );

  const draggedMission = useMemo(
    () => missions.find((m) => m.id === dragging?.missionId) ?? null,
    [missions, dragging]
  );
  const draggedColor = (PRIORITIES[draggedMission?.priority] ?? PRIORITIES.MEDIUM).color;

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
            GATE CALENDAR
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Drag a mission to another day to reschedule it.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* month / week */}
          <div className="flex gap-1 glass rounded-xl p-1" role="tablist" aria-label="Calendar view">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                role="tab"
                aria-selected={view === v.id}
                onClick={() => setView(v.id)}
                className={`relative px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-[0.2em] transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 ${
                    view === v.id ? "text-cyan-200" : "text-slate-500 hover:text-slate-300"
                  }`}
              >
                {view === v.id && (
                  <motion.span
                    layoutId="cal-view-active"
                    className="absolute inset-0 rounded-lg bg-cyan-400/10 border border-cyan-400/30"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">{v.label}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setCursor((c) => shiftCursor(c, view, -1))}
            className="p-2 rounded-lg glass text-slate-300 hover:text-cyan-300 transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
            aria-label={view === "week" ? "Previous week" : "Previous month"}
          >
            <ChevronLeft size={17} aria-hidden />
          </button>
          <span
            className="font-display font-bold text-xs sm:text-sm tracking-[0.15em] text-cyan-300 min-w-40 text-center"
            aria-live="polite"
          >
            {view === "week" ? weekLabel(cursor) : monthLabel(cursor)}
          </span>
          <button
            type="button"
            onClick={() => setCursor((c) => shiftCursor(c, view, 1))}
            className="p-2 rounded-lg glass text-slate-300 hover:text-cyan-300 transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
            aria-label={view === "week" ? "Next week" : "Next month"}
          >
            <ChevronRight size={17} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setCursor(today)}
            className="text-[10px] font-bold tracking-[0.2em] text-slate-400 hover:text-cyan-300 border border-white/10 rounded-lg px-3 py-2 transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
          >
            TODAY
          </button>
        </div>
      </motion.div>

      <motion.div
        className="glass neon-border rounded-2xl p-3 sm:p-5"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2">
          {DAY_LABELS.map((d) => (
            <div
              key={d}
              className="text-center text-[9px] sm:text-[10px] font-bold tracking-[0.2em] text-violet-300/70 py-1"
            >
              {d}
            </div>
          ))}
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={({ active }) => setDragging(active.data.current)}
          onDragCancel={() => setDragging(null)}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {cells.map((cell, i) => (
              <CalendarDay
                key={cell.iso}
                cell={cell}
                index={i}
                missions={missions}
                today={today}
                expanded={view === "week"}
                onQuickAdd={onQuickAdd}
              />
            ))}
          </div>

          <DragOverlay>
            {draggedMission ? (
              <span
                className="inline-block text-[10px] font-semibold px-2 py-1 rounded border shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                style={{
                  color: draggedColor,
                  borderColor: `${draggedColor}88`,
                  background: "rgba(11,17,32,0.95)",
                }}
              >
                {draggedMission.title}
              </span>
            ) : null}
          </DragOverlay>
        </DndContext>
      </motion.div>

      {/* legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] tracking-[0.15em] font-semibold text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays size={12} aria-hidden /> PRIORITY
        </span>
        {Object.values(PRIORITIES).map((p) => (
          <span key={p.label} className="inline-flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm"
              style={{ background: `${p.color}55`, border: `1px solid ${p.color}` }}
              aria-hidden
            />
            {p.label.toUpperCase()}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5 text-violet-300/70">
          <Repeat size={11} aria-hidden /> RECURRING
        </span>
      </div>
    </div>
  );
}
