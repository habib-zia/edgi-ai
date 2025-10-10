'use client'

import { useState, useEffect } from 'react'
import { QrCode, Smartphone, ArrowLeft, Clock } from 'lucide-react'

interface AvatarData {
  name: string
  age: string
  gender: string
  ethnicity: string
  videoFile: File | null
  consentVideoFile: File | null
  photoFiles: File[]
  avatarType: 'digital-twin' | 'photo-avatar' | null
}

interface Step5QRCodeProps {
  onNext: () => void
  onBack: () => void
  avatarData: AvatarData
  setAvatarData: (data: AvatarData) => void
}

export default function Step5QRCode({ onNext, onBack, avatarData, setAvatarData }: Step5QRCodeProps) {
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleCreate = () => {
    // In a real implementation, this would check if the mobile upload is complete
    onNext()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-[24px] font-semibold text-[#282828] mb-2">
          Record via phone
        </h3>
        <p className="text-[16px] text-[#667085]">
          Use your mobile device to record or upload footage
        </p>
      </div>

      {/* QR Code Section */}
      <div className="flex justify-center">
        <div className="text-center">
          {/* QR Code Placeholder */}
          <div className="w-64 h-64 bg-[#EEEEEE] rounded-lg mx-auto mb-4 flex items-center justify-center">
            <QrCode className="w-32 h-32 text-[#98A2B3]" />
          </div>
          
          {/* QR Code Info */}
          <div className="space-y-2">
            <p className="text-[16px] text-[#282828] font-medium">
              Scan QR code to upload or record from your phone
            </p>
            <div className="flex items-center justify-center gap-2 text-[#667085]">
              <Clock className="w-4 h-4" />
              <span className="text-[14px]">
                Expires at {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-[#F9FAFB] rounded-lg p-6">
        <h4 className="text-[18px] font-semibold text-[#282828] mb-3">
          How to use:
        </h4>
        <ol className="list-decimal list-inside space-y-2 text-[14px] text-[#667085]">
          <li>Open your phone&apos;s camera app</li>
          <li>Point it at the QR code above</li>
          <li>Tap the notification that appears</li>
          <li>Record your video or upload existing footage</li>
          <li>Wait for the upload to complete</li>
        </ol>
      </div>

      {/* Mobile Preview */}
      <div className="flex justify-center">
        <div className="text-center">
          <div className="w-32 h-32 bg-[#EEEEEE] rounded-lg mx-auto mb-2 flex items-center justify-center">
            <Smartphone className="w-16 h-16 text-[#98A2B3]" />
          </div>
          <p className="text-[12px] text-[#667085]">Mobile recording</p>
        </div>
      </div>

      {/* Upload Status */}
      {avatarData.videoFile && (
        <div className="bg-[#F0F0FF] border border-[#5046E5] rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Smartphone className="w-6 h-6 text-[#5046E5]" />
            <div className="flex-1">
              <p className="text-[14px] font-medium text-[#282828]">
                {avatarData.videoFile.name}
              </p>
              <p className="text-[12px] text-[#667085]">
                {(avatarData.videoFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#667085] hover:text-[#5046E5] transition-colors duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleCreate}
          className="px-6 py-[11.4px] bg-[#5046E5] text-white rounded-full font-semibold text-[18px] hover:bg-[#4338CA] transition-colors duration-300"
        >
          Create
        </button>
      </div>
    </div>
  )
}
