// 'use client'

// import { useState, useEffect } from 'react'
// import { CheckCircle, X, AlertCircle, Clock } from 'lucide-react'
// import { PhotoAvatarUpdate } from '@/hooks/usePhotoAvatarNotifications'

// interface PhotoAvatarNotificationProps {
//   notifications: PhotoAvatarUpdate[]
//   isConnected: boolean
//   onClose?: () => void
//   className?: string
// }

// export default function PhotoAvatarNotification({ 
//   notifications, 
//   isConnected, 
//   onClose,
//   className = '' 
// }: PhotoAvatarNotificationProps) {
//   const [isVisible, setIsVisible] = useState(false)
//   const [currentStep, setCurrentStep] = useState<string>('')
//   const [progress, setProgress] = useState(0)
//   const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

//   // Show notification when we have updates
//   useEffect(() => {
//     console.log('🔔 PhotoAvatarNotification useEffect triggered:', {
//       notificationsLength: notifications.length,
//       notifications
//     })
//     if (notifications.length > 0) {
//       console.log('🔔 Setting notification visible')
//       setIsVisible(true)
//       const latest = notifications[notifications.length - 1]
//       setCurrentStep(latest.step)
      
//       // Calculate progress based on step
//       const stepProgress = getStepProgress(latest.step)
//       setProgress(stepProgress)
//     }
//   }, [notifications])

//   // Auto-close notification after 1 minute when ready step is complete or there's an error
//   useEffect(() => {
//     if (notifications.length > 0) {
//       const latest = notifications[notifications.length - 1]
//       const shouldShowCloseButton = latest.step === 'ready' || latest.step === 'complete' || latest.status === 'error'
      
//       if (shouldShowCloseButton && onClose) {
//         // Start countdown
//         setTimeRemaining(30)
        
//         const timer = setTimeout(() => {
//           onClose()
//         }, 30000) 
        
//         // Update countdown every second
//         const countdownInterval = setInterval(() => {
//           setTimeRemaining(prev => {
//             if (prev === null || prev <= 1) {
//               clearInterval(countdownInterval)
//               return null
//             }
//             return prev - 1
//           })
//         }, 1000)
        
//         return () => {
//           clearTimeout(timer)
//           clearInterval(countdownInterval)
//         }
//       } else {
//         setTimeRemaining(null)
//       }
//     }
//   }, [notifications, onClose])

//   const getStepProgress = (step: string): number => {
//     const stepMap: Record<string, number> = {
//       'upload': 20,
//       'group-creation': 40,
//       'training': 60,
//       'saving': 80,
//       'complete': 90,
//       'ready': 100
//     }
//     return stepMap[step] || 0
//   }


//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'success':
//         return 'border-green-200/60 bg-green-50/70 backdrop-blur-sm'
//       case 'error':
//         return 'border-red-200/60 bg-red-50/70 backdrop-blur-sm'
//       default:
//         return 'border-blue-200/60 bg-blue-50/70 backdrop-blur-sm'
//     }
//   }

//   const getStepIcon = (step: string, status: string) => {
//     if (status === 'error') {
//       return <AlertCircle className="w-5 h-5 text-red-500" />
//     }
//     if (status === 'success' || step === 'ready' || step === 'complete') {
//       return <CheckCircle className="w-5 h-5 text-green-500" />
//     }
//     return <Clock className="w-5 h-5 text-blue-500" />
//   }

//   const latestNotification = notifications[notifications.length - 1]
  
//   // Find the error notification from the specific step where error occurred
//   const errorNotification = notifications.find(notif => notif.status === 'error')
  
//   console.log('🔔 PhotoAvatarNotification render:', {
//     notificationsCount: notifications.length,
//     latestNotification,
//     errorNotification,
//     isVisible,
//     isConnected
//   })

//   if (!isVisible || !latestNotification) {
//     console.log('🔔 PhotoAvatarNotification not visible or no notification')
//     return null
//   }

//   return (
//     <div className={`fixed top-4 right-4 z-[60] max-w-sm w-full ${className}`}>
//       <div className={`border rounded-lg shadow-lg p-4 transition-all duration-300 ${getStatusColor(latestNotification.status)}`}>
//         {/* Header */}
//         <div className="flex items-center justify-between mb-3">
//           <div className="flex items-start gap-2 flex-col">
//             <div className="flex items-center gap-2">
//               {getStepIcon(latestNotification.step, latestNotification.status)}
//               <h4 className="font-semibold text-gray-800 text-lg">
//                 {latestNotification.status === 'error' 
//                   ? 'Avatar Creation Failed' 
//                   : latestNotification.step === 'complete' || latestNotification.step === 'ready'
//                     ? 'Your Avatar is Ready!'
//                     : 'Creating Your Avatar'
//                 }
//               </h4>
//             </div>
//             {/* Show message only when processing (not error or ready) */}
//             {latestNotification.status !== 'error' && latestNotification.step !== 'ready' && latestNotification.step !== 'complete' && (
//               <p className="text-[10px] text-gray-600 mt-0 mb-2 text-left pl-5">
//                 Your avatar will be ready in 2–3 minutes and appear in the dropdown.
//               </p>
//             )}
//           </div>
//           {/* Show close button only when ready/complete step is done or there's an error */}
//           {(latestNotification.step === 'ready' || latestNotification.step === 'complete' || latestNotification.status === 'error') && onClose && (
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={onClose}
//                 className="text-gray-400 hover:text-gray-600 transition-colors"
//               >
//                 <X className="w-4 h-4" />
//               </button>
//             </div>
//           )}

          
//         </div>

//         {timeRemaining !== null && (
//           <span className="text-xs text-gray-500">
//             Auto-close in {timeRemaining}s
//           </span>
//         )}

//         {/* Progress Bar */}
//         {latestNotification.status === 'progress' && (
//           <div className="mb-3">
//             <div className="flex justify-between text-xs text-gray-600 mb-2">
//               <span>{latestNotification.data?.message || 'Processing...'}</span>
//               <span>{progress}%</span>
//             </div>
//             <div className="w-full bg-gray-200 rounded-full h-2">
//               <div 
//                 className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
//                 style={{ width: `${progress}%` }}
//               />
//             </div>
//           </div>
//         )}

//         {/* Step Indicators */}
//         <div className="flex justify-between mb-3">
//           {['upload', 'group-creation', 'training', 'saving', 'complete', 'ready'].map((step, index) => {
//             const isActive = step === currentStep
//             const isCompleted = getStepProgress(step) <= progress
//             const isError = errorNotification && step === errorNotification.step
            
//             return (
//               <div
//                 key={step}
//                 className={`flex flex-col items-center pl-3 ${index < 4 ? 'flex-1' : ''}`}
//               >
//                 <div
//                   className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
//                     isError
//                       ? 'bg-red-500 text-white'
//                       : isCompleted
//                       ? 'bg-green-500 text-white'
//                       : isActive
//                       ? 'bg-blue-500 text-white'
//                       : 'bg-gray-300 text-gray-600'
//                   }`}
//                 >
//                   {isError ? (
//                     <X className="w-3 h-3" />
//                   ) : isCompleted ? (
//                     <CheckCircle className="w-3 h-3" />
//                   ) : (
//                     index + 1
//                   )}
//                 </div>
//                 <span className="text-xs text-gray-600 mt-1 text-center capitalize">
//                   {step.replace('-', ' ')}
//                 </span>
//                 {index < 4 && (
//                   <div
//                     className={`absolute top-3 left-1/2 w-full h-0.5 -z-10 ${
//                       isCompleted ? 'bg-green-500' : 'bg-gray-300'
//                     }`}
//                     style={{ transform: 'translateX(50%)' }}
//                   />
//                 )}
//               </div>
//             )
//           })}
//         </div>

//         {/* Error Details */}
//         {errorNotification && errorNotification.data?.error && (
//           <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700">
//             <div className="font-semibold mb-1">
//               Error in {errorNotification.step.replace('-', ' ')} step:
//             </div>
//             <div>{errorNotification.data.message}</div>
//           </div>
//         )}

//         {/* Success Message */}
//         {latestNotification.status === 'success' && latestNotification.data?.message && (
//           <div className="mt-2 p-2 bg-green-100 border border-green-200 rounded text-xs text-green-700">
//             🎉 {latestNotification.data.message}
//           </div>
//         )}

//       </div>
//     </div>
//   )
// }



'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, X, AlertCircle, Clock } from 'lucide-react'

// Mock interface for demonstration
interface PhotoAvatarUpdate {
  step: string
  status: 'progress' | 'success' | 'error'
  data?: {
    message?: string
    error?: string
  }
}

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

  const steps = ['upload', 'group-creation', 'training', 'saving', 'complete', 'ready']

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

  // Auto-close notification - different timeouts for success vs error
  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[notifications.length - 1]
      const shouldShowCloseButton = latest.step === 'ready' || latest.step === 'complete' || latest.status === 'error'
      
      if (shouldShowCloseButton && onClose) {
        // Different timeouts: 30s for success, 60s for errors (users need more time to read)
        const timeout = latest.status === 'error' ? 60000 : 30000
        const countdown = latest.status === 'error' ? 60 : 30
        
        setTimeRemaining(countdown)
        
        const timer = setTimeout(() => {
          onClose()
        }, timeout) 
        
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
    const stepIndex = steps.indexOf(step)
    if (stepIndex === -1) return 0
    // Convert to percentage based on step position
    return Math.round(((stepIndex + 1) / steps.length) * 100)
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

  const getStepIcon = (step: string, status: string) => {
    if (status === 'error') {
      return <AlertCircle className="w-5 h-5 text-red-500" />
    }
    if (status === 'success' || step === 'ready' || step === 'complete') {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    }
    return <Clock className="w-5 h-5 text-blue-500" />
  }

  const latestNotification = notifications[notifications.length - 1]
  const errorNotification = notifications.find(notif => notif.status === 'error')
  
  console.log('🔔 PhotoAvatarNotification render:', {
    notificationsCount: notifications.length,
    latestNotification,
    errorNotification,
    isVisible,
    isConnected
  })

  if (!isVisible || !latestNotification) {
    console.log('🔔 PhotoAvatarNotification not visible or no notification')
    return null
  }

  const isProcessing = latestNotification.status === 'progress' && 
    latestNotification.step !== 'ready' && 
    latestNotification.step !== 'complete'
  const isComplete = latestNotification.step === 'ready' || latestNotification.step === 'complete'
  const hasError = latestNotification.status === 'error'

  return (
    <div className={`fixed top-4 right-4 z-[60] max-w-sm w-full ${className}`}>
      <div className={`border rounded-lg shadow-lg p-4 transition-all duration-300 ${getStatusColor(latestNotification.status)}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {getStepIcon(latestNotification.step, latestNotification.status)}
              <h4 className="font-semibold text-gray-800 text-sm">
                {hasError 
                  ? 'Avatar Creation Failed' 
                  : isComplete
                    ? 'Your Avatar is Ready!'
                    : 'Creating Your Avatar'
                }
              </h4>
            </div>
            
            {/* Show processing message */}
            {isProcessing && (
              <p className="text-xs text-gray-600 ml-7">
                Your avatar will be ready in 2–3 minutes and appear in the dropdown.
              </p>
            )}
          </div>
          
          {/* Show close button when appropriate */}
          {(isComplete || hasError) && onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-2 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Progress Bar - show for all progress states */}
        {(isProcessing || latestNotification.status === 'progress') && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 mb-2">
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
        <div className="relative mb-3">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => {
              const stepProgress = getStepProgress(step)
              const isActive = step === currentStep
              const isCompleted = stepProgress <= progress
              const isError = errorNotification && step === errorNotification.step
              
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
        {errorNotification && (
          <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded text-xs text-red-700">
            <div className="font-semibold mb-1">
              Error in {errorNotification.step.replace('-', ' ')} step:
            </div>
            <div>{errorNotification.data?.message || errorNotification.data?.error || 'An unknown error occurred'}</div>
          </div>
        )}

        {/* Success Message */}
        {latestNotification.status === 'success' && isComplete && latestNotification.data?.message && (
          <div className="mt-3 p-3 bg-green-100 border border-green-200 rounded text-xs text-green-700">
            🎉 {latestNotification.data.message}
          </div>
        )}


        
            {/* Show auto-close countdown */}
            {timeRemaining !== null && (
              <span className="text-xs text-gray-500 ml-7">
                Auto-close in {timeRemaining}s
              </span>
            )}
      </div>
    </div>
  )
}
