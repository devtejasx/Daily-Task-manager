import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

/* Elder Futhark glyphs — an ancient public-domain alphabet, no copyrighted symbols */
const GLYPHS = ["ᚠ", "ᚢ", "ᚦ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᛁ", "ᛃ", "ᛈ", "ᛉ", "ᛊ", "ᛏ", "ᛟ"];

function prand(i, salt = 1) {
  const v = Math.sin(i * 269.5 + salt * 183.3) * 43758.5453;
  return v - Math.floor(v);
}

export default function RuneField({ rank }) {
  const reducedMotion = useReducedMotion();
  const color = rank?.color ?? "#a78bfa";
  const aura = rank?.aura ?? "rgba(124,58,237,0.4)";

  const runes = useMemo(
    () =>
      GLYPHS.map((glyph, i) => ({
        glyph,
        left: 4 + prand(i, 1) * 92,
        top: 8 + prand(i, 2) * 76,
        size: 13 + prand(i, 3) * 15,
        cyan: prand(i, 4) > 0.7,
        duration: 7 + prand(i, 5) * 8,
        delay: prand(i, 6) * 5,
        drift: 10 + prand(i, 7) * 14,
      })),
    []
  );

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      {runes.map((r, i) => (
        <motion.span
          key={i}
          className="absolute font-display select-none"
          style={{
            left: `${r.left}%`,
            top: `${r.top}%`,
            fontSize: r.size,
            color: r.cyan ? "#67e8f9" : color,
            textShadow: `0 0 12px ${r.cyan ? "rgba(6,182,212,0.7)" : aura}`,
          }}
          animate={
            reducedMotion
              ? { opacity: 0.3 }
              : { y: [0, -r.drift, 0], opacity: [0.12, 0.55, 0.12], rotate: [0, prand(i, 8) > 0.5 ? 8 : -8, 0] }
          }
          transition={{ duration: r.duration, repeat: Infinity, delay: r.delay, ease: "easeInOut" }}
        >
          {r.glyph}
        </motion.span>
      ))}

      {/* rotating energy circles — reuse the ring-spin keyframes from index.css */}
      <div
        className="absolute left-[12%] top-[34%] h-40 w-40 rounded-full border opacity-30"
        style={{
          borderColor: `${color}55`,
          boxShadow: `0 0 30px ${aura}, inset 0 0 22px ${aura}`,
          animation: "ring-spin 26s linear infinite",
          background: `conic-gradient(from 90deg, transparent 70%, ${color}33, transparent 92%)`,
        }}
      />
      <div
        className="absolute right-[9%] top-[22%] h-28 w-28 rounded-full border opacity-25"
        style={{
          borderColor: "rgba(6,182,212,0.35)",
          boxShadow: "0 0 26px rgba(6,182,212,0.3), inset 0 0 18px rgba(6,182,212,0.2)",
          animation: "ring-spin-rev 20s linear infinite",
          background: "conic-gradient(from 0deg, transparent 74%, rgba(6,182,212,0.22), transparent 94%)",
        }}
      />
    </div>
  );
}
