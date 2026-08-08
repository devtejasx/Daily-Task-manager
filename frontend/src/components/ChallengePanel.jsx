import { motion, useReducedMotion } from "framer-motion";
import { Target, Swords, CheckCircle2, Circle } from "lucide-react";
import { CHALLENGE_COPY } from "../game/challenges";

/**
 * A bar that carries its own numbers.
 *
 * Progress here has to survive without animation and without colour —
 * reduced motion is honoured, and the figure is always written out
 * beside it rather than only implied by a filled width.
 */
function Meter({ progress, color, label }) {
  const reduced = useReducedMotion();
  return (
    <div
      className="h-2 rounded-full bg-white/8 overflow-hidden"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      aria-label={label}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}aa, ${color})`, originX: 0 }}
        initial={false}
        animate={{ scaleX: Math.max(0.008, progress) }}
        transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 130, damping: 22 }}
      />
    </div>
  );
}

/** This week's challenge — calibrated to the hunter's own recent output. */
export function WeeklyChallengeCard({ challenge }) {
  const done = challenge.complete;
  const color = done ? "#10b981" : "#06b6d4";

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="inline-flex items-center gap-2 font-display font-bold text-[11px] tracking-[0.22em] text-slate-300">
          <Target size={14} style={{ color }} aria-hidden />
          WEEKLY CHALLENGE
        </span>
        <span className="font-display font-black text-sm" style={{ color }}>
          {challenge.rawProgress} / {challenge.target}
        </span>
      </div>

      <p className="text-sm text-slate-200 mt-2">{challenge.label}</p>

      <div className="mt-3">
        <Meter
          progress={challenge.target === 0 ? 1 : challenge.progress / challenge.target}
          color={color}
          label={`Weekly challenge: ${challenge.rawProgress} of ${challenge.target} missions`}
        />
      </div>

      <div className="flex items-center justify-between gap-3 mt-2.5 flex-wrap">
        <span className="text-[11px] text-slate-400">
          {done ? CHALLENGE_COPY.weeklyDone : CHALLENGE_COPY.weeklyPending(challenge.remaining)}
        </span>
        <span className="text-[10px] font-bold tracking-[0.18em] text-amber-300/90">
          +{challenge.xp.toLocaleString()} XP
        </span>
      </div>
    </div>
  );
}

/**
 * The boss. Optional by construction: nothing counts until it is
 * accepted, and an unfinished one is never described as a loss.
 */
export function BossCard({ boss, onAccept }) {
  const color = boss.color;

  return (
    <div
      className="rounded-xl border p-4"
      style={{ borderColor: `${color}33`, background: `${color}0a` }}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="inline-flex items-center gap-2 font-display font-bold text-[11px] tracking-[0.22em] text-slate-300">
          <Swords size={14} style={{ color }} aria-hidden />
          WEEKLY BOSS
        </span>
        <span
          className="text-[9px] font-bold tracking-[0.2em] px-2 py-0.5 rounded-full border"
          style={{ color, borderColor: `${color}44` }}
        >
          OPTIONAL
        </span>
      </div>

      <h3 className="font-display font-black text-lg mt-2" style={{ color }}>
        {boss.name}
      </h3>
      <p className="text-xs text-slate-400 mt-1">{boss.blurb}</p>

      {!boss.accepted ? (
        <div className="mt-4">
          <p className="text-[11px] text-slate-400">{CHALLENGE_COPY.bossOffer}</p>
          <button
            type="button"
            onClick={onAccept}
            className="mt-2.5 w-full text-[11px] font-bold tracking-[0.2em] py-2 rounded-lg border transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
            style={{ color, borderColor: `${color}55`, background: `${color}14` }}
          >
            ACCEPT THE CHALLENGE
          </button>
        </div>
      ) : (
        <>
          <ul className="mt-4 space-y-2.5">
            {boss.objectives.map((o) => (
              <li key={o.key}>
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="inline-flex items-center gap-1.5 text-slate-300">
                    {/* An icon as well as a colour, so "met" survives without it. */}
                    {o.met ? (
                      <CheckCircle2 size={13} className="text-emerald-400" aria-hidden />
                    ) : (
                      <Circle size={13} className="text-slate-600" aria-hidden />
                    )}
                    {o.label}
                  </span>
                  <span className={o.met ? "text-emerald-300 font-bold" : "text-slate-400"}>
                    {o.current} / {o.target}
                  </span>
                </div>
                <div className="mt-1">
                  <Meter
                    progress={o.progress}
                    color={o.met ? "#10b981" : color}
                    label={`${o.label}: ${o.current} of ${o.target}`}
                  />
                </div>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between gap-3 mt-3 flex-wrap">
            <span className="text-[11px] text-slate-400">
              {boss.complete ? CHALLENGE_COPY.bossDone : CHALLENGE_COPY.bossPending}
            </span>
            <span className="text-[10px] font-bold tracking-[0.18em] text-amber-300/90">
              +{boss.xp.toLocaleString()} XP
            </span>
          </div>
        </>
      )}
    </div>
  );
}

/** Both challenges, in one panel on the dashboard. */
export default function ChallengePanel({ weekly, boss, onAcceptBoss, delay = 0 }) {
  return (
    <motion.section
      className="glass holo-scan rounded-2xl p-5 space-y-3"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      aria-label="This week's challenges"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display font-bold text-[11px] tracking-[0.25em] text-slate-300">
          THIS WEEK
        </h2>
        <span className="text-[10px] tracking-[0.15em] text-slate-500">
          {weekly.daysLeft === 0
            ? "LAST DAY"
            : `${weekly.daysLeft} DAY${weekly.daysLeft === 1 ? "" : "S"} LEFT`}
        </span>
      </div>

      <WeeklyChallengeCard challenge={weekly} />
      <BossCard boss={boss} onAccept={onAcceptBoss} />
    </motion.section>
  );
}
