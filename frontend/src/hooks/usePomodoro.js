import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { POMODORO_DEFAULTS } from "../game/constants";
import { notify, playChime, requestPermissionOnce } from "../services/notifications";

export const PHASES = {
  work: { key: "work", label: "FOCUS", color: "#7c3aed", blurb: "Clear the gate. No distractions." },
  shortBreak: { key: "shortBreak", label: "SHORT BREAK", color: "#06b6d4", blurb: "Breathe. Mana regenerates." },
  longBreak: { key: "longBreak", label: "LONG BREAK", color: "#10b981", blurb: "Step away. You earned it." },
};

/**
 * Pomodoro timer.
 *
 * The countdown is derived from a wall-clock deadline rather than
 * decremented per tick, so a throttled background tab or a sleeping
 * laptop can't make the timer drift — it simply catches up on wake.
 *
 * @param {{work:number, shortBreak:number, longBreak:number, rounds:number}} durations  minutes
 * @param {{sound?: boolean, notifications?: boolean}} [options]
 */
export function usePomodoro(durations = POMODORO_DEFAULTS, options = {}) {
  const config = useMemo(() => ({ ...POMODORO_DEFAULTS, ...(durations || {}) }), [durations]);
  const { sound = true, notifications = true } = options;

  const [phase, setPhase] = useState("work");
  const [running, setRunning] = useState(false);
  const [round, setRound] = useState(1);
  const [completedRounds, setCompletedRounds] = useState(0);
  const [remaining, setRemaining] = useState(config.work * 60);

  // Absolute deadline while running; the remaining seconds while paused.
  const deadlineRef = useRef(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const phaseSeconds = useCallback(
    (which) => Math.max(1, Math.round((config[which] ?? 25) * 60)),
    [config]
  );

  /** Load a phase into the timer, optionally starting it immediately. */
  const loadPhase = useCallback(
    (which, autoStart = false) => {
      const seconds = phaseSeconds(which);
      setPhase(which);
      setRemaining(seconds);
      if (autoStart) {
        deadlineRef.current = Date.now() + seconds * 1000;
        setRunning(true);
      } else {
        deadlineRef.current = null;
        setRunning(false);
      }
    },
    [phaseSeconds]
  );

  /** What comes after the phase that just finished. */
  const nextPhase = useCallback(
    (finished, roundsDone) => {
      if (finished !== "work") return "work";
      return roundsDone % config.rounds === 0 ? "longBreak" : "shortBreak";
    },
    [config.rounds]
  );

  const handleFinish = useCallback(() => {
    const finished = phaseRef.current;
    const roundsDone = finished === "work" ? completedRounds + 1 : completedRounds;
    if (finished === "work") {
      setCompletedRounds(roundsDone);
      setRound((r) => r + 1);
    }

    const next = nextPhase(finished, roundsDone);
    if (sound) playChime(finished === "work" ? "success" : "alert");
    if (notifications) {
      notify(finished === "work" ? "FOCUS BLOCK COMPLETE" : "BREAK OVER", {
        body:
          finished === "work"
            ? `Round ${roundsDone} cleared. ${PHASES[next].label.toLowerCase()} next.`
            : "Back to the grind, Hunter.",
        tag: "pomodoro",
      });
    }
    // Breaks roll straight into focus; focus waits for a deliberate start.
    loadPhase(next, finished !== "work");
  }, [completedRounds, nextPhase, sound, notifications, loadPhase]);

  /* countdown loop — recomputed from the deadline every tick */
  useEffect(() => {
    if (!running || deadlineRef.current == null) return undefined;

    const tick = () => {
      const left = Math.round((deadlineRef.current - Date.now()) / 1000);
      if (left <= 0) {
        setRemaining(0);
        handleFinish();
        return;
      }
      setRemaining(left);
    };

    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [running, handleFinish]);

  /* a duration change while idle re-loads the current phase */
  useEffect(() => {
    if (running) return;
    setRemaining(phaseSeconds(phaseRef.current));
  }, [phaseSeconds, running]);

  const start = useCallback(() => {
    if (running) return;
    requestPermissionOnce();
    deadlineRef.current = Date.now() + remaining * 1000;
    setRunning(true);
  }, [running, remaining]);

  const pause = useCallback(() => {
    if (!running) return;
    setRemaining(Math.max(0, Math.round((deadlineRef.current - Date.now()) / 1000)));
    deadlineRef.current = null;
    setRunning(false);
  }, [running]);

  const toggle = useCallback(() => (running ? pause() : start()), [running, pause, start]);

  const reset = useCallback(() => {
    loadPhase(phaseRef.current, false);
  }, [loadPhase]);

  const resetAll = useCallback(() => {
    setRound(1);
    setCompletedRounds(0);
    loadPhase("work", false);
  }, [loadPhase]);

  const skip = useCallback(() => {
    const finished = phaseRef.current;
    const roundsDone = finished === "work" ? completedRounds + 1 : completedRounds;
    if (finished === "work") {
      setCompletedRounds(roundsDone);
      setRound((r) => r + 1);
    }
    loadPhase(nextPhase(finished, roundsDone), false);
  }, [completedRounds, nextPhase, loadPhase]);

  const total = phaseSeconds(phase);

  return {
    phase,
    meta: PHASES[phase],
    running,
    remaining,
    total,
    progress: total === 0 ? 0 : 1 - remaining / total,
    round,
    completedRounds,
    rounds: config.rounds,
    start,
    pause,
    toggle,
    reset,
    resetAll,
    skip,
    setPhase: (which) => loadPhase(which, false),
  };
}

/** mm:ss for the timer face. */
export function formatClock(seconds) {
  const safe = Math.max(0, Math.round(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
