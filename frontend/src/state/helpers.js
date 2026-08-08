/* =========================================================
   Reducer helpers

   Pure transitions shared by the reducer and by initial-state
   construction: the toast id counter, achievement sweeps and the
   day rollover.
   ========================================================= */

import { localISO, addDaysISO, ACHIEVEMENTS } from "../game/constants";
import { currentRank, rankIndexOf, higherRank, evaluationFor } from "../game/rank";

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

/* ---------------- rank ----------------
 *
 * Rank is stored, not derived, for one reason: it must never go down.
 * Both functions below take the higher of what the hunter holds and what
 * they have just earned, so every path through the reducer is incapable
 * of demoting anyone even by accident.
 */

/**
 * Bring a loaded save's rank up to what its record already justifies,
 * silently. A returning hunter should not be handed a promotion
 * cinematic for something they earned months ago on another device.
 */
export function seedRank(state) {
  const today = localISO();
  const key = higherRank(state.bestRank ?? "E", currentRank(state, today).key);
  const rankLog = { ...state.rankLog };
  // The ledger is what the progression timeline reads. Backfill the rank
  // the hunter arrived holding so their history isn't a blank page, but
  // date it honestly — today is when we first observed it.
  if (!rankLog[key]) rankLog[key] = state.rankLog?.[key] ?? today;

  return { ...state, bestRank: key, bestRankIndex: rankIndexOf(key), rankLog };
}

/**
 * Promote if the hunter's record now justifies it, with the cinematic.
 *
 * A promotion is the loudest moment in the game, so it fires only on a
 * genuine increase — never on a re-evaluation that lands where it was.
 */
export function promoteRank(state) {
  const today = localISO();
  const held = state.bestRank ?? "E";
  const earned = higherRank(held, currentRank(state, today).key);
  if (rankIndexOf(earned) <= rankIndexOf(held)) return state;

  return {
    ...state,
    bestRank: earned,
    bestRankIndex: rankIndexOf(earned),
    rankLog: { ...state.rankLog, [earned]: today },
    fx: {
      ...state.fx,
      promotion: { rankKey: earned, from: held, evaluation: evaluationFor(state, today) },
    },
  };
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
