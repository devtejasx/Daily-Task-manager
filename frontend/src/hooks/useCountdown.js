import { useEffect, useState } from "react";
import { HOUR_MS, MINUTE_MS } from "../utils/date";

/**
 * Live milliseconds remaining until `target`.
 *
 * The tick rate adapts to how close the deadline is so a board full of
 * missions due next month doesn't re-render every second:
 *   < 1 hour away -> every second
 *   otherwise     -> every 30 seconds
 *
 * @param {Date|number|null} target
 * @param {boolean} enabled  pass false to freeze the timer entirely
 * @returns {number|null} ms remaining (negative once the deadline passed)
 */
export function useCountdown(target, enabled = true) {
  const targetMs = target instanceof Date ? target.getTime() : target;
  const [remaining, setRemaining] = useState(() =>
    targetMs == null ? null : targetMs - Date.now()
  );

  useEffect(() => {
    if (!enabled || targetMs == null) {
      setRemaining(null);
      return undefined;
    }

    const compute = () => targetMs - Date.now();
    setRemaining(compute());

    const interval = Math.abs(compute()) < HOUR_MS ? 1000 : 30 * 1000;
    const id = window.setInterval(() => setRemaining(compute()), interval);
    return () => window.clearInterval(id);
    // Re-arming on `remaining` would restart the interval every tick, so the
    // rate is only re-evaluated when the target itself changes — close enough,
    // and it keeps long-range countdowns cheap.
  }, [targetMs, enabled]);

  return remaining;
}

/** Convenience: true once the countdown has gone negative. */
export function isElapsed(remaining) {
  return remaining != null && remaining <= 0;
}

export { MINUTE_MS, HOUR_MS };
