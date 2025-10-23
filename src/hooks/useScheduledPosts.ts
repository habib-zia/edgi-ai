'use client'

import { useState, useCallback } from 'react'
import { apiService } from '@/lib/api-service'

interface ScheduledPost {
  id: string
  index: number
  scheduleId: string
  description: string
  keypoints: string
  scheduledFor: string
  status: string
  captions: {
    instagram: string
    facebook: string
    linkedin: string
    twitter: string
    tiktok: string
    youtube: string
  }
  scheduledForLocal: string
}

interface ScheduleInfo {
  frequency: string
  startDate: string
  endDate: string
  isActive: boolean
}

interface ScheduledPostsResponse {
  id: string
  timezone: string
  totalPendingPosts: number
  pendingPosts: ScheduledPost[]
  scheduleInfo: ScheduleInfo
}

interface UseScheduledPostsReturn {
  // State
  scheduledPostsDurationData: ScheduledPostsResponse | null
  scheduledPosts: ScheduledPost[]
  scheduleId: string | null
  timezone: string | null
  totalPendingPosts: number
  scheduleInfo: ScheduleInfo | null
  loading: boolean
  error: string | null
  
  // Actions
  fetchScheduledPosts: () => Promise<void>
  refreshScheduledPosts: () => Promise<void>
  
  // Utilities
  clearError: () => void
}

export const useScheduledPosts = (): UseScheduledPostsReturn => {
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [scheduledPostsDurationData, setScheduledPostsDurationData] = useState<ScheduledPostsResponse | null>(null)
  const [scheduleId, setScheduleId] = useState<string | null>(null)
  const [timezone, setTimezone] = useState<string | null>(null)
  const [totalPendingPosts, setTotalPendingPosts] = useState<number>(0)
  const [scheduleInfo, setScheduleInfo] = useState<ScheduleInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch scheduled posts data
  const fetchScheduledPosts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiService.getScheduledPosts()
      
      if (response.success && response.data) {
        const data: ScheduledPostsResponse = response.data
        
        // Set the main data
        setScheduledPostsDurationData(data)
        setScheduledPosts(data.pendingPosts || [])
        setScheduleId(data.id)
        setTimezone(data.timezone)
        setTotalPendingPosts(data.totalPendingPosts)
        setScheduleInfo(data.scheduleInfo)
        
      } else {
        setScheduledPosts([])
        setScheduledPostsDurationData(null)
        setScheduleId(null)
        setTimezone(null)
        setTotalPendingPosts(0)
        setScheduleInfo(null)
        // setError(response.message || 'Failed to fetch scheduled posts')
      }
    } catch (error: any) {
      console.error('❌ Error fetching scheduled posts:', error)
      setScheduledPosts([])
      setScheduledPostsDurationData(null)
      setScheduleId(null)
      setTimezone(null)
      setTotalPendingPosts(0)
      setScheduleInfo(null)
      // setError(error.message || 'Failed to fetch scheduled posts')
    } finally {
      setLoading(false)
    }
  }, [])

  // Refresh scheduled posts (alias for fetchScheduledPosts)
  const refreshScheduledPosts = useCallback(async () => {
    await fetchScheduledPosts()
  }, [fetchScheduledPosts])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // State
    scheduledPosts,
    scheduleId,
    timezone,
    totalPendingPosts,
    scheduleInfo,
    loading,
    error,
    scheduledPostsDurationData,
    // Actions
    fetchScheduledPosts,
    refreshScheduledPosts,
    
    // Utilities
    clearError
  }
}

export default useScheduledPosts
