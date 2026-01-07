'use client'

import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import Link from 'next/link'
import { IoMdArrowDropdown } from 'react-icons/io'
import Image from 'next/image'
import { useNotificationStore } from '@/components/ui/global-notification'
import { apiService } from '@/lib/api-service'
import { musicVideoSchema, MusicVideoFormData } from './form-validation-schema'
import { useAppSelector } from '@/store/hooks'
import SubmitButton from './submit-button'
import MusicSelectorWrapper from './music-selector-wrapper'
import { Voice, VoiceType } from './voice-selector/types'
import CreateVideoModal from './create-video-modal'
import { useSubscription } from '@/hooks/useSubscription'
import UsageLimitToast from './usage-limit-toast'
import PendingPaymentToast from './pending-payment-toast'
import SubscriptionRequiredToast from './subscription-required-toast'
import { FaArrowLeft } from 'react-icons/fa'

interface ImageFile {
  file: File
  preview: string
}

// Property Type options
const propertyTypeOptions = [
  { value: 'Apartment / Condo', label: 'Apartment / Condo' },
  { value: 'Single-Family Home', label: 'Single-Family Home' },
  { value: 'Townhouse', label: 'Townhouse' },
  { value: 'Duplex / Multi-Family', label: 'Duplex / Multi-Family' },
]

export default function MusicVideoForm() {
  const { showNotification } = useNotificationStore()
  const [startImage, setStartImage] = useState<ImageFile | null>(null)
  const [restImages, setRestImages] = useState<ImageFile[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [shouldStartLoading, setShouldStartLoading] = useState(false)
  const [isFreshSubmission, setIsFreshSubmission] = useState(false)
  const [dragActive, setDragActive] = useState<{ start: boolean; rest: boolean }>({ start: false, rest: false })
  const startImageInputRef = useRef<HTMLInputElement>(null)
  const restImagesInputRef = useRef<HTMLInputElement>(null)

  const user = useAppSelector((state) => state.user.user)
  const userEmail = user?.email || ''
  const userName = user ? `${user.firstName} ${user.lastName}`.trim() : ''

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

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<MusicVideoFormData>({
    resolver: zodResolver(musicVideoSchema),
    mode: 'onSubmit',
    defaultValues: {
      title: '',
      propertyType: '',
      price: '',
      size: '',
      bedroomCount: '',
      washroomCount: '',
      socialHandles: '',
      mainSellingPoints: '',
      city: '',
      address: '',
      music: '',
    },
  })

  // Music state and hooks
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [isPropertyTypeDropdownOpen, setIsPropertyTypeDropdownOpen] = useState(false)
  const [musicList, setMusicList] = useState<Voice[]>([])
  const [musicLoading, setMusicLoading] = useState(false)
  const [musicError, setMusicError] = useState<string | null>(null)
  const [allMusic, setAllMusic] = useState<Voice[]>([])

  // Fetch music on component mount (no gender dependency for music video)
  useEffect(() => {
    const fetchMusic = async () => {
      try {
        setMusicLoading(true)
        setMusicError(null)
        // Fetch music without gender parameter (pass null)
        const response = await apiService.getMusicTracks(undefined, null)
        
        if (response.success && response.data) {
          const musicData = Array.isArray(response.data) ? response.data : (response.data.tracks || response.data.music || [])
          
          const transformedMusic: Voice[] = musicData.map((music: any) => {
            const previewUrl = music.s3PreviewUrl || music.s3_preview_url || music.preview_url || music.previewUrl || music.preview || undefined
            
            return {
              id: music.trackId || music.track_id || music.id || music._id || '',
              _id: music._id || '',
              name: music.name || '',
              artist: music.metadata?.artist || music.artist || undefined,
              type: (music.energyCategory?.toLowerCase() || 'low') as 'low' | 'medium' | 'high',
              previewUrl: previewUrl,
              preview_url: previewUrl,
              thumbnailUrl: music.thumbnail_url || music.thumbnailUrl || music.thumbnail || undefined,
              s3FullTrackUrl: music.s3FullTrackUrl || music.s3_full_track_url || music.fullTrackUrl || undefined
            }
          })
          
          setAllMusic(transformedMusic)
          setMusicList(transformedMusic)
          setMusicError(null)
        } else {
          setMusicError(response.message || 'Failed to load music')
          setAllMusic([])
          setMusicList([])
        }
      } catch (error: any) {
        setMusicError(error.message || 'Failed to load music')
        setAllMusic([])
        setMusicList([])
      } finally {
        setMusicLoading(false)
      }
    }

    fetchMusic()
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      
      if (isPropertyTypeDropdownOpen && !target.closest('[data-dropdown="propertyType"]')) {
        setIsPropertyTypeDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isPropertyTypeDropdownOpen])

  const [selectedMusic, setSelectedMusic] = useState<Voice | null>(null)
  const [draggedMusic, setDraggedMusic] = useState<Voice | null>(null)
  const [currentMusicType, setCurrentMusicType] = useState<VoiceType | null>(null)
  const [customMusic, setCustomMusic] = useState<Voice[]>([])

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
    setCurrentMusicType(type)
  }

  const handleCustomMusicUpload = (music: Voice) => {
    setCustomMusic((prev) => {
      // Check if music already exists (by id)
      const exists = prev.some(m => m.id === music.id || m._id === music.id || m._id === music._id)
      if (exists) return prev
      return [...prev, music]
    })
  }

  // Fetch trending music from backend API
  const handleTrendingMusicFetch = async (): Promise<Voice[]> => {
    try {
      setMusicLoading(true)
      setMusicError(null)
      
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
      setMusicError(error instanceof Error ? error.message : 'Failed to load trending music')
      return []
    } finally {
      setMusicLoading(false)
    }
  }

  const handleDropdownToggle = (field: string) => {
    setOpenDropdown(openDropdown === field ? null : field)
  }

  const handleDropdownSelect = (field: string, value: string) => {
    setOpenDropdown(null)
    trigger(field as any)
  }

  const handleStartImageUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validImageTypes.includes(file.type.toLowerCase())) {
      showNotification(
        "This file type isn't supported.\nTry uploading a JPG, PNG, or WebP image.",
        'error'
      )
      return
    }

    try {
      const preview = URL.createObjectURL(file)
      setStartImage({ file, preview })
    } catch (error) {
      console.error('Error creating object URL for file:', file.name, error)
      showNotification('Failed to load image. Please try again.', 'error')
    }
  }

  const handleStartImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleStartImageUpload(e.target.files)
    // Reset input value to allow selecting the same file again
    if (e.target) {
      e.target.value = ''
    }
  }

  const handleRestImagesUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return

    // Check for unsupported file types first
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const invalidFiles = Array.from(files).filter(file => !validImageTypes.includes(file.type.toLowerCase()))
    
    if (invalidFiles.length > 0) {
      showNotification(
        "This file type isn't supported.\nTry uploading a JPG, PNG, or WebP image.",
        'error'
      )
      return
    }

    const imageFiles: ImageFile[] = Array.from(files)
      .map((file) => {
        try {
          const preview = URL.createObjectURL(file)
          return { file, preview }
        } catch (error) {
          console.error('Error creating object URL for file:', file.name, error)
          return null
        }
      })
      .filter((item): item is ImageFile => item !== null)

    // Check current count and enforce 11 image limit for rest images (1 start + 11 rest = 12 total)
    const currentCount = restImages.length
    const maxRestImages = 11
    const totalAfterUpload = currentCount + imageFiles.length

    if (totalAfterUpload > maxRestImages) {
      const allowed = maxRestImages - currentCount
      if (allowed <= 0) {
        showNotification(
          `Maximum limit reached! You can only upload 11 rest images (12 total including start image).`,
          "error"
        )
        return
      }
      showNotification(
        `You can only upload ${allowed} more image(s). Maximum limit is 11 rest images (12 total including start image).`,
        "warning"
      )
      imageFiles.splice(allowed)
    }

    setRestImages((prev) => [...prev, ...imageFiles])
  }

  const handleRestImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleRestImagesUpload(e.target.files)
    // Reset input value to allow selecting the same file again
    if (e.target) {
      e.target.value = ''
    }
  }

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent, type: 'start' | 'rest') => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive((prev) => ({ ...prev, [type]: true }))
  }

  const handleDragLeave = (e: React.DragEvent, type: 'start' | 'rest') => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive((prev) => ({ ...prev, [type]: false }))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent, type: 'start' | 'rest') => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive((prev) => ({ ...prev, [type]: false }))
    
    if (type === 'start') {
      handleStartImageUpload(e.dataTransfer.files)
    } else {
      handleRestImagesUpload(e.dataTransfer.files)
    }
  }

  const handleRemoveStartImage = () => {
    if (startImage) {
      URL.revokeObjectURL(startImage.preview)
      setStartImage(null)
    }
  }

  const handleRemoveRestImage = (index: number) => {
    const image = restImages[index]
    if (image) {
      URL.revokeObjectURL(image.preview)
      setRestImages((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const onSubmit = async (data: MusicVideoFormData) => {
    if (!userEmail) {
      showNotification('User email not found. Please sign in again.', 'error')
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
      showNotification('Unable to verify subscription status. Please try again.', 'error')
      return
    }

    if (!startImage) {
      showNotification('Please upload a start image', 'error')
      return
    }

    if (restImages.length === 0) {
      showNotification('Please upload at least one rest image', 'error')
      return
    }

    if (restImages.length > 11) {
      showNotification('Maximum limit is 11 rest images (12 total including start image). Please remove some images.', 'error')
      return
    }

    if (!selectedMusic) {
      showNotification('Please select music', 'error')
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()

      /**
       * Request Body Structure (FormData):
       * 
       * Form Fields:
       * - title: string (required)
       * - propertyType: string (required)
       * - price: string (required)
       * - size: string (required)
       * - bedRoomCount: string (required)
       * - bathRoomCount: string (required)
       * - social_handles: string (required)
       * - mainSellingPoints[]: string[] (optional, array of selling points)
       * - city: string (required)
       * - address: string (required)
       * - email: string (user's email)
       * - name: string (user's full name or email as fallback)
       * - timestamp: string (ISO timestamp)
       * 
       * Images:
       * - startImage: File (required, single image)
       * - restImages: File[] (required, 1-11 images max, 12 total including start image)
       * 
       * Music:
       * - music: string (required, S3 URL of selected music track)
       */

      // Append all form fields
      formData.append('title', data.title)
      formData.append('propertyType', data.propertyType)
      formData.append('price', data.price)
      formData.append('size', data.size)
      formData.append('bedRoomCount', data.bedroomCount)
      formData.append('bathRoomCount', data.washroomCount)
      formData.append('social_handles', data.socialHandles)
      
      // Parse comma-separated mainSellingPoints into array and append each item separately
      const sellingPointsArray = data.mainSellingPoints
        ? data.mainSellingPoints.split(',').map(point => point.trim()).filter(point => point.length > 0)
        : []
      // Append each selling point separately so backend receives it as an array
      sellingPointsArray.forEach((point) => {
        formData.append('mainSellingPoints[]', point)
      })
      
      formData.append('city', data.city)
      formData.append('address', data.address)
      formData.append('email', userEmail)
      formData.append('name', userName || userEmail)
      formData.append('timestamp', new Date().toISOString())

      // Append start image
      if (startImage) {
        formData.append('startImage', startImage.file)
      }

      // Append rest images (max 11 images, 12 total including start image)
      restImages.forEach((imageFile) => {
        formData.append('restImages', imageFile.file)
      })

      // Append music
      if (selectedMusic?.s3FullTrackUrl) {
        formData.append('music', selectedMusic.s3FullTrackUrl)
      }

      const response = await apiService.createMusicVideo(formData)

      if (response.success) {
        // Store a key in localStorage to indicate video generation has started
        localStorage.setItem('videoGenerationStarted', JSON.stringify({
          timestamp: Date.now(),
          videoTitle: data.title || 'Music Video'
        }))
        console.log('🎬 Music video generation API called - localStorage key set')

        // Reset form
        setStartImage(null)
        setRestImages([])
        setSelectedMusic(null)
        if (startImageInputRef.current) startImageInputRef.current.value = ''
        if (restImagesInputRef.current) restImagesInputRef.current.value = ''

        // Mark as fresh submission and open modal in loading state
        setIsFreshSubmission(true)
        setShouldStartLoading(true)
        setIsModalOpen(true)
      } else {
        throw new Error(response.message || 'Failed to create music video')
      }
    } catch (error: any) {
      console.error('Music video creation failed:', error)
      localStorage.removeItem('videoGenerationStarted')
      showNotification(error.message || 'Failed to create music video. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <CreateVideoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setShouldStartLoading(false)
          setIsFreshSubmission(false)
        }}
        videoTitle={watch('title') || 'Music Video'}
        mode="music-video"
        startAtLoading={shouldStartLoading}
        isFreshSubmission={isFreshSubmission}
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
            e.preventDefault()
          }
        }}
        className="space-y-8"
      >
      {/* Property Details Section */}
      <div className="bg-white p-2">
      <Link href="/create-video/video-listing" className="group inline-flex items-center gap-2 text-[#5046E5] hover:text-[#5046E5] transition-colors duration-300 w-fit mb-7">
          <FaArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
          Video Listing
        </Link>
        <h2 className="text-2xl md:text-[32px] font-semibold text-[#282828] mb-6">
          Fill the Property Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Title */}
          <div>
            <label className="block text-base font-normal text-[#5F5F5F] mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("title", { required: true })}
              placeholder="Please Specify"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                }
              }}
              className={`w-full px-4 py-3 bg-[#F5F5F5] border-0 rounded-[8px] text-[18px] font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white transition-all duration-300 ${
                errors.title ? 'ring-2 ring-red-500' : ''
              }`}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Property Type */}
          <div className="relative" data-dropdown="propertyType">
            <label className="block text-base font-normal text-[#5F5F5F] mb-1">
              Property Type <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setIsPropertyTypeDropdownOpen(!isPropertyTypeDropdownOpen)}
              className={`w-full px-4 py-3 bg-[#F5F5F5] border-0 rounded-[8px] text-left transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white flex items-center justify-between cursor-pointer text-gray-800 ${
                errors.propertyType ? 'ring-2 ring-red-500' : ''
              }`}
            >
              <span>
                {watch("propertyType")
                  ? propertyTypeOptions.find((opt) => opt.value === watch("propertyType"))?.label || "Select Property Type"
                  : "Select Property Type"}
              </span>
              <IoMdArrowDropdown
                className={`w-4 h-4 transition-transform duration-300 ${
                  isPropertyTypeDropdownOpen ? "rotate-180" : ""
                }`}
                style={{ color: 'inherit' }}
              />
            </button>
            {errors.propertyType && (
              <p className="text-red-500 text-sm mt-1">{errors.propertyType.message}</p>
            )}
            {isPropertyTypeDropdownOpen && (
              <div className="absolute z-[9999] top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-[8px] shadow-lg max-h-60 overflow-y-auto">
                {propertyTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setValue("propertyType", option.value)
                      setIsPropertyTypeDropdownOpen(false)
                      trigger("propertyType")
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-[#F5F5F5] transition-colors duration-200 text-[#282828] cursor-pointer"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-base font-normal text-[#5F5F5F] mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("address", { required: true })}
              placeholder="e.g. 123 Main St, LA"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                }
              }}
              className={`w-full px-4 py-3 bg-[#F5F5F5] border-0 rounded-[8px] text-[18px] font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white transition-all duration-300 ${
                errors.address ? 'ring-2 ring-red-500' : ''
              }`}
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-base font-normal text-[#5F5F5F] mb-1">
              Price <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("price", { required: true })}
              placeholder="e.g., 2000, 2000.50"
              inputMode="numeric"
              pattern="[0-9]*"
              onKeyPress={(e) => {
                const char = e.key
                const currentValue = (e.target as HTMLInputElement).value
                if (char === '.' && currentValue.includes('.')) {
                  e.preventDefault()
                  return
                }
                if (!/[0-9.]/.test(char)) {
                  e.preventDefault()
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                }
              }}
              className={`w-full px-4 py-3 bg-[#F5F5F5] border-0 rounded-[8px] text-[18px] font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white transition-all duration-300 ${
                errors.price ? 'ring-2 ring-red-500' : ''
              }`}
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
            )}
          </div>

          {/* Size */}
          <div>
            <label className="block text-base font-normal text-[#5F5F5F] mb-1">
              Size (Square/Feet) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              {...register("size", { 
                required: true,
                pattern: {
                  value: /^\d+$/,
                  message: 'Size must be a number'
                }
              })}
              placeholder="e.g., 1500 sq ft, 2000 sq ft"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                }
                // Allow: backspace, delete, tab, escape, enter, decimal point, and numbers
                if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                  e.preventDefault()
                }
              }}
              className={`w-full px-4 py-3 bg-[#F5F5F5] border-0 rounded-[8px] text-[18px] font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white transition-all duration-300 ${
                errors.size ? 'ring-2 ring-red-500' : ''
              }`}
            />
            {errors.size && (
              <p className="text-red-500 text-sm mt-1">{errors.size.message}</p>
            )}
          </div>

          {/* Bedroom Count */}
          <div>
            <label className="block text-base font-normal text-[#5F5F5F] mb-1">
              Bedroom Count <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              {...register("bedroomCount", { 
                required: true,
                pattern: {
                  value: /^\d+$/,
                  message: 'Bedroom count must be a number'
                }
              })}
              placeholder="e.g., 1, 2, 3"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                }
                // Allow: backspace, delete, tab, escape, enter, and numbers
                if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                  e.preventDefault()
                }
              }}
              className={`w-full px-4 py-3 bg-[#F5F5F5] border-0 rounded-[8px] text-[18px] font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white transition-all duration-300 ${
                errors.bedroomCount ? 'ring-2 ring-red-500' : ''
              }`}
            />
            {errors.bedroomCount && (
              <p className="text-red-500 text-sm mt-1">{errors.bedroomCount.message}</p>
            )}
          </div>

          {/* Restroom Count */}
          <div>
            <label className="block text-base font-normal text-[#5F5F5F] mb-1">
              Restroom Count <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              {...register("washroomCount", { 
                required: true,
                pattern: {
                  value: /^\d+$/,
                  message: 'Restroom count must be a number'
                }
              })}
              placeholder="e.g., 1, 2, 3"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                }
                // Allow: backspace, delete, tab, escape, enter, and numbers
                if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                  e.preventDefault()
                }
              }}
              className={`w-full px-4 py-3 bg-[#F5F5F5] border-0 rounded-[8px] text-[18px] font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white transition-all duration-300 ${
                errors.washroomCount ? 'ring-2 ring-red-500' : ''
              }`}
            />
            {errors.washroomCount && (
              <p className="text-red-500 text-sm mt-1">{errors.washroomCount.message}</p>
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
              className={`w-full px-4 py-3 bg-[#F5F5F5] border-0 rounded-[8px] text-[18px] font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white transition-all duration-300 ${
                errors.socialHandles ? 'ring-2 ring-red-500' : ''
              }`}
            />
            {errors.socialHandles && (
              <p className="text-red-500 text-sm mt-1">{errors.socialHandles.message}</p>
            )}
          </div>

          {/* Main Selling Points */}
          <div>
            <label className="block text-base font-normal text-[#5F5F5F] mb-1">
              Main Selling Points <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("mainSellingPoints")}
              placeholder="e.g., Spacious rooms, Modern kitchen, Great location, Parking available"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                }
              }}
              className={`w-full px-4 py-3 bg-[#F5F5F5] border-0 rounded-[8px] text-[18px] font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white transition-all duration-300 ${
                errors.mainSellingPoints ? 'ring-2 ring-red-500' : ''
              }`}
            />
            {errors.mainSellingPoints && (
              <p className="text-red-500 text-sm mt-1">{errors.mainSellingPoints.message}</p>
            )}
          </div>

          {/* City */}
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
              className={`w-full px-4 py-3 bg-[#F5F5F5] border-0 rounded-[8px] text-[18px] font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white transition-all duration-300 ${
                errors.city ? 'ring-2 ring-red-500' : ''
              }`}
            />
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
            )}
          </div>

          {/* Music */}
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
              preset={null}
              initialMusicType={currentMusicType as 'low' | 'medium' | 'high' | 'trending' | null}
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
              hasTrending={true}
              trendingLabel="Trending Music"
              onTrendingMusicFetch={handleTrendingMusicFetch}
              cityName={watch("city")?.trim() || undefined}
            />
            {errors.music && (
              <p className="text-red-500 text-sm mt-1">{errors.music.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Images Section */}
      <div className="bg-white p-2">
        <h2 className="text-2xl md:text-[32px] font-semibold text-[#171717] mb-6">
          Upload Images
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Start Image - Smaller width */}
          <div className="md:col-span-1">
            <label className="block text-base font-normal text-[#5F5F5F] mb-2">
              Start Image <span className="text-red-500">*</span>
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-4 min-h-[200px] flex flex-col items-center justify-center cursor-pointer transition-all duration-200 bg-white ${
                dragActive.start
                  ? "border-[#5046E5] bg-[#F5F7FC] ring-2 ring-[#5046E5] ring-offset-2"
                  : "border-gray-300"
              }`}
              onDragEnter={(e) => handleDragEnter(e, 'start')}
              onDragLeave={(e) => handleDragLeave(e, 'start')}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'start')}
            >
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleStartImageChange}
                className="hidden"
                id="startImage"
                ref={startImageInputRef}
              />
              {startImage ? (
                <div className="relative w-full">
                  <div className="relative group rounded overflow-hidden">
                    <Image
                      src={startImage.preview}
                      alt="Start image"
                      width={200}
                      height={200}
                      className="w-full h-48 object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveStartImage}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="text-center w-full cursor-pointer"
                  onClick={() => startImageInputRef.current?.click()}
                >
                  <p className="text-base font-semibold text-[#5F5F5F] mb-1">
                    Upload Start Image
                  </p>
                  <p className="text-xs text-gray-400 mb-3">
                    Supported formats: JPG, PNG, or WebP
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      startImageInputRef.current?.click()
                    }}
                    className="text-sm text-[#5046E5] px-4 py-2 rounded-full bg-[#5046E51A] hover:bg-[#5046E525] transition-colors font-medium"
                  >
                    Choose File
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Rest Images - Larger width */}
          <div className="md:col-span-3">
            <label className="block text-base font-normal text-[#5F5F5F] mb-2">
              Rest of Images <span className="text-red-500">*</span>
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-4 min-h-[200px] flex flex-col items-center justify-center cursor-pointer transition-all duration-200 bg-white ${
                dragActive.rest
                  ? "border-[#5046E5] bg-[#F5F7FC] ring-2 ring-[#5046E5] ring-offset-2"
                  : "border-gray-300"
              }`}
              onDragEnter={(e) => handleDragEnter(e, 'rest')}
              onDragLeave={(e) => handleDragLeave(e, 'rest')}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'rest')}
            >
              <input
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleRestImagesChange}
                className="hidden"
                id="restImages"
                ref={restImagesInputRef}
              />
              {restImages.length > 0 ? (
                <div className="w-full">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {restImages.map((image, index) => (
                      <div key={index} className="relative group rounded overflow-hidden">
                        <Image
                          src={image.preview}
                          alt={`Rest image ${index + 1}`}
                          width={100}
                          height={100}
                          className="w-full h-32 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveRestImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {restImages.length < 11 && (
                    <button
                      type="button"
                      onClick={() => restImagesInputRef.current?.click()}
                      className="mt-4 text-sm text-[#5046E5] px-4 py-2 rounded-full bg-[#5046E51A] hover:bg-[#5046E525] transition-colors font-medium"
                    >
                      Add More Images ({11 - restImages.length} remaining)
                    </button>
                  )}
                </div>
              ) : (
                <div
                  className="text-center w-full cursor-pointer"
                  onClick={() => restImagesInputRef.current?.click()}
                >
                  <p className="text-base font-semibold text-[#5F5F5F] mb-1">
                    Upload Additional Images
                  </p>
                  <p className="text-xs text-gray-400 mb-3">
                    Supported formats: JPG, PNG, or WebP
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      restImagesInputRef.current?.click()
                    }}
                    className="text-sm text-[#5046E5] px-4 py-2 rounded-full bg-[#5046E51A] hover:bg-[#5046E525] transition-colors font-medium"
                  >
                    Choose Files
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <SubmitButton
        isLoading={isSubmitting}
        buttonText={isSubmitting ? 'Creating Music Video...' : 'Create Music Video'}
      />
    </form>
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
    </>
  )
}
