'use client'

import { useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { useRouter } from 'next/navigation'
import { apiService } from '@/lib/api-service'
import { API_CONFIG } from '@/lib/config'
import { useAvatarStorage } from '@/hooks/useAvatarStorage'

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
  } | null
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
}

export default function CreateVideoModal({ isOpen, onClose, startAtComplete = false, videoData, webhookResponse }: CreateVideoModalProps) {
  const router = useRouter()
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
  const [touched, setTouched] = useState({
    prompt: false,
    description: false,
    conclusion: false
  })
  const [isDownloading, setIsDownloading] = useState(false)
  const [countdown, setCountdown] = useState(10)
  const [avatarError, setAvatarError] = useState<string>('')

  // Custom hook for avatar storage
  const { getAvatarIds, validateAvatarSelection } = useAvatarStorage()

  // Get video topic and user info from Redux store
  const videoTopic = useSelector((state: RootState) => state.video.videoTopic)

  // Update form data when webhookResponse changes
  useEffect(() => {
    if (webhookResponse)
    {
      const newFormData = {
        prompt: webhookResponse.prompt || '',
        description: webhookResponse.description || '',
        conclusion: webhookResponse.conclusion || ''
      }
      setFormData(newFormData)
    }
  }, [webhookResponse])

  // Auto close modal with countdown when in loading state
  useEffect(() => {
    let countdownTimer: NodeJS.Timeout

    if (currentStep === 'loading')
    {
      // Start countdown
      countdownTimer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1)
          {
            clearInterval(countdownTimer!)
            // Close modal and redirect after countdown reaches 0
            setTimeout(() => {
              handleClose()
            }, 1000)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else
    {
      // Reset countdown when not in loading state
      setCountdown(10)
    }

    return () => {
      if (countdownTimer)
      {
        clearInterval(countdownTimer)
      }
    }
  }, [currentStep])

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error when user starts typing
    if (errors[field])
    {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleInputBlur = (field: keyof typeof formData) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }))
  }

  const validateForm = () => {
    const newErrors = {
      prompt: '',
      description: '',
      conclusion: ''
    }

    if (!formData.prompt.trim())
    {
      newErrors.prompt = 'Prompt is required'
    }
    if (!formData.description.trim())
    {
      newErrors.description = 'Description is required'
    }
    if (!formData.conclusion.trim())
    {
      newErrors.conclusion = 'Conclusion is required'
    }

    setErrors(newErrors)
    return !newErrors.prompt && !newErrors.description && !newErrors.conclusion
  }


  const handleCreateVideo = async () => {
    // Clear previous avatar errors
    setAvatarError('')

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

      setCurrentStep('loading')
      // avatar: webhookResponse?.avatar || '',

      // Prepare data for video generation API with proper typing
      const videoGenerationData: VideoGenerationData = {
        hook: formData.prompt,
        body: formData.description,
        conclusion: formData.conclusion,
        company_name: webhookResponse?.company_name || '',
        social_handles: webhookResponse?.social_handles || '',
        license: webhookResponse?.license || '',
        email: webhookResponse?.email || '',
        title: videoTopic || 'Custom Video',
        avatar_title: avatarIds.avatar_title,
        avatar_body: avatarIds.avatar_body,
        avatar_conclusion: avatarIds.avatar_conclusion
      }

      console.log('videoGenerationData', videoGenerationData)

      // Call the video generation API using apiService
      await apiService.generateVideo(videoGenerationData)

      // Just stay in loading state - modal will auto-close after countdown

    } catch (error: any) {
      console.error('Video creation failed:', error)
      
      // Set appropriate error message
      if (error.message.includes('Missing avatar selection')) {
        setAvatarError(error.message)
      } else {
        setAvatarError('Failed to create video. Please try again.')
      }
      
      setCurrentStep('form') // Go back to form on error
    }
  }

  const handleClose = () => {
    setCurrentStep(startAtComplete ? 'complete' : 'form')
    setFormData({
      prompt: webhookResponse?.prompt || '',
      description: webhookResponse?.description || '',
      conclusion: webhookResponse?.conclusion || ''
    })
    setErrors({ prompt: '', description: '', conclusion: '' })
    setTouched({ prompt: false, description: false, conclusion: false })
    onClose()
    // Redirect to gallery page
    router.push('/create-video')
  }

  const handleDownload = async () => {
    if (!videoData?.youtubeUrl)
    {
      return
    }


    try
    {
      // Set loading state
      setIsDownloading(true)

      // Use our proxy to avoid CORS issues
      if (!videoData?.youtubeUrl)
      {
        throw new Error('No video URL available for download')
      }
      const proxyUrl = `${API_CONFIG.BACKEND_URL}/api/video/download-proxy?url=${encodeURIComponent(videoData.youtubeUrl)}`

      // Fetch the video through our proxy
      const response = await fetch(proxyUrl)

      if (!response.ok)
      {
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


    } catch (error)
    {
      alert('Download failed. Please try again.')
    } finally
    {
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

          <button
            onClick={handleClose}
            className="cursor-pointer"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.5 1.5L1.5 22.5M1.5 1.5L22.5 22.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
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
                    onBlur={() => handleInputBlur('prompt')}
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
                    onBlur={() => handleInputBlur('description')}
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
                    onBlur={() => handleInputBlur('conclusion')}
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
                  You can close this modal and explore the site. We will notify you when the video is ready.
                </p>

                {/* Countdown Message */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-[#5046E5] text-[16px] font-medium">
                    Redirecting to gallery page in <span className="font-bold text-lg">{countdown}</span> seconds...
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