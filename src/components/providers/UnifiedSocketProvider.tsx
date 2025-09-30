'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { useUnifiedSocket, UnifiedSocketState } from '@/hooks/useUnifiedSocket'
import VideoStatusNotification from '@/components/ui/video-status-notification'
import AvatarStatusNotification from '@/components/ui/avatar-status-notification'

const UnifiedSocketContext = createContext<UnifiedSocketState | null>(null)

interface UnifiedSocketProviderProps {
  children: ReactNode
}

export function UnifiedSocketProvider({ children }: UnifiedSocketProviderProps) {
  const { user } = useSelector((state: RootState) => state.user)
  
  const socketState = useUnifiedSocket(user?.id || null)

  return (
    <UnifiedSocketContext.Provider value={socketState}>
      {children}
      {/* Global notification displays */}
      <VideoStatusNotification
        updates={socketState.videoUpdates}
        onClear={socketState.clearVideoUpdates}
      />
      <AvatarStatusNotification
        updates={socketState.avatarUpdates}
        isConnected={socketState.isConnected}
        onClear={socketState.clearAvatarUpdates}
      />
    </UnifiedSocketContext.Provider>
  )
}

export function useUnifiedSocketContext() {
  const context = useContext(UnifiedSocketContext)
  if (!context) {
    throw new Error('useUnifiedSocketContext must be used within UnifiedSocketProvider')
  }
  return context
}
