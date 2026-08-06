/* =========================================================
   Recurrence engine

   A recurring mission is an ordinary mission carrying a
   `recurrence` block. When it is cleared (or skipped) we do NOT
   mutate history — the completed occurrence stays exactly as it
   was and a brand-new mission is spawned for the next date, both
   linked by `seriesId`. That keeps the completion history of a
   repeating mission intact forever.
   ========================================================= */

import { localISO, addDaysISO, RECURRENCE_TYPES } from "../game/constants";
import { toDate } from "./date";
import { nextId } from "../data/missions";

/** True when this mission repeats (paused series still count as recurring). */
export function isRecurring(mission) {
  return Boolean(mission?.recurrence);
}

/** True when the series is currently generating new occurrences. */
export function isActiveRecurrence(mission) {
  return Boolean(mission?.recurrence) && !mission.recurrence.paused;
}

/** Add whole months, clamping to the last valid day (Jan 31 -> Feb 28). */
function addMonthsISO(iso, months) {
  const d = toDate(iso);
  if (!d) return iso;
  const targetDay = d.getDate();
  const shifted = new Date(d.getFullYear(), d.getMonth() + months, 1);
  const lastDay = new Date(shifted.getFullYear(), shifted.getMonth() + 1, 0).getDate();
  shifted.setDate(Math.min(targetDay, lastDay));
  return localISO(shifted);
}

/**
 * The single next date after `fromISO` for a recurrence rule.
 * @param {string} fromISO   the occurrence being advanced
 * @param {object} recurrence
 */
export function stepOnce(fromISO, recurrence) {
  if (!recurrence) return fromISO;
  const interval = Math.max(1, Number(recurrence.interval) || 1);
  switch (recurrence.type) {
    case "weekly":
      return addDaysISO(fromISO, 7 * interval);
    case "monthly":
      return addMonthsISO(fromISO, interval);
    case "custom":
    case "daily":
    default:
      return addDaysISO(fromISO, interval);
  }
}

/**
 * The next date a mission should be due, never landing in the past.
 * If the hunter was away for a week, a daily mission catches up to today
 * instead of spawning a backlog of missed occurrences.
 *
 * @param {string} fromISO
 * @param {object} recurrence
 * @param {string} notBeforeISO  earliest acceptable date (defaults to today)
 */
export function nextOccurrenceISO(fromISO, recurrence, notBeforeISO = localISO()) {
  if (!recurrence) return null;
  let next = stepOnce(fromISO, recurrence);
  // Bound the catch-up loop so a corrupt interval can never hang the reducer.
  for (let guard = 0; guard < 500 && next < notBeforeISO; guard += 1) {
    next = stepOnce(next, recurrence);
  }
  return next;
}

/**
 * Spawn the follow-up occurrence of a recurring mission.
 * Returns null when the mission does not recur or the series is paused.
 *
 * @param {object} mission
 * @param {"completed"|"skipped"} reason  how the current occurrence ended
 */
export function buildNextOccurrence(mission, reason = "completed") {
  if (!isActiveRecurrence(mission)) return null;

  const nextDue = nextOccurrenceISO(mission.dueDate, mission.recurrence);
  if (!nextDue) return null;

  const counters = {
    ...mission.recurrence,
    completed: mission.recurrence.completed + (reason === "completed" ? 1 : 0),
    skipped: mission.recurrence.skipped + (reason === "skipped" ? 1 : 0),
  };

  // Multi-day missions keep their span length across occurrences.
  const spanDays =
    mission.endDate && mission.endDate > mission.dueDate
      ? Math.round(
          (toDate(mission.endDate) - toDate(mission.dueDate)) / 86_400_000
        )
      : 0;

  return {
    ...mission,
    id: nextId(),
    seriesId: mission.seriesId || mission.id,
    occurrence: (mission.occurrence ?? 0) + 1,
    status: "active",
    dueDate: nextDue,
    endDate: spanDays > 0 ? addDaysISO(nextDue, spanDays) : null,
    createdAt: localISO(),
    reminderFiredAt: null,
    recurrence: counters,
  };
}

/** Human-readable rule, e.g. "Every 3 days" / "Weekly · paused". */
export function describeRecurrence(recurrence) {
  if (!recurrence) return "";
  const interval = Math.max(1, Number(recurrence.interval) || 1);
  let text;
  switch (recurrence.type) {
    case "weekly":
      text = interval === 1 ? "Weekly" : `Every ${interval} weeks`;
      break;
    case "monthly":
      text = interval === 1 ? "Monthly" : `Every ${interval} months`;
      break;
    case "custom":
      text = `Every ${interval} ${interval === 1 ? "day" : "days"}`;
      break;
    case "daily":
    default:
      text = interval === 1 ? "Daily" : `Every ${interval} days`;
      break;
  }
  return recurrence.paused ? `${text} · paused` : text;
}

/** Short label for the recurrence type, used on chips and the calendar. */
export function recurrenceLabel(recurrence) {
  if (!recurrence) return "";
  return RECURRENCE_TYPES[recurrence.type]?.label ?? "Repeats";
}

/** A blank rule of the given type, ready for the mission form. */
export function makeRecurrence(type = "daily", interval = 1) {
  return {
    type,
    interval: Math.max(1, Number(interval) || 1),
    paused: false,
    skipped: 0,
    completed: 0,
  };
}
