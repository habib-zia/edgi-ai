'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'

interface AvatarData {
  name: string
  age: string
  gender: string
  ethnicity: string
  videoFile: File | null
  photoFiles: File[]
  avatarType: 'digital-twin' | 'photo-avatar' | null
}

interface Step7PhotoUploadProps {
  onNext: () => void
  onBack: () => void
  avatarData: AvatarData
  setAvatarData: (data: AvatarData) => void
}

export default function Step7PhotoUpload({ onNext, onBack, avatarData, setAvatarData }: Step7PhotoUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Function to create preview URL for uploaded file
  const createPreviewUrl = (file: File) => {
    const url = URL.createObjectURL(file)
    setImagePreviewUrl(url)
    return url
  }

  // Effect to restore image preview when component mounts with existing photo files
  useEffect(() => {
    if (avatarData.photoFiles.length > 0 && !imagePreviewUrl) {
      // Create preview URL for existing photo file
      const file = avatarData.photoFiles[0]
      createPreviewUrl(file)
    }
  }, [avatarData.photoFiles, imagePreviewUrl])

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Cleanup preview URL when component unmounts
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl)
      }
    }
  }, [imagePreviewUrl])

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

    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files).filter(file => 
        file.type.startsWith('image/')
      )
      if (newFiles.length > 0) {
        // Only take the first file
        const file = newFiles[0]
        createPreviewUrl(file)
        setAvatarData({
          ...avatarData,
          photoFiles: [file] // Replace with single file
        })
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(file => 
        file.type.startsWith('image/')
      )
      if (newFiles.length > 0) {
        // Only take the first file
        const file = newFiles[0]
        createPreviewUrl(file)
        setAvatarData({
          ...avatarData,
          photoFiles: [file] // Replace with single file
        })
      }
    }
  }

  const removePhoto = () => {
    // Clean up the preview URL for the removed image
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl)
    }
    
    setAvatarData({ ...avatarData, photoFiles: [] })
    setImagePreviewUrl('')
  }

  const handleUpload = () => {
    if (avatarData.photoFiles.length > 0) {
      onNext()
    }
  }

  return (
    <div className="space-y-6 pr-2">
      {/* Header */}
      <div className="text-left">
        <p className="text-[18px] text-[#5F5F5F] font-normal leading-[24px]">
          Upload a photo to create your avatar
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`rounded-[12px] md:p-8 p-4 border min-h-[280px] flex flex-col items-center justify-center text-center transition-colors duration-300 ${
          dragActive
            ? 'border-[#5046E5] bg-[#F5F7FC]'
            : 'border-[#F5F7FC] hover:border-[#5046E5] bg-[#F5F7FC]'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-transparent text-[#7C6FFF] px-[27px] py-2 rounded-[6px] hover:bg-[#7C6FFF] transition-colors duration-300 border border-[#7C6FFF] hover:text-white flex items-center justify-center gap-x-3 text-base font-normal leading-[24px] mx-auto"
        >
          <svg width="23" height="22" viewBox="0 0 23 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.6094 8.00195C18.7844 8.01395 19.9624 8.11095 20.7304 8.87895C21.6094 9.75795 21.6094 11.172 21.6094 14V15C21.6094 17.829 21.6094 19.243 20.7304 20.122C19.8524 21 18.4374 21 15.6094 21H7.60938C4.78137 21 3.36637 21 2.48837 20.122C1.60937 19.242 1.60938 17.829 1.60938 15V14C1.60938 11.172 1.60937 9.75795 2.48837 8.87895C3.25637 8.11095 4.43438 8.01395 6.60938 8.00195" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M11.6094 14V1M11.6094 1L14.6094 4.5M11.6094 1L8.60938 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>

          Select
        </button>
        <p className="text-[16px] font-normal leading-[24px] text-[#7C6FFF] pt-5">
          Drag and Drop photo to upload
        </p>
        <p className="text-[14px] text-[#5F5F5F] font-normal leading-[18px] pt-3">
          Upload PNG, JPG, HEIC, or WebP files up to 200MB
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>


      {/* Uploaded Photo */}
      {avatarData.photoFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="relative group max-w-[200px]">
              <div className="w-full h-[250px] rounded-[12px] overflow-hidden">
                {imagePreviewUrl ? (
                  <Image
                    src={imagePreviewUrl}
                    alt="Preview"
                    width={200}
                    height={250}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[#98A2B3] text-xs">Photo Preview</span>
                  </div>
                )}
              </div>
              <button
                onClick={removePhoto}
                className="absolute -top-2 -right-2 w-6 h-6 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.0002 3.3335C29.2168 3.3335 36.6668 10.7835 36.6668 20.0002C36.6668 29.2168 29.2168 36.6668 20.0002 36.6668C10.7835 36.6668 3.3335 29.2168 3.3335 20.0002C3.3335 10.7835 10.7835 3.3335 20.0002 3.3335ZM25.9835 11.6668L20.0002 17.6502L14.0168 11.6668L11.6668 14.0168L17.6502 20.0002L11.6668 25.9835L14.0168 28.3335L20.0002 22.3502L25.9835 28.3335L28.3335 25.9835L22.3502 20.0002L28.3335 14.0168L25.9835 11.6668Z" fill="#282828"/>
                </svg>
              </button>
              <p className="text-[12px] text-[#667085] text-center mt-2 truncate">
                {avatarData.photoFiles[0]?.name}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex flex-col gap-2 justify-between pt-5">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#667085] hover:text-[#5046E5] transition-colors duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleUpload}
          disabled={avatarData.photoFiles.length === 0}
          className={`px-6 py-[11.4px] rounded-full font-semibold text-[18px] transition-colors duration-300 ${
            avatarData.photoFiles.length > 0
              ? 'bg-[#5046E5] text-white hover:bg-transparent hover:text-[#5046E5] border-2 border-[#5046E5]'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Upload
        </button>
      </div>
    </div>
  )
}
