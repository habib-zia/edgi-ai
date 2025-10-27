'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, X, AlertCircle, Clock, Video } from 'lucide-react'
import { VideoAvatarStatusUpdate } from '@/hooks/useUnifiedSocket'

interface VideoAvatarStatusNotificationProps {
  updates: VideoAvatarStatusUpdate[]
  isConnected: boolean
  onClear: () => void
  className?: string
}

export default function VideoAvatarStatusNotification({ 
  updates, 
  isConnected, 
  onClear,
  className = '' 
}: VideoAvatarStatusNotificationProps) {
  
  const [isVisible, setIsVisible] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  // Show notification when we have updates
  useEffect(() => {
    if (updates.length > 0) {
      setIsVisible(true)
      const latest = updates[updates.length - 1]
      
      // Auto-close notification based on status
      if (latest.status === 'completed' || latest.status === 'error') {
        const timeout = latest.status === 'error' ? 60000 : 30000 // 60s for errors, 30s for success
        const countdown = latest.status === 'error' ? 60 : 30
        
        setTimeRemaining(countdown)
        
        const timer = setTimeout(() => {
          onClear()
          setIsVisible(false)
        }, timeout)
        
        const countdownInterval = setInterval(() => {
          setTimeRemaining(prev => {
            if (prev === null || prev <= 1) {
              clearInterval(countdownInterval)
              return null
            }
            return prev - 1
          })
        }, 1000)
        
        return () => {
          clearTimeout(timer)
          clearInterval(countdownInterval)
        }
      } else {
        setTimeRemaining(null)
      }
    } else {
      // Hide notification when no updates
      setIsVisible(false)
      setTimeRemaining(null)
    }
  }, [updates, onClear])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'progress':
        return 'text-blue-600'
      case 'completed':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'progress':
        return <Clock className="w-5 h-5 text-blue-600 animate-spin" />
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <Video className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'progress':
        return 'Processing'
      case 'completed':
        return 'Completed'
      case 'error':
        return 'Error'
      default:
        return 'Unknown'
    }
  }

  const getStepText = (step: string) => {
    switch (step) {
      case 'upload':
        return 'Uploading video files'
      case 'processing':
        return 'Processing video'
      case 'training':
        return 'Training avatar model'
      case 'generating':
        return 'Generating avatar'
      case 'complete':
        return 'Avatar ready'
      default:
        return step.charAt(0).toUpperCase() + step.slice(1)
    }
  }

  if (!isVisible || updates.length === 0) {
    return null
  }

  const latestUpdate = updates[updates.length - 1]
  const progress = latestUpdate.data?.progress || 0

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm ${className}`}>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {getStatusIcon(latestUpdate.status)}
            <h3 className="font-semibold text-gray-900">Video Avatar</h3>
            <div className={`text-sm font-medium ${getStatusColor(latestUpdate.status)}`}>
              {getStatusText(latestUpdate.status)}
            </div>
          </div>
          <button
            onClick={() => {
              onClear()
              setIsVisible(false)
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Connection Status */}
        <div className="flex items-center space-x-2 mb-3">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">{getStepText(latestUpdate.step)}</span>
            {progress > 0 && (
              <span className="text-gray-500">{progress}%</span>
            )}
          </div>
        </div>

        {/* Message */}
        {latestUpdate.data?.message && (
          <div className="mt-3 text-sm text-gray-600">
            {latestUpdate.data.message}
          </div>
        )}

        {/* Error Details */}
        {latestUpdate.status === 'error' && latestUpdate.data?.error && (
          <div className="mt-3 p-2 bg-red-50 rounded text-sm text-red-700">
            {latestUpdate.data.error}
          </div>
        )}

        {/* Countdown Timer */}
        {timeRemaining !== null && (
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>Auto-dismiss in {timeRemaining}s</span>
            <button
              onClick={() => {
                onClear()
                setIsVisible(false)
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Dismiss now
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
