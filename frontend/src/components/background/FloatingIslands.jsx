import { motion, useReducedMotion } from "framer-motion";

/* original floating-rock silhouettes: jagged top, tapering root, trailing debris */
function Island({ className, bob = 10, duration = 11, delay = 0, aura, flip = false }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.svg
      className={`absolute pointer-events-none ${className}`}
      viewBox="0 0 260 200"
      preserveAspectRatio="xMidYMid meet"
      style={flip ? { scaleX: -1 } : undefined}
      animate={reducedMotion ? { opacity: 0.5 } : { y: [0, -bob, 0], opacity: [0.42, 0.6, 0.42] }}
      transition={{ duration, repeat: Infinity, delay, ease: "easeInOut" }}
      aria-hidden
    >
      {/* main rock body */}
      <path
        d="M46 62 L88 44 L142 52 L196 40 L224 66 L206 92 C192 128 168 158 138 176 C120 160 104 136 92 108 L64 96 Z"
        fill="rgba(4,8,18,0.92)"
      />
      {/* moonlit rim */}
      <path d="M46 62 L88 44 L142 52 L196 40 L224 66" fill="none" stroke="rgba(148,163,184,0.28)" strokeWidth="1.6" />
      {/* arcane vein glow underneath */}
      <path d="M104 120 C118 142 128 158 138 172" fill="none" stroke={aura} strokeWidth="2.4" style={{ filter: `drop-shadow(0 0 6px ${aura})` }} />
      {/* trailing debris chunks */}
      <path d="M120 186 L132 180 L140 188 L130 195 Z" fill="rgba(4,8,18,0.85)" />
      <path d="M96 178 L104 174 L108 181 L100 185 Z" fill="rgba(4,8,18,0.8)" />
      <circle cx="150" cy="192" r="2.4" fill="rgba(4,8,18,0.8)" />
    </motion.svg>
  );
}

export default function FloatingIslands({ rank }) {
  const aura = rank?.aura ?? "rgba(124,58,237,0.5)";

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      <Island className="left-[3%] top-[16%] h-36 w-48 blur-[1px]" bob={12} duration={13} aura={aura} />
      <Island className="right-[5%] top-[30%] h-28 w-40 blur-[1.5px]" bob={9} duration={16} delay={2.4} aura={aura} flip />
      <Island className="left-[38%] top-[7%] h-20 w-32 blur-[2px]" bob={7} duration={19} delay={4.8} aura={aura} />
    </div>
  );
}
