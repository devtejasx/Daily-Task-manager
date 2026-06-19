'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import { Plus, Users } from 'lucide-react'
import { TeamCard } from '@/components/TeamCard'
import { apiClient } from '@/services/api'
import { useWebSocket } from '@/hooks/useWebSocket'

interface Team {
  _id: string
  name: string
  description?: string
  ownerId: { name: string; email: string }
  members: any[]
  memberRoles?: Map<string, string>
}

export default function TeamsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { emit, on, off } = useWebSocket()
  const [teams, setTeams] = useState<Team[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '' })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchTeams()
    }
  }, [isAuthenticated])

  useEffect(() => {
    // Listen for team updates
    on('team_updated', (data) => {
      setTeams((prev) =>
        prev.map((t) => (t._id === data._id ? { ...t, ...data } : t))
      )
    })

    return () => {
      off('team_updated')
    }
  }, [on, off])

  const fetchTeams = async () => {
    try {
      setDataLoading(true)
      const response = await apiClient.getUserTeams()
      setTeams(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch teams:', error)
    } finally {
      setDataLoading(false)
    }
  }

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await apiClient.createTeam(formData.name, formData.description)
      setTeams((prev) => [response.data.data, ...prev])
      setFormData({ name: '', description: '' })
      setShowCreateForm(false)

      emit('team_created', response.data.data)
    } catch (error) {
      console.error('Failed to create team:', error)
    }
  }

  const handleTeamClick = (teamId: string) => {
    router.push(`/teams/${teamId}`)
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
          <h1 className="text-4xl font-bold mb-2">Team Collaboration 👥</h1>
          <p className="text-gray-400">Work together and share tasks with your team</p>
        </div>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          New Team
        </button>
      </motion.div>

      {/* Create Team Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-8 p-6 bg-gray-800/50 border border-gray-700/50 rounded-lg"
        >
          <form onSubmit={handleCreateTeam} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Team Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Product Team"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What is this team working on?"
                rows={3}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none text-white"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
              >
                Create Team
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Teams Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {dataLoading ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400">Loading teams...</p>
          </div>
        ) : teams.length > 0 ? (
          teams.map((team) => (
            <TeamCard
              key={team._id}
              id={team._id}
              name={team.name}
              description={team.description}
              memberCount={team.members?.length || 0}
              isOwner={team.ownerId._id === user?.id || user?.id === team.ownerId}
              onClick={() => handleTeamClick(team._id)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="flex justify-center mb-4">
              <Users className="w-16 h-16 text-gray-600" />
            </div>
            <p className="text-gray-400 mb-4">No teams yet. Create one to get started!</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              Create First Team
            </button>
          </div>
        )}
      </motion.div>
    </main>
  )
}
