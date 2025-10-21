'use client'

import React from 'react'

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
  const isDataLoading = avatarsLoading || autoFilling || !isFormReady

  if (!isDataLoading) return null

  return (
    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
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
            {autoFilling ? 'Loading Your Settings' : 'Preparing Form'}
          </h3>
          
          {/* Progress indicators */}
          <div className="space-y-3 text-left">
            <div className={`flex items-center gap-3 ${!avatarsLoading ? 'text-green-600' : 'text-gray-500'}`}>
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${!avatarsLoading ? 'bg-green-100' : 'bg-gray-200'}`}>
                {!avatarsLoading ? (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                )}
              </div>
              <span className="text-sm font-medium">
                {avatarsLoading ? 'Loading avatars...' : 'Avatars loaded'}
              </span>
            </div>
            
            {hasUserEmail && (
              <div className={`flex items-center gap-3 ${!autoFilling && isFormReady ? 'text-green-600' : 'text-gray-500'}`}>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${!autoFilling && isFormReady ? 'bg-green-100' : 'bg-gray-200'}`}>
                  {!autoFilling && isFormReady ? (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  )}
                </div>
                <span className="text-sm font-medium">
                  {autoFilling ? 'Loading your settings...' : isFormReady ? 'Settings loaded' : 'Preparing settings...'}
                </span>
              </div>
            )}
          </div>
          
          {/* Loading message */}
          <div className="mt-6 text-sm text-gray-600">
            {autoFilling ? '' : 'Please wait while we prepare everything for you'}
          </div>
        </div>
      </div>
    </div>
  )
}
