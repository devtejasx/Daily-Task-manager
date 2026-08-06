/* =========================================================
   Save-schema migration

   The whole game lives in ONE Firestore document per user
   (services/saveService). Rather than versioning collections we
   version the payload and upgrade it in place on load, so an
   existing hunter who has not opened the app in months still gets
   every new field with a sane default and loses nothing.

   Rules for every migration step:
     - never delete a field we don't recognise (forward compatible)
     - never overwrite a value the user already has
     - be idempotent: running it twice must be a no-op
   ========================================================= */

import { localISO, POMODORO_DEFAULTS } from "../game/constants";

/** Current payload version. Bump + add a step when the shape changes. */
export const SCHEMA_VERSION = 2;

/** Preferences a brand-new hunter starts with. */
export const DEFAULT_SETTINGS = {
  theme: "arcane", // arcane | shadow | frost | ember
  animations: true,
  dimmed: false,
  reduceMotion: false,
  sound: true,
  notifications: {
    enabled: false, // flipped on once the browser grants permission
    reminders: true,
    pomodoro: true,
    dailyDigest: false,
  },
  defaults: {
    priority: "MEDIUM",
    xp: null, // null -> scale with hunter level (missionXPForLevel)
    reminder: null, // minutes before due, null = no reminder
    difficulty: "C",
    category: "Training",
  },
  pomodoro: { ...POMODORO_DEFAULTS },
};

/** Fields every mission is guaranteed to have from v2 onwards. */
export function normalizeMission(mission, index = 0) {
  return {
    // preserve anything unknown so a newer client's fields survive a round trip
    ...mission,
    id: mission.id,
    title: mission.title ?? "Untitled mission",
    description: mission.description ?? "",
    difficulty: mission.difficulty ?? "C",
    priority: mission.priority ?? "MEDIUM",
    category: mission.category ?? "Training",
    status: mission.status ?? "active",
    xp: Number(mission.xp) || 0,
    dueDate: mission.dueDate ?? localISO(),
    dueTime: mission.dueTime ?? null,
    endDate: mission.endDate ?? null, // multi-day missions span dueDate..endDate
    createdAt: mission.createdAt ?? localISO(),
    // v2 additions
    order: Number.isFinite(mission.order) ? mission.order : index,
    reminder: mission.reminder ?? null,
    reminderFiredAt: mission.reminderFiredAt ?? null,
    recurrence: normalizeRecurrence(mission.recurrence),
    seriesId: mission.seriesId ?? null,
    occurrence: Number.isFinite(mission.occurrence) ? mission.occurrence : 0,
  };
}

function normalizeRecurrence(recurrence) {
  if (!recurrence) return null;
  const type = ["daily", "weekly", "monthly", "custom"].includes(recurrence.type)
    ? recurrence.type
    : "daily";
  return {
    type,
    interval: Math.max(1, Number(recurrence.interval) || 1),
    paused: Boolean(recurrence.paused),
    skipped: Number(recurrence.skipped) || 0,
    completed: Number(recurrence.completed) || 0,
  };
}

/** Fields every habit is guaranteed to have. */
export function normalizeHabit(habit, index = 0) {
  return {
    ...habit,
    id: habit.id,
    title: habit.title ?? "Untitled habit",
    icon: habit.icon ?? "Flame",
    color: habit.color ?? "#06b6d4",
    cadence: habit.cadence ?? "daily",
    xp: Number(habit.xp) || 50,
    log: habit.log && typeof habit.log === "object" ? habit.log : {}, // { "YYYY-MM-DD": true }
    createdAt: habit.createdAt ?? localISO(),
    order: Number.isFinite(habit.order) ? habit.order : index,
    archived: Boolean(habit.archived),
  };
}

/** Deep-merge stored settings over the defaults (stored values win). */
export function mergeSettings(stored) {
  const s = stored && typeof stored === "object" ? stored : {};
  return {
    ...DEFAULT_SETTINGS,
    ...s,
    notifications: { ...DEFAULT_SETTINGS.notifications, ...(s.notifications || {}) },
    defaults: { ...DEFAULT_SETTINGS.defaults, ...(s.defaults || {}) },
    pomodoro: { ...DEFAULT_SETTINGS.pomodoro, ...(s.pomodoro || {}) },
  };
}

/* ---------------- migration steps ---------------- */

/**
 * v1 -> v2
 * Adds mission ordering, recurrence, reminders and multi-day spans; introduces
 * the habits list and the persisted settings block. Nothing is removed.
 */
function toV2(save) {
  return {
    ...save,
    missions: (save.missions || []).map(normalizeMission),
    habits: (save.habits || []).map(normalizeHabit),
    settings: mergeSettings(save.settings),
    version: 2,
  };
}

const STEPS = [
  { to: 2, run: toV2 },
];

/**
 * Upgrade a raw cloud payload to the current schema.
 * Safe to call with null (a brand-new hunter) or an already-current save.
 */
export function migrateSave(save) {
  if (!save || typeof save !== "object") return null;

  let out = save;
  // Saves written before versioning simply have no `version` field.
  let version = Number(out.version) || 1;

  for (const step of STEPS) {
    if (version < step.to) {
      out = step.run(out);
      version = step.to;
    }
  }

  // Re-run normalisation even on current saves: it is idempotent and it heals
  // documents that were written by a partially-failed client.
  return {
    ...out,
    version: SCHEMA_VERSION,
    missions: (out.missions || []).map(normalizeMission),
    habits: (out.habits || []).map(normalizeHabit),
    settings: mergeSettings(out.settings),
  };
}
