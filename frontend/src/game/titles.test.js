import { describe, it, expect } from "vitest";
import { TITLES, titleById, activeTitleName, unlockedTitles } from "./titles";
import { RARITY, RARITY_ORDER, rarityOf, byRarity } from "./rarity";
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES, localISO, addDaysISO } from "./constants";

const today = localISO();

const BLANK = {
  history: [], habits: [], totalXP: 0, streak: 0, longestStreak: 0,
  comebacks: 0, shields: 0, recovery: null, bestRank: "E", titles: {},
  activeTitle: null, questDays: [], disciplineScore: 0,
};

describe("rarity", () => {
  it("orders the tiers from common to legendary", () => {
    expect(RARITY.common.order).toBeLessThan(RARITY.rare.order);
    expect(RARITY.rare.order).toBeLessThan(RARITY.epic.order);
    expect(RARITY.epic.order).toBeLessThan(RARITY.legendary.order);
  });

  it("keeps the bottom two tiers quiet — celebration everywhere is celebration nowhere", () => {
    expect(RARITY.common.glow).toBe(false);
    expect(RARITY.rare.glow).toBe(false);
    expect(RARITY.epic.glow).toBe(true);
    expect(RARITY.legendary.glow).toBe(true);
  });

  it("falls back to common for anything unlabelled", () => {
    expect(rarityOf(undefined).key).toBe("common");
    expect(rarityOf("mythic").key).toBe("common");
  });

  it("lists the tiers rarest first", () => {
    expect(RARITY_ORDER.map((r) => r.key)).toEqual(["legendary", "epic", "rare", "common"]);
  });

  it("sorts records rarest first", () => {
    const sorted = [
      { title: "b", rarity: "common" },
      { title: "a", rarity: "legendary" },
      { title: "c", rarity: "rare" },
    ].sort(byRarity);
    expect(sorted.map((r) => r.rarity)).toEqual(["legendary", "rare", "common"]);
  });
});

describe("achievements", () => {
  it("gives every record a category the wall knows how to show", () => {
    for (const a of ACHIEVEMENTS) {
      expect(ACHIEVEMENT_CATEGORIES).toContain(a.category);
    }
  });

  it("gives every record a real rarity", () => {
    for (const a of ACHIEVEMENTS) {
      expect(Object.keys(RARITY)).toContain(a.rarity);
    }
  });

  it("does not make everything legendary", () => {
    const legendary = ACHIEVEMENTS.filter((a) => a.rarity === "legendary").length;
    expect(legendary).toBeLessThan(ACHIEVEMENTS.length / 3);
  });

  it("covers every category the vision asks for", () => {
    for (const category of ACHIEVEMENT_CATEGORIES) {
      expect(ACHIEVEMENTS.some((a) => a.category === category)).toBe(true);
    }
  });

  it("rewards no achievement for a single day's burst of activity", () => {
    // One day, four hundred clears. Nothing beyond the first-steps counters
    // — which are lifetime totals — may unlock from that.
    const burst = {
      ...BLANK,
      history: Array.from({ length: 400 }, (_, i) => ({ id: `b${i}`, xp: 50, completedAt: today })),
      totalXP: 20_000,
    };
    const earned = ACHIEVEMENTS.filter((a) => a.test(burst)).map((a) => a.id);
    for (const id of ["days-7", "days-30", "days-100", "streak-21", "quest-30"]) {
      expect(earned).not.toContain(id);
    }
  });

  it("unlocks the consistency line from days shown up for, not things ticked", () => {
    const spread = {
      ...BLANK,
      history: Array.from({ length: 30 }, (_, i) => ({
        id: `s${i}`,
        xp: 100,
        completedAt: addDaysISO(today, -i),
      })),
    };
    const earned = ACHIEVEMENTS.filter((a) => a.test(spread)).map((a) => a.id);
    expect(earned).toContain("days-7");
    expect(earned).toContain("days-30");
  });

  it("reads rank achievements from the permanent key", () => {
    const byId = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));
    // No streak at all, but the hunter holds S-Rank — every licence up to it
    // is theirs and stays theirs.
    const held = { ...BLANK, bestRank: "S" };
    expect(byId["rank-d"].test(held)).toBe(true);
    expect(byId["rank-c"].test(held)).toBe(true);
    expect(byId["rank-s"].test(held)).toBe(true);
    expect(byId["rank-national"].test(held)).toBe(false);
  });

  it("still answers correctly for an unmigrated v3 state", () => {
    const byId = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));
    const legacy = { ...BLANK, bestRank: undefined, bestRankIndex: 3 }; // v3 S-Rank
    expect(byId["rank-s"].test(legacy)).toBe(true);
    expect(byId["rank-national"].test(legacy)).toBe(false);
  });
});

describe("titles", () => {
  it("has unique ids and a real rarity on each", () => {
    const ids = TITLES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const t of TITLES) {
      expect(Object.keys(RARITY)).toContain(t.rarity);
      expect(t.name).toBeTruthy();
      expect(t.desc).toBeTruthy();
      expect(t.hint).toBeTruthy();
    }
  });

  it("stays entirely locked for a brand-new hunter", () => {
    expect(TITLES.filter((t) => t.test(BLANK))).toEqual([]);
  });

  it("gives a locked title a hint without printing the threshold", () => {
    for (const t of TITLES) {
      expect(t.hint.length).toBeGreaterThan(10);
    }
  });

  it("unlocks the first title on a first cleared mission", () => {
    const started = { ...BLANK, history: [{ id: "m", xp: 100, completedAt: today }] };
    expect(TITLES.filter((t) => t.test(started)).map((t) => t.id)).toEqual(["the-initiate"]);
  });

  it("earns the recovery titles by coming back, not by never falling", () => {
    const returned = { ...BLANK, comebacks: 1 };
    expect(titleById("the-returned").test(returned)).toBe(true);
    expect(titleById("the-relentless").test(returned)).toBe(false);
    expect(titleById("the-relentless").test({ ...BLANK, comebacks: 5 })).toBe(true);
  });

  it("reads the Discipline Score handed to it", () => {
    expect(titleById("steady-hand").test({ ...BLANK, disciplineScore: 64 })).toBe(false);
    expect(titleById("steady-hand").test({ ...BLANK, disciplineScore: 65 })).toBe(true);
    expect(titleById("immovable").test({ ...BLANK, disciplineScore: 85 })).toBe(true);
  });

  it("reads rank titles from the permanent key", () => {
    expect(titleById("s-rank-hunter").test({ ...BLANK, bestRank: "S" })).toBe(true);
    expect(titleById("s-rank-hunter").test({ ...BLANK, bestRank: "A" })).toBe(false);
    expect(titleById("monarch").test({ ...BLANK, bestRank: "NATIONAL" })).toBe(true);
  });

  it("cannot be earned by a single day of task-splitting", () => {
    const burst = {
      ...BLANK,
      history: Array.from({ length: 300 }, (_, i) => ({ id: `b${i}`, xp: 20, completedAt: today })),
    };
    const earned = TITLES.filter((t) => t.test(burst)).map((t) => t.id);
    expect(earned).not.toContain("consistent-hunter");
    expect(earned).not.toContain("the-centurion");
    expect(earned).not.toContain("iron-will");
  });

  it("resolves an unknown id to nothing rather than crashing", () => {
    expect(titleById("nonsense")).toBeNull();
    expect(titleById(undefined)).toBeNull();
  });
});

describe("wearing a title", () => {
  it("names the worn title", () => {
    const state = { titles: { "iron-will": today }, activeTitle: "iron-will" };
    expect(activeTitleName(state)).toBe("Iron Will");
  });

  it("names nothing when none is worn", () => {
    expect(activeTitleName({ titles: {}, activeTitle: null })).toBeNull();
    expect(activeTitleName(undefined)).toBeNull();
  });

  it("refuses to name a title the hunter has not unlocked", () => {
    expect(activeTitleName({ titles: {}, activeTitle: "monarch" })).toBeNull();
  });

  it("lists only unlocked titles", () => {
    const state = { titles: { "the-initiate": today, monarch: today } };
    expect(unlockedTitles(state).map((t) => t.id)).toEqual(["the-initiate", "monarch"]);
    expect(unlockedTitles({}).length).toBe(0);
  });
});
