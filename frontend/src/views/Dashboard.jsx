import { motion, AnimatePresence } from "framer-motion";
import {
  Swords, CheckCircle2, Plus, Flame, Trophy, History, BarChart3,
  Dumbbell, BookOpen, Target, Briefcase,
} from "lucide-react";
import { iconByName } from "../game/icons";
import { TASK_TEMPLATES } from "../data/taskTemplates";

const TEMPLATE_ICONS = { Dumbbell, BookOpen, Target, Briefcase };
import StatCard from "../components/StatCard";
import ProgressRing from "../components/ProgressRing";
import XPBar from "../components/XPBar";
import MissionCard from "../components/MissionCard";
import DailyQuestPanel from "../components/DailyQuestPanel";
import RankBadge from "../components/RankBadge";
import WeeklyXPChart from "../components/WeeklyXPChart";
import HistoryTimeline from "../components/HistoryTimeline";
import { useCountUp } from "../hooks/useCountUp";
import { ACHIEVEMENTS, nextRank, localISO } from "../game/constants";

function Widget({ title, icon: Icon, children, delay = 0, className = "" }) {
  return (
    <motion.div
      className={`glass holo-scan rounded-2xl p-5 ${className}`}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon size={15} className="text-cyan-300" style={{ filter: "drop-shadow(0 0 5px rgba(6,182,212,0.7))" }} />
        <h2 className="font-display font-bold text-[11px] tracking-[0.25em] text-slate-300">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

export default function Dashboard({
  missions,
  history,
  stats,
  levelInfo,
  rank,
  rankIdx,
  streak,
  longestStreak,
  dailyMissions,
  dailyDone,
  dayComplete,
  totalXP,
  weeklySeries,
  achievements,
  onComplete,
  onDelete,
  onOpenAdd,
  onUseTemplate,
  onToggleDaily,
  dailySelected,
  setView,
}) {
  const xpCount = useCountUp(totalXP);
  const xpToNext = useCountUp(levelInfo.xpToNext);
  const xpInLevelCount = useCountUp(levelInfo.xpInLevel);
  const streakCount = useCountUp(streak);
  const next = nextRank(rankIdx);
  const todayISO = localISO();
  const todaysBoard = missions.filter((m) => m.dueDate === todayISO);
  const activeToday = todaysBoard.filter((m) => m.status !== "completed");
  const clearedToday = todaysBoard.filter((m) => m.status === "completed");

  const recentAchievements = Object.entries(achievements)
    .sort((a, b) => (a[1] < b[1] ? 1 : -1))
    .slice(0, 3)
    .map(([id, date]) => ({ ...ACHIEVEMENTS.find((a) => a.id === id), date }))
    .filter((a) => a.id);

  // A brand-new hunter (or signed-out guest) has no missions, no history and
  // no XP — greet them with an onboarding empty state instead of "welcome back".
  const isFresh = missions.length === 0 && history.length === 0 && (totalXP ?? 0) === 0;

  return (
    <div className="space-y-5">
      {/* headline + rank */}
      <motion.div
        className="flex flex-wrap items-end justify-between gap-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <p className="text-[10px] tracking-[0.4em] text-cyan-300/70 font-bold">SYSTEM MESSAGE</p>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-100 mt-1 text-glow-arcane">
            {isFresh ? "YOUR COMMAND CENTER AWAITS" : "WELCOME BACK, HUNTER"}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {isFresh
              ? "No missions assigned yet. Create your first task to begin."
              : dayComplete
              ? "Daily quest complete. The system is pleased... for today."
              : `${4 - dailyDone} required ${4 - dailyDone === 1 ? "mission" : "missions"} left before midnight. Do not fail.`}
          </p>
        </div>
        <RankBadge rank={rank} size={56} showTitle />
      </motion.div>

      {/* first-run onboarding hero */}
      {isFresh && (
        <motion.div
          className="glass neon-border rounded-2xl px-6 py-10 text-center flex flex-col items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-600/80 to-cyan-500/80 shadow-[0_0_30px_rgba(124,58,237,0.45)] mb-5">
            <Swords size={26} className="text-white" />
          </div>
          <h2 className="font-display font-black text-xl sm:text-2xl text-slate-100 text-glow-arcane">
            YOUR COMMAND CENTER AWAITS
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-md">
            No missions, no history — a clean slate, Hunter. Forge your first mission and
            begin your ascent.
          </p>
          <motion.button
            onClick={onOpenAdd}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold tracking-[0.15em] text-white
              bg-gradient-to-r from-violet-600 to-cyan-500
              shadow-[0_0_24px_rgba(124,58,237,0.5)] hover:shadow-[0_0_40px_rgba(6,182,212,0.65)] transition-shadow"
          >
            <Plus size={16} /> CREATE FIRST TASK
          </motion.button>

          {/* quick-start templates — these only pre-fill the form, nothing is created yet */}
          <p className="mt-7 text-[10px] font-bold tracking-[0.3em] text-slate-500">OR START FROM A TEMPLATE</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {TASK_TEMPLATES.map((t) => {
              const Icon = TEMPLATE_ICONS[t.icon] ?? Plus;
              return (
                <button
                  key={t.id}
                  onClick={() => onUseTemplate?.(t.preset)}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-semibold text-slate-300
                    hover:border-cyan-400/40 hover:text-cyan-200 hover:bg-cyan-400/5 transition-colors"
                >
                  <Icon size={14} className="text-violet-300" /> {t.label}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* stat grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={Flame} label="Current Streak" value={streak} suffix=" d" accent="#f59e0b" delay={0.08} />
        <StatCard icon={Trophy} label="Longest Streak" value={longestStreak} suffix=" d" accent="#a78bfa" delay={0.14} />
        <StatCard icon={Swords} label="Active Missions" value={stats.active} accent="#7c3aed" delay={0.2} />
        <StatCard icon={CheckCircle2} label="Total Completed" value={stats.totalCompleted} accent="#10b981" delay={0.26} />
      </div>

      {/* daily quest + level progression */}
      <div className="grid lg:grid-cols-2 gap-4">
        <DailyQuestPanel
          dailyMissions={dailyMissions}
          dailyDone={dailyDone}
          dayComplete={dayComplete}
          onGoPick={() => setView("missions")}
        />

        <motion.div
          className="glass holo-scan neon-border rounded-2xl p-5 flex flex-col"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-sm tracking-[0.2em] text-slate-200">
              HUNTER LEVEL {levelInfo.level}
            </h2>
            <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400">
              NEXT RANK:{" "}
              {next ? (
                <span style={{ color: next.color }}>
                  {next.key} @ {next.streak}d STREAK
                </span>
              ) : (
                <span className="text-amber-300">PEAK</span>
              )}
            </span>
          </div>

          <div className="mt-4">
            <XPBar progress={levelInfo.progress} height={12} />
            <div className="flex justify-between mt-2 text-[11px] font-semibold text-slate-400">
              <span className="text-cyan-300">
                {xpInLevelCount.toLocaleString()} / {levelInfo.xpNeeded.toLocaleString()} XP
              </span>
              <span className="text-violet-300">{xpToNext.toLocaleString()} XP TO LV. {levelInfo.level + 1}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4 text-center">
            <div className="rounded-xl bg-white/[0.03] border border-white/5 py-2.5">
              <p className="font-display font-bold text-amber-300">{xpCount.toLocaleString()}</p>
              <p className="text-[9px] tracking-[0.2em] text-slate-500 font-bold mt-0.5">TOTAL XP</p>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/5 py-2.5">
              <p className="font-display font-bold text-cyan-300">{Math.round(stats.completionRate * 100)}%</p>
              <p className="text-[9px] tracking-[0.2em] text-slate-500 font-bold mt-0.5">CLEAR RATE</p>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/5 py-2.5">
              <p className="font-display font-bold text-emerald-300">
                <motion.span
                  key={streak}
                  initial={{ scale: 1.6, color: "#fbbf24" }}
                  animate={{ scale: 1, color: "#6ee7b7" }}
                  className="inline-block"
                >
                  {streakCount}
                </motion.span>{" "}
                d
              </p>
              <p className="text-[9px] tracking-[0.2em] text-slate-500 font-bold mt-0.5">STREAK</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mt-auto pt-4">
            <ProgressRing progress={stats.completionRate} size={110} stroke={8} label="CLEAR RATE" />
            <div className="text-left space-y-1.5">
              <p className="text-xs text-slate-400">
                <span className="font-bold text-cyan-300">{stats.weeklyXP.toLocaleString()}</span> XP this week
              </p>
              <p className="text-xs text-slate-400">
                <span className="font-bold text-violet-300">{stats.monthlyXP.toLocaleString()}</span> XP this month
              </p>
              <p className="text-xs text-slate-400">
                <span className="font-bold text-emerald-300">{stats.totalCompleted}</span> gates closed all-time
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* charts + achievements + history */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Widget title="WEEKLY XP" icon={BarChart3} delay={0.44}>
          <WeeklyXPChart series={weeklySeries} />
          <div className="flex justify-between mt-2 text-[10px] font-bold tracking-widest text-slate-500">
            <span>
              WEEK <span className="text-cyan-300">{stats.weeklyXP.toLocaleString()} XP</span>
            </span>
            <span>
              MONTH <span className="text-violet-300">{stats.monthlyXP.toLocaleString()} XP</span>
            </span>
          </div>
        </Widget>

        <Widget title="RECENT ACHIEVEMENTS" icon={Trophy} delay={0.5}>
          {recentAchievements.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">None yet. The system is watching.</p>
          ) : (
            <div className="space-y-2.5">
              {recentAchievements.map((a) => {
                const Icon = iconByName(a.icon);
                return (
                  <div key={a.id} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
                    <div className="p-2 rounded-lg shrink-0" style={{ background: `${a.color}15`, boxShadow: `0 0 10px ${a.color}33` }}>
                      <Icon size={16} style={{ color: a.color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-200 truncate">{a.title}</p>
                      <p className="text-[10px] text-slate-500 truncate">{a.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <button
            onClick={() => setView("achievements")}
            className="mt-3 w-full text-[10px] font-bold tracking-[0.25em] text-violet-300/80 hover:text-violet-200 py-1.5 rounded-lg border border-violet-400/20 hover:border-violet-400/50 transition-colors"
          >
            VIEW HALL OF RECORDS →
          </button>
        </Widget>

        <Widget title="MISSION HISTORY" icon={History} delay={0.56} className="md:col-span-2 xl:col-span-1">
          <div className="max-h-64 overflow-y-auto pr-1">
            <HistoryTimeline history={history} limit={10} />
          </div>
        </Widget>
      </div>

      {/* today's board */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-sm tracking-[0.2em] text-slate-200">TODAY'S GATES</h2>
          <motion.button
            onClick={onOpenAdd}
            className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-cyan-300 border border-cyan-400/30 bg-cyan-400/10 rounded-lg px-3 py-1.5 hover:shadow-[0_0_18px_rgba(6,182,212,0.4)] transition-shadow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
          >
            <Plus size={14} /> NEW
          </motion.button>
        </div>
        <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {activeToday.length === 0 && clearedToday.length === 0 && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-slate-500 glass rounded-xl p-5 text-center">
                No gates due today. The realm is quiet... for now.
              </motion.p>
            )}
            {activeToday.map((m, index) => (
              <MissionCard
                key={m.id}
                mission={m}
                onComplete={onComplete}
                onDelete={onDelete}
                isDaily={dailySelected.includes(m.id)}
                dailyFull={dailySelected.length >= 4}
                onToggleDaily={onToggleDaily}
                enterDelay={0.08 + index * 0.08}
              />
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {clearedToday.length > 0 && (
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <div className="flex items-center gap-2 text-[10px] tracking-[0.35em] font-bold text-emerald-300/80">
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
                  CLEARED TODAY
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
                </div>
                <div className="grid gap-3">
                  <AnimatePresence mode="popLayout">
                    {clearedToday.map((m, index) => (
                      <MissionCard
                        key={m.id}
                        mission={m}
                        onComplete={onComplete}
                        onDelete={onDelete}
                        isDaily={dailySelected.includes(m.id)}
                        dailyFull={dailySelected.length >= 4}
                        onToggleDaily={onToggleDaily}
                        enterDelay={0.04 + index * 0.05}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
