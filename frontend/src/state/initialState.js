/* =========================================================
   Initial state

   A brand-new hunter (and any signed-out guest) starts completely
   EMPTY: no missions, no history, no XP, no streak, no achievements.
   Existing users are unaffected — their migrated save is spread over
   the fresh shape, overriding every field.
   ========================================================= */

import { localISO } from "../game/constants";
import { migrateSave, mergeSettings, SCHEMA_VERSION, DEFAULT_SETTINGS } from "../services/migration";
import { rollover, seedAchievements } from "./helpers";

/** The transient FX queue — never persisted. */
export function freshFx() {
  return { levelUp: null, promotion: null, failed: false, newDay: false, toasts: [] };
}

export function freshState() {
  return {
    version: SCHEMA_VERSION,
    missions: [],
    history: [], // [{id,title,xp,category,difficulty,completedAt}]
    habits: [], // [{id,title,icon,color,cadence,xp,log:{ISO:true}}]
    settings: { ...DEFAULT_SETTINGS },
    totalXP: 0,
    streak: 0,
    longestStreak: 0,
    bestRankIndex: 0,
    shields: 0, // banked Streak Shields (see game/constants — the Resolve system)
    recovery: null, // {streak,since} — a preserved streak awaiting its comeback
    dailySelected: [],
    dailyDate: localISO(),
    dayComplete: false,
    achievements: {}, // {id: unlockedISO}
    fx: freshFx(),
  };
}

/**
 * Build the initial reducer state from a cloud save (or null for a new
 * hunter). Old saves are upgraded by services/migration before they reach
 * the reducer, so every field is guaranteed to exist from here on.
 *
 * A corrupt save falls back to a fresh hunter rather than crashing the app.
 */
export function loadState(cloudSave) {
  try {
    if (!cloudSave) return rollover(seedAchievements(freshState()));

    const base = { ...freshState(), ...migrateSave(cloudSave) };
    base.settings = mergeSettings(base.settings);
    base.fx = freshFx();
    return rollover(base);
  } catch {
    return rollover(seedAchievements(freshState()));
  }
}
