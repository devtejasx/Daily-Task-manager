import { motion, useReducedMotion } from "framer-motion";

export default function EnergyEffects({ rank, intensity = 1 }) {
  const reducedMotion = useReducedMotion();
  const aura = rank?.aura ?? "rgba(124,58,237,0.35)";
  const color = rank?.color ?? "#7c3aed";

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      <motion.div
        className="absolute left-1/2 top-[18%] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle, ${aura}, transparent 72%)` }}
        animate={reducedMotion ? { opacity: 0.18 } : { opacity: [0.12, 0.28, 0.12], scale: [0.96, 1.04, 0.96] }}
        transition={{ duration: 10 / intensity, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-[8%] top-[6%] h-[120%] w-[26%] blur-3xl"
        style={{ background: "linear-gradient(180deg, transparent, rgba(59,130,246,0.12), transparent)" }}
        animate={reducedMotion ? { opacity: 0.2 } : { x: [0, 18, 0], rotate: [10, 14, 10], opacity: [0.08, 0.18, 0.08] }}
        transition={{ duration: 24 / intensity, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[14%] top-[8%] h-[120%] w-[24%] blur-3xl"
        style={{ background: "linear-gradient(180deg, transparent, rgba(6,182,212,0.08), transparent)" }}
        animate={reducedMotion ? { opacity: 0.16 } : { x: [0, -16, 0], rotate: [-8, -12, -8], opacity: [0.08, 0.16, 0.08] }}
        transition={{ duration: 28 / intensity, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute inset-x-0 top-[34%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={reducedMotion ? { opacity: 0.2 } : { opacity: [0.08, 0.18, 0.08], scaleX: [0.96, 1.04, 0.96] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-x-0 top-[46%] h-px bg-gradient-to-r from-transparent via-violet-400/10 to-transparent"
        animate={reducedMotion ? { opacity: 0.12 } : { opacity: [0.05, 0.14, 0.05], scaleX: [0.98, 1.03, 0.98] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 1440 900" preserveAspectRatio="none">
        <path
          d="M120,780 L160,700 L145,640 L220,570 L198,520 L250,470"
          fill="none"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${aura})` }}
        />
        <path
          d="M1320,820 L1280,750 L1300,690 L1260,620 L1280,560"
          fill="none"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${aura})` }}
        />
      </svg>
    </div>
  );
}