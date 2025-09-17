'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, X } from 'lucide-react'
import { PhotoAvatarUpdate } from '@/hooks/usePhotoAvatarNotifications'

interface PhotoAvatarNotificationProps {
  notifications: PhotoAvatarUpdate[]
  isConnected: boolean
  onClose?: () => void
  className?: string
}

export default function PhotoAvatarNotification({ 
  notifications, 
  isConnected, 
  onClose,
  className = '' 
}: PhotoAvatarNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState<string>('')
  const [progress, setProgress] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  // Show notification when we have updates
  useEffect(() => {
    console.log('🔔 PhotoAvatarNotification useEffect triggered:', {
      notificationsLength: notifications.length,
      notifications
    })
    if (notifications.length > 0) {
      console.log('🔔 Setting notification visible')
      setIsVisible(true)
      const latest = notifications[notifications.length - 1]
      setCurrentStep(latest.step)
      
      // Calculate progress based on step
      const stepProgress = getStepProgress(latest.step)
      setProgress(stepProgress)
    }
  }, [notifications])

  // Auto-close notification after 1 minute when ready step is complete or there's an error
  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[notifications.length - 1]
      const shouldShowCloseButton = latest.step === 'ready' || latest.status === 'error'
      
      if (shouldShowCloseButton && onClose) {
        // Start countdown
        setTimeRemaining(60)
        
        const timer = setTimeout(() => {
          onClose()
        }, 30000) // 3 seconds = 30000ms
        
        // Update countdown every second
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
  }, [notifications, onClose])

  const getStepProgress = (step: string): number => {
    const stepMap: Record<string, number> = {
      'upload': 20,
      'group-creation': 40,
      'training': 60,
      'saving': 80,
      'complete': 90,
      'ready': 100
    }
    return stepMap[step] || 0
  }


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-200/60 bg-green-50/70 backdrop-blur-sm'
      case 'error':
        return 'border-red-200/60 bg-red-50/70 backdrop-blur-sm'
      default:
        return 'border-blue-200/60 bg-blue-50/70 backdrop-blur-sm'
    }
  }

  const latestNotification = notifications[notifications.length - 1]
  
  console.log('🔔 PhotoAvatarNotification render:', {
    notificationsCount: notifications.length,
    latestNotification,
    isVisible,
    isConnected
  })

  if (!isVisible || !latestNotification) {
    console.log('🔔 PhotoAvatarNotification not visible or no notification')
    return null
  }

  return (
    <div className={`fixed top-4 right-4 z-[60] max-w-sm w-full ${className}`}>
      <div className={`border rounded-lg shadow-lg p-4 transition-all duration-300 ${getStatusColor(latestNotification.status)}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          {/* <div className="flex items-center gap-2">
            {getStepIcon(latestNotification.step, latestNotification.status)}
            <h4 className="font-semibold text-gray-800">
              {latestNotification.status === 'error' ? 'Avatar Creation Failed' : (latestNotification.data?.message || 'Creating Avatar')}
            </h4>
          </div> */}
          {/* Show close button only when ready step is complete or there's an error */}
          {(latestNotification.step === 'ready' || latestNotification.status === 'error') && onClose && (
            <div className="flex items-center gap-2">
          
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          
        </div>

        {timeRemaining !== null && (
          <span className="text-xs text-gray-500">
            Auto-close in {timeRemaining}s
          </span>
        )}

        {/* Progress Bar */}
        {latestNotification.status === 'progress' && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>{latestNotification.data?.message || 'Processing...'}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Step Indicators */}
        <div className="flex justify-between mb-3">
          {['upload', 'group-creation', 'training', 'saving', 'complete', 'ready'].map((step, index) => {
            const isActive = step === currentStep
            const isCompleted = getStepProgress(step) <= progress
            const isError = latestNotification.status === 'error' && step === currentStep
            
            return (
              <div
                key={step}
                className={`flex flex-col items-center pl-3 ${index < 4 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    isError
                      ? 'bg-red-500 text-white'
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : isActive
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {isError ? (
                    <X className="w-3 h-3" />
                  ) : isCompleted ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-xs text-gray-600 mt-1 text-center capitalize">
                  {step.replace('-', ' ')}
                </span>
                {index < 4 && (
                  <div
                    className={`absolute top-3 left-1/2 w-full h-0.5 -z-10 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    style={{ transform: 'translateX(50%)' }}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Message */}
        <div className="text-sm text-gray-700">
          {latestNotification.data?.message || 'Processing...'}
        </div>

        {/* Error Details */}
        {latestNotification.status === 'error' && latestNotification.data?.error && (
          <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700">
            {latestNotification.data.error}
          </div>
        )}

        {/* Success Message */}
        {latestNotification.status === 'success' && latestNotification.data?.message && (
          <div className="mt-2 p-2 bg-green-100 border border-green-200 rounded text-xs text-green-700">
            🎉 {latestNotification.data.message}
          </div>
        )}
        {/* if notification will error the hide this notification */}
        {latestNotification.status !== 'error' && (
          <p className="text-xs text-gray-600 mt-2">
            Your avatar will be ready in 2–3 minutes and appear in the dropdown.
          </p>
        )}
      </div>
    </div>
  )
}
