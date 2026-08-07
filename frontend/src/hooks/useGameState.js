import { useEffect, useMemo, useReducer, useRef } from "react";
import {
  getLevelInfo,
  missionXPForLevel,
  rankIndexForStreak,
  HUNTER_RANKS,
} from "../game/constants";
import { reducer } from "../state/reducer";
import { loadState } from "../state/initialState";
import { createActions } from "../state/actions";
import { selectDailyMissions, selectStats, selectWeeklySeries } from "../state/selectors";

/** How long to wait after the last change before writing to the cloud. */
const SAVE_DEBOUNCE_MS = 600;
/** How often to check whether the real-world day has turned over. */
const TICK_MS = 30_000;

/**
 * The game state hook: reducer, persistence and every derived value the
 * UI reads.
 *
 * @param {object|null} initialSave  cloud save loaded from Firestore (null = new hunter)
 * @param {(state: object) => void} onPersist  called (debounced) with the fx-stripped state
 */
export function useGameState(initialSave, onPersist) {
  const [state, dispatch] = useReducer(reducer, initialSave, loadState);

  const saveTimer = useRef(null);
  const persistRef = useRef(onPersist);
  persistRef.current = onPersist;

  /* persist to the cloud (debounced, transient fx excluded) */
  useEffect(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const { fx, ...persist } = state;
      persistRef.current?.(persist);
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(saveTimer.current);
  }, [state]);

  /* watch for a real day change while the app stays open */
  useEffect(() => {
    const timer = setInterval(() => dispatch({ type: "TICK" }), TICK_MS);
    return () => clearInterval(timer);
  }, []);

  /* ---------- derived ---------- */
  const levelInfo = useMemo(() => getLevelInfo(state.totalXP), [state.totalXP]);
  const rankIndex = rankIndexForStreak(state.streak);
  const rank = HUNTER_RANKS[rankIndex];

  const dailyMissions = useMemo(
    () => selectDailyMissions(state),
    [state.dailySelected, state.missions] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const dailyDone = dailyMissions.filter((m) => m.status === "completed").length;

  const stats = useMemo(
    () => selectStats(state),
    [state.missions, state.history] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const weeklySeries = useMemo(
    () => selectWeeklySeries(state),
    [state.history] // eslint-disable-line react-hooks/exhaustive-deps
  );

  /* Stable for the lifetime of the mount, so memoised children below don't
     re-render just because a handler identity changed. */
  const actions = useMemo(() => createActions(dispatch), []);

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
    defaultMissionXP: missionXPForLevel(levelInfo.level),
  };
}
