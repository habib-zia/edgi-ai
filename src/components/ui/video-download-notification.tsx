'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, X, Download, Play } from 'lucide-react'
import { VideoDownloadUpdate } from '@/hooks/usePhotoAvatarNotifications'

interface VideoDownloadNotificationProps {
  notifications: VideoDownloadUpdate[]
  onClose?: () => void
  className?: string
}

export default function VideoDownloadNotification({ 
  notifications, 
  onClose,
  className = '' 
}: VideoDownloadNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  // Show notification when we have updates
  useEffect(() => {
    if (notifications.length > 0) {
      setIsVisible(true)
    }
  }, [notifications])

  const getStatusIcon = (status: string) => {
    if (status === 'error') {
      return <AlertCircle className="w-5 h-5 text-red-500" />
    }
    return <CheckCircle className="w-5 h-5 text-green-500" />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  const getStatusMessage = (status: string): string => {
    switch (status) {
      case 'success':
        return 'Video Ready!'
      case 'error':
        return 'Video Creation Failed'
      default:
        return 'Video Status'
    }
  }

  const latestNotification = notifications[notifications.length - 1]

  if (!isVisible || !latestNotification) return null

  return (
    <div className={`fixed top-20 right-4 z-[60] max-w-sm w-full ${className}`}>
      <div className={`border rounded-lg shadow-lg p-4 transition-all duration-300 ${getStatusColor(latestNotification.status)}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getStatusIcon(latestNotification.status)}
            <h4 className="font-semibold text-gray-800">
              {getStatusMessage(latestNotification.status)}
            </h4>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Connection Status */}
        {/* <div className="flex items-center gap-2 mb-3">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div> */}

        {/* Video ID */}
        {latestNotification.data?.message && (
        <div className="text-xs text-gray-600 mb-2">
            Video Title: {latestNotification.data?.title}
          </div>
        )}

        {/* Message */}
        <div className="text-sm text-gray-700 mb-3">
          {(latestNotification as any).message || latestNotification.data?.message}
        </div>

        {/* Action Buttons */}
        {latestNotification.status === 'success' && latestNotification.data?.downloadUrl && (
          <div className="flex gap-2">
            <a
              href={latestNotification.data.downloadUrl}
              download
              className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
            <a
              href={latestNotification.data.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Play className="w-4 h-4" />
              View
            </a>
          </div>
        )}

        {/* Error Details */}
        {latestNotification.status === 'error' && latestNotification.data?.error && (
          <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700">
            {latestNotification.data.error}
          </div>
        )}

        {/* Success Message */}
        {latestNotification.status === 'success' && (
          <div className="mt-2 p-2 bg-green-100 border border-green-200 rounded text-xs text-green-700">
            🎉 Your video is ready! You can now download or view it.
          </div>
        )}
      </div>
    </div>
  )
}
