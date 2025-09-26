'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { CheckCircle, X, AlertCircle, Clock } from 'lucide-react'
import { AvatarStatusUpdate } from '@/hooks/useUnifiedSocket'

interface AvatarStatusNotificationProps {
  updates: AvatarStatusUpdate[]
  isConnected: boolean
  onClear: () => void
  className?: string
}

export default function AvatarStatusNotification({ 
  updates, 
  isConnected, 
  onClear,
  className = '' 
}: AvatarStatusNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState<string>('')
  const [progress, setProgress] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  const steps = useMemo(() => ['upload', 'group-creation', 'training', 'saving', 'complete', 'ready'], [])

  const getStepProgress = useCallback((step: string): number => {
    const stepIndex = steps.indexOf(step)
    if (stepIndex === -1) return 0
    return Math.round(((stepIndex + 1) / steps.length) * 100)
  }, [steps])

  // Show notification when we have updates
  useEffect(() => {
    if (updates.length > 0) {
      setIsVisible(true)
      const latest = updates[updates.length - 1]
      setCurrentStep(latest.step)
      
      const stepProgress = getStepProgress(latest.step)
      setProgress(stepProgress)
    }
  }, [updates, getStepProgress])

  // Auto-close notification
  useEffect(() => {
    if (updates.length > 0) {
      const latest = updates[updates.length - 1]
      const shouldShowCloseButton = latest.step === 'ready' || latest.status === 'error'
      
      if (shouldShowCloseButton) {
        const timeout = latest.status === 'error' ? 60000 : 30000
        const countdown = latest.status === 'error' ? 60 : 30
        
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
      case 'success':
        return 'border-green-200/60 bg-green-50/70 backdrop-blur-sm'
      case 'error':
        return 'border-red-200/60 bg-red-50/70 backdrop-blur-sm'
      default:
        return 'border-blue-200/60 bg-blue-50/70 backdrop-blur-sm'
    }
  }

  const getStepIcon = (step: string, status: string) => {
    if (status === 'error') {
      return <AlertCircle className="w-5 h-5 text-red-500" />
    }
    if (status === 'success' || step === 'ready' || step === 'complete') {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    }
    return <Clock className="w-5 h-5 text-blue-500" />
  }

  const latestUpdate = updates[updates.length - 1]
  const errorUpdate = updates.find(update => update.status === 'error')
  
  if (!isVisible || !latestUpdate) {
    return null
  }

  const isProcessing = latestUpdate.status === 'progress' && latestUpdate.step !== 'ready'
  const isComplete = latestUpdate.step === 'ready'
  const hasError = latestUpdate.status === 'error'

  return (
    <div className={`fixed top-24 left-4 z-10 max-w-sm w-full ${className}`}>
      <div className={`border rounded-lg shadow-lg p-4 transition-all duration-300 ${getStatusColor(latestUpdate.status)}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {getStepIcon(latestUpdate.step, latestUpdate.status)}
              <h4 className="font-semibold text-gray-800 text-sm">
                {hasError 
                  ? 'Avatar Creation Failed' 
                  : isComplete
                    ? 'Your Avatar is Ready!'
                    : 'Creating Your Avatar'
                }
              </h4>
            </div>
            
            {errorUpdate ? (
              <p className="text-xs text-gray-600 ml-7">
                {errorUpdate.data?.message || errorUpdate.data?.error || 'An unknown error occurred'}
              </p>
            ) : (
              <p className="text-xs text-gray-600 ml-7">
                Your avatar will be ready in 2–3 minutes and appear in the dropdown.
              </p>
            )}
          </div>
          
          {(latestUpdate.step === 'ready' || hasError) && (
            <button
              onClick={onClear}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-2 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Progress Bar - show only when processing */}
        {isProcessing && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span>{latestUpdate.data?.message || 'Processing...'}</span>
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
        <div className="relative mb-3">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => {
              const stepProgress = getStepProgress(step)
              const isActive = step === currentStep
              const isCompleted = stepProgress <= progress
              const isError = errorUpdate && step === errorUpdate.step
              
              return (
                <div key={step} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
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
                  <span className="text-[10px] text-gray-600 mt-1 text-center capitalize max-w-12">
                    {step.replace('-', ' ')}
                  </span>
                </div>
              )
            })}
          </div>
          
          {/* Connecting line */}
          <div className="absolute top-3 left-3 right-3 h-0.5 bg-gray-300 -z-0">
            <div 
              className="h-full bg-green-500 transition-all duration-500 ease-out"
              style={{ width: `${Math.max(0, (progress / 100) * 100 - 5)}%` }}
            />
          </div>
        </div>

        {/* Error Details */}
        {errorUpdate && (
          <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded text-xs text-red-700">
            <div className="font-semibold mb-1">
              Error in {errorUpdate.step.replace('-', ' ')} step:
            </div>
            <div>{errorUpdate.data?.message || errorUpdate.data?.error || 'An unknown error occurred'}</div>
          </div>
        )}

        {/* Success Message */}
        {latestUpdate.status === 'success' && isComplete && latestUpdate.data?.message && (
          <div className="mt-3 p-3 bg-green-100 border border-green-200 rounded text-xs text-green-700">
            🎉 {latestUpdate.data.message}
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
