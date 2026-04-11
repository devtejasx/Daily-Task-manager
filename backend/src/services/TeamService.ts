import { Team, ITeam } from '../models/Team'
import { TeamInvitation } from '../models/TeamInvitation'
import { User } from '../models/User'
import { ActivityLog } from '../models/ActivityLog'
import mongoose from 'mongoose'

export class TeamService {
  /**
   * Create a new team
   */
  async createTeam(userId: string, name: string, description?: string): Promise<ITeam> {
    const userId_obj = new mongoose.Types.ObjectId(userId)

    const team = new Team({
      name,
      description,
      ownerId: userId_obj,
      members: [userId_obj],
      memberRoles: new Map([[userId, 'admin']]),
    })

    await team.save()

    // Log activity
    await this.logActivity(userId, undefined, 'created', 'team', team._id.toString(), {
      name,
    })

    return team
  }

  /**
   * Get user's teams
   */
  async getUserTeams(userId: string): Promise<ITeam[]> {
    return Team.find({
      $or: [
        { ownerId: new mongoose.Types.ObjectId(userId) },
        { members: new mongoose.Types.ObjectId(userId) },
      ],
    })
      .populate('ownerId', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 })
  }

  /**
   * Get team details
   */
  async getTeam(teamId: string): Promise<ITeam | null> {
    return Team.findById(teamId)
      .populate('ownerId', 'name email')
      .populate('members', 'name email')
  }

  /**
   * Update team
   */
  async updateTeam(
    teamId: string,
    userId: string,
    updates: any
  ): Promise<ITeam | null> {
    const team = await Team.findById(teamId)
    if (!team) return null

    // Check if user is owner or admin
    const userRole = team.memberRoles?.get(userId)
    if (team.ownerId.toString() !== userId && userRole !== 'admin') {
      throw new Error('Unauthorized')
    }

    const updatedTeam = await Team.findByIdAndUpdate(teamId, updates, { new: true })

    await this.logActivity(userId, teamId, 'updated', 'team', teamId, updates)

    return updatedTeam
  }

  /**
   * Invite user to team
   */
  async inviteUserToTeam(teamId: string, invitedEmail: string, invitedById: string): Promise<void> {
    const team = await Team.findById(teamId)
    if (!team) throw new Error('Team not found')

    // Check if user is owner or admin
    const userRole = team.memberRoles?.get(invitedById)
    if (team.ownerId.toString() !== invitedById && userRole !== 'admin') {
      throw new Error('Unauthorized')
    }

    const invitation = new TeamInvitation({
      teamId: new mongoose.Types.ObjectId(teamId),
      invitedEmail: invitedEmail.toLowerCase(),
      invitedById: new mongoose.Types.ObjectId(invitedById),
    })

    await invitation.save()
  }

  /**
   * Accept team invitation
   */
  async acceptInvitation(invitationId: string, userId: string): Promise<ITeam> {
    const invitation = await TeamInvitation.findById(invitationId)
    if (!invitation) throw new Error('Invitation not found')
    if (invitation.status !== 'pending') throw new Error('Invitation already processed')

    const user = await User.findById(userId)
    if (user?.email !== invitation.invitedEmail) {
      throw new Error('Email mismatch')
    }

    const team = await Team.findById(invitation.teamId)
    if (!team) throw new Error('Team not found')

    // Add user to team
    if (!team.members.includes(new mongoose.Types.ObjectId(userId))) {
      team.members.push(new mongoose.Types.ObjectId(userId))
      team.memberRoles?.set(userId, 'member')
      await team.save()
    }

    // Update invitation status
    invitation.status = 'accepted'
    await invitation.save()

    await this.logActivity(userId, team._id.toString(), 'joined', 'team', team._id.toString())

    return team
  }

  /**
   * Remove member from team
   */
  async removeMember(teamId: string, userId: string, memberId: string): Promise<void> {
    const team = await Team.findById(teamId)
    if (!team) throw new Error('Team not found')

    // Check if user has permission
    const userRole = team.memberRoles?.get(userId)
    if (team.ownerId.toString() !== userId && userRole !== 'admin') {
      throw new Error('Unauthorized')
    }

    // Cannot remove owner
    if (team.ownerId.toString() === memberId) {
      throw new Error('Cannot remove team owner')
    }

    const memberId_obj = new mongoose.Types.ObjectId(memberId)
    team.members = team.members.filter((m) => m.toString() !== memberId_obj.toString())
    team.memberRoles?.delete(memberId)
    await team.save()

    await this.logActivity(userId, teamId, 'removed_member', 'team', teamId, {
      memberId,
    })
  }

  /**
   * Update member role
   */
  async updateMemberRole(
    teamId: string,
    userId: string,
    memberId: string,
    role: 'admin' | 'member' | 'viewer'
  ): Promise<void> {
    const team = await Team.findById(teamId)
    if (!team) throw new Error('Team not found')

    // Check if user has permission
    const userRole = team.memberRoles?.get(userId)
    if (team.ownerId.toString() !== userId && userRole !== 'admin') {
      throw new Error('Unauthorized')
    }

    team.memberRoles?.set(memberId, role)
    await team.save()

    await this.logActivity(userId, teamId, 'updated_member_role', 'team', teamId, {
      memberId,
      role,
    })
  }

  /**
   * Share task with team
   */
  async shareTaskWithTeam(teamId: string, taskId: string, userId: string): Promise<void> {
    const team = await Team.findById(teamId)
    if (!team) throw new Error('Team not found')

    // Check if user has permission
    const userRole = team.memberRoles?.get(userId)
    if (team.ownerId.toString() !== userId && userRole !== 'admin') {
      throw new Error('Unauthorized')
    }

    const taskId_obj = new mongoose.Types.ObjectId(taskId)
    if (!team.sharedTasks.includes(taskId_obj)) {
      team.sharedTasks.push(taskId_obj)
      await team.save()
    }

    await this.logActivity(userId, teamId, 'shared_task', 'team', taskId, { teamId })
  }

  /**
   * Get team activity log
   */
  async getTeamActivityLog(teamId: string, limit: number = 50) {
    return ActivityLog.find({ teamId: new mongoose.Types.ObjectId(teamId) })
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('userId', 'name email')
  }

  /**
   * Log activity
   */
  private async logActivity(
    userId: string,
    teamId: string | undefined,
    action: string,
    entity: 'task' | 'team' | 'habit',
    entityId: string,
    changes?: Record<string, any>
  ): Promise<void> {
    const log = new ActivityLog({
      userId: new mongoose.Types.ObjectId(userId),
      teamId: teamId ? new mongoose.Types.ObjectId(teamId) : undefined,
      action,
      entity,
      entityId: new mongoose.Types.ObjectId(entityId),
      changes,
    })

    await log.save()
  }
}
