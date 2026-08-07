import { useEffect, useMemo, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays, Flame, Swords, TrendingDown, TrendingUp, Zap } from "lucide-react";

/**
 * The Hunter Progress Report.
 *
 * Shown once a week. Unlike the analytics page — which the hunter has to go
 * looking for — this arrives on its own and answers the one question the
 * vision says they should never be left asking: am I improving?
 *
 * A down week is reported without a scold. The framing is always "here is
 * what you did", never "here is what you missed", because a bad week is
 * exactly when a discipline app most needs to stay a mentor.
 */
export default function WeeklyReport({ report, streak, onClose }) {
  const reduced = useReducedMotion();
  const closedRef = useRef(false);

  const close = useMemo(
    () => () => {
      if (closedRef.current) return;
      closedRef.current = true;
      onClose();
    },
    [onClose]
  );

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [close]);

  const { missions, xp, activeDays, bestCategory, xpDelta } = report;
  const quiet = missions === 0;

  const STATS = [
    { icon: Swords, color: "#06b6d4", value: missions, label: "MISSIONS CLEARED" },
    { icon: Zap, color: "#f59e0b", value: xp.toLocaleString(), label: "XP EARNED" },
    { icon: CalendarDays, color: "#10b981", value: `${activeDays}/7`, label: "DAYS ACTIVE" },
  ];

  /* The headline adapts to the week, and never punishes a quiet one. */
  const headline = quiet
    ? "A QUIET WEEK"
    : xpDelta === null
    ? "YOUR FIRST WEEK ON RECORD"
    : xpDelta > 0
    ? "YOU GOT STRONGER"
    : "YOU HELD THE LINE";

  const message = quiet
    ? "Nothing was cleared this week — and nothing was lost either. Your XP, levels and titles are exactly where you left them. One mission is enough to start the next one."
    : xpDelta === null
    ? `${missions} missions cleared and ${xp.toLocaleString()} XP earned. This is the baseline every future week gets measured against.`
    : xpDelta > 0
    ? `${xpDelta}% more XP than last week. Whatever you changed, it worked.`
    : "Fewer points than last week, and the streak is intact — which is the part that compounds. Consistency beats intensity every time.";

  return (
    <motion.div
      className="fixed inset-0 z-[75] flex items-center justify-center px-5 py-8 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Weekly hunter progress report"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      onClick={close}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      <motion.div
        className="relative glass holo-scan neon-border rounded-2xl p-7 sm:p-9 max-w-lg w-full text-center my-auto"
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-display text-[10px] font-bold tracking-[0.3em] text-violet-300">
          HUNTER PROGRESS REPORT
        </p>

        <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-100 mt-3">
          {headline}
        </h2>

        <div className="grid grid-cols-3 gap-3 mt-7">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-2 py-4"
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
            >
              <s.icon
                size={16}
                className="mx-auto"
                style={{ color: s.color, filter: `drop-shadow(0 0 6px ${s.color})` }}
                aria-hidden
              />
              <p className="font-display font-black text-xl text-slate-100 mt-2 leading-none">
                {s.value}
              </p>
              <p className="text-[9px] tracking-[0.13em] text-slate-500 mt-2">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {xpDelta !== null && !quiet && (
          <motion.p
            className="inline-flex items-center gap-1.5 mt-5 text-xs font-bold tracking-wider rounded-lg px-3 py-1.5"
            style={{
              color: xpDelta > 0 ? "#10b981" : "#94a3b8",
              background: xpDelta > 0 ? "rgba(16,185,129,0.1)" : "rgba(148,163,184,0.1)",
              border: `1px solid ${xpDelta > 0 ? "rgba(16,185,129,0.35)" : "rgba(148,163,184,0.3)"}`,
            }}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
          >
            {xpDelta > 0 ? <TrendingUp size={13} aria-hidden /> : <TrendingDown size={13} aria-hidden />}
            {xpDelta > 0 ? "+" : ""}
            {xpDelta}% XP VS LAST WEEK
          </motion.p>
        )}

        <motion.p
          className="text-slate-300 text-sm mt-5 leading-relaxed"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
        >
          {message}
        </motion.p>

        {bestCategory && !quiet && (
          <p className="text-[11px] tracking-wider text-slate-500 mt-3">
            Most cleared: <span className="text-slate-300">{bestCategory}</span>
          </p>
        )}

        {streak > 0 && (
          <p className="inline-flex items-center gap-1.5 text-[11px] tracking-wider text-amber-300/90 mt-4">
            <Flame size={12} aria-hidden /> {streak}-day streak carried into next week
          </p>
        )}

        <motion.button
          onClick={close}
          className="mt-7 w-full font-display font-black text-xs tracking-[0.2em] text-slate-950
                     bg-gradient-to-r from-violet-300 to-cyan-300 rounded-xl px-6 py-3.5
                     hover:brightness-110 transition-[filter]
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          autoFocus
        >
          BEGIN THE NEXT WEEK
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
