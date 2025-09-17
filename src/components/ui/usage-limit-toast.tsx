'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, X, Crown } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UsageLimitToastProps {
  isVisible: boolean
  message: string
  onClose: () => void
  onUpgrade?: () => void
  autoHide?: boolean
  autoHideDelay?: number
}

export default function UsageLimitToast({
  isVisible,
  message,
  onClose,
  onUpgrade,
  autoHide = true,
  autoHideDelay = 8000
}: UsageLimitToastProps) {
  const router = useRouter()
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (isVisible && autoHide) {
      const timer = setTimeout(() => {
        handleClose()
      }, autoHideDelay)

      return () => clearTimeout(timer)
    }
  }, [isVisible, autoHide, autoHideDelay])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 300)
  }

  const handleUpgrade = () => {
    onUpgrade?.()
    handleClose()
    // Navigate to pricing page
    router.push('/account')
  }

  if (!isVisible) return null

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md transition-all duration-300 ${
      isClosing ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
    }`}>
      <div className="bg-white border border-red-200 rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-red-50 px-4 py-3 border-b border-red-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h3 className="text-red-800 font-semibold text-sm">Video Limit Reached</h3>
            </div>
            <button
              onClick={handleClose}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-3">
          <p className="text-gray-700 text-sm mb-3">{message}</p>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleUpgrade}
              className="flex-1 bg-[#5046E5] text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#4338CA] transition-colors flex items-center justify-center gap-1"
            >
              <Crown className="w-4 h-4" />
              Upgrade Plan
            </button>
            <button
              onClick={handleClose}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-red-100">
          <div 
            className="h-full bg-red-500 transition-all duration-1000 ease-out"
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </div>
  )
}
