import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useGameState } from "./useGameState";
import { makeSave, makeMission, makeHabit } from "../test/factories";
import {
  localISO,
  addDaysISO,
  DAILY_REQUIRED,
  SHIELD_EVERY,
  SHIELD_MAX,
  COMEBACK_XP,
} from "../game/constants";
import { makeRecurrence } from "../utils/recurrence";
import { creditXP, dailyQuestXP, DAILY_XP_SOFT_CAP } from "../game/xp";

const today = localISO();

/** Mount the hook over a save, with persistence stubbed out. */
function mount(save = null) {
  const persist = vi.fn();
  const view = renderHook(() => useGameState(save, persist));
  return { ...view, persist };
}

beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
afterEach(() => vi.useRealTimers());

describe("initial state", () => {
  it("starts a brand-new hunter completely empty", () => {
    const { result } = mount(null);
    expect(result.current.state.missions).toEqual([]);
    expect(result.current.state.history).toEqual([]);
    expect(result.current.state.habits).toEqual([]);
    expect(result.current.state.totalXP).toBe(0);
    expect(result.current.state.streak).toBe(0);
    expect(result.current.levelInfo.level).toBe(1);
  });

  it("loads and migrates an existing save", () => {
    const { result } = mount({ totalXP: 2400, streak: 21, missions: [{ id: "m", title: "Old" }] });
    expect(result.current.state.totalXP).toBe(2400);
    // 1000 (lv1) + 1400 (lv2) = 2400 exactly, so this hunter has just hit lv3
    expect(result.current.levelInfo.level).toBe(3);
    expect(result.current.levelInfo.xpInLevel).toBe(0);
    expect(result.current.rank.key).toBe("D"); // 21-day streak
    expect(result.current.state.missions[0].recurrence).toBeNull(); // migrated
  });

  it("survives a corrupt save instead of crashing", () => {
    const { result } = mount({ missions: "not a list" });
    expect(Array.isArray(result.current.state.missions)).toBe(true);
  });
});

describe("mission CRUD", () => {
  it("adds a mission at the top of the manual order", () => {
    const { result } = mount(makeSave());

    act(() => result.current.actions.addMission({ title: "First", xp: 300 }));
    act(() => result.current.actions.addMission({ title: "Second", xp: 300 }));

    const [first, second] = result.current.state.missions;
    expect(first.title).toBe("Second"); // newest first
    expect(first.order).toBeLessThan(second.order);
  });

  it("normalises whatever the form hands over", () => {
    const { result } = mount(makeSave());
    act(() => result.current.actions.addMission({ title: "Bare" }));

    const mission = result.current.state.missions[0];
    expect(mission).toMatchObject({ status: "active", priority: "MEDIUM", recurrence: null });
    expect(mission.id).toBeTruthy();
  });

  it("updates a mission in place", () => {
    const { result } = mount(makeSave({ missions: [makeMission({ id: "m-1", title: "Before" })] }));
    act(() => result.current.actions.updateMission("m-1", { title: "After", priority: "HIGH" }));

    expect(result.current.state.missions[0]).toMatchObject({ title: "After", priority: "HIGH" });
  });

  it("ignores an update for a mission that no longer exists", () => {
    const { result } = mount(makeSave({ missions: [makeMission({ id: "m-1" })] }));
    const before = result.current.state;
    act(() => result.current.actions.updateMission("ghost", { title: "x" }));
    expect(result.current.state).toBe(before);
  });

  it("deletes a mission and releases its daily-quest slot", () => {
    const { result } = mount(
      makeSave({ missions: [makeMission({ id: "m-1" })], dailySelected: ["m-1"] })
    );
    act(() => result.current.actions.deleteMission("m-1"));

    expect(result.current.state.missions).toEqual([]);
    expect(result.current.state.dailySelected).toEqual([]);
  });
});

describe("daily quest selection", () => {
  it("toggles a mission in and out of the slots", () => {
    const { result } = mount(makeSave({ missions: [makeMission({ id: "m-1" })] }));

    act(() => result.current.actions.toggleDaily("m-1"));
    expect(result.current.state.dailySelected).toEqual(["m-1"]);

    act(() => result.current.actions.toggleDaily("m-1"));
    expect(result.current.state.dailySelected).toEqual([]);
  });

  it("refuses to exceed the daily slot count", () => {
    const missions = Array.from({ length: DAILY_REQUIRED + 2 }, (_, i) =>
      makeMission({ id: `m-${i}` })
    );
    const { result } = mount(makeSave({ missions }));

    act(() => missions.forEach((m) => result.current.actions.toggleDaily(m.id)));
    expect(result.current.state.dailySelected).toHaveLength(DAILY_REQUIRED);
  });

  it("won't select an already-completed mission", () => {
    const { result } = mount(
      makeSave({ missions: [makeMission({ id: "m-1", status: "completed" })] })
    );
    act(() => result.current.actions.toggleDaily("m-1"));
    expect(result.current.state.dailySelected).toEqual([]);
  });
});

describe("completing a mission", () => {
  it("awards XP, records history and marks the card cleared", () => {
    const { result } = mount(
      makeSave({ missions: [makeMission({ id: "m-1", title: "Gate", xp: 450 })] })
    );
    act(() => result.current.actions.completeMission("m-1"));

    expect(result.current.state.totalXP).toBe(450);
    expect(result.current.state.missions[0].status).toBe("completed");
    expect(result.current.state.history[0]).toMatchObject({
      title: "Gate",
      xp: 450,
      completedAt: today,
    });
  });

  it("is idempotent — completing twice does not double the XP", () => {
    const { result } = mount(makeSave({ missions: [makeMission({ id: "m-1", xp: 300 })] }));

    act(() => result.current.actions.completeMission("m-1"));
    act(() => result.current.actions.completeMission("m-1"));

    expect(result.current.state.totalXP).toBe(300);
    expect(result.current.state.history).toHaveLength(1);
  });

  it("fires the level-up cinematic when the threshold is crossed", () => {
    const { result } = mount(
      makeSave({ totalXP: 900, missions: [makeMission({ id: "m-1", xp: 300 })] })
    );
    act(() => result.current.actions.completeMission("m-1"));

    expect(result.current.state.totalXP).toBe(1200);
    // The cinematic carries both ends of the climb so it can show 1 -> 2.
    expect(result.current.state.fx.levelUp).toEqual({ from: 1, to: 2 });
  });

  it("unlocks achievements as a side effect of progress", () => {
    const { result } = mount(makeSave({ missions: [makeMission({ id: "m-1", xp: 300 })] }));
    act(() => result.current.actions.completeMission("m-1"));

    expect(result.current.state.achievements["first-mission"]).toBe(today);
  });

  it("completes the daily quest and extends the streak", () => {
    const missions = Array.from({ length: DAILY_REQUIRED }, (_, i) =>
      makeMission({ id: `m-${i}`, xp: 100 })
    );
    const { result } = mount(
      makeSave({ missions, dailySelected: missions.map((m) => m.id), streak: 4 })
    );

    act(() => missions.forEach((m) => result.current.actions.completeMission(m.id)));

    expect(result.current.state.dayComplete).toBe(true);
    expect(result.current.state.streak).toBe(5);
    expect(result.current.state.longestStreak).toBe(5);
  });

  it("forges a streak shield every seventh consecutive day", () => {
    const missions = Array.from({ length: DAILY_REQUIRED }, (_, i) =>
      makeMission({ id: `m-${i}`, xp: 10 })
    );
    const { result } = mount(
      makeSave({
        missions,
        dailySelected: missions.map((m) => m.id),
        streak: SHIELD_EVERY - 1,
        shields: 0,
      })
    );

    act(() => missions.forEach((m) => result.current.actions.completeMission(m.id)));

    expect(result.current.state.streak).toBe(SHIELD_EVERY);
    expect(result.current.state.shields).toBe(1);
  });

  it("does not forge a shield on an ordinary day", () => {
    const missions = Array.from({ length: DAILY_REQUIRED }, (_, i) =>
      makeMission({ id: `m-${i}`, xp: 10 })
    );
    const { result } = mount(
      makeSave({ missions, dailySelected: missions.map((m) => m.id), streak: 2, shields: 1 })
    );

    act(() => missions.forEach((m) => result.current.actions.completeMission(m.id)));

    expect(result.current.state.shields).toBe(1);
  });

  it("caps banked shields so the streak still means something", () => {
    const missions = Array.from({ length: DAILY_REQUIRED }, (_, i) =>
      makeMission({ id: `m-${i}`, xp: 10 })
    );
    const { result } = mount(
      makeSave({
        missions,
        dailySelected: missions.map((m) => m.id),
        streak: SHIELD_EVERY - 1,
        shields: SHIELD_MAX,
      })
    );

    act(() => missions.forEach((m) => result.current.actions.completeMission(m.id)));

    expect(result.current.state.shields).toBe(SHIELD_MAX);
  });

  it("promotes the hunter when the streak crosses a rank threshold", () => {
    const missions = Array.from({ length: DAILY_REQUIRED }, (_, i) =>
      makeMission({ id: `m-${i}`, xp: 10 })
    );
    const { result } = mount(
      makeSave({ missions, dailySelected: missions.map((m) => m.id), streak: 20 })
    );

    act(() => missions.forEach((m) => result.current.actions.completeMission(m.id)));

    expect(result.current.state.streak).toBe(21);
    expect(result.current.state.fx.promotion).toMatchObject({ rankKey: "D", from: "E" });
    expect(result.current.state.fx.promotion.evaluation).toBeTruthy();
    expect(result.current.state.bestRank).toBe("D");
  });

  it("ignores a mission that isn't on the board", () => {
    const { result } = mount(makeSave());
    act(() => result.current.actions.completeMission("ghost"));
    expect(result.current.state.totalXP).toBe(0);
  });
});

describe("recurring missions through the reducer", () => {
  it("spawns the next occurrence when one is cleared", () => {
    const { result } = mount(
      makeSave({
        missions: [
          makeMission({ id: "m-1", dueDate: today, xp: 200, recurrence: makeRecurrence("daily") }),
        ],
      })
    );
    act(() => result.current.actions.completeMission("m-1"));

    const { missions } = result.current.state;
    expect(missions).toHaveLength(2);

    const spawned = missions.find((m) => m.id !== "m-1");
    expect(spawned.status).toBe("active");
    expect(spawned.dueDate).toBe(addDaysISO(today, 1));
    expect(spawned.seriesId).toBe("m-1");
    // the cleared occurrence keeps its record
    expect(missions.find((m) => m.id === "m-1").status).toBe("completed");
    expect(result.current.state.history).toHaveLength(1);
  });

  it("does not spawn while the series is paused", () => {
    const { result } = mount(
      makeSave({
        missions: [
          makeMission({
            id: "m-1",
            recurrence: { ...makeRecurrence("daily"), paused: true },
          }),
        ],
      })
    );
    act(() => result.current.actions.completeMission("m-1"));
    expect(result.current.state.missions).toHaveLength(1);
  });

  it("skips an occurrence without awarding XP or writing history", () => {
    const { result } = mount(
      makeSave({
        missions: [
          makeMission({ id: "m-1", dueDate: today, xp: 500, recurrence: makeRecurrence("daily") }),
        ],
      })
    );
    act(() => result.current.actions.skipOccurrence("m-1"));

    const mission = result.current.state.missions[0];
    expect(mission.id).toBe("m-1"); // advanced in place
    expect(mission.dueDate).toBe(addDaysISO(today, 1));
    expect(mission.recurrence.skipped).toBe(1);
    expect(result.current.state.totalXP).toBe(0);
    expect(result.current.state.history).toEqual([]);
  });

  it("pauses and resumes a series", () => {
    const { result } = mount(
      makeSave({ missions: [makeMission({ id: "m-1", recurrence: makeRecurrence("weekly") })] })
    );

    act(() => result.current.actions.setRecurrencePaused("m-1", true));
    expect(result.current.state.missions[0].recurrence.paused).toBe(true);

    act(() => result.current.actions.setRecurrencePaused("m-1", false));
    expect(result.current.state.missions[0].recurrence.paused).toBe(false);
  });
});

describe("ordering", () => {
  it("reorders the visible slice without disturbing the rest", () => {
    const missions = ["a", "b", "c", "d"].map((id, i) =>
      makeMission({ id, order: i, dueDate: today })
    );
    const { result } = mount(makeSave({ missions }));

    // Reorder only a and c: they swap slots, b and d keep theirs.
    act(() => result.current.actions.reorderMissions(["c", "a"]));

    const byId = Object.fromEntries(result.current.state.missions.map((m) => [m.id, m.order]));
    expect(byId.c).toBe(0);
    expect(byId.a).toBe(2);
    expect(byId.b).toBe(1);
    expect(byId.d).toBe(3);
  });

  it("ignores a reorder referencing unknown ids", () => {
    const { result } = mount(makeSave({ missions: [makeMission({ id: "a", order: 0 })] }));
    const before = result.current.state;
    act(() => result.current.actions.reorderMissions(["a", "ghost"]));
    expect(result.current.state).toBe(before);
  });
});

describe("calendar move", () => {
  it("re-schedules a mission and carries its multi-day span", () => {
    const { result } = mount(
      makeSave({
        missions: [makeMission({ id: "m-1", dueDate: "2026-08-06", endDate: "2026-08-09" })],
      })
    );
    act(() => result.current.actions.moveMission("m-1", "2026-08-20"));

    expect(result.current.state.missions[0]).toMatchObject({
      dueDate: "2026-08-20",
      endDate: "2026-08-23", // same 3-day length
    });
  });

  it("does nothing when dropped on the day it already sits on", () => {
    const { result } = mount(makeSave({ missions: [makeMission({ id: "m-1", dueDate: today })] }));
    const before = result.current.state;
    act(() => result.current.actions.moveMission("m-1", today));
    expect(result.current.state).toBe(before);
  });
});

describe("habits through the reducer", () => {
  it("adds a habit with an empty log", () => {
    const { result } = mount(makeSave());
    act(() => result.current.actions.addHabit({ title: "Stretch", xp: 40 }));

    expect(result.current.state.habits[0]).toMatchObject({ title: "Stretch", xp: 40 });
    expect(result.current.state.habits[0].log).toEqual({});
  });

  it("awards XP on tick and takes it straight back on un-tick", () => {
    const { result } = mount(makeSave({ habits: [makeHabit({ id: "h-1", xp: 60 })] }));

    act(() => result.current.actions.toggleHabitDay("h-1", today));
    expect(result.current.state.totalXP).toBe(60);
    expect(result.current.state.habits[0].log[today]).toBe(true);

    act(() => result.current.actions.toggleHabitDay("h-1", today));
    expect(result.current.state.totalXP).toBe(0);
    expect(result.current.state.habits[0].log[today]).toBeUndefined();
  });

  it("never drives total XP below zero", () => {
    const { result } = mount(
      makeSave({ totalXP: 10, habits: [makeHabit({ id: "h-1", xp: 100, log: { [today]: true } })] })
    );
    act(() => result.current.actions.toggleHabitDay("h-1", today));
    expect(result.current.state.totalXP).toBe(0);
  });

  it("can level the hunter up", () => {
    const { result } = mount(
      makeSave({ totalXP: 980, habits: [makeHabit({ id: "h-1", xp: 50 })] })
    );
    act(() => result.current.actions.toggleHabitDay("h-1", today));
    expect(result.current.state.fx.levelUp).toEqual({ from: 1, to: 2 });
  });

  it("deletes a habit", () => {
    const { result } = mount(makeSave({ habits: [makeHabit({ id: "h-1" })] }));
    act(() => result.current.actions.deleteHabit("h-1"));
    expect(result.current.state.habits).toEqual([]);
  });
});

describe("settings and import", () => {
  it("deep-merges a settings patch", () => {
    const { result } = mount(makeSave());
    act(() => result.current.actions.updateSettings({ theme: "frost" }));

    expect(result.current.state.settings.theme).toBe("frost");
    expect(result.current.state.settings.animations).toBe(true); // untouched
  });

  it("replaces the whole save on import", () => {
    const { result } = mount(makeSave({ totalXP: 100 }));
    act(() =>
      result.current.actions.importSave(makeSave({ totalXP: 9999, missions: [makeMission()] }))
    );

    expect(result.current.state.totalXP).toBe(9999);
    expect(result.current.state.missions).toHaveLength(1);
  });

  it("wipes everything on reset", () => {
    const { result } = mount(makeSave({ totalXP: 5000, missions: [makeMission()] }));
    act(() => result.current.actions.resetSave());

    expect(result.current.state.totalXP).toBe(0);
    expect(result.current.state.missions).toEqual([]);
  });
});

describe("persistence", () => {
  it("debounces the write and never persists the transient fx block", () => {
    const { result, persist } = mount(makeSave());

    act(() => result.current.actions.addMission({ title: "One" }));
    act(() => result.current.actions.addMission({ title: "Two" }));
    act(() => vi.advanceTimersByTime(700));

    expect(persist).toHaveBeenCalled();
    const payload = persist.mock.calls.at(-1)[0];
    expect(payload.fx).toBeUndefined();
    expect(payload.missions).toHaveLength(2);
  });
});

describe("day rollover", () => {
  it("clears yesterday's completed missions and resets the quest", () => {
    const yesterday = addDaysISO(today, -1);
    const { result } = mount(
      makeSave({
        dailyDate: yesterday,
        dayComplete: true,
        streak: 3,
        dailySelected: ["m-1"],
        missions: [makeMission({ id: "m-1", status: "completed" }), makeMission({ id: "m-2" })],
      })
    );

    expect(result.current.state.dailyDate).toBe(today);
    expect(result.current.state.missions.map((m) => m.id)).toEqual(["m-2"]);
    expect(result.current.state.dailySelected).toEqual([]);
    expect(result.current.state.dayComplete).toBe(false);
    expect(result.current.state.streak).toBe(3); // survived — the quest was done
  });

  it("spends a shield to keep the streak through a missed day", () => {
    const { result } = mount(
      makeSave({
        dailyDate: addDaysISO(today, -1),
        dayComplete: false,
        streak: 12,
        shields: 2,
        dailySelected: ["m-1"],
        missions: [makeMission({ id: "m-1" })],
      })
    );

    expect(result.current.state.streak).toBe(12); // the climb continues
    expect(result.current.state.shields).toBe(1);
    expect(result.current.state.fx.shielded).toEqual({ streak: 12, remaining: 1 });
    expect(result.current.state.fx.preserved).toBe(null);
    expect(result.current.state.fx.reset).toBe(null);
  });

  it("never spends XP, levels or a personal best to cover a missed day", () => {
    const { result } = mount(
      makeSave({
        dailyDate: addDaysISO(today, -1),
        dayComplete: false,
        streak: 12,
        longestStreak: 30,
        totalXP: 5000,
        shields: 0,
        dailySelected: ["m-1"],
        missions: [makeMission({ id: "m-1" })],
      })
    );

    expect(result.current.state.totalXP).toBe(5000);
    expect(result.current.state.longestStreak).toBe(30);
  });

  it("holds the streak in recovery once the Resolve buffer is empty", () => {
    const { result } = mount(
      makeSave({
        dailyDate: addDaysISO(today, -1),
        dayComplete: false,
        streak: 12,
        shields: 0,
        dailySelected: ["m-1"],
        missions: [makeMission({ id: "m-1" })],
      })
    );

    expect(result.current.state.recovery).toEqual({ streak: 12, since: today });
    expect(result.current.state.fx.preserved).toEqual({ streak: 12 });
    expect(result.current.state.fx.reset).toBe(null);
  });

  it("reclaims the whole preserved streak on a comeback", () => {
    const missions = Array.from({ length: DAILY_REQUIRED }, (_, i) =>
      makeMission({ id: `m-${i}`, xp: 10 })
    );
    const { result } = mount(
      makeSave({
        missions,
        dailySelected: missions.map((m) => m.id),
        streak: 0,
        recovery: { streak: 12, since: today },
      })
    );

    act(() => missions.forEach((m) => result.current.actions.completeMission(m.id)));

    expect(result.current.state.streak).toBe(13); // 12 restored, +1 for today
    expect(result.current.state.recovery).toBe(null);
    expect(result.current.state.fx.recovered).toEqual({ streak: 13 });
  });

  it("counts the comeback and unlocks its title", () => {
    const missions = Array.from({ length: DAILY_REQUIRED }, (_, i) =>
      makeMission({ id: `m-${i}`, xp: 10 })
    );
    const { result } = mount(
      makeSave({
        missions,
        dailySelected: missions.map((m) => m.id),
        comebacks: 0,
        recovery: { streak: 9, since: today },
      })
    );

    act(() => missions.forEach((m) => result.current.actions.completeMission(m.id)));

    expect(result.current.state.comebacks).toBe(1);
    expect(result.current.state.achievements["comeback-1"]).toBe(today);
  });

  it("pays a comeback bonus on top of the mission XP", () => {
    const missions = Array.from({ length: DAILY_REQUIRED }, (_, i) =>
      makeMission({ id: `m-${i}`, xp: 10 })
    );
    const { result } = mount(
      makeSave({
        missions,
        dailySelected: missions.map((m) => m.id),
        totalXP: 0,
        recovery: { streak: 5, since: today },
      })
    );

    act(() => missions.forEach((m) => result.current.actions.completeMission(m.id)));

    // Three awards land on this clear: the missions themselves, the daily
    // quest reward at the reclaimed streak, and the comeback bonus.
    const streak = 6; // the preserved 5 days, plus today
    expect(result.current.state.totalXP).toBe(
      DAILY_REQUIRED * 10 + dailyQuestXP(streak) + COMEBACK_XP
    );
  });

  it("settles the climb only after the recovery day also passes", () => {
    const { result } = mount(
      makeSave({
        dailyDate: addDaysISO(today, -1),
        dayComplete: false,
        streak: 0,
        shields: 0,
        recovery: { streak: 12, since: addDaysISO(today, -1) },
        dailySelected: ["m-1"],
        missions: [makeMission({ id: "m-1" })],
      })
    );

    expect(result.current.state.streak).toBe(0);
    expect(result.current.state.recovery).toBe(null);
    expect(result.current.state.fx.reset).toEqual({ previous: 12 });
  });

  it("does not punish a hunter who had nothing at stake", () => {
    const { result } = mount(
      makeSave({ dailyDate: addDaysISO(today, -1), streak: 0, dailySelected: [], missions: [] })
    );
    expect(result.current.state.fx.preserved).toBe(null);
    expect(result.current.state.fx.reset).toBe(null);
    expect(result.current.state.fx.newDay).toBe(true);
  });
});

/* =========================================================
   Rank — the permanence guarantee, exercised through the reducer
   ========================================================= */

describe("hunter rank", () => {
  it("seeds a loaded save's rank silently, with no cinematic", () => {
    const { result } = mount(makeSave({ streak: 95, longestStreak: 95 }));
    expect(result.current.state.bestRank).toBe("B");
    expect(result.current.state.fx.promotion).toBe(null);
  });

  it("shows the rank the hunter holds, not one derived from today's streak", () => {
    // A hunter who reached S-Rank and has since lost the streak entirely.
    const { result } = mount(makeSave({ bestRank: "S", streak: 0, longestStreak: 0 }));
    expect(result.current.rank.key).toBe("S");
    expect(result.current.state.bestRank).toBe("S");
  });

  it("never demotes across a missed day", () => {
    const { result } = mount(
      makeSave({
        bestRank: "B",
        streak: 40,
        longestStreak: 40,
        dailyDate: addDaysISO(today, -3),
        shields: 0,
        dailySelected: ["m-1"],
        missions: [makeMission({ id: "m-1" })],
      })
    );
    // The rollover has run and taken the streak with it; the rank stands.
    expect(result.current.state.streak).toBe(0);
    expect(result.current.state.bestRank).toBe("B");
    expect(result.current.rank.key).toBe("B");
  });

  it("keeps bestRankIndex in step so an older client still reads it", () => {
    const { result } = mount(makeSave({ streak: 200, longestStreak: 200 }));
    expect(result.current.state.bestRank).toBe("S");
    expect(result.current.state.bestRankIndex).toBe(result.current.rankIndex);
  });

  it("records the day a rank was reached, for the timeline", () => {
    const { result } = mount(makeSave({ streak: 25, longestStreak: 25 }));
    expect(result.current.state.rankLog.D).toBe(today);
  });

  it("promotes with an evaluation when a clear earns it", () => {
    const missions = Array.from({ length: DAILY_REQUIRED }, (_, i) =>
      makeMission({ id: `r-${i}`, xp: 10 })
    );
    const { result } = mount(
      makeSave({
        missions,
        dailySelected: missions.map((m) => m.id),
        streak: 44,
        longestStreak: 44,
      })
    );
    act(() => missions.forEach((m) => result.current.actions.completeMission(m.id)));

    expect(result.current.state.streak).toBe(45);
    expect(result.current.state.bestRank).toBe("C");
    expect(result.current.state.fx.promotion.rankKey).toBe("C");
    expect(result.current.state.fx.promotion.evaluation.missions).toBeGreaterThan(0);
  });

  it("does not re-fire a promotion the hunter already holds", () => {
    const missions = Array.from({ length: DAILY_REQUIRED }, (_, i) =>
      makeMission({ id: `q-${i}`, xp: 10 })
    );
    const { result } = mount(
      makeSave({ missions, dailySelected: missions.map((m) => m.id), streak: 5, bestRank: "D" })
    );
    act(() => missions.forEach((m) => result.current.actions.completeMission(m.id)));
    expect(result.current.state.fx.promotion).toBe(null);
  });

  it("reports progress toward the next rank", () => {
    const { result } = mount(makeSave({ streak: 19, longestStreak: 19 }));
    expect(result.current.ascent.next.key).toBe("D");
    expect(result.current.ascent.progress).toBeGreaterThan(0.8);
  });

  it("exposes a discipline score alongside the rank", () => {
    const { result } = mount(makeSave());
    expect(result.current.discipline.score).toBe(0);
    expect(result.current.discipline.ready).toBe(false);
  });
});

/* =========================================================
   The XP economy — quest reward, damping, and the abuse it prevents
   ========================================================= */

describe("daily quest reward", () => {
  /** Clear a full daily quest from a save, returning the resulting state. */
  function clearQuest(save = {}, xpEach = 10) {
    const missions = Array.from({ length: DAILY_REQUIRED }, (_, i) =>
      makeMission({ id: `dq-${i}`, xp: xpEach })
    );
    const { result } = mount(
      makeSave({ missions, dailySelected: missions.map((m) => m.id), ...save })
    );
    act(() => missions.forEach((m) => result.current.actions.completeMission(m.id)));
    return result;
  }

  it("pays a bonus for clearing the quest", () => {
    const result = clearQuest({ streak: 0 });
    expect(result.current.state.totalXP).toBe(DAILY_REQUIRED * 10 + dailyQuestXP(1));
  });

  it("pays more to a longer streak, up to the cap", () => {
    const short = clearQuest({ streak: 2 }).current.state.totalXP;
    const long = clearQuest({ streak: 60 }).current.state.totalXP;
    const longer = clearQuest({ streak: 300 }).current.state.totalXP;
    expect(long).toBeGreaterThan(short);
    expect(longer).toBe(long); // capped — a long run is never compulsory
  });

  it("pays nothing extra for clearing missions beyond the quest", () => {
    const result = clearQuest({ streak: 0 });
    const afterQuest = result.current.state.totalXP;
    act(() => result.current.actions.addMission({ title: "Extra", xp: 100 }));
    const extra = result.current.state.missions.find((m) => m.title === "Extra");
    act(() => result.current.actions.completeMission(extra.id));
    // The mission's own XP lands; no second quest bonus does.
    expect(result.current.state.totalXP).toBe(afterQuest + 100);
  });

  it("records the day so the timeline and challenges can read it", () => {
    const result = clearQuest({ streak: 3 });
    expect(result.current.state.questDays).toContain(today);
  });

  it("does not record the same day twice", () => {
    const result = clearQuest({ streak: 3, questDays: [today] });
    expect(result.current.state.questDays.filter((d) => d === today)).toHaveLength(1);
  });
});

describe("XP abuse prevention", () => {
  it("credits an ordinary day in full", () => {
    const { result } = mount(makeSave({ missions: [makeMission({ id: "m-1", xp: 800 })] }));
    act(() => result.current.actions.completeMission("m-1"));
    expect(result.current.state.totalXP).toBe(800);
    expect(result.current.state.dayXP).toBe(800);
  });

  it("damps a mission cleared past the day's soft cap", () => {
    const { result } = mount(
      makeSave({ dayXP: DAILY_XP_SOFT_CAP, missions: [makeMission({ id: "m-1", xp: 400 })] })
    );
    act(() => result.current.actions.completeMission("m-1"));
    expect(result.current.state.totalXP).toBe(200); // half rate
  });

  it("makes fifty fragments worth less than the honest work they replace", () => {
    const fragments = Array.from({ length: 50 }, (_, i) =>
      makeMission({ id: `f-${i}`, xp: 100 })
    );
    const { result } = mount(makeSave({ missions: fragments }));
    act(() => fragments.forEach((m) => result.current.actions.completeMission(m.id)));

    expect(result.current.state.dayXP).toBe(5000); // all of it attempted
    expect(result.current.state.totalXP).toBeLessThan(5000); // not all of it paid
    expect(result.current.state.totalXP).toBeGreaterThan(0); // and never punished
  });

  it("still records every clear in history, whatever it paid", () => {
    const missions = Array.from({ length: 30 }, (_, i) => makeMission({ id: `h-${i}`, xp: 300 }));
    const { result } = mount(makeSave({ missions }));
    act(() => missions.forEach((m) => result.current.actions.completeMission(m.id)));
    expect(result.current.state.history).toHaveLength(30);
  });

  it("restores the full-rate allowance when the day turns over", () => {
    const { result } = mount(
      makeSave({ dayXP: DAILY_XP_SOFT_CAP * 3, dailyDate: addDaysISO(today, -1) })
    );
    expect(result.current.state.dayXP).toBe(0);
  });

  it("never takes XP away when the day rolls over", () => {
    const { result } = mount(
      makeSave({ totalXP: 40_000, dayXP: 9000, dailyDate: addDaysISO(today, -1) })
    );
    expect(result.current.state.totalXP).toBe(40_000);
  });

  it("cannot mint XP by ticking and un-ticking a habit past the cap", () => {
    const { result } = mount(
      makeSave({ dayXP: DAILY_XP_SOFT_CAP - 20, habits: [makeHabit({ id: "h-1", xp: 200 })] })
    );
    const before = result.current.state.totalXP;

    for (let i = 0; i < 10; i += 1) {
      act(() => result.current.actions.toggleHabitDay("h-1", today));
      act(() => result.current.actions.toggleHabitDay("h-1", today));
    }
    expect(result.current.state.totalXP).toBe(before);
    expect(result.current.state.dayXP).toBe(DAILY_XP_SOFT_CAP - 20);
  });

  it("pays a back-filled habit day in full — catching up is not farming", () => {
    const { result } = mount(
      makeSave({ dayXP: DAILY_XP_SOFT_CAP * 4, habits: [makeHabit({ id: "h-1", xp: 50 })] })
    );
    act(() => result.current.actions.toggleHabitDay("h-1", addDaysISO(today, -3)));
    expect(result.current.state.totalXP).toBe(50);
  });
});
