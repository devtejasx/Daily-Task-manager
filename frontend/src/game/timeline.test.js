import { describe, it, expect } from "vitest";
import { buildTimeline, nextMilestone, hasReached } from "./timeline";
import { localISO, addDaysISO } from "./constants";
import { rankProgress } from "./rank";

const today = localISO();

const BLANK = {
  history: [], habits: [], achievements: {}, titles: {}, rankLog: {},
  bestRank: "E", totalXP: 0, streak: 0, longestStreak: 0, recovery: null, comebacks: 0,
};

describe("building the timeline", () => {
  it("is empty for a hunter with no record at all", () => {
    expect(buildTimeline(BLANK, today)).toEqual([]);
  });

  it("opens on the day the hunter awakened", () => {
    const state = {
      ...BLANK,
      history: [{ id: "m", xp: 100, completedAt: addDaysISO(today, -30) }],
    };
    const [first] = buildTimeline(state, today);
    expect(first.kind).toBe("awakening");
    expect(first.at).toBe(addDaysISO(today, -30));
    expect(first.day).toBe(1);
  });

  it("takes the earliest record, whether it is a mission or a habit", () => {
    const state = {
      ...BLANK,
      history: [{ id: "m", xp: 100, completedAt: addDaysISO(today, -10) }],
      habits: [{ log: { [addDaysISO(today, -40)]: true } }],
    };
    expect(buildTimeline(state, today)[0].at).toBe(addDaysISO(today, -40));
  });

  it("numbers days from the beginning of the journey", () => {
    const start = addDaysISO(today, -99);
    const state = {
      ...BLANK,
      history: [{ id: "m", xp: 100, completedAt: start }],
      rankLog: { D: addDaysISO(start, 20) },
    };
    const rank = buildTimeline(state, today).find((m) => m.kind === "rank");
    expect(rank.day).toBe(21);
  });

  it("runs oldest first", () => {
    const start = addDaysISO(today, -60);
    const state = {
      ...BLANK,
      history: [{ id: "m", xp: 100, completedAt: start }],
      rankLog: { D: addDaysISO(start, 20), C: addDaysISO(start, 45) },
      titles: { "iron-will": addDaysISO(start, 30) },
    };
    const days = buildTimeline(state, today).map((m) => m.at);
    expect([...days].sort()).toEqual(days);
  });
});

describe("what counts as a moment", () => {
  const start = addDaysISO(today, -50);
  const base = { ...BLANK, history: [{ id: "m", xp: 100, completedAt: start }] };

  it("includes rank promotions and titles", () => {
    const state = {
      ...base,
      rankLog: { D: addDaysISO(start, 10) },
      titles: { "iron-will": addDaysISO(start, 20) },
    };
    const kinds = buildTimeline(state, today).map((m) => m.kind);
    expect(kinds).toContain("rank");
    expect(kinds).toContain("title");
  });

  it("does not treat where everyone starts as a milestone", () => {
    const state = { ...base, rankLog: { E: start, D: addDaysISO(start, 10) } };
    expect(buildTimeline(state, today).some((m) => m.id === "rank-E")).toBe(false);
  });

  it("shows only the loudest achievements — this is not a log", () => {
    const state = {
      ...base,
      achievements: {
        "first-mission": start, // common
        "days-30": addDaysISO(start, 30), // rare
        "streak-180": addDaysISO(start, 40), // legendary
      },
    };
    const feats = buildTimeline(state, today).filter((m) => m.kind === "achievement");
    expect(feats.map((f) => f.id)).toEqual(["feat-streak-180"]);
  });

  it("ignores a title id that no longer exists", () => {
    const state = { ...base, titles: { "removed-title": addDaysISO(start, 5) } };
    expect(buildTimeline(state, today).some((m) => m.kind === "title")).toBe(false);
  });

  it("stays short for a long-running hunter", () => {
    const state = {
      ...base,
      history: Array.from({ length: 900 }, (_, i) => ({
        id: `h${i}`,
        xp: 100,
        completedAt: addDaysISO(start, i % 50),
      })),
      rankLog: { D: start, C: start, B: start },
    };
    // Nine hundred clears; the journey is still a handful of moments.
    expect(buildTimeline(state, today).length).toBeLessThan(20);
  });

  it("gives every moment something to render", () => {
    const state = {
      ...base,
      rankLog: { D: addDaysISO(start, 10) },
      titles: { unbreakable: addDaysISO(start, 20) },
      achievements: { "streak-180": addDaysISO(start, 30) },
    };
    for (const moment of buildTimeline(state, today)) {
      expect(moment.id).toBeTruthy();
      expect(moment.label).toBeTruthy();
      expect(moment.detail).toBeTruthy();
      expect(moment.color).toBeTruthy();
      expect(moment.icon).toBeTruthy();
      expect(moment.day).toBeGreaterThanOrEqual(1);
    }
  });
});

describe("what comes next", () => {
  it("points at the next rank, so the timeline ends on the future", () => {
    const state = { ...BLANK, bestRank: "D" };
    const next = nextMilestone(state, rankProgress(state));
    expect(next.label).toBe("C-RANK HUNTER");
    expect(next.progress).toBeGreaterThanOrEqual(0);
  });

  it("has something to say at the peak rather than nothing", () => {
    const state = { ...BLANK, bestRank: "NATIONAL" };
    const next = nextMilestone(state, rankProgress(state));
    expect(next.label).toBe("THE PEAK");
    expect(next.detail).toContain("tomorrow");
  });

  it("survives being handed no ascent at all", () => {
    expect(nextMilestone(BLANK, null).label).toBe("THE PEAK");
  });
});

describe("rank reached", () => {
  it("answers from the permanent key", () => {
    expect(hasReached({ bestRank: "S" }, "B")).toBe(true);
    expect(hasReached({ bestRank: "B" }, "S")).toBe(false);
    expect(hasReached({}, "D")).toBe(false);
  });
});
