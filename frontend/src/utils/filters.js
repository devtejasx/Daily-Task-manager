/* =========================================================
   Mission filtering

   Every facet composes with AND; values *inside* one facet compose
   with OR. So {priorities: [HIGH, CRITICAL], flags: [overdue]} reads
   as "high OR critical priority, AND overdue".
   ========================================================= */

import { localISO } from "../game/constants";
import { isOverdue, isThisWeek } from "./date";

/** The neutral filter state — matches everything. */
export const EMPTY_FILTERS = {
  search: "",
  categories: [],
  priorities: [],
  difficulties: [],
  xpMin: null,
  xpMax: null,
  status: "all", // all | active | completed
  flags: [], // overdue | dueToday | dueTomorrow | dueThisWeek | recurring | daily
};

export const FLAGS = [
  { id: "overdue", label: "Overdue", color: "#ef4444" },
  { id: "dueToday", label: "Due Today", color: "#06b6d4" },
  { id: "dueTomorrow", label: "Tomorrow", color: "#f59e0b" },
  { id: "dueThisWeek", label: "This Week", color: "#3b82f6" },
  { id: "recurring", label: "Recurring", color: "#a78bfa" },
  { id: "daily", label: "Daily Quest", color: "#7c3aed" },
];

export const STATUSES = [
  { id: "all", label: "All" },
  { id: "active", label: "Pending" },
  { id: "completed", label: "Completed" },
];

/** Does this mission satisfy a single flag? */
function matchesFlag(mission, flag, ctx) {
  switch (flag) {
    case "overdue":
      return isOverdue(mission, ctx.now);
    case "dueToday":
      return mission.dueDate === ctx.today;
    case "dueTomorrow":
      return mission.dueDate === ctx.tomorrow;
    case "dueThisWeek":
      return isThisWeek(mission.dueDate, ctx.today);
    case "recurring":
      return Boolean(mission.recurrence);
    case "daily":
      return ctx.dailySelected.includes(mission.id);
    default:
      return true;
  }
}

/** Free-text match across title, briefing and category. */
function matchesSearch(mission, query) {
  if (!query) return true;
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    mission.title?.toLowerCase().includes(q) ||
    mission.description?.toLowerCase().includes(q) ||
    mission.category?.toLowerCase().includes(q)
  );
}

/**
 * Apply the full filter set to a mission list.
 *
 * @param {object[]} missions
 * @param {object} filters   partial filter state; missing keys fall back to EMPTY_FILTERS
 * @param {{dailySelected?: string[], today?: string, now?: Date}} [options]
 * @returns {object[]} a new array, original order preserved
 */
export function applyFilters(missions, filters = {}, options = {}) {
  const f = { ...EMPTY_FILTERS, ...filters };
  const today = options.today ?? localISO();
  const ctx = {
    today,
    tomorrow: nextDay(today),
    now: options.now ?? new Date(),
    dailySelected: options.dailySelected ?? [],
  };

  return (missions ?? []).filter((mission) => {
    if (!matchesSearch(mission, f.search)) return false;

    if (f.status === "active" && mission.status === "completed") return false;
    if (f.status === "completed" && mission.status !== "completed") return false;

    if (f.categories.length && !f.categories.includes(mission.category)) return false;
    if (f.priorities.length && !f.priorities.includes(mission.priority)) return false;
    if (f.difficulties.length && !f.difficulties.includes(mission.difficulty)) return false;

    const xp = Number(mission.xp) || 0;
    if (f.xpMin != null && xp < f.xpMin) return false;
    if (f.xpMax != null && xp > f.xpMax) return false;

    // Flags are OR'd with each other: "overdue OR due today".
    if (f.flags.length && !f.flags.some((flag) => matchesFlag(mission, flag, ctx))) return false;

    return true;
  });
}

/** Local +1 day without pulling in the whole date module. */
function nextDay(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d + 1);
  return localISO(dt);
}

/** How many facets are narrowing the board right now (drives the badge). */
export function countActiveFilters(filters = {}) {
  const f = { ...EMPTY_FILTERS, ...filters };
  return (
    (f.search.trim() ? 1 : 0) +
    (f.status !== "all" ? 1 : 0) +
    f.categories.length +
    f.priorities.length +
    f.difficulties.length +
    f.flags.length +
    (f.xpMin != null ? 1 : 0) +
    (f.xpMax != null ? 1 : 0)
  );
}

/** Toggle one value inside a multi-select facet. */
export function toggleValue(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}
