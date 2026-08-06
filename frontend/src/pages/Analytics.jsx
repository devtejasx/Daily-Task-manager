import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  CalendarRange,
  Flame,
  Percent,
  Trophy,
  Layers,
  Gauge,
  Zap,
} from "lucide-react";
import StatCard from "../components/StatCard";
import ChartFrame, { axisStyle, tooltipStyle } from "../components/analytics/ChartFrame";
import HeatmapCalendar from "../components/analytics/HeatmapCalendar";
import {
  categoryBreakdown,
  computeSummary,
  dailySeries,
  heatmap,
  longestActiveRun,
  weeklySeries,
} from "../utils/analytics";

const CATEGORY_COLORS = ["#7c3aed", "#06b6d4", "#10b981", "#f59e0b", "#a78bfa", "#3b82f6", "#ef4444"];

/** Nothing cleared yet — explain what will appear here instead of empty axes. */
function EmptyState() {
  return (
    <div className="glass rounded-2xl p-10 text-center flex flex-col items-center">
      <div className="p-3 rounded-xl border border-cyan-400/25 bg-cyan-400/10 mb-4">
        <BarChart3 size={22} className="text-cyan-300" aria-hidden />
      </div>
      <h3 className="font-display font-bold text-slate-200 tracking-wide">NO DATA TO ANALYSE YET</h3>
      <p className="text-sm text-slate-500 mt-1.5 max-w-sm">
        Clear your first mission and the system will start charting your completion rate, XP curve
        and streaks here.
      </p>
    </div>
  );
}

export default function Analytics({ missions = [], history = [], streak = 0, longestStreak = 0, totalXP = 0 }) {
  const state = useMemo(
    () => ({ missions, history, streak, longestStreak, totalXP }),
    [missions, history, streak, longestStreak, totalXP]
  );

  const summary = useMemo(() => computeSummary(state), [state]);
  const daily = useMemo(() => dailySeries(history, 7), [history]);
  const weekly = useMemo(() => weeklySeries(history, 8), [history]);
  const cells = useMemo(() => heatmap(history, 119), [history]);
  const categories = useMemo(() => categoryBreakdown(history), [history]);
  const activeRun = useMemo(() => longestActiveRun(history), [history]);

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="font-display font-black text-2xl text-slate-100 text-glow-arcane">
          SYSTEM ANALYTICS
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Everything the system has recorded about your ascent.
        </p>
      </motion.div>

      {history.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* headline numbers */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              icon={Percent}
              label="Completion Rate"
              value={Math.round(summary.completionRate * 100)}
              suffix="%"
              accent="#06b6d4"
              delay={0.06}
            />
            <StatCard
              icon={Zap}
              label="XP This Week"
              value={summary.weeklyXP}
              accent="#f59e0b"
              delay={0.12}
            />
            <StatCard
              icon={Zap}
              label="XP This Month"
              value={summary.monthlyXP}
              accent="#a78bfa"
              delay={0.18}
            />
            <StatCard
              icon={Gauge}
              label="Avg Tasks / Day"
              value={Math.round(summary.averagePerDay * 10) / 10}
              decimals={1}
              accent="#10b981"
              delay={0.24}
            />
            <StatCard
              icon={Flame}
              label="Current Streak"
              value={summary.currentStreak}
              suffix=" d"
              accent="#f59e0b"
              delay={0.3}
            />
            <StatCard
              icon={Trophy}
              label="Longest Streak"
              value={summary.longestStreak}
              suffix=" d"
              accent="#7c3aed"
              delay={0.36}
            />
            <StatCard
              icon={CalendarRange}
              label="Active Days"
              value={summary.activeDays}
              accent="#3b82f6"
              delay={0.42}
            />
            <StatCard
              icon={Layers}
              label="Total Cleared"
              value={summary.totalCompleted}
              accent="#10b981"
              delay={0.48}
            />
          </div>

          {summary.topCategory && (
            <motion.p
              className="text-xs text-slate-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Most cleared category:{" "}
              <span className="font-bold text-violet-300">{summary.topCategory.category}</span> ·{" "}
              {summary.topCategory.count} missions ·{" "}
              {summary.topCategory.xp.toLocaleString()} XP · longest active run{" "}
              <span className="font-bold text-cyan-300">{activeRun}d</span>
            </motion.p>
          )}

          {/* weekly completion graph */}
          <ChartFrame
            title="WEEKLY COMPLETIONS"
            icon={BarChart3}
            subtitle="Missions cleared per day over the last 7 days."
            delay={0.5}
          >
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={daily} margin={{ top: 4, right: 8, bottom: 0, left: -22 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
                  <XAxis dataKey="label" {...axisStyle} />
                  <YAxis allowDecimals={false} {...axisStyle} />
                  <Tooltip
                    {...tooltipStyle}
                    formatter={(value, name) => [value, name === "completed" ? "Cleared" : "XP"]}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.shortDate ?? ""}
                  />
                  <Bar dataKey="completed" radius={[6, 6, 0, 0]} fill="#7c3aed" maxBarSize={38}>
                    {daily.map((d) => (
                      <Cell key={d.day} fill={d.completed > 0 ? "#7c3aed" : "rgba(148,163,184,0.15)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartFrame>

          <div className="grid lg:grid-cols-2 gap-4">
            {/* XP trend */}
            <ChartFrame
              title="XP PER WEEK"
              icon={Zap}
              subtitle="Experience earned in each of the last 8 weeks."
              delay={0.56}
            >
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weekly} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
                    <defs>
                      <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.55} />
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.04} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
                    <XAxis dataKey="label" {...axisStyle} />
                    <YAxis {...axisStyle} width={54} />
                    <Tooltip {...tooltipStyle} formatter={(v) => [`${v.toLocaleString()} XP`, "Earned"]} />
                    <Area
                      type="monotone"
                      dataKey="xp"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      fill="url(#xpGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartFrame>

            {/* category split */}
            <ChartFrame
              title="CATEGORY SPLIT"
              icon={Layers}
              subtitle="Where your cleared missions came from."
              delay={0.62}
            >
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      dataKey="count"
                      nameKey="category"
                      innerRadius={44}
                      outerRadius={72}
                      paddingAngle={3}
                      stroke="rgba(5,6,10,0.6)"
                    >
                      {categories.map((c, i) => (
                        <Cell key={c.category} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipStyle} formatter={(v, n) => [`${v} cleared`, n]} />
                    <Legend
                      verticalAlign="bottom"
                      height={28}
                      formatter={(value) => (
                        <span style={{ color: "#94a3b8", fontSize: 11 }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartFrame>
          </div>

          {/* monthly heatmap */}
          <ChartFrame
            title="ACTIVITY HEATMAP"
            icon={CalendarRange}
            subtitle="Every day of the last four months. Brighter means busier."
            delay={0.68}
          >
            <HeatmapCalendar cells={cells} />
          </ChartFrame>
        </>
      )}
    </div>
  );
}
