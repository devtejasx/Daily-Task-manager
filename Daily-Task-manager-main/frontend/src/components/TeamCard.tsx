import React from 'react'
import { motion } from 'framer-motion'
import { Users, Plus, Settings, Trash2 } from 'lucide-react'

interface TeamCardProps {
  id: string
  name: string
  description?: string
  memberCount: number
  isOwner: boolean
  onSettings?: () => void
  onDelete?: () => void
  onClick?: () => void
}

export const TeamCard: React.FC<TeamCardProps> = ({
  id,
  name,
  description,
  memberCount,
  isOwner,
  onSettings,
  onDelete,
  onClick,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg cursor-pointer transition hover:border-purple-400/50"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white">{name}</h3>
          {description && (
            <p className="text-sm text-gray-400 line-clamp-2 mt-1">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onSettings && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onSettings()
              }}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition"
              title="Team settings"
            >
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
          )}

          {isOwner && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="p-2 hover:bg-red-500/20 rounded-lg transition"
              title="Delete team"
            >
              <Trash2 className="w-5 h-5 text-red-400" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Users className="w-4 h-4" />
        <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
      </div>

      {isOwner && (
        <div className="mt-3 inline-block px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
          Owner
        </div>
      )}
    </motion.div>
  )
}
