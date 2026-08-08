import { useMemo } from "react";

/**
 * Wraps every state-changing action in the auth gate.
 *
 * A signed-in hunter's action runs immediately; a guest gets the login
 * modal and the action is withheld — enforcement proper lives in the
 * Firestore security rules, this is the UX half.
 *
 * The returned object is memoised on `actions` and `requireAuth`, both of
 * which are stable for the lifetime of the mount, so every handler keeps
 * its identity across renders and the memoised mission cards below don't
 * re-render on a countdown tick or a toast.
 *
 * @param {object} actions      dispatchers from useGameState
 * @param {(fn: Function, intent?: string) => boolean} requireAuth
 */
export function useProtectedActions(actions, requireAuth) {
  return useMemo(
    () => ({
      complete: (id) => requireAuth(() => actions.completeMission(id)),
      remove: (id) => requireAuth(() => actions.deleteMission(id)),
      toggleDaily: (id) => requireAuth(() => actions.toggleDaily(id)),
      skipOccurrence: (id) => requireAuth(() => actions.skipOccurrence(id)),
      reorder: (orderedIds) => requireAuth(() => actions.reorderMissions(orderedIds)),
      setRecurrencePaused: (id, paused) =>
        requireAuth(() => actions.setRecurrencePaused(id, paused)),
      moveMission: (id, dueDate) => requireAuth(() => actions.moveMission(id, dueDate)),

      // Progression choices a guest can't persist, gated like the rest.
      setTitle: (id) => requireAuth(() => actions.setTitle(id)),
      acceptBoss: () => requireAuth(actions.acceptBoss),

      addHabit: (data) => requireAuth(() => actions.addHabit(data)),
      deleteHabit: (id) => requireAuth(() => actions.deleteHabit(id)),
      toggleHabitDay: (id, day) => requireAuth(() => actions.toggleHabitDay(id, day)),

      updateSettings: (patch) => requireAuth(() => actions.updateSettings(patch)),
      importSave: (save) => requireAuth(() => actions.importSave(save)),

      sim: {
        nextDay: () => requireAuth(actions.simNextDay),
        addStreak: (days) => requireAuth(() => actions.simAddStreak(days)),
        addXP: (xp) => requireAuth(() => actions.simAddXP(xp)),
        reset: () => requireAuth(actions.resetSave),
      },
    }),
    [actions, requireAuth]
  );
}
