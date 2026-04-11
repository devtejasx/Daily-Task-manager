'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { apiClient } from '@/services/api'
import { TrendingUp, BarChart3, Target, Zap } from 'lucide-react'

interface ProductivityMetrics {
  completionRate: number
  onTimeRate: number
  averageTimeSpent: number
  peakProductivityHour: number
  categoryPerformance: Record<string, number>
  priorityDistribution: Record<string, number>
  consistencyScore: number
  totalTasks: number
  completedTasks: number
  overdueTasks: number
}

interface CategoryBreakdown {
  category: string
  total: number
  completed: number
  completionRate: number
}

interface PriorityBreakdown {
  priority: string
  total: number
  completed: number
  completionRate: number
}

export default function Analytics() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [metrics, setMetrics] = useState<ProductivityMetrics | null>(null)
  const [dailyData, setDailyData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<CategoryBreakdown[]>([])
  const [priorityData, setPriorityData] = useState<PriorityBreakdown[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchAnalytics()
    }
  }, [isAuthenticated])

  const fetchAnalytics = async () => {
    try {
      setDataLoading(true)
      const [metricsRes, dailyRes, categoryRes, priorityRes] = await Promise.all([
        apiClient.getProductivityMetrics(),
        apiClient.getDailyCompletion(30),
        apiClient.getCategoryBreakdown(),
        apiClient.getPriorityBreakdown(),
      ])

      setMetrics(metricsRes.data)

      // Format daily data for chart
      const dailyArray = Object.entries(dailyRes.data).map(([date, completed]: [string, any]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completed,
      }))
      setDailyData(dailyArray)

      setCategoryData(categoryRes.data)
      setPriorityData(priorityRes.data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setDataLoading(false)
    }
  }

  if (isLoading || !isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b']

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">Analytics & Insights 📊</h1>
        <p className="text-gray-400">Track your productivity and task completion trends</p>
      </motion.div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            {
              icon: TrendingUp,
              label: 'Completion Rate',
              value: `${metrics.completionRate.toFixed(1)}%`,
              color: 'from-blue-500 to-cyan-500',
            },
            {
              icon: Zap,
              label: 'On-Time Rate',
              value: `${metrics.onTimeRate.toFixed(1)}%`,
              color: 'from-green-500 to-emerald-500',
            },
            {
              icon: Target,
              label: 'Consistency Score',
              value: `${metrics.consistencyScore.toFixed(1)}/100`,
              color: 'from-purple-500 to-pink-500',
            },
            {
              icon: BarChart3,
              label: 'Peak Hour',
              value: `${metrics.peakProductivityHour}:00`,
              color: 'from-orange-500 to-red-500',
            },
          ].map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-lg bg-gradient-to-br ${stat.color} text-white shadow-lg`}
              >
                <Icon size={24} className="mb-2 opacity-80" />
                <p className="text-sm opacity-80">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Daily Completion Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-6"
        >
          <h2 className="text-xl font-bold mb-4">30-Day Completion Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                cursor={{ stroke: '#3b82f6' }}
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#3b82f6"
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Priority Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-6"
        >
          <h2 className="text-xl font-bold mb-4">Tasks by Priority</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={priorityData}
                dataKey="total"
                nameKey="priority"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Category Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-6 mb-8"
      >
        <h2 className="text-xl font-bold mb-4">Category Performance</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="category" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="total" fill="#3b82f6" name="Total Tasks" />
            <Bar dataKey="completed" fill="#10b981" name="Completed" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Statistics Table */}
      {metrics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-6"
        >
          <h2 className="text-xl font-bold mb-4">Summary Statistics</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-gray-400">Total Tasks</p>
              <p className="text-2xl font-bold text-blue-400">{metrics.totalTasks}</p>
            </div>
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm text-gray-400">Completed Tasks</p>
              <p className="text-2xl font-bold text-green-400">{metrics.completedTasks}</p>
            </div>
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-gray-400">Overdue Tasks</p>
              <p className="text-2xl font-bold text-red-400">{metrics.overdueTasks}</p>
            </div>
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-sm text-gray-400">Average Time Spent</p>
              <p className="text-2xl font-bold text-purple-400">{metrics.averageTimeSpent} min</p>
            </div>
          </div>
        </motion.div>
      )}
    </main>
  )
}
