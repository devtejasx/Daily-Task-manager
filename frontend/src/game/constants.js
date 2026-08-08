/* =========================================================
   Hunter System — progression rules, curves, achievements
   ========================================================= */

/* ---------- local-date helpers (avoid UTC rollover bugs) ---------- */
export function localISO(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
export function addDaysISO(iso, days) {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + days);
  return localISO(d);
}

/* ---------- level curve ---------- */
/** XP needed to advance FROM `level` TO `level + 1` (progressively increasing) */
export function xpNeededForLevel(level) {
  return 1000 + (level - 1) * 400;
}

/** Derive level + progress within level from lifetime XP */
export function getLevelInfo(totalXP) {
  let level = 1;
  let remaining = totalXP;
  while (remaining >= xpNeededForLevel(level)) {
    remaining -= xpNeededForLevel(level);
    level += 1;
  }
  const needed = xpNeededForLevel(level);
  return {
    level,
    xpInLevel: remaining,
    xpNeeded: needed,
    xpToNext: needed - remaining,
    progress: remaining / needed,
  };
}

/** Default mission XP reward scales with hunter level: 300 / 350 / 400 / 500 / +100... */
export function missionXPForLevel(level) {
  const table = [300, 350, 400, 500];
  if (level <= table.length) return table[level - 1];
  return Math.min(1000, 500 + (level - 4) * 100);
}

/* ---------- hunter ranks ----------
 *
 * Rank answers "what have I become", so it is deliberately harder to move
 * than a level and impossible to move backwards. Two things changed here:
 *
 *   1. C-Rank and A-Rank fill what used to be a 69-day walk from D to B
 *      with nothing in it — the stretch where a hunter is most likely to
 *      stop believing the climb is going anywhere.
 *
 *   2. A rank can be earned two ways. `streak` is the original route and
 *      is preserved exactly: 21 days is still D, 90 still B, 180 still S,
 *      365 still National, so no existing hunter is worse off. `requires`
 *      is the second route, for the hunter who is genuinely disciplined
 *      but has taken a rest day — level, missions cleared and Discipline
 *      Score together, which a streak alone cannot express.
 *
 * Meeting EITHER route promotes. See game/rank.js for the evaluation.
 */
export const HUNTER_RANKS = [
  {
    key: "E",
    title: "E-RANK HUNTER",
    streak: 0,
    requires: { level: 1, missions: 0, discipline: 0 },
    color: "#94a3b8",
    aura: "rgba(148,163,184,0.35)",
    blurb: "An awakened one. The weakest gate is still a gate.",
  },
  {
    key: "D",
    title: "D-RANK HUNTER",
    streak: 21,
    requires: { level: 5, missions: 25, discipline: 40 },
    color: "#10b981",
    aura: "rgba(16,185,129,0.45)",
    blurb: "The system acknowledges you. Showing up is no longer novel.",
  },
  {
    key: "C",
    title: "C-RANK HUNTER",
    streak: 45,
    requires: { level: 12, missions: 75, discipline: 55 },
    color: "#22d3ee",
    aura: "rgba(34,211,238,0.5)",
    blurb: "The rhythm holds without you thinking about it. Gates open easier now.",
  },
  {
    key: "B",
    title: "B-RANK HUNTER",
    streak: 90,
    requires: { level: 20, missions: 150, discipline: 65 },
    color: "#3b82f6",
    aura: "rgba(59,130,246,0.5)",
    blurb: "Three months of iron will. Guilds are watching.",
  },
  {
    key: "A",
    title: "A-RANK HUNTER",
    streak: 135,
    requires: { level: 30, missions: 300, discipline: 75 },
    color: "#ec4899",
    aura: "rgba(236,72,153,0.55)",
    blurb: "Consistency at this depth is rare enough to be a weapon.",
  },
  {
    key: "S",
    title: "S-RANK HUNTER",
    streak: 180,
    requires: { level: 45, missions: 500, discipline: 85 },
    color: "#a78bfa",
    aura: "rgba(167,139,250,0.55)",
    blurb: "Half a year of sustained discipline. A living calamity.",
  },
  {
    key: "NATIONAL",
    title: "NATIONAL-LEVEL HUNTER",
    streak: 365,
    requires: { level: 70, missions: 1000, discipline: 90 },
    color: "#f59e0b",
    aura: "rgba(245,158,11,0.6)",
    blurb: "One full year. Nations negotiate with power like yours.",
  },
];

export function rankIndexForStreak(streak) {
  let idx = 0;
  HUNTER_RANKS.forEach((r, i) => {
    if (streak >= r.streak) idx = i;
  });
  return idx;
}

export function nextRank(rankIndex) {
  return HUNTER_RANKS[rankIndex + 1] ?? null;
}

/* ---------- daily quest ---------- */
export const DAILY_REQUIRED = 4;

/* ---------- the Resolve system ----------
 * Discipline is built by consistency, not by perfection. A hunter who shows
 * up day after day banks Resolve; a hunter who misses one day spends it
 * instead of losing the climb. Nothing here can ever take XP, levels,
 * achievements or a personal best away — power once earned is permanent.
 * The only thing at stake is the *current* streak, and even that gets a
 * second chance before it goes. */

/** Consecutive cleared days that forge one Streak Shield. */
export const SHIELD_EVERY = 7;

/** Shields a hunter may hold at once. Banking is capped so the streak still
 *  means something, but three misses of headroom is a forgiving buffer. */
export const SHIELD_MAX = 3;

/** Days a preserved streak waits for its comeback before it finally settles. */
export const RECOVERY_WINDOW_DAYS = 1;

/** Bonus XP for clearing the daily quest that reclaims a preserved streak. */
export const COMEBACK_XP = 250;

/**
 * Shields forged by reaching `streak`, capped at SHIELD_MAX.
 * Day 7 forges the first, day 14 the second, and so on.
 */
export function shieldsEarnedAt(streak) {
  if (streak <= 0 || streak % SHIELD_EVERY !== 0) return 0;
  return 1;
}

/** Days remaining until the next shield is forged. */
export function daysToNextShield(streak) {
  const into = streak % SHIELD_EVERY;
  return SHIELD_EVERY - into;
}

/* ---------- priorities ---------- */
export const PRIORITIES = {
  LOW: { label: "Low", color: "#94a3b8" },
  MEDIUM: { label: "Medium", color: "#3b82f6" },
  HIGH: { label: "High", color: "#f59e0b" },
  CRITICAL: { label: "Critical", color: "#ef4444" },
};

/* ---------- interface themes ----------
 * Themes re-tint the ambient aura, neon borders and glows via the
 * [data-theme] selectors in index.css. The Solo-Leveling glass/hologram
 * language is identical across all four — only the mana colour changes. */
export const THEMES = {
  arcane: { label: "Arcane", desc: "Violet & cyan — the system default.", swatch: ["#7c3aed", "#06b6d4"] },
  shadow: { label: "Shadow", desc: "Deep monarch violet, low light.", swatch: ["#4c1d95", "#a78bfa"] },
  frost: { label: "Frost", desc: "Ice blue, high clarity.", swatch: ["#0ea5e9", "#67e8f9"] },
  ember: { label: "Ember", desc: "Molten amber for late raids.", swatch: ["#f59e0b", "#ef4444"] },
};

/* ---------- recurrence ---------- */
export const RECURRENCE_TYPES = {
  daily: { label: "Daily", desc: "Repeats every day" },
  weekly: { label: "Weekly", desc: "Repeats every week" },
  monthly: { label: "Monthly", desc: "Repeats every month" },
  custom: { label: "Custom", desc: "Repeats every N days" },
};

/* ---------- reminders (minutes before the due moment) ---------- */
export const REMINDER_OPTIONS = [
  { value: 5, label: "5 min before" },
  { value: 15, label: "15 min before" },
  { value: 30, label: "30 min before" },
  { value: 60, label: "1 hour before" },
  { value: 1440, label: "1 day before" },
];

/* ---------- pomodoro defaults ---------- */
export const POMODORO_DEFAULTS = { work: 25, shortBreak: 5, longBreak: 15, rounds: 4 };

/* ---------- habits ---------- */
export const HABIT_CADENCES = {
  daily: { label: "Every day", targetPerWeek: 7 },
  weekdays: { label: "Weekdays", targetPerWeek: 5 },
  weekly3: { label: "3× a week", targetPerWeek: 3 },
  weekly1: { label: "Once a week", targetPerWeek: 1 },
};

/* ---------- achievements ----------
 *
 * Every entry rewards something a hunter should actually want to have
 * done. Nothing here can be earned by a burst — "complete 100 missions
 * today" is the shape of achievement this product exists to argue with,
 * so the counters that could be farmed in one sitting are all lifetime
 * totals, and the ones that matter measure DAYS.
 *
 * `category` groups the wall. `rarity` says which ones are allowed to
 * shout; see game/rarity for why most are not.
 */

/** Distinct days on which anything was cleared — missions or habits. */
function activeDayCount(state) {
  const days = new Set();
  for (const entry of state.history ?? []) if (entry?.completedAt) days.add(entry.completedAt);
  for (const habit of state.habits ?? []) {
    for (const [day, done] of Object.entries(habit.log ?? {})) if (done) days.add(day);
  }
  return days.size;
}

export const ACHIEVEMENT_CATEGORIES = [
  "First Steps",
  "Consistency",
  "Long-Term Discipline",
  "Recovery",
  "Milestones",
  "Rank",
];

export const ACHIEVEMENTS = [
  /* ---- First Steps ---- */
  { id: "first-mission", title: "First Awakening", desc: "Complete your first mission.", icon: "Sunrise", color: "#06b6d4", category: "First Steps", rarity: "common", test: (s) => s.history.length >= 1 },
  { id: "xp-1000", title: "Mana Reservoir", desc: "Earn 1,000 total XP.", icon: "Zap", color: "#3b82f6", category: "First Steps", rarity: "common", test: (s) => s.totalXP >= 1000 },
  { id: "missions-10", title: "Gate Crasher", desc: "Complete 10 missions.", icon: "Swords", color: "#7c3aed", category: "First Steps", rarity: "common", test: (s) => s.history.length >= 10 },

  /* ---- Consistency ----
   * Measured in DAYS SHOWN UP FOR, never in things ticked. These are the
   * achievements no amount of task-splitting can reach. */
  { id: "days-7", title: "Seven Sunrises", desc: "Show up on 7 separate days.", icon: "CalendarCheck", color: "#22d3ee", category: "Consistency", rarity: "common", test: (s) => activeDayCount(s) >= 7 },
  { id: "days-30", title: "A Month of Mornings", desc: "Show up on 30 separate days.", icon: "CalendarDays", color: "#10b981", category: "Consistency", rarity: "rare", test: (s) => activeDayCount(s) >= 30 },
  { id: "days-100", title: "One Hundred Days", desc: "Show up on 100 separate days.", icon: "Sparkles", color: "#a78bfa", category: "Consistency", rarity: "epic", test: (s) => activeDayCount(s) >= 100 },
  { id: "streak-21", title: "Iron Discipline", desc: "Hold a 21-day streak.", icon: "CalendarCheck", color: "#10b981", category: "Consistency", rarity: "rare", test: (s) => s.longestStreak >= 21 },

  /* ---- Long-Term Discipline ---- */
  { id: "missions-100", title: "Dungeon Devourer", desc: "Complete 100 missions.", icon: "Flame", color: "#f59e0b", category: "Long-Term Discipline", rarity: "rare", test: (s) => s.history.length >= 100 },
  { id: "missions-500", title: "Gate Breaker", desc: "Complete 500 missions.", icon: "Swords", color: "#ec4899", category: "Long-Term Discipline", rarity: "epic", test: (s) => s.history.length >= 500 },
  { id: "streak-90", title: "Unbending Will", desc: "Hold a 90-day streak.", icon: "ShieldCheck", color: "#3b82f6", category: "Long-Term Discipline", rarity: "epic", test: (s) => s.longestStreak >= 90 },
  { id: "streak-180", title: "Beyond Human", desc: "Hold a 180-day streak.", icon: "Sparkles", color: "#a78bfa", category: "Long-Term Discipline", rarity: "legendary", test: (s) => s.longestStreak >= 180 },
  { id: "streak-365", title: "Eternal Flame", desc: "Hold a 365-day streak.", icon: "Crown", color: "#f59e0b", category: "Long-Term Discipline", rarity: "legendary", test: (s) => s.longestStreak >= 365 },

  /* ---- Recovery ----
   * The Resolve line. Coming back from a missed day is a skill, and it is
   * celebrated here exactly as loudly as never missing one. */
  { id: "resolve-full", title: "Fully Resolved", desc: `Bank all ${SHIELD_MAX} Streak Shields at once.`, icon: "ShieldCheck", color: "#38bdf8", category: "Recovery", rarity: "rare", test: (s) => (s.shields ?? 0) >= SHIELD_MAX },
  { id: "comeback-1", title: "Nothing Kept Me Down", desc: "Reclaim a preserved streak for the first time.", icon: "Hourglass", color: "#a78bfa", category: "Recovery", rarity: "rare", test: (s) => (s.comebacks ?? 0) >= 1 },
  { id: "comeback-5", title: "Always Returns", desc: "Reclaim a preserved streak five times.", icon: "Repeat", color: "#10b981", category: "Recovery", rarity: "epic", test: (s) => (s.comebacks ?? 0) >= 5 },
  { id: "comeback-15", title: "The Tide Returns", desc: "Reclaim a preserved streak fifteen times.", icon: "Repeat", color: "#f59e0b", category: "Recovery", rarity: "legendary", test: (s) => (s.comebacks ?? 0) >= 15 },

  /* ---- Milestones ---- */
  { id: "level-10", title: "Tenth Ascent", desc: "Reach hunter level 10.", icon: "TrendingUp", color: "#22d3ee", category: "Milestones", rarity: "common", test: (s) => getLevelInfo(s.totalXP ?? 0).level >= 10 },
  { id: "level-25", title: "Deep Mana", desc: "Reach hunter level 25.", icon: "Zap", color: "#3b82f6", category: "Milestones", rarity: "rare", test: (s) => getLevelInfo(s.totalXP ?? 0).level >= 25 },
  { id: "level-50", title: "Beyond the Curve", desc: "Reach hunter level 50.", icon: "Sparkles", color: "#a78bfa", category: "Milestones", rarity: "epic", test: (s) => getLevelInfo(s.totalXP ?? 0).level >= 50 },
  { id: "quest-30", title: "Thirty Quests Cleared", desc: "Clear the daily quest on 30 days.", icon: "Target", color: "#10b981", category: "Milestones", rarity: "epic", test: (s) => (s.questDays ?? []).length >= 30 },

  /* ---- Rank ----
   * Read from the permanent rank key. A hunter who loses a streak keeps
   * every licence they ever earned. */
  { id: "rank-d", title: "D-Rank License", desc: "Get promoted to D-Rank.", icon: "BadgeCheck", color: "#10b981", category: "Rank", rarity: "common", test: (s) => rankReached(s, "D") },
  { id: "rank-c", title: "C-Rank License", desc: "Get promoted to C-Rank.", icon: "BadgeCheck", color: "#22d3ee", category: "Rank", rarity: "rare", test: (s) => rankReached(s, "C") },
  { id: "rank-b", title: "B-Rank License", desc: "Get promoted to B-Rank.", icon: "Medal", color: "#3b82f6", category: "Rank", rarity: "rare", test: (s) => rankReached(s, "B") },
  { id: "rank-a", title: "A-Rank License", desc: "Get promoted to A-Rank.", icon: "Medal", color: "#ec4899", category: "Rank", rarity: "epic", test: (s) => rankReached(s, "A") },
  { id: "rank-s", title: "S-Rank License", desc: "Get promoted to S-Rank.", icon: "Trophy", color: "#a78bfa", category: "Rank", rarity: "legendary", test: (s) => rankReached(s, "S") },
  { id: "rank-national", title: "Monarch of Nations", desc: "Become a National-Level Hunter.", icon: "Skull", color: "#ef4444", category: "Rank", rarity: "legendary", test: (s) => rankReached(s, "NATIONAL") },
];

/**
 * Has the hunter ever held this rank?
 *
 * Reads `bestRank` and falls back to the v3 `bestRankIndex` through the
 * frozen legacy order, so an unmigrated state object — the shape the
 * existing achievement tests pass in — still answers correctly.
 */
function rankReached(state, key) {
  const order = HUNTER_RANKS.map((r) => r.key);
  const target = order.indexOf(key);
  if (typeof state.bestRank === "string" && state.bestRank) {
    return order.indexOf(state.bestRank) >= target;
  }
  const legacy = ["E", "D", "B", "S", "NATIONAL"];
  const held = legacy[Number(state.bestRankIndex) || 0] ?? "E";
  return order.indexOf(held) >= target;
}
