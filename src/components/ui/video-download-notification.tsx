'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, X, Download, Play, Minimize2 } from 'lucide-react'
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
  const [isMinimized, setIsMinimized] = useState(false)

  // Show notification when we have updates
  useEffect(() => {
    if (notifications.length > 0) {
      setIsVisible(true)
      setIsMinimized(false) // Reset minimized state when new notification arrives
    }
  }, [notifications])

  const handleMinimize = () => {
    setIsMinimized(true)
  }

  const handleMaximize = () => {
    setIsMinimized(false)
  }

  const getStatusIcon = (status: string) => {
    if (status === 'failed') {
      return <AlertCircle className="w-5 h-5 text-red-500" />
    }
    if (status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    }
    // For pending status, show a loading spinner or processing icon
    return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50'
      case 'failed':
        return 'border-red-200 bg-red-50'
      case 'pending':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  const getStatusMessage = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'Video Ready!'
      case 'failed':
        return 'Video Creation Failed'
      case 'pending':
        return 'Video Processing'
      default:
        return 'Video Status'
    }
  }

  const latestNotification = notifications[notifications.length - 1]

  if (!isVisible || !latestNotification) return null

  // Minimized state - show FAB style button in bottom right
  if (isMinimized) {
    const getMinimizedStyle = (status: string) => {
      switch (status) {
        case 'completed':
          return 'bg-gradient-to-br from-green-500 to-green-600'
        case 'failed':
          return 'bg-gradient-to-br from-red-500 to-red-600'
        default:
          return 'bg-gradient-to-br from-blue-500 to-blue-600'
      }
    }

    const getMinimizedIcon = (status: string) => {
      switch (status) {
        case 'completed':
          return (
            <div className="relative">
              <CheckCircle className="w-6 h-6 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full opacity-90" />
            </div>
          )
        case 'failed':
          return (
            <div className="relative">
              <AlertCircle className="w-6 h-6 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full opacity-90" />
            </div>
          )
        default:
          return (
            <div className="relative">
              {/* Main spinner */}
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {/* Outer ripple effect */}
              <div className="absolute inset-0 w-6 h-6 border-2 border-white border-opacity-30 rounded-full animate-ping" />
              {/* Status indicator dot */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full opacity-90" />
            </div>
          )
      }
    }

    return (
      <div className={`fixed bottom-4 right-4 z-[60] ${className}`}>
        <button
          onClick={handleMaximize}
          className={`w-14 h-14 ${getMinimizedStyle(latestNotification.status)} rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center group`}
          title="Click to expand notification"
        >
          {getMinimizedIcon(latestNotification.status)}
        </button>
      </div>
    )
  }

  return (
    <div className={`fixed top-4 right-4 sm:top-20 z-[60] max-w-sm w-full sm:max-w-sm md:max-w-md ${className}`}>
      <div className={`border rounded-lg shadow-lg p-4 transition-all duration-300 ${getStatusColor(latestNotification.status)}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getStatusIcon(latestNotification.status)}
            <h4 className="font-semibold text-gray-800">
              {getStatusMessage(latestNotification.status)}
            </h4>
          </div>
          <div className="flex items-center gap-2">
            {/* Minimize button - always show */}
            <button
              onClick={handleMinimize}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Minimize"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            {/* Close button - only show for completed/failed */}
            {onClose && (latestNotification.status === 'completed' || latestNotification.status === 'failed') && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
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
        {latestNotification.status === 'completed' && latestNotification.data?.downloadUrl && (
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
        {latestNotification.status === 'failed' && latestNotification.data?.error && (
          <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700">
            {latestNotification.data.error}
          </div>
        )}

        {/* Success Message */}
        {latestNotification.status === 'completed' && (
          <div className="mt-2 p-2 bg-green-100 border border-green-200 rounded text-xs text-green-700">
            🎉 Your video is ready! You can now download or view it.
          </div>
        )}
      </div>
    </div>
  )
}
