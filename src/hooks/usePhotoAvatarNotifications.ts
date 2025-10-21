import { useEffect, useState, useCallback, useRef } from 'react'
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
  videoId?: string
  status: 'pending' | 'completed' | 'failed'
  data?: {
    message: string
    error?: string
    downloadUrl?: string
    title?: string
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
  
  // Track processed events to prevent duplicates
  const processedEvents = useRef(new Set<string>())

  // Load notifications from localStorage on mount
  useEffect(() => {
    if (userId && typeof window !== 'undefined') {
      try {
        const savedNotifications = localStorage.getItem(`avatar-notifications-${userId}`)
        if (savedNotifications) {
          const parsed = JSON.parse(savedNotifications)
          // Only restore if notifications are recent (within last 24 hours)
          const recentNotifications = parsed.filter((notif: PhotoAvatarUpdate) => {
            const notificationTime = new Date(notif.timestamp).getTime()
            const now = Date.now()
            return (now - notificationTime) < 24 * 60 * 60 * 1000 // 24 hours
          })
          if (recentNotifications.length > 0) {
            setNotifications(recentNotifications)
            console.log('📸 Restored notifications from localStorage:', recentNotifications)
          }
        }
      } catch (error) {
        console.warn('Failed to load notifications from localStorage:', error)
      }
    }
  }, [userId])

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (userId && notifications.length > 0 && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`avatar-notifications-${userId}`, JSON.stringify(notifications))
        console.log('📸 Saved notifications to localStorage:', notifications)
      } catch (error) {
        console.warn('Failed to save notifications to localStorage:', error)
      }
    }
  }, [notifications, userId])

  const clearNotifications = useCallback(() => {
    setNotifications([])
    // Also clear from localStorage
    if (userId && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`avatar-notifications-${userId}`)
        console.log('📸 Cleared notifications from localStorage')
      } catch (error) {
        console.warn('Failed to clear notifications from localStorage:', error)
      }
    }
  }, [userId])

  const clearVideoNotifications = useCallback(() => {
    setVideoNotifications([])
  }, [])

  useEffect(() => {
    if (!userId) {
      // Clean up socket and clear notifications if no user (logout scenario)
      if (socket) {
        socket.close()
        setSocket(null)
        setIsConnected(false)
      }
      // Clear all notifications on logout
      setNotifications([])
      setVideoNotifications([])
      // Clear processed events to prevent memory leaks
      processedEvents.current.clear()
      // Clear localStorage notifications
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(`avatar-notifications-${userId}`)
          console.log('🧹 Cleared avatar notifications from localStorage on logout')
        } catch (error) {
          console.warn('Failed to clear localStorage on logout:', error)
        }
      }
      console.log('🧹 User logged out - cleared all notifications and socket connection')
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
      
      // Emit a test event to verify connection
      newSocket.emit('test-connection', { userId, timestamp: new Date().toISOString() })
      
      // Trigger a custom event to notify that socket is ready
      window.dispatchEvent(new CustomEvent('socket-connected', { 
        detail: { userId, timestamp: new Date().toISOString() } 
      }))
    })

    newSocket.on('disconnect', (reason: any) => {
      console.log('🔌 Disconnected from WebSocket server:', reason)
      setIsConnected(false)
    })

    newSocket.on('connect_error', (error: any) => {
      console.error('🔌 WebSocket connection error:', error)
      setIsConnected(false)
    })

    // Listen for connection status changes
    newSocket.on('reconnect', (attemptNumber: number) => {
      console.log(`🔌 WebSocket reconnected after ${attemptNumber} attempts`)
      setIsConnected(true)
      // Rejoin room after reconnection
      newSocket.emit('join-room', userId)
      
      // Trigger a custom event to notify that socket is ready after reconnection
      window.dispatchEvent(new CustomEvent('socket-connected', { 
        detail: { userId, timestamp: new Date().toISOString(), reconnected: true } 
      }))
    })

    newSocket.on('reconnect_attempt', (attemptNumber: number) => {
      console.log(`🔌 WebSocket reconnection attempt ${attemptNumber}`)
    })

    newSocket.on('reconnect_error', (error: any) => {
      console.error('🔌 WebSocket reconnection error:', error)
    })

    newSocket.on('reconnect_failed', () => {
      console.error('🔌 WebSocket reconnection failed')
      setIsConnected(false)
    })

    // Listen for photo avatar updates
    newSocket.on('photo-avatar-update', (update: PhotoAvatarUpdate) => {
      console.log('📸 Photo avatar update received:', update)
      
      // Create unique event key for deduplication
      const eventKey = `photo-avatar-${update.step}-${update.timestamp}`
      
      // Check if event was already processed
      if (processedEvents.current.has(eventKey)) {
        console.log('📸 Duplicate photo avatar event ignored:', eventKey)
        return
      }
      
      // Mark event as processed
      processedEvents.current.add(eventKey)
      
      console.log('📸 Current notifications before update:', notifications)
      setNotifications(prev => {
        // Check if this exact notification already exists to prevent duplicates
        const exists = prev.some(notif => 
          notif.step === update.step && 
          notif.timestamp === update.timestamp &&
          notif.status === update.status
        )
        
        if (exists) {
          console.log('📸 Notification already exists, skipping:', update)
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
      
      const timestamp = new Date().toISOString()
      const eventKey = `avatar-ready-${data.avatarId}-${timestamp}`
      
      // Check if event was already processed
      if (processedEvents.current.has(eventKey)) {
        console.log('📸 Duplicate avatar-ready event ignored:', eventKey)
        return
      }
      
      // Mark event as processed
      processedEvents.current.add(eventKey)
      
      const completionUpdate: PhotoAvatarUpdate = {
        step: 'complete',
        status: 'success',
        data: {
          message: 'Your avatar is ready!',
          avatarId: data.avatarId,
          previewImageUrl: data.previewImageUrl
        },
        timestamp: timestamp
      }
      
      setNotifications(prev => {
        // Check if this completion notification already exists
        const exists = prev.some(notif => 
          notif.step === 'complete' && 
          notif.status === 'success' &&
          notif.data?.avatarId === data.avatarId
        )
        
        if (exists) {
          console.log('📸 Completion notification already exists, skipping:', completionUpdate)
          return prev
        }
        
        return [...prev, completionUpdate]
      })
    })

    // Listen for video download updates
    newSocket.on('video-download-update', (update: VideoDownloadUpdate) => {
      console.log('🎥 Video download update received:', update)
      
      // Create unique event key for deduplication
      const eventKey = `video-download-${update.videoId || 'unknown'}-${update.timestamp}`
      
      // Check if event was already processed
      if (processedEvents.current.has(eventKey)) {
        console.log('🎥 Duplicate video download event ignored:', eventKey)
        return
      }
      
      // Mark event as processed
      processedEvents.current.add(eventKey)
      
      setVideoNotifications(prev => {
        return [...prev, update]
      })
    })

    setSocket(newSocket)

    // Store reference to processed events for cleanup
    const currentProcessedEvents = processedEvents.current

    return () => {
      console.log('🧹 Cleaning up WebSocket connection')
      // Clear processed events on cleanup to prevent memory leaks
      currentProcessedEvents.clear()
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
