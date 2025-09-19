'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { usePhotoAvatarNotifications } from '@/hooks/usePhotoAvatarNotifications'
import PhotoAvatarNotification from '@/components/ui/photo-avatar-notification'
import VideoDownloadNotification from '@/components/ui/video-download-notification'

interface PhotoAvatarNotificationContextType {
  notifications: any[]
  videoNotifications: any[]
  isConnected: boolean
  isProcessing: boolean
  isVideoProcessing: boolean
  clearNotifications: () => void
  clearVideoNotifications: () => void
  latestNotification: any
  latestVideoNotification: any
}

const PhotoAvatarNotificationContext = createContext<PhotoAvatarNotificationContextType | null>(null)

interface PhotoAvatarNotificationProviderProps {
  children: ReactNode
}

export function PhotoAvatarNotificationProvider({ children }: PhotoAvatarNotificationProviderProps) {
  const { user } = useSelector((state: RootState) => state.user)
  
  const {
    notifications,
    videoNotifications,
    isConnected,
    isProcessing,
    isVideoProcessing,
    clearNotifications,
    clearVideoNotifications,
    latestNotification,
    latestVideoNotification
  } = usePhotoAvatarNotifications(user?.id || null)

  const value = {
    notifications,
    videoNotifications,
    isConnected,
    isProcessing,
    isVideoProcessing,
    clearNotifications,
    clearVideoNotifications,
    latestNotification,
    latestVideoNotification
  }

  return (
    <PhotoAvatarNotificationContext.Provider value={value}>
      {children}
      {/* Global notification display */}
      <PhotoAvatarNotification
        notifications={notifications}
        isConnected={isConnected}
        onClose={clearNotifications}
      />
      <VideoDownloadNotification
        notifications={videoNotifications}
        // isConnected={isConnected}
        onClose={clearVideoNotifications}
      />
    </PhotoAvatarNotificationContext.Provider>
  )
}

export function usePhotoAvatarNotificationContext() {
  const context = useContext(PhotoAvatarNotificationContext)
  if (!context) {
    throw new Error('usePhotoAvatarNotificationContext must be used within PhotoAvatarNotificationProvider')
  }
  return context
}
