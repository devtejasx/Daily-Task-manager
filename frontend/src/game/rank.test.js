import { describe, it, expect } from "vitest";
import {
  rankByKey,
  rankIndexOf,
  nextRankFor,
  higherRank,
  hunterMetrics,
  meetsRank,
  earnedRank,
  currentRank,
  rankProgress,
  evaluationFor,
} from "./rank";
import { HUNTER_RANKS, localISO, addDaysISO } from "./constants";

const today = localISO();

/** A hunter with `days` of unbroken daily clears behind them. */
function veteran(days, overrides = {}) {
  const history = [];
  for (let i = 0; i < days; i += 1) {
    for (let n = 0; n < 3; n += 1) {
      history.push({ id: `${i}-${n}`, xp: 400, completedAt: addDaysISO(today, -i) });
    }
  }
  return {
    history,
    habits: [],
    totalXP: days * 1200,
    streak: days,
    longestStreak: days,
    comebacks: 0,
    recovery: null,
    bestRank: "E",
    ...overrides,
  };
}

const NEWBORN = {
  history: [], habits: [], totalXP: 0, streak: 0, longestStreak: 0,
  comebacks: 0, recovery: null, bestRank: "E",
};

describe("rank table lookups", () => {
  it("resolves a key to its rank", () => {
    expect(rankByKey("S").title).toBe("S-RANK HUNTER");
    expect(rankIndexOf("E")).toBe(0);
    expect(rankIndexOf("NATIONAL")).toBe(HUNTER_RANKS.length - 1);
  });

  it("falls back to E rather than crashing on an unknown key", () => {
    expect(rankByKey("Z").key).toBe("E");
    expect(rankByKey(undefined).key).toBe("E");
    expect(rankIndexOf("Z")).toBe(0);
  });

  it("walks up the table and stops at the peak", () => {
    expect(nextRankFor("E").key).toBe("D");
    expect(nextRankFor("D").key).toBe("C");
    expect(nextRankFor("A").key).toBe("S");
    expect(nextRankFor("NATIONAL")).toBeNull();
  });

  it("picks the higher of two ranks either way round", () => {
    expect(higherRank("E", "S")).toBe("S");
    expect(higherRank("S", "E")).toBe("S");
    expect(higherRank("B", "B")).toBe("B");
    expect(higherRank("NATIONAL", "junk")).toBe("NATIONAL");
  });
});

describe("the streak route (preserved from the old rules)", () => {
  const at = (streak) => earnedRank({ ...NEWBORN, longestStreak: streak }).key;

  it("earns exactly what the old five-rank table earned", () => {
    expect(at(0)).toBe("E");
    expect(at(21)).toBe("D");
    expect(at(90)).toBe("B");
    expect(at(180)).toBe("S");
    expect(at(365)).toBe("NATIONAL");
  });

  it("fills the old D-to-B gap with something to reach for", () => {
    expect(at(45)).toBe("C");
    expect(at(135)).toBe("A");
  });

  it("promotes on the exact threshold, not one day short", () => {
    expect(at(20)).toBe("E");
    expect(at(21)).toBe("D");
    expect(at(89)).toBe("C");
    expect(at(90)).toBe("B");
  });

  it("reads the personal best, so a rank survives a lost streak", () => {
    const lostIt = { ...NEWBORN, streak: 0, longestStreak: 200 };
    expect(hunterMetrics(lostIt).streak).toBe(200);
    expect(earnedRank(lostIt).key).toBe("S");
  });
});

describe("the discipline route", () => {
  it("promotes a hunter with no streak but a real record", () => {
    // Deep record, currently no streak at all — the old system called this
    // hunter E-Rank, which was the bug.
    const disciplined = {
      ...veteran(40),
      streak: 0,
      longestStreak: 0,
      bestRank: "E",
    };
    expect(hunterMetrics(disciplined).streak).toBe(0);
    expect(rankIndexOf(earnedRank(disciplined).key)).toBeGreaterThan(0);
  });

  it("needs every requirement met, not just one", () => {
    const rank = rankByKey("B");
    expect(meetsRank(rank, { level: 99, missions: 0, discipline: 0, streak: 0 })).toBe(false);
    expect(meetsRank(rank, { level: 0, missions: 9999, discipline: 0, streak: 0 })).toBe(false);
    expect(meetsRank(rank, { level: 20, missions: 150, discipline: 65, streak: 0 })).toBe(true);
  });

  it("still promotes when only the streak route is satisfied", () => {
    expect(meetsRank(rankByKey("B"), { level: 1, missions: 0, discipline: 0, streak: 90 })).toBe(true);
  });

  it("cannot be reached by mission count alone", () => {
    const spammer = {
      ...NEWBORN,
      history: Array.from({ length: 4000 }, (_, i) => ({ id: `s${i}`, xp: 10, completedAt: today })),
      totalXP: 40_000,
    };
    // Thousands of clears, all on one day: discipline stays low, so the
    // discipline route stays shut no matter how big the pile gets.
    expect(hunterMetrics(spammer).discipline).toBeLessThan(55);
    expect(["E", "D"]).toContain(earnedRank(spammer).key);
  });
});

describe("rank permanence", () => {
  it("never returns something lower than the hunter already holds", () => {
    const fallen = { ...NEWBORN, bestRank: "S" };
    expect(currentRank(fallen).key).toBe("S");
  });

  it("keeps an S-Rank badge through a completely broken streak", () => {
    const wiped = { ...veteran(200), streak: 0, longestStreak: 0, bestRank: "S", history: [] };
    expect(currentRank(wiped).key).toBe("S");
  });

  it("still promotes upward from a held rank", () => {
    const climbing = { ...NEWBORN, bestRank: "D", longestStreak: 200 };
    expect(currentRank(climbing).key).toBe("S");
  });

  it("is a high-water mark, not a checklist that must stay ticked", () => {
    // Satisfies S by streak but would fail C's discipline requirement today.
    const rested = { ...NEWBORN, longestStreak: 180, streak: 0 };
    expect(earnedRank(rested).key).toBe("S");
  });
});

describe("progress toward the next rank", () => {
  it("reports the next rank and a requirement breakdown", () => {
    const progress = rankProgress({ ...NEWBORN, bestRank: "E" });
    expect(progress.next.key).toBe("D");
    expect(progress.requirements.map((r) => r.key)).toEqual([
      "level",
      "missions",
      "discipline",
    ]);
  });

  it("stays inside 0..1", () => {
    for (const state of [NEWBORN, veteran(5), veteran(30), veteran(200)]) {
      const { progress } = rankProgress(state);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(1);
    }
  });

  it("shows the closer of the two routes rather than halving them", () => {
    // Nineteen days into a streak: nearly D by streak, nowhere near it by
    // mission count. The bar should read as nearly full.
    const nearlyThere = { ...NEWBORN, longestStreak: 19, streak: 19 };
    expect(rankProgress(nearlyThere).progress).toBeGreaterThan(0.85);
  });

  it("marks a requirement met once it is reached", () => {
    const levelled = { ...NEWBORN, totalXP: 100_000 };
    const level = rankProgress(levelled).requirements.find((r) => r.key === "level");
    expect(level.met).toBe(true);
    expect(level.progress).toBe(1);
  });

  it("reports a full bar and no next rank at the peak", () => {
    const peak = rankProgress({ ...NEWBORN, bestRank: "NATIONAL" });
    expect(peak.next).toBeNull();
    expect(peak.progress).toBe(1);
    expect(peak.requirements).toEqual([]);
  });
});

describe("the promotion evaluation", () => {
  it("reads out the numbers the cinematic shows", () => {
    const evaluation = evaluationFor(veteran(30));
    expect(evaluation).toMatchObject({
      discipline: expect.any(Number),
      consistency: expect.any(Number),
      missions: expect.any(Number),
      level: expect.any(Number),
      streak: expect.any(Number),
    });
    expect(evaluation.missions).toBe(90); // 30 days x 3 clears
  });

  it("reports percentages inside 0..100", () => {
    for (const state of [NEWBORN, veteran(3), veteran(60)]) {
      const evaluation = evaluationFor(state);
      expect(evaluation.discipline).toBeGreaterThanOrEqual(0);
      expect(evaluation.discipline).toBeLessThanOrEqual(100);
      expect(evaluation.consistency).toBeGreaterThanOrEqual(0);
      expect(evaluation.consistency).toBeLessThanOrEqual(100);
    }
  });
});
