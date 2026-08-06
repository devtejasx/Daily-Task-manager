import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { usePomodoro, formatClock, PHASES } from "./usePomodoro";

const DURATIONS = { work: 25, shortBreak: 5, longBreak: 15, rounds: 4 };

/** Advance both the fake clock and the interval that reads it. */
function tick(ms) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 7, 6, 9, 0, 0));
});
afterEach(() => vi.useRealTimers());

describe("formatClock", () => {
  it("renders mm:ss, zero padded", () => {
    expect(formatClock(0)).toBe("00:00");
    expect(formatClock(9)).toBe("00:09");
    expect(formatClock(65)).toBe("01:05");
    expect(formatClock(25 * 60)).toBe("25:00");
  });

  it("never renders a negative clock", () => {
    expect(formatClock(-30)).toBe("00:00");
  });
});

describe("initial state", () => {
  it("starts idle in the focus phase, loaded with the work duration", () => {
    const { result } = renderHook(() => usePomodoro(DURATIONS));

    expect(result.current.phase).toBe("work");
    expect(result.current.running).toBe(false);
    expect(result.current.remaining).toBe(25 * 60);
    expect(result.current.round).toBe(1);
    expect(result.current.progress).toBe(0);
  });

  it("falls back to the 25/5 defaults for a missing config", () => {
    const { result } = renderHook(() => usePomodoro(undefined));
    expect(result.current.remaining).toBe(25 * 60);
  });

  it("honours custom durations", () => {
    const { result } = renderHook(() => usePomodoro({ ...DURATIONS, work: 50 }));
    expect(result.current.remaining).toBe(50 * 60);
  });
});

describe("start / pause / resume", () => {
  it("counts down once started", () => {
    const { result } = renderHook(() => usePomodoro(DURATIONS));

    act(() => result.current.start());
    expect(result.current.running).toBe(true);

    tick(60_000);
    expect(result.current.remaining).toBe(24 * 60);
    expect(result.current.progress).toBeCloseTo(1 / 25, 3);
  });

  it("freezes the clock while paused and resumes from the same point", () => {
    const { result } = renderHook(() => usePomodoro(DURATIONS));

    act(() => result.current.start());
    tick(120_000);
    act(() => result.current.pause());

    const atPause = result.current.remaining;
    expect(atPause).toBe(23 * 60);

    tick(300_000); // five minutes of wall clock pass while paused
    expect(result.current.remaining).toBe(atPause);

    act(() => result.current.start());
    tick(60_000);
    expect(result.current.remaining).toBe(atPause - 60);
  });

  it("toggles between running and paused", () => {
    const { result } = renderHook(() => usePomodoro(DURATIONS));

    act(() => result.current.toggle());
    expect(result.current.running).toBe(true);

    act(() => result.current.toggle());
    expect(result.current.running).toBe(false);
  });

  it("does not drift when the tab is throttled", () => {
    // The countdown is derived from a deadline, not decremented per tick, so
    // one huge jump must land exactly where many small ticks would.
    const { result } = renderHook(() => usePomodoro(DURATIONS));

    act(() => result.current.start());
    tick(10 * 60_000);

    expect(result.current.remaining).toBe(15 * 60);
  });
});

describe("reset", () => {
  it("reloads the current phase and stops the clock", () => {
    const { result } = renderHook(() => usePomodoro(DURATIONS));

    act(() => result.current.start());
    tick(5 * 60_000);
    act(() => result.current.reset());

    expect(result.current.remaining).toBe(25 * 60);
    expect(result.current.running).toBe(false);
    expect(result.current.round).toBe(1);
  });

  it("resetAll returns to round 1 of focus", () => {
    const { result } = renderHook(() => usePomodoro(DURATIONS));

    act(() => result.current.skip()); // -> short break, round 2
    act(() => result.current.resetAll());

    expect(result.current.phase).toBe("work");
    expect(result.current.round).toBe(1);
    expect(result.current.completedRounds).toBe(0);
  });
});

describe("phase progression", () => {
  it("moves focus -> short break and counts the round", () => {
    const { result } = renderHook(() => usePomodoro(DURATIONS));

    act(() => result.current.start());
    tick(25 * 60_000 + 1000);

    expect(result.current.phase).toBe("shortBreak");
    expect(result.current.completedRounds).toBe(1);
    expect(result.current.round).toBe(2);
  });

  it("auto-starts the break but waits for a deliberate start after it", () => {
    const { result } = renderHook(() => usePomodoro(DURATIONS));

    act(() => result.current.start());
    tick(25 * 60_000 + 1000);
    expect(result.current.running).toBe(true); // break rolls straight on

    tick(5 * 60_000 + 1000);
    expect(result.current.phase).toBe("work");
    expect(result.current.running).toBe(false); // focus is never forced
  });

  it("takes a long break after the configured number of rounds", () => {
    const { result } = renderHook(() => usePomodoro({ ...DURATIONS, rounds: 2 }));

    act(() => result.current.skip()); // round 1 done -> short break
    expect(result.current.phase).toBe("shortBreak");

    act(() => result.current.setPhase("work"));
    act(() => result.current.skip()); // round 2 done -> long break
    expect(result.current.phase).toBe("longBreak");
  });

  it("lets a phase be selected directly, idle and reloaded", () => {
    const { result } = renderHook(() => usePomodoro(DURATIONS));

    act(() => result.current.setPhase("longBreak"));
    expect(result.current.phase).toBe("longBreak");
    expect(result.current.remaining).toBe(15 * 60);
    expect(result.current.running).toBe(false);
  });
});

describe("finish effects", () => {
  it("notifies when a focus block completes", () => {
    window.Notification.instances.length = 0;
    const { result } = renderHook(() =>
      usePomodoro(DURATIONS, { sound: false, notifications: true })
    );

    act(() => result.current.start());
    tick(25 * 60_000 + 1000);

    expect(window.Notification.instances).toHaveLength(1);
    expect(window.Notification.instances[0].title).toBe("FOCUS BLOCK COMPLETE");
  });

  it("stays silent when notifications are switched off", () => {
    window.Notification.instances.length = 0;
    const { result } = renderHook(() =>
      usePomodoro(DURATIONS, { sound: false, notifications: false })
    );

    act(() => result.current.start());
    tick(25 * 60_000 + 1000);

    expect(window.Notification.instances).toHaveLength(0);
  });
});

describe("phase metadata", () => {
  it("exposes a label and colour for each phase", () => {
    for (const phase of Object.values(PHASES)) {
      expect(phase.label).toBeTruthy();
      expect(phase.color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
