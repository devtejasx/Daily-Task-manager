import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

interface WebSocketEvents {
  task_updated?: (data: any) => void
  task_created?: (data: any) => void
  task_deleted?: (data: any) => void
  habit_completed?: (data: any) => void
  user_typing?: (data: any) => void
  user_stop_typing?: (data: any) => void
  [key: string]: ((data: any) => void) | undefined
}

export const useWebSocket = (teamId?: string) => {
  const socketRef = useRef<Socket | null>(null)
  const eventHandlersRef = useRef<WebSocketEvents>({})

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      return
    }

    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('WebSocket connected')

      if (teamId) {
        socket.emit('join_team', teamId)
      }
    })

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected')
    })

    // Register event listeners
    Object.entries(eventHandlersRef.current).forEach(([event, handler]) => {
      if (handler) {
        socket.on(event, handler)
      }
    })

    return () => {
      if (teamId) {
        socket.emit('leave_team', teamId)
      }
      socket.disconnect()
      socketRef.current = null
    }
  }, [teamId])

  const on = useCallback((event: string, handler: (data: any) => void) => {
    eventHandlersRef.current[event] = handler

    if (socketRef.current) {
      socketRef.current.on(event, handler)
    }
  }, [])

  const off = useCallback((event: string) => {
    if (socketRef.current) {
      socketRef.current.off(event)
    }

    delete eventHandlersRef.current[event]
  }, [])

  const emit = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data)
    }
  }, [])

  const isConnected = socketRef.current?.connected ?? false

  return { emit, on, off, isConnected }
}
