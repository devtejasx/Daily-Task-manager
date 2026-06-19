import React from 'react'
import { TrendingUp } from 'lucide-react'

interface LevelProgressProps {
  currentLevel: number
  currentXP: number
  xpInCurrentLevel: number
  xpNeededForNextLevel: number
  showDetails?: boolean
}

export const LevelProgress: React.FC<LevelProgressProps> = ({
  currentLevel,
  currentXP,
  xpInCurrentLevel,
  xpNeededForNextLevel,
  showDetails = true,
}) => {
  const progressPercentage = (xpInCurrentLevel / xpNeededForNextLevel) * 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <span className="font-semibold text-white">Level {currentLevel}</span>
        </div>
        {showDetails && (
          <span className="text-xs text-gray-400">
            {xpInCurrentLevel} / {xpNeededForNextLevel} XP
          </span>
        )}
      </div>

      <div className="w-full h-3 bg-gray-700/50 rounded-full overflow-hidden border border-gray-600">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
        />
      </div>

      {showDetails && (
        <div className="flex justify-between text-xs text-gray-400">
          <span>{Math.round(progressPercentage)}% progress</span>
          <span>Total: {currentXP.toLocaleString()} XP</span>
        </div>
      )}
    </div>
  )
}
