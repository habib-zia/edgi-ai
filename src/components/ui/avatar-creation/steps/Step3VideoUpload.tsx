'use client'

import { useState, useRef } from 'react'
import { Upload, Video, Camera, Smartphone, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Clipboard from '../../clipboard'

interface AvatarData {
  name: string
  age: string
  gender: string
  ethnicity: string
  videoFile: File | null
  photoFiles: File[]
  avatarType: 'digital-twin' | 'photo-avatar' | null
}

interface Step3VideoUploadProps {
  onNext: () => void
  onBack: () => void
  avatarData: AvatarData
  setAvatarData: (data: AvatarData) => void
  onSkipToDetails?: () => void // Add optional prop to skip to details
}

type UploadTab = 'upload' | 'webcam' | 'phone'

export default function Step3VideoUpload({ onNext, onBack, avatarData, setAvatarData, onSkipToDetails }: Step3VideoUploadProps) {
  const [activeTab, setActiveTab] = useState<UploadTab>('upload')
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const tabs = [
    { id: 'upload', label: 'Upload footage', icon: <Upload className="w-4 h-4" /> },
    { id: 'webcam', label: 'Record via webcam', icon: <Camera className="w-4 h-4" /> },
    { id: 'phone', label: 'Record via phone', icon: <Smartphone className="w-4 h-4" /> }
  ]

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith('video/')) {
        setAvatarData({ ...avatarData, videoFile: file })
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAvatarData({ ...avatarData, videoFile: file })
    }
  }

  const handleCreate = () => {
    // Skip webcam and phone recording steps - go directly to avatar details
    if (activeTab === 'upload' && avatarData.videoFile) {
      // For upload tab, we have a video file, so skip to avatar details
      if (onSkipToDetails) {
        onSkipToDetails()
      } else {
        onNext()
      }
    } else if (activeTab === 'webcam' || activeTab === 'phone') {
      // For webcam and phone tabs, skip directly to avatar details without requiring video
      if (onSkipToDetails) {
        onSkipToDetails()
      } else {
        onNext()
      }
    }
  }

  return (
    <div className=" pr-2">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-[24px] font-semibold text-[#101010] mb-3">
          Upload your footage
        </h3>
        <p className="text-[18px] text-[#5F5F5F] max-w-[710px] mx-auto leading-[24px]">
        For optimal, most realistic results, we recommend uploading a 2 min video recorded with a high-resolution camera or smartphone.If you&apos;re just testing the product, feel free to submit a 30s recording using your webcam.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-between max-w-[435px] px-1 py-1 mt-10 mb-8 mx-auto bg-[#F3F4F6] rounded-[6px] border border-[#E5E7EB]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as UploadTab)}
            className={`text-[14px] text-center py-[6.6px] px-3 font-medium transition-colors duration-300 ${
              activeTab === tab.id
                ? 'text-[#6366F1] bg-[#FFFFFF] rounded-[6px]'
                : 'text-[#1F2937] hover:text-[#6366F1] rounded-[6px]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-[724px] mx-auto">

        {/* Tab Content */}
        {activeTab === 'upload' && (
          <div className="space-y-4 mb-[10px]">
            {/* Upload Area */}
            <div
              className={`border border-dashed rounded-[8px] md:p-8 p-4 text-center transition-colors duration-300 cursor-pointer ${
                dragActive
                  ? 'border-[#6366F1] bg-[#F0F0FF]'
                  : 'border-[#D1D5DB] hover:border-[#6366F1]'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <h4 className="text-[20px] font-semibold text-[#101010] mb-5">
                Drag and drop video, or click to upload
              </h4>
              <p className="text-[14px] text-[#5F5F5F] mb-6 leading-[18px]">
                landscape or portrait video, mp4/mov/webm format <br className='md:block hidden' />
                at least 30s, 2-10min recommended, 360p-4K resolution, { "<" } 10GB 
              </p>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-[#6366F1] font-normal transition-colors duration-300 hover:text-[#5046E5] text-[14px]"
              >
                Browse local files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Google HardDriveUpload Option */}
              <div className="text-center mt-6 bg-[#F3F4F6] rounded-[12px] px-4 py-[22.2px] max-w-[654px] mx-auto">
                <p className="text-[16px] text-[#1F2937] mb-2 font-semibold">Or upload via Google Drive</p>

                <div className="relative flex items-center pt-2">
                <input type='text' placeholder='Paste video URL here (up to 50GB)'
                  className="pr-4 pl-12 py-3 text-sm text-[#1F2937] rounded-[8px] bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#6366F1] w-full outline-none placeholder:text-[#6B7280] transition-colors duration-300" />

                <div className="absolute left-4">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                  <rect width="20" height="20" fill="url(#pattern0_7905_1130)"/>
                  <defs>
                  <pattern id="pattern0_7905_1130" patternContentUnits="objectBoundingBox" width="1" height="1">
                  <use xlinkHref="#image0_7905_1130" transform="scale(0.05)"/>
                  </pattern>
                  <image id="image0_7905_1130" width="20" height="20" preserveAspectRatio="none" xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAMtJREFUOE/tky8LhDAYxh8RbSIqBj+CVoPgdzc5w5rYBcFkME0mpsnedOGU6R2WuzeOvT+eP5vV973CF8f6Az9O8/kMl2XBNE2QUsJxHCRJAt/3D52cKpznGW3bIooigqzrCn1WliVs234LPQU2TYMgCJBlmXG2h8Bt21DXNfI8J6jpGAOFEOCcE7coCnied90yY4zyS9OUlpVSqKrqPlAX0HUdQbVtHcMwDPeBWpWGjONIDbuuiziOEYbhvWdjWsTrved/ylWVP6hwB3xoj81aSPfUAAAAAElFTkSuQmCC"/></defs></svg>
                </div>
              </div>

              </div>
            </div>



            {/* Selected File */}
            {avatarData.videoFile && (
              <div className="bg-[#F0F0FF] border border-[#6366F1] rounded-[8px] p-4">
                <div className="flex items-center gap-3">
                  <Video className="w-6 h-6 text-[#5046E5]" />
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
          </div>
        )}

        {activeTab === 'webcam' && (
          <>
            <div className="text-center flex flex-col items-center justify-center py-8 bg-[#F5F7FC] rounded-[8px] min-h-[280px]">
              <button className="bg-transparent text-[#7C6FFF] px-2 py-2 rounded-[6px] hover:bg-[#7C6FFF] border hover:text-white border-[#7C6FFF] transition-colors duration-300 text-[16px] font-normal max-w-[188px] w-full mx-auto">
                Turn on Cam & Mic
              </button>
              <p className="text-[14px] text-[#5F5F5F] mt-7 leading-[18px]">
                Your browser may ask for permission to use your camera <br className='md:block hidden' /> and microphone.
              </p>
            </div>
            <div className="flex justify-center mt-10">
              <button className="bg-[#B9B4F9] text-white px-2 py-[12px] rounded-[6px] hover:bg-[#7C6FFF] hover:text-white transition-colors duration-300 text-[16px] font-normal max-w-[120px] w-full mx-auto">Record</button>
            </div>
          </>
        )}

        {activeTab === 'phone' && (
          <div className="text-center pt-5 pb-2 px-5 max-w-[350px] mx-auto bg-[#F5F7FC] rounded-[16px]">
            <Image src="/images/avatars/qrcode.png" alt="phone" width={1000} height={1000} className="mx-auto mb-4 w-[270px] h-[270px]" />
            <Clipboard url="https://app.heygen.com/record..." />
            <p className="text-[14px] text-[#5F5F5F] mb-4 mt-4 leading-[18px]">
              QR code and URL will expire after <br />
              19:58 Refresh now 
            </p>
          </div>
        )}

      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col gap-2 justify-between pt-5">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#667085] hover:text-[#5046E5] transition-colors duration-300 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleCreate}
          className={`px-8 py-[11.3px] font-semibold text-[20px] rounded-full transition-colors duration-300 cursor-pointer w-full bg-[#5046E5] text-white hover:text-[#5046E5] hover:bg-transparent border-2 border-[#5046E5] `}
        >
          Create
        </button>
      </div>
    </div>
  )
}
