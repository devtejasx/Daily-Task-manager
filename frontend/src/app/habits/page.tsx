'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import { Plus, Settings } from 'lucide-react'
import { HabitCard } from '@/components/HabitCard'
import { HabitStats } from '@/components/HabitStats'
import { apiClient } from '@/services/api'
import { useWebSocket } from '@/hooks/useWebSocket'

interface Habit {
  _id: string
  name: string
  category: string
  frequency: 'daily' | 'weekly' | 'monthly'
  streak: number
  longestStreak: number
  icon?: string
  color?: string
  completedDates: string[]
}

interface HabitStatsData {
  totalHabits: number
  activeHabits: number
  averageStreak: number
  longestStreak: number
  completionRateLast30: number
  completionsLast30Days: number
}

export default function HabitsPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const { emit } = useWebSocket()
  const [habits, setHabits] = useState<Habit[]>([])
  const [stats, setStats] = useState<HabitStatsData | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchHabits()
    }
  }, [isAuthenticated])

  const fetchHabits = async () => {
    try {
      setDataLoading(true)
      const [habitsRes, statsRes] = await Promise.all([
        apiClient.getUserHabits(false),
        apiClient.getHabitStats(),
      ])

      setHabits(habitsRes.data.data || [])
      setStats(statsRes.data.data)

      // Check completed today
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const completed = new Set<string>()
      habitsRes.data.data?.forEach((habit: Habit) => {
        const hasToday = habit.completedDates?.some((date) => {
          const d = new Date(date)
          d.setHours(0, 0, 0, 0)
          return d.getTime() === today.getTime()
        })

        if (hasToday) {
          completed.add(habit._id)
        }
      })

      setCompletedToday(completed)
    } catch (error) {
      console.error('Failed to fetch habits:', error)
    } finally {
      setDataLoading(false)
    }
  }

  const handleCompleteHabit = async (habitId: string) => {
    try {
      const response = await apiClient.completeHabit(habitId)
      const updatedHabit = response.data.data

      setHabits((prev) =>
        prev.map((h) => (h._id === habitId ? updatedHabit : h))
      )

      const newCompleted = new Set(completedToday)
      if (response.data.streakIncreased) {
        newCompleted.add(habitId)
      }
      setCompletedToday(newCompleted)

      // Emit real-time event
      emit('habit_completed', { habitId, streak: updatedHabit.streak })

      // Refresh stats
      const statsRes = await apiClient.getHabitStats()
      setStats(statsRes.data.data)
    } catch (error) {
      console.error('Failed to complete habit:', error)
    }
  }

  if (isLoading || !isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2">Build Habits 🚀</h1>
          <p className="text-gray-400">Track daily habits and build consistent routines</p>
        </div>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          New Habit
        </button>
      </motion.div>

      {/* Stats */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <HabitStats
            totalHabits={stats.totalHabits}
            activeHabits={stats.activeHabits}
            averageStreak={stats.averageStreak}
            longestStreak={stats.longestStreak}
            completionRateLast30={stats.completionRateLast30}
            completionsLast30Days={stats.completionsLast30Days}
          />
        </motion.div>
      )}

      {/* Habits Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {habits.length > 0 ? (
          habits.map((habit) => (
            <HabitCard
              key={habit._id}
              id={habit._id}
              name={habit.name}
              category={habit.category}
              frequency={habit.frequency}
              streak={habit.streak}
              longestStreak={habit.longestStreak}
              completedToday={completedToday.has(habit._id)}
              icon={habit.icon || '⭐'}
              color={habit.color || '#3b82f6'}
              onComplete={() => handleCompleteHabit(habit._id)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400 mb-4">No habits yet. Create one to get started!</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              Create First Habit
            </button>
          </div>
        )}
      </motion.div>
    </main>
  )
}
