// File: frontend/src/hooks/useTimer.ts
// React hook for timer functionality

import { useState, useCallback, useRef } from 'react'
import { ITimerSession } from '../types/timer'

interface UseTimerOptions {
  taskId: string
  onSessionStart?: (session: ITimerSession) => void
  onSessionStop?: (session: ITimerSession, minutes: number) => void
  onError?: (error: string) => void
}

export const useTimer = ({
  taskId,
  onSessionStart,
  onSessionStop,
  onError,
}: UseTimerOptions) => {
  const [currentSession, setCurrentSession] = useState<ITimerSession | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [history, setHistory] = useState<ITimerSession[]>([])
  const [dailyStats, setDailyStats] = useState<any>(null)
  const [weeklyStats, setWeeklyStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const getAuthHeader = () => {
    const token = localStorage.getItem('token') // Adjust to your auth method
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }

  const startTimer = useCallback(
    async (focusMode = false) => {
      try {
        setLoading(true)
        const response = await fetch(`/api/timer/start/${taskId}`, {
          method: 'POST',
          headers: getAuthHeader(),
          body: JSON.stringify({ focusMode }),
        })

        const data = await response.json()
        if (!data.success) throw new Error(data.error)

        setCurrentSession(data.data)
        onSessionStart?.(data.data)
      } catch (error: any) {
        onError?.(error.message)
      } finally {
        setLoading(false)
      }
    },
    [taskId, onSessionStart, onError]
  )

  const stopTimer = useCallback(async () => {
    if (!currentSession) return

    try {
      setLoading(true)
      const response = await fetch(`/api/timer/stop/${currentSession._id}`, {
        method: 'POST',
        headers: getAuthHeader(),
      })

      const data = await response.json()
      if (!data.success) throw new Error(data.error)

      setCurrentSession(null)
      onSessionStop?.(data.data, data.durationMinutes)
      await fetchHistory() // Refresh history
    } catch (error: any) {
      onError?.(error.message)
    } finally {
      setLoading(false)
    }
  }, [currentSession, onSessionStop, onError])

  const pauseTimer = useCallback(async () => {
    if (!currentSession) return

    try {
      setLoading(true)
      const response = await fetch(`/api/timer/pause/${currentSession._id}`, {
        method: 'PATCH',
        headers: getAuthHeader(),
        body: JSON.stringify({ isPaused: !isPaused }),
      })

      const data = await response.json()
      if (!data.success) throw new Error(data.error)

      setCurrentSession(data.data)
      setIsPaused(data.isPaused)
    } catch (error: any) {
      onError?.(error.message)
    } finally {
      setLoading(false)
    }
  }, [currentSession, isPaused, onError])

  const fetchHistory = useCallback(async () => {
    try {
      const response = await fetch(`/api/timer/history/${taskId}`, {
        headers: getAuthHeader(),
      })

      const data = await response.json()
      if (!data.success) throw new Error(data.error)

      setHistory(data.data.sessions)
    } catch (error: any) {
      onError?.(error.message)
    }
  }, [taskId, onError])

  const fetchDailyStats = useCallback(async () => {
    try {
      const response = await fetch('/api/timer/stats/daily', {
        headers: getAuthHeader(),
      })

      const data = await response.json()
      if (!data.success) throw new Error(data.error)

      setDailyStats(data.data)
    } catch (error: any) {
      onError?.(error.message)
    }
  }, [onError])

  const fetchWeeklyStats = useCallback(async () => {
    try {
      const response = await fetch('/api/timer/stats/weekly', {
        headers: getAuthHeader(),
      })

      const data = await response.json()
      if (!data.success) throw new Error(data.error)

      setWeeklyStats(data.data)
    } catch (error: any) {
      onError?.(error.message)
    }
  }, [onError])

  return {
    // State
    currentSession,
    isPaused,
    history,
    dailyStats,
    weeklyStats,
    loading,

    // Actions
    startTimer,
    stopTimer,
    pauseTimer,
    fetchHistory,
    fetchDailyStats,
    fetchWeeklyStats,

    // Computed
    isRunning: currentSession !== null && !isPaused,
  }
}
