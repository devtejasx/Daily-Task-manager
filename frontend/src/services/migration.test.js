import { describe, it, expect } from "vitest";
import {
  migrateSave,
  normalizeMission,
  normalizeHabit,
  mergeSettings,
  DEFAULT_SETTINGS,
  SCHEMA_VERSION,
} from "./migration";

/** A v1 save exactly as an existing hunter's document would look. */
function legacySave() {
  return {
    missions: [
      {
        id: "m-1",
        title: "Workout — Morning Training",
        description: "45 minutes of strength training.",
        difficulty: "C",
        priority: "HIGH",
        dueDate: "2026-08-01",
        dueTime: "07:30",
        status: "active",
        xp: 300,
        category: "Training",
        createdAt: "2026-07-29",
      },
    ],
    history: [
      { id: "h-1", title: "Sharpen the Blade", xp: 180, category: "Training", difficulty: "C", completedAt: "2026-07-31" },
    ],
    totalXP: 4820,
    streak: 34,
    longestStreak: 51,
    bestRankIndex: 1,
    dailySelected: ["m-1"],
    dailyDate: "2026-08-01",
    dayComplete: true,
    achievements: { "first-mission": "2026-07-20", "xp-1000": "2026-07-24" },
  };
}

describe("migrateSave", () => {
  it("returns null for a missing or non-object save", () => {
    expect(migrateSave(null)).toBeNull();
    expect(migrateSave(undefined)).toBeNull();
    expect(migrateSave("not a save")).toBeNull();
  });

  it("loses NOTHING an existing hunter already had", () => {
    const before = legacySave();
    const after = migrateSave(before);

    expect(after.totalXP).toBe(4820);
    expect(after.streak).toBe(34);
    expect(after.longestStreak).toBe(51);
    expect(after.bestRankIndex).toBe(1);
    expect(after.dailySelected).toEqual(["m-1"]);
    expect(after.dailyDate).toBe("2026-08-01");
    expect(after.dayComplete).toBe(true);
    expect(after.achievements).toEqual(before.achievements);
    expect(after.history).toEqual(before.history);
    expect(after.missions[0]).toMatchObject({
      id: "m-1",
      title: "Workout — Morning Training",
      xp: 300,
      dueTime: "07:30",
      category: "Training",
    });
  });

  it("stamps the current schema version", () => {
    expect(migrateSave(legacySave()).version).toBe(SCHEMA_VERSION);
  });

  it("adds the v2 fields with safe defaults", () => {
    const mission = migrateSave(legacySave()).missions[0];
    expect(mission.recurrence).toBeNull();
    expect(mission.reminder).toBeNull();
    expect(mission.endDate).toBeNull();
    expect(mission.seriesId).toBeNull();
    expect(typeof mission.order).toBe("number");
  });

  it("introduces habits and settings that a v1 save never had", () => {
    const after = migrateSave(legacySave());
    expect(after.habits).toEqual([]);
    expect(after.settings).toMatchObject({
      theme: DEFAULT_SETTINGS.theme,
      animations: true,
    });
  });

  it("is idempotent — running it twice changes nothing", () => {
    const once = migrateSave(legacySave());
    const twice = migrateSave(once);
    expect(twice).toEqual(once);
  });

  it("preserves fields written by a newer client (forward compatible)", () => {
    const future = { ...legacySave(), someFutureField: { keep: "me" } };
    expect(migrateSave(future).someFutureField).toEqual({ keep: "me" });
  });

  it("does not overwrite values the hunter already set", () => {
    const save = {
      ...legacySave(),
      version: 2,
      settings: { theme: "ember", animations: false },
    };
    const after = migrateSave(save);
    expect(after.settings.theme).toBe("ember");
    expect(after.settings.animations).toBe(false);
    // ...while still filling in what was missing
    expect(after.settings.notifications).toEqual(DEFAULT_SETTINGS.notifications);
  });

  it("assigns distinct order values so drag & drop has something to sort", () => {
    const save = {
      ...legacySave(),
      missions: [
        { id: "a", title: "A" },
        { id: "b", title: "B" },
        { id: "c", title: "C" },
      ],
    };
    const orders = migrateSave(save).missions.map((m) => m.order);
    expect(new Set(orders).size).toBe(3);
  });

  it("heals a save with missing arrays instead of throwing", () => {
    const after = migrateSave({ totalXP: 100 });
    expect(after.missions).toEqual([]);
    expect(after.history).toEqual([]);
    expect(after.habits).toEqual([]);
  });
});

describe("normalizeMission", () => {
  it("fills every required field for a bare record", () => {
    const mission = normalizeMission({ id: "x" });
    expect(mission).toMatchObject({
      id: "x",
      title: "Untitled mission",
      status: "active",
      difficulty: "C",
      priority: "MEDIUM",
      xp: 0,
    });
    expect(mission.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("coerces a string XP to a number", () => {
    expect(normalizeMission({ id: "x", xp: "450" }).xp).toBe(450);
    expect(normalizeMission({ id: "x", xp: "nonsense" }).xp).toBe(0);
  });

  it("repairs a malformed recurrence rule rather than dropping it", () => {
    const rule = normalizeMission({
      id: "x",
      recurrence: { type: "fortnightly", interval: -3 },
    }).recurrence;

    expect(rule.type).toBe("daily"); // unknown type falls back
    expect(rule.interval).toBe(1); // negative interval clamped
    expect(rule.paused).toBe(false);
  });

  it("keeps an order of 0 instead of treating it as missing", () => {
    expect(normalizeMission({ id: "x", order: 0 }, 7).order).toBe(0);
  });
});

describe("normalizeHabit", () => {
  it("fills defaults and guarantees a log object", () => {
    const habit = normalizeHabit({ id: "h" });
    expect(habit).toMatchObject({ title: "Untitled habit", cadence: "daily", xp: 50 });
    expect(habit.log).toEqual({});
  });

  it("replaces a corrupted log with an empty one", () => {
    expect(normalizeHabit({ id: "h", log: "broken" }).log).toEqual({});
  });
});

describe("mergeSettings", () => {
  it("deep-merges nested blocks, letting stored values win", () => {
    const merged = mergeSettings({
      theme: "frost",
      notifications: { enabled: true },
      defaults: { priority: "CRITICAL" },
    });

    expect(merged.theme).toBe("frost");
    expect(merged.notifications.enabled).toBe(true);
    expect(merged.notifications.reminders).toBe(DEFAULT_SETTINGS.notifications.reminders);
    expect(merged.defaults.priority).toBe("CRITICAL");
    expect(merged.defaults.difficulty).toBe(DEFAULT_SETTINGS.defaults.difficulty);
  });

  it("returns the defaults for null or nonsense input", () => {
    expect(mergeSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(mergeSettings("nope")).toEqual(DEFAULT_SETTINGS);
  });
});
