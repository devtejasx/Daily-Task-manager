/* =========================================================
   Habit maths

   A habit stores nothing but a set of ticked days:
     log = { "2026-08-06": true, ... }
   Every streak, progress bar and percentage below is derived from
   that map, so ticking and un-ticking a day is always reversible and
   the record can never disagree with the display.
   ========================================================= */

import { localISO, addDaysISO, HABIT_CADENCES } from "../game/constants";
import { isoRange, startOfWeekISO, endOfWeekISO, startOfMonthISO, endOfMonthISO } from "./date";

/** Was this habit ticked on the given day? */
export function isDone(habit, iso) {
  return Boolean(habit?.log?.[iso]);
}

/** Every ticked day, oldest first. */
export function doneDays(habit) {
  return Object.keys(habit?.log ?? {})
    .filter((iso) => habit.log[iso])
    .sort();
}

/** How many ticks a week of this cadence is aiming for. */
export function weeklyTarget(habit) {
  return HABIT_CADENCES[habit?.cadence]?.targetPerWeek ?? 7;
}

/**
 * Current streak in consecutive ticked days.
 *
 * Today not being ticked yet does NOT break the streak — the day isn't over.
 * We start counting from today when it's ticked, otherwise from yesterday.
 */
export function currentStreak(habit, today = localISO()) {
  if (!habit?.log) return 0;
  let cursor = isDone(habit, today) ? today : addDaysISO(today, -1);
  let streak = 0;
  while (isDone(habit, cursor)) {
    streak += 1;
    cursor = addDaysISO(cursor, -1);
  }
  return streak;
}

/** Longest run of consecutive ticked days ever recorded. */
export function longestStreak(habit) {
  const days = doneDays(habit);
  if (days.length === 0) return 0;

  let best = 1;
  let run = 1;
  for (let i = 1; i < days.length; i += 1) {
    run = addDaysISO(days[i - 1], 1) === days[i] ? run + 1 : 1;
    if (run > best) best = run;
  }
  return best;
}

/** Ticks inside the current Sun–Sat week, against the cadence target. */
export function weekProgress(habit, today = localISO()) {
  const from = startOfWeekISO(today);
  const to = endOfWeekISO(today);
  const done = isoRange(from, to).filter((iso) => isDone(habit, iso)).length;
  const target = weeklyTarget(habit);
  return { done, target, ratio: target === 0 ? 0 : Math.min(1, done / target) };
}

/** Ticks inside the current calendar month, against days elapsed so far. */
export function monthProgress(habit, today = localISO()) {
  const from = startOfMonthISO(today);
  const to = endOfMonthISO(today);
  const days = isoRange(from, to);
  const done = days.filter((iso) => isDone(habit, iso)).length;
  // Target scales with the cadence over the full month.
  const target = Math.round((weeklyTarget(habit) / 7) * days.length);
  return { done, target, ratio: target === 0 ? 0 : Math.min(1, done / target) };
}

/** Share of days ticked since the habit was created (0–1). */
export function consistency(habit, today = localISO()) {
  const from = habit?.createdAt ?? today;
  const days = isoRange(from > today ? today : from, today);
  if (days.length === 0) return 0;
  const done = days.filter((iso) => isDone(habit, iso)).length;
  return done / days.length;
}

/** Everything the habit card needs, in one pass. */
export function habitStats(habit, today = localISO()) {
  return {
    doneToday: isDone(habit, today),
    streak: currentStreak(habit, today),
    best: longestStreak(habit),
    week: weekProgress(habit, today),
    month: monthProgress(habit, today),
    consistency: consistency(habit, today),
    totalDone: doneDays(habit).length,
  };
}

/** Immutably flip a day in a habit's log, dropping false entries entirely. */
export function toggleDay(habit, iso) {
  const log = { ...(habit.log ?? {}) };
  if (log[iso]) delete log[iso];
  else log[iso] = true;
  return { ...habit, log };
}
