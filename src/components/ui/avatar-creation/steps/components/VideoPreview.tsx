'use client'

import { X } from "lucide-react"

interface VideoPreviewProps {
  videoPreview: string | null
  videoFile: File | null
  videoDuration: number | null
  isVideoMetadataLoading: boolean
  onClear: () => void
  onReRecord: () => void
  videoRef: React.RefObject<HTMLVideoElement | null>
  onLoadStart: () => void
  onLoadedMetadata: (duration: number) => void
  onError: () => void
}

export default function VideoPreview({
  videoPreview,
  videoFile,
  videoDuration,
  isVideoMetadataLoading,
  onClear,
  onReRecord,
  videoRef,
  onLoadStart,
  onLoadedMetadata,
  onError
}: VideoPreviewProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Video Preview */}
      {videoPreview && (
        <div className="relative rounded-lg overflow-hidden bg-black">
          <video
            ref={videoRef}
            src={videoPreview}
            controls
            preload="metadata"
            className="w-full max-h-[300px] object-contain"
            onLoadStart={onLoadStart}
            onLoadedMetadata={() => {
              if (videoRef.current) {
                const duration = videoRef.current.duration
                onLoadedMetadata(duration)
              }
            }}
            onError={onError}
          />
          {isVideoMetadataLoading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-sm">Loading video metadata...</div>
            </div>
          )}
        </div>
      )}

      {/* File Info */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[16px] font-medium text-[#101010]">
              {videoFile?.name || 'Consent Video'}
            </p>
          </div>
          {videoFile && (
            <div className="space-y-1">
              <p className="text-[14px] text-[#5F5F5F]">
                Size: {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              {videoDuration && (
                <p className="text-[14px] text-[#5F5F5F]">
                  Duration: {formatTime(Math.floor(videoDuration))}
                </p>
              )}
            </div>
          )}
        </div>

        <button
          onClick={onClear}
          className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors duration-300"
          title="Clear selection"
          aria-label="Remove video"
        >
          <X className="w-5 h-5 text-[#5F5F5F]" />
        </button>
      </div>

      {/* Re-record Button */}
      <button 
        onClick={onReRecord}
        className="text-[#6366F1] font-normal transition-colors duration-300 hover:text-[#5046E5] text-[14px] text-left"
      >
        Record a new consent video
      </button>
    </div>
  )
}