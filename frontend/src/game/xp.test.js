import { describe, it, expect } from "vitest";
import {
  creditXP,
  refundXP,
  fullRateRemaining,
  dailyQuestXP,
  DAILY_XP_SOFT_CAP,
  DAILY_CLEAR_XP,
  STREAK_BONUS_MAX,
  STREAK_BONUS_PER_DAY,
} from "./xp";

describe("daily XP crediting", () => {
  it("pays an honest day in full", () => {
    const { credited, damped } = creditXP(400, 0);
    expect(credited).toBe(400);
    expect(damped).toBe(false);
  });

  it("pays every award in full right up to the cap", () => {
    const { credited, damped } = creditXP(DAILY_XP_SOFT_CAP, 0);
    expect(credited).toBe(DAILY_XP_SOFT_CAP);
    expect(damped).toBe(false);
  });

  it("splits an award that straddles the cap rather than damping all of it", () => {
    // 200 below the cap at full rate, 800 above it at half
    const { credited } = creditXP(1000, DAILY_XP_SOFT_CAP - 200);
    expect(credited).toBe(200 + 400);
  });

  it("steps down through the bands as the day goes on", () => {
    expect(creditXP(100, DAILY_XP_SOFT_CAP).credited).toBe(50);
    expect(creditXP(100, DAILY_XP_SOFT_CAP * 2).credited).toBe(25);
    expect(creditXP(100, DAILY_XP_SOFT_CAP * 3).credited).toBe(10);
  });

  it("never reaches zero — farming stops paying, it is never punished", () => {
    const { credited } = creditXP(500, DAILY_XP_SOFT_CAP * 20);
    expect(credited).toBeGreaterThan(0);
  });

  it("makes task-splitting strictly worse than one honest mission", () => {
    // one 2000 XP mission vs. forty 50 XP fragments, from a clean day
    const whole = creditXP(2000, 0).credited;

    let position = 0;
    let farmed = 0;
    for (let i = 0; i < 40; i += 1) {
      farmed += creditXP(50, position).credited;
      position += 50;
    }
    expect(farmed).toBeLessThanOrEqual(whole);
  });

  it("is order-independent: the same total pays the same either way", () => {
    const single = creditXP(3000, 0).credited;
    const first = creditXP(1000, 0);
    const second = creditXP(2000, 1000);
    expect(first.credited + second.credited).toBe(single);
  });

  it("treats junk input as nothing rather than crashing", () => {
    expect(creditXP(undefined, 0).credited).toBe(0);
    expect(creditXP(-500, 0).credited).toBe(0);
    expect(creditXP(100, undefined).credited).toBe(100);
    expect(creditXP(100, -9000).credited).toBe(100);
  });

  it("reports whether an award was damped", () => {
    expect(creditXP(100, 0).damped).toBe(false);
    expect(creditXP(100, DAILY_XP_SOFT_CAP).damped).toBe(true);
  });
});

describe("refunds", () => {
  it("gives back exactly what an award was paid", () => {
    const earned = 300;
    const award = creditXP(200, earned);
    expect(refundXP(200, earned + 200)).toBe(award.credited);
  });

  it("gives back the damped amount, not the nominal one", () => {
    const earned = DAILY_XP_SOFT_CAP + 500;
    const award = creditXP(400, earned);
    expect(award.credited).toBe(200);
    expect(refundXP(400, earned + 400)).toBe(200);
  });

  it("cannot mint XP by ticking and un-ticking across the cap", () => {
    let day = DAILY_XP_SOFT_CAP - 100;
    let total = 0;
    for (let i = 0; i < 25; i += 1) {
      const gained = creditXP(200, day).credited;
      total += gained;
      day += 200;
      total -= refundXP(200, day);
      day -= 200;
    }
    expect(total).toBe(0);
  });
});

describe("full-rate allowance", () => {
  it("counts down from the cap and never goes negative", () => {
    expect(fullRateRemaining(0)).toBe(DAILY_XP_SOFT_CAP);
    expect(fullRateRemaining(1000)).toBe(DAILY_XP_SOFT_CAP - 1000);
    expect(fullRateRemaining(DAILY_XP_SOFT_CAP * 5)).toBe(0);
  });
});

describe("daily quest reward", () => {
  it("pays a flat bonus even on day zero", () => {
    expect(dailyQuestXP(0)).toBe(DAILY_CLEAR_XP);
  });

  it("grows with the streak", () => {
    expect(dailyQuestXP(10)).toBe(DAILY_CLEAR_XP + 10 * STREAK_BONUS_PER_DAY);
    expect(dailyQuestXP(20)).toBeGreaterThan(dailyQuestXP(10));
  });

  it("caps the streak component so a long run is never compulsory", () => {
    const capped = DAILY_CLEAR_XP + STREAK_BONUS_MAX;
    expect(dailyQuestXP(40)).toBe(capped);
    expect(dailyQuestXP(400)).toBe(capped);
    expect(dailyQuestXP(4000)).toBe(capped);
  });

  it("is monotonic and never negative", () => {
    let previous = 0;
    for (let streak = 0; streak <= 200; streak += 1) {
      const xp = dailyQuestXP(streak);
      expect(xp).toBeGreaterThanOrEqual(previous);
      previous = xp;
    }
    expect(dailyQuestXP(-5)).toBe(DAILY_CLEAR_XP);
  });
});
