/* =========================================================
   Selectors

   Everything the UI reads that isn't stored. Pure functions of
   state, so they can be tested without React and memoised freely.
   ========================================================= */

import { localISO, addDaysISO } from "../game/constants";

/** The missions currently assigned to today's daily quest, in slot order. */
export function selectDailyMissions(state) {
  return state.dailySelected
    .map((id) => state.missions.find((m) => m.id === id))
    .filter(Boolean);
}

/** Headline counters for the dashboard. */
export function selectStats(state) {
  const today = localISO();
  const weekAgo = addDaysISO(today, -6);
  const monthAgo = addDaysISO(today, -29);

  const weeklyXP = state.history
    .filter((h) => h.completedAt >= weekAgo)
    .reduce((sum, h) => sum + h.xp, 0);
  const monthlyXP = state.history
    .filter((h) => h.completedAt >= monthAgo)
    .reduce((sum, h) => sum + h.xp, 0);

  const active = state.missions.filter((m) => m.status === "active").length;
  const completedToday = state.missions.filter((m) => m.status === "completed").length;
  // "Seen" = everything ever cleared plus whatever is still on the board.
  const totalSeen = state.history.length + active;

  return {
    active,
    completedToday,
    totalCompleted: state.history.length,
    weeklyXP,
    monthlyXP,
    completionRate: totalSeen === 0 ? 0 : state.history.length / totalSeen,
  };
}

/** XP per day for the last 7 days, oldest first (dashboard chart). */
export function selectWeeklySeries(state) {
  const today = localISO();
  return Array.from({ length: 7 }, (_, i) => {
    const day = addDaysISO(today, i - 6);
    const xp = state.history
      .filter((h) => h.completedAt === day)
      .reduce((sum, h) => sum + h.xp, 0);
    return { day, xp };
  });
}
