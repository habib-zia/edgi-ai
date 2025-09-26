'use client'

import { useUnifiedSocketContext } from '@/components/providers/UnifiedSocketProvider'

export default function WebSocketDebug() {
  const { 
    avatarUpdates, 
    isConnected, 
    isAvatarProcessing, 
    latestAvatarUpdate 
  } = useUnifiedSocketContext()

  return (
    <div className="fixed bottom-4 left-4 bg-black text-white p-4 rounded-lg z-50 max-w-sm">
      <h3 className="font-bold mb-2">WebSocket Debug</h3>
      <div className="text-xs space-y-1">
        <div>Connected: {isConnected ? '✅' : '❌'}</div>
        <div>Avatar Processing: {isAvatarProcessing ? '✅' : '❌'}</div>
        <div>Avatar Updates: {avatarUpdates.length}</div>
        <div>Latest: {latestAvatarUpdate?.data?.message || 'None'}</div>
        <div>Step: {latestAvatarUpdate?.step || 'None'}</div>
        <div>Status: {latestAvatarUpdate?.status || 'None'}</div>
      </div>
      {avatarUpdates.length > 0 && (
        <div className="mt-2 text-xs">
          <div className="font-semibold">All Avatar Updates:</div>
          {avatarUpdates.map((notif, index) => (
            <div key={index} className="text-xs">
              {notif.step}: {notif.status} - {notif.data?.message}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
