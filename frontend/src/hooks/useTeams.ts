import { useState, useCallback } from 'react'
import { apiClient } from '@/services/api'

interface Team {
  _id: string
  name: string
  description?: string
  ownerId: { _id: string; name: string; email: string }
  members: Array<{ _id: string; name: string; email: string }>
  memberRoles?: Map<string, 'admin' | 'member' | 'viewer'>
  sharedTasks?: string[]
  createdAt: string
  updatedAt: string
}

interface TeamInvitation {
  _id: string
  teamId: string
  invitedEmail: string
  invitedById: string
  status: 'pending' | 'accepted' | 'declined'
  expiresAt: string
}

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([])
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null)
  const [invitations, setInvitations] = useState<TeamInvitation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch all user's teams
   */
  const fetchTeams = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.getUserTeams()
      setTeams(response.data.data || [])
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch teams')
      console.error('Error fetching teams:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Fetch single team details
   */
  const fetchTeam = useCallback(async (teamId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.getTeam(teamId)
      setCurrentTeam(response.data.data)
      return response.data.data
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch team')
      console.error('Error fetching team:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Create a new team
   */
  const createTeam = useCallback(async (name: string, description?: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.createTeam(name, description)
      const newTeam = response.data.data
      setTeams((prev) => [newTeam, ...prev])
      return newTeam
    } catch (err) {
      setError((err as Error).message || 'Failed to create team')
      console.error('Error creating team:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Update team details
   */
  const updateTeam = useCallback(async (teamId: string, data: Partial<Team>) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.updateTeam(teamId, data)
      const updatedTeam = response.data.data
      
      setTeams((prev) =>
        prev.map((t) => (t._id === teamId ? updatedTeam : t))
      )
      if (currentTeam?._id === teamId) {
        setCurrentTeam(updatedTeam)
      }
      return updatedTeam
    } catch (err) {
      setError((err as Error).message || 'Failed to update team')
      console.error('Error updating team:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [currentTeam])

  /**
   * Invite user to team
   */
  const inviteUserToTeam = useCallback(async (teamId: string, email: string) => {
    try {
      setIsLoading(true)
      setError(null)
      await apiClient.inviteUserToTeam(teamId, email)
      return true
    } catch (err) {
      setError((err as Error).message || 'Failed to invite user')
      console.error('Error inviting user:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Accept team invitation
   */
  const acceptInvitation = useCallback(async (invitationId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.acceptTeamInvitation(invitationId)
      const newTeam = response.data.data
      setTeams((prev) => [newTeam, ...prev])
      setInvitations((prev) =>
        prev.filter((inv) => inv._id !== invitationId)
      )
      return newTeam
    } catch (err) {
      setError((err as Error).message || 'Failed to accept invitation')
      console.error('Error accepting invitation:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Remove team member
   */
  const removeMember = useCallback(async (teamId: string, memberId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      await apiClient.removeTeamMember(teamId, memberId)
      
      setTeams((prev) =>
        prev.map((t) =>
          t._id === teamId
            ? {
                ...t,
                members: t.members.filter((m) => m._id !== memberId),
              }
            : t
        )
      )
      
      if (currentTeam?._id === teamId) {
        setCurrentTeam((prev) =>
          prev
            ? {
                ...prev,
                members: prev.members.filter((m) => m._id !== memberId),
              }
            : null
        )
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to remove member')
      console.error('Error removing member:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [currentTeam])

  /**
   * Update member role
   */
  const updateMemberRole = useCallback(
    async (teamId: string, memberId: string, role: 'admin' | 'member' | 'viewer') => {
      try {
        setIsLoading(true)
        setError(null)
        await apiClient.updateTeamMemberRole(teamId, memberId, role)
        
        // Update in local state
        setTeams((prev) =>
          prev.map((t) => {
            if (t._id === teamId) {
              const memberRoles = new Map(t.memberRoles)
              memberRoles.set(memberId, role)
              return { ...t, memberRoles }
            }
            return t
          })
        )
      } catch (err) {
        setError((err as Error).message || 'Failed to update member role')
        console.error('Error updating member role:', err)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  /**
   * Share task with team
   */
  const shareTask = useCallback(async (teamId: string, taskId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      await apiClient.shareTaskWithTeam(teamId, taskId)
      
      setTeams((prev) =>
        prev.map((t) =>
          t._id === teamId
            ? {
                ...t,
                sharedTasks: [...(t.sharedTasks || []), taskId],
              }
            : t
        )
      )
    } catch (err) {
      setError((err as Error).message || 'Failed to share task')
      console.error('Error sharing task:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Get team activity log
   */
  const getTeamActivity = useCallback(async (teamId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.getTeamActivity(teamId)
      return response.data.data || []
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch activity')
      console.error('Error fetching activity:', err)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    // State
    teams,
    currentTeam,
    invitations,
    isLoading,
    error,

    // Methods
    fetchTeams,
    fetchTeam,
    createTeam,
    updateTeam,
    inviteUserToTeam,
    acceptInvitation,
    removeMember,
    updateMemberRole,
    shareTask,
    getTeamActivity,
  }
}
