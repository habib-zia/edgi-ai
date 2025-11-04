'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { AvatarType } from '../AvatarCreationModal'

interface Step2ChooseTypeProps {
  onAvatarTypeSelect: (type: AvatarType) => void
  onAvatarTypeNext: () => void
  selectedType: AvatarType | null
}

export default function Step2ChooseType({ onAvatarTypeSelect, onAvatarTypeNext, selectedType }: Step2ChooseTypeProps) {
  const [localSelectedType, setLocalSelectedType] = useState<AvatarType | null>(selectedType)

  // Update local state when prop changes (for navigation back)
  useEffect(() => {
    setLocalSelectedType(selectedType)
  }, [selectedType])

  const avatarTypes = [
    {
      type: 'digital-twin' as AvatarType,
      title: 'Digital Twin',
      subtitle: 'Video-based avatar',
      description: 'Use 2 videos to create a video avatar that moves and acts just like you.',
      remaining: '1 / 1 slots remaining',
      preview: '/images/avatars/digital.png',
      realistic: true
    },
    {
      type: 'photo-avatar' as AvatarType,
      title: 'Photo Avatar',
      subtitle: 'Image-based avatar',
      description: 'Bring a photo to life with natural motion - no video footage needed.',
      remaining: null,
      preview: '/images/avatars/photo.png',
      realistic: false
    },
    {
      type: 'voice-avatar' as AvatarType,
      title: 'Voice Avatar',
      subtitle: 'Voice-based avatar',
      description: 'Clone your voice with only 30 seconds of voice recording.',
      remaining: null,
      preview: '/images/avatars/voice.png',
      realistic: false
    }
  ] 

  const handleBoxSelect = (type: AvatarType) => {
    setLocalSelectedType(type)
    onAvatarTypeSelect(type)
  }

  const handleNext = () => {
    if (localSelectedType) {
      onAvatarTypeNext()
    }
  }

  return (
    <div className="space-y-9 pr-2">
      {/* Header */}
      <div className="text-left">
        <p className="text-[18px] text-[#5F5F5F] font-normal leading-[24px]">
        Use a video or photo to create your avatar&apos;s first look. You can add more looks of either type later.
        </p>
      </div>

      {/* Avatar Type Options */}
      <div className="grid grid-cols-1 gap-10">
        {avatarTypes.map((option) => (
          <div
            key={option.type}
            className={`rounded-[12px] p-6 transition-all duration-300 cursor-pointer group grid md:grid-cols-2 grid-cols-1 gap-y-5 ${
              localSelectedType === option.type 
                ? 'bg-[#CEE0ED]/40 border-2 border-[#5046E5]/60' 
                : 'bg-[#F7FAFC] hover:bg-[#CEE0ED]/40 border-2 border-[#F7FAFC] hover:border-[#CEE0ED]/40'
            }`}
            onClick={() => handleBoxSelect(option.type)}
          >
            <div className='flex flex-col gap-3 items-start justify-center'>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-start flex-col gap-3">
                {option.realistic && 
                  <div className="w-full bg-[#9DEFD3] max-w-[113px] py-[4px] rounded-[6px] flex items-center justify-center overflow-hidden">
                    <p className="text-[14px] text-[#00B37E] font-semibold leading-[14px]">Most realistic</p>
                  </div>
                }
                  <h4 className="text-[24px] font-semibold text-[#101010] leading-[120%]">
                    {option.title}
                  </h4>
              </div>
            </div>

            {/* Description */}
            <p className="text-[18px] text-[#5F5F5F] mb-6 leading-[24px] max-w-[446px]">
              {option.description}
            </p>

            {/* Remaining Count */}
            {option.remaining && (
              <div className="mb-4">
                <span className="text-[14px] text-[#5F5F5F] font-normal leading-[24px]">
                  {option.remaining}
                </span>
              </div>
            )}
            </div>

            {/* Preview Image */}
            <div className="flex justify-end">
              <Image src={option.preview} alt={option.title} width={1000} height={1000} className='w-[360px] h-[208px] object-cover rounded-[12px]' />
            </div>
          </div>
        ))}
      </div>

      {/* Next Button */}
      <div className="flex justify-center">
        <button
          onClick={handleNext}
          disabled={!localSelectedType}
          className={`px-8 py-[11.3px] font-semibold text-[20px] rounded-full transition-colors duration-300 cursor-pointer w-full ${
            localSelectedType
              ? 'bg-[#5046E5] text-white hover:text-[#5046E5] hover:bg-transparent border-2 border-[#5046E5]'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  )
}
