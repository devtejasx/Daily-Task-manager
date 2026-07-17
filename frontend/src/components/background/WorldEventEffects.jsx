import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

function EffectWave({ color, opacity = 0.5, keyId, scale = 1, top = "50%" }) {
  return (
    <motion.div
      key={keyId}
      className="absolute left-1/2 -translate-x-1/2 rounded-full border"
      style={{
        top,
        width: "16rem",
        height: "16rem",
        borderColor: color,
        boxShadow: `0 0 48px ${color}66`,
      }}
      initial={{ opacity: 0, scale: 0.35 }}
      animate={{ opacity: [0, opacity, 0], scale: [0.35, scale, scale * 1.55] }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.1, ease: "easeOut" }}
    />
  );
}

export default function WorldEventEffects({ rank, missionPulse = 0, xpPulse = 0, levelPulse = 0, promotionPulse = 0 }) {
  const reducedMotion = useReducedMotion();
  const color = rank?.color ?? "#7c3aed";
  const aura = rank?.aura ?? "rgba(124,58,237,0.35)";
  const isHighRank = rank?.key === "S" || rank?.key === "NATIONAL";

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-screen" aria-hidden>
      <AnimatePresence>
        {missionPulse > 0 && (
          <motion.div
            key={`mission-${missionPulse}`}
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 44%, rgba(124,58,237,0.14), transparent 22%), radial-gradient(circle at 50% 52%, rgba(6,182,212,0.08), transparent 34%)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.15, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {xpPulse > 0 && (
          <motion.div
            key={`xp-${xpPulse}`}
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 60% 14%, rgba(167,139,250,0.16), transparent 18%), radial-gradient(circle at 72% 10%, rgba(6,182,212,0.12), transparent 24%)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.88, 0], x: [0, 2, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {levelPulse > 0 && (
          <motion.div
            key={`level-${levelPulse}`}
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(0,0,0,0.2), rgba(0,0,0,0.52) 45%, rgba(0,0,0,0.12) 62%, transparent 82%)",
            }}
            initial={{ opacity: 0 }}
            animate={reducedMotion ? { opacity: 0.4 } : { opacity: [0, 1, 0], scale: [1, 1.01, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {promotionPulse > 0 && (
          <motion.div
            key={`promo-${promotionPulse}`}
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 40%, ${aura}, transparent 28%), radial-gradient(circle at 50% 76%, rgba(245,158,11,0.08), transparent 40%)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.78, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {levelPulse > 0 && !reducedMotion && (
          <motion.div
            key={`shake-${levelPulse}`}
            className="absolute inset-0"
            initial={{ x: 0, y: 0 }}
            animate={{ x: [0, -3, 4, -2, 0], y: [0, 2, -3, 1, 0] }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {missionPulse > 0 && <EffectWave color={color} opacity={0.55} keyId={`m-wave-${missionPulse}`} scale={1.5} top="41%" />}
      {xpPulse > 0 && <EffectWave color="#06b6d4" opacity={0.4} keyId={`x-wave-${xpPulse}`} scale={1.34} top="18%" />}
      {promotionPulse > 0 && <EffectWave color={isHighRank ? "#f59e0b" : color} opacity={0.5} keyId={`p-wave-${promotionPulse}`} scale={1.65} top="46%" />}

      <motion.div
        className="absolute left-1/2 top-[14%] h-[22rem] w-[22rem] -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle, ${aura}, transparent 72%)` }}
        animate={reducedMotion ? { opacity: 0.12 } : { opacity: [0.08, 0.18, 0.08], scale: [0.96, 1.06, 0.96] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      <svg className="absolute inset-0 h-full w-full opacity-60" viewBox="0 0 1440 900" preserveAspectRatio="none">
        <motion.path
          d="M120 180 L220 260 L240 330"
          fill="none"
          stroke={color}
          strokeWidth="1.4"
          strokeLinecap="round"
          animate={reducedMotion ? { opacity: 0.3 } : { opacity: [0.1, 0.8, 0], pathLength: [0, 1, 1] }}
          transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 4.2, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 12px ${aura})` }}
        />
        <motion.path
          d="M1290 120 L1210 240 L1160 340"
          fill="none"
          stroke="rgba(6,182,212,0.6)"
          strokeWidth="1.2"
          strokeLinecap="round"
          animate={reducedMotion ? { opacity: 0.22 } : { opacity: [0.08, 0.72, 0], pathLength: [0, 1, 1] }}
          transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 5, ease: "easeOut" }}
          style={{ filter: "drop-shadow(0 0 12px rgba(6,182,212,0.85))" }}
        />
      </svg>
    </div>
  );
}