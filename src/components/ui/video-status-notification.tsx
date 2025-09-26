'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, X, AlertCircle, Clock, Download } from 'lucide-react'
import { VideoStatusUpdate } from '@/hooks/useUnifiedSocket'

interface VideoStatusNotificationProps {
  updates: VideoStatusUpdate[]
  isConnected: boolean
  onClear: () => void
  className?: string
}

export default function VideoStatusNotification({ 
  updates, 
  isConnected, 
  onClear,
  className = '' 
}: VideoStatusNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  // Show notification when we have updates
  useEffect(() => {
    if (updates.length > 0) {
      setIsVisible(true)
      const latest = updates[updates.length - 1]
      
      // Auto-close notification based on status
      if (latest.status === 'completed' || latest.status === 'failed') {
        const timeout = latest.status === 'failed' ? 60000 : 30000 // 60s for errors, 30s for success
        const countdown = latest.status === 'failed' ? 60 : 30
        
        setTimeRemaining(countdown)
        
        const timer = setTimeout(() => {
          onClear()
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
    }
  }, [updates, onClear])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-200/60 bg-green-50/70 backdrop-blur-sm'
      case 'failed':
        return 'border-red-200/60 bg-red-50/70 backdrop-blur-sm'
      case 'processing':
        return 'border-blue-200/60 bg-blue-50/70 backdrop-blur-sm'
      default:
        return 'border-yellow-200/60 bg-yellow-50/70 backdrop-blur-sm'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-500" />
      default:
        return <Download className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusTitle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Video Ready!'
      case 'failed':
        return 'Video Processing Failed'
      case 'processing':
        return 'Processing Video'
      default:
        return 'Video Status Update'
    }
  }

  const latestUpdate = updates[updates.length - 1]
  
  if (!isVisible || !latestUpdate) {
    return null
  }

  const isCompleted = latestUpdate.status === 'completed'
  const hasError = latestUpdate.status === 'failed'
  const isProcessing = latestUpdate.status === 'processing' || latestUpdate.status === 'pending'

  return (
    <div className={`fixed top-24 right-4 z-10 max-w-xs w-full ${className}`}>
      <div className={`border rounded-lg shadow-lg p-4 transition-all duration-300 ${getStatusColor(latestUpdate.status)}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {getStatusIcon(latestUpdate.status)}
              <h4 className="font-semibold text-gray-800 text-sm">
                {getStatusTitle(latestUpdate.status)}
              </h4>
            </div>
            
            <p className="text-xs text-gray-600 ml-7">
              {latestUpdate.message}
            </p>
          </div>
          
          {/* Close button for completed/failed status */}
          {(isCompleted || hasError) && (
            <button
              onClick={onClear}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-2 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Processing indicator */}
        {isProcessing && (
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-xs text-gray-600">Processing your video...</span>
            </div>
          </div>
        )}

        {/* Download link for completed videos */}
        {isCompleted && latestUpdate.downloadUrl && (
          <div className="mt-3 p-3 bg-green-100 border border-green-200 rounded text-xs">
            <a
              href={latestUpdate.downloadUrl}
              download
              className="text-green-700 hover:text-green-800 font-medium flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              Download Video
            </a>
          </div>
        )}

        {/* Error details */}
        {hasError && (
          <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded text-xs text-red-700">
            <div className="font-semibold mb-1">Processing failed:</div>
            <div>{latestUpdate.message}</div>
          </div>
        )}

        {/* Auto-close countdown */}
        {timeRemaining !== null && (
          <span className="text-xs text-gray-500 ml-7">
            Auto-close in {timeRemaining}s
          </span>
        )}
      </div>
    </div>
  )
}
