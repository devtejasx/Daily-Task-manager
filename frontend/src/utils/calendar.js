/* =========================================================
   Calendar grid helpers
   ========================================================= */

import { localISO, addDaysISO } from "../game/constants";
import { startOfWeekISO, toDate } from "./date";

/** ISO day string for a Y/M/D triple (month is 0-based, like Date). */
export function isoFor(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Six-week month grid, always 42 cells so the calendar never reflows
 * between months. Cells outside the month are flagged rather than blanked,
 * which keeps them valid drop targets.
 *
 * @returns {{iso: string, day: number, outside: boolean}[]}
 */
export function monthGrid(cursorISO) {
  const d = toDate(cursorISO);
  const year = d.getFullYear();
  const month = d.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const start = addDaysISO(isoFor(year, month, 1), -firstWeekday);

  return Array.from({ length: 42 }, (_, i) => {
    const iso = addDaysISO(start, i);
    return {
      iso,
      day: Number(iso.slice(8)),
      outside: iso.slice(0, 7) !== `${year}-${String(month + 1).padStart(2, "0")}`,
    };
  });
}

/** Seven cells for the week containing `cursorISO`. */
export function weekGrid(cursorISO) {
  const start = startOfWeekISO(cursorISO);
  return Array.from({ length: 7 }, (_, i) => {
    const iso = addDaysISO(start, i);
    return { iso, day: Number(iso.slice(8)), outside: false };
  });
}

/** Does a mission occupy this day? Multi-day missions cover their whole span. */
export function occupiesDay(mission, iso) {
  if (!mission?.dueDate) return false;
  if (mission.endDate && mission.endDate > mission.dueDate) {
    return iso >= mission.dueDate && iso <= mission.endDate;
  }
  return mission.dueDate === iso;
}

/**
 * Missions on a given day, sorted so the most urgent reads first.
 * Cleared missions always sink to the bottom.
 */
export function missionsForDay(missions, iso) {
  const PRIORITY_RANK = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  return (missions ?? [])
    .filter((m) => occupiesDay(m, iso))
    .sort((a, b) => {
      const aDone = a.status === "completed" ? 1 : 0;
      const bDone = b.status === "completed" ? 1 : 0;
      if (aDone !== bDone) return aDone - bDone;
      return (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9);
    });
}

/** Where in its span this day sits — drives the chip's rounded edges. */
export function spanPosition(mission, iso) {
  if (!mission.endDate || mission.endDate <= mission.dueDate) return "single";
  if (iso === mission.dueDate) return "start";
  if (iso === mission.endDate) return "end";
  return "middle";
}

/** Month title, e.g. "AUGUST 2026". */
export function monthLabel(cursorISO) {
  return toDate(cursorISO)
    .toLocaleDateString(undefined, { month: "long", year: "numeric" })
    .toUpperCase();
}

/** Week title, e.g. "AUG 2 – AUG 8, 2026". */
export function weekLabel(cursorISO) {
  const start = startOfWeekISO(cursorISO);
  const end = addDaysISO(start, 6);
  const fmt = (iso) =>
    toDate(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}, ${end.slice(0, 4)}`.toUpperCase();
}

/** Step the cursor by one month or one week. */
export function shiftCursor(cursorISO, view, direction) {
  if (view === "week") return addDaysISO(cursorISO, 7 * direction);
  const d = toDate(cursorISO);
  return localISO(new Date(d.getFullYear(), d.getMonth() + direction, 1));
}
