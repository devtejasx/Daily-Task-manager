import { memo, useMemo } from "react";
import { humanDay } from "../../utils/date";

/** Level 0–4 -> mana-glow intensity, matching the arcane palette. */
const LEVEL_STYLE = [
  { background: "rgba(148,163,184,0.07)", boxShadow: "none" },
  { background: "rgba(124,58,237,0.28)", boxShadow: "0 0 4px rgba(124,58,237,0.35)" },
  { background: "rgba(124,58,237,0.5)", boxShadow: "0 0 6px rgba(124,58,237,0.5)" },
  { background: "rgba(6,182,212,0.62)", boxShadow: "0 0 8px rgba(6,182,212,0.55)" },
  { background: "rgba(6,182,212,0.92)", boxShadow: "0 0 12px rgba(6,182,212,0.85)" },
];

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

/**
 * GitHub-style contribution grid: one column per week, one cell per day.
 *
 * @param {{day: string, count: number, level: number}[]} cells  oldest first
 */
function HeatmapCalendar({ cells }) {
  // Pad the front so the first column starts on a Sunday.
  const columns = useMemo(() => {
    if (cells.length === 0) return [];
    const firstWeekday = new Date(`${cells[0].day}T12:00:00`).getDay();
    const padded = [...Array.from({ length: firstWeekday }, () => null), ...cells];
    const out = [];
    for (let i = 0; i < padded.length; i += 7) out.push(padded.slice(i, i + 7));
    return out;
  }, [cells]);

  return (
    <div>
      <div className="flex gap-[3px] overflow-x-auto pb-1">
        {/* weekday gutter */}
        <div className="flex flex-col gap-[3px] pr-1 shrink-0" aria-hidden>
          {WEEKDAYS.map((d, i) => (
            <span
              key={`${d}-${i}`}
              className="w-3 h-3 text-[7px] font-bold text-slate-600 flex items-center justify-center"
            >
              {i % 2 === 1 ? d : ""}
            </span>
          ))}
        </div>

        {columns.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px] shrink-0">
            {week.map((cell, di) =>
              cell === null ? (
                <span key={`pad-${di}`} className="w-3 h-3" />
              ) : (
                <span
                  key={cell.day}
                  className="w-3 h-3 rounded-[3px] transition-transform hover:scale-125"
                  style={LEVEL_STYLE[cell.level]}
                  title={`${humanDay(cell.day)} · ${cell.count} ${
                    cell.count === 1 ? "mission" : "missions"
                  } cleared`}
                />
              )
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 mt-3 text-[9px] font-bold tracking-[0.2em] text-slate-600">
        LESS
        {LEVEL_STYLE.map((style, i) => (
          <span key={i} className="w-3 h-3 rounded-[3px]" style={style} aria-hidden />
        ))}
        MORE
      </div>
    </div>
  );
}

export default memo(HeatmapCalendar);
