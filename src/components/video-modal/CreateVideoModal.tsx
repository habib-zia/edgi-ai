'use client'

import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { useVideoModalForm } from '@/hooks/video/useVideoModalForm'
import { useVideoGeneration } from '@/hooks/video/useVideoGeneration'
import { useVideoModalSteps, ModalStep } from '@/hooks/video/useVideoModalSteps'
import { useVideoDownload } from '@/hooks/video/useVideoDownload'
import VideoFormStep from './VideoFormStep'
import VideoLoadingStep from './VideoLoadingStep'
import VideoCompleteStep from './VideoCompleteStep'

interface CreateVideoModalProps {
  isOpen: boolean
  onClose: () => void
  videoTitle?: string // Keep for backward compatibility but not used
  startAtComplete?: boolean
  videoData?: { title: string; youtubeUrl: string; thumbnail: string } | null
  webhookResponse?: {
    prompt?: string
    description?: string
    conclusion?: string
    company_name?: string
    social_handles?: string
    license?: string
    avatar?: string
    email?: string
    voice_id?: string
    music_url?: string
  } | null
}

export default function CreateVideoModal({
  isOpen,
  onClose,
  startAtComplete = false,
  videoData,
  webhookResponse
}: CreateVideoModalProps) {
  // Get video topic from Redux store
  const videoTopic = useSelector((state: RootState) => state.video.videoTopic)

  // Use video modal form hook
  const {
    formData,
    errors,
    handleInputChange,
    validateForm,
    resetForm
  } = useVideoModalForm({ webhookResponse })

  // Use ref to store setAvatarError for use in onFailed callback
  const setAvatarErrorRef = React.useRef<((error: string) => void) | null>(null)

  // Use video modal steps hook
  const {
    currentStep,
    countdown,
    setStep,
    handleClose,
    markSubmissionComplete,
    setVideoGenerationRedirected,
    clearVideoUpdates
  } = useVideoModalSteps({
    isOpen,
    startAtComplete,
    videoData,
    onClose: () => {
      resetForm()
      onClose()
    },
    onFailed: () => {
      // Use ref to set avatar error when video generation fails
      if (setAvatarErrorRef.current) {
        setAvatarErrorRef.current('Video generation failed. Please try again.')
      }
    }
  })

  // Use video generation hook
  const {
    avatarError,
    generateVideo,
    setAvatarError
  } = useVideoGeneration({
    formData,
    videoTopic,
    webhookResponse,
    onSuccess: () => {
      setStep('loading')
      setVideoGenerationRedirected(true)
    },
    onError: (error) => {
      setStep('form')
    }
  })

  // Store setAvatarError in ref for use in onFailed callback
  React.useEffect(() => {
    setAvatarErrorRef.current = setAvatarError
  }, [setAvatarError])

  // Use video download hook
  const {
    isDownloading,
    handleDownload
  } = useVideoDownload({ videoData })

  // Handle create video
  const handleCreateVideo = async () => {
    clearVideoUpdates()

    if (!validateForm()) {
      return
    }

    markSubmissionComplete()
    await generateVideo()
  }

  if (!isOpen) return null

  const getModalTitle = () => {
    if (currentStep === 'form') return 'Create new video'
    if (currentStep === 'loading') return 'Creating a new video'
    if (currentStep === 'complete') {
      return videoData ? videoData.title : 'Your video is Rendered'
    }
    return 'Create new video'
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[12px] max-w-[1260px] w-full max-h-[90vh] flex flex-col relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-4 flex-shrink-0">
          <h3 className="md:text-[32px] text-[24px] font-semibold text-[#282828]">
            {getModalTitle()}
          </h3>

          {/* Hide close button when in loading state */}
          {currentStep !== 'loading' && (
            <button
              onClick={handleClose}
              className="cursor-pointer"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.5 1.5L1.5 22.5M1.5 1.5L22.5 22.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
        {currentStep === 'complete' && !videoData && (
          <p className='md:text-[20px] text-[16px] font-normal text-[#5F5F5F] pl-6'>
            It has also been sent to your email.
          </p>
        )}

        {/* Modal Content */}
        <div className="px-6 pt-2 pb-6 overflow-y-auto flex-1">
          {/* Step 1: Form */}
          {currentStep === 'form' && (
            <VideoFormStep
              formData={formData}
              errors={errors}
              avatarError={avatarError}
              onInputChange={handleInputChange}
              onSubmit={handleCreateVideo}
            />
          )}

          {/* Step 2: Loading */}
          {currentStep === 'loading' && (
            <VideoLoadingStep countdown={countdown} />
          )}

          {/* Step 3: Complete */}
          {currentStep === 'complete' && (
            <VideoCompleteStep
              videoData={videoData}
              isDownloading={isDownloading}
              onDownload={handleDownload}
            />
          )}
        </div>
      </div>
    </div>
  )
}

