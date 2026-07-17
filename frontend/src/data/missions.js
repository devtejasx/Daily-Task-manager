import { localISO, addDaysISO } from "../game/constants";

// ---------- difficulty tiers ----------
export const DIFFICULTIES = {
  E: { label: "E-Rank", color: "#94a3b8", glow: "rgba(148,163,184,0.35)" },
  D: { label: "D-Rank", color: "#10b981", glow: "rgba(16,185,129,0.35)" },
  C: { label: "C-Rank", color: "#3b82f6", glow: "rgba(59,130,246,0.35)" },
  B: { label: "B-Rank", color: "#06b6d4", glow: "rgba(6,182,212,0.35)" },
  A: { label: "A-Rank", color: "#a78bfa", glow: "rgba(167,139,250,0.4)" },
  S: { label: "S-Rank", color: "#f59e0b", glow: "rgba(245,158,11,0.45)" },
};

export const CATEGORIES = [
  "Training",
  "Dungeon",
  "Guild",
  "Research",
  "Craft",
  "Recovery",
];

const today = localISO();
const iso = (offsetDays) => addDaysISO(today, offsetDays);

let uid = 100;
export const nextId = () => `m-${++uid}-${Date.now().toString(36)}`;

// ---------- mock missions (the active board) ----------
export const INITIAL_MISSIONS = [
  {
    id: "m-1",
    title: "Workout — Morning Training",
    description: "45 minutes of strength training. A hunter's body is their first weapon.",
    difficulty: "C",
    priority: "HIGH",
    dueDate: iso(0),
    dueTime: "07:30",
    status: "active",
    xp: 300,
    category: "Training",
    createdAt: iso(-3),
  },
  {
    id: "m-2",
    title: "Study DSA — Graph Algorithms",
    description: "Two focused hours on BFS/DFS and shortest paths. Knowledge is mana.",
    difficulty: "B",
    priority: "CRITICAL",
    dueDate: iso(0),
    dueTime: "11:00",
    status: "active",
    xp: 300,
    category: "Research",
    createdAt: iso(-3),
  },
  {
    id: "m-3",
    title: "Read 20 Pages",
    description: "Twenty pages of the current tome. The archive grows nightly.",
    difficulty: "E",
    priority: "MEDIUM",
    dueDate: iso(0),
    dueTime: "21:00",
    status: "active",
    xp: 300,
    category: "Research",
    createdAt: iso(-2),
  },
  {
    id: "m-4",
    title: "Build Project — Ship a Feature",
    description: "Forge one complete feature for the side project. No half-cast spells.",
    difficulty: "A",
    priority: "HIGH",
    dueDate: iso(0),
    dueTime: "18:00",
    status: "active",
    xp: 300,
    category: "Craft",
    createdAt: iso(-2),
  },
  {
    id: "m-5",
    title: "Guild Sync — Inbox Zero",
    description: "Clear messages and triage the day's requests before the portal closes.",
    difficulty: "D",
    priority: "LOW",
    dueDate: iso(1),
    dueTime: "09:30",
    status: "active",
    xp: 300,
    category: "Guild",
    createdAt: iso(-1),
  },
  {
    id: "m-6",
    title: "Red Gate: Quarterly Report",
    description: "High-stakes dungeon. Compile metrics, forge the deck, brief the guild master.",
    difficulty: "S",
    priority: "CRITICAL",
    dueDate: iso(4),
    dueTime: "16:00",
    status: "active",
    xp: 300,
    category: "Guild",
    createdAt: iso(-1),
  },
];

// ---------- mission history (previously cleared gates) ----------
export const INITIAL_HISTORY = [
  { id: "h-1", title: "Sharpen the Blade", xp: 180, category: "Training", difficulty: "C", completedAt: iso(-1) },
  { id: "h-2", title: "Seal the Broken Ward", xp: 300, category: "Dungeon", difficulty: "B", completedAt: iso(-1) },
  { id: "h-3", title: "Tribute to the Guild", xp: 140, category: "Guild", difficulty: "D", completedAt: iso(-2) },
  { id: "h-4", title: "Mana Circuit Repair", xp: 220, category: "Craft", difficulty: "C", completedAt: iso(-3) },
  { id: "h-5", title: "Scout the North Gate", xp: 160, category: "Dungeon", difficulty: "D", completedAt: iso(-4) },
  { id: "h-6", title: "Archive Transcription", xp: 200, category: "Research", difficulty: "C", completedAt: iso(-5) },
  { id: "h-7", title: "Morning Conditioning", xp: 120, category: "Training", difficulty: "E", completedAt: iso(-5) },
  { id: "h-8", title: "Ward the Guild Hall", xp: 260, category: "Guild", difficulty: "B", completedAt: iso(-6) },
];
