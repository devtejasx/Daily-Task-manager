import { useMemo } from "react";
import { motion } from "framer-motion";
import { Flame, Trophy, Swords, Zap, ShieldCheck, Repeat, Target, History } from "lucide-react";
import RankBadge from "../components/RankBadge";
import XPBar from "../components/XPBar";
import DisciplineGauge from "../components/DisciplineGauge";
import TitlePicker from "../components/TitlePicker";
import ProgressionTimeline from "../components/ProgressionTimeline";
import { buildTimeline, nextMilestone } from "../game/timeline";
import { activeTitleName } from "../game/titles";
import { ACHIEVEMENTS, SHIELD_MAX } from "../game/constants";

/** One figure, stated plainly. The profile is a record, not a dashboard. */
function Figure({ icon: Icon, label, value, accent = "#94a3b8", hint = null }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] px-3.5 py-3">
      <div className="flex items-center gap-1.5">
        <Icon size={12} style={{ color: accent }} aria-hidden />
        <p className="text-[9px] font-bold tracking-[0.2em] text-slate-500">{label}</p>
      </div>
      <p className="font-display font-black text-lg mt-1" style={{ color: accent }}>
        {value}
      </p>
      {hint && <p className="text-[10px] text-slate-500 mt-0.5">{hint}</p>}
    </div>
  );
}

/**
 * The Hunter Profile.
 *
 * The screen is built to answer "who have I become?" rather than "what
 * have I completed?" — which is why rank, title and Discipline Score sit
 * above the counters, and why the timeline is here rather than a feed of
 * cleared missions.
 */
export default function Profile({
  state,
  levelInfo,
  rank,
  ascent,
  discipline,
  challenges,
  stats,
  user,
  onSelectTitle,
}) {
  const timeline = useMemo(() => buildTimeline(state), [state]);
  const next = useMemo(() => nextMilestone(state, ascent), [state, ascent]);

  const title = activeTitleName(state);
  const hunterName = user?.displayName || user?.email?.split("@")[0] || "Hunter";
  const unlockedFeats = ACHIEVEMENTS.filter((a) => state.achievements?.[a.id]).length;
  const questDays = (state.questDays ?? []).length;

  return (
    <div className="space-y-6">
      {/* ---- identity ---- */}
      <motion.header
        className="glass holo-scan neon-border rounded-2xl p-5 sm:p-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-4 sm:gap-5 flex-wrap">
          <RankBadge rank={rank} size={64} />
          <div className="min-w-0">
            {title && (
              <p
                className="text-[10px] font-bold tracking-[0.3em]"
                style={{ color: rank.color }}
              >
                {title.toUpperCase()}
              </p>
            )}
            <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-100 text-glow-arcane truncate">
              {hunterName.toUpperCase()}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {rank.title} · Level {levelInfo.level}
            </p>
          </div>
        </div>

        {/* level progress */}
        <div className="mt-5">
          <XPBar progress={levelInfo.progress} height={10} />
          <div className="flex justify-between mt-2 text-[11px] font-semibold flex-wrap gap-2">
            <span className="text-cyan-300">
              {levelInfo.xpInLevel.toLocaleString()} / {levelInfo.xpNeeded.toLocaleString()} XP
            </span>
            <span className="text-violet-300">
              {levelInfo.xpToNext.toLocaleString()} XP TO LV. {levelInfo.level + 1}
            </span>
          </div>
        </div>

        {/* rank progress — what the next evaluation is actually asking for */}
        {ascent?.next && (
          <div className="mt-5 rounded-xl border border-white/8 bg-white/[0.03] p-4">
            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <p className="font-display font-bold text-[11px] tracking-[0.22em] text-slate-300">
                NEXT EVALUATION
              </p>
              <span
                className="font-display font-bold text-[11px] tracking-wider"
                style={{ color: ascent.next.color }}
              >
                {ascent.next.title}
              </span>
            </div>

            <ul className="mt-3 grid gap-2 sm:grid-cols-3">
              {ascent.requirements.map((r) => (
                <li key={r.key} className="text-[11px]">
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="text-slate-400">{r.label}</span>
                    <span className={r.met ? "text-emerald-300 font-bold" : "text-slate-300"}>
                      {r.current}
                      {r.unit ?? ""} / {r.target}
                      {r.unit ?? ""}
                    </span>
                  </div>
                  <div
                    className="mt-1 h-1.5 rounded-full bg-white/8 overflow-hidden"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(r.progress * 100)}
                    aria-label={`${r.label}: ${r.current} of ${r.target}`}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(1, r.progress * 100)}%`,
                        background: r.met ? "#10b981" : ascent.next.color,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>

            <p className="text-[11px] text-slate-500 mt-3">
              Either route promotes: meet all three above, or hold a{" "}
              {ascent.streakRoute.target}-day streak. Rank never goes down once earned.
            </p>
          </div>
        )}
      </motion.header>

      {/* ---- the record ---- */}
      <motion.section
        className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        aria-label="Hunter record"
      >
        <Figure icon={Flame} label="CURRENT STREAK" value={`${state.streak}d`} accent="#f59e0b" />
        <Figure icon={Trophy} label="LONGEST STREAK" value={`${state.longestStreak}d`} accent="#a78bfa" />
        <Figure icon={Swords} label="MISSIONS CLEARED" value={stats.totalCompleted.toLocaleString()} accent="#06b6d4" />
        <Figure icon={Zap} label="LIFETIME XP" value={state.totalXP.toLocaleString()} accent="#22d3ee" />
        <Figure
          icon={ShieldCheck}
          label="RESOLVE BANKED"
          value={`${state.shields ?? 0}/${SHIELD_MAX}`}
          accent="#38bdf8"
          hint="Shields absorb a missed day"
        />
        <Figure
          icon={Repeat}
          label="COMEBACKS"
          value={state.comebacks ?? 0}
          accent="#10b981"
          hint="Streaks reclaimed after a gap"
        />
        <Figure icon={Target} label="QUESTS CLEARED" value={questDays} accent="#7c3aed" />
        <Figure
          icon={History}
          label="FEATS"
          value={`${unlockedFeats}/${ACHIEVEMENTS.length}`}
          accent="#ec4899"
        />
      </motion.section>

      {/* ---- discipline + this week ---- */}
      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div
          className="glass rounded-2xl p-5"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.6 }}
        >
          <DisciplineGauge discipline={discipline} />
        </motion.div>

        <motion.div
          className="glass rounded-2xl p-5"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.6 }}
        >
          <h2 className="font-display font-bold text-[11px] tracking-[0.25em] text-slate-300">
            THE JOURNEY
          </h2>
          <p className="text-[11px] text-slate-500 mt-1 mb-4">
            The days something changed. Cleared missions live in your history —
            these are the moments.
          </p>
          <div className="max-h-[26rem] overflow-y-auto pr-1">
            <ProgressionTimeline moments={timeline} next={next} />
          </div>
        </motion.div>
      </div>

      {/* ---- titles ---- */}
      <motion.div
        className="glass rounded-2xl p-5"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.6 }}
      >
        <TitlePicker
          titles={state.titles}
          activeTitle={state.activeTitle}
          onSelect={onSelectTitle}
        />
      </motion.div>
    </div>
  );
}
