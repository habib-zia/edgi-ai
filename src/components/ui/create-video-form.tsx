'use client'

import { useState, useEffect, useCallback } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, AlertCircle, RefreshCw } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import { setVideoLoading, setVideoError, createVideoRequest, clearVideoError, VideoRequest } from '@/store/slices/videoSlice'
import CreateVideoModal from './create-video-modal'
import { apiService } from '@/lib/api-service'
import Image from 'next/image'
// ...existing code...
import { IoMdArrowDropdown } from "react-icons/io";
import { useSearchParams } from 'next/navigation'
import { Avatar } from '@/lib/api-service'
import { usePhotoAvatarNotificationContext } from '@/components/providers/PhotoAvatarNotificationProvider'


// Zod validation schema
const createVideoSchema = z.object({
  prompt: z.string().min(1, 'Please select a prompt option'),
  avatar: z.string().min(1, 'Please select an avatar'),
  name: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces'),
  position: z.string().min(1, 'Please select a position'),
  companyName: z.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be less than 100 characters'),
  license: z.string()
    .min(2, 'License must be at least 2 characters')
    .max(50, 'License must be less than 50 characters'),
  tailoredFit: z.string()
    .min(2, 'Tailored fit must be at least 2 characters')
    .max(200, 'Tailored fit must be less than 200 characters'),
  socialHandles: z.string()
    .min(2, 'Social handles must be at least 2 characters')
    .max(200, 'Social handles must be less than 200 characters'),
  videoTopic: z.string()
    .min(2, 'Video topic must be at least 2 characters')
    .max(200, 'Video topic must be less than 200 characters'),
  topicKeyPoints: z.string()
    .min(2, 'Topic key points must be at least 2 characters')
    .max(500, 'Topic key points must be less than 500 characters'),
  city: z.string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'City can only contain letters and spaces'),
  preferredTone: z.string()
    .min(2, 'Preferred tone must be at least 2 characters')
    .max(100, 'Preferred tone must be less than 100 characters'),
  callToAction: z.string()
    .min(2, 'Call to action must be at least 2 characters')
    .max(200, 'Call to action must be less than 200 characters'),
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
})

type CreateVideoFormData = z.infer<typeof createVideoSchema>

// Dropdown options
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


// Legacy avatar options kept for fallback compatibility
// const customAvatarOptions = [
//   {
//     id: 'SHF34020',
//     image: '/images/avatars/avatar1.png',
//     alt: 'SHF34020'
//   },
//   {
//     id: 'FRM89034',
//     image: '/images/avatars/avatar2.png',
//     alt: 'FRM89034'
//   }
// ];

// const extendedAvatarOptions2 = [
//   { id: 'VAL77889', name: 'VAL77889', imageUrl: '/images/avatars/avatar5.png' },
//   { id: 'PIP34567', name: 'PIP34567', imageUrl: '/images/avatars/avatar6.png' },
//   { id: 'PN100234', name: 'PN100234', imageUrl: '/images/avatars/avatar7.png' },
//   { id: 'CON11223', name: 'CON11223', imageUrl: '/images/avatars/avatar8.png' },
//   { id: 'XTR12340', name: 'XTR12340', imageUrl: '/images/avatars/avatar9.png' },
//   { id: 'DRV34567', name: 'DRV34567', imageUrl: '/images/avatars/avatar10.png' },
//   { id: 'BLD67543', name: 'BLD67543', imageUrl: '/images/avatars/avatar11.png' },
//   { id: 'Account', name: 'Account', imageUrl: '/images/avatars/avatar12.png' },
//   { id: 'FRM11223', name: 'FRM11223', imageUrl: '/images/avatars/avatar13.png' },
//   { id: 'SHF56789', name: 'SHF56789', imageUrl: '/images/avatars/avatar15.png' }
// ]


interface CreateVideoFormProps {
  className?: string
}

export default function CreateVideoForm({ className }: CreateVideoFormProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { isLoading, error } = useSelector((state: RootState) => state.video)
  const searchParams = useSearchParams()
  const { latestNotification } = usePhotoAvatarNotificationContext()

  const [showSuccessToast] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formDataForModal] = useState<CreateVideoFormData | null>(null)
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


  // Check if user came from Default Avatar button
  useEffect(() => {
    const source = searchParams.get('source')
    if (source === 'defaultAvatar')
    {
      setIsFromDefaultAvatar(true)
    }
  }, [searchParams])

  // Fetch avatars function - extracted to be reusable
  const fetchAvatars = useCallback(async () => {
    try
    {
      setAvatarsLoading(true)
      setAvatarsError(null)
      const response = await apiService.getAvatars()

      if (response.success)
      {
        // Handle both response structures: direct response or nested under data
        const avatarData = (response as any).data || response;

        setAvatars({
          custom: (avatarData as any).custom || [],
          default: (avatarData as any).default || []
        })

        // Explicitly clear any previous errors
        setAvatarsError(null)
      } else
      {
        setAvatarsError(response.message || 'Failed to fetch avatars')
      }
    } catch (error: any)
    {
      // If API endpoint doesn't exist (404), show a more user-friendly message
      if (error.message?.includes('Not Found') || error.message?.includes('404'))
      {
        setAvatarsError('Avatar API not yet implemented. Using fallback options.')
      } else
      {
        setAvatarsError(error.message || 'Failed to load avatars')
      }
    } finally
    {
      setAvatarsLoading(false)
    }
  }, [])

  // Fetch avatars when component mounts or when user authentication status changes
  useEffect(() => {
    fetchAvatars()
  }, [fetchAvatars])

  // Auto-refresh avatars when WebSocket notification shows avatar is ready
  useEffect(() => {
    if (latestNotification)
    {
      console.log('🔔 Latest notification received:', latestNotification)

      // Check if this is an avatar completion notification
      const isAvatarComplete = (latestNotification.step === 'complete' || latestNotification.step === 'ready') &&
        latestNotification.status === 'success' &&
        (latestNotification.data?.message?.toLowerCase().includes('avatar') ||
          latestNotification.data?.message?.toLowerCase().includes('ready'))

      if (isAvatarComplete)
      {
        console.log('🔄 Avatar ready notification detected, refreshing avatar list...')
        console.log('📋 Notification details:', latestNotification)
        // Small delay to ensure backend has updated the avatar status
        setTimeout(() => {
          fetchAvatars()
        }, 1000)
      }
    }
  }, [latestNotification, fetchAvatars])

  // Helper function to check if avatar is pending
  const isAvatarPending = (avatar: Avatar) => {
    return avatar.status === 'pending' || avatar.status === 'processing' || avatar.status === 'creating'
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

    if (draggedAvatar)
    {
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

    // Clear the form field if no avatars are selected
    const remainingAvatars = Object.values({
      ...selectedAvatars,
      [dropZone]: null
    }).filter(Boolean)

    if (remainingAvatars.length === 0)
    {
      setValue('avatar', '')
      trigger('avatar')
    }
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
    mode: 'onChange'
  })

  const onSubmit = async (data: CreateVideoFormData) => {
    // ...existing code...

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

      // Open modal with webhook response data
      setIsModalOpen(true)

      // Clear any previous errors
      dispatch(clearVideoError())

      // Reset form after modal is opened
      setTimeout(() => {
        reset()
        // Don't clear webhookResponse here - let the modal use it
      }, 100)
    } catch (error: any)
    {
      dispatch(setVideoError(error.message || 'Failed to create video'))
    } finally
    {
      dispatch(setVideoLoading(false))
    }
  }

  const handleDropdownSelect = (field: keyof CreateVideoFormData, value: string) => {
    // For avatar field, ensure mutual exclusivity between custom and default avatars
    if (field === 'avatar')
    {
      // Check if the selected value is a custom avatar
      // ...existing code...

      // Clear any previous selection first
      setValue('avatar', '')

      // Then set the new value
      setValue('avatar', value)
    } else
    {
      setValue(field, value)
    }

    trigger(field) // Trigger validation for this specific field
    setOpenDropdown(null)
  }

  const handleDropdownToggle = (field: keyof CreateVideoFormData) => {
    const isOpen = openDropdown === field
    if (isOpen)
    {
      // If closing dropdown without selection, trigger validation
      const currentValue = watch(field)
      if (!currentValue || currentValue.trim() === '')
      {
        // Trigger validation for this field only if no value is selected
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
    // Use extended options for avatar field when coming from Default Avatar
    const displayOptions = field === 'avatar' && isFromDefaultAvatar ? extendedAvatarOptions : options
    const currentValue = watch(field)

    // For avatar field, try to find the selected avatar from API data first
    let selectedOption;
    if (field === 'avatar' && currentValue)
    {
      const customAvatar = avatars.custom.find(avatar => avatar.avatar_id === currentValue)
      const defaultAvatar = avatars.default.find(avatar => avatar.avatar_id === currentValue)
      if (customAvatar)
      {
        // Show avatar_id for custom avatars (same as default avatars)
        selectedOption = { value: customAvatar.avatar_id, label: customAvatar.avatar_id }
      } else if (defaultAvatar)
      {
        selectedOption = { value: defaultAvatar.avatar_id, label: defaultAvatar.avatar_id }
      } else
      {
        // Fallback to static options
        selectedOption = displayOptions.find(option => option.value === currentValue)
      }
    } else
    {
      selectedOption = displayOptions.find(option => option.value === currentValue)
    }

    const isOpen = openDropdown === field
    const hasError = errors[field]

    return (
      <div className="relative">
        {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props */}
        <button
          type="button"
          onClick={() => handleDropdownToggle(field)}
          onBlur={() => {
            setTimeout(() => {
              const currentValue = watch(field)
              if ((!currentValue || currentValue.trim() === '') && openDropdown === field)
              {
                setValue(field, '', { shouldValidate: true })
              }
            }, 100)
          }}
          className={`w-full px-4 py-[10.5px] text-[18px] font-normal bg-[#EEEEEE] hover:bg-[#F5F5F5] border-0 rounded-[8px] text-left transition-all duration-300 focus:outline-none focus:ring focus:ring-[#5046E5] focus:bg-white flex items-center justify-between cursor-pointer overflow-hidden ${hasError ? 'ring-2 ring-red-500' : ''
            } ${selectedOption ? 'text-gray-800 bg-[#F5F5F5]' : 'text-[#11101066]'}`}
          aria-describedby={hasError ? `${field}-error` : undefined}
          aria-invalid={hasError ? 'true' : 'false'}
        >
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
          <IoMdArrowDropdown
            className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <div>
            {field === 'avatar' ? (
              <div className="absolute avatar-dropdown-shadow z-50 lg:w-[900px] w-full mt-1 bg-white rounded-[12px] shadow-lg !overflow-hidden">
                {/* Avatar Dropdown Header with Refresh Button */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">Select Avatar</h3>
                  <button
                    onClick={fetchAvatars}
                    disabled={avatarsLoading}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-[#5046E5] hover:bg-gray-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Refresh avatars"
                  >
                    <RefreshCw className={`w-4 h-4 ${avatarsLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                {/* Main Content - Two Column Layout */}
                <div className="flex h-[500px]">
                  {/* Left Side - Avatar Selection */}
                  <div className="flex-1 py-4 px-6 overflow-y-auto border-r border-gray-200">
                    {avatarsLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5046E5]"></div>
                        <span className="ml-2 text-[#5F5F5F]">Loading avatars...</span>
                      </div>
                    ) : avatarsError ? (
                      <div className="text-center py-8">
                        <p className="text-red-500 mb-2">Failed to load avatars</p>
                        <p className="text-sm text-[#5F5F5F]">{avatarsError}</p>
                        <button
                          onClick={fetchAvatars}
                          className="mt-3 px-4 py-2 bg-[#5046E5] text-white rounded-lg hover:bg-[#4338CA] transition-colors"
                        >
                          Retry
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Custom Avatar Section */}
                        {avatars.custom.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-[20px] font-semibold text-[#5F5F5F] mb-3">Custom Avatar</h4>
                            {/* Info bar */}
                            <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-purple-100 rounded-lg">
                              <AlertCircle className="w-4 h-4 text-purple-600" />
                              <span className="text-sm text-purple-700">Create 3 avatars to use in your custom video</span>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              {avatars.custom.map((avatar) => (
                                <div
                                  key={avatar._id}
                                  draggable={!isAvatarPending(avatar)}
                                  onDragStart={(e) => !isAvatarPending(avatar) && handleDragStart(e, avatar)}
                                  onDragEnd={handleDragEnd}
                                  onClick={(e) => e.preventDefault()}
                                  className={`flex flex-col items-center max-w-[80px] rounded-lg transition-colors duration-200 relative cursor-pointer ${isAvatarPending(avatar) ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50'
                                    }`}
                                >
                                  <div className="relative">
                                    <Image
                                      src={avatar.preview_image_url || avatar.imageUrl || '/images/avatars/avatargirl.png'}
                                      alt={avatar.avatar_name || avatar.name || 'Avatar'}
                                      width={80}
                                      height={80}
                                      className={`rounded-lg object-cover w-[80px] h-[80px] ${isAvatarPending(avatar) ? 'opacity-50' : ''
                                        }`}
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/images/avatars/avatargirl.png';
                                      }}
                                    />
                                    {/* Loading overlay for pending avatars */}
                                    {isAvatarPending(avatar) && (
                                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-base text-[#11101066] font-normal mt-3 truncate w-full text-center">
                                    {avatar.avatar_id}
                                    {isAvatarPending(avatar) && (
                                      <>
                                        <span className="block text-xs text-orange-500 mt-1">Processing...</span>
                                        <span className="block text-[9px] text-orange-500 mt-1 break-words text-wrap">it normally take 2 minutes to complete</span>
                                      </>
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Separator - only show if both custom and default avatars exist */}
                        {avatars.custom.length > 0 && avatars.default.length > 0 && (
                          <div className="bg-[#A0A3BD] h-[1px] mb-6"></div>
                        )}

                        {/* Default Avatar Section */}
                        {avatars.default.length > 0 && (
                          <div>
                            <h4 className="text-[20px] font-semibold text-[#5F5F5F] mb-3">Default Avatar</h4>
                            <div className="grid grid-cols-4 gap-2">
                              {avatars.default.slice(0, 12).map((avatar) => (
                                <div
                                  key={avatar._id}
                                  draggable={true}
                                  onDragStart={(e) => handleDragStart(e, avatar)}
                                  onDragEnd={handleDragEnd}
                                  onClick={(e) => e.preventDefault()}
                                  className="flex flex-col items-center max-w-[80px] rounded-lg hover:bg-gray-50 transition-colors duration-200 relative cursor-pointer"
                                >
                                  <Image
                                    src={avatar.preview_image_url || avatar.imageUrl || '/images/avatars/avatargirl.png'}
                                    alt={avatar.avatar_name || avatar.name || 'Avatar'}
                                    width={80}
                                    height={80}
                                    className="rounded-lg object-cover w-[80px] h-[80px]"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = '/images/avatars/avatargirl.png';
                                    }}
                                  />
                                  <span className="text-base text-[#11101066] font-normal mt-3 truncate w-full text-center">{avatar.avatar_id}</span>
                                </div>
                              ))}
                            </div>
                            {avatars.default.length > 12 && (
                              <p className="text-sm text-[#5F5F5F] text-center mt-3">
                                Showing first 12 of {avatars.default.length} default avatars
                              </p>
                            )}
                          </div>
                        )}

                        {/* No avatars message */}
                        {avatars.custom.length === 0 && avatars.default.length === 0 && (
                          <div className="text-center py-8">
                            <p className="text-[#5F5F5F]">No avatars available</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Right Side - Drop Zones */}
                  <div className="w-80 py-4 px-6 bg-white">
                    <h4 className="text-[20px] font-semibold text-[#5F5F5F] mb-3">Sort Avatar</h4>
                    <p className="text-sm text-[#5F5F5F] mb-6">Drag and drop the selected Images</p>

                    {/* Drop Zones */}
                    <div className="space-y-4">
                      {/* Title Avatar Drop Zone */}
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, 'title')}
                        className="relative flex items-center py-3 transition-colors duration-200 hover:bg-gray-50 rounded-lg cursor-pointer"
                      >
                        {selectedAvatars.title ? (
                          <div className="flex items-center w-full">
                            <div className="w-[60px] h-[60px] bg-purple-100 rounded-lg flex items-center justify-center mr-3 shadow-sm relative">
                              <Image
                                src={selectedAvatars.title.preview_image_url || selectedAvatars.title.imageUrl || '/images/avatars/avatargirl.png'}
                                alt={selectedAvatars.title.avatar_name || selectedAvatars.title.name || 'Avatar'}
                                width={50}
                                height={50}
                                className="rounded-lg object-cover w-[50px] h-[50px]"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/images/avatars/avatargirl.png';
                                }}
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRemoveAvatar('title')
                                }}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                              >
                                ×
                              </button>
                            </div>
                            <span className="text-sm text-gray-500">Title Avatar</span>
                          </div>
                        ) : (
                          <div className="flex items-center w-full">
                            <div className="w-[60px] h-[60px] bg-purple-100 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <span className="text-sm text-gray-500">Title Avatar</span>
                          </div>
                        )}
                      </div>

                      {/* Body Avatar Drop Zone */}
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, 'body')}
                        className="relative flex items-center py-3 transition-colors duration-200 hover:bg-gray-50 rounded-lg cursor-pointer"
                      >
                        {selectedAvatars.body ? (
                          <div className="flex items-center w-full">
                            <div className="w-[60px] h-[60px] bg-purple-100 rounded-lg flex items-center justify-center mr-3 shadow-sm relative">
                              <Image
                                src={selectedAvatars.body.preview_image_url || selectedAvatars.body.imageUrl || '/images/avatars/avatargirl.png'}
                                alt={selectedAvatars.body.avatar_name || selectedAvatars.body.name || 'Avatar'}
                                width={50}
                                height={50}
                                className="rounded-lg object-cover w-[50px] h-[50px]"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/images/avatars/avatargirl.png';
                                }}
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRemoveAvatar('body')
                                }}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                              >
                                ×
                              </button>
                            </div>
                            <span className="text-sm text-gray-500">Body Avatar</span>
                          </div>
                        ) : (
                          <div className="flex items-center w-full">
                            <div className="w-[60px] h-[60px] bg-purple-100 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <span className="text-sm text-gray-500">Body Avatar</span>
                          </div>
                        )}
                      </div>

                      {/* Conclusion Avatar Drop Zone */}
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, 'conclusion')}
                        className="relative flex items-center py-3 transition-colors duration-200 hover:bg-gray-50 rounded-lg cursor-pointer"
                      >
                        {selectedAvatars.conclusion ? (
                          <div className="flex items-center w-full">
                            <div className="w-[60px] h-[60px] bg-purple-100 rounded-lg flex items-center justify-center mr-3 shadow-sm relative">
                              <Image
                                src={selectedAvatars.conclusion.preview_image_url || selectedAvatars.conclusion.imageUrl || '/images/avatars/avatargirl.png'}
                                alt={selectedAvatars.conclusion.avatar_name || selectedAvatars.conclusion.name || 'Avatar'}
                                width={50}
                                height={50}
                                className="rounded-lg object-cover w-[50px] h-[50px]"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/images/avatars/avatargirl.png';
                                }}
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRemoveAvatar('conclusion')
                                }}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                              >
                                ×
                              </button>
                            </div>
                            <span className="text-sm text-gray-500">Conclusion Avatar</span>
                          </div>
                        ) : (
                          <div className="flex items-center w-full">
                            <div className="w-[60px] h-[60px] bg-purple-100 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <span className="text-sm text-gray-500">Conclusion Avatar</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Show regular dropdown options for normal users or fallback */
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-[8px] shadow-lg max-h-60 overflow-y-auto">
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleDropdownSelect(field, option.value)}
                    className="w-full px-4 py-3 text-left hover:bg-[#F5F5F5] transition-colors duration-200 flex items-center justify-between text-[#282828] cursor-pointer"
                  >
                    <span>{option.label}</span>
                    {currentValue === option.value && (
                      <Check className="w-4 h-4 text-[#5046E5]" />
                    )}
                  </button>
                ))}
              </div>
            )}

          </div>
        )}

        {hasError && (
          <p id={`${field}-error`} className="text-red-500 text-sm mt-1 flex items-center gap-1" role="alert">
            <AlertCircle className="w-4 h-4" />
            {hasError.message}
          </p>
        )}
      </div>
    )
  }

  const renderInput = (
    field: keyof CreateVideoFormData,
    placeholder: string,
    type: string = 'text',
    autoComplete?: string
  ) => {
    const hasError = errors[field]

    return (
      <div className="relative">
        <input
          {...register(field)}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-describedby={hasError ? `${field}-error` : undefined}
          aria-invalid={hasError ? 'true' : 'false'}
          className={`w-full px-4 py-[10.5px] text-[18px] font-normal placeholder:text-[#11101066] bg-[#EEEEEE] hover:bg-[#F5F5F5] border-0 rounded-[8px] text-gray-800 transition-all duration-300 focus:outline-none focus:ring focus:ring-[#5046E5] focus:bg-white ${hasError ? 'ring-2 ring-red-500' : ''
            }`}
        />
        {hasError && (
          <p id={`${field}-error`} className="text-red-500 text-sm mt-1 flex items-center gap-1" role="alert">
            <AlertCircle className="w-4 h-4" />
            {hasError.message}
          </p>
        )}
      </div>
    )
  }



  return (
    <div className={`w-full max-w-[1260px] mx-auto ${className}`}>
      {/* Success Toast */}
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">


        {/* Error Display */}
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

        {/* Row 1 */}
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

        {/* Row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
              Company Name <span className="text-red-500">*</span>
            </label>
            {renderInput('companyName', 'e.g. Keller Williams', 'text', 'organization')}
          </div>

          <div>
            <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
              License <span className="text-red-500">*</span>
            </label>
            {renderInput('license', 'e.g. License #12345', 'text')}
          </div>

          <div>
            <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
              Tailored Fit <span className="text-red-500">*</span>
            </label>
            {renderInput('tailoredFit', 'e.g. First-time buyer specialist', 'text')}
          </div>

          <div>
            <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
              Social Handles <span className="text-red-500">*</span>
            </label>
            {renderInput('socialHandles', 'e.g. @johnsmith, @facebook', 'text')}
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
              City <span className="text-red-500">*</span>
            </label>
            {renderInput('city', 'e.g. Los Angeles', 'text', 'address-level2')}
          </div>

          <div>
            <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
              Preferred Tone <span className="text-red-500">*</span>
            </label>
            {renderInput('preferredTone', 'e.g. Professional, friendly, etc.', 'text')}
          </div>

          <div>
            <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
              Call to Action <span className="text-red-500">*</span>
            </label>
            {renderInput('callToAction', 'e.g. Call for consultation', 'text')}
          </div>

          <div>
            <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            {renderInput('email', 'your.email@example.com', 'email', 'email')}
          </div>
        </div>

        {/* Row 4 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
              Video Topic <span className="text-red-500">*</span>
            </label>
            {renderInput('videoTopic', 'e.g. Market trends, new listing', 'text')}
          </div>

          <div>
            <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
              Topic Key Points <span className="text-red-500">*</span>
            </label>
            {renderInput('topicKeyPoints', 'Low rates, great location, etc.', 'text')}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full max-w-full px-8 py-[12.4px] bg-[#5046E5] text-white rounded-full font-semibold text-lg hover:bg-transparent hover:text-[#5046E5] border-2 border-[#5046E5] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#5046E5]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Video...
              </>
            ) : (
              'Submit'
            )}
          </button>
        </div>
      </form>

      {/* Click outside to close dropdowns */}
      {openDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            // If closing dropdown without selection, trigger validation
            const currentValue = watch(openDropdown as keyof CreateVideoFormData)
            if (!currentValue || currentValue.trim() === '')
            {
              // Trigger validation for this field only if no value is selected
              setValue(openDropdown as keyof CreateVideoFormData, '', { shouldValidate: true })
            }
            setOpenDropdown(null)
          }}
        />
      )}

      {/* Create Video Modal */}
      <CreateVideoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setWebhookResponse(null) // Clear webhookResponse when modal closes
        }}
        videoTitle={formDataForModal?.prompt || 'Custom Video'}
        webhookResponse={webhookResponse}
      />


    </div>
  )
}
