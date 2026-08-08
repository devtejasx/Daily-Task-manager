/* =========================================================
   The Discipline Score

   The number that answers "how consistently am I showing up?"

   It is deliberately NOT completed/total. That ratio rewards a hunter
   for writing fewer, easier tasks and punishes them for being
   ambitious, which is precisely backwards. It also collapses the
   moment someone adds a mission they haven't done yet — the app would
   drop their score for *planning*.

   Four signals instead, each capped so no single behaviour can be
   farmed into the others' place:

     Consistency 40  — did you show up, weighted toward recent days
     Momentum    25  — is a climb currently running
     Effort      20  — real work, spread across days rather than dumped
     Recovery    15  — did you come back after a gap

   Effort is the anti-spam valve: it counts a capped number of clears
   *per calendar day*, so thirty missions in one sitting score the same
   as four, while four a day for a week scores far higher.

   The score is a progress indicator, never a judgement. Every band
   label below is something a hunter would be content to read.
   ========================================================= */

import { localISO, addDaysISO } from "./constants";

/** Longest window the score looks back over. */
export const DISCIPLINE_WINDOW_DAYS = 28;
/** Shortest window — a hunter three days in isn't measured against a month. */
export const MIN_WINDOW_DAYS = 7;
/** Days of history before the score is considered meaningful at all. */
export const MIN_TENURE_DAYS = 3;
/** Streak length that counts as full momentum. */
export const MOMENTUM_HORIZON_DAYS = 21;
/** Clears beyond this on a single day stop contributing to Effort. */
export const EFFORT_DAILY_CAP = 4;
/** Days after a gap within which a return still counts as a recovery. */
export const RECOVERY_GRACE_DAYS = 2;

export const WEIGHTS = { consistency: 40, momentum: 25, effort: 20, recovery: 15 };

/**
 * Bands, lowest first. The wording is the point: none of these tells a
 * hunter they are doing badly, because a score is not a verdict.
 */
export const BANDS = [
  { min: 0, key: "starting", label: "Finding your footing", color: "#94a3b8", blurb: "Early days. The number only goes up from here." },
  { min: 25, key: "building", label: "Building", color: "#38bdf8", blurb: "A rhythm is forming. Keep the days close together." },
  { min: 45, key: "steady", label: "Steady", color: "#10b981", blurb: "You show up more often than not. That is the whole game." },
  { min: 65, key: "strong", label: "Strong", color: "#a78bfa", blurb: "Consistency you could set a clock by." },
  { min: 85, key: "unshakable", label: "Unshakable", color: "#f59e0b", blurb: "Showing up is no longer a decision you make." },
];

export function bandFor(score) {
  return BANDS.reduce((best, b) => (score >= b.min ? b : best), BANDS[0]);
}

/* ---------------- signal extraction ---------------- */

/**
 * Clears per day across missions and habits.
 *
 * Habits count: logging a habit is showing up, and a hunter who runs on
 * habits rather than one-off missions is not less disciplined.
 *
 * @returns {Map<string, number>} ISO day -> number of things cleared
 */
export function clearsByDay(state) {
  const counts = new Map();
  const bump = (day) => counts.set(day, (counts.get(day) ?? 0) + 1);

  for (const entry of state.history ?? []) {
    if (entry?.completedAt) bump(entry.completedAt);
  }
  for (const habit of state.habits ?? []) {
    for (const [day, done] of Object.entries(habit.log ?? {})) {
      if (done) bump(day);
    }
  }
  return counts;
}

/** The earliest day this hunter has any record of, or null. */
export function firstActiveDay(state) {
  let earliest = null;
  for (const day of clearsByDay(state).keys()) {
    if (!earliest || day < earliest) earliest = day;
  }
  return earliest;
}

/** Days between the hunter's first record and today, inclusive. */
export function tenureDays(state, today = localISO()) {
  const first = firstActiveDay(state);
  if (!first) return 0;
  const ms = new Date(`${today}T12:00:00`) - new Date(`${first}T12:00:00`);
  return Math.max(1, Math.round(ms / 86_400_000) + 1);
}

/**
 * The window actually scored: never longer than the hunter has existed,
 * so a five-day-old account is measured against five days.
 */
export function windowFor(state, today = localISO()) {
  const tenure = tenureDays(state, today);
  if (tenure === 0) return 0;
  return Math.min(DISCIPLINE_WINDOW_DAYS, Math.max(MIN_WINDOW_DAYS, tenure));
}

/* ---------------- the four signals ---------------- */

/**
 * Recency-weighted share of days in the window that saw activity.
 * The most recent day is worth twice the oldest, so a hunter who has
 * just restarted sees the number move rather than waiting a month.
 */
function consistencySignal(counts, days, today) {
  if (days <= 0) return 0;
  let earned = 0;
  let possible = 0;
  for (let i = 0; i < days; i += 1) {
    const weight = 1 + (days - 1 - i) / Math.max(1, days - 1); // 2 today -> 1 oldest
    possible += weight;
    if ((counts.get(addDaysISO(today, -i)) ?? 0) > 0) earned += weight;
  }
  return possible === 0 ? 0 : earned / possible;
}

/**
 * A running climb. A streak being *held* in recovery still counts, at a
 * reduced rate — the hunter has not lost it, and the score must not
 * pre-emptively grieve something the Resolve system is still holding.
 */
function momentumSignal(state) {
  const held = state.recovery ? state.recovery.streak * 0.7 : 0;
  const effective = Math.max(state.streak ?? 0, held);
  return Math.min(1, effective / MOMENTUM_HORIZON_DAYS);
}

/**
 * Work that actually happened, capped per day.
 *
 * Averaging one capped clear per calendar day in the window is full marks.
 * Thirty clears in a single sitting contribute four; four a day for a week
 * contribute twenty-eight. Spam cannot reach where consistency can.
 */
function effortSignal(counts, days, today) {
  if (days <= 0) return 0;
  let capped = 0;
  for (let i = 0; i < days; i += 1) {
    capped += Math.min(EFFORT_DAILY_CAP, counts.get(addDaysISO(today, -i)) ?? 0);
  }
  return Math.min(1, capped / days);
}

/**
 * Coming back.
 *
 * A gap is a run of inactive days that the hunter later returned from. A
 * hunter with no gaps scores full marks (there was nothing to recover
 * from), and lifetime comebacks can carry the signal on their own — so
 * this component can never drag a score down for a clean record, and can
 * only ever reward returning.
 */
function recoverySignal(state, counts, days, today) {
  const lifetime = Math.min(1, (state.comebacks ?? 0) / 3);
  if (days <= 0) return lifetime;

  const active = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const day = addDaysISO(today, -i);
    if ((counts.get(day) ?? 0) > 0) active.push(day);
  }
  if (active.length < 2) return Math.max(lifetime, active.length === 1 ? 1 : 0);

  let gaps = 0;
  let closed = 0;
  for (let i = 1; i < active.length; i += 1) {
    const missed = Math.round(
      (new Date(`${active[i]}T12:00:00`) - new Date(`${active[i - 1]}T12:00:00`)) / 86_400_000
    ) - 1;
    if (missed <= 0) continue;
    gaps += 1;
    if (missed <= RECOVERY_GRACE_DAYS) closed += 1;
  }
  if (gaps === 0) return 1; // an unbroken window has nothing to recover from
  return Math.max(lifetime, closed / gaps);
}

/* ---------------- the score ---------------- */

/**
 * The Discipline Score, 0–100, with its components exposed so the UI can
 * explain exactly where the number came from. A score nobody can explain
 * is a score nobody trusts.
 *
 * `ready` is false for a hunter with almost no record — the UI shows an
 * invitation rather than a discouraging 4%.
 */
export function disciplineScore(state, today = localISO()) {
  const counts = clearsByDay(state);
  const days = windowFor(state, today);
  const tenure = tenureDays(state, today);

  const signals = {
    consistency: consistencySignal(counts, days, today),
    momentum: momentumSignal(state),
    effort: effortSignal(counts, days, today),
    recovery: recoverySignal(state, counts, days, today),
  };

  const components = Object.entries(WEIGHTS).map(([key, weight]) => ({
    key,
    weight,
    signal: signals[key],
    points: signals[key] * weight,
  }));

  const score = Math.max(0, Math.min(100, Math.round(
    components.reduce((sum, c) => sum + c.points, 0)
  )));

  return {
    score,
    ready: tenure >= MIN_TENURE_DAYS,
    windowDays: days,
    tenureDays: tenure,
    band: bandFor(score),
    components,
  };
}

/** Human-readable labels for each component, for the profile breakdown. */
export const COMPONENT_COPY = {
  consistency: {
    label: "Consistency",
    desc: "How many of the last few weeks' days you showed up for. Recent days count for more.",
  },
  momentum: {
    label: "Momentum",
    desc: "Whether a climb is running right now. A streak being held for you still counts.",
  },
  effort: {
    label: "Effort",
    desc: "Real work, spread across days. A pile of tiny missions in one sitting counts once.",
  },
  recovery: {
    label: "Recovery",
    desc: "Coming back after a gap. A clean record scores full marks here too.",
  },
};
