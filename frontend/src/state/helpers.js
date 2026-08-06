/* =========================================================
   Reducer helpers

   Pure transitions shared by the reducer and by initial-state
   construction: the toast id counter, achievement sweeps and the
   day rollover.
   ========================================================= */

import { localISO, addDaysISO, ACHIEVEMENTS } from "../game/constants";

let toastId = 0;

/** Monotonic id for a toast. Module-scoped so ids never collide. */
export function nextToastId() {
  return ++toastId;
}

/**
 * Silently unlock achievements already satisfied by the loaded save.
 * No toasts — a returning hunter shouldn't be congratulated on load for
 * something they earned months ago.
 */
export function seedAchievements(state) {
  const achievements = { ...state.achievements };
  for (const a of ACHIEVEMENTS) {
    if (!achievements[a.id] && a.test(state)) achievements[a.id] = localISO();
  }
  return { ...state, achievements };
}

/** Unlock newly-earned achievements, each with a celebratory toast. */
export function sweepAchievements(state) {
  const achievements = { ...state.achievements };
  const toasts = [...state.fx.toasts];

  for (const a of ACHIEVEMENTS) {
    if (!achievements[a.id] && a.test(state)) {
      achievements[a.id] = localISO();
      toasts.push({
        id: nextToastId(),
        kind: "achievement",
        title: a.title,
        desc: a.desc,
        icon: a.icon,
        color: a.color,
      });
    }
  }
  return { ...state, achievements, fx: { ...state.fx, toasts } };
}

/**
 * Day rollover.
 *
 * Runs on load and on the 30s tick. Yesterday's cleared missions leave the
 * board and the daily quest resets. The streak survives only if yesterday's
 * quest was actually completed — but a hunter who had nothing at stake (no
 * streak, no selected missions) is never shown "MISSION FAILED".
 */
export function rollover(state) {
  const today = localISO();
  if (state.dailyDate === today) return state;

  const yesterday = addDaysISO(today, -1);
  const survived = state.dayComplete && state.dailyDate === yesterday;
  const hadProgressAtStake = state.streak > 0 || state.dailySelected.length > 0;
  const failed = !survived && hadProgressAtStake;

  return {
    ...state,
    missions: state.missions.filter((m) => m.status !== "completed"),
    dailySelected: [],
    dayComplete: false,
    dailyDate: today,
    streak: failed ? 0 : state.streak,
    fx: { ...state.fx, failed, newDay: !failed },
  };
}
