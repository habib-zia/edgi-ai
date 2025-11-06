'use client'

import React from 'react'

interface ErrorStateProps {
  error: string
  onRetry: () => void
  className?: string
}

export default function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={onRetry}
            className="bg-[#5046E5] text-white px-6 py-2 rounded-full hover:bg-[#4338CA] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}

