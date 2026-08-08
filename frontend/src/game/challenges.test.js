import { describe, it, expect } from "vitest";
import {
  weeklyBaseline,
  weeklyTarget,
  weeklyReward,
  weeklyChallenge,
  bossForWeek,
  bossChallenge,
  BOSSES,
  CHALLENGE_COPY,
  WEEKLY_MIN,
  WEEKLY_MAX,
  WEEKLY_XP_MAX,
  BOSS_XP,
} from "./challenges";
import { localISO, addDaysISO } from "./constants";
import { startOfWeekISO } from "../utils/date";

const today = localISO();
const thisWeek = startOfWeekISO(today);

/** `count` clears on a given ISO day. */
const clearsOn = (day, count) =>
  Array.from({ length: count }, (_, i) => ({ id: `${day}-${i}`, xp: 200, completedAt: day }));

const BLANK = { history: [], habits: [], questDays: [], challenge: null };

describe("the weekly target", () => {
  it("uses the hunter's own recent output as the baseline", () => {
    const lastWeek = addDaysISO(thisWeek, -7);
    const state = { ...BLANK, history: clearsOn(lastWeek, 20) };
    expect(weeklyBaseline(state.history, today)).toBe(20);
  });

  it("takes the better of the last two weeks, so one quiet week doesn't shrink it", () => {
    const lastWeek = addDaysISO(thisWeek, -7);
    const weekBefore = addDaysISO(thisWeek, -14);
    const state = { ...BLANK, history: [...clearsOn(lastWeek, 2), ...clearsOn(weekBefore, 24)] };
    expect(weeklyBaseline(state.history, today)).toBe(24);
  });

  it("sets the target just below the hunter's own baseline", () => {
    const lastWeek = addDaysISO(thisWeek, -7);
    const target = weeklyTarget(clearsOn(lastWeek, 20), today);
    expect(target).toBeLessThan(20);
    expect(target).toBeGreaterThan(10);
  });

  it("gives a brand-new hunter something small and reachable", () => {
    expect(weeklyTarget([], today)).toBe(WEEKLY_MIN);
  });

  it("never sets a target outside the attemptable range", () => {
    const lastWeek = addDaysISO(thisWeek, -7);
    for (const volume of [0, 1, 5, 20, 60, 500]) {
      const target = weeklyTarget(clearsOn(lastWeek, volume), today);
      expect(target).toBeGreaterThanOrEqual(WEEKLY_MIN);
      expect(target).toBeLessThanOrEqual(WEEKLY_MAX);
    }
  });

  it("ignores this week's own clears, so the target can't run away from you", () => {
    const heavy = { ...BLANK, history: clearsOn(today, 40) };
    expect(weeklyTarget(heavy.history, today)).toBe(WEEKLY_MIN);
  });

  it("scales the reward with the target, capped", () => {
    expect(weeklyReward(5)).toBe(125);
    expect(weeklyReward(20)).toBe(500);
    expect(weeklyReward(100)).toBe(WEEKLY_XP_MAX);
  });
});

describe("the weekly challenge", () => {
  it("counts only this week's clears", () => {
    const state = {
      ...BLANK,
      history: [...clearsOn(today, 3), ...clearsOn(addDaysISO(thisWeek, -3), 9)],
    };
    expect(weeklyChallenge(state, today).rawProgress).toBe(3);
  });

  it("completes once the target is reached", () => {
    const state = { ...BLANK, history: clearsOn(today, WEEKLY_MIN) };
    const challenge = weeklyChallenge(state, today);
    expect(challenge.complete).toBe(true);
    expect(challenge.remaining).toBe(0);
  });

  it("reports what is left without ever going negative", () => {
    const state = { ...BLANK, history: clearsOn(today, 100) };
    const challenge = weeklyChallenge(state, today);
    expect(challenge.remaining).toBe(0);
    expect(challenge.progress).toBeLessThanOrEqual(challenge.target);
  });

  it("is unclaimed until the slice says otherwise, and only for this week", () => {
    const done = { ...BLANK, history: clearsOn(today, 9) };
    expect(weeklyChallenge(done, today).claimed).toBe(false);

    const claimedNow = { ...done, challenge: { week: thisWeek, weeklyClaimed: true } };
    expect(weeklyChallenge(claimedNow, today).claimed).toBe(true);

    // A claim recorded against last week does not carry into this one.
    const staleClaim = {
      ...done,
      challenge: { week: addDaysISO(thisWeek, -7), weeklyClaimed: true },
    };
    expect(weeklyChallenge(staleClaim, today).claimed).toBe(false);
  });
});

describe("the boss", () => {
  it("is the same boss all week and a real one", () => {
    expect(bossForWeek(thisWeek).key).toBe(bossForWeek(thisWeek).key);
    expect(BOSSES.map((b) => b.key)).toContain(bossForWeek(thisWeek).key);
  });

  it("rotates across weeks rather than sitting on one", () => {
    const keys = new Set();
    for (let i = 0; i < 24; i += 1) keys.add(bossForWeek(addDaysISO(thisWeek, -7 * i)).key);
    expect(keys.size).toBeGreaterThan(1);
  });

  it("counts for nothing until it is accepted", () => {
    const state = { ...BLANK, history: clearsOn(today, 60) };
    expect(bossChallenge(state, today).accepted).toBe(false);
  });

  it("cannot be beaten by one enormous day", () => {
    // Sixty clears, all today. Volume alone is not a week.
    const dumped = { ...BLANK, history: clearsOn(today, 60) };
    const boss = bossChallenge(dumped, today);
    expect(boss.complete).toBe(false);
    expect(boss.objectives.find((o) => o.key === "days").met).toBe(false);
  });

  it("is beaten by a week that was actually shown up for", () => {
    const history = [];
    const questDays = [];
    for (let i = 0; i < 7; i += 1) {
      const day = addDaysISO(thisWeek, i);
      history.push(...clearsOn(day, 5));
      questDays.push(day);
    }
    const week = { ...BLANK, history, questDays };
    // Evaluated on the last day of the week, so every day counts.
    const boss = bossChallenge(week, addDaysISO(thisWeek, 6));
    expect(boss.complete).toBe(true);
  });

  it("reports movement on every objective, not all-or-nothing", () => {
    const state = { ...BLANK, history: clearsOn(today, 3), questDays: [today] };
    const boss = bossChallenge(state, today);
    expect(boss.progress).toBeGreaterThan(0);
    expect(boss.progress).toBeLessThan(1);
    expect(boss.objectives).toHaveLength(3);
  });

  it("keeps every objective's progress inside 0..1", () => {
    const state = { ...BLANK, history: clearsOn(today, 500), questDays: [today] };
    for (const o of bossChallenge(state, today).objectives) {
      expect(o.progress).toBeGreaterThanOrEqual(0);
      expect(o.progress).toBeLessThanOrEqual(1);
    }
  });

  it("pays substantially, and the same for every boss", () => {
    expect(bossChallenge(BLANK, today).xp).toBe(BOSS_XP);
    expect(BOSS_XP).toBeGreaterThan(WEEKLY_XP_MAX);
  });

  it("counts only quest days inside this week", () => {
    const state = {
      ...BLANK,
      questDays: [addDaysISO(thisWeek, -3), addDaysISO(thisWeek, -10), today],
    };
    expect(bossChallenge(state, today).objectives.find((o) => o.key === "quests").current).toBe(1);
  });
});

describe("the language of an unfinished challenge", () => {
  it("never tells a hunter they failed or lost", () => {
    const lines = [
      ...Object.values(CHALLENGE_COPY).map((v) => (typeof v === "function" ? v(3) : v)),
      ...BOSSES.map((b) => `${b.name} ${b.blurb}`),
    ]
      .join(" ")
      .toLowerCase();

    for (const banned of ["failed", "you lost", "lost everything", "give up", "behind"]) {
      expect(lines).not.toContain(banned);
    }
  });

  it("says the challenge remains rather than that it ended badly", () => {
    expect(CHALLENGE_COPY.bossUnfinished.toLowerCase()).toContain("remains");
  });

  it("makes the boss's optionality explicit", () => {
    expect(CHALLENGE_COPY.bossOffer.toLowerCase()).toContain("optional");
  });

  it("promises the record survives a week that did not go well", () => {
    expect(CHALLENGE_COPY.weekRolled.toLowerCase()).toContain("record does not");
  });
});
