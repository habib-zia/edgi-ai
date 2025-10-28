'use client'

import { useState, useEffect } from 'react'
import { X, Play, Pause, Volume2, VolumeX, Download } from 'lucide-react'

interface AvatarCompletionData {
  avatarId: string
  avatarName: string
  previewImageUrl: string
  previewVideoUrl: string
  message: string
}

interface AvatarCompletionModalProps {
  isOpen: boolean
  onClose: () => void
  avatarData: AvatarCompletionData | null
}

export default function AvatarCompletionModal({ isOpen, onClose, avatarData }: AvatarCompletionModalProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isVideoMuted, setIsVideoMuted] = useState(true)
  const [videoProgress, setVideoProgress] = useState(0)
  const [videoDuration, setVideoDuration] = useState(0)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleVideoPlay = () => {
    const video = document.getElementById('avatar-preview-video') as HTMLVideoElement
    if (video) {
      if (isVideoPlaying) {
        video.pause()
      } else {
        video.play()
      }
      setIsVideoPlaying(!isVideoPlaying)
    }
  }

  const handleVideoMute = () => {
    const video = document.getElementById('avatar-preview-video') as HTMLVideoElement
    if (video) {
      video.muted = !isVideoMuted
      setIsVideoMuted(!isVideoMuted)
    }
  }

  const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget
    setVideoProgress((video.currentTime / video.duration) * 100)
  }

  const handleVideoLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget
    setVideoDuration(video.duration)
  }

  const handleVideoPlayStateChange = (isPlaying: boolean) => {
    setIsVideoPlaying(isPlaying)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleDownload = () => {
    if (avatarData?.previewVideoUrl) {
      const link = document.createElement('a')
      link.href = avatarData.previewVideoUrl
      link.download = `${avatarData.avatarName}_avatar_preview.mp4`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }


  if (!isOpen || !avatarData) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[12px] max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-[32px] font-bold text-[#101010]">
              Avatar Created Successfully! 🎉
            </h2>
            <p className="text-[16px] text-[#5F5F5F] mt-2">
              Your digital avatar &quot;{avatarData.avatarName}&quot; is ready
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Video Preview */}
            <div className="space-y-4">
              <h3 className="text-[20px] font-semibold text-[#101010]">Preview Video</h3>
              <div className="relative rounded-[12px] overflow-hidden bg-black">
                <video
                  id="avatar-preview-video"
                  src={avatarData.previewVideoUrl}
                  poster={avatarData.previewImageUrl}
                  className="w-full h-[400px] object-cover"
                  muted={isVideoMuted}
                  onTimeUpdate={handleVideoTimeUpdate}
                  onLoadedMetadata={handleVideoLoadedMetadata}
                  onPlay={() => handleVideoPlayStateChange(true)}
                  onPause={() => handleVideoPlayStateChange(false)}
                >
                  Your browser does not support the video tag.
                </video>

                {/* Video Controls Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <button
                    onClick={handleVideoPlay}
                    className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-all duration-200"
                  >
                    {isVideoPlaying ? (
                      <Pause className="w-8 h-8 text-white" />
                    ) : (
                      <Play className="w-8 h-8 text-white ml-1" />
                    )}
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-30">
                  <div
                    className="h-full bg-[#5046E5] transition-all duration-300"
                    style={{ width: `${videoProgress}%` }}
                  />
                </div>

                {/* Duration Display */}
                <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white text-sm px-3 py-1 rounded">
                  {videoDuration > 0 ? formatDuration(videoDuration) : 'Loading...'}
                </div>

                {/* Mute Button */}
                <button
                  onClick={handleVideoMute}
                  className="absolute top-4 left-4 bg-black bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-90 transition-all duration-200"
                >
                  {isVideoMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-[#5046E5] text-white rounded-lg hover:bg-[#4338CA] transition-colors duration-200"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>

            {/* Avatar Details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-[20px] font-semibold text-[#101010] mb-4">Avatar Details</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-[#101010] mb-2">Avatar Name</h4>
                    <p className="text-[#5F5F5F]">{avatarData.avatarName}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-[#101010] mb-2">Avatar ID</h4>
                    <p className="text-[#5F5F5F] font-mono text-sm">{avatarData.avatarId}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-[#101010] mb-2">Status</h4>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600 font-medium">Completed Successfully</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-[#101010] mb-2">Message</h4>
                    <p className="text-[#5F5F5F]">{avatarData.message}</p>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div>
                <h3 className="text-[20px] font-semibold text-[#101010] mb-4">What&apos;s Next?</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#5046E5] rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                    <div>
                      <p className="font-medium text-[#101010]">Use Your Avatar</p>
                      <p className="text-[#5F5F5F] text-sm">Create videos with your digital twin</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#5046E5] rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                    <div>
                      <p className="font-medium text-[#101010]">Customize Settings</p>
                      <p className="text-[#5F5F5F] text-sm">Adjust voice and appearance settings</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#5046E5] rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                    <div>
                      <p className="font-medium text-[#101010]">Share & Collaborate</p>
                      <p className="text-[#5F5F5F] text-sm">Share your avatar with your team</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              Close
            </button>
            <button
              onClick={() => {
                // Navigate to avatar management or creation page
                window.location.href = '/create-video'
              }}
              className="px-6 py-2 bg-[#5046E5] text-white rounded-lg hover:bg-[#4338CA] transition-colors duration-200"
            >
              Create Another Avatar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
