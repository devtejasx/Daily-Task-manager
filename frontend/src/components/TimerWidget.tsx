// File: frontend/src/components/TimerWidget.tsx
// Example timer component using the useTimer hook

import React, { useState, useEffect } from 'react'
import { useTimer } from '../hooks/useTimer'

interface TimerWidgetProps {
  taskId: string
  taskTitle: string
}

export const TimerWidget: React.FC<TimerWidgetProps> = ({ taskId, taskTitle }) => {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [displayTime, setDisplayTime] = useState('00:00:00')

  const {
    currentSession,
    isPaused,
    history,
    dailyStats,
    loading,
    startTimer,
    stopTimer,
    pauseTimer,
    fetchDailyStats,
  } = useTimer({
    taskId,
    onSessionStart: (session) => {
      console.log('Timer started:', session)
      setElapsedTime(0)
    },
    onSessionStop: (session, minutes) => {
      console.log(`Timer stopped. Duration: ${minutes} minutes`)
      fetchDailyStats()
    },
    onError: (error) => {
      console.error('Timer error:', error)
      alert(`Error: ${error}`)
    },
  })

  // Update display time
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentSession && !isPaused) {
        setElapsedTime((prev) => prev + 1)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [currentSession, isPaused])

  useEffect(() => {
    const hours = Math.floor(elapsedTime / 3600)
    const minutes = Math.floor((elapsedTime % 3600) / 60)
    const seconds = elapsedTime % 60

    setDisplayTime(
      `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(
        seconds
      ).padStart(2, '0')}`
    )
  }, [elapsedTime])

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">{taskTitle}</h2>

      {/* Timer Display */}
      <div className="mb-6 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-8 text-center">
        <div className="text-5xl font-mono font-bold text-blue-600">{displayTime}</div>
        <div className="mt-2 text-sm text-gray-600">
          {currentSession ? (isPaused ? 'Paused' : 'Running') : 'Not started'}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {!currentSession ? (
          <>
            <button
              onClick={() => startTimer(false)}
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Starting...' : 'Start Timer'}
            </button>
            <button
              onClick={() => startTimer(true)}
              disabled={loading}
              className="flex-1 rounded-lg bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Starting...' : 'Focus Mode'}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={pauseTimer}
              disabled={loading}
              className="flex-1 rounded-lg bg-yellow-600 px-4 py-2 font-medium text-white hover:bg-yellow-700 disabled:opacity-50"
            >
              {loading ? 'Pausing...' : isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={stopTimer}
              disabled={loading}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Stopping...' : 'Stop'}
            </button>
          </>
        )}
      </div>

      {/* Session Info */}
      {currentSession && (
        <div className="mt-6 rounded-lg bg-gray-50 p-4">
          <div className="text-sm text-gray-600">
            <div>
              Type:{' '}
              <span className="font-medium capitalize">{currentSession.sessionType}</span>
            </div>
            {currentSession.focusMode && (
              <div>
                <span className="inline-block rounded-full bg-purple-200 px-2 py-1 text-xs font-semibold text-purple-800">
                  Focus Mode
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Daily Stats */}
      {dailyStats && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <h3 className="mb-3 font-semibold text-gray-800">Today's Stats</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded bg-blue-50 p-3">
              <div className="text-gray-600">Total Time</div>
              <div className="text-lg font-bold text-blue-600">
                {dailyStats.totalMinutesToday} min
              </div>
            </div>
            <div className="rounded bg-green-50 p-3">
              <div className="text-gray-600">Sessions</div>
              <div className="text-lg font-bold text-green-600">
                {dailyStats.sessionsCount}
              </div>
            </div>
            <div className="rounded bg-purple-50 p-3">
              <div className="text-gray-600">Focus Sessions</div>
              <div className="text-lg font-bold text-purple-600">
                {dailyStats.focusSessionsCount}
              </div>
            </div>
            <div className="rounded bg-orange-50 p-3">
              <div className="text-gray-600">Avg Session</div>
              <div className="text-lg font-bold text-orange-600">
                {dailyStats.averageSessionMinutes} min
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <h3 className="mb-3 font-semibold text-gray-800">Recent Sessions</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {history.slice(0, 5).map((session) => (
              <div key={session._id} className="flex justify-between rounded bg-gray-50 p-2 text-sm">
                <div>
                  <div className="font-medium capitalize">{session.sessionType}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(session.startedAt).toLocaleTimeString()}
                  </div>
                </div>
                <div className="text-right font-mono">
                  {Math.round(session.duration / 60)} min
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TimerWidget
