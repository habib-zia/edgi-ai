'use client'

import { useState, useEffect } from 'react'
import { CreditCard, ArrowRight, X } from 'lucide-react'

interface SubscriptionRequiredToastProps {
  isVisible: boolean
  message: string
  onClose: () => void
  onSubscribe?: () => void
  context?: 'video' | 'avatar' | 'content'
}

export default function SubscriptionRequiredToast({ 
  isVisible, 
  message, 
  onClose, 
  onSubscribe,
  context = 'content'
}: SubscriptionRequiredToastProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  useEffect(() => {
    if (isVisible) {
      const timeoutId = setTimeout(() => {
        onClose()
      }, 10000)
      
      return () => {
        clearTimeout(timeoutId)
      }
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  const getContextMessage = () => {
    if (context === 'video') {
      return 'Please subscribe to create videos.'
    } else if (context === 'avatar') {
      return 'Please subscribe to create custom avatars.'
    }
    return message
  }

  return (
    <div className={`fixed top-24 right-4 z-20 max-w-xs transition-all duration-300 ${
      isAnimating ? 'animate-in slide-in-from-right-2' : ''
    }`}>
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-5 h-5 text-orange-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-orange-800 font-semibold text-sm">Subscription Required</h3>
            </div>
            <p className="text-orange-700 text-xs mb-3">{getContextMessage()}</p>
            <div className="flex items-center gap-2">
              {onSubscribe && (
                <button
                  onClick={onSubscribe}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors"
                >
                  <ArrowRight className="w-3 h-3" />
                  View Plans
                </button>
              )}
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-xs bg-orange-200 text-orange-800 rounded-md hover:bg-orange-300 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center text-orange-400 hover:text-orange-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
