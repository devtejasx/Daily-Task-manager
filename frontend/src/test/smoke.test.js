import { describe, it, expect } from "vitest";
import { makeMission, makeHabit, makeSave } from "./factories";

/** Guards the harness itself: if these fail, every other suite is suspect. */
describe("test harness", () => {
  it("runs in a jsdom environment", () => {
    expect(typeof window).toBe("object");
    expect(typeof document.querySelector).toBe("function");
  });

  it("provides the browser APIs jsdom is missing", () => {
    expect(window.matchMedia("(min-width: 0px)").matches).toBe(false);
    expect(new window.ResizeObserver(() => {})).toBeTruthy();
    expect(window.Notification.permission).toBe("granted");
  });

  it("builds fully-normalised records from the factories", () => {
    const mission = makeMission();
    expect(mission).toMatchObject({ status: "active", recurrence: null, reminder: null });
    expect(typeof mission.order).toBe("number");

    expect(makeHabit().log).toEqual({});
    expect(makeSave().settings.defaults.priority).toBe("MEDIUM");
  });
});
