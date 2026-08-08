import { motion, useReducedMotion } from "framer-motion";
import { COMPONENT_COPY } from "../game/discipline";

/**
 * The Discipline Score, and — more importantly — why it is that number.
 *
 * A score nobody can explain is a score nobody trusts, and an
 * unexplained number attached to your own discipline reads as a verdict.
 * So the breakdown is not hidden behind a tooltip: every component, its
 * weight, and one plain sentence about what it measures.
 */
export default function DisciplineGauge({ discipline, compact = false }) {
  const reduced = useReducedMotion();
  const { score, band, ready, components, windowDays } = discipline;

  if (!ready) {
    return (
      <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
        <p className="font-display font-bold text-[11px] tracking-[0.22em] text-slate-300">
          DISCIPLINE
        </p>
        <p className="text-sm text-slate-400 mt-2">
          Not enough of a record yet. Clear missions on a few separate days and this
          starts reading your rhythm.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <p className="font-display font-bold text-[11px] tracking-[0.22em] text-slate-300">
          DISCIPLINE
        </p>
        <span className="text-[10px] tracking-[0.15em] text-slate-500">
          LAST {windowDays} DAYS
        </span>
      </div>

      <div className="flex items-end gap-3 mt-2">
        <span
          className="font-display font-black text-4xl leading-none"
          style={{ color: band.color, textShadow: `0 0 24px ${band.color}55` }}
        >
          {score}
        </span>
        <span className="text-slate-500 font-display font-bold text-lg leading-none pb-0.5">
          / 100
        </span>
        {/* The band is stated in words as well as colour — the label is the
            information, the colour only reinforces it. */}
        <span
          className="ml-auto text-[10px] font-bold tracking-[0.18em] px-2.5 py-1 rounded-full border"
          style={{ color: band.color, borderColor: `${band.color}44`, background: `${band.color}12` }}
        >
          {band.label.toUpperCase()}
        </span>
      </div>

      <div
        className="mt-3 h-2 rounded-full bg-white/8 overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={score}
        aria-label={`Discipline Score: ${score} of 100, ${band.label}`}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${band.color}88, ${band.color})`, originX: 0 }}
          initial={false}
          animate={{ scaleX: Math.max(0.008, score / 100) }}
          transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 22 }}
        />
      </div>

      <p className="text-xs text-slate-400 mt-2.5">{band.blurb}</p>

      {!compact && (
        <dl className="mt-4 space-y-3">
          {components.map((c) => {
            const copy = COMPONENT_COPY[c.key];
            const pct = Math.round(c.signal * 100);
            return (
              <div key={c.key}>
                <div className="flex items-baseline justify-between gap-2">
                  <dt className="text-xs font-semibold text-slate-300">{copy.label}</dt>
                  <dd className="text-[11px] text-slate-400 tabular-nums">
                    {Math.round(c.points)} <span className="text-slate-600">/ {c.weight}</span>
                  </dd>
                </div>
                <div
                  className="mt-1 h-1.5 rounded-full bg-white/8 overflow-hidden"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={pct}
                  aria-label={`${copy.label}: ${pct} percent`}
                >
                  <motion.div
                    className="h-full rounded-full bg-slate-400/70"
                    style={{ originX: 0 }}
                    initial={false}
                    animate={{ scaleX: Math.max(0.008, c.signal) }}
                    transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 24 }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{copy.desc}</p>
              </div>
            );
          })}
        </dl>
      )}

      <p className="text-[11px] text-slate-500 mt-4 border-t border-white/5 pt-3">
        This is a progress indicator, not a grade. It counts days you showed up for,
        not things you ticked — which is why a pile of small missions in one sitting
        will not move it.
      </p>
    </div>
  );
}
