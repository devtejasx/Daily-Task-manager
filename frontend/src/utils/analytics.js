/* =========================================================
   Productivity analytics

   Everything here is derived from the same two arrays the game
   already keeps — `history` (cleared missions) and `missions` (the
   live board) — so analytics can never drift out of sync with the
   XP system, and no extra data has to be persisted.
   ========================================================= */

import { localISO, addDaysISO } from "../game/constants";
import { isoRange, startOfWeekISO, toDate } from "./date";

/** Sum of XP over a slice of history. */
function sumXP(entries) {
  return entries.reduce((total, h) => total + (Number(h.xp) || 0), 0);
}

/** History entries completed on or after `fromISO` (inclusive). */
export function since(history, fromISO) {
  return (history ?? []).filter((h) => h.completedAt >= fromISO);
}

/**
 * Headline numbers for the analytics dashboard.
 *
 * @param {object} state  the game state (missions, history, streak, ...)
 * @param {string} [today]
 */
export function computeSummary(state, today = localISO()) {
  const history = state.history ?? [];
  const missions = state.missions ?? [];

  const weekAgo = addDaysISO(today, -6);
  const monthAgo = addDaysISO(today, -29);

  const weeklyXP = sumXP(since(history, weekAgo));
  const monthlyXP = sumXP(since(history, monthAgo));

  const pending = missions.filter((m) => m.status !== "completed").length;
  const totalCompleted = history.length;
  // "Seen" = everything ever cleared plus what is still on the board.
  const totalSeen = totalCompleted + pending;

  return {
    totalCompleted,
    pending,
    completionRate: totalSeen === 0 ? 0 : totalCompleted / totalSeen,
    weeklyXP,
    monthlyXP,
    totalXP: state.totalXP ?? 0,
    currentStreak: state.streak ?? 0,
    longestStreak: state.longestStreak ?? 0,
    topCategory: topCategory(history),
    averagePerDay: averagePerDay(history, today),
    activeDays: activeDays(history).size,
  };
}

/** The category with the most cleared missions, or null when history is empty. */
export function topCategory(history) {
  const counts = categoryBreakdown(history);
  if (counts.length === 0) return null;
  return counts[0];
}

/** [{ category, count, xp }] sorted by count, descending. */
export function categoryBreakdown(history) {
  const byCategory = new Map();
  for (const h of history ?? []) {
    const key = h.category || "Uncategorised";
    const entry = byCategory.get(key) ?? { category: key, count: 0, xp: 0 };
    entry.count += 1;
    entry.xp += Number(h.xp) || 0;
    byCategory.set(key, entry);
  }
  return [...byCategory.values()].sort((a, b) => b.count - a.count || b.xp - a.xp);
}

/** Distinct ISO days on which anything was cleared. */
export function activeDays(history) {
  return new Set((history ?? []).map((h) => h.completedAt));
}

/**
 * Average missions cleared per day.
 *
 * Measured across the hunter's whole span (first clear -> today) rather
 * than only the days they showed up, so it answers "how productive am I
 * overall" instead of "how productive am I when I bother".
 */
export function averagePerDay(history, today = localISO()) {
  const entries = history ?? [];
  if (entries.length === 0) return 0;

  const earliest = entries.reduce(
    (min, h) => (h.completedAt < min ? h.completedAt : min),
    entries[0].completedAt
  );
  const spanDays = Math.max(1, Math.round((toDate(today) - toDate(earliest)) / 86_400_000) + 1);
  return entries.length / spanDays;
}

/**
 * Daily completion + XP series for a chart.
 * @param {number} days  how many days back to include (inclusive of today)
 */
export function dailySeries(history, days = 7, today = localISO()) {
  const buckets = new Map();
  for (const h of history ?? []) buckets.set(h.completedAt, buckets.get(h.completedAt) ?? []);
  for (const h of history ?? []) buckets.get(h.completedAt).push(h);

  return Array.from({ length: days }, (_, i) => {
    const day = addDaysISO(today, i - (days - 1));
    const entries = buckets.get(day) ?? [];
    const date = toDate(day);
    return {
      day,
      label: date.toLocaleDateString(undefined, { weekday: "short" }),
      shortDate: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      completed: entries.length,
      xp: sumXP(entries),
    };
  });
}

/** Week-over-week series: one point per week, `weeks` back. */
export function weeklySeries(history, weeks = 8, today = localISO()) {
  const thisWeek = startOfWeekISO(today);
  return Array.from({ length: weeks }, (_, i) => {
    const start = addDaysISO(thisWeek, (i - (weeks - 1)) * 7);
    const end = addDaysISO(start, 6);
    const entries = (history ?? []).filter((h) => h.completedAt >= start && h.completedAt <= end);
    return {
      week: start,
      label: toDate(start).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      completed: entries.length,
      xp: sumXP(entries),
    };
  });
}

/**
 * Heatmap cells for the last `days` days, each with an intensity level 0–4
 * scaled against the busiest day in the window.
 */
export function heatmap(history, days = 119, today = localISO()) {
  const counts = new Map();
  for (const h of history ?? []) {
    counts.set(h.completedAt, (counts.get(h.completedAt) ?? 0) + 1);
  }

  const from = addDaysISO(today, -(days - 1));
  const cells = isoRange(from, today).map((day) => ({
    day,
    count: counts.get(day) ?? 0,
  }));

  const busiest = cells.reduce((max, c) => Math.max(max, c.count), 0);
  return cells.map((c) => ({
    ...c,
    // 0 = nothing, 1–4 = quartiles of the busiest day in view
    level: c.count === 0 || busiest === 0 ? 0 : Math.min(4, Math.ceil((c.count / busiest) * 4)),
  }));
}

/**
 * The longest run of consecutive days with at least one clear.
 * Independent of the daily-quest streak, which requires a full quest.
 */
export function longestActiveRun(history) {
  const days = [...activeDays(history)].sort();
  if (days.length === 0) return 0;

  let best = 1;
  let run = 1;
  for (let i = 1; i < days.length; i += 1) {
    run = addDaysISO(days[i - 1], 1) === days[i] ? run + 1 : 1;
    if (run > best) best = run;
  }
  return best;
}
