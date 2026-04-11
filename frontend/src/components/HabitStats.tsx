import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Flame, Target, TrendingUp } from 'lucide-react'

interface HabitStatsProps {
  totalHabits: number
  activeHabits: number
  averageStreak: number
  longestStreak: number
  completionRateLast30: number
  completionsLast30Days: number
  completionData?: Record<string, number>
}

export const HabitStats: React.FC<HabitStatsProps> = ({
  totalHabits,
  activeHabits,
  averageStreak,
  longestStreak,
  completionRateLast30,
  completionsLast30Days,
  completionData,
}) => {
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    if (completionData) {
      const data = Object.entries(completionData).map(([date, completed]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completed,
      }))
      setChartData(data)
    }
  }, [completionData])

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          {
            icon: Target,
            label: 'Active Habits',
            value: activeHabits,
            subtext: `of ${totalHabits}`,
            color: 'from-blue-500 to-cyan-500',
          },
          {
            icon: Flame,
            label: 'Average Streak',
            value: averageStreak,
            subtext: 'days',
            color: 'from-orange-500 to-red-500',
          },
          {
            icon: TrendingUp,
            label: 'Best Streak',
            value: longestStreak,
            subtext: 'days',
            color: 'from-green-500 to-emerald-500',
          },
          {
            icon: Target,
            label: 'Completion Rate',
            value: `${completionRateLast30}%`,
            subtext: 'last 30 days',
            color: 'from-purple-500 to-pink-500',
          },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-4 rounded-lg bg-gradient-to-br ${stat.color} text-white shadow-lg`}
            >
              <Icon size={20} className="mb-2 opacity-80" />
              <p className="text-sm opacity-80">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs opacity-70">{stat.subtext}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Completion Chart */}
      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 bg-gray-900/50 border border-gray-700/50 rounded-lg"
        >
          <h3 className="text-lg font-bold text-white mb-4">Last 30 Days</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="completed" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  )
}
