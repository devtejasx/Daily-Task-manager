'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useAnalytics } from '@/hooks/useAnalytics'
import { motion } from 'framer-motion'
import { TrendingUp, BarChart3, Target, Zap, Download, RefreshCw, Calendar } from 'lucide-react'
import { CategoryChart } from '@/components/charts/CategoryChart'
import { PriorityChart } from '@/components/charts/PriorityChart'
import { CompletionChart } from '@/components/charts/CompletionChart'

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
  const { productivityMetrics, dashboardStats, dailyCompletion, categoryBreakdown, priorityBreakdown, isLoading: analyticsLoading, fetchAllAnalytics } = useAnalytics()
  const [selectedPeriod, setSelectedPeriod] = useState<30 | 7 | 90>(30)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllAnalytics(selectedPeriod)
    }
  }, [isAuthenticated, selectedPeriod])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchAllAnalytics(selectedPeriod)
    setIsRefreshing(false)
  }

  const handleDownloadReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      period: selectedPeriod,
      metrics: productivityMetrics,
      stats: dashboardStats,
    }
    const dataStr = JSON.stringify(report, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex justify-between items-center"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2">Analytics & Reports 📊</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Detailed insights into your productivity and task completion patterns
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </motion.div>

      {/* Period Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 flex gap-4"
      >
        {[{ label: 'Last 7 Days', value: 7 }, { label: 'Last 30 Days', value: 30 }, { label: 'Last 90 Days', value: 90 }].map((period) => (
          <button
            key={period.value}
            onClick={() => setSelectedPeriod(period.value as 7 | 30 | 90)}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              selectedPeriod === period.value
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {period.label}
          </button>
        ))}
      </motion.div>

      {/* Key Metrics Grid */}
      {productivityMetrics && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-6">Key Metrics</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              {
                icon: TrendingUp,
                label: 'Completion Rate',
                value: `${productivityMetrics.completionRate}%`,
                color: 'from-blue-500 to-cyan-500',
              },
              {
                icon: Zap,
                label: 'On-Time Rate',
                value: `${productivityMetrics.onTimeRate}%`,
                color: 'from-green-500 to-emerald-500',
              },
              {
                icon: Target,
                label: 'Consistency Score',
                value: `${productivityMetrics.consistencyScore}%`,
                color: 'from-purple-500 to-pink-500',
              },
              {
                icon: BarChart3,
                label: 'Peak Hour',
                value: `${productivityMetrics.peakProductivityHour}:00`,
                color: 'from-orange-500 to-red-500',
              },
            ].map((metric, i) => {
              const Icon = metric.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className={`p-6 rounded-lg bg-gradient-to-br ${metric.color} text-white shadow-lg`}
                >
                  <Icon size={24} className="mb-2 opacity-80" />
                  <p className="text-sm opacity-80">{metric.label}</p>
                  <p className="text-3xl font-bold">{metric.value}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.section>
      )}

      {/* Charts Section */}
      {categoryBreakdown && priorityBreakdown && dailyCompletion && !analyticsLoading && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold mb-6">Detailed Charts</h2>
          <div className="space-y-6">
            {/* Daily Completion Trend */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="p-6 bg-gray-900/50 border border-gray-700/50 rounded-lg"
            >
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Calendar size={20} />
                Completion Trend (Last {selectedPeriod} Days)
              </h3>
              {Object.keys(dailyCompletion).length > 0 ? (
                <CompletionChart data={dailyCompletion} height={400} />
              ) : (
                <p className="text-gray-400 text-center py-12">No completion data available</p>
              )}
            </motion.div>

            {/* Charts Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Category Chart */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45 }}
                className="p-6 bg-gray-900/50 border border-gray-700/50 rounded-lg"
              >
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <BarChart3 size={20} />
                  Tasks by Category
                </h3>
                {categoryBreakdown.length > 0 ? (
                  <CategoryChart data={categoryBreakdown} height={350} />
                ) : (
                  <p className="text-gray-400 text-center py-12">No category data available</p>
                )}
              </motion.div>

              {/* Priority Chart */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="p-6 bg-gray-900/50 border border-gray-700/50 rounded-lg"
              >
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <TrendingUp size={20} />
                  Tasks by Priority
                </h3>
                {priorityBreakdown.length > 0 ? (
                  <PriorityChart data={priorityBreakdown} height={350} />
                ) : (
                  <p className="text-gray-400 text-center py-12">No priority data available</p>
                )}
              </motion.div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Summary Statistics */}
      {dashboardStats && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mt-8"
        >
          <h2 className="text-2xl font-bold mb-6">Summary</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: 'Today', completed: dashboardStats.todayCompleted, total: dashboardStats.todayTotal },
              { label: 'This Week', completed: dashboardStats.weekCompleted, total: dashboardStats.weekTotal },
              { label: 'This Month', completed: dashboardStats.monthCompleted, total: dashboardStats.monthTotal },
              { label: 'Total', completed: dashboardStats.totalCompleted, total: dashboardStats.totalCompleted + dashboardStats.overdueTasks },
            ].map((summary, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 + i * 0.05 }}
                className="p-6 bg-gray-900/50 border border-gray-700/50 rounded-lg"
              >
                <p className="text-gray-400 text-sm mb-4">{summary.label}</p>
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <p className="text-3xl font-bold text-green-400">{summary.completed}</p>
                    <p className="text-gray-400 text-sm">completed</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-3xl font-bold text-gray-400">{summary.total}</p>
                    <p className="text-gray-400 text-sm">total</p>
                  </div>
                </div>
                <div className="mt-4 w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${summary.total > 0 ? (summary.completed / summary.total) * 100 : 0}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Loading State */}
      {analyticsLoading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4 mx-auto" />
            <p className="text-gray-400">Loading analytics...</p>
          </div>
        </div>
      )}
    </main>
  )
}
