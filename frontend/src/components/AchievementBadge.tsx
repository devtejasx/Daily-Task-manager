import React from 'react'
import { Star, Trophy, Award } from 'lucide-react'

export interface Achievement {
  _id: string
  name: string
  description: string
  icon: string
  badge: string
  points: number
  unlockedAt?: Date
}

interface AchievementBadgeProps {
  achievement: Achievement
  unlocked?: boolean
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({ achievement, unlocked = false }) => {
  const getBadgeIcon = () => {
    const iconProps = 'w-6 h-6'
    if (achievement.icon === 'star') return <Star className={`${iconProps} text-yellow-400`} />
    if (achievement.icon === 'trophy') return <Trophy className={`${iconProps} text-amber-500`} />
    if (achievement.icon === 'award') return <Award className={`${iconProps} text-purple-500`} />
    return <Award className={`${iconProps} text-gray-400`} />
  }

  return (
    <div
      className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
        unlocked
          ? 'bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-400/50 cursor-pointer hover:border-purple-300'
          : 'bg-gray-900/50 border-gray-700/50 opacity-50 grayscale'
      }`}
    >
      <div className="text-3xl">{getBadgeIcon()}</div>

      <div className="text-center">
        <div className="text-xs font-bold text-white">{achievement.name}</div>
        <div className="text-xs text-gray-300 line-clamp-2">{achievement.description}</div>
      </div>

      {unlocked && (
        <div className="text-xs font-semibold text-yellow-300 mt-1">
          +{achievement.points} pts
        </div>
      )}
    </div>
  )
}
