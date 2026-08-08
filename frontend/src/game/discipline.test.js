import { describe, it, expect } from "vitest";
import {
  disciplineScore,
  bandFor,
  clearsByDay,
  tenureDays,
  windowFor,
  BANDS,
  WEIGHTS,
  COMPONENT_COPY,
  DISCIPLINE_WINDOW_DAYS,
  MIN_WINDOW_DAYS,
  EFFORT_DAILY_CAP,
} from "./discipline";
import { localISO, addDaysISO } from "./constants";

const today = localISO();

/** A state with `count` clears on each of the last `days` days. */
function steady(days, count = 1, overrides = {}) {
  const history = [];
  for (let i = 0; i < days; i += 1) {
    for (let n = 0; n < count; n += 1) {
      history.push({ id: `${i}-${n}`, xp: 300, completedAt: addDaysISO(today, -i) });
    }
  }
  return { history, habits: [], streak: days, comebacks: 0, recovery: null, ...overrides };
}

const EMPTY = { history: [], habits: [], streak: 0, comebacks: 0, recovery: null };

describe("signal extraction", () => {
  it("counts missions and habit logs on the same footing", () => {
    const counts = clearsByDay({
      history: [{ completedAt: today, xp: 100 }],
      habits: [{ log: { [today]: true, [addDaysISO(today, -1)]: true } }],
    });
    expect(counts.get(today)).toBe(2);
    expect(counts.get(addDaysISO(today, -1))).toBe(1);
  });

  it("ignores un-ticked habit days", () => {
    const counts = clearsByDay({ history: [], habits: [{ log: { [today]: false } }] });
    expect(counts.get(today)).toBeUndefined();
  });

  it("tolerates a state with nothing in it", () => {
    expect(clearsByDay({}).size).toBe(0);
    expect(tenureDays({}, today)).toBe(0);
  });
});

describe("the scoring window", () => {
  it("never measures a new hunter against a month they haven't lived", () => {
    expect(windowFor(steady(3), today)).toBe(MIN_WINDOW_DAYS);
  });

  it("opens out to the full window once there is enough record", () => {
    expect(windowFor(steady(40), today)).toBe(DISCIPLINE_WINDOW_DAYS);
  });

  it("is zero for a hunter with no record at all", () => {
    expect(windowFor(EMPTY, today)).toBe(0);
  });
});

describe("the score", () => {
  it("is zero, and flagged not-ready, for a brand-new hunter", () => {
    const result = disciplineScore(EMPTY, today);
    expect(result.score).toBe(0);
    expect(result.ready).toBe(false);
  });

  it("stays inside 0..100 across wildly different records", () => {
    for (const state of [EMPTY, steady(1), steady(7, 10), steady(60, 3), steady(400, 40)]) {
      const { score } = disciplineScore(state, today);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });

  it("rewards an unbroken month near the top of the range", () => {
    const { score } = disciplineScore(steady(30, 2), today);
    expect(score).toBeGreaterThanOrEqual(85);
  });

  it("scores showing up every day above showing up occasionally", () => {
    const daily = disciplineScore(steady(28, 1), today).score;

    const occasional = { ...EMPTY, streak: 0, history: [] };
    for (let i = 0; i < 28; i += 4) {
      occasional.history.push({ completedAt: addDaysISO(today, -i), xp: 300 });
    }
    expect(daily).toBeGreaterThan(disciplineScore(occasional, today).score);
  });

  it("exposes every weighted component, summing to the score", () => {
    const result = disciplineScore(steady(20, 2), today);
    expect(result.components.map((c) => c.key).sort()).toEqual(
      Object.keys(WEIGHTS).sort()
    );
    const summed = Math.round(result.components.reduce((s, c) => s + c.points, 0));
    expect(summed).toBe(result.score);
  });

  it("has copy for every component it reports", () => {
    for (const { key } of disciplineScore(steady(10), today).components) {
      expect(COMPONENT_COPY[key]).toBeTruthy();
    }
  });
});

describe("resistance to task-spam", () => {
  it("caps how much a single day of clears can contribute", () => {
    const four = disciplineScore(steady(14, EFFORT_DAILY_CAP), today).score;
    const forty = disciplineScore(steady(14, 40), today).score;
    expect(forty).toBe(four);
  });

  it("scores one day of forty clears far below fourteen days of two", () => {
    const dumped = {
      ...EMPTY,
      history: Array.from({ length: 40 }, (_, i) => ({ id: `x${i}`, completedAt: today, xp: 300 })),
    };
    const spread = steady(14, 2);
    expect(disciplineScore(dumped, today).score).toBeLessThan(
      disciplineScore(spread, today).score
    );
  });

  it("cannot be raised by piling more work onto days already counted", () => {
    const base = disciplineScore(steady(21, EFFORT_DAILY_CAP), today).score;
    const inflated = disciplineScore(steady(21, EFFORT_DAILY_CAP * 5), today).score;
    expect(inflated).toBe(base);
  });
});

describe("the score never punishes", () => {
  it("counts a streak held in recovery rather than treating it as lost", () => {
    const record = steady(20, 2);
    const held = { ...record, streak: 0, recovery: { streak: 20, since: today } };
    const wiped = { ...record, streak: 0, recovery: null };
    expect(disciplineScore(held, today).score).toBeGreaterThan(
      disciplineScore(wiped, today).score
    );
  });

  it("gives a clean, gapless record full marks for recovery", () => {
    const result = disciplineScore(steady(28, 2), today);
    const recovery = result.components.find((c) => c.key === "recovery");
    expect(recovery.signal).toBe(1);
  });

  it("rewards a hunter who returned after a gap over one who did not", () => {
    const gapThenReturn = { ...EMPTY, history: [] };
    for (const daysAgo of [10, 9, 8, 5, 4, 3, 2, 1, 0]) {
      gapThenReturn.history.push({ completedAt: addDaysISO(today, -daysAgo), xp: 300 });
    }
    const stoppedAtTheGap = {
      ...EMPTY,
      history: [10, 9, 8].map((d) => ({ completedAt: addDaysISO(today, -d), xp: 300 })),
    };
    expect(disciplineScore(gapThenReturn, today).score).toBeGreaterThan(
      disciplineScore(stoppedAtTheGap, today).score
    );
  });

  it("lets lifetime comebacks carry the recovery signal", () => {
    const withComebacks = disciplineScore(steady(12, 1, { comebacks: 5 }), today);
    const recovery = withComebacks.components.find((c) => c.key === "recovery");
    expect(recovery.signal).toBe(1);
  });

  it("never lowers a score for adding a mission that isn't done yet", () => {
    const before = disciplineScore(steady(14, 2), today).score;
    const planned = { ...steady(14, 2), missions: Array.from({ length: 50 }, () => ({ status: "active" })) };
    expect(disciplineScore(planned, today).score).toBe(before);
  });
});

describe("bands", () => {
  it("labels every score with an encouraging band", () => {
    for (let score = 0; score <= 100; score += 1) {
      const band = bandFor(score);
      expect(band.label).toBeTruthy();
      expect(band.blurb).toBeTruthy();
    }
  });

  it("moves up through the bands as the score rises", () => {
    expect(bandFor(0).key).toBe("starting");
    expect(bandFor(24).key).toBe("starting");
    expect(bandFor(25).key).toBe("building");
    expect(bandFor(45).key).toBe("steady");
    expect(bandFor(65).key).toBe("strong");
    expect(bandFor(85).key).toBe("unshakable");
    expect(bandFor(100).key).toBe("unshakable");
  });

  it("keeps the band table ordered and free of failure language", () => {
    const mins = BANDS.map((b) => b.min);
    expect([...mins].sort((a, b) => a - b)).toEqual(mins);
    const words = BANDS.map((b) => `${b.label} ${b.blurb}`.toLowerCase()).join(" ");
    for (const banned of ["fail", "lazy", "behind", "poor", "bad"]) {
      expect(words).not.toContain(banned);
    }
  });
});
