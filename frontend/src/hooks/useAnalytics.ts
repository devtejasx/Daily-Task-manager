import { useState, useCallback } from 'react'
import { apiClient } from '@/services/api'

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

interface DashboardStats {
  todayCompleted: number
  todayTotal: number
  weekCompleted: number
  weekTotal: number
  monthCompleted: number
  monthTotal: number
  currentStreak: number
  longestStreak: number
  totalCompleted: number
  overdueTasks: number
}

interface ChartData {
  date?: string
  category?: string
  priority?: string
  total: number
  completed: number
  completionRate: number
}

export function useAnalytics() {
  const [productivityMetrics, setProductivityMetrics] = useState<ProductivityMetrics | null>(null)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [dailyCompletion, setDailyCompletion] = useState<Record<string, number> | null>(null)
  const [categoryBreakdown, setCategoryBreakdown] = useState<ChartData[] | null>(null)
  const [priorityBreakdown, setPriorityBreakdown] = useState<ChartData[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch all productivity metrics
   */
  const fetchProductivityMetrics = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.getProductivityMetrics()
      setProductivityMetrics(response.data)
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch productivity metrics')
      console.error('Error fetching productivity metrics:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Fetch dashboard statistics
   */
  const fetchDashboardStats = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.getDashboardStats()
      setDashboardStats(response.data)
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch dashboard stats')
      console.error('Error fetching dashboard stats:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Fetch daily completion data for charts
   */
  const fetchDailyCompletion = useCallback(async (days: number = 30) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.getDailyCompletion(days)
      setDailyCompletion(response.data)
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch daily completion data')
      console.error('Error fetching daily completion:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Fetch category breakdown for charts
   */
  const fetchCategoryBreakdown = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.getCategoryBreakdown()
      setCategoryBreakdown(response.data)
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch category breakdown')
      console.error('Error fetching category breakdown:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Fetch priority breakdown for charts
   */
  const fetchPriorityBreakdown = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.getPriorityBreakdown()
      setPriorityBreakdown(response.data)
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch priority breakdown')
      console.error('Error fetching priority breakdown:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Fetch all analytics data at once
   */
  const fetchAllAnalytics = useCallback(async (days: number = 30) => {
    try {
      setIsLoading(true)
      setError(null)
      const [metrics, stats, completion, categories, priorities] = await Promise.all([
        apiClient.getProductivityMetrics(),
        apiClient.getDashboardStats(),
        apiClient.getDailyCompletion(days),
        apiClient.getCategoryBreakdown(),
        apiClient.getPriorityBreakdown(),
      ])

      setProductivityMetrics(metrics.data)
      setDashboardStats(stats.data)
      setDailyCompletion(completion.data)
      setCategoryBreakdown(categories.data)
      setPriorityBreakdown(priorities.data)
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch analytics')
      console.error('Error fetching analytics:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    // State
    productivityMetrics,
    dashboardStats,
    dailyCompletion,
    categoryBreakdown,
    priorityBreakdown,
    isLoading,
    error,

    // Methods
    fetchProductivityMetrics,
    fetchDashboardStats,
    fetchDailyCompletion,
    fetchCategoryBreakdown,
    fetchPriorityBreakdown,
    fetchAllAnalytics,
  }
}
