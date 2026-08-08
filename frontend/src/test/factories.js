/* =========================================================
   Test factories

   Builders that produce fully-normalised records, so a test only has
   to state what it actually cares about.
   ========================================================= */

import { localISO, addDaysISO } from "../game/constants";
import { normalizeMission, normalizeHabit, DEFAULT_SETTINGS } from "../services/migration";

let seq = 0;
const nextId = (prefix) => `${prefix}-${++seq}`;

/** Reset ids between suites when a test asserts on exact ids. */
export function resetIds() {
  seq = 0;
}

export function makeMission(overrides = {}) {
  return normalizeMission({
    id: nextId("m"),
    title: "Clear the Inbox Dungeon",
    description: "A briefing.",
    difficulty: "C",
    priority: "MEDIUM",
    category: "Training",
    status: "active",
    xp: 300,
    dueDate: localISO(),
    dueTime: null,
    createdAt: localISO(),
    ...overrides,
  });
}

export function makeHabit(overrides = {}) {
  return normalizeHabit({
    id: nextId("h"),
    title: "Morning conditioning",
    icon: "Flame",
    color: "#06b6d4",
    cadence: "daily",
    xp: 50,
    log: {},
    createdAt: localISO(),
    ...overrides,
  });
}

/** A history entry, `daysAgo` days back. */
export function makeHistory(daysAgo = 0, overrides = {}) {
  return {
    id: nextId("hist"),
    title: "Cleared gate",
    xp: 200,
    category: "Training",
    difficulty: "C",
    completedAt: addDaysISO(localISO(), -daysAgo),
    seriesId: null,
    ...overrides,
  };
}

/** A complete, valid save payload. */
export function makeSave(overrides = {}) {
  return {
    version: 2,
    missions: [],
    history: [],
    habits: [],
    settings: { ...DEFAULT_SETTINGS },
    totalXP: 0,
    streak: 0,
    longestStreak: 0,
    bestRankIndex: 0,
    dailySelected: [],
    dailyDate: localISO(),
    dayComplete: false,
    achievements: {},
    ...overrides,
  };
}

/** A save that has already been through every migration step. */
export function makeCurrentSave(overrides = {}) {
  return makeSave({
    version: 4,
    bestRank: "E",
    rankLog: {},
    titles: {},
    activeTitle: null,
    shields: 0,
    recovery: null,
    comebacks: 0,
    dayXP: 0,
    questDays: [],
    challenge: { week: null, weeklyClaimed: false, bossAccepted: false, bossClaimed: false },
    ...overrides,
  });
}

/** Build a habit whose log covers the last `days` consecutive days. */
export function habitWithStreak(days, overrides = {}) {
  const log = {};
  for (let i = 0; i < days; i += 1) log[addDaysISO(localISO(), -i)] = true;
  return makeHabit({ log, ...overrides });
}
