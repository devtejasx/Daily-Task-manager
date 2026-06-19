import React from 'react'
import { Flame } from 'lucide-react'

interface StreakCounterProps {
  currentStreak: number
  longestStreak: number
  isMilestone?: boolean
}

export const StreakCounter: React.FC<StreakCounterProps> = ({
  currentStreak,
  longestStreak,
  isMilestone = false,
}) => {
  const getMilestoneColor = () => {
    if (!isMilestone) return 'text-orange-500'
    if (currentStreak >= 100) return 'text-purple-500'
    if (currentStreak >= 60) return 'text-blue-500'
    if (currentStreak >= 30) return 'text-green-500'
    return 'text-orange-500'
  }

  return (
    <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className={`w-5 h-5 ${getMilestoneColor()}`} />
          <span className="text-sm font-medium text-orange-200">Current Streak</span>
        </div>
        <div className={`text-2xl font-bold ${getMilestoneColor()}`}>{currentStreak}</div>
      </div>

      <div className="flex items-center justify-between text-xs text-orange-200/70">
        <span>🏆 Best: {longestStreak} days</span>
        {isMilestone && <span className="text-yellow-400 font-semibold">✨ Milestone!</span>}
      </div>
    </div>
  )
}
