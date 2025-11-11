'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, AlertCircle } from 'lucide-react'
import ScheduleInterface from './schedule-interface'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import { setVideoLoading, setVideoError, createVideoRequest, clearVideoError, VideoRequest } from '@/store/slices/videoSlice'
import CreateVideoModal from './create-video-modal'
import { apiService } from '@/lib/api-service'
import { useSearchParams } from 'next/navigation'
import { Avatar, Trend } from '@/lib/api-service'
import { useAvatarStorage, type SelectedAvatars } from '@/hooks/useAvatarStorage'
import { useSubscription } from '@/hooks/useSubscription'
import { useUserSettings } from '@/hooks/useUserSettings'
import { useSchedule } from '@/hooks/useSchedule'
import HybridTopicInput from './hybrid-topic-input'
import FormInput from './form-input'
import FormHeader from './form-header'
import FormFieldRow from './form-field-row'
import FormDropdown from './form-dropdown'
import SubmitButton from './submit-button'
import SchedulePostModal from './schedule-post-modal'
import ConnectAccountsModal from './connect-accounts-modal'
import FormLoadingOverlay from './form-loading-overlay'
import AvatarSelectionStatus from './avatar-selection-status'
import { row2Fields, row3Fields } from './form-field-configs'
import { createVideoSchema, type CreateVideoFormData } from './form-validation-schema'
import UsageLimitToast from './usage-limit-toast'
import PendingPaymentToast from './pending-payment-toast'
import SubscriptionRequiredToast from './subscription-required-toast'
import { useUnifiedSocketContext } from '../providers/UnifiedSocketProvider'
import VoiceSelectorWrapper from './voice-selector-wrapper'
import { Voice, VoiceType } from './voice-selector/types'
import MusicSelectorWrapper from './music-selector-wrapper'
import { useVoicesAndMusic } from '@/hooks/useVoicesAndMusic'
import { useNotificationStore } from './global-notification'

const promptOptions = [
  { value: 'Shawheen V1', label: 'Shawheen V1' },
]

// Original avatar options for simple dropdown
const avatarOptions = [
  { value: 'Gorilla-1', label: 'Gorilla 1' },
  { value: 'Shawheen', label: 'Shawheen' },
  { value: 'Verified HeyGen Avatar', label: 'Verified HeyGen Avatar' },
  { value: 'Varied', label: 'Varied' }
]

// Extended avatar options for big dropdown (includes all options)
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

const positionOptions = [
  { value: 'Real Estate Agent', label: 'Real Estate Agent' },
  { value: 'Real Estate Broker', label: 'Real Estate Broker' },
  { value: 'Loan Broker', label: 'Loan Broker' },
  { value: 'Loan Officer', label: 'Loan Officer' }
]

const presetOptions = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' }
]

const languageOptions = [
  { value: 'English', label: 'English' },
]

interface CreateVideoFormProps {
  className?: string
}

export default function CreateVideoForm({ className }: CreateVideoFormProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { isLoading, error } = useSelector((state: RootState) => state.video)
  const { user } = useSelector((state: RootState) => state.user)
  const searchParams = useSearchParams()
  const { latestAvatarUpdate } = useUnifiedSocketContext()
  const { saveSelectedAvatars } = useAvatarStorage()
  const { checkVideoUsageLimit } = useSubscription()

  const [showSuccessToast] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formDataForModal] = useState<CreateVideoFormData | null>(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showConnectAccountsModal, setShowConnectAccountsModal] = useState(false)
  const [scheduleData, setScheduleData] = useState<any>(null)
  const [autoFilling, setAutoFilling] = useState(false)
  const [isFormReady, setIsFormReady] = useState(false)
  const [isScheduleMode, setIsScheduleMode] = useState(false)
  const [webhookResponse, setWebhookResponse] = useState<{
    prompt?: string
    description?: string
    conclusion?: string
    company_name?: string
    social_handles?: string
    license?: string
    avatar?: string
    email?: string
    voice_id?: string
  } | null>(null)
  const [isFromDefaultAvatar, setIsFromDefaultAvatar] = useState(false)
  const [avatars, setAvatars] = useState<{ custom: Avatar[], default: Avatar[] }>({ custom: [], default: [] })
  const [avatarsLoading, setAvatarsLoading] = useState(false)
  const [avatarsError, setAvatarsError] = useState<string | null>(null)
  
  // City trends state
  const [cityTrends, setCityTrends] = useState<Trend[]>([])
  const [cityTrendsLoading, setCityTrendsLoading] = useState(false)
  const [cityTrendsError, setCityTrendsError] = useState<string | null>(null)
  const [lastFetchedCity, setLastFetchedCity] = useState<string | null>(null)
  const [lastFetchedPosition, setLastFetchedPosition] = useState<string | null>(null)
  const [missingFieldsError, setMissingFieldsError] = useState<string | null>(null)
  const [realEstateValidationError, setRealEstateValidationError] = useState<string | null>(null)
  // Use schedule hook
  const { scheduleData: autoScheduleData, scheduleLoading, fetchSchedule } = useSchedule()
  const safeCityTrends = Array.isArray(cityTrends) ? cityTrends : []
  
  // Use only city trends for the dropdown
  const allTrends = safeCityTrends

  // Drag and drop state
  const [selectedAvatars, setSelectedAvatars] = useState<{
    title: Avatar | null,
    body: Avatar | null,
    conclusion: Avatar | null
  }>({
    title: null,
    body: null,
    conclusion: null
  })
  const [draggedAvatar, setDraggedAvatar] = useState<Avatar | null>(null)
  
  // Usage limit toast state
  const [showUsageToast, setShowUsageToast] = useState(false)
  const [usageToastMessage, setUsageToastMessage] = useState('')
  
  // Pending payment toast state
  const [showPendingPaymentToast, setShowPendingPaymentToast] = useState(false)
  const [pendingPaymentMessage, setPendingPaymentMessage] = useState('')
  
  // Subscription required toast state
  const [showSubscriptionRequiredToast, setShowSubscriptionRequiredToast] = useState(false)
  const [subscriptionRequiredMessage, setSubscriptionRequiredMessage] = useState('')

  // Custom topic state
  const [showCustomTopicInput, setShowCustomTopicInput] = useState(false)
  const [customTopicValue, setCustomTopicValue] = useState('')
  
  // User settings loading state
  const [userSettingsLoaded, setUserSettingsLoaded] = useState(false)
  const [savedVideoTopic, setSavedVideoTopic] = useState<string | null>(null)
  
  // Custom topic key points generation state
  const [keyPointsLoading, setKeyPointsLoading] = useState(false)
  const [keyPointsError, setKeyPointsError] = useState<string | null>(null)
  
  // Track if form has been manually touched to avoid showing validation errors on prefilled forms
  const [formManuallyTouched, setFormManuallyTouched] = useState(false)
  // Track if form submission was attempted (using state to trigger re-renders)
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const { showNotification } = useNotificationStore()
  
  // Voice selection state
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null)
  const [draggedVoice, setDraggedVoice] = useState<Voice | null>(null)
  const [isVoiceManuallySelected, setIsVoiceManuallySelected] = useState(false)

  // Music selection state
  const [selectedMusic, setSelectedMusic] = useState<Voice | null>(null)
  const [draggedMusic, setDraggedMusic] = useState<Voice | null>(null)


  // Check if user came from Default Avatar button
  useEffect(() => {
    const source = searchParams.get('source')
    if (source === 'defaultAvatar') {
      setIsFromDefaultAvatar(true)
    }
  }, [searchParams])



  // Fetch avatars function - extracted to be reusable
  const fetchAvatars = useCallback(async () => {
    try {
      setAvatarsLoading(true)
      setAvatarsError(null)
      const response = await apiService.getAvatars()

      if (response.success) {
        // Handle both response structures: direct response or nested under data
        const avatarData = (response as any).data || response;

        const customAvatars = (avatarData as any).custom || (response as any).custom || [];
        const defaultAvatars = (avatarData as any).default || (response as any).default || [];
        

        setAvatars({
          custom: customAvatars,
          default: defaultAvatars
        })

        // Explicitly clear any previous errors
        setAvatarsError(null)
      } else {
        setAvatarsError(response.message || 'Failed to fetch avatars')
      }
    } catch (error: any) {
      // If API endpoint doesn't exist (404), show a more user-friendly message
      if (error.message?.includes('Not Found') || error.message?.includes('404')) {
        setAvatarsError('Avatar API not yet implemented. Using fallback options.')
      } else {
        setAvatarsError(error.message || 'Failed to load avatars')
      }
    } finally {
      setAvatarsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAvatars()
    fetchSchedule()
  }, [fetchAvatars, fetchSchedule])

  useEffect(() => {
    if (latestAvatarUpdate) {
      const isAvatarComplete = (latestAvatarUpdate.step === 'complete' || latestAvatarUpdate.step === 'ready') &&
        latestAvatarUpdate.status === 'success' &&
        (latestAvatarUpdate.data?.message?.toLowerCase().includes('avatar') ||
          latestAvatarUpdate.data?.message?.toLowerCase().includes('ready'))

      if (isAvatarComplete) {
        setTimeout(() => {
          fetchAvatars()
        }, 1000)
      }
    }
  }, [latestAvatarUpdate, fetchAvatars])

  // Helper function to check if avatar is pending
  const isAvatarPending = (avatar: Avatar) => {
    // Only check pending status for custom avatars, default avatars should always be selectable
    const isCustomAvatar = avatars.custom.some(customAvatar => customAvatar.avatar_id === avatar.avatar_id)
    return isCustomAvatar && (avatar.status === 'pending' || avatar.status === 'processing' || avatar.status === 'creating')
  }

  // Helper function to determine if avatar is custom or default
  const getAvatarType = (avatar: Avatar): 'custom' | 'default' => {
    return avatars.custom.some(customAvatar => customAvatar.avatar_id === avatar.avatar_id) ? 'custom' : 'default'
  }

  // All avatar types are allowed to mix (custom image, custom video, default)
  const isAvatarTypeAllowed = (_avatar: Avatar): boolean => {
      return true
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, avatar: Avatar) => {
    e.stopPropagation()
    setDraggedAvatar(avatar)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', avatar.avatar_id)

    // Add visual feedback to the dragged element
    const target = e.target as HTMLElement
    target.classList.add('dragging')
  }

  const handleDragEnd = (e: React.DragEvent) => {
    e.stopPropagation()
    // Remove visual feedback
    const target = e.target as HTMLElement
    target.classList.remove('dragging')
    setDraggedAvatar(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'

    // Add visual feedback to drop zone
    const target = e.currentTarget as HTMLElement
    target.classList.add('drag-over')
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation()
    // Remove visual feedback from drop zone
    const target = e.currentTarget as HTMLElement
    target.classList.remove('drag-over')
  }

  const handleDrop = (e: React.DragEvent, dropZone: 'title' | 'body' | 'conclusion') => {
    e.preventDefault()
    e.stopPropagation()

    // Remove visual feedback
    const target = e.currentTarget as HTMLElement
    target.classList.remove('drag-over')

    if (draggedAvatar) {
      // Check if avatar type is allowed based on existing selections
      if (!isAvatarTypeAllowed(draggedAvatar)) {
        setDraggedAvatar(null)
        return // Don't allow drop if avatar type doesn't match existing selections
      }

      setSelectedAvatars(prev => ({
        ...prev,
        [dropZone]: draggedAvatar
      }))

      // Update the form field with the selected avatar
      setValue('avatar', draggedAvatar.avatar_id)
      trigger('avatar')
    }
    setDraggedAvatar(null)
  }

  const handleRemoveAvatar = (dropZone: 'title' | 'body' | 'conclusion') => {


    setSelectedAvatars(prev => ({
      ...prev,
      [dropZone]: null
    }))

    // Update form field - use the first remaining avatar or clear if none
    const remainingAvatars = Object.values({
      ...selectedAvatars,
      [dropZone]: null
    }).filter(Boolean) as Avatar[]

    if (remainingAvatars.length > 0) {
      setValue('avatar', remainingAvatars[0].avatar_id)
    } else {
      setValue('avatar', '')
      console.log('🔄 Cleared form field - no avatars remaining')
    }
    trigger('avatar')
  }

  const handleClearAllAvatars = () => {
    setSelectedAvatars({
      title: null,
      body: null,
      conclusion: null
    })
    setValue('avatar', '')
    trigger('avatar')
  }

  // Voice handlers
  const handleVoiceClick = (voice: Voice) => {
    console.log('🎤 create-video-form - handleVoiceClick called:', voice.name, voice.id, voice.type)
    
    // Mark that user has manually selected a voice (prevents auto-select from overriding)
    setIsVoiceManuallySelected(true)
    
    // Update selected voice FIRST (this is the source of truth)
    setSelectedVoice(voice)
    
    // Then update form value to match selected voice
    setValue('voice', voice.id, { shouldValidate: true, shouldDirty: true })
    trigger('voice')
    
    // Update voice type to match selected voice
    setCurrentVoiceType(voice.type)
    
    // ALSO update music type and auto-select random music of same type (only if not custom)
    if (voice.type !== 'custom') {
      setCurrentMusicType(voice.type as 'low' | 'medium' | 'high')
    }
    const filteredMusic = allMusic.filter(m => m.type === voice.type)
    if (filteredMusic.length > 0) {
      const randomMusic = filteredMusic[Math.floor(Math.random() * filteredMusic.length)]
      setSelectedMusic(randomMusic)
      setValue('music', randomMusic.id, { shouldValidate: true })
      trigger('music')
    }
    
    console.log('🎤 create-video-form - Updated selectedVoice to:', voice.name, voice.id, 'Form value updated to:', voice.id)
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

  // Music handlers (reusing same structure as voice)
  const handleMusicClick = (music: Voice) => {
    // Ensure we're setting the correct music - use the music object passed from the click
    setSelectedMusic(music)
    setValue('music', music.id, { shouldValidate: true })
    trigger('music')
    // Don't sync voice - voice and music are independent
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

  // Click-to-select functionality - automatically assigns to drag & drop slots
  const handleAvatarClick = (avatar: Avatar) => {
    if (isAvatarPending(avatar)) {
      return // Don't allow selection of pending avatars
    }
    
    const isSelected = isAvatarSelected(avatar)
    
    if (isSelected) {
      // Remove from selection and clear corresponding drag & drop slot
      if (selectedAvatars.title?.avatar_id === avatar.avatar_id) {
        setSelectedAvatars(prev => ({ ...prev, title: null }))
      } else if (selectedAvatars.body?.avatar_id === avatar.avatar_id) {
        setSelectedAvatars(prev => ({ ...prev, body: null }))
      } else if (selectedAvatars.conclusion?.avatar_id === avatar.avatar_id) {
        setSelectedAvatars(prev => ({ ...prev, conclusion: null }))
      }
      
      // Update form field - use the first remaining avatar or clear if none
      const remainingAvatars = Object.values({
        ...selectedAvatars,
        title: selectedAvatars.title?.avatar_id === avatar.avatar_id ? null : selectedAvatars.title,
        body: selectedAvatars.body?.avatar_id === avatar.avatar_id ? null : selectedAvatars.body,
        conclusion: selectedAvatars.conclusion?.avatar_id === avatar.avatar_id ? null : selectedAvatars.conclusion
      }).filter(Boolean) as Avatar[]
      
      if (remainingAvatars.length > 0) {
        setValue('avatar', remainingAvatars[0].avatar_id)
      } else {
        setValue('avatar', '')
      }
      trigger('avatar')
    } else {
      // Check if avatar type is allowed based on existing selections
      if (!isAvatarTypeAllowed(avatar)) {
        return // Don't allow selection if avatar type doesn't match existing selections
      }
      
      // Check if we can add more avatars (max 3)
      const totalSelected = [selectedAvatars.title, selectedAvatars.body, selectedAvatars.conclusion].filter(Boolean).length
      
      if (totalSelected < 3) {
        // Auto-assign to next available slot
        if (!selectedAvatars.title) {
          setSelectedAvatars(prev => ({ ...prev, title: avatar }))
          setValue('avatar', avatar.avatar_id)
        } else if (!selectedAvatars.body) {
          setSelectedAvatars(prev => ({ ...prev, body: avatar }))
          setValue('avatar', avatar.avatar_id)
        } else if (!selectedAvatars.conclusion) {
          setSelectedAvatars(prev => ({ ...prev, conclusion: avatar }))
          setValue('avatar', avatar.avatar_id)
        }
        trigger('avatar')
      } else {
        console.log('🚫 Maximum avatars (3) already selected')
      }
    }
  }

  // Helper function to get selection number for an avatar (based on drag & drop slots)
  const getAvatarSelectionNumber = (avatar: Avatar) => {
    if (selectedAvatars.title?.avatar_id === avatar.avatar_id) return 1
    if (selectedAvatars.body?.avatar_id === avatar.avatar_id) return 2
    if (selectedAvatars.conclusion?.avatar_id === avatar.avatar_id) return 3
    return null
  }

  // Helper function to check if avatar is selected (unified check)
  const isAvatarSelected = (avatar: Avatar) => {
    return selectedAvatars.title?.avatar_id === avatar.avatar_id ||
           selectedAvatars.body?.avatar_id === avatar.avatar_id ||
           selectedAvatars.conclusion?.avatar_id === avatar.avatar_id
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    trigger
  } = useForm<CreateVideoFormData>({
    resolver: zodResolver(createVideoSchema),
    mode: 'onSubmit',
    defaultValues: {
      prompt: 'Shawheen V1',
      avatar: '',
      name: '',
      position: '',
      companyName: '',
      license: '',
      tailoredFit: '',
      socialHandles: '',
      videoTopic: '',
      topicKeyPoints: '',
      city: '',
      preferredTone: '',
      callToAction: '',
      email: '',
      preset: '',
      voice: '',
      music: '',
      language: '',
      gender: ''
    }
  })

  // Voice and Music state - using hook
  const preset = watch('preset')
  const gender = watch('gender') || null
  const {
    voices,  // Filtered voices based on preset
    voicesLoading,
    voicesError,
    musicList,  // Filtered music based on preset
    musicLoading,
    musicError,
    allVoices,  // All voices (low, medium, high)
    allMusic  // All music (low, medium, high)
  } = useVoicesAndMusic({
    preset,
    selectedAvatars,
    gender
  })
  
  // Track current filter type for voice/music dropdowns
  const [currentVoiceType, setCurrentVoiceType] = useState<VoiceType | null>(null)
  const [currentMusicType, setCurrentMusicType] = useState<'low' | 'medium' | 'high' | null>(null)

  // Mark form as manually touched when any form field changes
  const handleFormFieldChange = () => {
    setFormManuallyTouched(true)
  }
  
  // Show errors when form submission is attempted and validation fails
  useEffect(() => {
    if (submitAttempted && Object.keys(errors).length > 0 && !formManuallyTouched) {
      setFormManuallyTouched(true)
    }
  }, [errors, formManuallyTouched, submitAttempted])
  
  // User settings hook
  const { fetchUserSettings, saveUserSettings } = useUserSettings({
    userEmail: user?.email,
    avatars,
    setSelectedAvatars,
    setValue
  })

  // Generate key points for custom topic
  const generateCustomTopicKeyPoints = useCallback(async (description: string) => {
    if (!description || description.trim() === '') {
      return
    }

    try {
      setKeyPointsLoading(true)
      setKeyPointsError(null)
      // Clear topicKeyPoints field when API call starts
      setValue('topicKeyPoints', '', { shouldValidate: false, shouldDirty: true })
      const response = await apiService.getDescriptionKeypoints(description.trim())
      
      if (response.success && response.data) {
        const keypoints = response.data.keypoints || ''
        if (keypoints.trim()) {
          console.log('🎯 Auto-generated key points for custom topic:', keypoints)
          setValue('topicKeyPoints', keypoints, { shouldValidate: true, shouldDirty: true })
          trigger('topicKeyPoints')
        }
        // Set videoTopic field AFTER API confirmation
        setValue('videoTopic', description.trim(), { shouldValidate: true, shouldDirty: true })
      } else {
        setKeyPointsError(response.message || 'Failed to generate key points')
      }
    } catch (error: any) {
      console.error('Key points generation error:', error)
      setKeyPointsError(error.message || 'Failed to generate key points')
    } finally {
      setKeyPointsLoading(false)
    }
  }, [setValue, trigger])

  // Fetch city trends function
  const fetchCityTrends = useCallback(async (city: string, position?: string) => {
    const cityValue = city?.trim() || ''
    const positionValue = position?.trim() || watch('position')?.trim() || ''
    
    // Check if both city and position are provided
    if (!cityValue || !positionValue) {
      setCityTrends([])
      setLastFetchedCity(null)
      setLastFetchedPosition(null)
      setMissingFieldsError('Please select the position and city first')
      setCityTrendsError(null)
      return
    }

    // Clear missing fields error if both are present
    setMissingFieldsError(null)
    
    // Create cache key from both city and position
    const cacheKey = `${cityValue}|${positionValue}`
    const lastCacheKey = lastFetchedCity && lastFetchedPosition 
      ? `${lastFetchedCity}|${lastFetchedPosition}` 
      : null
    
    // Don't fetch if we already have trends for this city and position combination
    if (cacheKey === lastCacheKey) {
      return
    }

    try {
      setCityTrendsLoading(true)
      setCityTrendsError(null)
      setMissingFieldsError(null)
      const response = await apiService.getCityTrends(cityValue, positionValue)
      
      if (response.success && response.data) {
        const trendsData = response.data.trends || []
        
        if (Array.isArray(trendsData)) {
          setCityTrends(trendsData)
          setCityTrendsError(null)
          setMissingFieldsError(null)
          setRealEstateValidationError(null)
          setLastFetchedCity(cityValue)
          setLastFetchedPosition(positionValue)
          
          // Pre-select saved video topic if it exists in the fetched trends
          if (savedVideoTopic && savedVideoTopic.trim()) {
            const matchingTrend = trendsData.find(trend => trend.description === savedVideoTopic)
            if (matchingTrend) {
              console.log('🎯 Pre-selecting saved video topic from city trends:', savedVideoTopic)
              setValue('videoTopic', savedVideoTopic)
              setValue('topicKeyPoints', matchingTrend.keypoints)
              trigger('videoTopic')
            }
          }
        } else {
          console.error('City trends data is not an array:', trendsData)
          setCityTrendsError('Invalid city trends data format')
          setCityTrends([])
        }
      } else {
        const errorMessage = response.message || response.error || 'Failed to fetch city trends'
        
        // Check if this is a real estate validation error
        const isRealEstateValidationError = errorMessage.includes('must be related to real estate topics') ||
          errorMessage.includes('Required categories:') ||
          errorMessage.includes('Real Estate') ||
          errorMessage.includes('Examples include')
        
        if (isRealEstateValidationError) {
          setRealEstateValidationError(errorMessage)
          setCityTrendsError(null)
        } else {
          setCityTrendsError(errorMessage)
          setRealEstateValidationError(null)
        }
        setCityTrends([])
      }
    } catch (error: any) {
      console.error('City trends fetch error:', error)
      const errorMessage = error.message || 'Failed to load city trends'
      
      // Check if this is a real estate validation error
      const isRealEstateValidationError = errorMessage.includes('must be related to real estate topics') ||
        errorMessage.includes('Required categories:') ||
        errorMessage.includes('Real Estate') ||
        errorMessage.includes('Examples include')
      
      if (isRealEstateValidationError) {
        setRealEstateValidationError(errorMessage)
        setCityTrendsError(null)
      } else {
        setCityTrendsError(errorMessage)
        setRealEstateValidationError(null)
      }
      setCityTrends([])
    } finally {
      setCityTrendsLoading(false)
    }
  }, [lastFetchedCity, lastFetchedPosition, savedVideoTopic, setValue, trigger, watch])

  // Watch position changes and trigger city trends fetch
  const watchedPosition = watch('position')
  useEffect(() => {
    const cityValue = watch('city')
    if (watchedPosition && watchedPosition.trim() && cityValue && cityValue.trim()) {
      console.log('🏢 Position changed, fetching city trends with position:', watchedPosition)
      fetchCityTrends(cityValue, watchedPosition)
    } else if (watchedPosition && watchedPosition.trim()) {
      // Position is set but city is not - show error message
      setMissingFieldsError('Please select the position and city first')
    }
  }, [watchedPosition, fetchCityTrends, watch])

  // Auto-select random voice and music when preset is selected and data is loaded
  // ONLY if user hasn't manually selected a voice
  useEffect(() => {
    if (preset && allVoices.length > 0 && allMusic.length > 0 && !isVoiceManuallySelected) {
      const currentVoice = watch('voice')
      const currentMusic = watch('music')
      
      // Check if we need to auto-select based on preset
      const presetLower = preset.toLowerCase()
      const selectedVoiceType = selectedVoice?.type
      const selectedMusicType = selectedMusic?.type
      
      // Reset type filters when preset changes
      if (!currentVoiceType || currentVoiceType !== presetLower) {
        setCurrentVoiceType(presetLower as 'low' | 'medium' | 'high')
        setCurrentMusicType(presetLower as 'low' | 'medium' | 'high')
      }
      
      // Auto-select voice if not selected or if type doesn't match preset
      if (!currentVoice || (selectedVoiceType && selectedVoiceType !== presetLower)) {
        const matchingVoices = allVoices.filter(v => v.type === presetLower)
        if (matchingVoices.length > 0) {
          const randomVoice = matchingVoices[Math.floor(Math.random() * matchingVoices.length)]
          if (randomVoice) {
            setSelectedVoice(randomVoice)
            setValue('voice', randomVoice.id)
            trigger('voice')
          }
        }
      }
      
      // Auto-select music if not selected or if type doesn't match preset
      if (!currentMusic || (selectedMusicType && selectedMusicType !== presetLower)) {
        const matchingMusic = allMusic.filter(m => m.type === presetLower)
        if (matchingMusic.length > 0) {
          const randomMusic = matchingMusic[Math.floor(Math.random() * matchingMusic.length)]
          if (randomMusic) {
            setSelectedMusic(randomMusic)
            setValue('music', randomMusic.id)
            trigger('music')
          }
        }
      }
    }
  }, [preset, allVoices, allMusic, watch, setValue, trigger, selectedVoice, selectedMusic, currentVoiceType, isVoiceManuallySelected])
  
  // Handle voice type change from VoiceSelector (when user clicks low/medium/high buttons)
  const handleVoiceTypeChange = useCallback((type: VoiceType) => {
    console.log('🎤 create-video-form - handleVoiceTypeChange called with type:', type)
    
    // Mark that user has manually changed voice type (prevents auto-select from overriding)
    setIsVoiceManuallySelected(true)
    
    // Update voice type filter
    setCurrentVoiceType(type)
    
    // Filter voices - handle custom type specially
    if (type === 'custom') {
      // For custom voices, filter by isCustom property
      const filteredVoices = allVoices.filter(v => v.isCustom === true)
      if (filteredVoices.length > 0) {
        const randomVoice = filteredVoices[Math.floor(Math.random() * filteredVoices.length)]
        setSelectedVoice(randomVoice)
        setValue('voice', randomVoice.id, { shouldValidate: true })
        trigger('voice')
      }
      // Don't update music type for custom voices - keep current music type
    } else {
      // For low/medium/high, update music type to match voice type
      setCurrentMusicType(type)
      
      // Filter voices
      const filteredVoices = allVoices.filter(v => v.type === type)
      if (filteredVoices.length > 0) {
        const randomVoice = filteredVoices[Math.floor(Math.random() * filteredVoices.length)]
        setSelectedVoice(randomVoice)
        setValue('voice', randomVoice.id, { shouldValidate: true })
        trigger('voice')
      }
      
      // Filter music and auto-select random music of the same type
      const filteredMusic = allMusic.filter(m => m.type === type)
      if (filteredMusic.length > 0) {
        const randomMusic = filteredMusic[Math.floor(Math.random() * filteredMusic.length)]
        setSelectedMusic(randomMusic)
        setValue('music', randomMusic.id, { shouldValidate: true })
        trigger('music')
      }
    }
  }, [allVoices, allMusic, setValue, trigger])
  
  // Handle music type change from MusicSelector (when user clicks low/medium/high buttons)
  const handleMusicTypeChange = useCallback((type: VoiceType) => {
    // Music only supports low/medium/high, not custom
    if (type === 'custom') {
      return // Ignore custom type for music
    }
    // Update music type filter only (don't sync voice)
    setCurrentMusicType(type as 'low' | 'medium' | 'high')
    
    // Filter music
    const filteredMusic = allMusic.filter(m => m.type === type)
    
    // Auto-select random music from the filtered list
    if (filteredMusic.length > 0) {
      const randomMusic = filteredMusic[Math.floor(Math.random() * filteredMusic.length)]
      setSelectedMusic(randomMusic)
      setValue('music', randomMusic.id, { shouldValidate: true })
      trigger('music')
    } else {
      setSelectedMusic(null)
      setValue('music', '', { shouldValidate: true })
      trigger('music')
    }
  }, [allMusic, setValue, trigger])

  // Auto-fill form when avatars are loaded and user has settings
  useEffect(() => {
    if (!avatarsLoading && (avatars.custom.length > 0 || avatars.default.length > 0) && user?.email) {
      setAutoFilling(true)
      fetchUserSettings().then((result) => {
        // Auto-trigger city trends if city is loaded from settings
        if (result && !userSettingsLoaded) {
          const cityValue = watch('city')
          const videoTopicValue = watch('videoTopic')
          
          // Save the video topic for later pre-selection
          if (videoTopicValue && videoTopicValue.trim()) {
            setSavedVideoTopic(videoTopicValue)
          }
          
          // Auto-trigger city trends if both city and position exist
          const positionValue = watch('position')
          if (cityValue && cityValue.trim() && positionValue && positionValue.trim()) {
            console.log('🏙️ Auto-triggering city trends for saved city and position:', cityValue, positionValue)
            fetchCityTrends(cityValue, positionValue)
          }
          
          setUserSettingsLoaded(true)
        }
      }).finally(() => {
        setAutoFilling(false)
        setIsFormReady(true)
      })
    } else if (!avatarsLoading && (avatars.custom.length > 0 || avatars.default.length > 0) && !user?.email) {
      // If avatars are loaded but no user email, form is ready
      setIsFormReady(true)
    }
  }, [avatarsLoading, avatars.custom.length, avatars.default.length, user?.email, fetchUserSettings, userSettingsLoaded, watch])

  // Check if all data is loaded (used for other components)
  // const isDataLoading = avatarsLoading || scheduleLoading || autoFilling || !isFormReady

  // Toggle schedule mode
  const handleToggleScheduleMode = () => {
    setIsScheduleMode(!isScheduleMode)
  }


  useEffect(() => {
    if (user?.email) {
      setValue('email', user.email)
    }
  }, [user?.email, setValue])

  // Set default language to English if not set
  useEffect(() => {
    const currentLanguage = watch('language')
    if (!currentLanguage || currentLanguage.trim() === '') {
      setValue('language', 'English', { shouldValidate: false, shouldDirty: false })
    }
  }, [watch, setValue])

  // Reset preset, voice, and music fields when gender changes and APIs are called
  // Use a ref to track previous gender to avoid resetting on initial mount
  const prevGenderRef = useRef<string | null>(null)
  
  useEffect(() => {
    const currentGender = gender && String(gender).trim().length > 0 ? String(gender).trim() : null
    
    // Only reset if gender actually changed (not on initial mount when gender is set from user settings)
    if (currentGender && currentGender !== prevGenderRef.current) {
      console.log('🔄 Resetting preset, voice, and music fields due to gender change:', {
        previousGender: prevGenderRef.current,
        newGender: currentGender
      })
      setValue('preset', '', { shouldValidate: false, shouldDirty: false })
      setValue('voice', '', { shouldValidate: false, shouldDirty: false })
      setValue('music', '', { shouldValidate: false, shouldDirty: false })
      setCurrentVoiceType(null)
      setCurrentMusicType(null)
      // Also reset the selected voice and music state
      setSelectedVoice(null)
      setSelectedMusic(null)
      setIsVoiceManuallySelected(false)
    }
    
    // Update ref to track current gender
    prevGenderRef.current = currentGender
  }, [gender, setValue])

  // Focus custom topic input when it becomes visible
  useEffect(() => {
    if (showCustomTopicInput) {
      // Small delay to ensure the input is rendered
      setTimeout(() => {
        const customTopicInput = document.querySelector('input[placeholder="Enter your custom topic"]') as HTMLInputElement
        if (customTopicInput) {
          customTopicInput.focus()
        }
      }, 100)
    }
  }, [showCustomTopicInput])

  // Auto-dismiss error after 10 seconds
  useEffect(() => {
    if (error) {
      const timeoutId = setTimeout(() => {
        dispatch(clearVideoError())
      }, 10000) // 10 seconds
      
      return () => {
        clearTimeout(timeoutId)
      }
    }
  }, [error, dispatch])

  const onSubmit = async (data: CreateVideoFormData) => {
    console.log('selectedAvatars', selectedAvatars)
    if (!selectedAvatars.title || !selectedAvatars.body || !selectedAvatars.conclusion) {
      dispatch(setVideoError('Please select 3 avatars before submitting'))
      return
    }

     // Validate that either videoTopic or custom topic is provided
     if (showCustomTopicInput) {
       if (!customTopicValue.trim()) {
         dispatch(setVideoError('Please enter a custom topic'))
         return
       }
       // Use custom topic value for submission
       data.videoTopic = customTopicValue.trim()
     } else {
       // Ensure videoTopic is provided when not using custom topic
       if (!data.videoTopic || !data.videoTopic.trim()) {
         dispatch(setVideoError('Please select a video topic'))
         return
       }
     }

     // Set default prompt value if not provided (since field was removed from UI)
     if (!data.prompt || !data.prompt.trim()) {
       data.prompt = 'Shawheen V1'
     }

     // Debug: Log form data before submission
     console.log('🚀 Form submission starting...', {
       hasAvatars: !!(selectedAvatars.title && selectedAvatars.body && selectedAvatars.conclusion),
       hasVideoTopic: !!(data.videoTopic?.trim() || customTopicValue.trim()),
       prompt: data.prompt,
       formData: data
     })

    // Check video usage limit and payment status before proceeding
    try {
      const usageCheck = await checkVideoUsageLimit()
      
      if (!usageCheck.canCreateVideo) {
        // Check if it's a pending payment issue
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
      dispatch(setVideoError('Unable to verify subscription status. Please try again.'))
      return
    }

    // Save selected avatars using custom hook
    try {
      const avatarsToSave: SelectedAvatars = {
        title: {
          avatar_id: selectedAvatars.title.avatar_id,
          avatar_name: selectedAvatars.title.avatar_name || selectedAvatars.title.name || '',
          preview_image_url: selectedAvatars.title.preview_image_url || selectedAvatars.title.imageUrl || '',
          avatarType: selectedAvatars.title.avatarType || (selectedAvatars.title.preview_video_url ? 'video_avatar' : 'photo_avatar')
        },
        body: {
          avatar_id: selectedAvatars.body.avatar_id,
          avatar_name: selectedAvatars.body.avatar_name || selectedAvatars.body.name || '',
          preview_image_url: selectedAvatars.body.preview_image_url || selectedAvatars.body.imageUrl || '',
          avatarType: selectedAvatars.body.avatarType || (selectedAvatars.body.preview_video_url ? 'video_avatar' : 'photo_avatar')
        },
        conclusion: {
          avatar_id: selectedAvatars.conclusion.avatar_id,
          avatar_name: selectedAvatars.conclusion.avatar_name || selectedAvatars.conclusion.name || '',
          preview_image_url: selectedAvatars.conclusion.preview_image_url || selectedAvatars.conclusion.imageUrl || '',
          avatarType: selectedAvatars.conclusion.avatarType || (selectedAvatars.conclusion.preview_video_url ? 'video_avatar' : 'photo_avatar')
        }
      }
      
      saveSelectedAvatars(avatarsToSave)
    } catch (error) {
      console.error('Failed to save avatars:', error)
      dispatch(setVideoError('Failed to save avatar selection. Please try again.'))
      return
    }

    dispatch(setVideoLoading(true))
    try
    {
      // Make API call using apiService
      const result = await apiService.createVideo(data);

      if (!result.success)
      {
        throw new Error(result.message || 'Failed to create video');
      }

      // Extract webhook response data
      const webhookData = result.data.webhookResponse;

      // Use the original form data for fields that weren't returned by webhook
      const decodedResponse = {
        prompt: decodeURIComponent(webhookData?.hook || ''),
        description: decodeURIComponent(webhookData?.body || ''),
        conclusion: decodeURIComponent(webhookData?.conclusion || ''),
        company_name: webhookData?.company_name || webhookData?.companyName || data.companyName,
        social_handles: webhookData?.social_handles || webhookData?.socialHandles || data.socialHandles,
        license: webhookData?.license || data.license,
        avatar: webhookData?.avatar || data.avatar,
        email: webhookData?.email || data.email,
        voice_id: selectedVoice?.id || data.voice || '',
        music_url: selectedMusic?.s3FullTrackUrl || ''
      }
      setWebhookResponse(decodedResponse)

      // Create video request object for Redux
      const videoRequest: VideoRequest = {
        requestId: result.data.requestId,
        prompt: data.prompt,
        avatar: data.avatar,
        name: data.name,
        position: data.position,
        companyName: data.companyName,
        license: data.license,
        tailoredFit: data.tailoredFit,
        socialHandles: data.socialHandles,
        videoTopic: data.videoTopic,
        topicKeyPoints: data.topicKeyPoints,
        city: data.city,
        preferredTone: data.preferredTone,
        callToAction: data.callToAction,
        email: data.email,
        timestamp: result.data.timestamp,
        status: result.data.status,
        webhookResponse: result.data.webhookResponse
      }

      // Store in Redux (this will also save videoTopic to state)
      dispatch(createVideoRequest(videoRequest))

      // Call user-settings API to store video information
      const userSettingsPayload = {
        prompt: data.prompt,
        avatar: [
          selectedAvatars.title?.avatar_id || '',
          selectedAvatars.body?.avatar_id || '',
          selectedAvatars.conclusion?.avatar_id || ''
        ].filter(id => id !== ''), // Filter out empty strings
        // Add the three selected avatars separately with avatar_id and avatarType in single structure
        titleAvatar: {
          avatar_id: selectedAvatars.title?.avatar_id || '',
          avatarType: selectedAvatars.title?.avatarType || (selectedAvatars.title?.preview_video_url ? 'video_avatar' : 'photo_avatar')
        },
        bodyAvatar: {
          avatar_id: selectedAvatars.body?.avatar_id || '',
          avatarType: selectedAvatars.body?.avatarType || (selectedAvatars.body?.preview_video_url ? 'video_avatar' : 'photo_avatar')
        },
        conclusionAvatar: {
          avatar_id: selectedAvatars.conclusion?.avatar_id || '',
          avatarType: selectedAvatars.conclusion?.avatarType || (selectedAvatars.conclusion?.preview_video_url ? 'video_avatar' : 'photo_avatar')
        },
        name: data.name,
        position: data.position,
        language: data.language,
        preset: data.preset || '',
        companyName: data.companyName,
        license: data.license,
        tailoredFit: data.tailoredFit,
        socialHandles: data.socialHandles,
        city: data.city,
        preferredTone: data.preferredTone,
        callToAction: data.callToAction,
        email: data.email,
        gender: data.gender,
        voice: data.voice,
        selectedVoiceId: selectedVoice?.id || data.voice || '',
        selectedMusicTrackId: selectedMusic?._id || selectedMusic?.id || data.music || '',
        selectedVoicePreset: (selectedVoice as any)?.energy || selectedVoice?.type || '',
        selectedMusicPreset: (selectedMusic as any)?.energyCategory || selectedMusic?.type || ''
      }
      console.log('userSettingsPayload', userSettingsPayload)
      const userSettingsResult = await saveUserSettings(userSettingsPayload)
      if (!userSettingsResult.success) {
        console.error('Failed to store user settings:', userSettingsResult.error)
      } else {
        console.log('✅ User settings stored successfully with all avatar IDs')
      }

      setIsModalOpen(true)

      dispatch(clearVideoError())

      // Note: Form fields are NOT reset to preserve user data for next submission
      // setTimeout(() => {
      //   reset()
      // }, 100)
    } catch (error: any) {
      dispatch(setVideoError(error.message || 'Failed to create video'))
    } finally {
      dispatch(setVideoLoading(false))
    }
  }

  const handleDropdownSelect = (field: keyof CreateVideoFormData, value: string) => {
    setOpenDropdown(null)
    setTimeout(() => {
      if (field === 'avatar') {
        setValue('avatar', '')
      setValue('avatar', value)
      } else if (field === 'gender') {
        // When gender is selected, update the form value
        // The useVoicesAndMusic hook will automatically detect the change and trigger API calls
        console.log('🎵 Gender selected from dropdown:', value)
        setValue('gender', value, { shouldValidate: true, shouldDirty: true })
        trigger('gender')
        // Force re-render by updating the watched value
        // The watch('gender') in the hook will detect this change
      } else if (field === 'voice') {
        const voice = voices.find(v => v.id === value)
        if (voice) {
          // Mark that user has manually selected a voice (prevents auto-select from overriding)
          setIsVoiceManuallySelected(true)
          setSelectedVoice(voice)
          // Don't sync music - voice and music are independent
        }
        setValue('voice', value)
        trigger('voice')
      } else if (field === 'music') {
        const music = musicList.find(m => m.id === value)
        if (music) {
          setSelectedMusic(music)
          // Don't sync voice - voice and music are independent
        }
        setValue('music', value)
        trigger('music')
      } else if (field === 'videoTopic') {
      setValue('videoTopic', value, { shouldValidate: true, shouldDirty: true })
      
      // Hide custom topic field when a trend is selected
      setShowCustomTopicInput(false)
      setCustomTopicValue('')
      
      // Clear key points loading and error states
      setKeyPointsLoading(false)
      setKeyPointsError(null)
      
      const selectedTrend = allTrends.find(trend => trend.description === value)
      if (selectedTrend) {
        setValue('topicKeyPoints', selectedTrend.keypoints, { shouldValidate: true, shouldDirty: true })
      }
      } else {
      setValue(field, value)
    }
      trigger(field)
    }, 50)
  }


   // Handle custom topic button click
   const handleCustomTopicClick = () => {
     setShowCustomTopicInput(true)
     setCustomTopicValue('')
     // Close the Video Topic dropdown immediately
     setOpenDropdown(null)
     // Clear the Video Topic field value
     setValue('videoTopic', '', { shouldValidate: false, shouldDirty: true })
     // Clear the topic key points when switching to custom mode
     setValue('topicKeyPoints', '', { shouldValidate: false, shouldDirty: true })
   }

  // Handle custom topic input change
  const handleCustomTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCustomTopicValue(value)
    // Mark form as manually touched
    setFormManuallyTouched(true)
    if (!value || !value.trim()) {
      setValue('topicKeyPoints', '', { shouldValidate: false, shouldDirty: true })
      setKeyPointsLoading(false)
      setKeyPointsError(null)
    }
  }

  // Handle custom topic blur - generate key points
  const handleCustomTopicBlur = () => {
    if (customTopicValue && customTopicValue.trim()) {
      // Don't update videoTopic immediately - wait for API confirmation
      generateCustomTopicKeyPoints(customTopicValue)
    }
  }

  const handleDropdownToggle = (field: keyof CreateVideoFormData) => {
    const isOpen = openDropdown === field
    setOpenDropdown(isOpen ? null : field)
  }

  const renderDropdown = (
    field: keyof CreateVideoFormData,
    options: { value: string; label: string }[],
    placeholder: string
  ) => {
    const currentValue = watch(field) || ''
    const isOpen = openDropdown === field
    // Filter errors for consistency - only show errors after manual interaction or submit attempt
    // Check both formManuallyTouched and submitAttempted to ensure errors show on first submit
    const shouldShowErrors = formManuallyTouched || submitAttempted
    const filteredErrors = shouldShowErrors ? errors : {}
    const hasError = filteredErrors[field]

    return (
      <FormDropdown
        field={field}
        options={options}
        placeholder={placeholder}
        currentValue={currentValue}
        isOpen={isOpen}
        hasError={hasError}
        register={register}
        errors={filteredErrors}
        onToggle={handleDropdownToggle}
        onSelect={handleDropdownSelect}
        onBlur={() => {}}
        // Avatar-specific props
        isAvatarField={field === 'avatar'}
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
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onRemoveAvatar={handleRemoveAvatar}
        onClearAllAvatars={handleClearAllAvatars}
        isAvatarSelected={isAvatarSelected}
        isAvatarTypeAllowed={isAvatarTypeAllowed}
        isAvatarPending={isAvatarPending}
        getAvatarSelectionNumber={getAvatarSelectionNumber}
        getAvatarType={getAvatarType}
      />
    )
  }

  const renderVoiceSelector = (
    field: keyof CreateVideoFormData,
    placeholder: string
  ) => {
    // Pass ALL voices to VoiceSelector - it will filter internally based on voiceType
    // VoiceSelector has its own voiceType state that controls filtering
    // Filter errors for consistency - only show errors after manual interaction or submit attempt
    // Check both formManuallyTouched and submitAttempted to ensure errors show on first submit
    const shouldShowErrors = formManuallyTouched || submitAttempted
    const filteredErrors = shouldShowErrors ? errors : {}
    return (
      <VoiceSelectorWrapper
        field={field}
        placeholder={placeholder}
        watch={watch}
        register={register}
        errors={filteredErrors}
        trigger={trigger}
        openDropdown={openDropdown}
        selectedVoice={selectedVoice}
        voices={allVoices.length > 0 ? allVoices : voices}  // Pass all voices, let VoiceSelector filter
        voicesLoading={voicesLoading}
        voicesError={voicesError}
        preset={preset}
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
    )
  }

  const renderMusicSelector = (
    field: keyof CreateVideoFormData,
    placeholder: string
  ) => {
    // Pass ALL music to MusicSelector - it will filter internally based on voiceType (used for music too)
    // VoiceSelector component (used for music) has its own voiceType state that controls filtering
    // Filter errors for consistency - only show errors after manual interaction or submit attempt
    // Check both formManuallyTouched and submitAttempted to ensure errors show on first submit
    const shouldShowErrors = formManuallyTouched || submitAttempted
    const filteredErrors = shouldShowErrors ? errors : {}
    return (
      <MusicSelectorWrapper
        field={field}
        placeholder={placeholder}
        watch={watch}
        register={register}
        errors={filteredErrors}
        trigger={trigger}
        openDropdown={openDropdown}
        selectedMusic={selectedMusic}
        musicList={allMusic.length > 0 ? allMusic : musicList}  // Pass all music, let VoiceSelector filter
        musicLoading={musicLoading}
        musicError={musicError}
        preset={preset}
        onToggle={handleDropdownToggle}
        onSelect={handleDropdownSelect}
        onMusicClick={handleMusicClick}
        onMusicTypeChange={handleMusicTypeChange}
        onDragStart={handleMusicDragStart}
        onDragEnd={handleMusicDragEnd}
        onDragOver={handleMusicDragOver}
        onDragLeave={handleMusicDragLeave}
        onDrop={handleMusicDrop}
      />
    )
  }

  const renderTrendsDropdown = (
    field: keyof CreateVideoFormData,
    placeholder: string
  ) => {
    const currentValue = watch(field)
    
    // Filter layer: Only show dropdown value if it exists in the options
    const isValidDropdownValue = allTrends.some(trend => trend.description === currentValue)
    const displayValue = isValidDropdownValue ? currentValue : ''
    
    const selectedTrend = allTrends.find(trend => trend.description === displayValue)
    const isOpen = openDropdown === field
    // Filter errors for consistency - only show errors after manual interaction or submit attempt
    // Check both formManuallyTouched and submitAttempted to ensure errors show on first submit
    const shouldShowErrors = formManuallyTouched || submitAttempted
    const filteredErrors = shouldShowErrors ? errors : {}
    // Hide error for videoTopic when custom topic input is shown
    const hasError = showCustomTopicInput && field === 'videoTopic' ? null : filteredErrors[field]
    
    // Use only city trends loading states
    const isLoading = cityTrendsLoading
    // Show missing fields error in videoTopic dropdown
    const combinedError = field === 'videoTopic' && missingFieldsError 
      ? missingFieldsError 
      : cityTrendsError

    // Check if both city and position are filled to show "Add Custom Topic" button
    const cityValue = watch('city')
    const positionValue = watch('position')
    const canShowCustomTopic = cityValue && cityValue.trim() && positionValue && positionValue.trim()

    return (
      <HybridTopicInput
        field={field}
        placeholder={placeholder}
        currentValue={displayValue || ''}
        selectedTrend={selectedTrend}
        isOpen={isOpen}
        hasError={hasError}
        trendsLoading={isLoading}
        trendsError={combinedError}
        safeTrends={allTrends}
        onToggle={handleDropdownToggle}
        onSelect={handleDropdownSelect}
        onBlur={() => {}}
        onRetry={() => {
          if (cityValue && cityValue.trim() && positionValue && positionValue.trim()) {
            fetchCityTrends(cityValue, positionValue)
          }
        }}
        onCustomTopicClick={canShowCustomTopic ? handleCustomTopicClick : undefined}
      />
    )
  }

  const renderInput = (
    field: keyof CreateVideoFormData,
    placeholder: string,
    type: string = 'text',
    autoComplete?: string
  ) => {
    const isDisabled = field === 'email'
    
    // Filter errors for prefilled forms - only show errors after manual interaction or submit attempt
    // Check both formManuallyTouched and submitAttempted to ensure errors show on first submit
    const shouldShowErrors = formManuallyTouched || submitAttempted
    const filteredErrors = shouldShowErrors ? errors : {}

    return (
      <FormInput
        field={field}
          placeholder={placeholder}
        type={type}
          autoComplete={autoComplete}
        register={register}
        errors={filteredErrors}
          disabled={isDisabled}
          onChange={handleFormFieldChange}
      />
    )
  }

  return (
    <div className={`w-full max-w-[1260px] mx-auto ${className} relative`}>
      <FormLoadingOverlay
        avatarsLoading={avatarsLoading}
        autoFilling={autoFilling}
        isFormReady={isFormReady}
        hasUserEmail={!!user?.email}
      />
      <FormHeader
        title="Fill the details to create video"
        onSchedulePost={() => setShowScheduleModal(true)}
        userEmail={user?.email}
        isScheduleMode={isScheduleMode}
        onToggleScheduleMode={handleToggleScheduleMode}
      />
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-green-800 font-semibold">Success!</h3>
              <p className="text-green-700 text-sm">Your video request has been submitted successfully.</p>
            </div>
          </div>
        </div>
      )}
        {isScheduleMode ? (
          <ScheduleInterface 
            onStartScheduling={() => setShowScheduleModal(true)} 
            autoScheduleData={autoScheduleData}
            onScheduleDeleted={fetchSchedule}
          />
        ) : (
      <form onSubmit={handleSubmit(onSubmit, (errors) => {
        try {
          const summarized = Object.fromEntries(
            Object.entries(errors).map(([key, value]) => [key, (value as any)?.message || ''])
          )
          console.log('Form errors summary:', summarized)
        } catch {
          // no-op
        }
        setSubmitAttempted(true)
        if (Object.keys(errors).length > 0) {
          setFormManuallyTouched(true)
          const firstError = Object.values(errors)[0]
          if (firstError && 'message' in firstError) {
            const errorMessage = firstError.message as string || 'Please fix form errors'
            showNotification(errorMessage, 'error')
            dispatch(setVideoError(errorMessage))
          }
        }
      })} className="space-y-7">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="text-red-800 font-semibold">Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            {renderInput('name', 'e.g. John Smith', 'text', 'name')}
          </div>
          <div>
            <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
              Avatar <span className="text-red-500">*</span>
            </label>
            {renderDropdown('avatar', avatarOptions, 'Select Option')}
          </div>
          <div>
            <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
              Position <span className="text-red-500">*</span>
            </label>
            {renderDropdown('position', positionOptions, 'Select Option')}
          </div>
          <div>
            <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
              Company Name <span className="text-red-500">*</span>
            </label>
            {renderInput('companyName', 'e.g. Keller Williams', 'text', 'organization')}
          </div>
        </div>
        <FormFieldRow
          fields={row2Fields}
          register={register}
          errors={errors}
          columns="4"
          watch={watch}
          trigger={trigger}
          openDropdown={openDropdown}
          onDropdownToggle={(field: string) => handleDropdownToggle(field as keyof CreateVideoFormData)}
          onDropdownSelect={(field: string, value: string) => handleDropdownSelect(field as keyof CreateVideoFormData, value)}
        />
        <FormFieldRow
          fields={row3Fields}
          register={register}
          errors={errors}
          columns="4"
          watch={watch}
          trigger={trigger}
          openDropdown={openDropdown}
          onDropdownToggle={(field: string) => handleDropdownToggle(field as keyof CreateVideoFormData)}
          onDropdownSelect={(field: string, value: string) => handleDropdownSelect(field as keyof CreateVideoFormData, value)}
          onCityBlur={(city: string) => {
            const positionValue = watch('position')
            fetchCityTrends(city, positionValue)
          }}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
            <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
              Preset <span className="text-red-500">*</span>
            </label>
            {renderDropdown('preset', presetOptions, 'Select Preset')}
          </div>
          {/* Voice field - only shown when preset is selected */}
          {watch('preset') && (
            <div>
              <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
                Voice <span className="text-red-500">*</span>
              </label>
              {renderVoiceSelector('voice', 'Select Voice')}
            </div>
          )}
          {/* Music dropdown - only shown when a voice is selected */}
          {selectedVoice && (
            <div>
              <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
                Music
              </label>
              {renderMusicSelector('music', 'Select Music')}
            </div>
          )}
           <div>
            <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
              Language <span className="text-red-500">*</span>
            </label>
            {renderDropdown('language', languageOptions, 'Select Language')}
          </div>

          <div>
            <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
              Video Topic <span className="text-red-500">*</span>
            </label>
            {renderTrendsDropdown('videoTopic', 'Select a trend')}
          </div>

          {showCustomTopicInput && (
            <div>
              <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
                Custom Topic <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customTopicValue}
                onChange={handleCustomTopicChange}
                onBlur={handleCustomTopicBlur}
                placeholder="Enter your custom topic"
                className={`w-full px-4 py-[10.5px] text-[18px] font-normal bg-[#EEEEEE] hover:bg-[#F5F5F5] border-0 rounded-[8px] text-left transition-all duration-300 focus:outline-none focus:ring focus:ring-[#5046E5] focus:bg-white text-gray-800 ${!customTopicValue.trim() && formManuallyTouched ? 'ring-2 ring-red-500' : ''}`}
              />
               {!customTopicValue.trim() && formManuallyTouched && (
                 <p className="text-red-500 text-sm mt-1 flex items-center gap-1" role="alert">
                   <AlertCircle className="w-4 h-4" />
                   Please enter a custom topic
                 </p>
               )}
            </div>
          )}

          <div>
            <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
              Topic Key Points <span className="text-red-500">*</span>
              {keyPointsLoading && showCustomTopicInput && (
                <span className="text-blue-600 text-sm ml-2">Generating key points...</span>
              )}
            </label>
            {(() => {
              const isCustomTopic = showCustomTopicInput && customTopicValue && customTopicValue.trim()
              const placeholder = isCustomTopic ? 'Key points will auto-generate when you finish typing' : 'Key points will auto-fill when topic is selected'
              return renderInput('topicKeyPoints', placeholder, 'text')
            })()}
            {keyPointsError && showCustomTopicInput && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1" role="alert">
                <AlertCircle className="w-4 h-4" />
                {keyPointsError.length > 50 ? `${keyPointsError.substring(0, 50)}...` : keyPointsError}
              </p>
            )}
          </div>
        </div>
        <AvatarSelectionStatus selectedAvatars={selectedAvatars} />
         <SubmitButton
           isLoading={isLoading}
           disabled={
             !selectedAvatars.title || 
             !selectedAvatars.body || 
             !selectedAvatars.conclusion ||
             (!watch('videoTopic')?.trim() && !customTopicValue.trim()) ||
             !watch('preset') ||
             !watch('voice') ||
             !watch('music') ||
             !watch('language')
           }
           loadingText="This Proccess will take up to 30-50 seconds"
           buttonText="Submit"
         />
      </form>
      )}
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
          setWebhookResponse(null) // Clear webhookResponse when modal closes
        }}
        videoTitle={formDataForModal?.prompt || 'Custom Video'}
        webhookResponse={webhookResponse}
      />
      <UsageLimitToast
        isVisible={showUsageToast}
        message={usageToastMessage}
        onClose={() => setShowUsageToast(false)}
        onUpgrade={() => {
          // Handle upgrade action
          console.log('User wants to upgrade subscription')
        }}
      />
      <PendingPaymentToast
        isVisible={showPendingPaymentToast}
        message={pendingPaymentMessage}
        context="video"
        onClose={() => setShowPendingPaymentToast(false)}
        onRefresh={async () => {
          // Refresh subscription status
          try {
            const usageCheck = await checkVideoUsageLimit()
            if (usageCheck.canCreateVideo) {
              setShowPendingPaymentToast(false)
              // Optionally show success message
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
          // Redirect to pricing page or scroll to pricing section
          window.location.href = '/#pricing'
        }}
      />
      <SchedulePostModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onNext={(scheduleData) => {
          console.log('Schedule data:', scheduleData)
          setScheduleData(scheduleData)
          setShowScheduleModal(false)
          setShowConnectAccountsModal(true)
        }}
      />
      <ConnectAccountsModal
        isOpen={showConnectAccountsModal}
        onClose={() => { fetchSchedule(); setShowConnectAccountsModal(false) }}
        onNext={() => { setShowConnectAccountsModal(false) }}
        buttonText="Schedule Post"
        scheduleData={scheduleData}
        onCreatePost={() => {
          setShowConnectAccountsModal(false)
          // TODO: Implement post creation with schedule data
        }}
        onScheduleCreated={fetchSchedule}
      />
    </div>
  )
}
