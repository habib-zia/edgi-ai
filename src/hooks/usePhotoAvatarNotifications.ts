import { useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { getApiUrl } from '@/lib/config'

export interface PhotoAvatarUpdate {
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

export interface VideoDownloadUpdate {
  videoId: string
  status: 'success' | 'error'
  data?: {
    message: string
    error?: string
    downloadUrl?: string
  }
  timestamp: string
}

export interface UsePhotoAvatarNotificationsReturn {
  socket: Socket | null
  notifications: PhotoAvatarUpdate[]
  videoNotifications: VideoDownloadUpdate[]
  isConnected: boolean
  clearNotifications: () => void
  clearVideoNotifications: () => void
  latestNotification: PhotoAvatarUpdate | null
  latestVideoNotification: VideoDownloadUpdate | null
  isProcessing: boolean
  isVideoProcessing: boolean
}

export const usePhotoAvatarNotifications = (userId: string | null): UsePhotoAvatarNotificationsReturn => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [notifications, setNotifications] = useState<PhotoAvatarUpdate[]>([])
  const [videoNotifications, setVideoNotifications] = useState<VideoDownloadUpdate[]>([])
  const [isConnected, setIsConnected] = useState(false)

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const clearVideoNotifications = useCallback(() => {
    setVideoNotifications([])
  }, [])

  useEffect(() => {
    if (!userId) {
      // Clean up socket if no user
      if (socket) {
        socket.close()
        setSocket(null)
        setIsConnected(false)
      }
      return
    }

    // Get backend URL from config
    const backendUrl = getApiUrl('').replace('/api', '') // Remove /api from the URL
    console.log('🔌 WebSocket connecting to:', backendUrl)
    
    // Connect to WebSocket server
    const newSocket = io(backendUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    newSocket.on('connect', () => {
      console.log('🔌 Connected to WebSocket server')
      setIsConnected(true)
      
      // Join user-specific room
      newSocket.emit('join-room', userId)
      console.log(`🏠 Joined room for user: ${userId}`)
    })

    newSocket.on('disconnect', (reason: any) => {
      console.log('🔌 Disconnected from WebSocket server:', reason)
      setIsConnected(false)
    })

    newSocket.on('connect_error', (error: any) => {
      console.error('🔌 WebSocket connection error:', error)
      setIsConnected(false)
    })

    // Listen for photo avatar updates
    newSocket.on('photo-avatar-update', (update: PhotoAvatarUpdate) => {
      console.log('📸 Photo avatar update received:', update)
      console.log('📸 Current notifications before update:', notifications)
      setNotifications(prev => {
        // Avoid duplicate notifications
        const exists = prev.some(notif => 
          notif.timestamp === update.timestamp && 
          notif.step === update.step
        )
        if (exists) {
          console.log('📸 Duplicate notification ignored')
          return prev
        }
        const newNotifications = [...prev, update]
        console.log('📸 New notifications after update:', newNotifications)
        return newNotifications
      })
    })

    // Listen for avatar completion
    newSocket.on('avatar-ready', (data: { avatarId: string; previewImageUrl?: string }) => {
      console.log('✅ Avatar ready:', data)
      const completionUpdate: PhotoAvatarUpdate = {
        step: 'complete',
        status: 'success',
        data: {
          message: 'Your avatar is ready!',
          avatarId: data.avatarId,
          previewImageUrl: data.previewImageUrl
        },
        timestamp: new Date().toISOString()
      }
      setNotifications(prev => [...prev, completionUpdate])
    })

    // Listen for video download updates
    newSocket.on('video-download-update', (update: VideoDownloadUpdate) => {
      console.log('🎥 Video download update received:', update)
      setVideoNotifications(prev => {
        // Avoid duplicate notifications
        const exists = prev.some(notif => 
          notif.timestamp === update.timestamp && 
          notif.videoId === update.videoId
        )
        if (exists) return prev
        return [...prev, update]
      })
    })

    setSocket(newSocket)

    return () => {
      console.log('🧹 Cleaning up WebSocket connection')
      newSocket.close()
    }
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Get latest notification
  const latestNotification = notifications.length > 0 ? notifications[notifications.length - 1] : null
  const latestVideoNotification = videoNotifications.length > 0 ? videoNotifications[videoNotifications.length - 1] : null

  // Check if avatar is currently being processed
  const isProcessing = notifications.some(notif => 
    notif.status === 'progress' && notif.step !== 'ready'
  )

  // Check if video is currently being processed (only for success/error, no progress tracking)
  const isVideoProcessing = false // No progress tracking for videos

  return {
    socket,
    notifications,
    videoNotifications,
    isConnected,
    clearNotifications,
    clearVideoNotifications,
    latestNotification,
    latestVideoNotification,
    isProcessing,
    isVideoProcessing
  }
}
