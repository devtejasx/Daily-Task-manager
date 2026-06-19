import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Flame, TrendingUp } from 'lucide-react'

interface HabitCardProps {
  id: string
  name: string
  category: string
  frequency: 'daily' | 'weekly' | 'monthly'
  streak: number
  longestStreak: number
  completedToday?: boolean
  icon?: string
  color?: string
  onComplete: () => void
}

export const HabitCard: React.FC<HabitCardProps> = ({
  id,
  name,
  category,
  frequency,
  streak,
  longestStreak,
  completedToday = false,
  icon = '⭐',
  color = '#3b82f6',
  onComplete,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg hover:border-gray-600/50 transition"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="text-3xl">{icon}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold">{name}</h3>
            <p className="text-sm text-gray-400">{category}</p>
            <div className="flex items-center gap-2 mt-2">
              <span
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded"
                style={{
                  backgroundColor: `${color}20`,
                  color: color,
                }}
              >
                {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onComplete}
          className={`p-2 rounded-lg transition ${
            completedToday
              ? 'bg-green-500/20 text-green-400'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          }`}
          title={completedToday ? 'Completed today' : 'Mark complete'}
        >
          {completedToday ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : (
            <Circle className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Streak Display */}
      <div className="flex items-center gap-4 bg-gray-900/50 p-3 rounded">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          <div>
            <p className="text-xs text-gray-400">Streak</p>
            <p className="text-lg font-bold text-orange-400">{streak}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          <div>
            <p className="text-xs text-gray-400">Best</p>
            <p className="text-lg font-bold text-blue-400">{longestStreak}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
