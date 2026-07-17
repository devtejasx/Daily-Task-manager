import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

/* deterministic pseudo-random so stars never reshuffle between renders */
function prand(i, salt = 1) {
  const v = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return v - Math.floor(v);
}

export default function StarsNebula({ count = 64 }) {
  const reducedMotion = useReducedMotion();

  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: prand(i, 1) * 100,
        top: prand(i, 2) * 62, // keep stars in the upper sky
        size: 0.8 + prand(i, 3) * 1.8,
        color: prand(i, 4) > 0.72 ? "rgba(196,181,253,0.9)" : "rgba(226,232,240,0.85)",
        duration: 2.8 + prand(i, 5) * 5,
        delay: prand(i, 6) * 6,
        min: 0.08 + prand(i, 7) * 0.14,
        max: 0.5 + prand(i, 8) * 0.42,
      })),
    [count]
  );

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      {/* purple nebula banks, drifting almost imperceptibly */}
      <motion.div
        className="absolute left-[8%] top-[-6%] h-[44vh] w-[52vw] rounded-full blur-3xl"
        style={{ background: "radial-gradient(ellipse at 45% 50%, rgba(124,58,237,0.16), rgba(88,28,135,0.08) 52%, transparent 74%)" }}
        animate={reducedMotion ? { opacity: 0.5 } : { x: [0, 34, 0], opacity: [0.4, 0.62, 0.4] }}
        transition={{ duration: 64, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[2%] top-[2%] h-[36vh] w-[44vw] rounded-full blur-3xl"
        style={{ background: "radial-gradient(ellipse at 55% 45%, rgba(59,130,246,0.1), rgba(30,58,138,0.06) 55%, transparent 76%)" }}
        animate={reducedMotion ? { opacity: 0.4 } : { x: [0, -40, 0], opacity: [0.3, 0.52, 0.3] }}
        transition={{ duration: 78, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* twinkling stars — pure CSS animation, compositor friendly */}
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            background: s.color,
            boxShadow: `0 0 ${s.size * 3}px ${s.color}`,
            "--tw-min": s.min,
            "--tw-max": s.max,
            animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
