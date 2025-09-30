'use client'

import { useState, useEffect } from 'react'
import { Clock, RefreshCw } from 'lucide-react'

interface PendingPaymentToastProps {
  isVisible: boolean
  message: string
  onClose: () => void
  onRefresh?: () => void
  context?: 'video' | 'avatar' | 'content'
}

export default function PendingPaymentToast({ 
  isVisible, 
  message, 
  onClose, 
  onRefresh,
  context = 'content'
}: PendingPaymentToastProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className={`fixed top-24 right-4 z-20 max-w-sm transition-all duration-300 ${
      isAnimating ? 'animate-in slide-in-from-right-2' : ''
    }`}>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-blue-800 font-semibold text-sm">Payment Processing</h3>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
            <p className="text-blue-700 text-sm mb-3">
              {context === 'video' 
                ? 'Your payment is still being processed. Please wait for payment confirmation before creating videos.'
                : context === 'avatar'
                ? 'Your payment is still being processed. Please wait for payment confirmation before creating custom avatars.'
                : message
              }
            </p>
            <div className="flex items-center gap-2">
              {/* {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Refresh Status
                </button>
              )} */}
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-xs bg-blue-200 text-blue-800 rounded-md hover:bg-blue-300 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center text-blue-400 hover:text-blue-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
