'use client'

import { usePhotoAvatarNotificationContext } from '@/components/providers/PhotoAvatarNotificationProvider'

export default function WebSocketTest() {
  const { 
    isConnected, 
    notifications, 
    videoNotifications,
    latestNotification, 
    latestVideoNotification,
    isProcessing,
    isVideoProcessing 
  } = usePhotoAvatarNotificationContext()

  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-200 rounded-lg p-4 shadow-lg max-w-sm z-50">
      <h3 className="font-semibold text-gray-800 mb-2">WebSocket Status</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span>Status: {isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        
        <div>
          <span>Avatar Processing: {isProcessing ? 'Yes' : 'No'}</span>
        </div>
        
        <div>
          <span>Avatar Notifications: {notifications.length}</span>
        </div>
        
        <div>
          <span>Video Notifications: {videoNotifications.length}</span>
        </div>
        
        {latestNotification && (
          <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
            <div className="font-medium">Latest Avatar:</div>
            <div>Step: {latestNotification.step}</div>
            <div>Status: {latestNotification.status}</div>
            <div>Message: {latestNotification.data?.message}</div>
          </div>
        )}
        
        {latestVideoNotification && (
          <div className="mt-2 p-2 bg-blue-100 rounded text-xs">
            <div className="font-medium">Latest Video:</div>
            <div>Video ID: {latestVideoNotification.data?.title}</div>
            <div>Status: {latestVideoNotification.status}</div>
            <div>Message: {latestVideoNotification.data?.message}</div>
          </div>
        )}
      </div>
    </div>
  )
}
