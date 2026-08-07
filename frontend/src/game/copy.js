/* =========================================================
   The lexicon

   One home for the words the world uses, so the voice cannot drift
   as screens are added. The rule (PROJECT_VISION.md): the hunter is
   never told they failed, were late, or fell behind — the System
   narrates, encourages, and never scolds.

   If a string is user-visible and says something about the hunter's
   progress or the app's state, it belongs here.
   ========================================================= */

/** Machine-speak → world-speak. The table the whole app agrees on. */
export const LEXICON = {
  task: "mission",
  tasks: "missions",
  taskCompleted: "MISSION CLEARED",
  loading: "PREPARING YOUR NEXT QUEST",
  saving: "UPDATING HUNTER RECORDS",
  saved: "HUNTER RECORDS UPDATED",
  noTasks: "The System awaits your next mission.",
  welcomeBack: "WELCOME BACK, HUNTER",
  statistics: "HUNTER PROFILE",
  profile: "HUNTER RECORD",
  settings: "SYSTEM CONFIGURATION",
};

/** System-state labels (boot screens, sync banners). */
export const SYSTEM = {
  connecting: "CONNECTING TO THE SYSTEM",
  syncing: "PREPARING YOUR NEXT QUEST",
  saving: "UPDATING HUNTER RECORDS",
  syncFailed: "HUNTER RECORDS UNREACHABLE",
  syncFailedDetail:
    "The System couldn't reach your record. Nothing has been lost — your progress is safe.",
  offlineDetail:
    "You appear to be offline. Reconnect when you can — nothing has been lost.",
};

/**
 * Empty states. Never a dead end: each one names what the space is for
 * and points at the single next action worth taking.
 */
export const EMPTY = {
  missions: {
    title: "THE SYSTEM AWAITS YOUR NEXT MISSION",
    body: "Every climb starts with one gate. Name something you'll actually do today.",
    cta: "FORGE YOUR FIRST MISSION",
  },
  missionsFiltered: {
    title: "NO MISSIONS MATCH THESE FILTERS",
    body: "Your board isn't empty — this view just is. Clear the filters to see it all.",
    cta: "CLEAR FILTERS",
  },
  achievements: {
    title: "EVERY LEGEND STARTS SOMEWHERE",
    body: "Titles are earned, never bought. Clear your first mission and the first one is yours.",
  },
  history: {
    title: "YOUR STORY BEGINS TODAY",
    body: "Cleared missions are recorded here permanently. Nothing you earn is ever taken away.",
  },
  analytics: {
    title: "NO DATA TO READ YET",
    body: "Clear a few missions and this fills with your XP curve, your busiest days and your rhythm.",
  },
  habits: {
    title: "DISCIPLINE COMPOUNDS QUIETLY",
    body: "Habits are the missions you don't have to decide about. Start with one.",
    cta: "TRACK YOUR FIRST HABIT",
  },
  calendar: {
    title: "NO GATES SCHEDULED",
    body: "Give a mission a date and it appears here, ready to be dragged wherever it belongs.",
  },
};

/**
 * The returning hunter's greeting — rotated by day so it never reads as
 * a canned banner, and phrased as a mentor rather than a scoreboard.
 */
const GREETINGS = [
  "The System has been holding your place.",
  "Your record is exactly where you left it.",
  "Another gate opens. You already know the way.",
  "Strength is just yesterday, repeated.",
  "No one is watching. That's what makes it count.",
  "The climb doesn't ask how you feel about it.",
  "Show up. The rest is arithmetic.",
];

/** Deterministic per day, so it doesn't flicker on re-render. */
export function greetingForDay(iso) {
  let hash = 0;
  for (let i = 0; i < iso.length; i += 1) hash = (hash * 31 + iso.charCodeAt(i)) >>> 0;
  return GREETINGS[hash % GREETINGS.length];
}

/**
 * A line about the hunter's streak that encourages at every value —
 * including zero, which is the one the old copy handled worst.
 */
export function streakLine(streak, recovery) {
  if (recovery) return `${recovery.streak} days are being held for you. Today takes them back.`;
  if (streak === 0) return "Day one is the only hard one. Let's begin.";
  if (streak === 1) return "One day down. Tomorrow is what makes it a streak.";
  if (streak < 7) return `${streak} days in a row. The habit is forming.`;
  if (streak < 21) return `${streak} days unbroken. This is starting to look like who you are.`;
  if (streak < 90) return `${streak} days. Most people never see this number.`;
  return `${streak} days. You are the argument for discipline.`;
}
