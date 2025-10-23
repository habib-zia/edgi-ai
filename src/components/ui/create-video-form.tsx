'use client'

import { useState, useEffect, useCallback } from 'react'
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
  } | null>(null)
  const [isFromDefaultAvatar, setIsFromDefaultAvatar] = useState(false)
  const [avatars, setAvatars] = useState<{ custom: Avatar[], default: Avatar[] }>({ custom: [], default: [] })
  const [avatarsLoading, setAvatarsLoading] = useState(false)
  const [avatarsError, setAvatarsError] = useState<string | null>(null)
  
  // Real estate trends state
  const [trends, setTrends] = useState<Trend[]>([])
  const [trendsLoading, setTrendsLoading] = useState(false)
  const [trendsError, setTrendsError] = useState<string | null>(null)
  // Use schedule hook
  const { scheduleData: autoScheduleData, scheduleLoading, fetchSchedule } = useSchedule()
  const safeTrends = Array.isArray(trends) ? trends : []

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


  // Check if user came from Default Avatar button
  useEffect(() => {
    const source = searchParams.get('source')
    if (source === 'defaultAvatar') {
      setIsFromDefaultAvatar(true)
    }
  }, [searchParams])

  // Fetch real estate trends function
  const fetchTrends = useCallback(async () => {
    try {
      setTrendsLoading(true)
      setTrendsError(null)
      const response = await apiService.getRealEstateTrends()
      if (response.success && response.data) {
        const trendsData = response.data.trends || []
        
        if (Array.isArray(trendsData)) {
          setTrends(trendsData)
          setTrendsError(null)
        } else {
          console.error('Trends data is not an array:', trendsData)
          setTrendsError('Invalid trends data format')
          setTrends([])
        }
      } else {
        setTrendsError(response.message || 'Failed to fetch trends')
        setTrends([])
      }
    } catch (error: any) {
      console.error('Trends fetch error:', error)
      setTrendsError(error.message || 'Failed to load trends')
      setTrends([])
    } finally {
      setTrendsLoading(false)
    }
  }, [])

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
    fetchTrends()
    fetchSchedule()
  }, [fetchSchedule])

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

  // Helper function to check if avatar type is allowed based on existing selections
  const isAvatarTypeAllowed = (avatar: Avatar): boolean => {
    const avatarType = getAvatarType(avatar)
    const existingAvatars = [selectedAvatars.title, selectedAvatars.body, selectedAvatars.conclusion].filter(Boolean) as Avatar[]
    
    // If no avatars selected yet, any type is allowed
    if (existingAvatars.length === 0) {
      return true
    }
    
    // Check if all existing avatars are of the same type as the new avatar
    const firstAvatarType = getAvatarType(existingAvatars[0])
    return avatarType === firstAvatarType
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
      prompt: '',
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
      email: ''
    }
  })
  // User settings hook
  const { fetchUserSettings, saveUserSettings } = useUserSettings({
    userEmail: user?.email,
    avatars,
    setSelectedAvatars,
    setValue,
    trigger
  })

  // Auto-fill form when avatars are loaded and user has settings
  useEffect(() => {
    if (!avatarsLoading && (avatars.custom.length > 0 || avatars.default.length > 0) && user?.email) {
      setAutoFilling(true)
      fetchUserSettings().finally(() => {
        setAutoFilling(false)
        setIsFormReady(true)
      })
    } else if (!avatarsLoading && (avatars.custom.length > 0 || avatars.default.length > 0) && !user?.email) {
      // If avatars are loaded but no user email, form is ready
      setIsFormReady(true)
    }
  }, [avatarsLoading, avatars.custom.length, avatars.default.length, user?.email, fetchUserSettings])

  // Check if all data is loaded
  const isDataLoading = avatarsLoading || scheduleLoading || autoFilling || !isFormReady

  // Toggle schedule mode
  const handleToggleScheduleMode = () => {
    setIsScheduleMode(!isScheduleMode)
  }


  useEffect(() => {
    if (user?.email) {
      setValue('email', user.email)
    }
  }, [user?.email, setValue])

  const onSubmit = async (data: CreateVideoFormData) => {
    if (!selectedAvatars.title || !selectedAvatars.body || !selectedAvatars.conclusion) {
      dispatch(setVideoError('Please select 3 avatars before submitting'))
      return
    }

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
          preview_image_url: selectedAvatars.title.preview_image_url || selectedAvatars.title.imageUrl || ''
        },
        body: {
          avatar_id: selectedAvatars.body.avatar_id,
          avatar_name: selectedAvatars.body.avatar_name || selectedAvatars.body.name || '',
          preview_image_url: selectedAvatars.body.preview_image_url || selectedAvatars.body.imageUrl || ''
        },
        conclusion: {
          avatar_id: selectedAvatars.conclusion.avatar_id,
          avatar_name: selectedAvatars.conclusion.avatar_name || selectedAvatars.conclusion.name || '',
          preview_image_url: selectedAvatars.conclusion.preview_image_url || selectedAvatars.conclusion.imageUrl || ''
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
        email: webhookData?.email || data.email
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
        // Add the three selected avatars separately
        titleAvatar: selectedAvatars.title?.avatar_id || '',
        bodyAvatar: selectedAvatars.body?.avatar_id || '',
        conclusionAvatar: selectedAvatars.conclusion?.avatar_id || '',
        name: data.name,
        position: data.position,
        companyName: data.companyName,
        license: data.license,
        tailoredFit: data.tailoredFit,
        socialHandles: data.socialHandles,
        city: data.city,
        preferredTone: data.preferredTone,
        callToAction: data.callToAction,
        email: data.email
      }

      const userSettingsResult = await saveUserSettings(userSettingsPayload)
      if (!userSettingsResult.success) {
        console.error('Failed to store user settings:', userSettingsResult.error)
      } else {
        console.log('✅ User settings stored successfully with all avatar IDs')
      }

      setIsModalOpen(true)

      dispatch(clearVideoError())

      setTimeout(() => {
        reset()
      }, 100)
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
      } else if (field === 'videoTopic') {
      setValue('videoTopic', value)
      
      const selectedTrend = safeTrends.find(trend => trend.description === value)
      if (selectedTrend) {
        setValue('topicKeyPoints', selectedTrend.keypoints)
      }
      } else {
      setValue(field, value)
    }
      trigger(field)
    }, 50)
  }

  // Handle manual input for custom topics
  const handleManualInput = (field: keyof CreateVideoFormData, value: string) => {
    console.log('🎯 handleManualInput called:', { field, value })
    
    // Close dropdown first
    setOpenDropdown(null)
    
    // Use setTimeout to ensure the dropdown closes before setting values
    setTimeout(() => {
      if (field === 'videoTopic') {
        console.log('🎯 Setting custom videoTopic value:', value)
        setValue('videoTopic', value)
        
        // For custom topics, clear the key points field to allow manual input
        setValue('topicKeyPoints', '')
        console.log('🎯 Cleared topicKeyPoints for custom input - user can enter manually')
      } else {
      setValue(field, value)
    }
      trigger(field)
    }, 50)
  }
  const handleDropdownToggle = (field: keyof CreateVideoFormData) => {
    const isOpen = openDropdown === field
    
    if (isOpen) {
      const currentValue = watch(field)
      if (!currentValue || currentValue.trim() === '') {
        // Just trigger validation without clearing the field
        trigger(field)
        setValue(field, '', { shouldValidate: true })
      }
    }
    setOpenDropdown(isOpen ? null : field)
  }

  const renderDropdown = (
    field: keyof CreateVideoFormData,
    options: { value: string; label: string }[],
    placeholder: string
  ) => {
    const currentValue = watch(field)
    const isOpen = openDropdown === field
    const hasError = errors[field]

    return (
      <FormDropdown
        field={field}
        options={options}
        placeholder={placeholder}
        currentValue={currentValue}
        isOpen={isOpen}
        hasError={hasError}
        register={register}
        errors={errors}
        onToggle={handleDropdownToggle}
        onSelect={handleDropdownSelect}
        onBlur={(field) => trigger(field)}
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

  const renderTrendsDropdown = (
    field: keyof CreateVideoFormData,
    placeholder: string
  ) => {
    const currentValue = watch(field)
    const selectedTrend = safeTrends.find(trend => trend.description === currentValue)
    const isOpen = openDropdown === field
    const hasError = errors[field]
    

    return (
      <HybridTopicInput
        field={field}
        placeholder={placeholder}
        currentValue={currentValue}
        selectedTrend={selectedTrend}
        isOpen={isOpen}
        hasError={hasError}
        trendsLoading={trendsLoading}
        trendsError={trendsError}
        safeTrends={safeTrends}
        onToggle={handleDropdownToggle}
        onSelect={handleDropdownSelect}
        onBlur={(field) => trigger(field)}
        onRetry={fetchTrends}
        onManualInput={handleManualInput}
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

    return (
      <FormInput
        field={field}
          placeholder={placeholder}
        type={type}
          autoComplete={autoComplete}
        register={register}
        errors={errors}
          disabled={isDisabled}
      />
    )
  }

  return (
    <div className={`w-full max-w-[1260px] mx-auto ${className} relative`}>
      <FormLoadingOverlay
        avatarsLoading={isDataLoading}
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
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
              Prompt <span className="text-red-500">*</span>
            </label>
            {renderDropdown('prompt', promptOptions, 'Select Option')}
          </div>
          <div>
            <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
              Avatar <span className="text-red-500">*</span>
            </label>
            {renderDropdown('avatar', avatarOptions, 'Select Option')}
          </div>
          <div>
            <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            {renderInput('name', 'e.g. John Smith', 'text', 'name')}
          </div>
          <div>
            <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
              Position <span className="text-red-500">*</span>
            </label>
            {renderDropdown('position', positionOptions, 'Select Option')}
          </div>
        </div>
        <FormFieldRow
          fields={row2Fields}
          register={register}
          errors={errors}
          columns="4"
        />
        <FormFieldRow
          fields={row3Fields}
          register={register}
          errors={errors}
          columns="4"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
              Video Topic <span className="text-red-500">*</span>
            </label>
            {renderTrendsDropdown('videoTopic', 'Enter a topic or select a trend')}
          </div>

          <div>
            <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
              Topic Key Points <span className="text-red-500">*</span>
            </label>
            {(() => {
              const videoTopicValue = watch('videoTopic')
              const selectedTrend = safeTrends.find(trend => trend.description === videoTopicValue)
              const isCustomTopic = videoTopicValue && videoTopicValue.trim() && !selectedTrend
              const placeholder = isCustomTopic ? 'Enter topic key points' : 'Key points will auto-fill when topic is selected'
              return renderInput('topicKeyPoints', placeholder, 'text')
            })()}
          </div>
        </div>
        <AvatarSelectionStatus selectedAvatars={selectedAvatars} />
        <SubmitButton
          isLoading={isLoading}
          disabled={!selectedAvatars.title || !selectedAvatars.body || !selectedAvatars.conclusion}
          loadingText="Creating Video..."
          buttonText="Submit"
        />
      </form>
      )}
      {openDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            const currentValue = watch(openDropdown as keyof CreateVideoFormData)
            if (!currentValue || currentValue.trim() === '') {
              // Just trigger validation without clearing the field
              trigger(openDropdown as keyof CreateVideoFormData)
            }
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
        onClose={() => setShowConnectAccountsModal(false)}
        onNext={() => {setShowConnectAccountsModal(false)}}
        buttonText="Schedule Post"
        scheduleData={scheduleData}
        onCreatePost={(accounts, video) => {
          setShowConnectAccountsModal(false)
          // TODO: Implement post creation with schedule data
        }}
        onScheduleCreated={fetchSchedule}
      />
    </div>
  )
}
