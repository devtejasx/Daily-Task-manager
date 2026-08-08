/* =========================================================
   Reducer helpers

   Pure transitions shared by the reducer and by initial-state
   construction: the toast id counter, achievement sweeps and the
   day rollover.
   ========================================================= */

import { localISO, addDaysISO, ACHIEVEMENTS } from "../game/constants";
import { currentRank, rankIndexOf, higherRank, evaluationFor } from "../game/rank";
import { disciplineScore } from "../game/discipline";
import { TITLES } from "../game/titles";
import { rarityOf } from "../game/rarity";
import { weeklyChallenge, bossChallenge } from "../game/challenges";
import { creditXP } from "../game/xp";
import { startOfWeekISO } from "../utils/date";

let toastId = 0;

/** Monotonic id for a toast. Module-scoped so ids never collide. */
export function nextToastId() {
  return ++toastId;
}

/**
 * Silently unlock achievements already satisfied by the loaded save.
 * No toasts — a returning hunter shouldn't be congratulated on load for
 * something they earned months ago.
 */
export function seedAchievements(state) {
  const achievements = { ...state.achievements };
  for (const a of ACHIEVEMENTS) {
    if (!achievements[a.id] && a.test(state)) achievements[a.id] = localISO();
  }
  return { ...state, achievements };
}

/** Unlock newly-earned achievements, each with a celebratory toast. */
export function sweepAchievements(state) {
  const achievements = { ...state.achievements };
  const toasts = [...state.fx.toasts];

  for (const a of ACHIEVEMENTS) {
    if (!achievements[a.id] && a.test(state)) {
      achievements[a.id] = localISO();
      toasts.push({
        id: nextToastId(),
        kind: "achievement",
        title: a.title,
        desc: a.desc,
        icon: a.icon,
        color: a.color,
      });
    }
  }
  return { ...state, achievements, fx: { ...state.fx, toasts } };
}

/* ---------------- titles ----------------
 *
 * Titles are tested against the state plus its Discipline Score, which
 * is derived rather than stored. Computing it once here and handing the
 * augmented object to every predicate keeps the title list declarative
 * — the same shape as ACHIEVEMENTS — without each entry re-deriving it.
 */
function withDiscipline(state) {
  return { ...state, disciplineScore: disciplineScore(state).score };
}

/** Silently unlock titles a loaded save has already earned. */
export function seedTitles(state) {
  const probe = withDiscipline(state);
  const titles = { ...state.titles };
  for (const title of TITLES) {
    if (!titles[title.id] && title.test(probe)) titles[title.id] = localISO();
  }
  // A hunter who arrives already holding titles should be wearing one
  // rather than having to go and find the picker.
  const activeTitle = state.activeTitle ?? pickDefaultTitle(titles);
  return { ...state, titles, activeTitle };
}

/** The rarest unlocked title, for a hunter who hasn't chosen one. */
function pickDefaultTitle(titles) {
  const owned = TITLES.filter((t) => titles[t.id]);
  if (owned.length === 0) return null;
  return owned.reduce((best, t) =>
    rarityOf(t.rarity).order > rarityOf(best.rarity).order ? t : best
  ).id;
}

/**
 * Unlock newly-earned titles, each with its own toast and one-shot
 * cinematic slot. A first title is equipped automatically — the reward
 * for earning one should not be a chore.
 */
export function sweepTitles(state) {
  const probe = withDiscipline(state);
  const titles = { ...state.titles };
  const toasts = [...state.fx.toasts];
  let unlocked = null;

  for (const title of TITLES) {
    if (titles[title.id] || !title.test(probe)) continue;
    titles[title.id] = localISO();
    unlocked = title;
    toasts.push({
      id: nextToastId(),
      kind: "title",
      title: "TITLE EARNED",
      desc: `${title.name} — ${title.desc}`,
      icon: "Crown",
      color: rarityOf(title.rarity).color,
    });
  }

  if (!unlocked) return state;

  return {
    ...state,
    titles,
    activeTitle: state.activeTitle ?? unlocked.id,
    fx: {
      ...state.fx,
      toasts,
      titleUnlocked: { id: unlocked.id, name: unlocked.name, rarity: unlocked.rarity },
    },
  };
}

/* ---------------- challenges ----------------
 *
 * The weekly challenge and the boss are derived from history, so the
 * only thing that has to be settled in state is which week has been
 * accounted for and what has been paid out.
 */

/**
 * Roll the challenge slice onto the current week and pay out anything
 * that has just been cleared.
 *
 * An unfinished week is settled in complete silence. It rolls over with
 * no toast, no summary and no mention — the vision forbids a screen
 * that tells a hunter what they did not manage, and a cheerful
 * "you didn't finish!" banner is exactly that screen.
 */
export function settleChallenges(state) {
  const today = localISO();
  const week = startOfWeekISO(today);
  let next =
    state.challenge?.week === week
      ? state
      : {
          ...state,
          challenge: { week, weeklyClaimed: false, bossAccepted: false, bossClaimed: false },
        };

  const weekly = weeklyChallenge(next, today);
  const boss = bossChallenge(next, today);
  const toasts = [...next.fx.toasts];
  let cleared = null;
  let challenge = { ...next.challenge };
  let totalXP = next.totalXP;
  let dayXP = next.dayXP ?? 0;

  /** Rewards are credited through the same daily guard as everything else. */
  const pay = (amount) => {
    const award = creditXP(amount, dayXP);
    totalXP += award.credited;
    dayXP += award.raw;
    return award.credited;
  };

  if (weekly.complete && !weekly.claimed) {
    const paid = pay(weekly.xp);
    challenge.weeklyClaimed = true;
    cleared = { kind: "weekly", label: weekly.label, xp: paid };
    toasts.push({
      id: nextToastId(),
      kind: "challenge",
      title: "WEEKLY CHALLENGE CLEARED",
      desc: `${weekly.target} missions this week · +${paid} XP`,
      icon: "Target",
      color: "#10b981",
    });
  }

  if (boss.accepted && boss.complete && !boss.claimed) {
    const paid = pay(boss.xp);
    challenge.bossClaimed = true;
    cleared = { kind: "boss", label: boss.name, xp: paid, color: boss.color };
    toasts.push({
      id: nextToastId(),
      kind: "boss",
      title: "BOSS CLEARED",
      desc: `${boss.name} · +${paid} XP`,
      icon: "Trophy",
      color: boss.color,
    });
  }

  if (!cleared && next === state) return state;

  return {
    ...next,
    totalXP,
    dayXP,
    challenge,
    fx: cleared ? { ...next.fx, toasts, challengeCleared: cleared } : next.fx,
  };
}

/* ---------------- rank ----------------
 *
 * Rank is stored, not derived, for one reason: it must never go down.
 * Both functions below take the higher of what the hunter holds and what
 * they have just earned, so every path through the reducer is incapable
 * of demoting anyone even by accident.
 */

/**
 * Bring a loaded save's rank up to what its record already justifies,
 * silently. A returning hunter should not be handed a promotion
 * cinematic for something they earned months ago on another device.
 */
export function seedRank(state) {
  const today = localISO();
  const key = higherRank(state.bestRank ?? "E", currentRank(state, today).key);
  const rankLog = { ...state.rankLog };
  // The ledger is what the progression timeline reads. Backfill the rank
  // the hunter arrived holding so their history isn't a blank page, but
  // date it honestly — today is when we first observed it.
  if (!rankLog[key]) rankLog[key] = state.rankLog?.[key] ?? today;

  return { ...state, bestRank: key, bestRankIndex: rankIndexOf(key), rankLog };
}

/**
 * Promote if the hunter's record now justifies it, with the cinematic.
 *
 * A promotion is the loudest moment in the game, so it fires only on a
 * genuine increase — never on a re-evaluation that lands where it was.
 */
export function promoteRank(state) {
  const today = localISO();
  const held = state.bestRank ?? "E";
  const earned = higherRank(held, currentRank(state, today).key);
  if (rankIndexOf(earned) <= rankIndexOf(held)) return state;

  return {
    ...state,
    bestRank: earned,
    bestRankIndex: rankIndexOf(earned),
    rankLog: { ...state.rankLog, [earned]: today },
    fx: {
      ...state.fx,
      promotion: { rankKey: earned, from: held, evaluation: evaluationFor(state, today) },
    },
  };
}

/**
 * Day rollover.
 *
 * Runs on load and on the 30s tick. Yesterday's cleared missions leave the
 * board and the daily quest resets.
 *
 * A missed day never costs XP, levels, achievements or a personal best —
 * those are permanent. Only the current streak is ever at stake, and the
 * Resolve system spends a banked shield to keep even that intact. A hunter
 * who had nothing at stake (no streak, no selected missions) is never told
 * anything at all.
 */
export function rollover(state) {
  const today = localISO();
  if (state.dailyDate === today) return state;

  const yesterday = addDaysISO(today, -1);
  const survived = state.dayComplete && state.dailyDate === yesterday;
  const hadProgressAtStake = state.streak > 0 || state.dailySelected.length > 0;
  const missed = !survived && hadProgressAtStake;

  const base = {
    ...state,
    missions: state.missions.filter((m) => m.status !== "completed"),
    dailySelected: [],
    dayComplete: false,
    dailyDate: today,
    // A new day restores the full-rate XP allowance. This is the only
    // counter the rollover resets — everything else it touches is the
    // streak, and even that is only ever held, never destroyed.
    dayXP: 0,
  };

  if (!missed) return settleChallenges({ ...base, fx: { ...state.fx, newDay: true } });

  // Resolve spent: the shield takes the hit and the climb continues.
  const shields = state.shields ?? 0;
  if (shields > 0) {
    return {
      ...base,
      shields: shields - 1,
      fx: {
        ...state.fx,
        shielded: { streak: state.streak, remaining: shields - 1 },
      },
    };
  }

  // No shield left. A streak still isn't destroyed on the spot — it is held
  // in recovery for one day. Clear today's quest and the whole climb comes
  // back. A recovery already pending here means that day came and went.
  if (state.recovery) {
    return {
      ...base,
      streak: 0,
      recovery: null,
      fx: { ...state.fx, reset: { previous: state.recovery.streak } },
    };
  }

  return {
    ...base,
    streak: 0,
    recovery: { streak: state.streak, since: today },
    fx: { ...state.fx, preserved: { streak: state.streak } },
  };
}
