/* =========================================================
   The progression timeline

   "Do not show every tiny task. Show meaningful moments."

   That single line is the whole design. A timeline of every cleared
   mission is a log; a hunter does not reread their own logs. What is
   worth rereading is the handful of days something CHANGED — the day
   they started, the day a rank landed, the day they earned a title
   they still wear, the day they came back.

   Everything here is derived from ledgers that already exist, so an
   existing hunter opens this screen with a full history rather than an
   empty one waiting to fill up. The one honest limitation: rank
   promotions before v4 were never dated, so a returning hunter's
   arriving rank is stamped with the day it was first observed. It is
   marked as such rather than presented as fact.
   ========================================================= */

import { localISO, ACHIEVEMENTS } from "./constants";
import { rankByKey, rankIndexOf } from "./rank";
import { TITLES_BY_ID } from "./titles";
import { rarityOf } from "./rarity";

/** Only these two rarities are loud enough to be a moment. */
const TIMELINE_RARITIES = new Set(["epic", "legendary"]);

/** The first day this hunter has any record of. */
function firstDay(state) {
  let earliest = null;
  const consider = (day) => {
    if (day && (!earliest || day < earliest)) earliest = day;
  };
  for (const entry of state.history ?? []) consider(entry?.completedAt);
  for (const habit of state.habits ?? []) {
    for (const [day, done] of Object.entries(habit.log ?? {})) if (done) consider(day);
  }
  for (const day of Object.values(state.rankLog ?? {})) consider(day);
  return earliest;
}

function dayNumber(iso, from) {
  if (!from || !iso) return 1;
  const ms = new Date(`${iso}T12:00:00`) - new Date(`${from}T12:00:00`);
  return Math.max(1, Math.round(ms / 86_400_000) + 1);
}

/**
 * Every meaningful moment in this hunter's record, oldest first.
 *
 * @returns {Array<{at,day,kind,label,detail,color,icon,rarity}>}
 */
export function buildTimeline(state, today = localISO()) {
  const start = firstDay(state);
  if (!start) return [];

  const moments = [];

  moments.push({
    id: "awakening",
    at: start,
    kind: "awakening",
    label: "Hunter Awakened",
    detail: "The first mission cleared. Everything below follows from it.",
    color: "#06b6d4",
    icon: "Sunrise",
  });

  /* ---- rank promotions ---- */
  for (const [key, at] of Object.entries(state.rankLog ?? {})) {
    if (key === "E") continue; // where everyone starts is not a milestone
    const rank = rankByKey(key);
    moments.push({
      id: `rank-${key}`,
      at,
      kind: "rank",
      label: rank.title,
      detail: rank.blurb,
      color: rank.color,
      icon: "Medal",
      weight: 3,
    });
  }

  /* ---- titles ---- */
  for (const [id, at] of Object.entries(state.titles ?? {})) {
    const title = TITLES_BY_ID[id];
    if (!title) continue;
    moments.push({
      id: `title-${id}`,
      at,
      kind: "title",
      label: title.name,
      detail: title.desc,
      color: rarityOf(title.rarity).color,
      rarity: title.rarity,
      icon: "Crown",
      weight: 2,
    });
  }

  /* ---- the loudest achievements only ---- */
  for (const achievement of ACHIEVEMENTS) {
    const at = state.achievements?.[achievement.id];
    if (!at || !TIMELINE_RARITIES.has(achievement.rarity)) continue;
    moments.push({
      id: `feat-${achievement.id}`,
      at,
      kind: "achievement",
      label: achievement.title,
      detail: achievement.desc,
      color: achievement.color,
      rarity: achievement.rarity,
      icon: achievement.icon,
      weight: 1,
    });
  }

  return moments
    .sort((a, b) => (a.at === b.at ? (b.weight ?? 0) - (a.weight ?? 0) : a.at < b.at ? -1 : 1))
    .map((m) => ({ ...m, day: dayNumber(m.at, start) }));
}

/**
 * What the hunter is climbing toward next — one line, so the timeline
 * ends on the future rather than on the past.
 */
export function nextMilestone(state, ascent) {
  if (ascent?.next) {
    return {
      label: `${ascent.next.title}`,
      detail: `The next evaluation. ${ascent.next.blurb}`,
      color: ascent.next.color,
      progress: ascent.progress,
    };
  }
  return {
    label: "THE PEAK",
    detail: "There is no higher rank. There is only tomorrow, and the day after.",
    color: rankByKey("NATIONAL").color,
    progress: 1,
  };
}

/** Has this hunter reached the given rank at any point? */
export function hasReached(state, key) {
  return rankIndexOf(state.bestRank ?? "E") >= rankIndexOf(key);
}
