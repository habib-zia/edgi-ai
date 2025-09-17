'use client'

import { usePhotoAvatarNotificationContext } from '@/components/providers/PhotoAvatarNotificationProvider'

export default function WebSocketDebug() {
  const { 
    notifications, 
    isConnected, 
    isProcessing, 
    latestNotification 
  } = usePhotoAvatarNotificationContext()

  return (
    <div className="fixed bottom-4 left-4 bg-black text-white p-4 rounded-lg z-50 max-w-sm">
      <h3 className="font-bold mb-2">WebSocket Debug</h3>
      <div className="text-xs space-y-1">
        <div>Connected: {isConnected ? '✅' : '❌'}</div>
        <div>Processing: {isProcessing ? '✅' : '❌'}</div>
        <div>Notifications: {notifications.length}</div>
        <div>Latest: {latestNotification?.data?.message || 'None'}</div>
        <div>Step: {latestNotification?.step || 'None'}</div>
        <div>Status: {latestNotification?.status || 'None'}</div>
      </div>
      {notifications.length > 0 && (
        <div className="mt-2 text-xs">
          <div className="font-semibold">All Notifications:</div>
          {notifications.map((notif, index) => (
            <div key={index} className="text-xs">
              {notif.step}: {notif.status} - {notif.data?.message}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
