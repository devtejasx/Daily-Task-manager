import { describe, it, expect } from "vitest";
import { applyFilters, countActiveFilters, toggleValue, EMPTY_FILTERS } from "./filters";
import { makeMission } from "../test/factories";
import { localISO, addDaysISO } from "../game/constants";
import { makeRecurrence } from "./recurrence";

const today = localISO();

/** A small board covering every facet the filters can slice on. */
function board() {
  return [
    makeMission({
      id: "a",
      title: "Morning Training",
      description: "Strength work",
      category: "Training",
      priority: "HIGH",
      difficulty: "C",
      xp: 300,
      dueDate: today,
    }),
    makeMission({
      id: "b",
      title: "Graph Algorithms",
      description: "BFS and DFS",
      category: "Research",
      priority: "CRITICAL",
      difficulty: "B",
      xp: 500,
      dueDate: addDaysISO(today, 1),
    }),
    makeMission({
      id: "c",
      title: "Inbox Zero",
      description: "Triage the guild requests",
      category: "Guild",
      priority: "LOW",
      difficulty: "E",
      xp: 100,
      dueDate: addDaysISO(today, -3), // overdue
    }),
    makeMission({
      id: "d",
      title: "Quarterly Report",
      category: "Guild",
      priority: "MEDIUM",
      difficulty: "S",
      xp: 900,
      status: "completed",
      dueDate: today,
    }),
    makeMission({
      id: "e",
      title: "Daily Stretch",
      category: "Recovery",
      priority: "MEDIUM",
      difficulty: "E",
      xp: 150,
      dueDate: addDaysISO(today, 20),
      recurrence: makeRecurrence("daily"),
    }),
  ];
}

const ids = (list) => list.map((m) => m.id).sort();

describe("applyFilters", () => {
  it("returns everything under the neutral filter state", () => {
    expect(applyFilters(board(), EMPTY_FILTERS)).toHaveLength(5);
  });

  it("handles an empty or missing mission list", () => {
    expect(applyFilters([], EMPTY_FILTERS)).toEqual([]);
    expect(applyFilters(undefined, EMPTY_FILTERS)).toEqual([]);
  });

  it("preserves the incoming order", () => {
    const result = applyFilters(board(), { status: "active" });
    expect(result.map((m) => m.id)).toEqual(["a", "b", "c", "e"]);
  });

  describe("search", () => {
    it("matches title, briefing and category, case-insensitively", () => {
      expect(ids(applyFilters(board(), { search: "training" }))).toEqual(["a"]); // title
      expect(ids(applyFilters(board(), { search: "BFS" }))).toEqual(["b"]); // description
      expect(ids(applyFilters(board(), { search: "guild" }))).toEqual(["c", "d"]); // category + text
    });

    it("ignores surrounding whitespace and an empty query", () => {
      expect(ids(applyFilters(board(), { search: "  inbox  " }))).toEqual(["c"]);
      expect(applyFilters(board(), { search: "   " })).toHaveLength(5);
    });
  });

  describe("status", () => {
    it("splits pending from completed", () => {
      expect(ids(applyFilters(board(), { status: "active" }))).toEqual(["a", "b", "c", "e"]);
      expect(ids(applyFilters(board(), { status: "completed" }))).toEqual(["d"]);
    });
  });

  describe("multi-select facets", () => {
    it("ORs values inside one facet", () => {
      expect(ids(applyFilters(board(), { priorities: ["HIGH", "CRITICAL"] }))).toEqual(["a", "b"]);
      expect(ids(applyFilters(board(), { categories: ["Guild", "Recovery"] }))).toEqual([
        "c",
        "d",
        "e",
      ]);
      expect(ids(applyFilters(board(), { difficulties: ["E"] }))).toEqual(["c", "e"]);
    });
  });

  describe("XP range", () => {
    it("filters on an inclusive min and max", () => {
      expect(ids(applyFilters(board(), { xpMin: 300 }))).toEqual(["a", "b", "d"]);
      expect(ids(applyFilters(board(), { xpMax: 150 }))).toEqual(["c", "e"]);
      expect(ids(applyFilters(board(), { xpMin: 150, xpMax: 500 }))).toEqual(["a", "b", "e"]);
    });

    it("treats a zero bound as a real bound, not as absent", () => {
      expect(applyFilters(board(), { xpMax: 0 })).toHaveLength(0);
    });
  });

  describe("flags", () => {
    it("finds overdue, due-today and due-tomorrow missions", () => {
      expect(ids(applyFilters(board(), { flags: ["overdue"] }))).toEqual(["c"]);
      expect(ids(applyFilters(board(), { flags: ["dueToday"] }))).toEqual(["a", "d"]);
      expect(ids(applyFilters(board(), { flags: ["dueTomorrow"] }))).toEqual(["b"]);
    });

    it("never counts a completed mission as overdue", () => {
      const stale = makeMission({ id: "z", status: "completed", dueDate: addDaysISO(today, -9) });
      expect(applyFilters([stale], { flags: ["overdue"] })).toHaveLength(0);
    });

    it("finds recurring missions and the daily quest selection", () => {
      expect(ids(applyFilters(board(), { flags: ["recurring"] }))).toEqual(["e"]);
      expect(
        ids(applyFilters(board(), { flags: ["daily"] }, { dailySelected: ["a", "b"] }))
      ).toEqual(["a", "b"]);
    });

    it("ORs flags with each other", () => {
      expect(ids(applyFilters(board(), { flags: ["overdue", "recurring"] }))).toEqual(["c", "e"]);
    });
  });

  it("ANDs facets together", () => {
    // Guild category AND completed
    expect(ids(applyFilters(board(), { categories: ["Guild"], status: "completed" }))).toEqual([
      "d",
    ]);
    // High-or-critical AND due today -> only the HIGH one, since the CRITICAL
    // mission is due tomorrow
    expect(
      ids(applyFilters(board(), { priorities: ["HIGH", "CRITICAL"], flags: ["dueToday"] }))
    ).toEqual(["a"]);
  });

  it("returns nothing when facets contradict each other", () => {
    expect(applyFilters(board(), { status: "completed", flags: ["recurring"] })).toEqual([]);
  });
});

describe("countActiveFilters", () => {
  it("counts nothing for the neutral state", () => {
    expect(countActiveFilters(EMPTY_FILTERS)).toBe(0);
    expect(countActiveFilters({ search: "   " })).toBe(0);
  });

  it("counts every narrowing facet, including each selected value", () => {
    expect(
      countActiveFilters({
        search: "gate",
        status: "active",
        priorities: ["HIGH", "LOW"],
        categories: ["Guild"],
        flags: ["overdue"],
        xpMin: 100,
      })
    ).toBe(1 + 1 + 2 + 1 + 1 + 1);
  });
});

describe("toggleValue", () => {
  it("adds a missing value and removes a present one", () => {
    expect(toggleValue([], "HIGH")).toEqual(["HIGH"]);
    expect(toggleValue(["HIGH"], "HIGH")).toEqual([]);
    expect(toggleValue(["HIGH"], "LOW")).toEqual(["HIGH", "LOW"]);
  });

  it("does not mutate the input", () => {
    const original = ["HIGH"];
    toggleValue(original, "LOW");
    expect(original).toEqual(["HIGH"]);
  });
});
