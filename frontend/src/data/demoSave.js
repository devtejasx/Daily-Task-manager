/* =========================================================
   Demo Mode — a fully-realised S-Rank hunter

   The showcase save. A visitor who has never signed in should be able
   to see what months of discipline actually look like inside the app:
   a real rank, a live streak, a wall of titles, a filled heatmap.

   An empty dashboard cannot communicate a progression system, so this
   is the fastest honest answer to "what is this?" — the product's own
   endgame, explorable in seconds.

   Nothing here is ever persisted. See hooks/useGameState + App: demo
   mode mounts with `persist` disabled, so exploring changes nothing.
   ========================================================= */

import { localISO, addDaysISO, ACHIEVEMENTS, SHIELD_MAX } from "../game/constants";
import { SCHEMA_VERSION, DEFAULT_SETTINGS } from "../services/migration";

const today = localISO();
const iso = (offset) => addDaysISO(today, offset);

/** The demo hunter's streak — deep into S-Rank, short of National. */
const DEMO_STREAK = 213;

/** Enough lifetime XP to sit at a believable level for that streak. */
const DEMO_XP = 184_500;

const BOARD = [
  {
    id: "demo-m-1",
    title: "Ship the auth refactor",
    description: "Split the session guard out of the router and cover it with tests.",
    difficulty: "A",
    priority: "HIGH",
    category: "Craft",
    xp: 600,
    dueDate: today,
    dueTime: "18:00",
  },
  {
    id: "demo-m-2",
    title: "Morning conditioning — 5km",
    description: "Zone 2. No headphones.",
    difficulty: "C",
    priority: "MEDIUM",
    category: "Training",
    xp: 400,
    dueDate: today,
    dueTime: "07:00",
    recurrence: { type: "daily", interval: 1, paused: false, skipped: 2, completed: 186 },
  },
  {
    id: "demo-m-3",
    title: "Read 30 pages — Designing Data-Intensive Applications",
    difficulty: "D",
    priority: "MEDIUM",
    category: "Research",
    xp: 350,
    dueDate: today,
  },
  {
    id: "demo-m-4",
    title: "Weekly review + next week's gates",
    description: "Close the loop. Decide what actually matters.",
    difficulty: "B",
    priority: "HIGH",
    category: "Guild",
    xp: 500,
    dueDate: today,
    recurrence: { type: "weekly", interval: 1, paused: false, skipped: 0, completed: 29 },
  },
  {
    id: "demo-m-5",
    title: "Clear the inbox dungeon",
    difficulty: "E",
    priority: "LOW",
    category: "Dungeon",
    xp: 250,
    dueDate: iso(1),
  },
  {
    id: "demo-m-6",
    title: "Sleep before 23:30",
    difficulty: "D",
    priority: "CRITICAL",
    category: "Recovery",
    xp: 300,
    dueDate: today,
    dueTime: "23:30",
    recurrence: { type: "daily", interval: 1, paused: false, skipped: 9, completed: 171 },
  },
];

const HISTORY_TITLES = [
  ["Morning conditioning — 5km", "Training", "C", 400],
  ["Read 30 pages", "Research", "D", 350],
  ["Ship a reviewed PR", "Craft", "A", 600],
  ["Sleep before 23:30", "Recovery", "D", 300],
  ["Clear the inbox dungeon", "Dungeon", "E", 250],
  ["Deep work block — 90 min", "Craft", "B", 500],
  ["Weekly review", "Guild", "B", 500],
  ["Stretch + mobility", "Recovery", "E", 250],
];

/**
 * ~4 months of cleared missions, thinning slightly further back so the
 * heatmap and XP curve read like a real hunter finding their rhythm
 * rather than a synthetic block of colour.
 */
function buildHistory() {
  const out = [];
  for (let day = 0; day < 120; day += 1) {
    const completedAt = iso(-day);
    // early days are patchier; recent months are dense
    const density = day > 90 ? 2 : day > 45 ? 3 : 4;
    const count = ((day * 7) % 5 === 0 ? density - 1 : density) + (day % 11 === 0 ? 1 : 0);
    for (let n = 0; n < count; n += 1) {
      const [title, category, difficulty, xp] = HISTORY_TITLES[(day + n * 3) % HISTORY_TITLES.length];
      out.push({
        id: `demo-h-${day}-${n}`,
        title,
        xp,
        category,
        difficulty,
        completedAt,
        seriesId: null,
      });
    }
  }
  return out;
}

/** Habit logs mirroring the same period, at a believable ~85% adherence. */
function buildHabitLog(days, skipEvery) {
  const log = {};
  for (let day = 0; day < days; day += 1) {
    if (day % skipEvery === 0) continue;
    log[iso(-day)] = true;
  }
  return log;
}

const HABITS = [
  {
    id: "demo-h-1",
    title: "Morning conditioning",
    icon: "Dumbbell",
    color: "#f59e0b",
    cadence: "daily",
    xp: 60,
    log: buildHabitLog(120, 8),
  },
  {
    id: "demo-h-2",
    title: "Read before screens",
    icon: "BookOpen",
    color: "#06b6d4",
    cadence: "daily",
    xp: 50,
    log: buildHabitLog(120, 6),
  },
  {
    id: "demo-h-3",
    title: "No phone after 22:00",
    icon: "Moon",
    color: "#a78bfa",
    cadence: "daily",
    xp: 50,
    log: buildHabitLog(120, 5),
  },
  {
    id: "demo-h-4",
    title: "Deep work block",
    icon: "Brain",
    color: "#10b981",
    cadence: "weekdays",
    xp: 80,
    log: buildHabitLog(120, 4),
  },
];

/**
 * Titles this hunter would already hold.
 *
 * loadState() only seeds achievements for a *new* hunter — an existing save
 * is trusted as-is — so a demo save that shipped an empty map left an S-Rank
 * veteran with an empty Hall of Records, which is the opposite of what the
 * showcase is for. Unlock dates are spread back through the run so the wall
 * reads like a history rather than a single bulk award.
 */
function buildAchievements(state) {
  const unlocked = {};
  const earned = ACHIEVEMENTS.filter((a) => a.test(state));
  earned.forEach((a, i) => {
    // oldest titles furthest back, most recent nearest today
    const daysAgo = Math.round(((earned.length - i) / earned.length) * 110);
    unlocked[a.id] = iso(-daysAgo);
  });
  return unlocked;
}

/**
 * Build the demo save fresh on each entry so every date is relative to
 * *today* — a showcase with a stale heatmap undersells the product.
 */
export function buildDemoSave() {
  const history = buildHistory();
  const save = {
    version: SCHEMA_VERSION,
    missions: BOARD,
    history,
    habits: HABITS,
    settings: { ...DEFAULT_SETTINGS },
    totalXP: DEMO_XP,
    streak: DEMO_STREAK,
    longestStreak: DEMO_STREAK,
    bestRankIndex: 3, // S-Rank
    shields: SHIELD_MAX,
    recovery: null,
    comebacks: 4,
    // two of today's four slots already cleared: progress the visitor can
    // finish themselves, which is the whole point of letting them click
    dailySelected: ["demo-m-2", "demo-m-6", "demo-m-1", "demo-m-3"],
    dailyDate: today,
    dayComplete: false,
    achievements: {},
  };

  return { ...save, achievements: buildAchievements(save) };
}

export default buildDemoSave;
