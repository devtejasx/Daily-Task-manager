import { describe, it, expect } from "vitest";
import {
  isDone,
  doneDays,
  weeklyTarget,
  currentStreak,
  longestStreak,
  weekProgress,
  monthProgress,
  consistency,
  habitStats,
  toggleDay,
} from "./habits";
import { makeHabit, habitWithStreak } from "../test/factories";
import { localISO, addDaysISO } from "../game/constants";
import { startOfWeekISO } from "./date";

const today = localISO();

describe("log basics", () => {
  it("reads a ticked day and ignores an untouched one", () => {
    const habit = makeHabit({ log: { [today]: true } });
    expect(isDone(habit, today)).toBe(true);
    expect(isDone(habit, addDaysISO(today, -1))).toBe(false);
  });

  it("lists ticked days oldest first", () => {
    const habit = makeHabit({
      log: { [addDaysISO(today, -2)]: true, [today]: true, [addDaysISO(today, -1)]: true },
    });
    expect(doneDays(habit)).toEqual([
      addDaysISO(today, -2),
      addDaysISO(today, -1),
      today,
    ]);
  });
});

describe("toggleDay", () => {
  it("ticks an untouched day and un-ticks a ticked one", () => {
    const habit = makeHabit();
    const on = toggleDay(habit, today);
    expect(on.log[today]).toBe(true);

    const off = toggleDay(on, today);
    expect(off.log[today]).toBeUndefined();
  });

  it("removes the key entirely rather than storing false", () => {
    const off = toggleDay(toggleDay(makeHabit(), today), today);
    expect(Object.keys(off.log)).toEqual([]);
  });

  it("does not mutate the original habit", () => {
    const habit = makeHabit();
    toggleDay(habit, today);
    expect(habit.log).toEqual({});
  });
});

describe("currentStreak", () => {
  it("counts consecutive ticked days ending today", () => {
    expect(currentStreak(habitWithStreak(5), today)).toBe(5);
  });

  it("does NOT break the streak just because today isn't ticked yet", () => {
    // The day isn't over — a streak built through yesterday still stands.
    const habit = makeHabit({
      log: {
        [addDaysISO(today, -1)]: true,
        [addDaysISO(today, -2)]: true,
        [addDaysISO(today, -3)]: true,
      },
    });
    expect(currentStreak(habit, today)).toBe(3);
  });

  it("breaks once a day is genuinely missed", () => {
    const habit = makeHabit({
      log: { [addDaysISO(today, -2)]: true, [addDaysISO(today, -3)]: true },
    });
    expect(currentStreak(habit, today)).toBe(0);
  });

  it("is 0 for an empty log", () => {
    expect(currentStreak(makeHabit(), today)).toBe(0);
  });
});

describe("longestStreak", () => {
  it("finds the best run anywhere in the log", () => {
    const habit = makeHabit({
      log: {
        [addDaysISO(today, -10)]: true,
        [addDaysISO(today, -9)]: true,
        [addDaysISO(today, -8)]: true,
        [addDaysISO(today, -7)]: true, // a 4-day run in the past
        [addDaysISO(today, -1)]: true,
        [today]: true, // a 2-day run now
      },
    });
    expect(longestStreak(habit)).toBe(4);
  });

  it("is 0 for an empty log and 1 for a single day", () => {
    expect(longestStreak(makeHabit())).toBe(0);
    expect(longestStreak(makeHabit({ log: { [today]: true } }))).toBe(1);
  });
});

describe("weeklyTarget", () => {
  it("comes from the cadence", () => {
    expect(weeklyTarget(makeHabit({ cadence: "daily" }))).toBe(7);
    expect(weeklyTarget(makeHabit({ cadence: "weekdays" }))).toBe(5);
    expect(weeklyTarget(makeHabit({ cadence: "weekly3" }))).toBe(3);
    expect(weeklyTarget(makeHabit({ cadence: "weekly1" }))).toBe(1);
  });

  it("falls back to daily for an unknown cadence", () => {
    expect(weeklyTarget(makeHabit({ cadence: "nonsense" }))).toBe(7);
  });
});

describe("weekProgress", () => {
  it("counts only ticks inside the current Sun–Sat week", () => {
    const weekStart = startOfWeekISO(today);
    const habit = makeHabit({
      cadence: "weekly3",
      log: {
        [weekStart]: true,
        [addDaysISO(weekStart, -1)]: true, // last week — must not count
      },
    });
    const progress = weekProgress(habit, today);
    expect(progress.done).toBe(1);
    expect(progress.target).toBe(3);
    expect(progress.ratio).toBeCloseTo(1 / 3, 6);
  });

  it("caps the ratio at 1 when the target is beaten", () => {
    const weekStart = startOfWeekISO(today);
    const habit = makeHabit({
      cadence: "weekly1",
      log: { [weekStart]: true, [addDaysISO(weekStart, 1)]: true },
    });
    expect(weekProgress(habit, today).ratio).toBe(1);
  });
});

describe("monthProgress", () => {
  it("scales the target to the length of the month", () => {
    const monthStart = `${today.slice(0, 7)}-01`;
    const habit = makeHabit({ cadence: "weekly3", log: { [monthStart]: true } });
    const progress = monthProgress(habit, today);

    expect(progress.done).toBe(1);
    // 3 per week over a 28–31 day month
    expect(progress.target).toBeGreaterThanOrEqual(12);
    expect(progress.target).toBeLessThanOrEqual(14);
  });
});

describe("consistency", () => {
  it("is the share of days ticked since the habit was created", () => {
    // Created 3 days ago, ticked on 2 of the 4 days since (inclusive)
    const habit = makeHabit({
      createdAt: addDaysISO(today, -3),
      log: { [today]: true, [addDaysISO(today, -1)]: true },
    });
    expect(consistency(habit, today)).toBeCloseTo(2 / 4, 6);
  });

  it("is 1.0 for a habit created today and ticked today", () => {
    expect(consistency(makeHabit({ log: { [today]: true } }), today)).toBe(1);
  });

  it("never divides by zero for a habit created in the future", () => {
    const habit = makeHabit({ createdAt: addDaysISO(today, 5) });
    expect(Number.isFinite(consistency(habit, today))).toBe(true);
  });
});

describe("habitStats", () => {
  it("rolls every derived number up in one pass", () => {
    const stats = habitStats(habitWithStreak(3), today);
    expect(stats).toMatchObject({ doneToday: true, streak: 3, best: 3, totalDone: 3 });
    expect(stats.week.target).toBe(7);
    expect(stats.consistency).toBeGreaterThan(0);
  });
});
