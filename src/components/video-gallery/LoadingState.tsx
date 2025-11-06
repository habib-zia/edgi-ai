'use client'

import React from 'react'

interface LoadingStateProps {
  className?: string
}

export default function LoadingState({ className }: LoadingStateProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5046E5] mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Loading your videos...</p>
        </div>
      </div>
    </div>
  )
}

