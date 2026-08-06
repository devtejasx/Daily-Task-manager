import { useEffect, useRef, useState } from "react";

/**
 * Smoothly animates a number toward `target` with an ease-out curve.
 * Re-animates from the current displayed value whenever `target` changes.
 *
 * @param {number} target
 * @param {number} [duration]  ms
 * @param {number} [decimals]  decimal places to keep (0 = whole numbers)
 */
export function useCountUp(target, duration = 1200, decimals = 0) {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const delta = target - from;
    if (delta === 0) return;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = from + delta * eased;
      setValue(next);
      fromRef.current = next;
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  if (decimals <= 0) return Math.round(value);
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
