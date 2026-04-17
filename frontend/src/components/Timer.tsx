import React, { useState, useEffect } from 'react'
import { Play, Pause, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { api } from '@/services/api'

interface TimerProps {
  taskId: string
  onStop: (minutes: number) => void
}

export const Timer: React.FC<TimerProps> = ({ taskId, onStop }) => {
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [focusMode, setFocusMode] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Pomodoro defaults: 25 min work, 5 min break
  const WORK_DURATION = 25 * 60
  const BREAK_DURATION = 5 * 60

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1)
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isRunning, isPaused])

  const handleStart = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.startTimer(taskId, focusMode)

      if (response.data?.success) {
        setSessionId(response.data.data._id)
        setIsRunning(true)
        setSeconds(0)
      } else {
        setError('Failed to start timer')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to start timer')
      console.error('Failed to start timer:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStop = async () => {
    if (!sessionId) return

    try {
      setLoading(true)
      setError(null)
      const response = await api.stopTimer(sessionId)

      if (response.data?.success) {
        setIsRunning(false)
        setSeconds(0)
        setSessionId(null)
        onStop(response.data.durationMinutes)
      } else {
        setError('Failed to stop timer')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to stop timer')
      console.error('Failed to stop timer:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePause = async () => {
    if (!sessionId) return

    try {
      setLoading(true)
      setError(null)
      const response = await api.pauseTimer(sessionId, !isPaused)

      if (response.data?.success) {
        setIsPaused(!isPaused)
      } else {
        setError('Failed to pause timer')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to pause timer')
      console.error('Failed to pause timer:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <motion.div
      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Timer Display */}
      <div className="text-center mb-6">
        <div
          className={`text-6xl font-bold font-mono transition-colors duration-300 ${
            isPaused ? 'text-yellow-600' : isRunning ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          {formatTime(seconds)}
        </div>
        <p className="text-sm text-gray-600 mt-3 font-medium">
          {focusMode ? '🎯 Focus Mode - No Notifications' : 'Standard Timer'}
        </p>
      </div>

      {/* Status Messages */}
      {error && (
        <motion.div
          className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.div>
      )}

      {isPaused && isRunning && (
        <motion.div
          className="mb-4 rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-700 text-center font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          ⏸ Timer Paused
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex gap-3 justify-center mb-6">
        {!isRunning ? (
          <button
            onClick={handleStart}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            <Play size={20} />
            {loading ? 'Starting...' : 'Start Timer'}
          </button>
        ) : (
          <>
            <button
              onClick={handlePause}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-medium rounded-lg hover:from-yellow-600 hover:to-amber-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              <Pause size={20} />
              {loading ? 'Processing...' : isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={handleStop}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-rose-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              <X size={20} />
              {loading ? 'Stopping...' : 'Stop'}
            </button>
          </>
        )}
      </div>

      {/* Focus Mode Toggle */}
      <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-white/50 border border-gray-200">
        <input
          type="checkbox"
          id="focusMode"
          checked={focusMode}
          onChange={(e) => setFocusMode(e.target.checked)}
          disabled={isRunning}
          className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        />
        <label htmlFor="focusMode" className="text-sm font-medium text-gray-700 cursor-pointer">
          Focus Mode (no notifications)
        </label>
      </div>

      {/* Quick Info */}
      {isRunning && (
        <motion.div
          className="mt-6 pt-4 border-t border-blue-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-xs text-gray-600 text-center">
            {isPaused ? (
              <span className="font-medium text-yellow-700">⏸ Timer is paused</span>
            ) : (
              <span>⏱ Timer is running...</span>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default Timer
