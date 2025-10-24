'use client'

import React, { useState, useEffect, useRef } from 'react'

interface FormLoadingOverlayProps {
  avatarsLoading: boolean
  autoFilling: boolean
  isFormReady: boolean
  hasUserEmail: boolean
}

export default function FormLoadingOverlay({
  avatarsLoading,
  autoFilling,
  isFormReady,
  hasUserEmail
}: FormLoadingOverlayProps) {
  const [showOverlay, setShowOverlay] = useState(false)
  const [isApiComplete, setIsApiComplete] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const delayTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const isNowLoading = avatarsLoading || autoFilling || !isFormReady
    
    if (!isNowLoading && showOverlay && !isApiComplete) {
      console.log('✅ FormLoadingOverlay: API complete, starting 4-second delay')
      setIsApiComplete(true)
      
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current)
      }
      
      delayTimeoutRef.current = setTimeout(() => {
        console.log('🚪 FormLoadingOverlay: Hiding overlay after delay')
        setShowOverlay(false)
        setIsApiComplete(false)
      }, 2000)
    }
  }, [avatarsLoading, autoFilling, isFormReady, showOverlay, isApiComplete])

  useEffect(() => {
    if (showOverlay && !isApiComplete) {
      const fallbackTimeout = setTimeout(() => {
        console.log('⚠️ FormLoadingOverlay: Fallback timeout triggered - hiding overlay')
        setShowOverlay(false)
        setIsApiComplete(false)
      }, 15000)

      return () => clearTimeout(fallbackTimeout)
    }
  }, [showOverlay, isApiComplete])

  useEffect(() => {
    const isDataLoading = avatarsLoading || autoFilling || !isFormReady
    
    if (isDataLoading && !showOverlay) {
      console.log('🔄 FormLoadingOverlay: Showing overlay - avatarsLoading:', avatarsLoading, 'autoFilling:', autoFilling, 'isFormReady:', isFormReady)
      setShowOverlay(true)
      setIsApiComplete(false)
    }
  }, [avatarsLoading, autoFilling, isFormReady, showOverlay])

  useEffect(() => {
    console.log('🔍 FormLoadingOverlay state:', {
      avatarsLoading,
      autoFilling,
      isFormReady,
      showOverlay,
      isApiComplete
    })
  }, [avatarsLoading, autoFilling, isFormReady, showOverlay, isApiComplete])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current)
        delayTimeoutRef.current = null
      }
    }
  }, [])

  if (!showOverlay) return null

  return (
    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-30 flex items-center justify-center">
      <div className="bg-white rounded-xl p-8 shadow-2xl max-w-md w-full mx-4">
        <div className="text-center">
          {/* Main spinner */}
          <div className="flex justify-center mb-6">
            <svg className="animate-spin h-12 w-12 text-[#5046E5]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          
          {/* Loading title */}
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            {isApiComplete ? 'Form Ready!' : (autoFilling ? 'Loading Your Settings' : 'Preparing Form')}
          </h3>
          
          {/* Progress indicators */}
          <div className="space-y-3 text-left">
            <div className={`flex items-center gap-3 ${(!avatarsLoading || isApiComplete) ? 'text-green-600' : 'text-gray-500'}`}>
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${(!avatarsLoading || isApiComplete) ? 'bg-green-100' : 'bg-gray-200'}`}>
                {(!avatarsLoading || isApiComplete) ? (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                )}
              </div>
              <span className="text-sm font-medium">
                {avatarsLoading && !isApiComplete ? 'Loading avatars...' : 'Avatars loaded'}
              </span>
            </div>
            
            {hasUserEmail && (
              <div className={`flex items-center gap-3 ${(!autoFilling && isFormReady) || isApiComplete ? 'text-green-600' : 'text-gray-500'}`}>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${(!autoFilling && isFormReady) || isApiComplete ? 'bg-green-100' : 'bg-gray-200'}`}>
                  {(!autoFilling && isFormReady) || isApiComplete ? (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  )}
                </div>
                <span className="text-sm font-medium">
                  {isApiComplete ? 'Settings loaded' : (autoFilling ? 'Loading your settings...' : isFormReady ? 'Settings loaded' : 'Preparing settings...')}
                </span>
              </div>
            )}
          </div>
          
          {/* Loading message */}
          <div className="mt-6 text-sm text-gray-600">
            {isApiComplete ? 'Everything is ready! You can now start creating your video.' : (autoFilling ? '' : 'Please wait while we prepare everything for you')}
          </div>
        </div>
      </div>
    </div>
  )
}
