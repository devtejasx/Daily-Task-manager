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

/* ---------- hunter ranks (earned by CONTINUOUS streak) ---------- */
export const HUNTER_RANKS = [
  {
    key: "E",
    title: "E-RANK HUNTER",
    streak: 0,
    color: "#94a3b8",
    aura: "rgba(148,163,184,0.35)",
    blurb: "An awakened one. The weakest gate is still a gate.",
  },
  {
    key: "D",
    title: "D-RANK HUNTER",
    streak: 21,
    color: "#10b981",
    aura: "rgba(16,185,129,0.45)",
    blurb: "21 days unbroken. The system acknowledges you.",
  },
  {
    key: "B",
    title: "B-RANK HUNTER",
    streak: 90,
    color: "#3b82f6",
    aura: "rgba(59,130,246,0.5)",
    blurb: "Three months of iron will. Guilds are watching.",
  },
  {
    key: "S",
    title: "S-RANK HUNTER",
    streak: 180,
    color: "#a78bfa",
    aura: "rgba(167,139,250,0.55)",
    blurb: "Half a year without a single failure. A living calamity.",
  },
  {
    key: "NATIONAL",
    title: "NATIONAL-LEVEL HUNTER",
    streak: 365,
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

/* ---------- achievements ---------- */
export const ACHIEVEMENTS = [
  { id: "first-mission", title: "First Awakening", desc: "Complete your first mission.", icon: "Sunrise", color: "#06b6d4", test: (s) => s.history.length >= 1 },
  { id: "xp-1000", title: "Mana Reservoir", desc: "Earn 1,000 total XP.", icon: "Zap", color: "#3b82f6", test: (s) => s.totalXP >= 1000 },
  { id: "missions-10", title: "Gate Crasher", desc: "Complete 10 missions.", icon: "Swords", color: "#7c3aed", test: (s) => s.history.length >= 10 },
  { id: "missions-100", title: "Dungeon Devourer", desc: "Complete 100 missions.", icon: "Flame", color: "#f59e0b", test: (s) => s.history.length >= 100 },
  { id: "streak-21", title: "Iron Discipline", desc: "Hold a 21-day streak.", icon: "CalendarCheck", color: "#10b981", test: (s) => s.longestStreak >= 21 },
  { id: "streak-90", title: "Unbending Will", desc: "Hold a 90-day streak.", icon: "ShieldCheck", color: "#3b82f6", test: (s) => s.longestStreak >= 90 },
  { id: "streak-180", title: "Beyond Human", desc: "Hold a 180-day streak.", icon: "Sparkles", color: "#a78bfa", test: (s) => s.longestStreak >= 180 },
  { id: "streak-365", title: "Eternal Flame", desc: "Hold a 365-day streak.", icon: "Crown", color: "#f59e0b", test: (s) => s.longestStreak >= 365 },
  { id: "rank-d", title: "D-Rank License", desc: "Get promoted to D-Rank.", icon: "BadgeCheck", color: "#10b981", test: (s) => s.bestRankIndex >= 1 },
  { id: "rank-b", title: "B-Rank License", desc: "Get promoted to B-Rank.", icon: "Medal", color: "#3b82f6", test: (s) => s.bestRankIndex >= 2 },
  { id: "rank-s", title: "S-Rank License", desc: "Get promoted to S-Rank.", icon: "Trophy", color: "#a78bfa", test: (s) => s.bestRankIndex >= 3 },
  { id: "rank-national", title: "Monarch of Nations", desc: "Become a National-Level Hunter.", icon: "Skull", color: "#ef4444", test: (s) => s.bestRankIndex >= 4 },
];
