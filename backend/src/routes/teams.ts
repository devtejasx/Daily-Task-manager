import express, { Request, Response } from 'express'
import { auth } from '../middleware/auth'
import { TeamService } from '../services/TeamService'

const router = express.Router()
const teamService = new TeamService()

/**
 * POST /api/teams
 * Create a new team
 */
router.post('/', auth, async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Team name is required' })
    }

    const team = await teamService.createTeam(req.userId as string, name, description)

    res.status(201).json({
      success: true,
      data: team,
      message: 'Team created successfully',
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * GET /api/teams
 * Get user's teams
 */
router.get('/', auth, async (req: Request, res: Response) => {
  try {
    const teams = await teamService.getUserTeams(req.userId as string)

    res.json({
      success: true,
      data: teams,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * GET /api/teams/:id
 * Get team details
 */
router.get('/:id', auth, async (req: Request, res: Response) => {
  try {
    const team = await teamService.getTeam(req.params.id)

    if (!team) {
      return res.status(404).json({ success: false, error: 'Team not found' })
    }

    res.json({
      success: true,
      data: team,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * PUT /api/teams/:id
 * Update team
 */
router.put('/:id', auth, async (req: Request, res: Response) => {
  try {
    const team = await teamService.updateTeam(
      req.params.id,
      req.userId as string,
      req.body
    )

    if (!team) {
      return res.status(404).json({ success: false, error: 'Team not found' })
    }

    res.json({
      success: true,
      data: team,
      message: 'Team updated successfully',
    })
  } catch (error: any) {
    res.status(error.message === 'Unauthorized' ? 403 : 500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * POST /api/teams/:id/invite
 * Invite user to team
 */
router.post('/:id/invite', auth, async (req: Request, res: Response) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    await teamService.inviteUserToTeam(req.params.id, email, req.userId as string)

    res.json({
      success: true,
      message: 'Invitation sent successfully',
    })
  } catch (error: any) {
    res.status(error.message === 'Unauthorized' ? 403 : 500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * POST /api/teams/invitations/:id/accept
 * Accept team invitation
 */
router.post('/invitations/:id/accept', auth, async (req: Request, res: Response) => {
  try {
    const team = await teamService.acceptInvitation(req.params.id, req.userId as string)

    res.json({
      success: true,
      data: team,
      message: 'Invitation accepted',
    })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
})

/**
 * DELETE /api/teams/:id/members/:memberId
 * Remove member from team
 */
router.delete('/:id/members/:memberId', auth, async (req: Request, res: Response) => {
  try {
    await teamService.removeMember(req.params.id, req.userId as string, req.params.memberId)

    res.json({
      success: true,
      message: 'Member removed successfully',
    })
  } catch (error: any) {
    res.status(error.message === 'Unauthorized' ? 403 : 500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * PUT /api/teams/:id/members/:memberId/role
 * Update member role
 */
router.put('/:id/members/:memberId/role', auth, async (req: Request, res: Response) => {
  try {
    const { role } = req.body

    if (!role) {
      return res.status(400).json({ error: 'Role is required' })
    }

    await teamService.updateMemberRole(req.params.id, req.userId as string, req.params.memberId, role)

    res.json({
      success: true,
      message: 'Member role updated successfully',
    })
  } catch (error: any) {
    res.status(error.message === 'Unauthorized' ? 403 : 500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * POST /api/teams/:id/share-task/:taskId
 * Share task with team
 */
router.post('/:id/share-task/:taskId', auth, async (req: Request, res: Response) => {
  try {
    await teamService.shareTaskWithTeam(req.params.id, req.params.taskId, req.userId as string)

    res.json({
      success: true,
      message: 'Task shared with team',
    })
  } catch (error: any) {
    res.status(error.message === 'Unauthorized' ? 403 : 500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * GET /api/teams/:id/activity
 * Get team activity log
 */
router.get('/:id/activity', auth, async (req: Request, res: Response) => {
  try {
    const activity = await teamService.getTeamActivityLog(req.params.id)

    res.json({
      success: true,
      data: activity,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
