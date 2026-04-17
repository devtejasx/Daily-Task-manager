import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { connectDB } from './config/database'
import { errorHandler, notFound } from './middleware/errorHandler'
import { WebSocketServer } from './websocket/WebSocketServer'
import authRoutes from './routes/auth'
import taskRoutes from './routes/tasks'
import gamificationRoutes from './routes/gamification'
import analyticsRoutes from './routes/analytics'
import teamRoutes from './routes/teams'
import habitRoutes from './routes/habits'
import voiceRoutes from './routes/voice'
import aiRoutes from './routes/ai'
import timerRoutes from './routes/timer'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const PORT = process.env.PORT || 5000

// Initialize WebSocket Server
const wsServer = new WebSocketServer(httpServer)

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
)

// Connect Database
connectDB()

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/gamification', gamificationRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/teams', teamRoutes)
app.use('/api/habits', habitRoutes)
app.use('/api/voice', voiceRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/timer', timerRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    environment: process.env.NODE_ENV,
  })
})

// Error handling
app.use(notFound)
app.use(errorHandler)

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔌 WebSocket server ready`)
})

export default app
