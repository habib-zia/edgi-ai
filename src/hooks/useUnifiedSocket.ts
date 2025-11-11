import { useEffect, useState, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { getApiUrl } from '@/lib/config'
import { apiService, PendingWorkflow } from '@/lib/api-service'
import { useNotificationStore } from '@/components/ui/global-notification'

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
  pendingVideos: VideoInProgress[]
  addPendingVideo: (video: VideoInProgress) => void
  removePendingVideo: () => void
  clearVideoUpdates: () => void
  clearCompletedVideoUpdates: () => void
  clearAvatarUpdates: () => void
  clearVideoAvatarUpdates: () => void
  clearScheduleUpdates: () => void
  syncPendingVideos: (userId: string) => Promise<void>
}

const PENDING_VIDEOS_KEY = 'pendingVideos'

export const useUnifiedSocket = (userId: string | null): UnifiedSocketState => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [videoUpdates, setVideoUpdates] = useState<VideoStatusUpdate[]>([])
  const [avatarUpdates, setAvatarUpdates] = useState<AvatarStatusUpdate[]>([])
  const [videoAvatarUpdates, setVideoAvatarUpdates] = useState<VideoAvatarStatusUpdate[]>([])
  const [scheduleUpdates, setScheduleUpdates] = useState<ScheduleStatusUpdate[]>([])
  const [pendingVideos, setPendingVideos] = useState<VideoInProgress[]>([])
  const { showNotification } = useNotificationStore()
  
  // Track processed events to prevent duplicates
  const processedEvents = useRef(new Set<string>())
  const socketConnectedHandlers = useRef<Set<() => void>>(new Set())
  // Track if we've synced with DB to avoid duplicate syncing
  const hasSyncedWithDB = useRef(false)
  // Track if we should skip saving to localStorage (to prevent overwriting after DB sync)
  const skipSaveToLocalStorage = useRef(false)
  // Track failed videos to avoid duplicate notifications
  const notifiedFailedVideos = useRef(new Set<string>())
  // Track completed videos to avoid duplicate notifications
  const notifiedCompletedVideos = useRef(new Set<string>())

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

  const addPendingVideo = useCallback((video: VideoInProgress) => {
    setPendingVideos(prev => [...prev, video])
    console.log('➕ Added pending video:', video)
  }, [])

  const removePendingVideo = useCallback(() => {
    setPendingVideos(prev => {
      if (prev.length === 0) {
        console.log('⚠️ No pending videos to remove')
        return prev
      }
      const removed = prev[0]
      const remaining = prev.slice(1)
      console.log('➖ Removed pending video (FIFO):', removed)
      return remaining
    })
  }, [])

  // Sync pending videos with database - DB is the source of truth
  const syncPendingVideos = useCallback(async (userId: string) => {
    try {
      console.log('🔍 Syncing pending videos with DB for user:', userId)
      const result = await apiService.checkPendingWorkflows(userId)
      
      if (result.success && result.data) {
        const { workflows } = result.data
        
        // Log all workflows to debug status values
        console.log('📊 All workflows from DB:', workflows.map((w: PendingWorkflow) => ({ 
          id: w._id, 
          status: w.status, 
          title: w.title 
        })))
        
        // Check for failed workflows and show notifications
        // Use functional update to access current pending videos
        setPendingVideos(prev => {
          // Create a map of current video IDs (both DB format and temporary format)
          const currentVideoIds = new Set<string>()
          const currentVideoTitles = new Map<string, string>() // Map title to video ID
          
          prev.forEach(v => {
            currentVideoIds.add(v.id)
            currentVideoTitles.set(v.title, v.id)
            
            // Also extract workflow ID if it's in DB format (video-{_id}-{executionId})
            const match = v.id.match(/^video-(.+)-(.+)$/)
            if (match) {
              currentVideoIds.add(match[1]) // Add workflow _id
            }
          })
          
          // Find failed workflows
          const failedWorkflows = workflows.filter(
            (workflow: PendingWorkflow) => workflow.status === 'failed'
          )
          
          // Show notification for each failed video (only once per video)
          failedWorkflows.forEach((workflow: PendingWorkflow) => {
            const workflowId = workflow._id
            const videoId = `video-${workflow._id}-${workflow.executionId}`
            const videoTitle = workflow.title || 'Video'
            
            // Check if this failed workflow matches any current pending video
            // Match by: workflow _id, video ID format, or title
            const matchesCurrentVideo = 
              currentVideoIds.has(workflowId) || 
              currentVideoIds.has(videoId) ||
              currentVideoTitles.has(videoTitle)
            
            if (matchesCurrentVideo && !notifiedFailedVideos.current.has(videoId)) {
              notifiedFailedVideos.current.add(videoId)
              showNotification(
                `Video "${videoTitle}" creation failed. Please try creating it again.`,
                'error'
              )
              console.log('❌ Video failed:', videoTitle, workflow._id)
            }
          })
          
          // Find completed workflows
          const completedWorkflows = workflows.filter(
            (workflow: PendingWorkflow) => workflow.status === 'completed'
          )
          
          // Show success notification for each completed video (only once per video)
          completedWorkflows.forEach((workflow: PendingWorkflow) => {
            const workflowId = workflow._id
            const videoId = `video-${workflow._id}-${workflow.executionId}`
            const videoTitle = workflow.title || 'Video'
            
            // Check if this completed workflow matches any current pending video
            // Match by: workflow _id, video ID format, or title
            const matchesCurrentVideo = 
              currentVideoIds.has(workflowId) || 
              currentVideoIds.has(videoId) ||
              currentVideoTitles.has(videoTitle)
            
            if (matchesCurrentVideo && !notifiedCompletedVideos.current.has(videoId)) {
              notifiedCompletedVideos.current.add(videoId)
              showNotification(
                `Video "${videoTitle}" is ready! You can view it in your gallery.`,
                'success'
              )
              console.log('✅ Video completed:', videoTitle, workflow._id)
            }
          })
          
          return prev // Return unchanged for now, we'll update below
        })
        
        // Filter workflows that are not completed or failed (include all active states)
        const pendingWorkflows = workflows.filter(
          (workflow: PendingWorkflow) => 
            workflow.status !== 'completed' && workflow.status !== 'failed'
        )
        
        console.log('📊 Found pending workflows from DB:', pendingWorkflows.length, 'workflows')
        
        // DB is the source of truth - always sync with DB
        if (typeof window !== 'undefined') {
          // Create videos from DB workflows
          const videosFromDB: VideoInProgress[] = pendingWorkflows.map((workflow: PendingWorkflow, index: number) => ({
            id: `video-${workflow._id}-${workflow.executionId}`,
            title: workflow.title || `Video ${index + 1}`,
            status: 'processing',
            timestamp: workflow.createdAt || new Date().toISOString(),
            message: 'Your video creation is in progress'
          }))
          
          // Remove failed videos from pending list (they're already filtered out above)
          // This will automatically remove them from toasts and tiles
          skipSaveToLocalStorage.current = true
          setPendingVideos(videosFromDB)
          hasSyncedWithDB.current = true
          console.log('✅ Synced pending videos with DB (source of truth):', videosFromDB.length, 'videos')
          
          // Clean up notified failed/completed videos that are no longer in the system
          const currentVideoIds = new Set(videosFromDB.map(v => v.id))
          notifiedFailedVideos.current.forEach(videoId => {
            if (!currentVideoIds.has(videoId)) {
              // Keep in set for a while to avoid duplicate notifications if user creates same video again
              // Will be cleaned up on logout or after some time
            }
          })
          notifiedCompletedVideos.current.forEach(videoId => {
            if (!currentVideoIds.has(videoId)) {
              // Keep in set for a while to avoid duplicate notifications if user creates same video again
              // Will be cleaned up on logout or after some time
            }
          })
          
          // Reset skip flag after a short delay
          setTimeout(() => {
            skipSaveToLocalStorage.current = false
          }, 100)
        }
      } else {
        // If DB check fails, try to load from localStorage as fallback
        if (typeof window !== 'undefined' && !hasSyncedWithDB.current) {
          try {
            const saved = localStorage.getItem(PENDING_VIDEOS_KEY)
            if (saved) {
              const parsed = JSON.parse(saved) as VideoInProgress[]
              if (Array.isArray(parsed) && parsed.length > 0) {
                skipSaveToLocalStorage.current = true
                setPendingVideos(parsed)
                console.log('📦 Loaded pending videos from localStorage (DB unavailable):', parsed.length, 'videos')
                setTimeout(() => {
                  skipSaveToLocalStorage.current = false
                }, 100)
              }
            }
          } catch (error) {
            console.warn('Failed to load pending videos from localStorage:', error)
          }
        }
      }
    } catch (error) {
      console.error('Failed to sync pending videos:', error)
      // Fallback to localStorage if DB sync fails
      if (typeof window !== 'undefined' && !hasSyncedWithDB.current) {
        try {
          const saved = localStorage.getItem(PENDING_VIDEOS_KEY)
          if (saved) {
            const parsed = JSON.parse(saved) as VideoInProgress[]
            if (Array.isArray(parsed) && parsed.length > 0) {
              skipSaveToLocalStorage.current = true
              setPendingVideos(parsed)
              console.log('📦 Loaded pending videos from localStorage (fallback):', parsed.length, 'videos')
              setTimeout(() => {
                skipSaveToLocalStorage.current = false
              }, 100)
            }
          }
        } catch (err) {
          console.warn('Failed to load pending videos from localStorage:', err)
        }
      }
    }
  }, [showNotification])

  // Initial sync with DB on mount if userId is available
  useEffect(() => {
    if (userId && !hasSyncedWithDB.current) {
      console.log('🔄 Initial sync with DB on mount')
      syncPendingVideos(userId)
    }
  }, [userId, syncPendingVideos])

  // Continuous polling every 20 seconds regardless of connection status
  useEffect(() => {
    if (!userId) return

    const pollInterval = setInterval(() => {
      console.log('🔄 Periodic polling: syncing pending videos with DB (every 20s)')
      syncPendingVideos(userId)
    }, 60000) // Poll every 60 seconds continuously

    return () => clearInterval(pollInterval)
  }, [userId, syncPendingVideos])

  // Save pending videos to localStorage whenever they change
  useEffect(() => {
    if (userId && typeof window !== 'undefined' && !skipSaveToLocalStorage.current) {
      try {
        if (pendingVideos.length > 0) {
          localStorage.setItem(PENDING_VIDEOS_KEY, JSON.stringify(pendingVideos))
          console.log('💾 Saved pending videos to localStorage:', pendingVideos.length, 'videos')
        } else {
          localStorage.removeItem(PENDING_VIDEOS_KEY)
          console.log('🧹 Cleared pending videos from localStorage')
        }
      } catch (error) {
        console.warn('Failed to save pending videos to localStorage:', error)
      }
    } else if (skipSaveToLocalStorage.current) {
      console.log('⏭️ Skipping save to localStorage (just synced with DB)')
    }
  }, [pendingVideos, userId])

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
      
      // Only clear pendingVideos if this is a real logout (socket exists)
      // Don't clear on initial mount when userId is temporarily null
      if (socket) {
        // This is a real logout (socket exists), clear everything
        setPendingVideos([])
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem(PENDING_VIDEOS_KEY)
            console.log('🧹 Cleared pending videos from localStorage on logout')
          } catch (error) {
            console.warn('Failed to clear pending videos from localStorage:', error)
          }
        }
        hasSyncedWithDB.current = false
        notifiedFailedVideos.current.clear()
        notifiedCompletedVideos.current.clear()
        console.log('🧹 User logged out - cleared all socket data')
      } else {
        // This is initial mount (no socket yet), sync with DB instead of clearing
        console.log('⏭️ Initial mount - will sync pending videos with DB on connection')
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
      
      // Sync pending videos with DB after connection (DB is source of truth)
      syncPendingVideos(userId)
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
      
      // Sync pending videos with DB after reconnection (DB is source of truth)
      syncPendingVideos(userId)
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
      // Only add if we don't have videos from DB sync (to avoid duplicates)
      if (status === 'processing' || status === 'pending') {
        // If we synced with DB, don't add from socket events - DB is source of truth
        if (hasSyncedWithDB.current) {
          console.log('📦 Already synced with DB, skipping socket event addition (DB is source of truth)')
          return
        }
        
        setPendingVideos(prev => {
          // If we already have videos, don't add duplicates
          if (prev.length > 0) {
            console.log('📦 Already have pending videos, skipping socket event addition')
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
          
          console.log('➕ Added pending video from socket event:', newVideo)
          return [...prev, newVideo]
        })
      }

      // Remove one video from progress tracking when success/completed arrives (FIFO)
      // Verify in DB first before removing
      if (status === 'completed' || status === 'success') {
        console.log('✅ Video completed/success - verifying in DB before removing (FIFO)')
        
        // Helper function to show notification and remove video
        const showNotificationAndRemove = (prev: VideoInProgress[], context: string) => {
          if (prev.length === 0) {
            return prev
          }
          const removed = prev[0]
          const videoId = removed.id
          const videoTitle = removed.title || 'Video'
          
          // Show notification if not already notified
          if (!notifiedCompletedVideos.current.has(videoId)) {
            notifiedCompletedVideos.current.add(videoId)
            showNotification(
              `Video "${videoTitle}" is ready! You can view it in your gallery.`,
              'success'
            )
            console.log('✅ Video completed notification shown:', videoTitle, videoId)
          }
          
          const remaining = prev.slice(1)
          console.log(`➖ Removed pending video (FIFO, ${context}):`, removed)
          return remaining
        }
        
        // Verify completion in DB before removing
        if (userId) {
          // First sync with DB to get latest state
          syncPendingVideos(userId).then(() => {
            // After DB sync, check if we should remove one video
            // DB sync already updated the state, so we just need to verify count
            apiService.checkPendingWorkflows(userId).then(result => {
              if (result.success && result.data) {
                const pendingWorkflows = result.data.workflows.filter(
                  (workflow: PendingWorkflow) => 
                    workflow.status !== 'completed' && workflow.status !== 'failed'
                )
                
                // Get current local state count
                setPendingVideos(prev => {
                  // Only remove if DB has fewer pending items than our local state
                  if (pendingWorkflows.length < prev.length) {
                    return showNotificationAndRemove(prev, 'DB verified')
                  } else {
                    console.log('⏸️ DB verification: keeping pending videos (count matches)')
                    return prev
                  }
                })
              } else {
                // If DB check fails, still remove (FIFO assumption)
                setPendingVideos(prev => showNotificationAndRemove(prev, 'DB check failed'))
              }
            }).catch(() => {
              // If DB check fails, still remove (FIFO assumption)
              setPendingVideos(prev => showNotificationAndRemove(prev, 'DB error'))
            })
          }).catch(() => {
            // If sync fails, still remove (FIFO assumption)
            setPendingVideos(prev => showNotificationAndRemove(prev, 'sync failed'))
          })
        } else {
          // No userId, just remove (FIFO)
          setPendingVideos(prev => {
            if (prev.length === 0) {
              console.log('⚠️ No pending videos to remove')
              return prev
            }
            return showNotificationAndRemove(prev, 'no userId')
          })
        }
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
  }, [userId, syncPendingVideos]) // eslint-disable-line react-hooks/exhaustive-deps

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
    pendingVideos,
    addPendingVideo,
    removePendingVideo,
    clearVideoUpdates,
    clearCompletedVideoUpdates,
    clearAvatarUpdates,
    clearVideoAvatarUpdates,
    clearScheduleUpdates,
    syncPendingVideos
  }
}
