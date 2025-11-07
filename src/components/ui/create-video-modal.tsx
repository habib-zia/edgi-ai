'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { apiService } from '@/lib/api-service'
import { API_CONFIG, getAuthenticatedHeaders } from '@/lib/config'
import { useAvatarStorage } from '@/hooks/useAvatarStorage'
import { useUnifiedSocketContext } from '@/components/providers/UnifiedSocketProvider'
import { useModalScrollLock } from '@/components/providers/ModalScrollLockProvider'


interface CreateVideoModalProps {
  isOpen: boolean
  onClose: () => void
  videoTitle: string
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
  } | null;
}

type ModalStep = 'form' | 'loading' | 'complete'

interface VideoGenerationData {
  hook: string
  body: string
  conclusion: string
  company_name: string
  social_handles: string
  license: string
  email: string
  title: string
  avatar_title: string
  avatar_body: string
  avatar_conclusion: string
  music?: string
  text?: string
}

export default function CreateVideoModal({ isOpen, onClose, startAtComplete = false, videoData, webhookResponse }: CreateVideoModalProps) {
  const [currentStep, setCurrentStep] = useState<ModalStep>(startAtComplete ? 'complete' : 'form')
  const [formData, setFormData] = useState({
    prompt: webhookResponse?.prompt || '',
    description: webhookResponse?.description || '',
    conclusion: webhookResponse?.conclusion || ''
  })
  const [errors, setErrors] = useState({
    prompt: '',
    description: '',
    conclusion: ''
  })
  const [isDownloading, setIsDownloading] = useState(false)
  const [countdown, setCountdown] = useState(20)
  const [videoGenerationreDirected, setVideoGenerationreDirected] = useState(false)
  const [avatarError, setAvatarError] = useState<string>('')
  const REDIRECT_KEY = 'videoModalRedirectExecuted'
  // Track if this is a new submission (modal just opened for new video)
  const isNewSubmissionRef = useRef(false)

  function redirectToCreateVideoOnce() {
    if (typeof window === 'undefined') return
    // Avoid duplicate redirects within the same session and if already on target page
    if (sessionStorage.getItem(REDIRECT_KEY)) return
    if (window.location.pathname === '/create-video') return
    sessionStorage.setItem(REDIRECT_KEY, 'true')
    window.location.href = '/create-video'
  }

  // Custom hook for avatar storage
  const { getAvatarIds, validateAvatarSelection } = useAvatarStorage()

  // Get unified socket context for video processing updates
  const {
    latestVideoUpdate,
    clearVideoUpdates,
    clearCompletedVideoUpdates
  } = useUnifiedSocketContext()

  // Use global modal scroll lock
  const { openModal, closeModal } = useModalScrollLock()

  // Get video topic and user info from Redux store
  const videoTopic = useSelector((state: RootState) => state.video.videoTopic)

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      openModal()
      // Reset modal step to 'form' when modal opens for new submission
      // Only reset if not viewing completed video and not starting at complete
      if (!startAtComplete && !videoData) {
        setCurrentStep('form')
        // Mark as new submission to prevent socket updates from overriding
        isNewSubmissionRef.current = true
      }
    } else {
      closeModal()
      // Reset new submission flag when modal closes
      isNewSubmissionRef.current = false
    }

    // Cleanup function to close modal when component unmounts
    return () => {
      closeModal()
    }
  }, [isOpen, openModal, closeModal, startAtComplete, videoData])

  // Update form data when webhookResponse changes
  useEffect(() => {
    if (webhookResponse) {
      const newFormData = {
        prompt: webhookResponse.prompt || '',
        description: webhookResponse.description || '',
        conclusion: webhookResponse.conclusion || ''
      }
      setFormData(newFormData)
    }
  }, [webhookResponse])

  // Listen for video processing updates from socket
  // But ignore updates when viewing a completed video (modal opened with videoData)
  useEffect(() => {
    if (!latestVideoUpdate) return

    // Don't respond to socket updates when viewing a completed video
    // The modal should stay in 'complete' state when opened for viewing
    if (startAtComplete || videoData) {
      return
    }

    // Ignore socket updates if this is a new submission and we're still on form step
    // This prevents existing video progress from skipping the form step
    if (isNewSubmissionRef.current && currentStep === 'form') {
      return
    }

    const { status, message } = latestVideoUpdate

    console.log('🎥 Create Video Modal received update:', { status, message })

    if (status === 'processing' || status === 'pending') {
      // Video is being processed - ensure we're in loading state
      if (currentStep !== 'loading') {
        setCurrentStep('loading')
      }
    } else if (status === 'completed' || status === 'success') {
      // Video is completed - move to complete state
      setCurrentStep('complete')
      // Don't clear all updates - let notification handle its own lifecycle
      // clearVideoUpdates() // Removed to prevent notification flickering
    } else if (status === 'failed') {
      // Video failed - go back to form with error
      setCurrentStep('form')
      setAvatarError('Video generation failed. Please try again.')
      // Don't clear all updates - let notification handle its own lifecycle
      // clearVideoUpdates() // Removed to prevent notification flickering
    }
  }, [latestVideoUpdate, currentStep, clearVideoUpdates, startAtComplete, videoData])

  const handleClose = useCallback(() => {
    const wasLoading = currentStep === 'loading'
    // Check if we're viewing a completed video (not creating a new one)
    const isViewingVideo = startAtComplete || !!videoData

    setCurrentStep(startAtComplete ? 'complete' : 'form')
    setFormData({
      prompt: webhookResponse?.prompt || '',
      description: webhookResponse?.description || '',
      conclusion: webhookResponse?.conclusion || ''
    })
    setErrors({ prompt: '', description: '', conclusion: '' })

    // Only clear localStorage keys and completed updates when closing after creating a new video
    // Don't clear these when just viewing a completed video
    if (!isViewingVideo) {
      clearCompletedVideoUpdates()
      localStorage.removeItem('videoGenerationStarted')
      localStorage.removeItem('videoProgress')
    }

    onClose()

    // Only redirect if modal was visible, was in loading state, and we're creating a new video (not viewing)
    if (isOpen && wasLoading && !isViewingVideo) {
      setTimeout(redirectToCreateVideoOnce, 100)
    }
  }, [currentStep, startAtComplete, webhookResponse, onClose, clearCompletedVideoUpdates, isOpen, videoData])

  // Auto close modal with countdown when in loading state
  useEffect(() => {
    let countdownTimer: NodeJS.Timeout

    if (currentStep === 'loading') {
      // Start countdown
      countdownTimer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownTimer!)
            // Close modal and navigate to /create-video when countdown reaches 0
            setTimeout(() => {
              // Close the modal first
              onClose()
              setTimeout(() => {
                if (window.location.pathname !== '/create-video' && videoGenerationreDirected) {
                  setVideoGenerationreDirected(false);
                  window.location.href = '/create-video'
                }
              }, 100)
            }, 1000)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      // Reset countdown when not in loading state
      setCountdown(20)
    }

    return () => {
      if (countdownTimer) {
        clearInterval(countdownTimer)
      }
    }
  }, [currentStep, onClose])

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }


  const validateForm = () => {
    const newErrors = {
      prompt: '',
      description: '',
      conclusion: ''
    }

    if (!formData.prompt.trim()) {
      newErrors.prompt = 'Prompt is required'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (!formData.conclusion.trim()) {
      newErrors.conclusion = 'Conclusion is required'
    }

    setErrors(newErrors)
    return !newErrors.prompt && !newErrors.description && !newErrors.conclusion
  }


  const handleCreateVideo = async () => {
    // Clear previous avatar errors and video updates
    setAvatarError('')
    clearVideoUpdates()

    if (!validateForm()) {
      return
    }

    try {
      // Get and validate avatar IDs from localStorage
      const avatarIds = getAvatarIds()
      if (!avatarIds) {
        setAvatarError('Avatar selection not found. Please go back and select avatars.')
        return
      }

      // Validate that all required avatars are selected
      validateAvatarSelection(avatarIds)
      isNewSubmissionRef.current = false
      setCurrentStep('loading')

      // Only proceed if voice_id exists - text-to-speech is required
      if (!webhookResponse?.voice_id) {
        setAvatarError('Voice ID is required for video generation.')
        setCurrentStep('form')
        return
      }

      try {
        console.log('🎙️ Calling ElevenLabs text-to-speech API with voice_id:', webhookResponse.voice_id)
        const textToSpeechData = {
          voice_id: webhookResponse.voice_id,
          hook: formData.prompt,
          body: formData.description,
          conclusion: formData.conclusion,
          output_format: 'mp3_44100_128'
        }
        
        const textToSpeechResponse = await apiService.textToSpeech(textToSpeechData)
        console.log('🎙️ Text-to-speech API response:', textToSpeechResponse)

        // Check if text-to-speech API was successful
        if (!textToSpeechResponse?.success || !textToSpeechResponse?.data) {
          // Text-to-speech API failed - STOP and show error
          console.error('❌ Text-to-speech API failed - NOT calling generateVideo:', textToSpeechResponse)
          setAvatarError('Text-to-speech generation failed. Please try again.')
          setCurrentStep('form') // Stop loading, go back to form
          return // Exit - do NOT call generateVideo
        }

        // Validate that all required URLs are present
        const { hook_url, body_url, conclusion_url } = textToSpeechResponse.data
        if (!hook_url || !body_url || !conclusion_url) {
          // URLs are missing - STOP and show error
          console.error('❌ Text-to-speech API returned missing URLs - NOT calling generateVideo:', {
            hook_url: !!hook_url,
            body_url: !!body_url,
            conclusion_url: !!conclusion_url
          })
          setAvatarError('Text-to-speech URLs are missing. Please try again.')
          setCurrentStep('form') // Stop loading, go back to form
          return // Exit - do NOT call generateVideo
        }

        // Text-to-speech was successful and all URLs are present - proceed with video generation
        const videoGenerationData: VideoGenerationData = {
          hook: hook_url,
          body: body_url,
          text: formData.description,
          conclusion: conclusion_url,
          company_name: webhookResponse?.company_name || '',
          social_handles: webhookResponse?.social_handles || '',
          license: webhookResponse?.license || '',
          email: webhookResponse?.email || '',
          title: videoTopic || 'Custom Video',
          avatar_title: avatarIds.avatar_title,
          avatar_body: avatarIds.avatar_body,
          avatar_conclusion: avatarIds.avatar_conclusion,
          music: webhookResponse?.music_url || ''
        }

        // Only call generateVideo after successful text-to-speech
        await apiService.generateVideo(videoGenerationData)
        console.log('✅ generateVideo API called successfully after text-to-speech success')

        // Store a key in localStorage to indicate video generation has started
        localStorage.setItem('videoGenerationStarted', JSON.stringify({
          timestamp: Date.now(),
          videoTitle: videoTopic || 'Custom Video'
        }))
        console.log('🎬 Video generation API called - localStorage key set')
        setVideoGenerationreDirected(true)

      } catch (error) {
        // Text-to-speech API threw an error - STOP and show error
        console.error('❌ Text-to-speech API error - NOT calling generateVideo:', error)
        setAvatarError('Text-to-speech generation failed. Please try again.')
        setCurrentStep('form') // Stop loading, go back to form
        return // Exit - do NOT call generateVideo
      }
    } catch (error: any) {
      console.error('Video creation failed:', error)
      localStorage.removeItem('videoGenerationStarted')
      console.log('🧹 Cleared localStorage key due to API error')

      // Set appropriate error message
      if (error.message.includes('Missing avatar selection')) {
        setAvatarError(error.message)
      } else {
        setAvatarError('Failed to create video. Please try again.')
      }

      setCurrentStep('form') // Go back to form on error
    }
  }

  const handleDownload = async () => {
    if (!videoData?.youtubeUrl) {
      return
    }


    try {
      // Set loading state
      setIsDownloading(true)

      // Use our proxy to avoid CORS issues
      if (!videoData?.youtubeUrl) {
        throw new Error('No video URL available for download')
      }
      const proxyUrl = `${API_CONFIG.BACKEND_URL}/api/video/download-proxy?url=${encodeURIComponent(videoData.youtubeUrl)}`

      const headers = getAuthenticatedHeaders()
      delete headers['Content-Type']
      const response = await fetch(proxyUrl, {
        headers: headers
      })

      if (!response.ok) {
        throw new Error(`Failed to download video: ${response.status} ${response.statusText}`)
      }

      // Convert response to blob
      const blob = await response.blob()

      // Create blob URL
      const blobUrl = window.URL.createObjectURL(blob)

      // Create download link
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `${videoData.title || 'video'}.mp4`

      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up blob URL
      window.URL.revokeObjectURL(blobUrl)


    } catch (err) {
      console.error('Download failed:', err)
      alert('Download failed. Please try again.')
    } finally {
      // Reset loading state
      setIsDownloading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[12px] max-w-[1260px] w-full max-h-[90vh] flex flex-col relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-4 flex-shrink-0">
          <h3 className="md:text-[32px] text-[24px] font-semibold text-[#282828]">
            {currentStep === 'form' && 'Create new video'}
            {currentStep === 'loading' && 'Creating a new video'}
            {currentStep === 'complete' && `${videoData ? `${videoData.title}` : 'Your video is Rendered'}`}
          </h3>

          {/* Hide close button when in loading state */}
          {currentStep !== 'loading' && (
            <button
              onClick={() => handleClose()}
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
            <>
              <div className="flex gap-2 mb-8 md:flex-row flex-col">
                <div className='w-full'>
                  <label className="block text-base font-normal text-[#5F5F5F] mb-2">
                    Prompt <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.prompt}
                    onChange={(e) => handleInputChange('prompt', e.target.value)}
                    placeholder="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to"
                    className={`w-full md:h-[371px] h-[200px] px-4 py-3 bg-[#EEEEEE] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] resize-none focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white ${errors.prompt ? 'ring-2 ring-red-500' : ''
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
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to"
                    className={`w-full md:h-[371px] h-[200px] px-4 py-3 bg-[#EEEEEE] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] resize-none focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white ${errors.description ? 'ring-2 ring-red-500' : ''
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
                    onChange={(e) => handleInputChange('conclusion', e.target.value)}
                    placeholder="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to"
                    className={`w-full md:h-[371px] h-[200px] px-4 py-3 bg-[#EEEEEE] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] resize-none focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white ${errors.conclusion ? 'ring-2 ring-red-500' : ''
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
                onClick={handleCreateVideo}
                className="w-full bg-[#5046E5] text-white py-[11.4px] px-6 rounded-full font-semibold text-[20px] hover:bg-transparent hover:text-[#5046E5] border-2 border-[#5046E5] transition-colors duration-300 cursor-pointer"
              >
                Create Video
              </button>
            </>
          )}

          {/* Step 2: Loading */}
          {currentStep === 'loading' && (
            <div className="text-center py-12">
              <div className="mb-6">
                <h4 className="md:text-[32px] text-[24px] font-semibold text-[#282828] mb-4">
                  Video Generation Started!
                </h4>
                <p className="text-[#5F5F5F] text-lg mb-6">
                  Your video is being generated in the background. This typically takes 10-15 minutes.
                </p>
                <p className="text-[#5046E5] text-[18px] mb-4">
                  You can close this window and explore the site. We will notify you when the video is ready.
                </p>

                {/* Countdown Message */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-[#5046E5] text-[16px] font-medium">
                    Redirecting to gallery in <span className="font-bold text-lg">{countdown}</span> seconds...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Complete */}
          {currentStep === 'complete' && (
            <div className="space-y-6">
              {videoData ? (
                <>
                  {/* Video Preview */}
                  <div className="relative mt-7 h-[420px] w-full aspect-video bg-gray-100 rounded-[8px] overflow-hidden">
                    <video
                      src={videoData?.youtubeUrl || ''}
                      title={videoData?.title || 'Video'}
                      className="w-full h-full rounded-[8px] object-contain cursor-pointer"
                      controls
                      preload="metadata"
                      poster={videoData.thumbnail}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </>
              ) : (
                <>

                  {/* Video Preview */}
                  <div className="relative mt-7 h-[420px] w-full aspect-video bg-gray-100 rounded-[8px] overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <Image src="/images/modal-image.png" alt="Video Preview" width={1000} height={1000} className='w-full h-full object-cover' />
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className={`w-full bg-[#5046E5] text-white py-[11.4px] px-6 rounded-full font-semibold text-[20px] border-2 border-[#5046E5] transition-colors duration-300 flex items-center justify-center gap-2 ${isDownloading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-transparent hover:text-[#5046E5] cursor-pointer'
                  }`}
              >
                {isDownloading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Downloading...
                  </>
                ) : (
                  'Download'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}