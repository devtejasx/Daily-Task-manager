import { Server as HTTPServer } from 'http'
import { Server as IOServer, Socket } from 'socket.io'
import { verifyToken } from '../middleware/auth'

interface UserSocket {
  userId: string
  socket: Socket
  teams: string[]
}

export class WebSocketServer {
  private io: IOServer
  private userSockets: Map<string, UserSocket> = new Map()
  private teamRooms: Map<string, Set<string>> = new Map()

  constructor(httpServer: HTTPServer) {
    this.io = new IOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    })

    this.setupMiddleware()
    this.setupConnectionHandlers()
  }

  private setupMiddleware() {
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token

      if (!token) {
        return next(new Error('Authentication error'))
      }

      try {
        const decoded = verifyToken(token) as any
        socket.data.userId = decoded.id
        next()
      } catch (err) {
        next(new Error('Authentication error'))
      }
    })
  }

  private setupConnectionHandlers() {
    this.io.on('connection', (socket: Socket) => {
      const userId = socket.data.userId

      // Store user socket
      this.userSockets.set(userId, {
        userId,
        socket,
        teams: [],
      })

      console.log(`User ${userId} connected`)

      // Join team room
      socket.on('join_team', (teamId: string) => {
        const roomName = `team_${teamId}`
        socket.join(roomName)

        const userSocket = this.userSockets.get(userId)
        if (userSocket) {
          userSocket.teams.push(teamId)
        }

        if (!this.teamRooms.has(teamId)) {
          this.teamRooms.set(teamId, new Set())
        }
        this.teamRooms.get(teamId)?.add(userId)

        console.log(`User ${userId} joined team ${teamId}`)
      })

      // Leave team room
      socket.on('leave_team', (teamId: string) => {
        const roomName = `team_${teamId}`
        socket.leave(roomName)

        const userSocket = this.userSockets.get(userId)
        if (userSocket) {
          userSocket.teams = userSocket.teams.filter((t) => t !== teamId)
        }

        this.teamRooms.get(teamId)?.delete(userId)
      })

      // Task updated
      socket.on('task_updated', (taskData: any) => {
        const { teamId, ...data } = taskData
        if (teamId) {
          this.io.to(`team_${teamId}`).emit('task_updated', data)
        } else {
          socket.broadcast.emit('task_updated', data)
        }
      })

      // Task created
      socket.on('task_created', (taskData: any) => {
        const { teamId, ...data } = taskData
        if (teamId) {
          this.io.to(`team_${teamId}`).emit('task_created', data)
        } else {
          socket.broadcast.emit('task_created', data)
        }
      })

      // Task deleted
      socket.on('task_deleted', (taskData: any) => {
        const { teamId, taskId } = taskData
        if (teamId) {
          this.io.to(`team_${teamId}`).emit('task_deleted', { taskId })
        } else {
          socket.broadcast.emit('task_deleted', { taskId })
        }
      })

      // Habit updated
      socket.on('habit_completed', (habitData: any) => {
        socket.broadcast.emit('habit_completed', habitData)
      })

      // Typing indicator
      socket.on('typing', (data: any) => {
        const { teamId, taskId, user } = data
        if (teamId) {
          socket.to(`team_${teamId}`).emit('user_typing', { taskId, user })
        } else {
          socket.broadcast.emit('user_typing', { taskId, user })
        }
      })

      socket.on('stop_typing', (data: any) => {
        const { teamId, taskId, user } = data
        if (teamId) {
          socket.to(`team_${teamId}`).emit('user_stop_typing', { taskId, user })
        } else {
          socket.broadcast.emit('user_stop_typing', { taskId, user })
        }
      })

      // Disconnect
      socket.on('disconnect', () => {
        this.userSockets.delete(userId)

        // Clean up team rooms
        for (const [teamId, members] of this.teamRooms.entries()) {
          members.delete(userId)
          if (members.size === 0) {
            this.teamRooms.delete(teamId)
          }
        }

        console.log(`User ${userId} disconnected`)
      })
    })
  }

  /**
   * Broadcast to all team members
   */
  broadcastToTeam(teamId: string, event: string, data: any) {
    this.io.to(`team_${teamId}`).emit(event, data)
  }

  /**
   * Broadcast to specific user
   */
  broadcastToUser(userId: string, event: string, data: any) {
    const userSocket = this.userSockets.get(userId)
    if (userSocket) {
      userSocket.socket.emit(event, data)
    }
  }

  /**
   * Get connected users in team
   */
  getTeamMembers(teamId: string): string[] {
    return Array.from(this.teamRooms.get(teamId) || new Set())
  }

  /**
   * Get IO instance
   */
  getIO(): IOServer {
    return this.io
  }
}
