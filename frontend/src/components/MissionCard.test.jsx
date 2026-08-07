import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MissionCard from "./MissionCard";
import { makeMission } from "../test/factories";
import { localISO, addDaysISO } from "../game/constants";
import { makeRecurrence } from "../utils/recurrence";

const today = localISO();

const handlers = () => ({
  onComplete: vi.fn(),
  onDelete: vi.fn(),
  onToggleDaily: vi.fn(),
  onSkipOccurrence: vi.fn(),
  onToggleRecurrencePaused: vi.fn(),
});

function setup(mission = makeMission(), props = {}) {
  const spies = handlers();
  render(<MissionCard mission={mission} {...spies} {...props} />);
  return { ...spies, user: userEvent.setup({ advanceTimers: vi.advanceTimersByTime }) };
}

describe("content", () => {
  it("renders the briefing, difficulty, XP and category", () => {
    setup(
      makeMission({
        title: "Clear the Inbox Dungeon",
        description: "Triage everything before the portal closes.",
        difficulty: "B",
        xp: 450,
        category: "Guild",
      })
    );

    expect(screen.getByText("Clear the Inbox Dungeon")).toBeInTheDocument();
    expect(screen.getByText(/Triage everything/)).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText(/\+450 XP/)).toBeInTheDocument();
    expect(screen.getByText("Guild")).toBeInTheDocument();
  });

  it("labels the complete button with the mission and its reward", () => {
    setup(makeMission({ title: "Morning Training", xp: 300 }));
    expect(
      screen.getByRole("button", { name: /Complete mission: Morning Training, worth 300 XP/i })
    ).toBeInTheDocument();
  });

  it("marks a cleared mission as such and stops offering completion", () => {
    setup(makeMission({ title: "Done Deal", status: "completed" }));

    expect(screen.getByRole("button", { name: /Done Deal — cleared/i })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByText("Cleared")).toBeInTheDocument();
  });
});

describe("deadline", () => {
  it("shows a Today badge for a mission due today", () => {
    setup(makeMission({ dueDate: today, dueTime: null }));
    expect(screen.getByText("Today")).toBeInTheDocument();
  });

  it("shows a Tomorrow badge", () => {
    setup(makeMission({ dueDate: addDaysISO(today, 1) }));
    expect(screen.getByText("Tomorrow")).toBeInTheDocument();
  });

  it("flags an overdue mission with how late it is", () => {
    setup(makeMission({ dueDate: addDaysISO(today, -2) }));
    expect(screen.getByText("Overdue · 2d")).toBeInTheDocument();
  });

  it("never flags a cleared mission as overdue", () => {
    setup(makeMission({ dueDate: addDaysISO(today, -30), status: "completed" }));
    expect(screen.queryByText(/Overdue/)).not.toBeInTheDocument();
  });

  it("shows the due time and the configured reminder", () => {
    setup(makeMission({ dueDate: today, dueTime: "18:00", reminder: 30 }));
    expect(screen.getByText("18:00")).toBeInTheDocument();
    expect(screen.getByText("30 min before")).toBeInTheDocument();
  });
});

describe("recurrence", () => {
  it("shows the rule and offers skip / pause on a recurring mission", () => {
    setup(makeMission({ recurrence: makeRecurrence("weekly") }));

    expect(screen.getByText("Weekly")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /skip this occurrence/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /pause recurring mission/i })).toBeInTheDocument();
  });

  it("offers resume instead of pause once paused", () => {
    setup(makeMission({ recurrence: { ...makeRecurrence("daily"), paused: true } }));

    expect(screen.getByText("Daily · paused")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /resume recurring mission/i })).toBeInTheDocument();
  });

  it("shows no recurrence controls on a one-off mission", () => {
    setup(makeMission());
    expect(screen.queryByRole("button", { name: /skip this occurrence/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /recurring mission/i })).not.toBeInTheDocument();
  });
});

describe("interactions", () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it("completes the mission after its clear animation", async () => {
    const mission = makeMission({ id: "m-1" });
    const { onComplete, user } = setup(mission);

    await user.click(screen.getByRole("button", { name: /Complete mission/i }));

    // The XP burst plays first; the state change lands with it.
    expect(onComplete).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(700));
    expect(onComplete).toHaveBeenCalledWith("m-1");
  });

  it("deletes, skips and pauses through their handlers", async () => {
    const mission = makeMission({ id: "m-1", recurrence: makeRecurrence("daily") });
    const { onDelete, onSkipOccurrence, onToggleRecurrencePaused, user } = setup(mission);

    await user.click(screen.getByRole("button", { name: /delete mission/i }));
    expect(onDelete).toHaveBeenCalledWith("m-1");

    await user.click(screen.getByRole("button", { name: /skip this occurrence/i }));
    expect(onSkipOccurrence).toHaveBeenCalledWith("m-1");

    await user.click(screen.getByRole("button", { name: /pause recurring mission/i }));
    expect(onToggleRecurrencePaused).toHaveBeenCalledWith("m-1", true);
  });

  it("toggles the daily-quest slot", async () => {
    const { onToggleDaily, user } = setup(makeMission({ id: "m-1" }));
    await user.click(screen.getByRole("button", { name: /set as daily mission/i }));
    expect(onToggleDaily).toHaveBeenCalledWith("m-1");
  });

  it("disables the daily toggle once every slot is taken", () => {
    setup(makeMission(), { dailyFull: true });
    expect(screen.getByRole("button", { name: /set as daily mission/i })).toBeDisabled();
  });

  it("still allows removing a mission from a full daily quest", () => {
    setup(makeMission(), { dailyFull: true, isDaily: true });
    expect(
      screen.getByRole("button", { name: /remove from daily missions/i })
    ).not.toBeDisabled();
  });
});

describe("drag handle", () => {
  it("appears only inside a sortable list, with keyboard instructions", () => {
    const mission = makeMission({ title: "Morning Training" });
    const { unmount } = render(<MissionCard mission={mission} {...handlers()} />);
    expect(screen.queryByRole("button", { name: /reorder mission/i })).not.toBeInTheDocument();
    unmount();

    render(<MissionCard mission={mission} {...handlers()} dragHandleProps={{}} />);
    expect(
      screen.getByRole("button", { name: /Reorder mission: Morning Training.*arrow keys/i })
    ).toBeInTheDocument();
  });
});
