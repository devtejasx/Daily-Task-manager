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
 * board and the daily quest resets.
 *
 * A missed day never costs XP, levels, achievements or a personal best —
 * those are permanent. Only the current streak is ever at stake, and the
 * Resolve system spends a banked shield to keep even that intact. A hunter
 * who had nothing at stake (no streak, no selected missions) is never told
 * anything at all.
 */
export function rollover(state) {
  const today = localISO();
  if (state.dailyDate === today) return state;

  const yesterday = addDaysISO(today, -1);
  const survived = state.dayComplete && state.dailyDate === yesterday;
  const hadProgressAtStake = state.streak > 0 || state.dailySelected.length > 0;
  const missed = !survived && hadProgressAtStake;

  const base = {
    ...state,
    missions: state.missions.filter((m) => m.status !== "completed"),
    dailySelected: [],
    dayComplete: false,
    dailyDate: today,
  };

  if (!missed) return { ...base, fx: { ...state.fx, newDay: true } };

  // Resolve spent: the shield takes the hit and the climb continues.
  const shields = state.shields ?? 0;
  if (shields > 0) {
    return {
      ...base,
      shields: shields - 1,
      fx: {
        ...state.fx,
        shielded: { streak: state.streak, remaining: shields - 1 },
      },
    };
  }

  // No shield left. A streak still isn't destroyed on the spot — it is held
  // in recovery for one day. Clear today's quest and the whole climb comes
  // back. A recovery already pending here means that day came and went.
  if (state.recovery) {
    return {
      ...base,
      streak: 0,
      recovery: null,
      fx: { ...state.fx, reset: { previous: state.recovery.streak } },
    };
  }

  return {
    ...base,
    streak: 0,
    recovery: { streak: state.streak, since: today },
    fx: { ...state.fx, preserved: { streak: state.streak } },
  };
}
