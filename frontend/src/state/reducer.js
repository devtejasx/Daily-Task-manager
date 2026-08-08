/* =========================================================
   Game reducer

   The single source of truth for every state transition: missions,
   the daily quest, recurrence, habits, XP, achievements and the
   transient FX queue. Kept free of React so it can be exercised
   directly from tests.
   ========================================================= */

import {
  localISO,
  addDaysISO,
  getLevelInfo,
  DAILY_REQUIRED,
  SHIELD_MAX,
  COMEBACK_XP,
  shieldsEarnedAt,
} from "../game/constants";
import { nextId } from "../data/missions";
import { buildNextOccurrence, nextOccurrenceISO } from "../utils/recurrence";
import { toggleDay, currentStreak } from "../utils/habits";
import { creditXP, refundXP, dailyQuestXP } from "../game/xp";
import {
  mergeSettings,
  normalizeMission,
  normalizeHabit,
  normalizeQuestDays,
} from "../services/migration";
import { freshState, freshFx } from "./initialState";
import {
  nextToastId,
  rollover,
  seedAchievements,
  sweepAchievements,
  seedRank,
  promoteRank,
  seedTitles,
  sweepTitles,
} from "./helpers";
import { titleById } from "../game/titles";

/* ---------------- reducer ---------------- */
export function reducer(state, action) {
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
              id: nextToastId(),
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
              id: nextToastId(),
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

      // XP is credited against what today has already paid out. An honest
      // day never meets the cap; a day spent manufacturing missions does.
      // `dayXP` tracks the RAW total attempted, which is what the bands are
      // measured against — see game/xp.
      const award = creditXP(mission.xp, state.dayXP ?? 0);
      const totalXP = state.totalXP + award.credited;
      const dayXP = (state.dayXP ?? 0) + award.raw;

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
        dayXP,
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
          id: nextToastId(),
          kind: "mission",
          title: "MISSION CLEARED",
          // Damping is stated as a fact about the day, never as a penalty
          // and never as a limit the hunter is warned they are approaching.
          desc: award.damped
            ? `${mission.title} · +${award.credited} XP · a full day's climb already — tomorrow pays in full`
            : `${mission.title} · +${award.credited} XP`,
          color: "#06b6d4",
        },
      ];
      let fx = { ...state.fx, toasts };

      /* daily quest progress */
      if (state.dailySelected.includes(mission.id)) {
        const doneCount = next.missions.filter(
          (m) => state.dailySelected.includes(m.id) && m.status === "completed"
        ).length;
        if (doneCount >= DAILY_REQUIRED && !state.dayComplete) {
          // A preserved streak is reclaimed in full — the missed day costs the
          // hunter a shield's worth of buffer, never the climb itself.
          const reclaiming = state.recovery;
          const streak = (reclaiming ? reclaiming.streak : state.streak) + 1;
          const longestStreak = Math.max(state.longestStreak, streak);

          // Consistency banks Resolve: every SHIELD_EVERY cleared days forges
          // a shield, up to the cap. Showing up is what earns the buffer.
          const held = state.shields ?? 0;
          const forged = shieldsEarnedAt(streak);
          const shields = Math.min(SHIELD_MAX, held + forged);

          // Clearing the quest pays. It is the single most important action
          // in the game and it used to be the only one with no reward on it.
          const questAward = creditXP(dailyQuestXP(streak), next.dayXP);

          next = {
            ...next,
            streak,
            longestStreak,
            dayComplete: true,
            shields,
            recovery: null,
            totalXP: next.totalXP + questAward.credited,
            dayXP: next.dayXP + questAward.raw,
            // The ledger the timeline and the weekly challenge read.
            questDays: normalizeQuestDays([...(state.questDays ?? []), localISO()]),
          };

          fx.toasts = [
            ...fx.toasts,
            {
              id: nextToastId(),
              kind: "daily",
              title: "DAILY QUEST COMPLETE",
              desc: reclaiming
                ? `All ${DAILY_REQUIRED} missions cleared · +${questAward.credited} XP · you're back`
                : `All ${DAILY_REQUIRED} missions cleared · +${questAward.credited} XP · Streak +1 → ${streak} days`,
              color: "#10b981",
            },
          ];

          // The comeback pays: the whole preserved climb returns, plus a bonus
          // for showing up on the day it mattered most.
          if (reclaiming) {
            const comebackAward = creditXP(COMEBACK_XP, next.dayXP);
            next.totalXP += comebackAward.credited;
            next.dayXP += comebackAward.raw;
            next.comebacks = (state.comebacks ?? 0) + 1;
            fx.recovered = { streak };
            fx.toasts = [
              ...fx.toasts,
              {
                id: nextToastId(),
                kind: "recovery",
                title: "STREAK RECOVERED",
                desc: `${streak} days restored · +${comebackAward.credited} XP for coming back`,
                color: "#a78bfa",
              },
            ];
          }

          if (shields > held) {
            fx.toasts = [
              ...fx.toasts,
              {
                id: nextToastId(),
                kind: "shield",
                title: "STREAK SHIELD FORGED",
                desc: `${streak} days of Resolve · ${shields}/${SHIELD_MAX} held — one missed day can't break you`,
                color: "#38bdf8",
              },
            ];
          }
        }
      }

      // One level check, after every award this clear could produce — the
      // mission, the quest bonus and the comeback can each tip the hunter
      // over a boundary, and three separate checks would fire three
      // cinematics for one moment.
      const levelAfter = getLevelInfo(next.totalXP).level;
      if (levelAfter > levelBefore) fx.levelUp = { from: levelBefore, to: levelAfter };

      // Rank is evaluated last, against the state this clear produced, so a
      // promotion reflects the mission that earned it rather than the one
      // before it.
      return promoteRank(sweepTitles(sweepAchievements({ ...next, fx })));
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

      const today = localISO();
      const day = action.day ?? today;
      const wasDone = Boolean(habit.log?.[day]);
      const next = toggleDay(habit, day);

      // Ticking awards the habit's XP; un-ticking takes it straight back, so a
      // mis-click can never inflate the hunter's level. The refund reverses
      // what was actually PAID rather than the nominal value, so a tick and
      // an un-tick across the daily cap cannot mint XP.
      //
      // Only today's ticks count toward the cap. Back-filling a habit is
      // bounded by the calendar — one tick per habit per day — so it needs no
      // guard of its own, and damping it would punish honest catch-up.
      const isToday = day === today;
      const earned = state.dayXP ?? 0;
      const award = isToday ? creditXP(habit.xp, earned) : { credited: habit.xp, raw: habit.xp };
      const refund = isToday ? refundXP(habit.xp, earned) : habit.xp;

      const delta = wasDone ? -refund : award.credited;
      const dayDelta = isToday ? (wasDone ? -habit.xp : award.raw) : 0;

      const levelBefore = getLevelInfo(state.totalXP).level;
      const totalXP = Math.max(0, state.totalXP + delta);
      const dayXP = Math.max(0, earned + dayDelta);
      const levelAfter = getLevelInfo(totalXP).level;

      const fx = { ...state.fx };
      if (levelAfter > levelBefore) fx.levelUp = { from: levelBefore, to: levelAfter };
      if (!wasDone) {
        const streak = currentStreak(next, day);
        fx.toasts = [
          ...state.fx.toasts,
          {
            id: nextToastId(),
            kind: "habit",
            title: "HABIT LOGGED",
            desc: `${habit.title} · +${award.credited} XP${streak > 1 ? ` · ${streak}-day streak` : ""}`,
            color: habit.color,
          },
        ];
      }

      return promoteRank(
        sweepTitles(
          sweepAchievements({
            ...state,
            totalXP,
            dayXP,
            habits: state.habits.map((h) => (h.id === action.id ? next : h)),
            fx,
          })
        )
      );
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

    case "SET_TITLE": {
      // Only a title the hunter has actually unlocked can be worn, and null
      // always works — choosing to wear nothing is a valid choice.
      if (action.id === null) return { ...state, activeTitle: null };
      if (!titleById(action.id) || !state.titles?.[action.id]) return state;
      return { ...state, activeTitle: action.id };
    }

    case "DISMISS_FX":
      // Reset the slot to whatever "nothing to show" means for it (null for
      // payload cinematics, false for flags) rather than hard-coding keys.
      return { ...state, fx: { ...state.fx, [action.key]: freshFx()[action.key] ?? false } };

    case "PUSH_TOAST": {
      // Errors are keyed so a failing retry loop replaces its own toast
      // instead of stacking a new one every attempt.
      const key = action.toast.key;
      const existing = key
        ? state.fx.toasts.filter((t) => t.key !== key)
        : state.fx.toasts;
      return {
        ...state,
        fx: { ...state.fx, toasts: [...existing, { id: nextToastId(), ...action.toast }] },
      };
    }

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
      return promoteRank(sweepTitles(sweepAchievements({ ...state, streak, longestStreak })));
    }

    case "SIM_ADD_XP": {
      const levelBefore = getLevelInfo(state.totalXP).level;
      const totalXP = state.totalXP + action.xp;
      const levelAfter = getLevelInfo(totalXP).level;
      const fx = { ...state.fx };
      if (levelAfter > levelBefore) fx.levelUp = { from: levelBefore, to: levelAfter };
      return promoteRank(sweepTitles(sweepAchievements({ ...state, totalXP, fx })));
    }

    case "IMPORT_SAVE": {
      // The payload has already been validated + migrated by services/backup.
      const base = { ...freshState(), ...action.save };
      base.fx = {
        ...state.fx,
        toasts: [
          ...state.fx.toasts,
          {
            id: nextToastId(),
            kind: "system",
            title: "BACKUP RESTORED",
            desc: `${base.missions.length} missions · ${base.history.length} cleared · ${base.habits.length} habits`,
            color: "#10b981",
          },
        ],
      };
      return rollover(seedTitles(seedRank(base)));
    }

    case "RESET_SAVE":
      return rollover(seedTitles(seedRank(seedAchievements(freshState()))));

    default:
      return state;
  }
}

export default reducer;
