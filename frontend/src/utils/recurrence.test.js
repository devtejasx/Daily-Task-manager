import { describe, it, expect } from "vitest";
import {
  isRecurring,
  isActiveRecurrence,
  stepOnce,
  nextOccurrenceISO,
  buildNextOccurrence,
  describeRecurrence,
  makeRecurrence,
} from "./recurrence";
import { makeMission } from "../test/factories";
import { localISO, addDaysISO } from "../game/constants";

const today = localISO();

describe("recurrence predicates", () => {
  it("treats a paused series as recurring but not active", () => {
    const paused = makeMission({ recurrence: makeRecurrence("daily") });
    paused.recurrence.paused = true;

    expect(isRecurring(paused)).toBe(true);
    expect(isActiveRecurrence(paused)).toBe(false);
  });

  it("treats a one-off mission as neither", () => {
    const once = makeMission();
    expect(isRecurring(once)).toBe(false);
    expect(isActiveRecurrence(once)).toBe(false);
  });
});

describe("stepOnce", () => {
  it("advances daily by the interval", () => {
    expect(stepOnce("2026-08-06", makeRecurrence("daily"))).toBe("2026-08-07");
    expect(stepOnce("2026-08-06", makeRecurrence("daily", 3))).toBe("2026-08-09");
  });

  it("advances weekly in seven-day multiples", () => {
    expect(stepOnce("2026-08-06", makeRecurrence("weekly"))).toBe("2026-08-13");
    expect(stepOnce("2026-08-06", makeRecurrence("weekly", 2))).toBe("2026-08-20");
  });

  it("advances monthly, keeping the day of month", () => {
    expect(stepOnce("2026-08-06", makeRecurrence("monthly"))).toBe("2026-09-06");
    expect(stepOnce("2026-11-15", makeRecurrence("monthly", 2))).toBe("2027-01-15");
  });

  it("clamps a monthly rule to the last valid day of a short month", () => {
    // Jan 31 -> Feb 28, not Mar 3
    expect(stepOnce("2026-01-31", makeRecurrence("monthly"))).toBe("2026-02-28");
    expect(stepOnce("2024-01-31", makeRecurrence("monthly"))).toBe("2024-02-29"); // leap
    expect(stepOnce("2026-03-31", makeRecurrence("monthly"))).toBe("2026-04-30");
  });

  it("treats custom as an N-day interval", () => {
    expect(stepOnce("2026-08-06", makeRecurrence("custom", 10))).toBe("2026-08-16");
  });

  it("never advances by less than a day, even with a bad interval", () => {
    expect(stepOnce("2026-08-06", { type: "daily", interval: 0 })).toBe("2026-08-07");
    expect(stepOnce("2026-08-06", { type: "daily", interval: -5 })).toBe("2026-08-07");
  });
});

describe("nextOccurrenceISO", () => {
  it("returns the very next date when the series is up to date", () => {
    expect(nextOccurrenceISO(today, makeRecurrence("daily"))).toBe(addDaysISO(today, 1));
  });

  it("catches up to today rather than spawning a backlog", () => {
    // Away for 30 days on a daily mission: we want ONE occurrence at or after
    // today, not thirty missed ones.
    const longAgo = addDaysISO(today, -30);
    const next = nextOccurrenceISO(longAgo, makeRecurrence("daily"));
    expect(next >= today).toBe(true);
    expect(next).toBe(today);
  });

  it("respects the interval while catching up", () => {
    const from = addDaysISO(today, -10);
    const next = nextOccurrenceISO(from, makeRecurrence("custom", 4));
    // -10 -> -6 -> -2 -> +2
    expect(next).toBe(addDaysISO(today, 2));
  });

  it("returns null without a rule", () => {
    expect(nextOccurrenceISO(today, null)).toBeNull();
  });
});

describe("buildNextOccurrence", () => {
  it("returns null for one-off and paused missions", () => {
    expect(buildNextOccurrence(makeMission())).toBeNull();

    const paused = makeMission({ recurrence: { ...makeRecurrence("daily"), paused: true } });
    expect(buildNextOccurrence(paused)).toBeNull();
  });

  it("spawns a fresh active occurrence with a new id", () => {
    const mission = makeMission({
      dueDate: today,
      status: "completed",
      recurrence: makeRecurrence("daily"),
    });
    const next = buildNextOccurrence(mission, "completed");

    expect(next.id).not.toBe(mission.id);
    expect(next.status).toBe("active");
    expect(next.dueDate).toBe(addDaysISO(today, 1));
    expect(next.title).toBe(mission.title);
    expect(next.xp).toBe(mission.xp);
  });

  it("links occurrences through seriesId and counts them", () => {
    const first = makeMission({ dueDate: today, recurrence: makeRecurrence("daily") });
    const second = buildNextOccurrence(first, "completed");
    const third = buildNextOccurrence(second, "completed");

    expect(second.seriesId).toBe(first.id);
    expect(third.seriesId).toBe(first.id); // not second.id — the series root holds
    expect(second.occurrence).toBe(1);
    expect(third.occurrence).toBe(2);
    expect(third.recurrence.completed).toBe(2);
  });

  it("counts a skip separately from a completion", () => {
    const mission = makeMission({ dueDate: today, recurrence: makeRecurrence("daily") });
    const next = buildNextOccurrence(mission, "skipped");

    expect(next.recurrence.skipped).toBe(1);
    expect(next.recurrence.completed).toBe(0);
  });

  it("carries a multi-day span forward at the same length", () => {
    const mission = makeMission({
      dueDate: "2026-08-06",
      endDate: "2026-08-09", // 3-day span
      recurrence: makeRecurrence("weekly"),
    });
    const next = buildNextOccurrence(mission, "completed");

    expect(next.dueDate).toBe("2026-08-13");
    expect(next.endDate).toBe("2026-08-16");
  });

  it("clears the fired-reminder marker so the new occurrence can notify", () => {
    const mission = makeMission({
      dueDate: today,
      reminder: 30,
      reminderFiredAt: "2026-08-06T10:00:00.000Z",
      recurrence: makeRecurrence("daily"),
    });
    expect(buildNextOccurrence(mission).reminderFiredAt).toBeNull();
  });
});

describe("describeRecurrence", () => {
  it("reads naturally for each rule type", () => {
    expect(describeRecurrence(makeRecurrence("daily"))).toBe("Daily");
    expect(describeRecurrence(makeRecurrence("daily", 3))).toBe("Every 3 days");
    expect(describeRecurrence(makeRecurrence("weekly"))).toBe("Weekly");
    expect(describeRecurrence(makeRecurrence("weekly", 2))).toBe("Every 2 weeks");
    expect(describeRecurrence(makeRecurrence("monthly"))).toBe("Monthly");
    expect(describeRecurrence(makeRecurrence("custom", 1))).toBe("Every 1 day");
    expect(describeRecurrence(null)).toBe("");
  });

  it("flags a paused series", () => {
    expect(describeRecurrence({ ...makeRecurrence("weekly"), paused: true })).toBe(
      "Weekly · paused"
    );
  });
});
