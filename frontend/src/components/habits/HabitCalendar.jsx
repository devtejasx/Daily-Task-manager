import { memo, useMemo } from "react";
import { localISO } from "../../game/constants";
import { toDate, humanDay } from "../../utils/date";
import { isDone } from "../../utils/habits";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

/**
 * One month of a single habit, as a clickable grid.
 * Past and present days can be back-filled; future days are inert.
 */
function HabitCalendar({ habit, monthISO = localISO(), onToggleDay, compact = false }) {
  const today = localISO();

  const { cells, monthLabel } = useMemo(() => {
    const d = toDate(monthISO);
    const year = d.getFullYear();
    const month = d.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return {
      monthLabel: new Date(year, month, 1)
        .toLocaleDateString(undefined, { month: "long", year: "numeric" })
        .toUpperCase(),
      cells: [
        ...Array.from({ length: firstWeekday }, () => null),
        ...Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        }),
      ],
    };
  }, [monthISO]);

  const size = compact ? "w-5 h-5 text-[8px]" : "w-7 h-7 text-[10px]";

  return (
    <div>
      {!compact && (
        <p className="text-[9px] font-bold tracking-[0.28em] text-violet-300/70 mb-2">
          {monthLabel}
        </p>
      )}
      <div className="grid grid-cols-7 gap-1" role="grid" aria-label={`${habit.title} calendar`}>
        {DAY_LABELS.map((d, i) => (
          <span
            key={`h-${i}`}
            className={`${size} flex items-center justify-center font-bold text-slate-600`}
            aria-hidden
          >
            {d}
          </span>
        ))}
        {cells.map((iso, i) => {
          if (iso === null) return <span key={`e${i}`} className={size} />;
          const done = isDone(habit, iso);
          const future = iso > today;
          const isToday = iso === today;

          return (
            <button
              key={iso}
              type="button"
              disabled={future}
              onClick={() => onToggleDay?.(iso)}
              aria-pressed={done}
              aria-label={`${humanDay(iso)}${done ? " — logged" : ""}`}
              title={future ? "The future can't be logged yet" : humanDay(iso)}
              className={`${size} rounded-md font-bold flex items-center justify-center transition-all
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70
                ${future ? "opacity-25 cursor-not-allowed" : "hover:scale-110"}
                ${isToday && !done ? "ring-1 ring-cyan-400/50" : ""}`}
              style={
                done
                  ? {
                      background: `${habit.color}33`,
                      color: habit.color,
                      boxShadow: `0 0 8px ${habit.color}66`,
                      border: `1px solid ${habit.color}88`,
                    }
                  : {
                      background: "rgba(148,163,184,0.06)",
                      color: "#64748b",
                      border: "1px solid rgba(148,163,184,0.12)",
                    }
              }
            >
              {Number(iso.slice(8))}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default memo(HabitCalendar);
