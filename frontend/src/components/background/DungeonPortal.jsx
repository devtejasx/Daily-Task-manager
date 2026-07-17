import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const SYMBOLS = ["◈", "◇", "△", "▽", "◁", "▷", "☰", "☲", "✦", "✧"];

export default function DungeonPortal({ rank, signal = 0, className = "" }) {
  const reducedMotion = useReducedMotion();
  const color = rank?.color ?? "#7c3aed";
  const aura = rank?.aura ?? "rgba(124,58,237,0.35)";
  const [flash, setFlash] = useState(0);

  useEffect(() => {
    let mounted = true;
    let timeoutId = 0;

    const schedule = () => {
      const delay = reducedMotion ? 7000 : 2800 + Math.random() * 4200;
      timeoutId = window.setTimeout(() => {
        if (!mounted) return;
        setFlash((value) => value + 1);
        schedule();
      }, delay);
    };

    schedule();
    return () => {
      mounted = false;
      window.clearTimeout(timeoutId);
    };
  }, [reducedMotion]);

  const symbols = useMemo(() => SYMBOLS.map((symbol, index) => ({ symbol, index })), []);

  return (
    <div className={`absolute pointer-events-none ${className}`} aria-hidden>
      <motion.div
        className="absolute left-1/2 top-[13%] h-[38rem] w-[38rem] max-w-[90vw] -translate-x-1/2 rounded-full"
        style={{
          background: `conic-gradient(from 180deg, transparent, ${color}cc, rgba(6,182,212,0.8), transparent 34%, ${color}66, transparent 76%, rgba(6,182,212,0.55), transparent)`,
          filter: "blur(18px)",
        }}
        animate={reducedMotion ? { opacity: 0.72 } : { rotate: 360, opacity: [0.55, 0.9, 0.55], scale: [0.98, 1.03, 0.98] }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        className="absolute left-1/2 top-[19%] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full border"
        style={{ borderColor: `${color}66`, boxShadow: `0 0 46px ${aura}, inset 0 0 34px ${aura}` }}
        animate={reducedMotion ? {} : { rotate: -360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        className="absolute left-1/2 top-[28%] h-[16rem] w-[16rem] -translate-x-1/2 rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(15,10,40,0.96) 24%, ${color}44 68%, transparent 80%)`,
          boxShadow: `0 0 80px ${aura}, inset 0 0 42px ${aura}`,
        }}
        animate={reducedMotion ? { opacity: 0.72 } : { scale: [0.98, 1.04, 0.98], opacity: [0.72, 1, 0.72] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute left-1/2 top-[14%] h-[41rem] w-[41rem] max-w-[94vw] -translate-x-1/2 rounded-full overflow-hidden">
        {symbols.map(({ symbol, index }) => {
          const angle = (index / symbols.length) * Math.PI * 2;
          const x = 50 + Math.cos(angle) * 36;
          const y = 50 + Math.sin(angle) * 36;
          return (
            <motion.span
              key={symbol}
              className="absolute font-display text-xl sm:text-2xl"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                color,
                textShadow: `0 0 14px ${aura}`,
              }}
              animate={reducedMotion ? { opacity: 0.5 } : { rotate: 180, opacity: [0.35, 0.88, 0.35], scale: [0.92, 1.08, 0.92] }}
              transition={{ duration: 8 + index, repeat: Infinity, ease: "easeInOut" }}
            >
              {symbol}
            </motion.span>
          );
        })}
      </div>

      <AnimatePresence>
        {flash > 0 && (
          <motion.div
            key={flash}
            className="absolute left-1/2 top-[18%] h-[30rem] w-[30rem] -translate-x-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.25) 0%, rgba(124,58,237,0.22) 24%, rgba(6,182,212,0.12) 48%, transparent 72%)",
              mixBlendMode: "screen",
            }}
            initial={{ opacity: 0, scale: 0.35 }}
            animate={{ opacity: [0, 1, 0], scale: [0.35, 1.12, 1.5] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      <svg className="absolute inset-0 w-full h-full opacity-70" viewBox="0 0 1440 900" preserveAspectRatio="none">
        <motion.path
          d="M940,160 C980,240 1040,270 1060,360"
          fill="none"
          stroke="rgba(167,139,250,0.6)"
          strokeWidth="1.8"
          strokeLinecap="round"
          animate={reducedMotion ? { opacity: 0.45 } : { opacity: [0.1, 0.8, 0], pathLength: [0, 1, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 4.5, ease: "easeOut" }}
          style={{ filter: "drop-shadow(0 0 10px rgba(124,58,237,0.9))" }}
        />
        <motion.path
          d="M500,180 C560,220 620,270 660,350"
          fill="none"
          stroke="rgba(6,182,212,0.55)"
          strokeWidth="1.6"
          strokeLinecap="round"
          animate={reducedMotion ? { opacity: 0.38 } : { opacity: [0.1, 0.72, 0], pathLength: [0, 1, 1] }}
          transition={{ duration: 1, repeat: Infinity, repeatDelay: 5.5, ease: "easeOut" }}
          style={{ filter: "drop-shadow(0 0 10px rgba(6,182,212,0.85))" }}
        />
      </svg>
    </div>
  );
}