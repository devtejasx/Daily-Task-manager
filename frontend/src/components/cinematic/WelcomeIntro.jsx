import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ParticleBackground, EnergyOverlay } from "../CinematicLayers";

/**
 * Full-screen cinematic welcome shown on first entry to the site.
 *
 *   WELCOME TO
 *   ARISE            ← the visual focus: metallic silver, glow, light flare
 *   COMMAND CENTER
 *
 * Sequence (~0–5s): black → fog/particles → "WELCOME TO" → "ARISE" flash →
 * "COMMAND CENTER" → ENTER button. A Skip control is always available, and
 * reduced-motion users get an instant, static reveal.
 *
 * Purely presentational — the parent decides when to mount it (once per
 * session) and what "entering" does via `onEnter`.
 */
export default function WelcomeIntro({ onEnter }) {
  const reducedMotion = useReducedMotion();
  const [leaving, setLeaving] = useState(false);
  const [showEnter, setShowEnter] = useState(reducedMotion);

  // Reveal the ENTER button after the title sequence has played.
  useEffect(() => {
    if (reducedMotion) return undefined;
    const t = window.setTimeout(() => setShowEnter(true), 5000);
    return () => window.clearTimeout(t);
  }, [reducedMotion]);

  function enter() {
    if (leaving) return;
    setLeaving(true);
    // let the exit transition play, then hand control to the app
    window.setTimeout(onEnter, reducedMotion ? 0 : 900);
  }

  // Base delays for the staggered reveal (skipped under reduced motion).
  const d = (base) => (reducedMotion ? 0 : base);

  return (
    <AnimatePresence>
      {!leaving && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#02030a]"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            filter: "brightness(1.6)",
            transition: { duration: 0.85, ease: [0.7, 0, 0.84, 0] },
          }}
        >
          {/* ---- atmosphere: fog + particles (reused canvas layers) ---- */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0.9)_0%,rgba(3,6,16,0.98)_55%,#02030a_100%)]" />
            <EnergyOverlay intensity={1.1} />
            <ParticleBackground intensity={0.9} count={reducedMotion ? 28 : 90} />
          </motion.div>

          {/* soft shadow figure / energy well behind the title */}
          <motion.div
            aria-hidden
            className="absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(124,58,237,0.22) 0%, rgba(6,182,212,0.12) 42%, transparent 68%)",
              filter: "blur(30px)",
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: d(1), duration: 1.6, ease: "easeOut" }}
          />

          {/* skip — always available */}
          <button
            onClick={enter}
            className="absolute top-5 right-5 z-20 text-[11px] font-semibold tracking-[0.35em] text-slate-500 hover:text-cyan-300 transition-colors"
          >
            SKIP →
          </button>

          {/* ---------- typography ---------- */}
          <div className="relative z-10 flex flex-col items-center px-6 text-center select-none">
            <motion.p
              className="text-[11px] sm:text-sm font-semibold tracking-[0.6em] text-slate-400"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: d(2), duration: 0.8, ease: "easeOut" }}
            >
              WELCOME TO
            </motion.p>

            {/* ARISE — the focal point */}
            <div className="relative mt-3 sm:mt-4">
              {/* horizontal light flare */}
              <motion.span
                aria-hidden
                className="absolute left-1/2 top-1/2 h-[3px] w-[140%] -translate-x-1/2 -translate-y-1/2"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(226,232,240,0.9) 45%, #fff 50%, rgba(226,232,240,0.9) 55%, transparent)",
                  filter: "blur(1px)",
                }}
                initial={{ opacity: 0, scaleX: 0.2 }}
                animate={{ opacity: [0, 1, 0.35], scaleX: [0.2, 1.1, 1] }}
                transition={{ delay: d(3), duration: 0.9, ease: "easeOut" }}
              />
              <motion.h1
                className="relative font-display text-6xl sm:text-8xl md:text-9xl font-black tracking-[0.12em]
                  text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500"
                style={{
                  WebkitTextStroke: "1px rgba(255,255,255,0.12)",
                  filter: "drop-shadow(0 0 26px rgba(226,232,240,0.55))",
                }}
                initial={{ opacity: 0, scale: reducedMotion ? 1 : 1.35, filter: "blur(18px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ delay: d(3), duration: 1, ease: [0.16, 1, 0.3, 1] }}
              >
                ARISE
                {/* white flash overlay on reveal */}
                {!reducedMotion && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 flex items-center justify-center font-display font-black tracking-[0.12em] text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.9, 0] }}
                    transition={{ delay: d(3), duration: 0.7, ease: "easeOut" }}
                  >
                    ARISE
                  </motion.span>
                )}
              </motion.h1>
            </div>

            <motion.p
              className="mt-3 sm:mt-4 text-lg sm:text-2xl font-bold tracking-[0.45em] text-cyan-200/80"
              style={{ filter: "drop-shadow(0 0 14px rgba(6,182,212,0.5))" }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: d(4), duration: 0.8, ease: "easeOut" }}
            >
              COMMAND CENTER
            </motion.p>

            {/* ENTER button */}
            <AnimatePresence>
              {showEnter && (
                <motion.button
                  onClick={enter}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  className="mt-10 sm:mt-12 rounded-xl px-8 py-3.5 text-sm font-bold tracking-[0.25em] text-white
                    bg-gradient-to-r from-violet-600 to-cyan-500
                    shadow-[0_0_28px_rgba(124,58,237,0.55)] hover:shadow-[0_0_46px_rgba(6,182,212,0.7)] transition-shadow"
                >
                  ENTER COMMAND CENTER
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
