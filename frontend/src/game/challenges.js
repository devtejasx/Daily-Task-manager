/* =========================================================
   Weekly challenge and Boss

   Two rules from PROJECT_VISION.md shaped every number here.

   "Do not make it so difficult that missing one day makes it
   impossible." So the weekly target is derived from the hunter's OWN
   recent output and set slightly BELOW it. A challenge calibrated to
   someone else's week is a challenge most people quietly stop reading.

   "Missing a boss must never feel like failure." So the boss must be
   accepted before it counts, its language never says a hunter lost,
   and an unfinished week simply ends — the challenge remains, and it
   comes back on Monday.

   Both are derived from history and the cleared-quest ledger. The only
   thing persisted is which week has been settled and what has been
   claimed, so nothing here can drift out of step with the XP system.
   ========================================================= */

import { localISO, addDaysISO } from "./constants";
import { startOfWeekISO, endOfWeekISO } from "../utils/date";

/* ---------- weekly challenge ---------- */

/** Floor for the weekly target. Reachable in a week by anyone. */
export const WEEKLY_MIN = 5;
/** Ceiling, so a heavy week never sets an unreasonable next one. */
export const WEEKLY_MAX = 30;
/** Fraction of the hunter's own baseline the target is set at. */
export const WEEKLY_FACTOR = 0.9;
/** XP per mission of target, capped. */
export const WEEKLY_XP_PER_TARGET = 25;
export const WEEKLY_XP_MAX = 600;

/** Missions cleared between two ISO days, inclusive. */
function clearedBetween(history, from, to) {
  return (history ?? []).filter((h) => h?.completedAt >= from && h.completedAt <= to);
}

/** Distinct days with a clear, between two ISO days. */
function activeDaysBetween(history, from, to) {
  return new Set(clearedBetween(history, from, to).map((h) => h.completedAt)).size;
}

/**
 * The hunter's own baseline: the best of the previous two weeks.
 *
 * Two weeks rather than one so a single quiet week — illness, travel,
 * a hard patch — doesn't quietly shrink the challenge into meaningless.
 */
export function weeklyBaseline(history, today = localISO()) {
  const thisWeek = startOfWeekISO(today);
  let best = 0;
  for (const back of [1, 2]) {
    const from = addDaysISO(thisWeek, -7 * back);
    best = Math.max(best, clearedBetween(history, from, addDaysISO(from, 6)).length);
  }
  return best;
}

/** The target for this week, clamped into a range anyone can attempt. */
export function weeklyTarget(history, today = localISO()) {
  const baseline = weeklyBaseline(history, today);
  const scaled = Math.round(baseline * WEEKLY_FACTOR);
  return Math.min(WEEKLY_MAX, Math.max(WEEKLY_MIN, scaled));
}

export function weeklyReward(target) {
  return Math.min(WEEKLY_XP_MAX, target * WEEKLY_XP_PER_TARGET);
}

/**
 * This week's challenge, fully derived.
 * @returns {{week,from,to,target,progress,remaining,complete,claimed,xp,daysLeft}}
 */
export function weeklyChallenge(state, today = localISO()) {
  const from = startOfWeekISO(today);
  const to = endOfWeekISO(today);
  const target = weeklyTarget(state.history, today);
  const progress = clearedBetween(state.history, from, today).length;
  const claimed = state.challenge?.week === from && Boolean(state.challenge?.weeklyClaimed);

  return {
    week: from,
    from,
    to,
    label: `Clear ${target} missions this week`,
    target,
    progress: Math.min(progress, target),
    rawProgress: progress,
    remaining: Math.max(0, target - progress),
    complete: progress >= target,
    claimed,
    xp: weeklyReward(target),
    daysLeft: Math.max(0, Math.round((new Date(`${to}T12:00:00`) - new Date(`${today}T12:00:00`)) / 86_400_000)),
  };
}

/* ---------- the boss ---------- */

/**
 * Bosses rotate deterministically by week, so the same week always
 * shows the same one and nothing has to be persisted to remember it.
 *
 * Each is a real-world shape of effort rather than a number: volume,
 * showing up, or finishing what you said you would.
 */
export const BOSSES = [
  {
    key: "the-mountain",
    name: "THE MOUNTAIN",
    blurb: "It does not move. You climb it, or you come back when you are ready.",
    color: "#a78bfa",
    volume: 1.6,
    activeDays: 5,
    questDays: 3,
  },
  {
    key: "the-long-night",
    name: "THE LONG NIGHT",
    blurb: "Not a heavy week. A week you did not skip.",
    color: "#38bdf8",
    volume: 1.3,
    activeDays: 6,
    questDays: 4,
  },
  {
    key: "the-iron-gate",
    name: "THE IRON GATE",
    blurb: "It only opens for someone who finishes what they set out to do.",
    color: "#f59e0b",
    volume: 1.8,
    activeDays: 4,
    questDays: 4,
  },
];

/** XP for clearing a boss. Substantial, and deliberately not life-changing. */
export const BOSS_XP = 1000;

/** Which boss this week holds. Stable for the whole week. */
export function bossForWeek(weekISO) {
  let hash = 0;
  for (let i = 0; i < weekISO.length; i += 1) hash = (hash * 31 + weekISO.charCodeAt(i)) >>> 0;
  return BOSSES[hash % BOSSES.length];
}

/**
 * This week's boss and its objectives.
 *
 * Three objectives rather than one number: volume, days shown up for,
 * and daily quests cleared. A boss beatable by one enormous Saturday
 * would teach the opposite of what this product is for.
 */
export function bossChallenge(state, today = localISO()) {
  const from = startOfWeekISO(today);
  const to = endOfWeekISO(today);
  const boss = bossForWeek(from);
  const base = weeklyTarget(state.history, today);

  const questCleared = (state.questDays ?? []).filter((d) => d >= from && d <= to).length;

  const objectives = [
    {
      key: "missions",
      label: "Missions cleared",
      current: clearedBetween(state.history, from, today).length,
      target: Math.max(WEEKLY_MIN + 3, Math.round(base * boss.volume)),
    },
    {
      key: "days",
      label: "Days shown up for",
      current: activeDaysBetween(state.history, from, today),
      target: boss.activeDays,
    },
    {
      key: "quests",
      label: "Daily quests cleared",
      current: questCleared,
      target: boss.questDays,
    },
  ].map((o) => ({
    ...o,
    met: o.current >= o.target,
    progress: o.target <= 0 ? 1 : Math.min(1, o.current / o.target),
  }));

  const accepted = state.challenge?.week === from && Boolean(state.challenge?.bossAccepted);
  const claimed = state.challenge?.week === from && Boolean(state.challenge?.bossClaimed);

  return {
    ...boss,
    week: from,
    from,
    to,
    objectives,
    // Averaged rather than "all or nothing" so the bar reads as movement
    // right up until the last objective lands.
    progress: objectives.reduce((sum, o) => sum + o.progress, 0) / objectives.length,
    complete: objectives.every((o) => o.met),
    accepted,
    claimed,
    xp: BOSS_XP,
    daysLeft: Math.max(0, Math.round((new Date(`${to}T12:00:00`) - new Date(`${today}T12:00:00`)) / 86_400_000)),
  };
}

/* ---------- copy ----------
 * The whole reason this file has a copy block: an unfinished challenge
 * is the moment the product is most tempted to say something it must
 * never say. None of these lines tells a hunter they lost.
 */
export const CHALLENGE_COPY = {
  weeklyPending: (remaining) =>
    remaining === 1 ? "One more clears the week." : `${remaining} to go. There is time.`,
  weeklyDone: "This week's challenge is cleared. The record keeps it.",
  bossOffer: "Optional. Take it if this is a week you want to push.",
  bossPending: "The boss is watching. Nothing is lost either way.",
  bossDone: "Boss cleared. That was a real week.",
  bossUnfinished: "The challenge remains. It returns on Monday.",
  weekRolled: "A new week. The board resets, your record does not.",
};
