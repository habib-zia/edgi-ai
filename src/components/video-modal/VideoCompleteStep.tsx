'use client'

import React from 'react'
import Image from 'next/image'

interface VideoCompleteStepProps {
  videoData?: { title: string; youtubeUrl: string; thumbnail: string } | null
  isDownloading: boolean
  onDownload: () => void
}

export default function VideoCompleteStep({
  videoData,
  isDownloading,
  onDownload
}: VideoCompleteStepProps) {
  return (
    <div className="space-y-6">
      {videoData ? (
        <>
          {/* Video Preview */}
          <div className="relative mt-7 h-[420px] w-full aspect-video bg-gray-100 rounded-[8px] overflow-hidden">
            <video
              src={videoData?.youtubeUrl || ''}
              title={videoData?.title || 'Video'}
              className="w-full h-full rounded-[8px] object-contain cursor-pointer"
              controls
              preload="metadata"
              poster={videoData.thumbnail}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </>
      ) : (
        <>
          {/* Video Preview */}
          <div className="relative mt-7 h-[420px] w-full aspect-video bg-gray-100 rounded-[8px] overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <Image src="/images/modal-image.png" alt="Video Preview" width={1000} height={1000} className='w-full h-full object-cover' />
            </div>
          </div>
        </>
      )}

      <button
        onClick={onDownload}
        disabled={isDownloading}
        className={`w-full bg-[#5046E5] text-white py-[11.4px] px-6 rounded-full font-semibold text-[20px] border-2 border-[#5046E5] transition-colors duration-300 flex items-center justify-center gap-2 ${
          isDownloading
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-transparent hover:text-[#5046E5] cursor-pointer'
        }`}
      >
        {isDownloading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Downloading...
          </>
        ) : (
          'Download'
        )}
      </button>
    </div>
  )
}

