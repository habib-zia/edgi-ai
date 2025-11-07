import { useEffect, useState, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { getApiUrl } from '@/lib/config'
import { apiService, PendingWorkflow } from '@/lib/api-service'

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

export interface VideoAvatarStatusUpdate {
  notificationId: string
  avatarId: string
  step: string
  status: 'progress' | 'completed' | 'error'
  data?: {
    message: string
    error?: string
    avatarId?: string
    progress?: number
    avatar_name?: string
    preview_image_url?: string
    preview_video_url?: string
    default_voice_id?: string
  }
  timestamp: string
}

export interface ScheduleStatusUpdate {
  scheduleId: string
  status: 'processing' | 'ready' | 'failed'
  message: string
  data?: {
    scheduleId?: string
    error?: string
    generationTime?: number
  }
  timestamp: string
}

export interface VideoInProgress {
  id: string
  title: string
  status: 'processing'
  timestamp: string
  message: string
}

export interface UnifiedSocketState {
  socket: Socket | null
  isConnected: boolean
  videoUpdates: VideoStatusUpdate[]
  avatarUpdates: AvatarStatusUpdate[]
  videoAvatarUpdates: VideoAvatarStatusUpdate[]
  scheduleUpdates: ScheduleStatusUpdate[]
  latestVideoUpdate: VideoStatusUpdate | null
  latestAvatarUpdate: AvatarStatusUpdate | null
  latestVideoAvatarUpdate: VideoAvatarStatusUpdate | null
  latestScheduleUpdate: ScheduleStatusUpdate | null
  isVideoProcessing: boolean
  isAvatarProcessing: boolean
  isVideoAvatarProcessing: boolean
  isScheduleProcessing: boolean
  videosInProgress: VideoInProgress[]
  addVideoInProgress: (video: VideoInProgress) => void
  removeVideoInProgress: () => void
  clearVideoUpdates: () => void
  clearCompletedVideoUpdates: () => void
  clearAvatarUpdates: () => void
  clearVideoAvatarUpdates: () => void
  clearScheduleUpdates: () => void
  checkPendingWorkflows: (userId: string) => Promise<void>
}

const VIDEOS_IN_PROGRESS_KEY = 'videosInProgress'

export const useUnifiedSocket = (userId: string | null): UnifiedSocketState => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [videoUpdates, setVideoUpdates] = useState<VideoStatusUpdate[]>([])
  const [avatarUpdates, setAvatarUpdates] = useState<AvatarStatusUpdate[]>([])
  const [videoAvatarUpdates, setVideoAvatarUpdates] = useState<VideoAvatarStatusUpdate[]>([])
  const [scheduleUpdates, setScheduleUpdates] = useState<ScheduleStatusUpdate[]>([])
  const [videosInProgress, setVideosInProgress] = useState<VideoInProgress[]>([])
  
  // Track processed events to prevent duplicates
  const processedEvents = useRef(new Set<string>())
  const socketConnectedHandlers = useRef<Set<() => void>>(new Set())
  // Track if we've restored videos from localStorage to avoid adding duplicates from socket events
  const hasRestoredFromLocalStorage = useRef(false)
  // Track if we should skip saving to localStorage (to prevent overwriting after restore)
  const skipSaveToLocalStorage = useRef(false)
  // Track if we've synced with DB to avoid duplicate syncing
  const hasSyncedWithDB = useRef(false)

  // Load videos in progress from localStorage on mount (run FIRST, before cleanup)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(VIDEOS_IN_PROGRESS_KEY)
        if (saved) {
          const parsed = JSON.parse(saved) as VideoInProgress[]
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Skip saving to localStorage on the next render to prevent overwriting
            skipSaveToLocalStorage.current = true
            setVideosInProgress(parsed)
            hasRestoredFromLocalStorage.current = true
            console.log('📦 Restored videos in progress from localStorage:', parsed.length, 'videos')
            
            // Reset skip flag after a short delay to allow state to settle
            setTimeout(() => {
              skipSaveToLocalStorage.current = false
            }, 100)
            return
          }
        }
        // If no saved data, reset flags
        hasRestoredFromLocalStorage.current = false
        skipSaveToLocalStorage.current = false
      } catch (error) {
        console.warn('Failed to load videos in progress from localStorage:', error)
        hasRestoredFromLocalStorage.current = false
        skipSaveToLocalStorage.current = false
      }
    }
  }, []) // Run only once on mount, before userId check

  // Save videos in progress to localStorage whenever they change
  useEffect(() => {
    if (userId && typeof window !== 'undefined' && !skipSaveToLocalStorage.current) {
      try {
        if (videosInProgress.length > 0) {
          localStorage.setItem(VIDEOS_IN_PROGRESS_KEY, JSON.stringify(videosInProgress))
          console.log('💾 Saved videos in progress to localStorage:', videosInProgress.length, 'videos')
        } else {
          localStorage.removeItem(VIDEOS_IN_PROGRESS_KEY)
          console.log('🧹 Cleared videos in progress from localStorage')
        }
      } catch (error) {
        console.warn('Failed to save videos in progress to localStorage:', error)
      }
    } else if (skipSaveToLocalStorage.current) {
      console.log('⏭️ Skipping save to localStorage (just restored)')
    }
  }, [videosInProgress, userId])

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

  const clearVideoAvatarUpdates = useCallback(() => {
    setVideoAvatarUpdates([])
  }, [])

  const clearScheduleUpdates = useCallback(() => {
    setScheduleUpdates([])
  }, [])

  const addVideoInProgress = useCallback((video: VideoInProgress) => {
    setVideosInProgress(prev => [...prev, video])
    console.log('➕ Added video to progress tracking:', video)
  }, [])

  const removeVideoInProgress = useCallback(() => {
    setVideosInProgress(prev => {
      if (prev.length === 0) {
        console.log('⚠️ No videos in progress to remove')
        return prev
      }
      const removed = prev[0]
      const remaining = prev.slice(1)
      console.log('➖ Removed video from progress tracking (FIFO):', removed)
      return remaining
    })
  }, [])

  const checkPendingWorkflows = useCallback(async (userId: string) => {
    try {
      console.log('🔍 Checking pending workflows for user:', userId)
      const result = await apiService.checkPendingWorkflows(userId)
      
      if (result.success && result.data) {
        const { workflows } = result.data
        
        // Filter only pending/processing workflows
        const pendingWorkflows = workflows.filter(
          (workflow: PendingWorkflow) => 
            workflow.status === 'processing' || workflow.status === 'pending'
        )
        
        console.log('📊 Found pending workflows from DB:', pendingWorkflows.length, 'workflows')
        
        // Sync with localStorage: use DB count if localStorage is empty or out of sync
        if (typeof window !== 'undefined' && !hasSyncedWithDB.current) {
          const saved = localStorage.getItem(VIDEOS_IN_PROGRESS_KEY)
          const localStorageVideos = saved ? JSON.parse(saved) as VideoInProgress[] : []
          
          // If localStorage is empty or has fewer videos than DB, sync with DB
          if (localStorageVideos.length === 0 || localStorageVideos.length < pendingWorkflows.length) {
            console.log('🔄 Syncing videosInProgress with DB data (localStorage empty or out of sync)')
            
            // Create videos from DB workflows
            const videosFromDB: VideoInProgress[] = pendingWorkflows.map((workflow: PendingWorkflow, index: number) => ({
              id: `video-${workflow._id}-${workflow.executionId}`,
              title: workflow.title || `Video ${index + 1}`,
              status: 'processing',
              timestamp: workflow.createdAt || new Date().toISOString(),
              message: 'Your video creation is in progress'
            }))
            
            // Set videos from DB (only if localStorage is empty or we have more in DB)
            if (localStorageVideos.length === 0 || videosFromDB.length > localStorageVideos.length) {
              skipSaveToLocalStorage.current = true
              setVideosInProgress(videosFromDB)
              hasRestoredFromLocalStorage.current = true
              hasSyncedWithDB.current = true
              console.log('✅ Synced videosInProgress with DB:', videosFromDB.length, 'videos')
              
              // Reset skip flag after a short delay
              setTimeout(() => {
                skipSaveToLocalStorage.current = false
              }, 100)
            } else {
              hasSyncedWithDB.current = true
            }
          } else {
            console.log('📦 Using localStorage videos (count matches or exceeds DB count)')
            hasSyncedWithDB.current = true
          }
        } else if (hasSyncedWithDB.current) {
          console.log('⏭️ Already synced with DB, skipping duplicate sync')
        }
      }
    } catch (error) {
      console.error('Failed to check pending workflows:', error)
    }
  }, [])

  // Get latest updates
  const latestVideoUpdate = videoUpdates.length > 0 ? videoUpdates[videoUpdates.length - 1] : null
  const latestAvatarUpdate = avatarUpdates.length > 0 ? avatarUpdates[avatarUpdates.length - 1] : null
  const latestVideoAvatarUpdate = videoAvatarUpdates.length > 0 ? videoAvatarUpdates[videoAvatarUpdates.length - 1] : null
  const latestScheduleUpdate = scheduleUpdates.length > 0 ? scheduleUpdates[scheduleUpdates.length - 1] : null

  // Check processing states
  const isVideoProcessing = videoUpdates.some(update => 
    update.status === 'pending' || update.status === 'processing'
  )
  const isAvatarProcessing = avatarUpdates.some(update => 
    update.status === 'progress' && update.step !== 'ready'
  )
  const isVideoAvatarProcessing = videoAvatarUpdates.some(update => 
    update.status === 'progress'
  )
  const isScheduleProcessing = scheduleUpdates.some(update => 
    update.status === 'processing'
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
      setVideoAvatarUpdates([])
      setScheduleUpdates([])
      
      // Only clear videosInProgress if this is a real logout (socket exists)
      // Don't clear on initial mount when userId is temporarily null
      if (socket) {
        // This is a real logout (socket exists), clear everything
        setVideosInProgress([])
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem(VIDEOS_IN_PROGRESS_KEY)
            console.log('🧹 Cleared videos in progress from localStorage on logout')
          } catch (error) {
            console.warn('Failed to clear videos in progress from localStorage:', error)
          }
        }
        hasRestoredFromLocalStorage.current = false
        hasSyncedWithDB.current = false
        console.log('🧹 User logged out - cleared all socket data')
      } else {
        // This is initial mount (no socket yet), don't clear videosInProgress
        // The restore effect has already set it from localStorage
        console.log('⏭️ Skipping state clear on initial mount (videos restored from localStorage)')
      }
      
      processedEvents.current.clear()
      socketConnectedHandlers.current.clear()
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

      // Add video to progress tracking when processing status arrives
      // Only add if we don't have videos from localStorage (to avoid duplicates)
      if (status === 'processing' || status === 'pending') {
        // If we restored from localStorage, NEVER modify the state from socket events
        // localStorage is the source of truth
        if (hasRestoredFromLocalStorage.current) {
          console.log('📦 Videos already restored from localStorage, skipping socket event addition (localStorage is source of truth)')
          return
        }
        
        setVideosInProgress(prev => {
          // If we already have videos, don't add duplicates
          if (prev.length > 0) {
            console.log('📦 Already have videos in progress, skipping socket event addition')
            return prev
          }
          
          // Only add one video if we have no videos at all
          const newVideo: VideoInProgress = {
            id: `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: update.title || update.data?.title || 'Processing Video...',
            status: 'processing',
            timestamp: update.timestamp || new Date().toISOString(),
            message: update.message || update.data?.message || 'Your video creation is in progress'
          }
          
          console.log('➕ Added video to progress tracking from socket event:', newVideo)
          return [...prev, newVideo]
        })
      }

      // Remove one video from progress tracking when success/completed arrives (FIFO)
      if (status === 'completed' || status === 'success') {
        console.log('✅ Video completed/success - removing from progress tracking (FIFO)')
        setVideosInProgress(prev => {
          if (prev.length === 0) {
            console.log('⚠️ No videos in progress to remove')
            return prev
          }
          const removed = prev[0]
          const remaining = prev.slice(1)
          console.log('➖ Removed video from progress tracking (FIFO):', removed)
          // If we removed the last video, reset the flag so we can add from socket events again
          if (remaining.length === 0) {
            hasRestoredFromLocalStorage.current = false
          }
          return remaining
        })
      }
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

    // Video Avatar status updates
    newSocket.on('video-avatar-update', (update: VideoAvatarStatusUpdate) => {
      console.log('🎬 Video Avatar update received:', update)
      
      const eventKey = `video-avatar-${update.step}-${update.timestamp}`
      
      if (processedEvents.current.has(eventKey)) {
        console.log('🎬 Duplicate video avatar event ignored:', eventKey)
        return
      }
      
      processedEvents.current.add(eventKey)
      setVideoAvatarUpdates(prev => [...prev, update])
      
      // Auto-disconnect on completion or error as requested
      if (update.status === 'completed' || update.status === 'error') {
        console.log('🎬 Video avatar process finished, disconnecting socket')
        setTimeout(() => {
          newSocket.disconnect()
        }, 1000) // Small delay to ensure final update is processed
      }
    })

    // Schedule status updates
    newSocket.on('schedule-status', (data: any) => {
      console.log('📅 Schedule status update received:', data)
      
      const eventKey = `schedule-status-${data.scheduleId || 'unknown'}-${data.timestamp || Date.now()}`
      
      if (processedEvents.current.has(eventKey)) {
        console.log('📅 Duplicate schedule status event ignored:', eventKey)
        return
      }
      
      processedEvents.current.add(eventKey)
        console.log('data', data)
      const scheduleUpdate: ScheduleStatusUpdate = {
        scheduleId: data.data.scheduleId || 'unknown',
        status: data.status === 'ready' ? 'ready' : data.status === 'failed' ? 'failed' : 'processing',
        message: data.message || (data.status === 'ready' ? 'Your schedule is ready!' : data.status === 'failed' ? 'Schedule generation failed. Please try again.' : 'Schedule generation started.'),
        data: {
          scheduleId: data.data.scheduleId,
          error: data.error,
          generationTime: data.generationTime
        },
        timestamp: data.timestamp || new Date().toISOString()
      }
      
      console.log('📅 Processed schedule status update:', scheduleUpdate)
      setScheduleUpdates(prev => [...prev, scheduleUpdate])
      
      // Auto-disconnect on completion or failure as requested
      if (data.status === 'ready' || data.status === 'failed') {
        console.log('📅 Schedule generation finished, disconnecting socket')
        setTimeout(() => {
          newSocket.disconnect()
        }, 1000) // Small delay to ensure final update is processed
      }
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
    videoAvatarUpdates,
    scheduleUpdates,
    latestVideoUpdate,
    latestAvatarUpdate,
    latestVideoAvatarUpdate,
    latestScheduleUpdate,
    isVideoProcessing,
    isAvatarProcessing,
    isVideoAvatarProcessing,
    isScheduleProcessing,
    videosInProgress,
    addVideoInProgress,
    removeVideoInProgress,
    clearVideoUpdates,
    clearCompletedVideoUpdates,
    clearAvatarUpdates,
    clearVideoAvatarUpdates,
    clearScheduleUpdates,
    checkPendingWorkflows
  }
}
