/* =========================================================
   Action creators

   One thin object of dispatchers. Built once per mount and kept
   stable, so every handler passed down to a memoised component
   holds its identity across renders.
   ========================================================= */

export function createActions(dispatch) {
  return {
    /* ---- missions ---- */
    addMission: (data) => dispatch({ type: "ADD_MISSION", data }),
    updateMission: (id, patch) => dispatch({ type: "UPDATE_MISSION", id, patch }),
    deleteMission: (id) => dispatch({ type: "DELETE_MISSION", id }),
    completeMission: (id) => dispatch({ type: "COMPLETE_MISSION", id }),
    reorderMissions: (orderedIds) => dispatch({ type: "REORDER_MISSIONS", orderedIds }),
    moveMission: (id, dueDate) => dispatch({ type: "MOVE_MISSION", id, dueDate }),

    /* ---- daily quest ---- */
    toggleDaily: (id) => dispatch({ type: "TOGGLE_DAILY", id }),

    /* ---- recurring series ---- */
    skipOccurrence: (id) => dispatch({ type: "SKIP_OCCURRENCE", id }),
    setRecurrencePaused: (id, paused) => dispatch({ type: "SET_RECURRENCE_PAUSED", id, paused }),

    /* ---- habits ---- */
    addHabit: (data) => dispatch({ type: "ADD_HABIT", data }),
    updateHabit: (id, patch) => dispatch({ type: "UPDATE_HABIT", id, patch }),
    deleteHabit: (id) => dispatch({ type: "DELETE_HABIT", id }),
    toggleHabitDay: (id, day) => dispatch({ type: "TOGGLE_HABIT_DAY", id, day }),
    reorderHabits: (orderedIds) => dispatch({ type: "REORDER_HABITS", orderedIds }),

    /* ---- settings & data ---- */
    updateSettings: (patch) => dispatch({ type: "UPDATE_SETTINGS", patch }),
    importSave: (save) => dispatch({ type: "IMPORT_SAVE", save }),
    resetSave: () => dispatch({ type: "RESET_SAVE" }),

    /* ---- cinematics & toasts ---- */
    dismissFx: (key) => dispatch({ type: "DISMISS_FX", key }),
    dismissToast: (id) => dispatch({ type: "DISMISS_TOAST", id }),
    pushToast: (toast) => dispatch({ type: "PUSH_TOAST", toast }),

    /* ---- chrono simulation (Settings -> testing chamber) ---- */
    simNextDay: () => dispatch({ type: "SIM_NEXT_DAY" }),
    simAddStreak: (days) => dispatch({ type: "SIM_ADD_STREAK", days }),
    simAddXP: (xp) => dispatch({ type: "SIM_ADD_XP", xp }),
  };
}
