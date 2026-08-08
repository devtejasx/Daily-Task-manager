import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Profile from "./Profile";
import { makeCurrentSave, makeHistory } from "../test/factories";
import { getLevelInfo, localISO, addDaysISO } from "../game/constants";
import { rankByKey, rankProgress } from "../game/rank";
import { disciplineScore } from "../game/discipline";
import { weeklyChallenge, bossChallenge } from "../game/challenges";
import { selectStats } from "../state/selectors";

const today = localISO();

/** Render the profile over a save, deriving exactly what App derives. */
function renderProfile(overrides = {}, { user = { displayName: "Tejas" } } = {}) {
  const state = makeCurrentSave({ habits: [], ...overrides });
  const onSelectTitle = vi.fn();

  render(
    <Profile
      state={state}
      levelInfo={getLevelInfo(state.totalXP)}
      rank={rankByKey(state.bestRank)}
      ascent={rankProgress(state)}
      discipline={disciplineScore(state)}
      challenges={{ weekly: weeklyChallenge(state), boss: bossChallenge(state) }}
      stats={selectStats({ ...state, missions: state.missions ?? [] })}
      user={user}
      onSelectTitle={onSelectTitle}
    />
  );
  return { state, onSelectTitle };
}

describe("who have I become", () => {
  it("leads with the hunter's name, rank and level", () => {
    renderProfile({ bestRank: "B", totalXP: 40_000 });
    expect(screen.getByRole("heading", { level: 1, name: "TEJAS" })).toBeInTheDocument();
    expect(screen.getByText(/B-RANK HUNTER · Level/)).toBeInTheDocument();
  });

  it("wears the hunter's chosen title above their name", () => {
    renderProfile({ titles: { "iron-will": today }, activeTitle: "iron-will" });
    expect(screen.getByText("IRON WILL")).toBeInTheDocument();
  });

  it("shows no title line when none is worn", () => {
    renderProfile({ titles: {}, activeTitle: null });
    expect(screen.queryByText("IRON WILL")).not.toBeInTheDocument();
  });

  it("falls back to a usable name for a hunter with no display name", () => {
    renderProfile({}, { user: { email: "hunter@example.com" } });
    expect(screen.getByRole("heading", { level: 1, name: "HUNTER" })).toBeInTheDocument();
  });
});

describe("the record", () => {
  it("states every lifetime figure the vision asks for", () => {
    renderProfile({
      totalXP: 91_500,
      streak: 12,
      longestStreak: 212,
      comebacks: 4,
      shields: 2,
      questDays: [today, addDaysISO(today, -1)],
      history: Array.from({ length: 6 }, (_, i) => makeHistory(i)),
    });

    for (const label of [
      "CURRENT STREAK",
      "LONGEST STREAK",
      "MISSIONS CLEARED",
      "LIFETIME XP",
      "RESOLVE BANKED",
      "COMEBACKS",
      "QUESTS CLEARED",
      "FEATS",
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }

    const record = screen.getByLabelText("Hunter record");
    expect(within(record).getByText("212d")).toBeInTheDocument();
    expect(within(record).getByText("91,500")).toBeInTheDocument();
    expect(within(record).getByText("2/3")).toBeInTheDocument();
  });
});

describe("the discipline score", () => {
  it("invites a new hunter rather than showing them a zero", () => {
    renderProfile();
    expect(screen.getByText(/Not enough of a record yet/)).toBeInTheDocument();
  });

  it("explains where the number came from once there is a record", () => {
    const history = [];
    for (let i = 0; i < 20; i += 1) history.push(makeHistory(i), makeHistory(i));
    renderProfile({ history, streak: 20, longestStreak: 20 });

    for (const label of ["Consistency", "Momentum", "Effort", "Recovery"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getByText(/progress indicator, not a grade/)).toBeInTheDocument();
  });

  it("exposes the score to assistive tech, not only as a bar", () => {
    const history = Array.from({ length: 20 }, (_, i) => makeHistory(i));
    renderProfile({ history, streak: 20, longestStreak: 20 });
    expect(screen.getByRole("progressbar", { name: /Discipline Score:/ })).toBeInTheDocument();
  });
});

describe("the next evaluation", () => {
  it("spells out both routes to the next rank", () => {
    renderProfile({ totalXP: 5000 });
    expect(screen.getByText("NEXT EVALUATION")).toBeInTheDocument();
    expect(screen.getByText(/Either route promotes/)).toBeInTheDocument();
    expect(screen.getByText(/Rank never goes down once earned/)).toBeInTheDocument();
  });

  it("names each requirement with its own progress bar", () => {
    renderProfile({ totalXP: 5000 });
    expect(screen.getByRole("progressbar", { name: /^Level:/ })).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: /^Missions cleared:/ })).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: /^Discipline:/ })).toBeInTheDocument();
  });

  it("says nothing about a next rank at the peak", () => {
    renderProfile({ bestRank: "NATIONAL" });
    expect(screen.queryByText("NEXT EVALUATION")).not.toBeInTheDocument();
  });
});

describe("the journey", () => {
  it("invites a brand-new hunter instead of showing an empty list", () => {
    renderProfile();
    expect(screen.getByText("YOUR STORY BEGINS TODAY")).toBeInTheDocument();
  });

  it("shows the moments that mattered, and what comes next", () => {
    renderProfile({
      history: [makeHistory(40)],
      bestRank: "C",
      rankLog: { D: addDaysISO(today, -30), C: addDaysISO(today, -10) },
      titles: { "iron-will": addDaysISO(today, -20) },
    });

    // Scoped to the timeline: "Iron Will" is also a row in the title picker.
    const journey = screen.getByRole("list", { name: "Progression timeline" });
    expect(within(journey).getByText("Hunter Awakened")).toBeInTheDocument();
    expect(within(journey).getByText("D-RANK HUNTER")).toBeInTheDocument();
    expect(within(journey).getByText("Iron Will")).toBeInTheDocument();
    expect(within(journey).getByText("NEXT")).toBeInTheDocument();
  });
});

describe("choosing a title", () => {
  it("marks the worn title in words, not only by colour", () => {
    renderProfile({ titles: { "iron-will": today }, activeTitle: "iron-will" });
    expect(screen.getByText("WORN")).toBeInTheDocument();
  });

  it("lets the hunter wear a title they have earned", async () => {
    const { onSelectTitle } = renderProfile({
      titles: { "iron-will": today, unbreakable: today },
      activeTitle: "iron-will",
    });
    await userEvent.click(screen.getByRole("button", { name: /Unbreakable/ }));
    expect(onSelectTitle).toHaveBeenCalledWith("unbreakable");
  });

  it("takes a title off when the worn one is chosen again", async () => {
    const { onSelectTitle } = renderProfile({
      titles: { "iron-will": today },
      activeTitle: "iron-will",
    });
    await userEvent.click(screen.getByRole("button", { name: /Iron Will/ }));
    expect(onSelectTitle).toHaveBeenCalledWith(null);
  });

  it("will not let a locked title be chosen", async () => {
    const { onSelectTitle } = renderProfile({ titles: {}, activeTitle: null });
    const locked = screen.getByRole("button", { name: /The Monarch/ });
    expect(locked).toBeDisabled();
    await userEvent.click(locked);
    expect(onSelectTitle).not.toHaveBeenCalled();
  });

  it("shows a hint for a locked title rather than nothing", () => {
    renderProfile({ titles: {} });
    expect(screen.getByText(/Reach the top of the rank table/)).toBeInTheDocument();
  });
});
