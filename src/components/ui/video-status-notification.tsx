'use client'

import { Clock } from 'lucide-react'
import { VideoInProgress } from '@/hooks/useUnifiedSocket'

interface VideoStatusNotificationProps {
  videosInProgress: VideoInProgress[]
  className?: string
}

export default function VideoStatusNotification({ 
  videosInProgress,
  className = '' 
}: VideoStatusNotificationProps) {

  // Don't render if no videos in progress
  if (videosInProgress.length === 0) {
    return null
  }

  return (
    <div className={`fixed top-24 right-4 z-10 max-w-xs w-full ${className}`}>
      <div className="flex flex-col gap-3">
        {videosInProgress.map((video) => {
          return (
            <div
              key={video.id}
              className="border rounded-lg shadow-lg p-4 transition-all duration-300 border-blue-200/60 bg-blue-50/70 backdrop-blur-sm"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <h4 className="font-semibold text-gray-800 text-sm">
                      Processing Video
                    </h4>
                  </div>
                  
                  <p className="text-xs text-gray-600 ml-7 font-medium">
                    {video.title}
                  </p>
                  <p className="text-xs text-gray-500 ml-7 mt-1">
                    {video.message}
                  </p>
                </div>
              </div>

              {/* Processing indicator */}
              <div className="mb-2">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="text-xs text-gray-600">Processing your video...</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
