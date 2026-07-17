import { motion } from "framer-motion";
import { useCountUp } from "../hooks/useCountUp";

export default function ProgressRing({ progress, size = 150, stroke = 9, label = "CLEARED" }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = useCountUp(Math.round(progress * 100));

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="55%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - progress) }}
          transition={{ type: "spring", stiffness: 45, damping: 16 }}
          style={{ filter: "drop-shadow(0 0 8px rgba(6,182,212,0.6))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-bold text-cyan-300 text-glow-holo">
          {pct}%
        </span>
        <span className="text-[10px] tracking-[0.25em] text-slate-400 font-semibold mt-1">
          {label}
        </span>
      </div>
    </div>
  );
}
