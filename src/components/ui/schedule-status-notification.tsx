'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, X, AlertCircle, Clock, Calendar } from 'lucide-react'
import { ScheduleStatusUpdate } from '@/hooks/useUnifiedSocket'
import { usePathname } from 'next/navigation'

interface ScheduleStatusNotificationProps {
  updates: ScheduleStatusUpdate[]
  isConnected: boolean
  onClear: () => void
  className?: string
}

export default function ScheduleStatusNotification({ 
  updates, 
  isConnected, 
  onClear,
  className = '' 
}: ScheduleStatusNotificationProps) {
  
  const [isVisible, setIsVisible] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  const pathname = usePathname()

  // Show notification when we have updates
  useEffect(() => {
    if (updates.length > 0) {
      setIsVisible(true)
      const latest = updates[updates.length - 1]
      
      // Auto-close notification based on status
      if (latest.status === 'ready' || latest.status === 'failed') {
        const timeout = latest.status === 'failed' ? 60000 : 30000 // 60s for errors, 30s for success
        const countdown = latest.status === 'failed' ? 60 : 30
        
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
      case 'processing':
        return 'text-blue-600'
      case 'ready':
        return 'text-green-600'
      case 'failed':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-600 animate-spin" />
      case 'ready':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <Calendar className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'processing':
        return 'Generating'
      case 'ready':
        return 'Ready'
      case 'failed':
        return 'Failed'
      default:
        return 'Unknown'
    }
  }

  if (!isVisible || updates.length === 0) {
    return null
  }

  const latestUpdate = updates[updates.length - 1]

  return (
    <div className={`fixed top-24 right-8 z-30 max-w-xs bg-transparent w-full ${className}`}>
      <div className={`backdrop-blur-sm bg-white/60 rounded-lg shadow-lg border-2 p-4 ${latestUpdate.status === 'ready' ? 'border-green-500' : 'border-gray-200'}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-8 space-y-[2px] flex-col">
            <div className="flex items-center space-x-2">
            {getStatusIcon(latestUpdate.status)}
            <h3 className="font-semibold text-gray-900">Video Schedule</h3>
            </div>
            <div className={`text-sm font-medium ml-5 ${getStatusColor(latestUpdate.status)}`}>
              {getStatusText(latestUpdate.status)}
            </div>
          </div>
          {latestUpdate.status === 'ready' && (
            <button
              onClick={() => {
                onClear()
                setIsVisible(false)
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Connection Status */}
        {/* <div className="flex items-center space-x-2 mb-3">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div> */}

        {/* Schedule ID */}
        {/* <div className="text-sm text-gray-600 mb-2">
          Schedule ID: <span className="font-mono text-xs">{latestUpdate.scheduleId}</span>
        </div> */}

        {/* Message */}
        <div className="text-sm text-gray-700 mb-3">
          {latestUpdate.message}
        </div>

        {/* Error Details */}
        {latestUpdate.status === 'failed' && latestUpdate.data?.error && (
          <div className="mt-3 p-2 bg-red-50 rounded text-sm text-red-700">
            {latestUpdate.data.error}
          </div>
        )}

        {/* Generation Time */}
        {latestUpdate.status === 'ready' && latestUpdate.data?.generationTime && (
          <div className="mt-2 text-xs text-gray-500">
            Generated in {latestUpdate.data.generationTime}s
          </div>
        )}

        {latestUpdate.status === 'ready' && pathname !== '/scheduled-post' && (
          <div className="mt-2 text-xs text-gray-500">
            <a href={`/scheduled-post`} className="text-blue-600 hover:text-blue-800 font-medium">
              View Schedule
            </a>
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
