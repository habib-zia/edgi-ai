'use client'

import React from 'react'

export default function ProcessingVideoCard() {
  return (
    <div className="w-full h-[200px] bg-gradient-to-br from-slate-50 to-gray-100 rounded-[6px] relative overflow-hidden border border-gray-200/50">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-purple-500/5 to-transparent"></div>
      </div>

      {/* Main Content Container */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
        {/* Processing Text with Typing Animation */}
        <div className="text-center mb-4">
          <div>
            <div className="text-sm font-semibold text-gray-700 mb-2">
              <span className="inline-block animate-pulse">Processing</span>
              <span className="inline-block animate-bounce ml-1">.</span>
              <span className="inline-block animate-bounce ml-0.5" style={{ animationDelay: '0.1s' }}>.</span>
              <span className="inline-block animate-bounce ml-0.5" style={{ animationDelay: '0.2s' }}>.</span>
            </div>
            <div className="text-xs text-gray-500">
              It usually takes 10–15 minutes to generate a video.
            </div>
          </div>
        </div>

        {/* Spinner */}
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5046E5]"></div>
        </div>
      </div>
    </div>
  )
}

