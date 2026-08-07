import { describe, it, expect } from "vitest";
import {
  localISO,
  addDaysISO,
  xpNeededForLevel,
  getLevelInfo,
  missionXPForLevel,
  rankIndexForStreak,
  nextRank,
  HUNTER_RANKS,
  ACHIEVEMENTS,
  SHIELD_EVERY,
  SHIELD_MAX,
  RECOVERY_WINDOW_DAYS,
  COMEBACK_XP,
  shieldsEarnedAt,
  daysToNextShield,
} from "./constants";

describe("local date helpers", () => {
  it("formats a Date as a local YYYY-MM-DD string", () => {
    expect(localISO(new Date(2026, 7, 6))).toBe("2026-08-06");
    expect(localISO(new Date(2026, 0, 1))).toBe("2026-01-01");
  });

  it("does not shift the day across a UTC boundary", () => {
    // 23:30 local on the 6th is the 7th in UTC for anywhere east of GMT; the
    // hunter's "today" must stay the 6th regardless.
    expect(localISO(new Date(2026, 7, 6, 23, 30))).toBe("2026-08-06");
    expect(localISO(new Date(2026, 7, 6, 0, 15))).toBe("2026-08-06");
  });

  it("adds and subtracts days across month and year ends", () => {
    expect(addDaysISO("2026-08-06", 1)).toBe("2026-08-07");
    expect(addDaysISO("2026-08-31", 1)).toBe("2026-09-01");
    expect(addDaysISO("2026-01-01", -1)).toBe("2025-12-31");
    expect(addDaysISO("2024-02-28", 1)).toBe("2024-02-29"); // leap year
  });
});

describe("XP curve", () => {
  it("increases the requirement with each level", () => {
    expect(xpNeededForLevel(1)).toBe(1000);
    expect(xpNeededForLevel(2)).toBe(1400);
    expect(xpNeededForLevel(5)).toBe(2600);
    expect(xpNeededForLevel(3)).toBeGreaterThan(xpNeededForLevel(2));
  });

  it("starts a new hunter at level 1 with no progress", () => {
    const info = getLevelInfo(0);
    expect(info).toMatchObject({ level: 1, xpInLevel: 0, xpNeeded: 1000, xpToNext: 1000 });
    expect(info.progress).toBe(0);
  });

  it("keeps a hunter on the level until the threshold is crossed", () => {
    expect(getLevelInfo(999).level).toBe(1);
    expect(getLevelInfo(1000).level).toBe(2);
    expect(getLevelInfo(1000).xpInLevel).toBe(0);
  });

  it("carries the remainder into the new level", () => {
    const info = getLevelInfo(1250);
    expect(info.level).toBe(2);
    expect(info.xpInLevel).toBe(250);
    expect(info.xpToNext).toBe(1400 - 250);
    expect(info.progress).toBeCloseTo(250 / 1400, 6);
  });

  it("stays consistent: xpInLevel + xpToNext always equals xpNeeded", () => {
    for (const xp of [0, 1, 999, 1000, 5_000, 50_000, 250_000]) {
      const info = getLevelInfo(xp);
      expect(info.xpInLevel + info.xpToNext).toBe(info.xpNeeded);
    }
  });

  it("is monotonic — more XP never means a lower level", () => {
    let previous = 0;
    for (let xp = 0; xp <= 60_000; xp += 700) {
      const level = getLevelInfo(xp).level;
      expect(level).toBeGreaterThanOrEqual(previous);
      previous = level;
    }
  });
});

describe("default mission XP", () => {
  it("follows the early table then grows, capped at 1000", () => {
    expect(missionXPForLevel(1)).toBe(300);
    expect(missionXPForLevel(4)).toBe(500);
    expect(missionXPForLevel(5)).toBe(600);
    expect(missionXPForLevel(9)).toBe(1000);
    expect(missionXPForLevel(50)).toBe(1000);
  });
});

describe("hunter ranks", () => {
  it("maps a streak to the highest rank it has earned", () => {
    expect(rankIndexForStreak(0)).toBe(0);
    expect(rankIndexForStreak(20)).toBe(0);
    expect(rankIndexForStreak(21)).toBe(1);
    expect(rankIndexForStreak(89)).toBe(1);
    expect(rankIndexForStreak(90)).toBe(2);
    expect(rankIndexForStreak(180)).toBe(3);
    expect(rankIndexForStreak(365)).toBe(4);
    expect(rankIndexForStreak(10_000)).toBe(HUNTER_RANKS.length - 1);
  });

  it("reports the next rank, and null at the peak", () => {
    expect(nextRank(0).key).toBe("D");
    expect(nextRank(HUNTER_RANKS.length - 1)).toBeNull();
  });

  it("keeps the rank table ordered by streak requirement", () => {
    const streaks = HUNTER_RANKS.map((r) => r.streak);
    expect([...streaks].sort((a, b) => a - b)).toEqual(streaks);
  });
});

describe("achievements", () => {
  it("has unique ids", () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("stays locked for a brand-new hunter", () => {
    const fresh = { history: [], totalXP: 0, longestStreak: 0, bestRankIndex: 0 };
    expect(ACHIEVEMENTS.filter((a) => a.test(fresh))).toEqual([]);
  });

  it("unlocks on the exact threshold, not one short of it", () => {
    const byId = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));
    const base = { history: [], totalXP: 0, longestStreak: 0, bestRankIndex: 0 };

    expect(byId["xp-1000"].test({ ...base, totalXP: 999 })).toBe(false);
    expect(byId["xp-1000"].test({ ...base, totalXP: 1000 })).toBe(true);

    expect(byId["missions-10"].test({ ...base, history: Array(9).fill({}) })).toBe(false);
    expect(byId["missions-10"].test({ ...base, history: Array(10).fill({}) })).toBe(true);

    expect(byId["streak-21"].test({ ...base, longestStreak: 20 })).toBe(false);
    expect(byId["streak-21"].test({ ...base, longestStreak: 21 })).toBe(true);
  });
});

describe("Resolve system", () => {
  it("forges a shield every SHIELD_EVERY consecutive days", () => {
    expect(shieldsEarnedAt(SHIELD_EVERY)).toBe(1);
    expect(shieldsEarnedAt(SHIELD_EVERY * 2)).toBe(1);
    expect(shieldsEarnedAt(SHIELD_EVERY * 3)).toBe(1);
  });

  it("forges nothing on the days in between", () => {
    expect(shieldsEarnedAt(1)).toBe(0);
    expect(shieldsEarnedAt(SHIELD_EVERY - 1)).toBe(0);
    expect(shieldsEarnedAt(SHIELD_EVERY + 1)).toBe(0);
  });

  it("never forges a shield from a zero or negative streak", () => {
    expect(shieldsEarnedAt(0)).toBe(0);
    expect(shieldsEarnedAt(-7)).toBe(0);
  });

  it("counts down the days remaining to the next shield", () => {
    expect(daysToNextShield(0)).toBe(SHIELD_EVERY);
    expect(daysToNextShield(1)).toBe(SHIELD_EVERY - 1);
    expect(daysToNextShield(SHIELD_EVERY)).toBe(SHIELD_EVERY);
    expect(daysToNextShield(SHIELD_EVERY + 2)).toBe(SHIELD_EVERY - 2);
  });

  it("keeps the forgiving buffer within a meaningful cap", () => {
    expect(SHIELD_MAX).toBeGreaterThan(0);
    expect(SHIELD_MAX).toBeLessThanOrEqual(5);
    expect(RECOVERY_WINDOW_DAYS).toBeGreaterThanOrEqual(1);
    expect(COMEBACK_XP).toBeGreaterThan(0);
  });
});
