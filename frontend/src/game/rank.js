/* =========================================================
   Hunter rank evaluation

   Rank used to be a pure function of the CURRENT streak, which had a
   consequence nobody intended: miss a day badly enough and the badge
   in the top bar dropped from S to E. PROJECT_VISION.md promises that
   nothing a hunter earns can ever be taken away, and a rank falling
   off a profile is the most visible possible way to break it.

   So rank is a persisted KEY here, promoted and never demoted, and it
   is earned by either of two routes:

     the streak route     — the original thresholds, preserved exactly
     the discipline route — level + missions cleared + Discipline Score

   The second route exists because a streak measures one thing well
   (unbroken days) and another thing badly (sustained discipline). A
   hunter 140 missions and 40 levels deep who took a weekend off is not
   an E-Rank hunter, and the old system said they were.
   ========================================================= */

import { HUNTER_RANKS, getLevelInfo, localISO } from "./constants";
import { disciplineScore } from "./discipline";

/** The rank record for a key, falling back to E for anything unrecognised. */
export function rankByKey(key) {
  return HUNTER_RANKS.find((r) => r.key === key) ?? HUNTER_RANKS[0];
}

/** Position of a rank key in the table. Unknown keys sit at the bottom. */
export function rankIndexOf(key) {
  const index = HUNTER_RANKS.findIndex((r) => r.key === key);
  return index === -1 ? 0 : index;
}

/** The rank above `key`, or null at the peak. */
export function nextRankFor(key) {
  return HUNTER_RANKS[rankIndexOf(key) + 1] ?? null;
}

/** Whichever key sits higher in the table. */
export function higherRank(a, b) {
  return rankIndexOf(a) >= rankIndexOf(b) ? a : b;
}

/**
 * The measurements a rank is judged on.
 *
 * The streak used is the hunter's PERSONAL BEST, not the current run.
 * A best is permanent by definition, which is what makes the legacy
 * route as un-losable as the rank it earns.
 */
export function hunterMetrics(state, today = localISO()) {
  const discipline = disciplineScore(state, today);
  return {
    level: getLevelInfo(state.totalXP ?? 0).level,
    missions: (state.history ?? []).length,
    discipline: discipline.score,
    disciplineDetail: discipline,
    streak: Math.max(state.streak ?? 0, state.longestStreak ?? 0),
  };
}

/** Does `metrics` satisfy this rank by either route? */
export function meetsRank(rank, metrics) {
  const byStreak = metrics.streak >= rank.streak;
  const byDiscipline =
    metrics.level >= rank.requires.level &&
    metrics.missions >= rank.requires.missions &&
    metrics.discipline >= rank.requires.discipline;
  return byStreak || byDiscipline;
}

/**
 * The highest rank these metrics have earned.
 *
 * Scanned from the top down so a hunter who satisfies S but has drifted
 * below one of C's thresholds still reads as S — rank is a high-water
 * mark, not a checklist that has to stay ticked.
 */
export function earnedRank(state, today = localISO()) {
  const metrics = hunterMetrics(state, today);
  for (let i = HUNTER_RANKS.length - 1; i >= 0; i -= 1) {
    if (meetsRank(HUNTER_RANKS[i], metrics)) return { key: HUNTER_RANKS[i].key, metrics };
  }
  return { key: HUNTER_RANKS[0].key, metrics };
}

/**
 * The rank a hunter currently holds: the best of what they have earned
 * now and what they have ever held. This is the only function the UI
 * should ask, and it can never return something lower than last time.
 */
export function currentRank(state, today = localISO()) {
  const { key, metrics } = earnedRank(state, today);
  return { key: higherRank(state.bestRank ?? "E", key), metrics };
}

/**
 * Progress toward the next rank, per requirement, for the UI.
 *
 * `progress` is the best of the two routes rather than an average: a
 * hunter three days from D by streak should see a bar that is nearly
 * full, not one halved by a mission count they were never chasing.
 */
export function rankProgress(state, today = localISO()) {
  const held = currentRank(state, today);
  const upcoming = nextRankFor(held.key);
  const m = held.metrics;

  if (!upcoming) {
    return { rank: rankByKey(held.key), next: null, progress: 1, metrics: m, requirements: [] };
  }

  const ratio = (value, target) => (target <= 0 ? 1 : Math.min(1, Math.max(0, value / target)));
  const requirements = [
    { key: "level", label: "Level", current: m.level, target: upcoming.requires.level },
    { key: "missions", label: "Missions cleared", current: m.missions, target: upcoming.requires.missions },
    { key: "discipline", label: "Discipline", current: m.discipline, target: upcoming.requires.discipline, unit: "%" },
  ].map((r) => ({ ...r, met: r.current >= r.target, progress: ratio(r.current, r.target) }));

  const byDiscipline = requirements.reduce((min, r) => Math.min(min, r.progress), 1);
  const byStreak = ratio(m.streak, upcoming.streak);

  return {
    rank: rankByKey(held.key),
    next: upcoming,
    progress: Math.max(byDiscipline, byStreak),
    metrics: m,
    requirements,
    streakRoute: { current: m.streak, target: upcoming.streak, progress: byStreak },
  };
}

/**
 * A compact record of why a promotion happened, for the cinematic.
 * The vision asks for a rank promotion to read as an evaluation rather
 * than a number going up, and these are the numbers worth reading out.
 */
export function evaluationFor(state, today = localISO()) {
  const m = hunterMetrics(state, today);
  const consistency = m.disciplineDetail.components.find((c) => c.key === "consistency");
  return {
    discipline: m.discipline,
    consistency: Math.round((consistency?.signal ?? 0) * 100),
    missions: m.missions,
    level: m.level,
    streak: m.streak,
  };
}
