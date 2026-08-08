/* =========================================================
   Hunter titles

   An achievement records what you did. A title is what you are
   called — the one piece of progression a hunter chooses for
   themselves and wears in front of their own name.

   Two rules shaped this list.

   Every title has to be earnable by behaviour the product actually
   wants. "Early Riser" is in the brief and is deliberately absent:
   cleared missions are dated, not timed, so the app cannot honestly
   know when you got up. A title that fires on a guess is worse than
   no title.

   And nothing here can be reached in a single sitting. The counters
   are lifetime totals or, better, DAYS — the same reason the
   Discipline Score counts days rather than ticks.
   ========================================================= */

import { getLevelInfo, SHIELD_MAX } from "./constants";
import { rankIndexOf } from "./rank";

/** Distinct days on which anything was cleared. */
function activeDays(state) {
  const days = new Set();
  for (const entry of state.history ?? []) if (entry?.completedAt) days.add(entry.completedAt);
  for (const habit of state.habits ?? []) {
    for (const [day, done] of Object.entries(habit.log ?? {})) if (done) days.add(day);
  }
  return days.size;
}

const heldRank = (state, key) => rankIndexOf(state.bestRank ?? "E") >= rankIndexOf(key);

/**
 * Every title, in the order they read best on a profile.
 *
 * `hint` is what a locked title shows. It says enough to be worth
 * chasing without printing the exact threshold — a target you can see
 * the shape of is more motivating than a progress bar to nowhere, and
 * more interesting than one that spoils itself.
 */
export const TITLES = [
  {
    id: "the-initiate",
    name: "The Initiate",
    rarity: "common",
    desc: "Cleared a first mission.",
    hint: "Clear your first mission.",
    test: (s) => (s.history ?? []).length >= 1,
  },
  {
    id: "consistent-hunter",
    name: "Consistent Hunter",
    rarity: "common",
    desc: "Showed up on fourteen separate days.",
    hint: "Keep showing up. Two weeks of days, not necessarily in a row.",
    test: (s) => activeDays(s) >= 14,
  },
  {
    id: "task-slayer",
    name: "Task Slayer",
    rarity: "rare",
    desc: "Cleared 250 missions.",
    hint: "Clear missions. Hundreds of them, over time.",
    test: (s) => (s.history ?? []).length >= 250,
  },
  {
    id: "iron-will",
    name: "Iron Will",
    rarity: "rare",
    desc: "Held a 21-day streak.",
    hint: "Hold a streak for three unbroken weeks.",
    test: (s) => (s.longestStreak ?? 0) >= 21,
  },
  {
    id: "the-returned",
    name: "The Returned",
    rarity: "rare",
    desc: "Came back and took a preserved streak with them.",
    hint: "Miss a day, then come back and clear the quest. Returning is the skill.",
    test: (s) => (s.comebacks ?? 0) >= 1,
  },
  {
    id: "fully-resolved",
    name: "Fully Resolved",
    rarity: "rare",
    desc: `Banked all ${SHIELD_MAX} Streak Shields at once.`,
    hint: "Bank a full set of Streak Shields.",
    test: (s) => (s.shields ?? 0) >= SHIELD_MAX,
  },
  {
    id: "steady-hand",
    name: "Steady Hand",
    rarity: "rare",
    desc: "Reached a Strong Discipline Score.",
    hint: "Get your Discipline Score into the Strong band and keep it there.",
    test: (s) => (s.disciplineScore ?? 0) >= 65,
  },
  {
    id: "the-centurion",
    name: "The Centurion",
    rarity: "epic",
    desc: "Showed up on one hundred separate days.",
    hint: "A hundred days of showing up. However long that takes.",
    test: (s) => activeDays(s) >= 100,
  },
  {
    id: "unbreakable",
    name: "Unbreakable",
    rarity: "epic",
    desc: "Held a 90-day streak.",
    hint: "Hold a streak for three unbroken months.",
    test: (s) => (s.longestStreak ?? 0) >= 90,
  },
  {
    id: "the-relentless",
    name: "The Relentless",
    rarity: "epic",
    desc: "Reclaimed a preserved streak five times over.",
    hint: "Come back, again and again. The System counts every return.",
    test: (s) => (s.comebacks ?? 0) >= 5,
  },
  {
    id: "immovable",
    name: "Immovable",
    rarity: "epic",
    desc: "Reached an Unshakable Discipline Score.",
    hint: "Take your Discipline Score to the top band.",
    test: (s) => (s.disciplineScore ?? 0) >= 85,
  },
  {
    id: "ascendant",
    name: "The Ascendant",
    rarity: "epic",
    desc: "Reached hunter level 50.",
    hint: "Climb. Level fifty is a long way up.",
    test: (s) => getLevelInfo(s.totalXP ?? 0).level >= 50,
  },
  {
    id: "s-rank-hunter",
    name: "S-Rank Hunter",
    rarity: "legendary",
    desc: "Passed the S-Rank evaluation.",
    hint: "Earn S-Rank. Either route will do it.",
    test: (s) => heldRank(s, "S"),
  },
  {
    id: "monarch",
    name: "The Monarch",
    rarity: "legendary",
    desc: "Became a National-Level Hunter.",
    hint: "Reach the top of the rank table. Almost nobody does.",
    test: (s) => heldRank(s, "NATIONAL"),
  },
];

export const TITLES_BY_ID = Object.fromEntries(TITLES.map((t) => [t.id, t]));

export function titleById(id) {
  return TITLES_BY_ID[id] ?? null;
}

/** The name to print beside a hunter, or null when none is worn. */
export function activeTitleName(state) {
  const title = titleById(state?.activeTitle);
  return title && state?.titles?.[title.id] ? title.name : null;
}

/** Every title the hunter has unlocked, rarest first. */
export function unlockedTitles(state) {
  return TITLES.filter((t) => state?.titles?.[t.id]);
}
