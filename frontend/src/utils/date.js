/* =========================================================
   Date / deadline helpers

   Every date the app stores is a LOCAL ISO day string
   ("YYYY-MM-DD") and an optional "HH:MM" time, matching the
   existing mission shape. These helpers never touch UTC so a
   hunter's "today" is always their own wall-clock today.
   ========================================================= */

import { localISO, addDaysISO } from "../game/constants";

export const MINUTE_MS = 60_000;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;

/** Parse a "YYYY-MM-DD" (+ optional "HH:MM") into a local Date. */
export function toDate(iso, time = null) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  const [hh, mm] = (time || "00:00").split(":").map(Number);
  return new Date(y, m - 1, d, hh || 0, mm || 0, 0, 0);
}

/** The exact moment a mission is due (end of day when no time is set). */
export function dueDateTime(mission) {
  if (!mission?.dueDate) return null;
  return mission.dueTime
    ? toDate(mission.dueDate, mission.dueTime)
    : toDate(mission.dueDate, "23:59");
}

/** Whole days between two ISO days (b - a). Negative when b is earlier. */
export function daysBetween(a, b) {
  const da = toDate(a);
  const db = toDate(b);
  if (!da || !db) return 0;
  return Math.round((db - da) / DAY_MS);
}

/** Days from today: 0 = today, 1 = tomorrow, -1 = yesterday. */
export function dayOffset(iso, today = localISO()) {
  return daysBetween(today, iso);
}

/** A mission is overdue when its due moment has passed and it isn't cleared. */
export function isOverdue(mission, now = new Date()) {
  if (!mission || mission.status === "completed") return false;
  const due = dueDateTime(mission);
  return Boolean(due) && due.getTime() < now.getTime();
}

export function isDueToday(mission, today = localISO()) {
  return mission?.dueDate === today;
}

export function isDueTomorrow(mission, today = localISO()) {
  return mission?.dueDate === addDaysISO(today, 1);
}

/** Sunday-anchored week bounds, matching the calendar grid. */
export function startOfWeekISO(iso = localISO()) {
  const d = toDate(iso);
  return localISO(new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay()));
}

export function endOfWeekISO(iso = localISO()) {
  return addDaysISO(startOfWeekISO(iso), 6);
}

/** True when the day falls inside the current (Sun–Sat) week. */
export function isThisWeek(iso, today = localISO()) {
  if (!iso) return false;
  return iso >= startOfWeekISO(today) && iso <= endOfWeekISO(today);
}

export function startOfMonthISO(iso = localISO()) {
  return `${iso.slice(0, 7)}-01`;
}

export function endOfMonthISO(iso = localISO()) {
  const d = toDate(iso);
  return localISO(new Date(d.getFullYear(), d.getMonth() + 1, 0));
}

/** Inclusive list of ISO days between two dates (capped for safety). */
export function isoRange(fromISO, toISO, max = 400) {
  const out = [];
  let cursor = fromISO;
  while (cursor <= toISO && out.length < max) {
    out.push(cursor);
    cursor = addDaysISO(cursor, 1);
  }
  return out;
}

/**
 * The badge shown on a mission card.
 * @returns {{label: string, tone: "overdue"|"today"|"tomorrow"|"soon"|"future"|"none"}}
 */
export function dueBadge(mission, now = new Date()) {
  if (!mission?.dueDate) return { label: "", tone: "none" };
  const today = localISO(now);
  const offset = dayOffset(mission.dueDate, today);

  if (mission.status !== "completed" && isOverdue(mission, now)) {
    const late = Math.abs(offset);
    return {
      label: late === 0 ? "Overdue" : `Overdue · ${late}d`,
      tone: "overdue",
    };
  }
  if (offset === 0) return { label: "Today", tone: "today" };
  if (offset === 1) return { label: "Tomorrow", tone: "tomorrow" };
  if (offset > 1 && offset <= 7) return { label: `In ${offset}d`, tone: "soon" };
  return { label: humanDay(mission.dueDate), tone: "future" };
}

/** "Mar 4" / "Mar 4, 2027" when the year differs from today's. */
export function humanDay(iso, today = localISO()) {
  const d = toDate(iso);
  if (!d) return "";
  const sameYear = iso.slice(0, 4) === today.slice(0, 4);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

/** Compact countdown text: "2d 4h", "3h 12m", "45m", "12s", "—". */
export function formatCountdown(ms) {
  if (ms == null || Number.isNaN(ms)) return "—";
  const abs = Math.abs(ms);
  const days = Math.floor(abs / DAY_MS);
  const hours = Math.floor((abs % DAY_MS) / HOUR_MS);
  const minutes = Math.floor((abs % HOUR_MS) / MINUTE_MS);
  const seconds = Math.floor((abs % MINUTE_MS) / 1000);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

/** Milliseconds until a mission is due (negative once it's late). */
export function msUntilDue(mission, now = new Date()) {
  const due = dueDateTime(mission);
  if (!due) return null;
  return due.getTime() - now.getTime();
}
