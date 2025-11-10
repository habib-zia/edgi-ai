import { useState, useCallback, useMemo, useEffect } from 'react'
import { VideoInProgress } from './useUnifiedSocket'

export interface ProcessingToast {
  id: string
  title: string
  message: string
  timestamp: string
  minimized: boolean
}

export interface UseProcessingToastsReturn {
  toasts: ProcessingToast[]
  minimizedCount: number
  minimizeToast: (id: string) => void
  restoreToast: (id: string) => void
  updateToasts: (videos: VideoInProgress[]) => void
}

export function useProcessingToasts(): UseProcessingToastsReturn {
  const [toasts, setToasts] = useState<ProcessingToast[]>([])

  // Convert VideoInProgress[] to ProcessingToast[] and merge with existing minimize states
  const updateToasts = useCallback((videos: VideoInProgress[]) => {
    setToasts(prev => {
      // Create a map of existing minimize states by ID
      const minimizedMap = new Map<string, boolean>()
      prev.forEach(toast => {
        minimizedMap.set(toast.id, toast.minimized)
      })

      // Convert videos to toasts, preserving minimize state if toast already exists
      const newToasts: ProcessingToast[] = videos.map(video => ({
        id: video.id,
        title: video.title,
        message: video.message,
        timestamp: video.timestamp,
        minimized: minimizedMap.get(video.id) ?? false // Preserve existing minimize state or default to false
      }))

      // Remove toasts that are no longer in the videos list (videos completed/removed)
      // But keep minimized toasts temporarily so they can be restored
      const existingIds = new Set(videos.map(v => v.id))
      const removedToasts = prev.filter(t => !existingIds.has(t.id) && t.minimized)
      
      // Combine new toasts with removed but minimized toasts
      return [...newToasts, ...removedToasts]
    })
  }, [])

  const minimizeToast = useCallback((id: string) => {
    setToasts(prev => 
      prev.map(toast => 
        toast.id === id ? { ...toast, minimized: true } : toast
      )
    )
  }, [])

  const restoreToast = useCallback((id: string) => {
    setToasts(prev => 
      prev.map(toast => 
        toast.id === id ? { ...toast, minimized: false } : toast
      )
    )
  }, [])

  const minimizedCount = useMemo(() => {
    return toasts.filter(toast => toast.minimized).length
  }, [toasts])

  return {
    toasts,
    minimizedCount,
    minimizeToast,
    restoreToast,
    updateToasts
  }
}

