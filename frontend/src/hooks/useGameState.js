import { useEffect, useMemo, useReducer, useRef } from "react";
import {
  localISO,
  addDaysISO,
  getLevelInfo,
  missionXPForLevel,
  rankIndexForStreak,
  HUNTER_RANKS,
  ACHIEVEMENTS,
  DAILY_REQUIRED,
} from "../game/constants";
import { nextId } from "../data/missions";
import { buildNextOccurrence, nextOccurrenceISO } from "../utils/recurrence";
import { toggleDay, currentStreak } from "../utils/habits";
import {
  migrateSave,
  mergeSettings,
  normalizeMission,
  normalizeHabit,
  SCHEMA_VERSION,
  DEFAULT_SETTINGS,
} from "../services/migration";

let toastId = 0;

/* ---------------- initial state ----------------
 * A brand-new hunter (and any signed-out guest) starts completely EMPTY:
 * no missions, no history, no XP, no streak, no achievements. Existing
 * users are unaffected — their saved doc is spread over this in loadState,
 * overriding every field below.                                          */
function freshState() {
  const today = localISO();
  return {
    version: SCHEMA_VERSION,
    missions: [],
    history: [], // [{id,title,xp,category,difficulty,completedAt}]
    habits: [], // [{id,title,icon,color,cadence,xp,log:{ISO:true}}]
    settings: { ...DEFAULT_SETTINGS },
    totalXP: 0,
    streak: 0,
    longestStreak: 0,
    bestRankIndex: 0,
    dailySelected: [],
    dailyDate: today,
    dayComplete: false,
    achievements: {}, // {id: unlockedISO}
    // transient FX (not persisted)
    fx: { levelUp: null, promotion: null, failed: false, newDay: false, toasts: [] },
  };
}

/**
 * Build the initial reducer state from a cloud save (or null for a new hunter).
 * Old saves are upgraded by services/migration before they reach the reducer,
 * so every field below is guaranteed to exist from here on.
 */
function loadState(cloudSave) {
  try {
    if (!cloudSave) return rollover(seedAchievements(freshState()));
    const base = { ...freshState(), ...migrateSave(cloudSave) };
    base.settings = mergeSettings(base.settings);
    base.fx = { levelUp: null, promotion: null, failed: false, newDay: false, toasts: [] };
    return rollover(base);
  } catch {
    return rollover(seedAchievements(freshState()));
  }
}

/** silently unlock achievements already satisfied by seed data (no toasts on first load) */
function seedAchievements(state) {
  const achievements = { ...state.achievements };
  for (const a of ACHIEVEMENTS) {
    if (!achievements[a.id] && a.test(state)) achievements[a.id] = localISO();
  }
  return { ...state, achievements };
}

/* ---------------- achievement sweep (with toasts) ---------------- */
function sweepAchievements(state) {
  const achievements = { ...state.achievements };
  const toasts = [...state.fx.toasts];
  for (const a of ACHIEVEMENTS) {
    if (!achievements[a.id] && a.test(state)) {
      achievements[a.id] = localISO();
      toasts.push({
        id: ++toastId,
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

/* ---------------- day rollover ---------------- */
function rollover(state) {
  const today = localISO();
  if (state.dailyDate === today) return state;

  const yesterday = addDaysISO(today, -1);
  const survived = state.dayComplete && state.dailyDate === yesterday;
  const hadProgressAtStake = state.streak > 0 || state.dailySelected.length > 0;
  const failed = !survived && hadProgressAtStake;

  return {
    ...state,
    missions: state.missions.filter((m) => m.status !== "completed"),
    dailySelected: [],
    dayComplete: false,
    dailyDate: today,
    streak: failed ? 0 : state.streak,
    fx: { ...state.fx, failed, newDay: !failed },
  };
}

/* ---------------- reducer ---------------- */
function reducer(state, action) {
  switch (action.type) {
    case "TICK":
      return rollover(state);

    case "ADD_MISSION": {
      // New missions land at the top of the manual order, matching where they
      // appear in the list before any drag-and-drop has happened.
      const topOrder = state.missions.reduce(
        (min, m) => Math.min(min, m.order ?? 0),
        0
      );
      const mission = normalizeMission({
        id: nextId(),
        status: "active",
        createdAt: localISO(),
        ...action.data,
        order: topOrder - 1,
      });
      return { ...state, missions: [mission, ...state.missions] };
    }

    case "UPDATE_SETTINGS":
      return { ...state, settings: mergeSettings({ ...state.settings, ...action.patch }) };

    case "UPDATE_MISSION": {
      const exists = state.missions.some((m) => m.id === action.id);
      if (!exists) return state;
      return {
        ...state,
        missions: state.missions.map((m) =>
          m.id === action.id ? normalizeMission({ ...m, ...action.patch }) : m
        ),
      };
    }

    case "MOVE_MISSION": {
      // Calendar drag: re-schedule to a new day, carrying a multi-day span
      // along with it rather than stretching or collapsing it.
      const mission = state.missions.find((m) => m.id === action.id);
      if (!mission || mission.dueDate === action.dueDate) return state;

      const spanDays =
        mission.endDate && mission.endDate > mission.dueDate
          ? Math.round(
              (new Date(`${mission.endDate}T12:00:00`) -
                new Date(`${mission.dueDate}T12:00:00`)) /
                86_400_000
            )
          : 0;

      return {
        ...state,
        missions: state.missions.map((m) =>
          m.id === action.id
            ? {
                ...m,
                dueDate: action.dueDate,
                endDate: spanDays > 0 ? addDaysISO(action.dueDate, spanDays) : m.endDate,
                // The old reminder window no longer applies to the new date.
                reminderFiredAt: null,
              }
            : m
        ),
      };
    }

    case "REORDER_MISSIONS": {
      // `orderedIds` covers only the currently visible slice of the board, so
      // we renumber just those rows and leave every other mission untouched.
      const rank = new Map(action.orderedIds.map((id, i) => [id, i]));
      const slots = state.missions
        .filter((m) => rank.has(m.id))
        .map((m) => m.order ?? 0)
        .sort((a, b) => a - b);
      if (slots.length !== action.orderedIds.length) return state;

      return {
        ...state,
        missions: state.missions.map((m) =>
          rank.has(m.id) ? { ...m, order: slots[rank.get(m.id)] } : m
        ),
      };
    }

    /* ---------- recurring missions ---------- */

    case "SKIP_OCCURRENCE": {
      // Jump the series forward one step without awarding XP and without
      // writing a history entry — the occurrence simply never happened.
      const mission = state.missions.find((m) => m.id === action.id);
      if (!mission?.recurrence) return state;

      const nextDue = nextOccurrenceISO(mission.dueDate, mission.recurrence);
      if (!nextDue) return state;

      return {
        ...state,
        missions: state.missions.map((m) =>
          m.id === action.id
            ? {
                ...m,
                dueDate: nextDue,
                occurrence: (m.occurrence ?? 0) + 1,
                reminderFiredAt: null,
                recurrence: { ...m.recurrence, skipped: m.recurrence.skipped + 1 },
              }
            : m
        ),
        fx: {
          ...state.fx,
          toasts: [
            ...state.fx.toasts,
            {
              id: ++toastId,
              kind: "system",
              title: "OCCURRENCE SKIPPED",
              desc: `${mission.title} · next on ${nextDue}`,
              color: "#f59e0b",
            },
          ],
        },
      };
    }

    case "SET_RECURRENCE_PAUSED": {
      const mission = state.missions.find((m) => m.id === action.id);
      if (!mission?.recurrence) return state;
      return {
        ...state,
        missions: state.missions.map((m) =>
          m.id === action.id
            ? { ...m, recurrence: { ...m.recurrence, paused: action.paused } }
            : m
        ),
        fx: {
          ...state.fx,
          toasts: [
            ...state.fx.toasts,
            {
              id: ++toastId,
              kind: "system",
              title: action.paused ? "SERIES PAUSED" : "SERIES RESUMED",
              desc: mission.title,
              color: action.paused ? "#94a3b8" : "#10b981",
            },
          ],
        },
      };
    }

    case "DELETE_MISSION":
      return {
        ...state,
        missions: state.missions.filter((m) => m.id !== action.id),
        dailySelected: state.dailySelected.filter((id) => id !== action.id),
      };

    case "TOGGLE_DAILY": {
      const { id } = action;
      const mission = state.missions.find((m) => m.id === id);
      if (!mission || mission.status === "completed") return state;
      if (state.dailySelected.includes(id)) {
        return { ...state, dailySelected: state.dailySelected.filter((x) => x !== id) };
      }
      if (state.dailySelected.length >= DAILY_REQUIRED) return state;
      return { ...state, dailySelected: [...state.dailySelected, id] };
    }

    case "COMPLETE_MISSION": {
      const mission = state.missions.find((m) => m.id === action.id);
      if (!mission || mission.status === "completed") return state;

      const levelBefore = getLevelInfo(state.totalXP).level;
      const totalXP = state.totalXP + mission.xp;
      const levelAfter = getLevelInfo(totalXP).level;

      // A recurring mission spawns its follow-up occurrence immediately, so
      // the board never goes empty and the cleared card keeps its history.
      const spawned = buildNextOccurrence(mission, "completed");
      const clearedBoard = state.missions.map((m) =>
        m.id === action.id
          ? {
              ...m,
              status: "completed",
              recurrence: m.recurrence
                ? { ...m.recurrence, completed: m.recurrence.completed + 1 }
                : null,
            }
          : m
      );

      let next = {
        ...state,
        totalXP,
        missions: spawned ? [spawned, ...clearedBoard] : clearedBoard,
        history: [
          {
            id: mission.id,
            title: mission.title,
            xp: mission.xp,
            category: mission.category,
            difficulty: mission.difficulty,
            completedAt: localISO(),
            // keeps a repeating mission's occurrences groupable in analytics
            seriesId: mission.seriesId || (mission.recurrence ? mission.id : null),
          },
          ...state.history,
        ],
      };

      const toasts = [
        ...state.fx.toasts,
        {
          id: ++toastId,
          kind: "mission",
          title: "MISSION CLEARED",
          desc: `${mission.title} · +${mission.xp} XP`,
          color: "#06b6d4",
        },
      ];
      let fx = { ...state.fx, toasts };

      /* level up? */
      if (levelAfter > levelBefore) fx.levelUp = levelAfter;

      /* daily quest progress */
      if (state.dailySelected.includes(mission.id)) {
        const doneCount = next.missions.filter(
          (m) => state.dailySelected.includes(m.id) && m.status === "completed"
        ).length;
        if (doneCount >= DAILY_REQUIRED && !state.dayComplete) {
          const streak = state.streak + 1;
          const longestStreak = Math.max(state.longestStreak, streak);
          const newRankIdx = rankIndexForStreak(streak);
          next = { ...next, streak, longestStreak, dayComplete: true };
          if (newRankIdx > rankIndexForStreak(state.streak) || newRankIdx > state.bestRankIndex) {
            if (newRankIdx > state.bestRankIndex) next.bestRankIndex = newRankIdx;
            fx.promotion = HUNTER_RANKS[newRankIdx].key;
          }
          fx.toasts = [
            ...fx.toasts,
            {
              id: ++toastId,
              kind: "daily",
              title: "DAILY QUEST COMPLETE",
              desc: `All ${DAILY_REQUIRED} missions cleared · Streak +1 → ${streak} days`,
              color: "#10b981",
            },
          ];
        }
      }

      return sweepAchievements({ ...next, fx });
    }

    /* ---------- habits ---------- */

    case "ADD_HABIT": {
      const topOrder = state.habits.reduce((min, h) => Math.min(min, h.order ?? 0), 0);
      const habit = normalizeHabit({
        id: nextId(),
        createdAt: localISO(),
        ...action.data,
        order: topOrder - 1,
        log: {},
      });
      return { ...state, habits: [habit, ...state.habits] };
    }

    case "UPDATE_HABIT":
      return {
        ...state,
        habits: state.habits.map((h) =>
          h.id === action.id ? normalizeHabit({ ...h, ...action.patch }) : h
        ),
      };

    case "DELETE_HABIT":
      return { ...state, habits: state.habits.filter((h) => h.id !== action.id) };

    case "TOGGLE_HABIT_DAY": {
      const habit = state.habits.find((h) => h.id === action.id);
      if (!habit) return state;

      const day = action.day ?? localISO();
      const wasDone = Boolean(habit.log?.[day]);
      const next = toggleDay(habit, day);

      // Ticking awards the habit's XP; un-ticking takes it straight back, so a
      // mis-click can never inflate the hunter's level.
      const delta = wasDone ? -habit.xp : habit.xp;
      const levelBefore = getLevelInfo(state.totalXP).level;
      const totalXP = Math.max(0, state.totalXP + delta);
      const levelAfter = getLevelInfo(totalXP).level;

      const fx = { ...state.fx };
      if (levelAfter > levelBefore) fx.levelUp = levelAfter;
      if (!wasDone) {
        const streak = currentStreak(next, day);
        fx.toasts = [
          ...state.fx.toasts,
          {
            id: ++toastId,
            kind: "habit",
            title: "HABIT LOGGED",
            desc: `${habit.title} · +${habit.xp} XP${streak > 1 ? ` · ${streak}-day streak` : ""}`,
            color: habit.color,
          },
        ];
      }

      return sweepAchievements({
        ...state,
        totalXP,
        habits: state.habits.map((h) => (h.id === action.id ? next : h)),
        fx,
      });
    }

    case "REORDER_HABITS": {
      const rank = new Map(action.orderedIds.map((id, i) => [id, i]));
      const slots = state.habits
        .filter((h) => rank.has(h.id))
        .map((h) => h.order ?? 0)
        .sort((a, b) => a - b);
      if (slots.length !== action.orderedIds.length) return state;
      return {
        ...state,
        habits: state.habits.map((h) =>
          rank.has(h.id) ? { ...h, order: slots[rank.get(h.id)] } : h
        ),
      };
    }

    case "DISMISS_FX":
      return { ...state, fx: { ...state.fx, [action.key]: action.key === "levelUp" || action.key === "promotion" ? null : false } };

    case "DISMISS_TOAST":
      return { ...state, fx: { ...state.fx, toasts: state.fx.toasts.filter((t) => t.id !== action.id) } };

    /* ---------- simulation helpers (Settings -> Chrono Sim) ---------- */
    case "SIM_NEXT_DAY": {
      // pretend everything happened one day earlier, then roll over
      const shifted = {
        ...state,
        dailyDate: addDaysISO(state.dailyDate, -1),
      };
      return rollover(shifted);
    }

    case "SIM_ADD_STREAK": {
      const streak = state.streak + action.days;
      const longestStreak = Math.max(state.longestStreak, streak);
      const newRankIdx = rankIndexForStreak(streak);
      let fx = { ...state.fx };
      let bestRankIndex = state.bestRankIndex;
      if (newRankIdx > rankIndexForStreak(state.streak)) {
        bestRankIndex = Math.max(bestRankIndex, newRankIdx);
        fx.promotion = HUNTER_RANKS[newRankIdx].key;
      }
      return sweepAchievements({ ...state, streak, longestStreak, bestRankIndex, fx });
    }

    case "SIM_ADD_XP": {
      const levelBefore = getLevelInfo(state.totalXP).level;
      const totalXP = state.totalXP + action.xp;
      const levelAfter = getLevelInfo(totalXP).level;
      const fx = { ...state.fx };
      if (levelAfter > levelBefore) fx.levelUp = levelAfter;
      return sweepAchievements({ ...state, totalXP, fx });
    }

    case "IMPORT_SAVE": {
      // The payload has already been validated + migrated by services/backup.
      const base = { ...freshState(), ...action.save };
      base.fx = {
        ...state.fx,
        toasts: [
          ...state.fx.toasts,
          {
            id: ++toastId,
            kind: "system",
            title: "BACKUP RESTORED",
            desc: `${base.missions.length} missions · ${base.history.length} cleared · ${base.habits.length} habits`,
            color: "#10b981",
          },
        ],
      };
      return rollover(base);
    }

    case "RESET_SAVE":
      return rollover(seedAchievements(freshState()));

    default:
      return state;
  }
}

/* ---------------- hook ---------------- */
/**
 * @param {object|null} initialSave  cloud save loaded from Firestore (null = new hunter)
 * @param {(state: object) => void} onPersist  called (debounced) with the fx-stripped state
 */
export function useGameState(initialSave, onPersist) {
  const [state, dispatch] = useReducer(reducer, initialSave, loadState);
  const saveTimer = useRef(null);
  const persistRef = useRef(onPersist);
  persistRef.current = onPersist;

  /* persist to Firestore (debounced, fx excluded) */
  useEffect(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const { fx, ...persist } = state;
      persistRef.current?.(persist);
    }, 600);
    return () => clearTimeout(saveTimer.current);
  }, [state]);

  /* watch for real day change while the app stays open */
  useEffect(() => {
    const t = setInterval(() => dispatch({ type: "TICK" }), 30_000);
    return () => clearInterval(t);
  }, []);

  /* ---------- derived ---------- */
  const levelInfo = useMemo(() => getLevelInfo(state.totalXP), [state.totalXP]);
  const rankIndex = rankIndexForStreak(state.streak);
  const rank = HUNTER_RANKS[rankIndex];

  const dailyMissions = useMemo(
    () => state.dailySelected.map((id) => state.missions.find((m) => m.id === id)).filter(Boolean),
    [state.dailySelected, state.missions]
  );
  const dailyDone = dailyMissions.filter((m) => m.status === "completed").length;

  const stats = useMemo(() => {
    const today = localISO();
    const weekAgo = addDaysISO(today, -6);
    const monthAgo = addDaysISO(today, -29);
    const weeklyXP = state.history
      .filter((h) => h.completedAt >= weekAgo)
      .reduce((s, h) => s + h.xp, 0);
    const monthlyXP = state.history
      .filter((h) => h.completedAt >= monthAgo)
      .reduce((s, h) => s + h.xp, 0);
    const active = state.missions.filter((m) => m.status === "active").length;
    const completedToday = state.missions.filter((m) => m.status === "completed").length;
    const totalSeen = state.history.length + active;
    return {
      active,
      completedToday,
      totalCompleted: state.history.length,
      weeklyXP,
      monthlyXP,
      completionRate: totalSeen === 0 ? 0 : state.history.length / totalSeen,
    };
  }, [state.missions, state.history]);

  /* XP per day for the last 7 days (chart data) */
  const weeklySeries = useMemo(() => {
    const today = localISO();
    return Array.from({ length: 7 }, (_, i) => {
      const day = addDaysISO(today, i - 6);
      const xp = state.history
        .filter((h) => h.completedAt === day)
        .reduce((s, h) => s + h.xp, 0);
      return { day, xp };
    });
  }, [state.history]);

  /* ---------- actions ---------- */
  const actions = useMemo(
    () => ({
      addMission: (data) => dispatch({ type: "ADD_MISSION", data }),
      updateSettings: (patch) => dispatch({ type: "UPDATE_SETTINGS", patch }),
      updateMission: (id, patch) => dispatch({ type: "UPDATE_MISSION", id, patch }),
      reorderMissions: (orderedIds) => dispatch({ type: "REORDER_MISSIONS", orderedIds }),
      moveMission: (id, dueDate) => dispatch({ type: "MOVE_MISSION", id, dueDate }),
      addHabit: (data) => dispatch({ type: "ADD_HABIT", data }),
      updateHabit: (id, patch) => dispatch({ type: "UPDATE_HABIT", id, patch }),
      deleteHabit: (id) => dispatch({ type: "DELETE_HABIT", id }),
      toggleHabitDay: (id, day) => dispatch({ type: "TOGGLE_HABIT_DAY", id, day }),
      reorderHabits: (orderedIds) => dispatch({ type: "REORDER_HABITS", orderedIds }),
      skipOccurrence: (id) => dispatch({ type: "SKIP_OCCURRENCE", id }),
      setRecurrencePaused: (id, paused) =>
        dispatch({ type: "SET_RECURRENCE_PAUSED", id, paused }),
      deleteMission: (id) => dispatch({ type: "DELETE_MISSION", id }),
      completeMission: (id) => dispatch({ type: "COMPLETE_MISSION", id }),
      toggleDaily: (id) => dispatch({ type: "TOGGLE_DAILY", id }),
      dismissFx: (key) => dispatch({ type: "DISMISS_FX", key }),
      dismissToast: (id) => dispatch({ type: "DISMISS_TOAST", id }),
      simNextDay: () => dispatch({ type: "SIM_NEXT_DAY" }),
      simAddStreak: (days) => dispatch({ type: "SIM_ADD_STREAK", days }),
      simAddXP: (xp) => dispatch({ type: "SIM_ADD_XP", xp }),
      importSave: (save) => dispatch({ type: "IMPORT_SAVE", save }),
      resetSave: () => dispatch({ type: "RESET_SAVE" }),
    }),
    []
  );

  const defaultMissionXP = missionXPForLevel(levelInfo.level);

  return {
    state,
    actions,
    levelInfo,
    rank,
    rankIndex,
    dailyMissions,
    dailyDone,
    stats,
    weeklySeries,
    defaultMissionXP,
  };
}
