'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useTasks } from '@/hooks/useTasks'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Award } from 'lucide-react'
import { TaskCard } from '@/components/TaskCard'
import { XPCounter } from '@/components/XPCounter'
import { StreakCounter } from '@/components/StreakCounter'
import { LevelProgress } from '@/components/LevelProgress'
import { apiClient } from '@/services/api'

interface GameStats {
  level: number
  totalXP: number
  currentStreak: number
  longestStreak: number
  completedTasks: number
  achievements: number
  levelProgress: number
  nextLevelXP: number
}

export default function Dashboard() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { tasks, fetchTasks, completeTaskItem } = useTasks()
  const [gameStats, setGameStats] = useState<GameStats | null>(null)
  const [gameLoading, setGameLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks()
      fetchGameStats()
    }
  }, [isAuthenticated])

  const fetchGameStats = async () => {
    try {
      setGameLoading(true)
      const response = await apiClient.getGamificationStats()
      setGameStats(response.data)
    } catch (error) {
      console.error('Failed to fetch game stats:', error)
    } finally {
      setGameLoading(false)
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!isAuthenticated) {
    return null
  }

  const today = new Date()
  const todayTasks = tasks.filter((t) => {
    if (!t.dueDate) return false
    const dueDate = new Date(t.dueDate)
    return (
      dueDate.toDateString() === today.toDateString() &&
      t.status !== 'Completed'
    )
  })

  const completedToday = tasks.filter((t) => {
    if (!t.completedAt) return false
    const completedDate = new Date(t.completedAt)
    return completedDate.toDateString() === today.toDateString()
  }).length

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Keep up your streak of {user?.streak || 0} days 🔥
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          {gameStats && <XPCounter currentXP={gameStats.totalXP} nextLevelXP={gameStats.nextLevelXP} level={gameStats.level} />}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {gameStats && (
            <StreakCounter
              currentStreak={gameStats.currentStreak}
              longestStreak={gameStats.longestStreak}
              isMilestone={gameStats.currentStreak >= 7}
            />
          )}
        </motion.div>
      </div>

      {/* Level Progress */}
      {gameStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 p-4 bg-gray-900/50 border border-gray-700/50 rounded-lg"
        >
          <LevelProgress
            currentLevel={gameStats.level}
            currentXP={gameStats.totalXP}
            xpInCurrentLevel={gameStats.totalXP - ([0, 100, 350, 800, 1500, 2500, 3500, 4500, 5500, 6500, 8500, 10500, 12500, 14500, 16500, 18500, 20500, 22500, 24500, 26500, 31500, 36500, 41500, 46500, 51500, 61500, 71500, 81500, 91500, 101500, 151500, 201500, 251500, 301500, 351500, 401500, 451500, 501500, 551500, 601500] as number[])[gameStats.level] || 0)}
            xpNeededForNextLevel={gameStats.nextLevelXP - ([0, 100, 350, 800, 1500, 2500, 3500, 4500, 5500, 6500, 8500, 10500, 12500, 14500, 16500, 18500, 20500, 22500, 24500, 26500, 31500, 36500, 41500, 46500, 51500, 61500, 71500, 81500, 91500, 101500, 151500, 201500, 251500, 301500, 351500, 401500, 451500, 501500, 551500, 601500] as number[])[gameStats.level] || 0}
            showDetails
          />
        </motion.div>
      )}

      {/* Achievement & Stats Grid */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[
          {
            icon: BarChart3,
            label: 'Today Completed',
            value: completedToday,
            color: 'from-blue-500 to-cyan-500',
          },
          {
            icon: TrendingUp,
            label: 'Completed This Week',
            value: tasks.filter((t) => t.status === 'Completed').length,
            color: 'from-purple-500 to-pink-500',
          },
          {
            icon: Award,
            label: 'Achievements Unlocked',
            value: gameStats?.achievements || 0,
            color: 'from-green-500 to-emerald-500',
          },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className={`p-6 rounded-lg bg-gradient-to-br ${stat.color} text-white shadow-lg`}
            >
              <Icon size={24} className="mb-2 opacity-80" />
              <p className="text-sm opacity-80">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Tasks Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold mb-6">Today's Tasks</h2>
        <div className="space-y-3">
          {todayTasks.length === 0 ? (
            <p className="text-gray-500">No tasks for today. Great job!</p>
          ) : (
            todayTasks.map((task) => (
              <TaskCard
                key={task.id}
                title={task.title}
                priority={task.priority}
                dueDate={task.dueDate}
                completed={task.status === 'Completed'}
                onComplete={() => completeTaskItem(task.id)}
              />
            ))
          )}
        </div>
      </motion.section>
    </main>
  )
}
