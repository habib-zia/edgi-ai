'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IoMdArrowDropdown } from 'react-icons/io'
import { AlertCircle } from 'lucide-react'
import { useNotificationStore } from '@/components/ui/global-notification'
import { apiService, Avatar } from '@/lib/api-service'
import FormDropdown from '@/components/ui/form-dropdown'
import { useUnifiedSocketContext } from '@/components/providers/UnifiedSocketProvider'
import VoiceSelectorWrapper from '../ui/voice-selector-wrapper'
import MusicSelectorWrapper from '../ui/music-selector-wrapper'
import { Voice, VoiceType } from '../ui/voice-selector/types'
import { useVoicesAndMusic } from '@/hooks/useVoicesAndMusic'
import { animatedVideoSchema, AnimatedVideoFormData } from './validation-schema'
import { useAppSelector } from '@/store/hooks'
import SubmitButton from '../ui/submit-button'
import CreateVideoModal from '../ui/create-video-modal'
import { useSubscription } from '@/hooks/useSubscription'
import UsageLimitToast from '../ui/usage-limit-toast'
import PendingPaymentToast from '../ui/pending-payment-toast'
import SubscriptionRequiredToast from '../ui/subscription-required-toast'

// Avatar options for simple dropdown fallback
const avatarOptions = [
  { value: "Gorilla-1", label: "Gorilla 1" },
  { value: "Shawheen", label: "Shawheen" },
  { value: "Verified HeyGen Avatar", label: "Verified HeyGen Avatar" },
  { value: "Varied", label: "Varied" },
]

// Extended avatar options
const extendedAvatarOptions = [
  { value: 'Gorilla-1', label: 'Gorilla 1' },
  { value: 'Shawheen', label: 'Shawheen' },
  { value: 'Verified HeyGen Avatar', label: 'Verified HeyGen Avatar' },
  { value: 'Varied', label: 'Varied' },
  { value: 'SHF34020', label: 'SHF34020' },
  { value: 'FRM89034', label: 'FRM89034' },
  { value: 'VAL77889', label: 'VAL77889' },
  { value: 'PIP34567', label: 'PIP34567' },
  { value: 'PN100234', label: 'PN100234' },
  { value: 'CON11223', label: 'CON11223' },
  { value: 'XTR12340', label: 'XTR12340' },
  { value: 'DRV34567', label: 'DRV34567' },
  { value: 'BLD67543', label: 'BLD67543' },
  { value: 'Account', label: 'Account' },
  { value: 'FRM11223', label: 'FRM11223' },
  { value: 'SHF56789', label: 'SHF56789' }
]

// Gender options
const genderOptions = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
]

// Style options (ghibli shows in dropdown but sends editorial_infographic)
const styleOptions = [
  { value: 'art_styles', label: 'Art Styles' },
  { value: 'marvel', label: 'Marvel' },
  { value: 'ghibli', label: 'Ghibli' },
  { value: 'disney', label: 'Disney' },
]

export default function AnimatedVideoForm() {
  const { showNotification } = useNotificationStore()
  const { latestAvatarUpdate } = useUnifiedSocketContext()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<AnimatedVideoFormData>({
    resolver: zodResolver(animatedVideoSchema),
    mode: 'onSubmit',
    defaultValues: {
      title: '',
      avatar: '',
      gender: '',
      voice: '',
      music: '',
      city: '',
      videoTopic: '',
      topicKeyPoints: '',
      style: '',
      preset: '',
      socialHandles: '',
    },
  })

  const user = useAppSelector((state) => state.user.user)
  const userEmail = user?.email || ''

  // Subscription hook
  const { checkVideoUsageLimit } = useSubscription()

  // Usage limit toast state
  const [showUsageToast, setShowUsageToast] = useState(false)
  const [usageToastMessage, setUsageToastMessage] = useState('')
  
  // Pending payment toast state
  const [showPendingPaymentToast, setShowPendingPaymentToast] = useState(false)
  const [pendingPaymentMessage, setPendingPaymentMessage] = useState('')
  
  // Subscription required toast state
  const [showSubscriptionRequiredToast, setShowSubscriptionRequiredToast] = useState(false)
  const [subscriptionRequiredMessage, setSubscriptionRequiredMessage] = useState('')

  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [webhookResponse, setWebhookResponse] = useState<any>(null)
  const [shouldStartLoading, setShouldStartLoading] = useState(false)
  const [isFreshSubmission, setIsFreshSubmission] = useState(false)
  
  // Avatar state
  const [isFromDefaultAvatar] = useState(false)
  const [avatars, setAvatars] = useState<{ custom: Avatar[]; default: Avatar[] }>({ custom: [], default: [] })
  const [avatarsLoading, setAvatarsLoading] = useState(false)
  const [avatarsError, setAvatarsError] = useState<string | null>(null)
  const [selectedAvatars, setSelectedAvatars] = useState<{
    title: Avatar | null
    body: Avatar | null
    conclusion: Avatar | null
  }>({
    title: null,
    body: null,
    conclusion: null,
  })
  const [draggedAvatar, setDraggedAvatar] = useState<Avatar | null>(null)

  // Voice and Music state
  const preset = watch('preset')
  const gender = watch('gender') || null
  const {
    voices,
    voicesLoading,
    voicesError,
    musicList,
    musicLoading,
    musicError,
    allVoices,
    allMusic
  } = useVoicesAndMusic({
    preset,
    selectedAvatars,
    gender
  })

  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null)
  const [draggedVoice, setDraggedVoice] = useState<Voice | null>(null)
  const [selectedMusic, setSelectedMusic] = useState<Voice | null>(null)
  const [draggedMusic, setDraggedMusic] = useState<Voice | null>(null)
  const [currentVoiceType, setCurrentVoiceType] = useState<VoiceType | null>(null)
  const [currentMusicType, setCurrentMusicType] = useState<VoiceType | null>(null)
  const [customMusic, setCustomMusic] = useState<Voice[]>([])

  // Topic and key points state
  const [keyPointsLoading, setKeyPointsLoading] = useState(false)
  const [keyPointsError, setKeyPointsError] = useState<string | null>(null)
  const [lastApiTriggeredValue, setLastApiTriggeredValue] = useState<string>('')
  const [formManuallyTouched, setFormManuallyTouched] = useState(false)
  const [submitAttempted, setSubmitAttempted] = useState(false)

  // Fetch avatars function
  const fetchAvatars = useCallback(async () => {
    try {
      setAvatarsLoading(true)
      setAvatarsError(null)
      const response = await apiService.getAvatars()

      if (response.success) {
        const avatarData = (response as any).data || response
        const customAvatars = (avatarData as any).custom || (response as any).custom || []
        const defaultAvatars = (avatarData as any).default || (response as any).default || []

        setAvatars({
          custom: customAvatars,
          default: defaultAvatars,
        })
        setAvatarsError(null)
      } else {
        setAvatarsError(response.message || "Failed to fetch avatars")
      }
    } catch (error: any) {
      if (error.message?.includes("Not Found") || error.message?.includes("404")) {
        setAvatarsError("Avatar API not yet implemented. Using fallback options.")
      } else {
        setAvatarsError(error.message || "Failed to load avatars")
      }
    } finally {
      setAvatarsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAvatars()
  }, [fetchAvatars])

  useEffect(() => {
    if (latestAvatarUpdate) {
      const isAvatarComplete =
        (latestAvatarUpdate.step === "complete" ||
          latestAvatarUpdate.step === "ready") &&
        latestAvatarUpdate.status === "success" &&
        (latestAvatarUpdate.data?.message?.toLowerCase().includes("avatar") ||
          latestAvatarUpdate.data?.message?.toLowerCase().includes("ready"))

      if (isAvatarComplete) {
        setTimeout(() => {
          fetchAvatars()
        }, 1000)
      }
    }
  }, [latestAvatarUpdate, fetchAvatars])

  // Helper functions for avatar
  const isAvatarPending = (avatar: Avatar) => {
    const isCustomAvatar = avatars.custom.some(
      (customAvatar) => customAvatar.avatar_id === avatar.avatar_id
    )
    return (
      isCustomAvatar &&
      (avatar.status === "pending" ||
        avatar.status === "processing" ||
        avatar.status === "creating")
    )
  }

  const getAvatarType = (avatar: Avatar): "custom" | "default" => {
    return avatars.custom.some(
      (customAvatar) => customAvatar.avatar_id === avatar.avatar_id
    )
      ? "custom"
      : "default"
  }

  const isAvatarTypeAllowed = (_avatar: Avatar): boolean => {
    return true
  }

  // Drag and drop handlers for avatar
  const handleDragStart = (e: React.DragEvent, avatar: Avatar) => {
    e.stopPropagation()
    setDraggedAvatar(avatar)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", avatar.avatar_id)
    const target = e.target as HTMLElement
    target.classList.add("dragging")
  }

  const handleDragEnd = (e: React.DragEvent) => {
    e.stopPropagation()
    const target = e.target as HTMLElement
    target.classList.remove("dragging")
    setDraggedAvatar(null)
  }

  const handleAvatarDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = "move"
    const target = e.currentTarget as HTMLElement
    target.classList.add("drag-over")
  }

  const handleAvatarDragLeave = (e: React.DragEvent) => {
    e.stopPropagation()
    const target = e.currentTarget as HTMLElement
    target.classList.remove("drag-over")
  }

  const handleAvatarDrop = (
    e: React.DragEvent,
    dropZone: "title" | "body" | "conclusion"
  ) => {
    e.preventDefault()
    e.stopPropagation()
    const target = e.currentTarget as HTMLElement
    target.classList.remove("drag-over")

    if (draggedAvatar) {
      if (!isAvatarTypeAllowed(draggedAvatar)) {
        setDraggedAvatar(null)
        return
      }

      setSelectedAvatars({
        title: draggedAvatar,
        body: null,
        conclusion: null,
      })

      const avatarId = draggedAvatar.avatar_id
      setValue("avatar", avatarId)
      trigger("avatar")
    }
    setDraggedAvatar(null)
  }

  const handleRemoveAvatar = (dropZone: "title" | "body" | "conclusion") => {
    setSelectedAvatars({
      title: null,
      body: null,
      conclusion: null,
    })

    setValue("avatar", "")
    trigger("avatar")
  }

  const handleClearAllAvatars = () => {
    setSelectedAvatars({
      title: null,
      body: null,
      conclusion: null,
    })
    setValue("avatar", "")
    trigger("avatar")
  }

  const handleAvatarClick = (avatar: Avatar) => {
    if (isAvatarPending(avatar)) {
      return
    }

    const isSelected = selectedAvatars.title?.avatar_id === avatar.avatar_id

    if (isSelected) {
      setSelectedAvatars({
        title: null,
        body: null,
        conclusion: null,
      })
      setValue("avatar", "")
      trigger("avatar")
    } else {
      if (!isAvatarTypeAllowed(avatar)) {
        return
      }

      setSelectedAvatars({
        title: avatar,
        body: null,
        conclusion: null,
      })
      setValue("avatar", avatar.avatar_id)
      trigger("avatar")
    }
  }

  const isAvatarSelected = (avatar: Avatar) => {
    return selectedAvatars.title?.avatar_id === avatar.avatar_id
  }

  const getAvatarSelectionNumber = (avatar: Avatar) => {
    return null
  }

  // Voice handlers
  const handleVoiceClick = (voice: Voice) => {
    setSelectedVoice(voice)
    setValue('voice', voice.id, { shouldValidate: true, shouldDirty: true })
    trigger('voice')
    setCurrentVoiceType(voice.type)
  }

  const handleVoiceDragStart = (e: React.DragEvent, voice: Voice) => {
    setDraggedVoice(voice)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', voice.id)
    const target = e.target as HTMLElement
    target.classList.add('dragging')
  }

  const handleVoiceDragEnd = (e: React.DragEvent) => {
    const target = e.target as HTMLElement
    target.classList.remove('dragging')
    setDraggedVoice(null)
  }

  const handleVoiceDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    const target = e.currentTarget as HTMLElement
    target.classList.add('drag-over')
  }

  const handleVoiceDragLeave = (e: React.DragEvent) => {
    e.stopPropagation()
    const target = e.currentTarget as HTMLElement
    target.classList.remove('drag-over')
  }

  const handleVoiceDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const target = e.currentTarget as HTMLElement
    target.classList.remove('drag-over')
    
    if (draggedVoice) {
      handleVoiceClick(draggedVoice)
    }
    setDraggedVoice(null)
  }

  const handleVoiceTypeChange = (type: VoiceType) => {
    setCurrentVoiceType(type)
  }

  // Music handlers
  const handleMusicClick = (music: Voice) => {
    setSelectedMusic(music)
    setValue('music', music.id, { shouldValidate: true })
    trigger('music')
  }

  const handleMusicDragStart = (e: React.DragEvent, music: Voice) => {
    setDraggedMusic(music)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', music.id)
    const target = e.target as HTMLElement
    target.classList.add('dragging')
  }

  const handleMusicDragEnd = (e: React.DragEvent) => {
    const target = e.target as HTMLElement
    target.classList.remove('dragging')
    setDraggedMusic(null)
  }

  const handleMusicDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    const target = e.currentTarget as HTMLElement
    target.classList.add('drag-over')
  }

  const handleMusicDragLeave = (e: React.DragEvent) => {
    e.stopPropagation()
    const target = e.currentTarget as HTMLElement
    target.classList.remove('drag-over')
  }

  const handleMusicDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const target = e.currentTarget as HTMLElement
    target.classList.remove('drag-over')
    
    if (draggedMusic) {
      handleMusicClick(draggedMusic)
    }
    setDraggedMusic(null)
  }

  const handleMusicTypeChange = (type: VoiceType) => {
    setCurrentMusicType(type as 'low' | 'medium' | 'high' | 'custom' | 'trending')
  }

  const handleCustomMusicUpload = (music: Voice) => {
    setCustomMusic((prev) => {
      const exists = prev.some(m => m.id === music.id || m._id === music.id || m._id === music._id)
      if (exists) return prev
      return [...prev, music]
    })
  }

  // Fetch trending music from backend API
  const handleTrendingMusicFetch = async (): Promise<Voice[]> => {
    try {
      // Get city from form
      const city = watch("city")?.trim()
      
      // Fetch trending music from backend with city parameter
      const response = await apiService.getTrendingMusic(city)
      
      if (response.success && response.data) {
        // Response format: { success: true, data: [{ musicUrl, musicName, artistName }, ...] }
        const musicData = Array.isArray(response.data) ? response.data : []
        
        // Transform to Voice format
        const transformedMusic: Voice[] = musicData.map((music: any, index: number) => {
          // Generate a unique ID from musicUrl or use index as fallback
          const musicId = music.musicUrl ? `trending-${music.musicUrl.split('/').pop() || index}` : `trending-${index}`
          
          return {
            id: musicId,
            _id: musicId,
            name: music.musicName || 'Unknown Track',
            artist: music.artistName || undefined,
            type: 'trending' as const,
            previewUrl: music.musicUrl, // Use musicUrl as preview
            preview_url: music.musicUrl,
            s3FullTrackUrl: music.musicUrl, // Full track URL
          }
        })
        
        return transformedMusic
      }
      
      return []
    } catch (error) {
      console.error('Error fetching trending music:', error)
      return []
    }
  }

  // Reset voice and music when gender changes
  const prevGenderRef = useRef<string | null>(null)
  
  useEffect(() => {
    const currentGender = gender && String(gender).trim().length > 0 ? String(gender).trim() : null
    
    if (currentGender && currentGender !== prevGenderRef.current) {
      setValue('preset', '', { shouldValidate: false, shouldDirty: false })
      setValue('voice', '', { shouldValidate: false, shouldDirty: false })
      setValue('music', '', { shouldValidate: false, shouldDirty: false })
      setCurrentVoiceType(null)
      setCurrentMusicType(null)
      setSelectedVoice(null)
      setSelectedMusic(null)
    }
    
    prevGenderRef.current = currentGender
  }, [gender, setValue])

  // Generate key points for topic
  const generateTopicKeyPoints = useCallback(async (topic: string) => {
    if (!topic || topic.trim() === '') {
      return
    }

    // Don't trigger API if value hasn't changed since last API call
    if (topic.trim() === lastApiTriggeredValue) {
      return
    }

    try {
      setKeyPointsLoading(true)
      setKeyPointsError(null)
      setValue('topicKeyPoints', '', { shouldValidate: false, shouldDirty: true })
      const response = await apiService.getDescriptionKeypoints(topic.trim())
      
      if (response.success && response.data) {
        const keypoints = response.data.keypoints || ''
        if (keypoints.trim()) {
          console.log('🎯 Auto-generated key points for topic:', keypoints)
          setValue('topicKeyPoints', keypoints, { shouldValidate: true, shouldDirty: true })
          trigger('topicKeyPoints')
        }
        setLastApiTriggeredValue(topic.trim())
      } else {
        setKeyPointsError(response.message || 'Failed to generate key points')
      }
    } catch (error: any) {
      console.error('Key points generation error:', error)
      setKeyPointsError(error.message || 'Failed to generate key points')
    } finally {
      setKeyPointsLoading(false)
    }
  }, [setValue, trigger, lastApiTriggeredValue])

  // Show errors when form submission is attempted
  useEffect(() => {
    if (submitAttempted && Object.keys(errors).length > 0 && !formManuallyTouched) {
      setFormManuallyTouched(true)
    }
  }, [errors, formManuallyTouched, submitAttempted])

  const handleDropdownToggle = (field: string) => {
    setOpenDropdown(openDropdown === field ? null : field)
  }

  const handleDropdownSelect = (field: string, value: string) => {
    if (field === "avatar") {
      setValue("avatar", value)
    } else {
      setValue(field as any, value)
    }
    setOpenDropdown(null)
    trigger(field as any)
  }

  // Handle topic input change
  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setValue('videoTopic', value, { shouldValidate: true, shouldDirty: true })
    setFormManuallyTouched(true)
    if (!value || !value.trim()) {
      setValue('topicKeyPoints', '', { shouldValidate: false, shouldDirty: true })
      setKeyPointsLoading(false)
      setKeyPointsError(null)
      setLastApiTriggeredValue('')
    }
  }

  // Handle topic blur - generate key points
  const handleTopicBlur = () => {
    const topicValue = watch('videoTopic')
    if (topicValue && topicValue.trim()) {
      generateTopicKeyPoints(topicValue)
    }
  }

  const handleFormFieldChange = () => {
    setFormManuallyTouched(true)
  }

  const onSubmit = async (data: AnimatedVideoFormData) => {
    if (!userEmail) {
      showNotification('User email not found. Please sign in again.', 'error')
      return
    }

    // Check video usage limit
    try {
      const usageCheck = await checkVideoUsageLimit()
      
      if (!usageCheck.canCreateVideo) {
        if (usageCheck.message?.includes('payment is still being processed')) {
          setPendingPaymentMessage(usageCheck.message)
          setShowPendingPaymentToast(true)
        } else if (usageCheck.message?.includes('No active subscription found') || usageCheck.message?.includes('Please subscribe')) {
          setSubscriptionRequiredMessage(usageCheck.message)
          setShowSubscriptionRequiredToast(true)
        } else {
          setUsageToastMessage(usageCheck.message || 'Video limit reached')
          setShowUsageToast(true)
        }
        return
      }
    } catch (error) {
      console.error('Failed to check video usage:', error)
      showNotification('Unable to verify subscription status. Please try again.', 'error')
      return
    }

    // Validate that videoTopic is provided
    if (!data.videoTopic || !data.videoTopic.trim()) {
      showNotification('Please enter a video topic', 'error')
      return
    }

    // Validate avatar is selected
    if (!selectedAvatars.title) {
      showNotification("Please select an avatar", "error")
      return
    }

    // Validate voice is selected
    if (!selectedVoice) {
      showNotification("Please select a voice", "error")
      return
    }

    // Validate music is selected
    if (!selectedMusic) {
      showNotification("Please select music", "error")
      return
    }

    try {
      // Convert topicKeyPoints string to array
      const keyPointsArray = data.topicKeyPoints
        ? data.topicKeyPoints
            .split(/[,\n]/)
            .map(point => point.trim())
            .filter(point => point.length > 0)
        : []

      // Map ghibli to editorial_infographic before sending
      const styleValue = data.style === 'ghibli' ? 'editorial_infographic' : data.style

      const payload = {
        title: data.title,
        avatar: selectedAvatars.title.avatar_id,
        gender: data.gender,
        voice: selectedVoice.id,
        music: selectedMusic.id || selectedMusic._id,
        musicUrl: selectedMusic.s3FullTrackUrl || '',
        city: data.city,
        videoTopic: data.videoTopic,
        topicKeyPoints: keyPointsArray,
        style: styleValue,
        socialHandles: data.socialHandles || '',
        email: userEmail,
        timestamp: new Date().toISOString(),
      }

      const result = await apiService.createAnimatedVideo(payload)

      if (!result.success) {
        throw new Error(result.message || 'Failed to create animated video')
      }

      // Store a key in localStorage to indicate video generation has started
      localStorage.setItem('videoGenerationStarted', JSON.stringify({
        timestamp: Date.now(),
          videoTitle: data.title || 'Animated Video'
      }))
      console.log('🎬 Animated video generation API called - localStorage key set')

      // Mark as fresh submission and open modal in loading state
      setIsFreshSubmission(true)
      setShouldStartLoading(true)
      setWebhookResponse(result.data)
      setIsModalOpen(true)
    } catch (error: any) {
      console.error('Error submitting animated form:', error)
      localStorage.removeItem('videoGenerationStarted')
      showNotification(error.message || 'Failed to create animated video', 'error')
    }
  }


  return (
    <>
      <form 
        onSubmit={handleSubmit(onSubmit, (errors) => {
          setSubmitAttempted(true)
          if (Object.keys(errors).length > 0) {
            setFormManuallyTouched(true)
            const firstError = Object.values(errors)[0]
            if (firstError && 'message' in firstError) {
              const errorMessage = firstError.message as string || 'Please fix form errors'
              showNotification(errorMessage, 'error')
            }
          }
        })} 
        className="space-y-7"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Title */}
          <div>
            <label className="block text-base font-normal text-[#5F5F5F] mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("title", { required: true })}
              placeholder="Enter title"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                }
              }}
              onChange={handleFormFieldChange}
              className={`w-full px-4 py-3 bg-[#F5F5F5] border-0 rounded-[8px] text-[18px] font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white transition-all duration-300 ${
                errors.title ? 'ring-2 ring-red-500' : ''
              }`}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Avatar */}
          <div className="avatar-dropdown-button">
            <label className="block text-base font-normal text-[#5F5F5F] mb-1">
              Avatar <span className="text-red-500">*</span>
            </label>
            <FormDropdown
              field="avatar"
              options={avatarOptions}
              placeholder="Select Option"
              currentValue={watch("avatar") || ""}
              isOpen={openDropdown === "avatar"}
              hasError={errors.avatar}
              register={register}
              errors={errors}
              onToggle={handleDropdownToggle}
              onSelect={handleDropdownSelect}
              onBlur={() => {}}
              isAvatarField={true}
              isFromDefaultAvatar={isFromDefaultAvatar}
              extendedAvatarOptions={extendedAvatarOptions}
              avatars={avatars}
              avatarsLoading={avatarsLoading}
              avatarsError={avatarsError}
              selectedAvatars={selectedAvatars}
              onFetchAvatars={fetchAvatars}
              onAvatarClick={handleAvatarClick}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleAvatarDragOver}
              onDragLeave={handleAvatarDragLeave}
              onDrop={handleAvatarDrop}
              onRemoveAvatar={handleRemoveAvatar}
              onClearAllAvatars={handleClearAllAvatars}
              isAvatarSelected={isAvatarSelected}
              isAvatarTypeAllowed={isAvatarTypeAllowed}
              isAvatarPending={isAvatarPending}
              getAvatarSelectionNumber={getAvatarSelectionNumber}
              getAvatarType={getAvatarType}
              isSingleSelection={true}
            />
          </div>

          {/* Gender */}
          <div className="relative">
            <label className="block text-base font-normal text-[#5F5F5F] mb-1">
              Gender <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => handleDropdownToggle('gender')}
              className={`w-full px-4 py-3 bg-[#F5F5F5] border-0 rounded-[8px] text-left transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white flex items-center justify-between cursor-pointer text-gray-800 ${
                errors.gender ? 'ring-2 ring-red-500' : ''
              }`}
            >
              <span>
                {watch("gender")
                  ? genderOptions.find((opt) => opt.value === watch("gender"))?.label || "Select Gender"
                  : "Select Gender"}
              </span>
              <IoMdArrowDropdown
                className={`w-4 h-4 transition-transform duration-300 ${
                  openDropdown === 'gender' ? "rotate-180" : ""
                }`}
                style={{ color: 'inherit' }}
              />
            </button>
            {errors.gender && (
              <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
            )}
            {openDropdown === 'gender' && (
              <div className="absolute z-[9999] top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-[8px] shadow-lg max-h-60 overflow-y-auto">
                {genderOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setValue("gender", option.value)
                      handleDropdownToggle('gender')
                      trigger("gender")
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-[#F5F5F5] transition-colors duration-200 text-[#282828] cursor-pointer"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* City */}
          {watch("gender") && (
            <div>
              <label className="block text-base font-normal text-[#5F5F5F] mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("city", { required: true })}
                placeholder="e.g. Los Angeles"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                  }
                }}
                onChange={handleFormFieldChange}
                className={`w-full px-4 py-3 bg-[#F5F5F5] border-0 rounded-[8px] text-[18px] font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white transition-all duration-300 ${
                  errors.city ? 'ring-2 ring-red-500' : ''
                }`}
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
              )}
            </div>
          )}

          {/* Music - Shows after gender is selected */}
          {watch("gender") && (
            <div>
              <label className="block text-base font-normal text-[#5F5F5F] mb-1">
                Music <span className="text-red-500">*</span>
              </label>
              <MusicSelectorWrapper
                field={"music" as any}
                placeholder="Select Music"
                watch={watch as any}
                register={register as any}
                errors={errors as any}
                trigger={trigger as any}
                openDropdown={openDropdown}
                selectedMusic={selectedMusic}
                musicList={[...(allMusic.length > 0 ? allMusic : musicList), ...customMusic]}
                musicLoading={musicLoading}
                musicError={musicError}
                preset={preset}
                initialMusicType={currentMusicType as 'low' | 'medium' | 'high' | 'trending' | null}
                hasTrending={true}
                trendingLabel="Trending Music"
                onTrendingMusicFetch={handleTrendingMusicFetch}
                cityName={watch("city")?.trim() || undefined}
                onToggle={handleDropdownToggle}
                onSelect={handleDropdownSelect}
                onMusicClick={handleMusicClick}
                onMusicTypeChange={handleMusicTypeChange}
                onDragStart={handleMusicDragStart}
                onDragEnd={handleMusicDragEnd}
                onDragOver={handleMusicDragOver}
                onDragLeave={handleMusicDragLeave}
                onDrop={handleMusicDrop}
                onCustomMusicUpload={handleCustomMusicUpload}
              />
              {errors.music && (
                <p className="text-red-500 text-sm mt-1">{errors.music.message}</p>
              )}
            </div>
          )}

          {/* Voice - Shows after gender is selected */}
          {watch("gender") && (
            <div>
              <label className="block text-base font-normal text-[#5F5F5F] mb-1">
                Voice <span className="text-red-500">*</span>
              </label>
              <VoiceSelectorWrapper
                field={"voice" as any}
                placeholder="Select Voice"
                watch={watch as any}
                register={register as any}
                errors={errors as any}
                trigger={trigger as any}
                openDropdown={openDropdown}
                selectedVoice={selectedVoice}
                voices={allVoices.length > 0 ? allVoices : voices}
                voicesLoading={voicesLoading}
                voicesError={voicesError}
                preset={preset}
                initialVoiceType={currentVoiceType}
                onToggle={handleDropdownToggle}
                onSelect={handleDropdownSelect}
                onVoiceClick={handleVoiceClick}
                onVoiceTypeChange={handleVoiceTypeChange}
                onDragStart={handleVoiceDragStart}
                onDragEnd={handleVoiceDragEnd}
                onDragOver={handleVoiceDragOver}
                onDragLeave={handleVoiceDragLeave}
                onDrop={handleVoiceDrop}
              />
              {errors.voice && (
                <p className="text-red-500 text-sm mt-1">{errors.voice.message}</p>
              )}
            </div>
          )}

          {/* Video Topic */}
          <div>
            <label className="block text-base font-normal text-[#5F5F5F] mb-1">
              Video Topic <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("videoTopic", { required: true })}
              placeholder="Enter your video topic"
              onChange={handleTopicChange}
              onBlur={handleTopicBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                }
              }}
              className={`w-full px-4 py-3 bg-[#F5F5F5] border-0 rounded-[8px] text-[18px] font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white transition-all duration-300 ${
                errors.videoTopic ? 'ring-2 ring-red-500' : ''
              }`}
            />
            {errors.videoTopic && (
              <p className="text-red-500 text-sm mt-1">{errors.videoTopic.message}</p>
            )}
            {keyPointsError && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1" role="alert">
                <AlertCircle className="w-4 h-4" />
                {keyPointsError.length > 50 ? `${keyPointsError.substring(0, 50)}...` : keyPointsError}
              </p>
            )}
          </div>

          {/* Topic Key Points */}
          <div>
            <label className="block text-base font-normal text-[#5F5F5F] mb-1">
              Topic Key Points <span className="text-red-500">*</span>
              {keyPointsLoading && (
                <span className="text-blue-600 text-sm ml-2">Generating key points...</span>
              )}
            </label>
            {(() => {
              const topicValue = watch('videoTopic')
              const placeholder = topicValue && topicValue.trim() ? 'Key points will generate' : 'Key points will generate'
              const shouldShowErrors = formManuallyTouched || submitAttempted
              const filteredErrors = shouldShowErrors ? errors : {}
              const error = filteredErrors['topicKeyPoints'] as any
              const { onChange: registerOnChange, ...registerProps } = register('topicKeyPoints')
              const currentValue = watch('topicKeyPoints') || ''
              const wordCount = (currentValue || '').trim().split(/\s+/).filter(Boolean).length
              const isShortContent = wordCount <= 3
              
              return (
                <div className="relative">
                  <textarea
                    {...registerProps}
                    placeholder={placeholder}
                    rows={isShortContent ? 1 : 2}
                    onChange={(e) => {
                      registerOnChange(e)
                      handleFormFieldChange()
                    }}
                    aria-describedby={error ? 'topicKeyPoints-error' : undefined}
                    aria-invalid={error ? 'true' : 'false'}
                    className={`w-full px-4 py-3 ${isShortContent ? 'text-[18px]' : 'text-[14px]'} font-normal placeholder:text-[#11101066] border-0 rounded-[8px] text-gray-800 transition-all duration-300 focus:outline-none focus:ring focus:ring-[#5046E5] focus:bg-white resize-none
                    ${error ? 'ring-2 ring-red-500' : ''}
                    bg-[#F5F5F5] hover:bg-white`}
                  />
                  {error?.message && (
                    <p
                      id="topicKeyPoints-error"
                      className="text-red-500 text-sm mt-1 flex items-center gap-1"
                      role="alert"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {typeof error.message === 'string' ? error.message : String(error.message)}
                    </p>
                  )}
                </div>
              )
            })()}
          </div>

          {/* Style */}
          <div className="relative">
            <label className="block text-base font-normal text-[#5F5F5F] mb-1">
              Style <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => handleDropdownToggle('style')}
              className={`w-full px-4 py-3 bg-[#F5F5F5] border-0 rounded-[8px] text-left transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white flex items-center justify-between cursor-pointer text-gray-800 ${
                errors.style ? 'ring-2 ring-red-500' : ''
              }`}
            >
              <span>
                {watch("style")
                  ? styleOptions.find((opt) => opt.value === watch("style"))?.label || "Select Style"
                  : "Select Style"}
              </span>
              <IoMdArrowDropdown
                className={`w-4 h-4 transition-transform duration-300 ${
                  openDropdown === 'style' ? "rotate-180" : ""
                }`}
                style={{ color: 'inherit' }}
              />
            </button>
            {errors.style && (
              <p className="text-red-500 text-sm mt-1">{errors.style.message}</p>
            )}
            {openDropdown === 'style' && (
              <div className="absolute z-[9999] top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-[8px] shadow-lg max-h-60 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {styleOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      // Store ghibli in form state (for display), but will map to editorial_infographic in payload
                      setValue("style", option.value)
                      handleDropdownToggle('style')
                      trigger("style")
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-[#F5F5F5] transition-colors duration-200 text-[#282828] cursor-pointer"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Social Handles */}
          <div>
            <label className="block text-base font-normal text-[#5F5F5F] mb-1">
              Social Handles <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("socialHandles", { required: true })}
              placeholder="e.g. @johnsmith, @facebook"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                }
              }}
              onChange={handleFormFieldChange}
              className={`w-full px-4 py-3 bg-[#F5F5F5] border-0 rounded-[8px] text-[18px] font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white transition-all duration-300 ${
                errors.socialHandles ? 'ring-2 ring-red-500' : ''
              }`}
            />
            {errors.socialHandles && (
              <p className="text-red-500 text-sm mt-1">{errors.socialHandles.message}</p>
            )}
          </div>
        </div>

        <SubmitButton
          isLoading={false}
          disabled={false}
          loadingText="Processing... This may take 30-50 seconds"
          buttonText="Submit"
        />
      </form>

      {openDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setOpenDropdown(null)
          }}
        />
      )}

      <CreateVideoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setShouldStartLoading(false)
          setIsFreshSubmission(false)
          setWebhookResponse(null)
        }}
        videoTitle={watch('title') || 'Animated Video'}
        webhookResponse={webhookResponse}
        mode="animated"
        startAtLoading={shouldStartLoading}
        isFreshSubmission={isFreshSubmission}
      />

      <UsageLimitToast
        isVisible={showUsageToast}
        message={usageToastMessage}
        onClose={() => setShowUsageToast(false)}
        onUpgrade={() => {
          console.log('User wants to upgrade subscription')
        }}
      />
      <PendingPaymentToast
        isVisible={showPendingPaymentToast}
        message={pendingPaymentMessage}
        context="video"
        onClose={() => setShowPendingPaymentToast(false)}
        onRefresh={async () => {
          try {
            const usageCheck = await checkVideoUsageLimit()
            if (usageCheck.canCreateVideo) {
              setShowPendingPaymentToast(false)
            } else if (usageCheck.message?.includes('payment is still being processed')) {
              setPendingPaymentMessage(usageCheck.message)
            } else {
              setShowPendingPaymentToast(false)
              setUsageToastMessage(usageCheck.message || 'Video limit reached')
              setShowUsageToast(true)
            }
          } catch (error) {
            console.error('Failed to refresh subscription status:', error)
          }
        }}
      />
      <SubscriptionRequiredToast
        isVisible={showSubscriptionRequiredToast}
        message={subscriptionRequiredMessage}
        context="video"
        onClose={() => setShowSubscriptionRequiredToast(false)}
        onSubscribe={() => {
          window.location.href = '/#pricing'
        }}
      />
    </>
  )
}

