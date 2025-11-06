'use client'

import React from 'react'
import { AlertCircle } from 'lucide-react'
import { VideoFormData, VideoFormErrors } from '@/hooks/video/useVideoModalForm'

interface VideoFormStepProps {
  formData: VideoFormData
  errors: VideoFormErrors
  avatarError: string
  onInputChange: (field: keyof VideoFormData, value: string) => void
  onSubmit: () => void
}

export default function VideoFormStep({
  formData,
  errors,
  avatarError,
  onInputChange,
  onSubmit
}: VideoFormStepProps) {
  return (
    <>
      <div className="flex gap-2 mb-8 md:flex-row flex-col">
        <div className='w-full'>
          <label className="block text-base font-normal text-[#5F5F5F] mb-2">
            Prompt <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.prompt}
            onChange={(e) => onInputChange('prompt', e.target.value)}
            placeholder="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to"
            className={`w-full md:h-[371px] h-[200px] px-4 py-3 bg-[#EEEEEE] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] resize-none focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white ${
              errors.prompt ? 'ring-2 ring-red-500' : ''
            }`}
          />
          {errors.prompt && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.prompt}
            </p>
          )}
        </div>

        <div className='w-full'>
          <label className="block text-base font-normal text-[#5F5F5F] mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => onInputChange('description', e.target.value)}
            placeholder="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to"
            className={`w-full md:h-[371px] h-[200px] px-4 py-3 bg-[#EEEEEE] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] resize-none focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white ${
              errors.description ? 'ring-2 ring-red-500' : ''
            }`}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.description}
            </p>
          )}
        </div>

        <div className='w-full'>
          <label className="block text-base font-normal text-[#5F5F5F] mb-2">
            Conclusion <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.conclusion}
            onChange={(e) => onInputChange('conclusion', e.target.value)}
            placeholder="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to"
            className={`w-full md:h-[371px] h-[200px] px-4 py-3 bg-[#EEEEEE] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] resize-none focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white ${
              errors.conclusion ? 'ring-2 ring-red-500' : ''
            }`}
          />
          {errors.conclusion && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.conclusion}
            </p>
          )}
        </div>
      </div>

      {/* Avatar Error Display */}
      {avatarError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="text-red-800 font-semibold">Avatar Selection Error</h3>
              <p className="text-red-700 text-sm">{avatarError}</p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={onSubmit}
        className="w-full bg-[#5046E5] text-white py-[11.4px] px-6 rounded-full font-semibold text-[20px] hover:bg-transparent hover:text-[#5046E5] border-2 border-[#5046E5] transition-colors duration-300 cursor-pointer"
      >
        Create Video
      </button>
    </>
  )
}

