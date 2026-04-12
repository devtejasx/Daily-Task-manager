'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useTeams } from '@/hooks/useTeams'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, Mail, Trash2, Shield, Edit2, Share2 } from 'lucide-react'
import { TaskCard } from '@/components/TaskCard'

interface TeamDetailParams {
  params: { id: string }
}

export default function TeamDetail({ params }: TeamDetailParams) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { currentTeam, isLoading: teamLoading, fetchTeam, removeMember, updateMemberRole } = useTeams()
  const [inviteEmail, setInviteEmail] = useState('')
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [teamName, setTeamName] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [selectedRole, setSelectedRole] = useState<{ memberId: string; role: 'admin' | 'member' | 'viewer' } | null>(null)

  const teamId = params.id

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (isAuthenticated && teamId) {
      fetchTeam(teamId)
    }
  }, [isAuthenticated, teamId, fetchTeam])

  useEffect(() => {
    if (currentTeam) {
      setTeamName(currentTeam.name)
    }
  }, [currentTeam])

  const isOwner = user && currentTeam && currentTeam.ownerId._id === user.id
  const isMemberAdmin = user && currentTeam?.memberRoles?.get(user.id) === 'admin'
  const canManage = isOwner || isMemberAdmin

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement invite logic
    console.log('Invite:', inviteEmail)
    setInviteEmail('')
    setShowInviteForm(false)
  }

  const handleRemoveMember = async (memberId: string) => {
    if (confirm('Are you sure you want to remove this member?')) {
      try {
        await removeMember(teamId, memberId)
      } catch (error) {
        console.error('Failed to remove member:', error)
      }
    }
  }

  const handleUpdateRole = async (memberId: string, role: 'admin' | 'member' | 'viewer') => {
    try {
      await updateMemberRole(teamId, memberId, role)
      setSelectedRole(null)
    } catch (error) {
      console.error('Failed to update role:', error)
    }
  }

  if (authLoading || teamLoading || !currentTeam) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Loading team...</p>
      </div>
    )
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="flex justify-between items-start">
          <div>
            {isEditing ? (
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="text-4xl font-bold bg-gray-800 border border-gray-700 rounded px-3 py-1 text-white"
              />
            ) : (
              <h1 className="text-4xl font-bold">{currentTeam.name}</h1>
            )}
            {currentTeam.description && (
              <p className="text-gray-400 mt-2">{currentTeam.description}</p>
            )}
          </div>

          {canManage && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition"
            >
              <Edit2 size={18} />
              Edit
            </button>
          )}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Team Info */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-6"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Users size={24} />
              Team Members ({currentTeam.members?.length || 0})
            </h2>

            <div className="space-y-3">
              {currentTeam.members?.map((member) => {
                const role = currentTeam.memberRoles?.get(member._id) || 'member'
                const isCurrentUser = user?.id === member._id

                return (
                  <motion.div
                    key={member._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 bg-gray-800/30 border border-gray-700/30 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        {member.name}
                        {isCurrentUser && <span className="text-xs text-blue-400 ml-2">(You)</span>}
                      </p>
                      <p className="text-sm text-gray-400">{member.email}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {canManage && !isCurrentUser && (
                        <>
                          <div className="relative group">
                            <button className="flex items-center gap-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition capitalize">
                              <Shield size={14} />
                              {role}
                            </button>
                            <div className="absolute right-0 mt-1 w-32 bg-gray-800 border border-gray-700 rounded shadow-lg hidden group-hover:block z-10">
                              {['admin', 'member', 'viewer'].map((r) => (
                                <button
                                  key={r}
                                  onClick={() => handleUpdateRole(member._id, r as any)}
                                  className="block w-full text-left px-3 py-2 hover:bg-gray-700 text-sm capitalize first:rounded-t last:rounded-b"
                                >
                                  {r}
                                </button>
                              ))}
                            </div>
                          </div>

                          <button
                            onClick={() => handleRemoveMember(member._id)}
                            className="p-2 text-red-400 hover:text-red-300 transition"
                            title="Remove member"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.section>

          {/* Invite Section */}
          {canManage && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-6"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Mail size={20} />
                Invite Users
              </h2>

              {!showInviteForm ? (
                <button
                  onClick={() => setShowInviteForm(true)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition"
                >
                  Send Invitation
                </button>
              ) : (
                <form onSubmit={handleInvite} className="space-y-3">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none text-white"
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition"
                    >
                      Send
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowInviteForm(false)}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </motion.section>
          )}

          {/* Shared Tasks */}
          {currentTeam.sharedTasks && currentTeam.sharedTasks.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-6"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Share2 size={20} />
                Shared Tasks ({currentTeam.sharedTasks.length})
              </h2>

              <div className="space-y-3">
                {currentTeam.sharedTasks.map((taskId) => (
                  <motion.div
                    key={taskId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 bg-gray-800/30 border border-gray-700/30 rounded"
                  >
                    {/* Task details would go here */}
                    <p className="text-gray-400">Task ID: {taskId}</p>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </div>

        {/* Sidebar */}
        <motion.aside
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1"
        >
          <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-6 sticky top-8">
            <h3 className="font-bold mb-4">Team Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-400">Owner</p>
                <p className="font-medium">{currentTeam.ownerId.name}</p>
              </div>
              <div>
                <p className="text-gray-400">Created</p>
                <p className="font-medium">{new Date(currentTeam.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-400">Members</p>
                <p className="font-medium">{currentTeam.members?.length || 0}</p>
              </div>
              {currentTeam.memberRoles && (
                <div>
                  <p className="text-gray-400">Your Role</p>
                  <p className="font-medium capitalize">
                    {currentTeam.memberRoles.get(user?.id || '') || 'member'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.aside>
      </div>
    </main>
  )
}
