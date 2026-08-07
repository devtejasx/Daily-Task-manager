/* =========================================================
   Awakening — the first-run cinematic

   Shown once, to a brand-new hunter, between signing in and the
   dashboard. Its job is to convert an account into a character: you
   did not "create a profile", you were *detected* by the System and
   assigned a rank.

   Deliberately short (~8s, hard-capped) and always skippable. It plays
   once per hunter and never again — a ritual that repeats is a loading
   screen. Under prefers-reduced-motion the whole sequence collapses to
   a single static panel with the same words.
   ========================================================= */

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ShieldCheck, Sparkles, Swords } from "lucide-react";
import { ParticleBackground, EnergyOverlay } from "../CinematicLayers";
import { HUNTER_RANKS, DAILY_REQUIRED } from "../../game/constants";

/** The beats, in order. Durations are ms and sum to just under 8s. */
const BEATS = [
  { key: "init", ms: 1500, label: "SYSTEM INITIALIZING", sub: "Establishing connection…" },
  { key: "detect", ms: 1500, label: "HUNTER DETECTED", sub: "Signature confirmed." },
  { key: "analyse", ms: 1900, label: "ANALYSING POTENTIAL", sub: "Measuring capacity for discipline…" },
  { key: "rank", ms: 1600, label: "RANK ASSIGNED", sub: null },
  { key: "mission", ms: 1400, label: "FIRST MISSION RECEIVED", sub: null },
];

const TOTAL_MS = BEATS.reduce((sum, b) => sum + b.ms, 0);

/** A thin scanning bar — the "analysis" texture, reused across beats. */
function ScanBar({ color }) {
  return (
    <div className="relative w-56 sm:w-72 h-[3px] mx-auto mt-7 rounded-full overflow-hidden bg-white/8">
      <motion.div
        className="absolute inset-y-0 w-1/3 rounded-full"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
        animate={{ x: ["-100%", "320%"] }}
        transition={{ duration: 1.15, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function Beat({ beat, reduced }) {
  const eRank = HUNTER_RANKS[0];

  return (
    <motion.div
      key={beat.key}
      className="relative text-center px-6"
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: -14, filter: "blur(10px)" }}
      transition={{ duration: reduced ? 0.2 : 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {beat.key === "rank" ? (
        <>
          <motion.div
            className="mx-auto w-24 h-24 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: `${eRank.color}1a`, border: `1px solid ${eRank.color}66` }}
            initial={reduced ? false : { scale: 0.6, rotate: -12 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 190, damping: 14 }}
          >
            <span
              className="font-display font-black text-4xl"
              style={{ color: eRank.color, textShadow: `0 0 26px ${eRank.color}` }}
            >
              E
            </span>
          </motion.div>
          <h2 className="font-display font-black text-2xl sm:text-4xl text-slate-100 tracking-wide">
            {beat.label}
          </h2>
          <p className="font-display text-sm tracking-[0.25em] mt-3" style={{ color: eRank.color }}>
            {eRank.title}
          </p>
          <p className="text-slate-400 text-sm mt-4 max-w-md mx-auto leading-relaxed">
            {eRank.blurb}
          </p>
        </>
      ) : beat.key === "mission" ? (
        <>
          <motion.div
            className="mx-auto w-20 h-20 rounded-2xl bg-cyan-400/12 border border-cyan-300/50 flex items-center justify-center mb-6"
            initial={reduced ? false : { scale: 0.7 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <Swords size={30} className="text-cyan-300" aria-hidden />
          </motion.div>
          <h2 className="font-display font-black text-2xl sm:text-4xl text-cyan-200 tracking-wide">
            {beat.label}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-4 max-w-md mx-auto leading-relaxed">
            Choose {DAILY_REQUIRED} missions for today and clear them.
            <span className="block text-slate-500 mt-1">That is day one. There is no day zero.</span>
          </p>
        </>
      ) : (
        <>
          <h2 className="font-display font-black text-xl sm:text-3xl text-slate-100 tracking-[0.12em]">
            {beat.label}
          </h2>
          {beat.sub && <p className="text-slate-400 text-sm mt-3 tracking-wide">{beat.sub}</p>}
          <ScanBar color="#06b6d4" />
        </>
      )}
    </motion.div>
  );
}

/** The whole sequence, collapsed for hunters who asked for less motion. */
function StaticSummary() {
  const eRank = HUNTER_RANKS[0];
  return (
    <div className="relative text-center px-6">
      <div
        className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: `${eRank.color}1a`, border: `1px solid ${eRank.color}66` }}
      >
        <span className="font-display font-black text-3xl" style={{ color: eRank.color }}>E</span>
      </div>
      <h2 className="font-display font-black text-2xl text-slate-100">HUNTER DETECTED</h2>
      <p className="font-display text-xs tracking-[0.25em] mt-2" style={{ color: eRank.color }}>
        {eRank.title}
      </p>
      <p className="text-slate-400 text-sm mt-4 max-w-md mx-auto leading-relaxed">
        Choose {DAILY_REQUIRED} missions for today and clear them. That is day one.
      </p>
    </div>
  );
}

export default function Awakening({ onDone }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const doneRef = useRef(false);

  // Guard against firing twice (timer + click racing on the last beat).
  const finish = useMemo(
    () => () => {
      if (doneRef.current) return;
      doneRef.current = true;
      onDone();
    },
    [onDone]
  );

  useEffect(() => {
    if (reduced) {
      const t = window.setTimeout(finish, 2600);
      return () => window.clearTimeout(t);
    }
    if (index >= BEATS.length) {
      finish();
      return undefined;
    }
    const t = window.setTimeout(() => setIndex((i) => i + 1), BEATS[index].ms);
    return () => window.clearTimeout(t);
  }, [index, reduced, finish]);

  // Escape always skips — the same contract as every other cinematic here.
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && finish();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [finish]);

  const beat = BEATS[Math.min(index, BEATS.length - 1)];

  return (
    <motion.div
      className="fixed inset-0 z-[95] flex items-center justify-center overflow-hidden bg-[#02030a]"
      role="dialog"
      aria-modal="true"
      aria-label="Hunter awakening"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.7 } }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(30,27,75,0.6)_0%,rgba(3,6,16,0.97)_60%,#02030a_100%)]" />
      {!reduced && (
        <>
          <ParticleBackground />
          <EnergyOverlay intensity={0.5} />
        </>
      )}

      {reduced ? (
        <StaticSummary />
      ) : (
        <AnimatePresence mode="wait">
          <Beat key={beat.key} beat={beat} reduced={reduced} />
        </AnimatePresence>
      )}

      {/* progress through the ritual — also tells the hunter it is short */}
      {!reduced && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5" aria-hidden>
          {BEATS.map((b, i) => (
            <span
              key={b.key}
              className="h-1 w-7 rounded-full transition-colors duration-300"
              style={{
                background: i <= index ? "#06b6d4" : "rgba(255,255,255,0.12)",
                boxShadow: i <= index ? "0 0 8px rgba(6,182,212,0.8)" : "none",
              }}
            />
          ))}
        </div>
      )}

      <button
        onClick={finish}
        className="absolute bottom-7 left-1/2 -translate-x-1/2 font-display text-[10px] font-bold
                   tracking-[0.3em] text-slate-500 hover:text-slate-200 px-4 py-2 rounded-lg
                   transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
      >
        SKIP
      </button>

      <span className="sr-only" role="status">
        {reduced ? "Hunter detected. E-Rank assigned." : `${beat.label}. ${beat.sub ?? ""}`}
      </span>
    </motion.div>
  );
}

export { TOTAL_MS as AWAKENING_MS };
