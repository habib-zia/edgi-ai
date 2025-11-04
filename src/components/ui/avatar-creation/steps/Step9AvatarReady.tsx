'use client'

import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { AvatarData } from '../AvatarCreationModal'

interface Step9AvatarReadyProps {
  onNext: () => void
  onBack: () => void
  avatarData: AvatarData
  setAvatarData: (data: AvatarData) => void
}

export default function Step9AvatarReady({ onNext, onBack}: Step9AvatarReadyProps) {
  const handleCreateVideo = () => {
    // In a real implementation, this would redirect to video creation or close the modal
    onNext()
  }

  return (
    <div className="space-y-6 pr-2">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-[20px] font-semibold text-[#101010] mb-3">
        Your avatar is ready!
        </h3>
      </div>

      {/* Avatar Preview */}
      <div className="flex justify-center">
          <Image src="/images/avatars/avatargirl.png" alt="avatar" width={1000} height={1000}
           className="w-[356px] md:h-[533px] h-[370px] md:object-cover object-contain" />
      </div>  

      {/* Navigation Buttons */}
      <div className="flex flex-col gap-2 justify-between pt-1">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#667085] hover:text-[#5046E5] transition-colors duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleCreateVideo}
          className={`px-8 py-[11.3px] font-semibold text-[20px] rounded-full transition-colors duration-300 cursor-pointer w-full bg-[#5046E5] text-white hover:text-[#5046E5] hover:bg-transparent border-2 border-[#5046E5] `}
        >
          Create
        </button>
      </div>
    </div>
  )
}
