import { describe, it, expect } from "vitest";
import {
  computeSummary,
  categoryBreakdown,
  topCategory,
  activeDays,
  averagePerDay,
  dailySeries,
  weeklySeries,
  heatmap,
  longestActiveRun,
  weeklyReport,
} from "./analytics";
import { makeHistory, makeMission } from "../test/factories";
import { localISO, addDaysISO } from "../game/constants";

const today = localISO();

describe("computeSummary", () => {
  it("reports zeroes for a brand-new hunter without dividing by zero", () => {
    const summary = computeSummary({ missions: [], history: [], totalXP: 0 });
    expect(summary.completionRate).toBe(0);
    expect(summary.averagePerDay).toBe(0);
    expect(summary.topCategory).toBeNull();
    expect(Number.isNaN(summary.completionRate)).toBe(false);
  });

  it("measures completion rate against cleared plus still-pending", () => {
    const state = {
      missions: [makeMission(), makeMission(), makeMission({ status: "completed" })],
      history: [makeHistory(0), makeHistory(1)],
      totalXP: 400,
    };
    // 2 cleared, 2 still pending (the completed board mission isn't counted
    // twice — history is the record of truth)
    expect(computeSummary(state).completionRate).toBeCloseTo(2 / 4, 6);
  });

  it("windows weekly XP to the last 7 days and monthly to the last 30", () => {
    const state = {
      missions: [],
      totalXP: 0,
      history: [
        makeHistory(0, { xp: 100 }),
        makeHistory(6, { xp: 200 }), // inside the 7-day window
        makeHistory(7, { xp: 400 }), // outside it, inside 30
        makeHistory(29, { xp: 800 }), // inside 30
        makeHistory(45, { xp: 1600 }), // outside both
      ],
    };
    const summary = computeSummary(state);
    expect(summary.weeklyXP).toBe(300);
    expect(summary.monthlyXP).toBe(1500);
  });
});

describe("categoryBreakdown", () => {
  it("aggregates count and XP per category, busiest first", () => {
    const history = [
      makeHistory(0, { category: "Training", xp: 100 }),
      makeHistory(1, { category: "Training", xp: 200 }),
      makeHistory(2, { category: "Guild", xp: 900 }),
    ];
    const breakdown = categoryBreakdown(history);

    expect(breakdown[0]).toMatchObject({ category: "Training", count: 2, xp: 300 });
    expect(breakdown[1]).toMatchObject({ category: "Guild", count: 1, xp: 900 });
    expect(topCategory(history).category).toBe("Training");
  });

  it("breaks a count tie on XP", () => {
    const [first] = categoryBreakdown([
      makeHistory(0, { category: "Craft", xp: 50 }),
      makeHistory(1, { category: "Dungeon", xp: 900 }),
    ]);
    expect(first.category).toBe("Dungeon");
  });

  it("buckets entries with no category rather than dropping them", () => {
    const breakdown = categoryBreakdown([makeHistory(0, { category: undefined })]);
    expect(breakdown[0]).toMatchObject({ category: "Uncategorised", count: 1 });
  });
});

describe("averagePerDay", () => {
  it("measures across the whole span, not only the active days", () => {
    // Two clears ten days apart: the hunter showed up twice in eleven days.
    const history = [makeHistory(10), makeHistory(0)];
    expect(averagePerDay(history)).toBeCloseTo(2 / 11, 6);
  });

  it("counts a single-day span as one day, never zero", () => {
    expect(averagePerDay([makeHistory(0), makeHistory(0)])).toBe(2);
  });

  it("returns 0 for empty history", () => {
    expect(averagePerDay([])).toBe(0);
  });
});

describe("activeDays", () => {
  it("counts distinct days, not entries", () => {
    const history = [makeHistory(0), makeHistory(0), makeHistory(3)];
    expect(activeDays(history).size).toBe(2);
  });
});

describe("dailySeries", () => {
  it("returns one bucket per day, oldest first, ending today", () => {
    const series = dailySeries([], 7);
    expect(series).toHaveLength(7);
    expect(series[6].day).toBe(today);
    expect(series[0].day).toBe(addDaysISO(today, -6));
  });

  it("keeps empty days as zeroes so the chart has no gaps", () => {
    const series = dailySeries([makeHistory(2, { xp: 250 })], 7);
    const filled = series.filter((d) => d.completed > 0);

    expect(filled).toHaveLength(1);
    expect(filled[0]).toMatchObject({ completed: 1, xp: 250 });
    expect(series.every((d) => typeof d.completed === "number")).toBe(true);
  });
});

describe("weeklySeries", () => {
  it("returns one bucket per week, ending with the current week", () => {
    const series = weeklySeries([makeHistory(0, { xp: 120 })], 4);
    expect(series).toHaveLength(4);
    expect(series[3].xp).toBe(120);
    expect(series.slice(0, 3).every((w) => w.xp === 0)).toBe(true);
  });
});

describe("heatmap", () => {
  it("emits one cell per day in the window, oldest first", () => {
    const cells = heatmap([], 30);
    expect(cells).toHaveLength(30);
    expect(cells[29].day).toBe(today);
  });

  it("scales intensity against the busiest day in view", () => {
    const history = [
      ...Array.from({ length: 4 }, () => makeHistory(0)), // 4 today  -> level 4
      makeHistory(1), // 1 yesterday -> level 1
    ];
    const cells = heatmap(history, 7);
    const byDay = Object.fromEntries(cells.map((c) => [c.day, c]));

    expect(byDay[today].level).toBe(4);
    expect(byDay[addDaysISO(today, -1)].level).toBe(1);
    expect(byDay[addDaysISO(today, -2)].level).toBe(0);
  });

  it("keeps every level at 0 when nothing was cleared", () => {
    expect(heatmap([], 10).every((c) => c.level === 0)).toBe(true);
  });
});

describe("longestActiveRun", () => {
  it("counts the longest unbroken run of active days", () => {
    const history = [
      makeHistory(0),
      makeHistory(1),
      makeHistory(2), // a 3-day run ending today
      makeHistory(6),
      makeHistory(7), // an earlier 2-day run
    ];
    expect(longestActiveRun(history)).toBe(3);
  });

  it("is not confused by several entries on the same day", () => {
    expect(longestActiveRun([makeHistory(0), makeHistory(0), makeHistory(0)])).toBe(1);
  });

  it("returns 0 for empty history", () => {
    expect(longestActiveRun([])).toBe(0);
  });
});

describe("weeklyReport", () => {
  const today = "2026-08-08";
  const row = (completedAt, xp = 100, category = "Training") => ({
    id: `${completedAt}-${xp}-${category}`,
    title: "m",
    xp,
    category,
    difficulty: "C",
    completedAt,
  });

  it("totals only the last seven days", () => {
    const r = weeklyReport(
      [row(today, 300), row("2026-08-02", 200), row("2026-07-30", 999)],
      today
    );
    expect(r.missions).toBe(2);
    expect(r.xp).toBe(500);
    expect(r.activeDays).toBe(2);
  });

  it("compares against the seven days before that", () => {
    const r = weeklyReport(
      [row(today, 400), row("2026-08-01", 200)], // 2026-08-01 falls in the prior week
      today
    );
    expect(r.xp).toBe(400);
    expect(r.xpDelta).toBe(100); // 400 vs 200
    expect(r.missionsDelta).toBe(0); // one each
  });

  it("stays quiet when there is no prior week to compare against", () => {
    const r = weeklyReport([row(today, 400)], today);
    expect(r.xpDelta).toBe(null);
    expect(r.missionsDelta).toBe(null);
  });

  it("reports an empty week without inventing a trend", () => {
    const r = weeklyReport([], today);
    expect(r).toMatchObject({ missions: 0, xp: 0, activeDays: 0, xpDelta: null });
  });
})
