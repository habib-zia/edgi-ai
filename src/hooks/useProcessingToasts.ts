import { useState, useCallback, useMemo } from 'react'
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

      // Return only toasts for videos that are still pending
      // All toasts (including minimized ones) are removed when their video completes/fails
      return newToasts
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

