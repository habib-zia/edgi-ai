'use client'

import { useState, useEffect } from 'react'
import { useSchedule } from './useSchedule'

interface UseRecentPostsReturn {
  // Modal states
  showDeleteModal: boolean
  showConnectAccountsModal: boolean
  
  // Schedule data
  scheduleData: any
  scheduleLoading: boolean
  
  // Post selection states
  selectedDays: { [key: number]: string }
  selectedPlatforms: { [key: number]: string }
  
  // Modal handlers
  handleDeleteClick: () => void
  handleDeleteConfirm: () => Promise<void>
  handleDeleteCancel: () => void
  handleAccountsClick: () => void
  handleConnectAccountsClose: () => void
  handleConnectAccountsNext: () => void
  
  // Post selection handlers
  handleDaySelect: (postId: number, day: string) => void
  handlePlatformSelect: (postId: number, platform: string) => void
  
  // Helper functions
  getDefaultDay: (postId: number) => string
  getDefaultPlatform: (postId: number, availablePlatforms?: string[]) => string
  
  // Utilities
  setShowDeleteModal: (show: boolean) => void
  setShowConnectAccountsModal: (show: boolean) => void
}

export const useRecentPosts = (): UseRecentPostsReturn => {
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showConnectAccountsModal, setShowConnectAccountsModal] = useState(false)
  
  // Use schedule hook
  const { scheduleData, scheduleLoading, fetchSchedule, deleteSchedule } = useSchedule()

  // Post selection states - now supports dynamic IDs from API
  const [selectedDays, setSelectedDays] = useState<{ [key: number]: string }>({})
  const [selectedPlatforms, setSelectedPlatforms] = useState<{ [key: number]: string }>({})

  // Fetch schedule data on component mount
  useEffect(() => {
    fetchSchedule()
  }, [fetchSchedule])

  // Post selection handlers
  const handleDaySelect = (postId: number, day: string) => {
    setSelectedDays(prev => ({
      ...prev,
      [postId]: day
    }))
  }

  const handlePlatformSelect = (postId: number, platform: string) => {
    setSelectedPlatforms(prev => ({
      ...prev,
      [postId]: platform
    }))
  }

  // Helper function to get default values for posts
  const getDefaultDay = (postId: number) => {
    return selectedDays[postId] || 'Fri';
  };

  const getDefaultPlatform = (postId: number, availablePlatforms: string[] = []) => {
    return selectedPlatforms[postId] || availablePlatforms[0] || 'Instagram';
  };

  // Schedule delete handlers
  const handleDeleteClick = () => {
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      const scheduleId = scheduleData?.id
      if (scheduleId) {
        const success = await deleteSchedule(scheduleId)
        if (success) {
          console.log('Schedule deleted successfully from RecentPosts')
        }
      } else {
        console.error('No schedule ID found')
        if ((window as any).showNotification) {
          (window as any).showNotification({
            type: 'error',
            title: 'Delete Failed',
            message: 'No schedule found to delete',
            duration: 5000
          })
        }
      }
    } catch (error) {
      console.error('Error in handleDeleteConfirm:', error)
    } finally {
      setShowDeleteModal(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
  }

  // Connect accounts modal handlers
  const handleAccountsClick = () => {
    setShowConnectAccountsModal(true)
  }

  const handleConnectAccountsClose = () => {
    setShowConnectAccountsModal(false)
  }

  const handleConnectAccountsNext = () => {
    setShowConnectAccountsModal(false)
  }

  return {
    // Modal states
    showDeleteModal,
    showConnectAccountsModal,
    
    // Schedule data
    scheduleData,
    scheduleLoading,
    
    // Post selection states
    selectedDays,
    selectedPlatforms,
    
    // Modal handlers
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleAccountsClick,
    handleConnectAccountsClose,
    handleConnectAccountsNext,
    
    // Post selection handlers
    handleDaySelect,
    handlePlatformSelect,
    
    // Helper functions
    getDefaultDay,
    getDefaultPlatform,
    
    // Utilities
    setShowDeleteModal,
    setShowConnectAccountsModal
  }
}

export default useRecentPosts
