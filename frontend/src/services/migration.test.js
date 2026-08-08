import { describe, it, expect } from "vitest";
import {
  migrateSave,
  normalizeMission,
  normalizeHabit,
  mergeSettings,
  DEFAULT_SETTINGS,
  SCHEMA_VERSION,
  normalizeRecovery,
  normalizeUnlockMap,
  normalizeQuestDays,
  normalizeChallenge,
  LEGACY_RANK_KEYS,
  QUEST_DAYS_KEPT,
} from "./migration";
import { SHIELD_MAX } from "../game/constants";

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

describe("v2 -> v3 (the Resolve system)", () => {
  it("credits a returning hunter with a full shield buffer", () => {
    // They earned that streak under the old rules, where one missed day wiped
    // it. Arriving with an empty buffer would be a harsher game than they left.
    const out = migrateSave({ version: 2, streak: 40, missions: [], history: [] });
    expect(out.shields).toBe(SHIELD_MAX);
  });

  it("leaves a hunter with no streak at zero shields", () => {
    const out = migrateSave({ version: 2, streak: 0, missions: [], history: [] });
    expect(out.shields).toBe(0);
  });

  it("never overwrites a shield count the hunter already has", () => {
    const out = migrateSave({ version: 2, streak: 40, shields: 1, missions: [], history: [] });
    expect(out.shields).toBe(1);
  });

  it("defaults a save with no recovery entry to none pending", () => {
    expect(migrateSave(legacySave()).recovery).toBe(null);
  });

  it("keeps a well-formed recovery entry intact", () => {
    const out = migrateSave({
      version: 3,
      recovery: { streak: 12, since: "2026-08-01" },
      missions: [],
      history: [],
    });
    expect(out.recovery).toEqual({ streak: 12, since: "2026-08-01" });
  });

  it("discards a malformed recovery entry rather than trusting it", () => {
    expect(normalizeRecovery({ streak: 0, since: "2026-08-01" })).toBe(null);
    expect(normalizeRecovery({ streak: 5 })).toBe(null);
    expect(normalizeRecovery("nonsense")).toBe(null);
    expect(normalizeRecovery(null)).toBe(null);
  });

  it("is idempotent — migrating twice changes nothing", () => {
    const once = migrateSave({ version: 2, streak: 40, missions: [], history: [] });
    expect(migrateSave(once)).toEqual(once);
  });
});

/* =========================================================
   v3 -> v4 — the progression ledgers
   ========================================================= */

describe("v4: the permanent rank key", () => {
  it("translates every v3 rank index to the rank it actually meant", () => {
    LEGACY_RANK_KEYS.forEach((key, index) => {
      const out = migrateSave({ version: 3, bestRankIndex: index, missions: [], history: [] });
      expect(out.bestRank).toBe(key);
    });
  });

  it("does not demote an S-Rank hunter when C and A join the table", () => {
    // v3 stored S-Rank as index 3. Read against a table that now contains
    // E,D,C,B,A,S,NATIONAL, a naive index would have read as B-Rank.
    const out = migrateSave({ version: 3, bestRankIndex: 3, missions: [], history: [] });
    expect(out.bestRank).toBe("S");
  });

  it("leaves the original index in place for an older client to read", () => {
    const out = migrateSave({ version: 3, bestRankIndex: 4, missions: [], history: [] });
    expect(out.bestRankIndex).toBe(4);
    expect(out.bestRank).toBe("NATIONAL");
  });

  it("starts a hunter with no rank history at E-Rank", () => {
    expect(migrateSave({ version: 3, missions: [], history: [] }).bestRank).toBe("E");
    expect(migrateSave({ missions: [], history: [] }).bestRank).toBe("E");
  });

  it("clamps an index from outside the legacy table rather than crashing", () => {
    expect(migrateSave({ version: 3, bestRankIndex: 99, missions: [] }).bestRank).toBe("NATIONAL");
    expect(migrateSave({ version: 3, bestRankIndex: -4, missions: [] }).bestRank).toBe("E");
    expect(migrateSave({ version: 3, bestRankIndex: "junk", missions: [] }).bestRank).toBe("E");
  });

  it("never overwrites a rank key the hunter already has", () => {
    const out = migrateSave({ version: 3, bestRankIndex: 0, bestRank: "A", missions: [] });
    expect(out.bestRank).toBe("A");
  });
});

describe("v4: unlock ledgers", () => {
  it("gives an existing hunter empty title and rank ledgers", () => {
    const out = migrateSave(legacySave());
    expect(out.titles).toEqual({});
    expect(out.rankLog).toEqual({});
    expect(out.activeTitle).toBe(null);
  });

  it("keeps ledger entries that are real unlock dates", () => {
    const map = normalizeUnlockMap({ "iron-will": "2026-03-04", relentless: "2026-05-19" });
    expect(map).toEqual({ "iron-will": "2026-03-04", relentless: "2026-05-19" });
  });

  it("drops ledger entries that are not dates", () => {
    expect(normalizeUnlockMap({ a: true, b: 5, c: null, d: "" })).toEqual({});
    expect(normalizeUnlockMap(["not", "a", "map"])).toEqual({});
    expect(normalizeUnlockMap("nonsense")).toEqual({});
    expect(normalizeUnlockMap(null)).toEqual({});
  });

  it("preserves an existing title selection through a migration", () => {
    const out = migrateSave({
      version: 3,
      titles: { "iron-will": "2026-03-04" },
      activeTitle: "iron-will",
      missions: [],
    });
    expect(out.activeTitle).toBe("iron-will");
    expect(out.titles["iron-will"]).toBe("2026-03-04");
  });
});

describe("v4: cleared quest days", () => {
  it("defaults to nothing recorded", () => {
    expect(migrateSave(legacySave()).questDays).toEqual([]);
  });

  it("sorts, de-duplicates and keeps only real ISO days", () => {
    expect(normalizeQuestDays(["2026-03-02", "2026-03-01", "2026-03-02", "junk", 7, null])).toEqual([
      "2026-03-01",
      "2026-03-02",
    ]);
  });

  it("keeps the most recent days when the ledger is over-long", () => {
    const days = Array.from({ length: QUEST_DAYS_KEPT + 40 }, (_, i) => {
      const d = new Date(2024, 0, 1 + i);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    });
    const kept = normalizeQuestDays(days);
    expect(kept).toHaveLength(QUEST_DAYS_KEPT);
    expect(kept[kept.length - 1]).toBe(days[days.length - 1]); // newest survives
  });

  it("discards a ledger that isn't a list", () => {
    expect(normalizeQuestDays("2026-03-01")).toEqual([]);
    expect(normalizeQuestDays(null)).toEqual([]);
  });
});

describe("v4: the challenge slice", () => {
  it("starts with no week claimed and no boss accepted", () => {
    expect(migrateSave(legacySave()).challenge).toEqual({
      week: null,
      weeklyClaimed: false,
      bossAccepted: false,
      bossClaimed: false,
    });
  });

  it("keeps a week's claim state intact", () => {
    expect(normalizeChallenge({ week: "2026-08-03", weeklyClaimed: true, bossAccepted: true })).toEqual(
      { week: "2026-08-03", weeklyClaimed: true, bossAccepted: true, bossClaimed: false }
    );
  });

  it("coerces junk to a safe, unclaimed week", () => {
    expect(normalizeChallenge("nonsense").week).toBe(null);
    expect(normalizeChallenge({ week: 42 }).week).toBe(null);
    expect(normalizeChallenge(undefined).weeklyClaimed).toBe(false);
  });
});

describe("v4: nothing is lost or recomputed", () => {
  it("carries a v1 hunter all the way to v4 with their progress intact", () => {
    const out = migrateSave({ ...legacySave(), totalXP: 48_000, streak: 63, longestStreak: 140 });
    expect(out.version).toBe(SCHEMA_VERSION);
    expect(out.totalXP).toBe(48_000);
    expect(out.streak).toBe(63);
    expect(out.longestStreak).toBe(140);
  });

  it("leaves XP, levels, achievements and personal bests untouched", () => {
    const save = {
      version: 3,
      totalXP: 91_500,
      longestStreak: 212,
      bestRankIndex: 3,
      achievements: { "first-mission": "2025-01-04", "streak-180": "2025-08-02" },
      comebacks: 4,
      missions: [],
      history: [],
    };
    const out = migrateSave(save);
    expect(out.totalXP).toBe(91_500);
    expect(out.longestStreak).toBe(212);
    expect(out.achievements).toEqual(save.achievements);
    expect(out.comebacks).toBe(4);
  });

  it("defaults today's XP counter to zero without touching lifetime XP", () => {
    const out = migrateSave({ version: 3, totalXP: 12_000, missions: [], history: [] });
    expect(out.dayXP).toBe(0);
    expect(out.totalXP).toBe(12_000);
  });

  it("is idempotent at v4 too — migrating twice changes nothing", () => {
    const once = migrateSave({
      version: 3,
      bestRankIndex: 2,
      titles: { "iron-will": "2026-01-01" },
      questDays: ["2026-01-01"],
      missions: [],
      history: [],
    });
    expect(migrateSave(once)).toEqual(once);
  });

  it("survives a document that was written half-way through a failed save", () => {
    const out = migrateSave({
      version: 4,
      bestRank: null,
      rankLog: "corrupt",
      titles: undefined,
      questDays: {},
      challenge: 7,
      missions: [],
      history: [],
    });
    expect(out.bestRank).toBe("E");
    expect(out.rankLog).toEqual({});
    expect(out.titles).toEqual({});
    expect(out.questDays).toEqual([]);
    expect(out.challenge.week).toBe(null);
  });
});
