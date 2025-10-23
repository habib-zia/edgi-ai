'use client'

import { useState, useCallback } from 'react'
import { apiService } from '@/lib/api-service'

interface UseScheduleReturn {
  scheduleData: any
  scheduleLoading: boolean
  scheduleError: string | null
  fetchSchedule: () => Promise<void>
  deleteSchedule: (scheduleId: string) => Promise<boolean>
  clearScheduleData: () => void
}

export const useSchedule = (): UseScheduleReturn => {
  const [scheduleData, setScheduleData] = useState<any>(null)
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [scheduleError, setScheduleError] = useState<string | null>(null)

  // Fetch schedule data
  const fetchSchedule = useCallback(async () => {
    try {
      setScheduleLoading(true)
      setScheduleError(null)
      
      const response = await apiService.getSchedule()
      
      if (response.success && response.data) {
        setScheduleData(response.data)
        console.log('Schedule data fetched successfully:', response.data)
      } else {
        setScheduleData(null)
        // setScheduleError(response.message || 'Failed to fetch schedule data')
      }
    } catch (error: any) {
      console.error('❌ Error fetching schedule data:', error)
      setScheduleData(null)
      // setScheduleError(error.message || 'Failed to fetch schedule data')
    } finally {
      setScheduleLoading(false)
    }
  }, [])

  // Delete schedule
  const deleteSchedule = useCallback(async (scheduleId: string): Promise<boolean> => {
    try {
      setScheduleLoading(true)
      setScheduleError(null)
      const response = await apiService.deleteSchedule(scheduleId)
      
      if (response.success) {
        console.log('Schedule deleted successfully')
        
        // Show success notification
        if ((window as any).showNotification) {
          (window as any).showNotification({
            type: 'success',
            title: 'Schedule Deleted',
            message: 'Your schedule has been deleted successfully!',
            duration: 5000
          })
        }
        
        // Refresh schedule data after successful deletion
        await fetchSchedule()
        
        return true
      } else {
        console.error('Failed to delete schedule:', response.message)
        
        // Show error notification
        if ((window as any).showNotification) {
          (window as any).showNotification({
            type: 'error',
            title: 'Delete Failed',
            message: response.message || 'Failed to delete schedule',
            duration: 5000
          })
        }
        
        // setScheduleError(response.message || 'Failed to delete schedule')
        return false
      }
    } catch (error: any) {
      console.error('Error deleting schedule:', error)
      
      // Show error notification
      if ((window as any).showNotification) {
        (window as any).showNotification({
          type: 'error',
          title: 'Network Error',
          message: 'Failed to delete schedule. Please try again.',
          duration: 5000
        })
      }
      
      // setScheduleError(error.message || 'Failed to delete schedule')
      return false
    } finally {
      setScheduleLoading(false)
    }
  }, [fetchSchedule])

  // Clear schedule data
  const clearScheduleData = useCallback(() => {
    setScheduleData(null)
    setScheduleError(null)
  }, [])

  return {
    // State
    scheduleData,
    scheduleLoading,
    scheduleError,
    
    // Actions
    fetchSchedule,
    deleteSchedule,
    
    // Utilities
    clearScheduleData
  }
}

export default useSchedule
