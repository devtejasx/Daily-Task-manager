'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useTeams } from '@/hooks/useTeams'
import { motion } from 'framer-motion'
import { Mail, CheckCircle, XCircle, Clock } from 'lucide-react'
import { apiClient } from '@/services/api'

interface Invitation {
  _id: string
  teamId: {
    _id: string
    name: string
    description?: string
  }
  invitedEmail: string
  invitedById: {
    name: string
    email: string
  }
  status: 'pending' | 'accepted' | 'declined'
  expiresAt: string
  createdAt: string
}

export default function InvitationsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { acceptInvitation } = useTeams()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchInvitations()
    }
  }, [isAuthenticated])

  const fetchInvitations = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getPendingInvitations()
      setInvitations(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch invitations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccept = async (invitationId: string, teamId: string) => {
    try {
      setProcessingId(invitationId)
      await acceptInvitation(invitationId)
      setInvitations((prev) => prev.filter((inv) => inv._id !== invitationId))
      router.push(`/teams/${teamId}`)
    } catch (error) {
      console.error('Failed to accept invitation:', error)
    } finally {
      setProcessingId(null)
    }
  }

  const handleDecline = async (invitationId: string) => {
    try {
      setProcessingId(invitationId)
      await apiClient.declineTeamInvitation(invitationId)
      setInvitations((prev) => prev.filter((inv) => inv._id !== invitationId))
    } catch (error) {
      console.error('Failed to decline invitation:', error)
    } finally {
      setProcessingId(null)
    }
  }

  if (authLoading || !isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const pendingInvitations = invitations.filter((inv) => inv.status === 'pending')
  const acceptedInvitations = invitations.filter((inv) => inv.status === 'accepted')
  const declinedInvitations = invitations.filter((inv) => inv.status === 'declined')

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <Mail size={32} />
          Team Invitations
        </h1>
        <p className="text-gray-400">
          Manage your team collaboration invitations
        </p>
      </motion.div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Loading invitations...</p>
        </div>
      ) : invitations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 bg-gray-900/50 border border-gray-700/50 rounded-lg"
        >
          <Mail size={48} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 mb-2">No invitations yet</p>
          <p className="text-gray-500 text-sm">
            When team members invite you, they'll appear here
          </p>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {/* Pending Invitations */}
          {pendingInvitations.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-bold mb-4">Pending Invitations ({pendingInvitations.length})</h2>
              <div className="space-y-3">
                {pendingInvitations.map((invitation) => {
                  const expiresDate = new Date(invitation.expiresAt)
                  const isExpired = expiresDate < new Date()

                  return (
                    <motion.div
                      key={invitation._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-6 rounded-lg border ${
                        isExpired
                          ? 'bg-red-900/20 border-red-700/30'
                          : 'bg-blue-900/20 border-blue-700/30'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2">{invitation.teamId.name}</h3>
                          {invitation.teamId.description && (
                            <p className="text-gray-400 mb-3">{invitation.teamId.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>Invited by: {invitation.invitedById.name}</span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              Expires: {expiresDate.toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {!isExpired && (
                          <div className="flex gap-3 ml-4">
                            <button
                              onClick={() => handleAccept(invitation._id, invitation.teamId._id)}
                              disabled={processingId === invitation._id}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50"
                            >
                              <CheckCircle size={18} />
                              Accept
                            </button>
                            <button
                              onClick={() => handleDecline(invitation._id)}
                              disabled={processingId === invitation._id}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
                            >
                              <XCircle size={18} />
                              Decline
                            </button>
                          </div>
                        )}

                        {isExpired && (
                          <div className="px-4 py-2 bg-red-900/30 text-red-300 rounded-lg text-sm">
                            Expired
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.section>
          )}

          {/* Accepted Invitations */}
          {acceptedInvitations.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-bold mb-4">Accepted ({acceptedInvitations.length})</h2>
              <div className="space-y-3">
                {acceptedInvitations.map((invitation) => (
                  <motion.div
                    key={invitation._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-green-900/20 border border-green-700/30 rounded-lg flex items-center justify-between cursor-pointer hover:bg-green-900/30 transition"
                    onClick={() => router.push(`/teams/${invitation.teamId._id}`)}
                  >
                    <div>
                      <p className="font-bold">{invitation.teamId.name}</p>
                      <p className="text-sm text-gray-400">Joined on {new Date(invitation.createdAt).toLocaleDateString()}</p>
                    </div>
                    <CheckCircle size={24} className="text-green-400" />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Declined Invitations */}
          {declinedInvitations.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-bold mb-4">Declined ({declinedInvitations.length})</h2>
              <div className="space-y-3">
                {declinedInvitations.map((invitation) => (
                  <motion.div
                    key={invitation._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-gray-800/30 border border-gray-700/30 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-gray-500">{invitation.teamId.name}</p>
                      <p className="text-sm text-gray-500">Declined on {new Date(invitation.createdAt).toLocaleDateString()}</p>
                    </div>
                    <XCircle size={24} className="text-gray-500" />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      )}
    </main>
  )
}
