import React from 'react'
import { Zap } from 'lucide-react'

interface XPCounterProps {
  currentXP: number
  nextLevelXP: number
  level: number
}

export const XPCounter: React.FC<XPCounterProps> = ({ currentXP, nextLevelXP, level }) => {
  const progressPercentage = (currentXP / nextLevelXP) * 100

  return (
    <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-medium text-amber-200">Level {level}</span>
        </div>
        <span className="text-xs text-amber-200">
          {currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
        </span>
      </div>

      <div className="w-full h-2 bg-amber-900/30 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="mt-1 text-xs text-amber-200/70">
        {Math.round(progressPercentage)}% to next level
      </div>
    </div>
  )
}
