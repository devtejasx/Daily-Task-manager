import { describe, it, expect } from "vitest";
import {
  monthGrid,
  weekGrid,
  occupiesDay,
  missionsForDay,
  spanPosition,
  monthLabel,
  shiftCursor,
  isoFor,
} from "./calendar";
import {
  dueBadge,
  dueDateTime,
  isOverdue,
  isThisWeek,
  startOfWeekISO,
  endOfWeekISO,
  formatCountdown,
  daysBetween,
  isoRange,
  msUntilDue,
} from "./date";
import { makeMission } from "../test/factories";
import { localISO, addDaysISO } from "../game/constants";

const today = localISO();

/* ================= date helpers ================= */

describe("dueDateTime", () => {
  it("uses the mission's time when set", () => {
    const at = dueDateTime(makeMission({ dueDate: "2026-08-06", dueTime: "14:30" }));
    expect(at.getHours()).toBe(14);
    expect(at.getMinutes()).toBe(30);
  });

  it("defaults an all-day mission to the end of the day, not the start", () => {
    // Otherwise every timed-less mission would read as overdue from 00:01.
    const at = dueDateTime(makeMission({ dueDate: "2026-08-06", dueTime: null }));
    expect(at.getHours()).toBe(23);
    expect(at.getMinutes()).toBe(59);
  });

  it("returns null without a due date", () => {
    expect(dueDateTime({ dueDate: null })).toBeNull();
  });
});

describe("isOverdue", () => {
  const noon = new Date(2026, 7, 6, 12, 0);

  it("is true once the due moment has passed", () => {
    expect(isOverdue(makeMission({ dueDate: "2026-08-06", dueTime: "09:00" }), noon)).toBe(true);
    expect(isOverdue(makeMission({ dueDate: "2026-08-05" }), noon)).toBe(true);
  });

  it("is false before the due moment", () => {
    expect(isOverdue(makeMission({ dueDate: "2026-08-06", dueTime: "18:00" }), noon)).toBe(false);
    expect(isOverdue(makeMission({ dueDate: "2026-08-06", dueTime: null }), noon)).toBe(false);
  });

  it("is never true for a completed mission", () => {
    const stale = makeMission({ dueDate: "2026-01-01", status: "completed" });
    expect(isOverdue(stale, noon)).toBe(false);
  });
});

describe("dueBadge", () => {
  it("labels today, tomorrow and the near future", () => {
    expect(dueBadge(makeMission({ dueDate: today, dueTime: "23:59" })).tone).toBe("today");
    expect(dueBadge(makeMission({ dueDate: addDaysISO(today, 1) }))).toMatchObject({
      label: "Tomorrow",
      tone: "tomorrow",
    });
    expect(dueBadge(makeMission({ dueDate: addDaysISO(today, 4) }))).toMatchObject({
      label: "In 4d",
      tone: "soon",
    });
  });

  it("labels an overdue mission with how late it is", () => {
    const badge = dueBadge(makeMission({ dueDate: addDaysISO(today, -3) }));
    expect(badge.tone).toBe("overdue");
    expect(badge.label).toBe("Overdue · 3d");
  });

  it("falls back to a plain date beyond a week", () => {
    expect(dueBadge(makeMission({ dueDate: addDaysISO(today, 30) })).tone).toBe("future");
  });
});

describe("week and range helpers", () => {
  it("anchors the week to Sunday and spans seven days", () => {
    const start = startOfWeekISO("2026-08-06"); // a Thursday
    expect(start).toBe("2026-08-02");
    expect(endOfWeekISO("2026-08-06")).toBe("2026-08-08");
    expect(daysBetween(start, endOfWeekISO("2026-08-06"))).toBe(6);
  });

  it("knows what falls inside the current week", () => {
    expect(isThisWeek(today, today)).toBe(true);
    expect(isThisWeek(addDaysISO(startOfWeekISO(today), -1), today)).toBe(false);
    expect(isThisWeek(null)).toBe(false);
  });

  it("builds an inclusive day range", () => {
    expect(isoRange("2026-08-06", "2026-08-09")).toEqual([
      "2026-08-06",
      "2026-08-07",
      "2026-08-08",
      "2026-08-09",
    ]);
    expect(isoRange("2026-08-06", "2026-08-06")).toEqual(["2026-08-06"]);
  });
});

describe("formatCountdown", () => {
  it("picks the two most significant units", () => {
    expect(formatCountdown(2 * 86_400_000 + 4 * 3_600_000)).toBe("2d 4h");
    expect(formatCountdown(3 * 3_600_000 + 12 * 60_000)).toBe("3h 12m");
    expect(formatCountdown(45 * 60_000)).toBe("45m");
    expect(formatCountdown(12_000)).toBe("12s");
  });

  it("formats an elapsed (negative) span by magnitude", () => {
    expect(formatCountdown(-45 * 60_000)).toBe("45m");
  });

  it("handles nothing gracefully", () => {
    expect(formatCountdown(null)).toBe("—");
    expect(formatCountdown(NaN)).toBe("—");
  });

  it("counts down toward the due moment", () => {
    const now = new Date(2026, 7, 6, 12, 0);
    const ms = msUntilDue(makeMission({ dueDate: "2026-08-06", dueTime: "14:00" }), now);
    expect(ms).toBe(2 * 3_600_000);
  });
});

/* ================= calendar grid ================= */

describe("monthGrid", () => {
  it("always returns a fixed 42-cell grid so the layout never reflows", () => {
    for (const month of ["2026-02-15", "2026-08-06", "2027-01-01"]) {
      expect(monthGrid(month)).toHaveLength(42);
    }
  });

  it("starts on a Sunday and flags days outside the month", () => {
    const cells = monthGrid("2026-08-06"); // Aug 2026 starts on a Saturday
    expect(new Date(`${cells[0].iso}T12:00:00`).getDay()).toBe(0);
    expect(cells[0].outside).toBe(true);
    expect(cells.filter((c) => !c.outside)).toHaveLength(31);
  });

  it("runs consecutively with no gaps or repeats", () => {
    const cells = monthGrid("2026-08-06");
    for (let i = 1; i < cells.length; i += 1) {
      expect(cells[i].iso).toBe(addDaysISO(cells[i - 1].iso, 1));
    }
  });
});

describe("weekGrid", () => {
  it("returns the seven days of the week containing the cursor", () => {
    const cells = weekGrid("2026-08-06");
    expect(cells).toHaveLength(7);
    expect(cells[0].iso).toBe("2026-08-02");
    expect(cells[6].iso).toBe("2026-08-08");
    expect(cells.every((c) => c.outside === false)).toBe(true);
  });
});

describe("occupiesDay / spanPosition", () => {
  const span = makeMission({ dueDate: "2026-08-06", endDate: "2026-08-09" });

  it("covers every day of a multi-day span", () => {
    expect(occupiesDay(span, "2026-08-06")).toBe(true);
    expect(occupiesDay(span, "2026-08-08")).toBe(true);
    expect(occupiesDay(span, "2026-08-09")).toBe(true);
    expect(occupiesDay(span, "2026-08-10")).toBe(false);
    expect(occupiesDay(span, "2026-08-05")).toBe(false);
  });

  it("matches only the due date for a single-day mission", () => {
    const single = makeMission({ dueDate: "2026-08-06", endDate: null });
    expect(occupiesDay(single, "2026-08-06")).toBe(true);
    expect(occupiesDay(single, "2026-08-07")).toBe(false);
  });

  it("reports where in the span each day sits", () => {
    expect(spanPosition(span, "2026-08-06")).toBe("start");
    expect(spanPosition(span, "2026-08-07")).toBe("middle");
    expect(spanPosition(span, "2026-08-09")).toBe("end");
    expect(spanPosition(makeMission({ dueDate: "2026-08-06" }), "2026-08-06")).toBe("single");
  });
});

describe("missionsForDay", () => {
  it("sorts by priority and sinks cleared missions to the bottom", () => {
    const day = "2026-08-06";
    const list = missionsForDay(
      [
        makeMission({ id: "low", priority: "LOW", dueDate: day }),
        makeMission({ id: "done", priority: "CRITICAL", status: "completed", dueDate: day }),
        makeMission({ id: "crit", priority: "CRITICAL", dueDate: day }),
        makeMission({ id: "med", priority: "MEDIUM", dueDate: day }),
      ],
      day
    );
    expect(list.map((m) => m.id)).toEqual(["crit", "med", "low", "done"]);
  });

  it("excludes missions due on other days", () => {
    const list = missionsForDay([makeMission({ dueDate: "2026-08-07" })], "2026-08-06");
    expect(list).toEqual([]);
  });
});

describe("cursor navigation", () => {
  it("steps a month at a time in month view", () => {
    expect(shiftCursor("2026-08-15", "month", 1).slice(0, 7)).toBe("2026-09");
    expect(shiftCursor("2026-01-15", "month", -1).slice(0, 7)).toBe("2025-12");
  });

  it("steps a week at a time in week view", () => {
    expect(shiftCursor("2026-08-06", "week", 1)).toBe("2026-08-13");
    expect(shiftCursor("2026-08-06", "week", -1)).toBe("2026-07-30");
  });

  it("labels the month in the cursor's own month", () => {
    expect(monthLabel("2026-08-06")).toContain("2026");
    expect(isoFor(2026, 7, 6)).toBe("2026-08-06");
  });
});
