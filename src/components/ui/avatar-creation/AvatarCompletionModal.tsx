'use client'

import { useEffect, useRef } from 'react'
import { X, SkipBack, SkipForward, Download } from 'lucide-react'

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
  const videoRef = useRef<HTMLVideoElement>(null)

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

  const handleSkipBack = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10)
    }
  }

  const handleSkipForward = () => {
    if (videoRef.current) {
      const newTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 10)
      videoRef.current.currentTime = newTime
    }
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
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-[32px] font-bold text-[#101010]">
              Avatar Created Successfully! 🎉
            </h2>
            <p className="text-[16px] text-[#5F5F5F] mt-2">
              Your digital avatar &quot;{avatarData.avatarName}&quot; is ready
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors duration-200">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-[20px] font-semibold text-[#101010]">Preview Video</h3>
              <div className="relative rounded-[12px] overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  src={avatarData.previewVideoUrl}
                  poster={avatarData.previewImageUrl}
                  className="w-full h-[400px] object-cover"
                  controls
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="flex gap-4 items-center justify-center">
                <button
                  onClick={handleSkipBack}
                  className="flex items-center gap-2 px-4 py-2 bg-[#5046E5] text-white rounded-lg hover:bg-[#4338CA] transition-colors duration-200"
                >
                  <SkipBack className="w-4 h-4" />
                  Back (10s)
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-[#5046E5] text-white rounded-lg hover:bg-[#4338CA] transition-colors duration-200"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={handleSkipForward}
                  className="flex items-center gap-2 px-4 py-2 bg-[#5046E5] text-white rounded-lg hover:bg-[#4338CA] transition-colors duration-200"
                >
                  <SkipForward className="w-4 h-4" />
                  Next (10s)
                </button>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-[20px] font-semibold text-[#101010] mb-4">Avatar Details</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-[#101010] mb-2">Avatar Name</h4>
                    <p className="text-[#5F5F5F]">{avatarData.avatarName}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-[#101010] mb-2">Status</h4>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600 font-medium">Completed Successfully</span>
                    </div>
                  </div>
                </div>
              </div>
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
                </div>
              </div>
            </div>
          </div>
        </div>
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
                window.location.href = '/create-video/new'
              }}
              className="px-6 py-2 bg-[#5046E5] text-white rounded-lg hover:bg-[#4338CA] transition-colors duration-200"
            >
              Create Video
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
