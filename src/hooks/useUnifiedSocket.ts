import { useEffect, useState, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { getApiUrl } from '@/lib/config'
import { apiService } from '@/lib/api-service'

export interface VideoStatusUpdate {
  videoId: string
  status: 'pending' | 'processing' | 'completed' | 'success' | 'failed'
  message: string
  downloadUrl?: string
  timestamp: string
}

export interface AvatarStatusUpdate {
  step: string
  status: 'progress' | 'success' | 'error'
  data?: {
    message: string
    error?: string
    avatarId?: string
    previewImageUrl?: string
  }
  timestamp: string
}

export interface UnifiedSocketState {
  socket: Socket | null
  isConnected: boolean
  videoUpdates: VideoStatusUpdate[]
  avatarUpdates: AvatarStatusUpdate[]
  latestVideoUpdate: VideoStatusUpdate | null
  latestAvatarUpdate: AvatarStatusUpdate | null
  isVideoProcessing: boolean
  isAvatarProcessing: boolean
  clearVideoUpdates: () => void
  clearCompletedVideoUpdates: () => void
  clearAvatarUpdates: () => void
  checkPendingWorkflows: (userId: string) => Promise<void>
}

export const useUnifiedSocket = (userId: string | null): UnifiedSocketState => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [videoUpdates, setVideoUpdates] = useState<VideoStatusUpdate[]>([])
  const [avatarUpdates, setAvatarUpdates] = useState<AvatarStatusUpdate[]>([])
  
  // Track processed events to prevent duplicates
  const processedEvents = useRef(new Set<string>())
  const socketConnectedHandlers = useRef<Set<() => void>>(new Set())

  const clearVideoUpdates = useCallback(() => {
    setVideoUpdates([])
  }, [])

  const clearCompletedVideoUpdates = useCallback(() => {
    setVideoUpdates(prev => prev.filter(update => 
      update.status !== 'completed' && update.status !== 'success' && update.status !== 'failed'
    ))
  }, [])

  const clearAvatarUpdates = useCallback(() => {
    setAvatarUpdates([])
  }, [])

  const checkPendingWorkflows = useCallback(async (userId: string) => {
    try {
      console.log('🔍 Checking pending workflows for user:', userId)
      await apiService.checkPendingWorkflows(userId)
    } catch (error) {
      console.error('Failed to check pending workflows:', error)
    }
  }, [])

  // Get latest updates
  const latestVideoUpdate = videoUpdates.length > 0 ? videoUpdates[videoUpdates.length - 1] : null
  const latestAvatarUpdate = avatarUpdates.length > 0 ? avatarUpdates[avatarUpdates.length - 1] : null

  // Check processing states
  const isVideoProcessing = videoUpdates.some(update => 
    update.status === 'pending' || update.status === 'processing'
  )
  const isAvatarProcessing = avatarUpdates.some(update => 
    update.status === 'progress' && update.step !== 'ready'
  )

  useEffect(() => {
    if (!userId) {
      // Clean up socket and clear all data if no user
      if (socket) {
        socket.close()
        setSocket(null)
        setIsConnected(false)
      }
      setVideoUpdates([])
      setAvatarUpdates([])
      processedEvents.current.clear()
      socketConnectedHandlers.current.clear()
      console.log('🧹 User logged out - cleared all socket data')
      return
    }

    // Get backend URL from config
    const backendUrl = getApiUrl('').replace('/api', '')
    console.log('🔌 Unified WebSocket connecting to:', backendUrl)
    
    // Create new socket connection
    const newSocket = io(backendUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('🔌 Unified WebSocket connected')
      setIsConnected(true)
      
      // Join user-specific room
      newSocket.emit('join-room', userId)
      console.log(`🏠 Joined room for user: ${userId}`)
      
      // Emit test connection
      newSocket.emit('test-connection', { userId, timestamp: new Date().toISOString() })
      
      // Trigger socket connected event for any registered handlers
      socketConnectedHandlers.current.forEach(handler => {
        try {
          handler()
        } catch (error) {
          console.error('Error in socket connected handler:', error)
        }
      })
      
      // Check pending workflows after connection
      checkPendingWorkflows(userId)
    })

    newSocket.on('disconnect', (reason: any) => {
      console.log('🔌 Unified WebSocket disconnected:', reason)
      setIsConnected(false)
    })

    newSocket.on('connect_error', (error: any) => {
      console.error('🔌 Unified WebSocket connection error:', error)
      setIsConnected(false)
    })

    newSocket.on('reconnect', (attemptNumber: number) => {
      console.log(`🔌 Unified WebSocket reconnected after ${attemptNumber} attempts`)
      setIsConnected(true)
      newSocket.emit('join-room', userId)
      
      // Trigger socket connected event for reconnection
      socketConnectedHandlers.current.forEach(handler => {
        try {
          handler()
        } catch (error) {
          console.error('Error in socket reconnected handler:', error)
        }
      })
      
      // Check pending workflows after reconnection
      checkPendingWorkflows(userId)
    })

    // Video status updates
    newSocket.on('video-download-update', (update: any) => {
      console.log('🎥 Video update received:', update)
      
      // Handle both videoId and id fields, and allow processing without strict videoId validation
      const videoId = update.videoId || update.id || 'processing-video'
      
      const eventKey = `video-${videoId}-${update.timestamp || Date.now()}`
      
      if (processedEvents.current.has(eventKey)) {
        console.log('🎥 Duplicate video event ignored:', eventKey)
        return
      }
      
      processedEvents.current.add(eventKey)
      
      // Map the socket event format to our internal format
      let status = update.status || update.type || 'pending'
      
      // Handle the specific case where type: 'progress' should map to status: 'processing'
      if (update.type === 'progress' && update.status === 'processing') {
        status = 'processing'
      } else if (update.type === 'progress') {
        status = 'processing'
      }
      
      const videoUpdate: VideoStatusUpdate = {
        videoId: videoId,
        status: status as 'pending' | 'processing' | 'completed' | 'success' | 'failed',
        message: update.message || update.data?.message || 'Video processing update',
        downloadUrl: update.downloadUrl || update.data?.downloadUrl,
        timestamp: update.timestamp || new Date().toISOString()
      }
      
      console.log('🎥 Processed video update:', videoUpdate)
      setVideoUpdates(prev => [...prev, videoUpdate])
    })

    // Avatar status updates
    newSocket.on('photo-avatar-update', (update: AvatarStatusUpdate) => {
      console.log('📸 Avatar update received:', update)
      
      const eventKey = `avatar-${update.step}-${update.timestamp}`
      
      if (processedEvents.current.has(eventKey)) {
        console.log('📸 Duplicate avatar event ignored:', eventKey)
        return
      }
      
      processedEvents.current.add(eventKey)
      setAvatarUpdates(prev => [...prev, update])
    })

    // Avatar completion
    newSocket.on('avatar-ready', (data: { avatarId: string; previewImageUrl?: string }) => {
      console.log('✅ Avatar ready:', data)
      
      const timestamp = new Date().toISOString()
      const eventKey = `avatar-ready-${data.avatarId}-${timestamp}`
      
      if (processedEvents.current.has(eventKey)) {
        console.log('📸 Duplicate avatar-ready event ignored:', eventKey)
        return
      }
      
      processedEvents.current.add(eventKey)
      
      const completionUpdate: AvatarStatusUpdate = {
        step: 'complete',
        status: 'success',
        data: {
          message: 'Your avatar is ready!',
          avatarId: data.avatarId,
          previewImageUrl: data.previewImageUrl
        },
        timestamp: timestamp
      }
      
      setAvatarUpdates(prev => [...prev, completionUpdate])
    })

    setSocket(newSocket)

    // Store references for cleanup
    const currentProcessedEvents = processedEvents.current
    const currentSocketHandlers = socketConnectedHandlers.current

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up unified WebSocket connection')
      currentProcessedEvents.clear()
      currentSocketHandlers.clear()
      newSocket.close()
    }
  }, [userId, checkPendingWorkflows]) // eslint-disable-line react-hooks/exhaustive-deps

  // Expose method to register socket connected handlers
  useEffect(() => {
    if (socket) {
      // Add method to socket for external handlers
      (socket as any).onSocketConnected = (handler: () => void) => {
        socketConnectedHandlers.current.add(handler)
        return () => {
          socketConnectedHandlers.current.delete(handler)
        }
      }
    }
  }, [socket])

  return {
    socket,
    isConnected,
    videoUpdates,
    avatarUpdates,
    latestVideoUpdate,
    latestAvatarUpdate,
    isVideoProcessing,
    isAvatarProcessing,
    clearVideoUpdates,
    clearCompletedVideoUpdates,
    clearAvatarUpdates,
    checkPendingWorkflows
  }
}
