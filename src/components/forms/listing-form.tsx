'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IoMdArrowDropdown } from 'react-icons/io'
import { X } from 'lucide-react'
import Image from 'next/image'
import { useNotificationStore } from '@/components/ui/global-notification'
import { apiService, Avatar } from '@/lib/api-service'
import FormDropdown from '@/components/ui/form-dropdown'
import { useUnifiedSocketContext } from '@/components/providers/UnifiedSocketProvider'
import VoiceSelectorWrapper from '../ui/voice-selector-wrapper'
import MusicSelectorWrapper from '../ui/music-selector-wrapper'
import { Voice, VoiceType } from '../ui/voice-selector/types'
import { useVoicesAndMusic } from '@/hooks/useVoicesAndMusic'
import { listingVideoSchema, ListingVideoFormData } from './validation-schema'
import { useAppSelector } from '@/store/hooks'
import SubmitButton from '../ui/submit-button'
import CreateVideoModal from '../ui/create-video-modal'
import { useSubscription } from '@/hooks/useSubscription'
import UsageLimitToast from '../ui/usage-limit-toast'
import PendingPaymentToast from '../ui/pending-payment-toast'
import SubscriptionRequiredToast from '../ui/subscription-required-toast'
import Link from 'next/link'
import { FaArrowLeft } from 'react-icons/fa'

// Exterior parts options
const exteriorParts = [
  "Street-side / Exterior view",
  // "Chimney",
  // "Walls",
  "Windows",
  "Doors",
  "Porch",
  "Balcony",
  "Garage",
  "Driveway",
  "Fence",
  "Garden / Yard",
  "Closets",
  "Pool",
  "ADUs / studios",
]

// Interior parts options
const interiorParts = [
  "Living room",
  "Primary Bedroom",
  "Master Bedroom",
  "Kitchen",
  "Dining room",
  "Restroom",
  "Study / Office",
  "Guest room",
  "Basement",
  "Attic",
]

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

const presetOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

// Property Type options
const propertyTypeOptions = [
  { value: 'Apartment / Condo', label: 'Apartment / Condo' },
  { value: 'Single-Family Home', label: 'Single-Family Home' },
  { value: 'Townhouse', label: 'Townhouse' },
  { value: 'Duplex / Multi-Family', label: 'Duplex / Multi-Family' },
  { value: 'ADUs / Studios', label: 'ADUs / Studios' },
]

// City options
const cityOptions = [
  { value: "Los Angeles", label: "Los Angeles" },
  { value: "New York", label: "New York" },
  { value: "Chicago", label: "Chicago" },
  { value: "Houston", label: "Houston" },
  { value: "Phoenix", label: "Phoenix" },
  { value: "Philadelphia", label: "Philadelphia" },
  { value: "San Antonio", label: "San Antonio" },
  { value: "San Diego", label: "San Diego" },
  { value: "Dallas", label: "Dallas" },
  { value: "San Jose", label: "San Jose" },
]

// Size unit options
const sizeUnitOptions = [
  { value: "square_feet", label: "Square Feet" },
  { value: "acre", label: "Acre" },
]

interface ImageFile {
  file: File
  preview: string
}

interface ExteriorPartData {
  checked: boolean
  images: ImageFile[]
}

interface InteriorPartData {
  checked: boolean
  number: string
  images: ImageFile[]
}

export default function ListingVideoForm() {
  const { showNotification } = useNotificationStore()
  const { latestAvatarUpdate } = useUnifiedSocketContext()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<ListingVideoFormData>({
    resolver: zodResolver(listingVideoSchema),
    mode: 'onSubmit',
    defaultValues: {
      title: '',
      propertyType: '',
      avatar: '',
      gender: '',
      preset: '',
      voice: '',
      music: '',
      city: '',
      address: '',
      price: '',
      sizeUnit: '',
      size: '',
      lotSize: '',
      bedroomCount: '',
      masterBedroomCount: '',
      // livingRoomCount: '',
      bathroomCount: '',
      socialHandles: '',
      mainSellingPoints: '',
      preferredTone: '',
    },
  })

  const user = useAppSelector((state) => state.user.user)
  const userName = user ? `${user.firstName} ${user.lastName}`.trim() : ''
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

  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false)
  const [isPresetDropdownOpen, setIsPresetDropdownOpen] = useState(false)
  const [isPropertyTypeDropdownOpen, setIsPropertyTypeDropdownOpen] = useState(false)
  const [isUseMusicDropdownOpen, setIsUseMusicDropdownOpen] = useState(false)
  const [isSizeUnitDropdownOpen, setIsSizeUnitDropdownOpen] = useState(false)
  const [useMusic, setUseMusic] = useState<'yes' | 'no' | null>(null)
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false)
  const [isGeneratingScript, setIsGeneratingScript] = useState(false)
  const [mergedScript, setMergedScript] = useState<string>('')
  const [pendingFormData, setPendingFormData] = useState<ListingVideoFormData | null>(null)
  const [uploadedImages, setUploadedImages] = useState<Array<{ type: string; imageUrl: string; s3Key?: string }>>([])
  const [webhookTexts, setWebhookTexts] = useState<string[]>([])
  
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
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

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

  const [exteriorPartsData, setExteriorPartsData] = useState<Record<string, ExteriorPartData>>(
    exteriorParts.reduce(
      (acc, part) => ({
        ...acc,
        [part]: { checked: false, images: [] },
      }),
      {}
    )
  )

  const [interiorPartsData, setInteriorPartsData] = useState<Record<string, InteriorPartData>>(
    interiorParts.reduce(
      (acc, part) => ({
        ...acc,
        [part]: { checked: false, number: "", images: [] },
      }),
      {}
    )
  )

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

      // Only allow single avatar selection - always use title slot
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
    setCurrentMusicType(type as 'low' | 'medium' | 'high' | null)
  }

  const handleCustomMusicUpload = (music: Voice) => {
    setCustomMusic((prev) => {
      // Check if music already exists (by id)
      const exists = prev.some(m => m.id === music.id || m._id === music.id || m._id === music._id)
      if (exists) return prev
      return [...prev, music]
    })
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
      setUseMusic(null)
    }
    
    prevGenderRef.current = currentGender
  }, [gender, setValue])

  // Reset size and lotSize when sizeUnit changes
  const sizeUnit = watch('sizeUnit')
  const prevSizeUnitRef = useRef<string | null>(null)
  
  useEffect(() => {
    if (sizeUnit && sizeUnit !== prevSizeUnitRef.current && prevSizeUnitRef.current !== null) {
      // Only clear if unit actually changed (not on initial selection)
      setValue('size', '', { shouldValidate: false, shouldDirty: false })
      setValue('lotSize', '', { shouldValidate: false, shouldDirty: false })
    }
    
    prevSizeUnitRef.current = sizeUnit
  }, [sizeUnit, setValue])

  const handleDropdownToggle = (field: string) => {
    setOpenDropdown(openDropdown === field ? null : field)
  }

  const handleDropdownSelect = (field: string, value: string) => {
    if (field === "avatar") {
      setValue("avatar", value)
    }
    setOpenDropdown(null)
    trigger(field as any)
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      
      if (isGenderDropdownOpen && !target.closest('[data-dropdown="gender"]')) {
        setIsGenderDropdownOpen(false)
      }
      if (isPresetDropdownOpen && !target.closest('[data-dropdown="preset"]')) {
        setIsPresetDropdownOpen(false)
      }
      if (isPropertyTypeDropdownOpen && !target.closest('[data-dropdown="propertyType"]')) {
        setIsPropertyTypeDropdownOpen(false)
      }
      if (isUseMusicDropdownOpen && !target.closest('[data-dropdown="useMusic"]')) {
        setIsUseMusicDropdownOpen(false)
      }
      if (isSizeUnitDropdownOpen && !target.closest('[data-dropdown="sizeUnit"]')) {
        setIsSizeUnitDropdownOpen(false)
      }
      
      if (openDropdown === 'avatar') {
        const isInsideButton = target.closest('.avatar-dropdown-button')
        const isInsideModal = target.closest('.avatar-dropdown-modal')
        
        if (!isInsideButton && !isInsideModal) {
          setOpenDropdown(null)
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isGenderDropdownOpen, isPresetDropdownOpen, isPropertyTypeDropdownOpen, isUseMusicDropdownOpen, isSizeUnitDropdownOpen, openDropdown])

  const handleExteriorPartToggle = (part: string) => {
    setExteriorPartsData((prev) => ({
      ...prev,
      [part]: {
        ...prev[part] || { checked: false, images: [] },
        checked: !(prev[part]?.checked || false),
      },
    }))
  }

  const handleInteriorPartToggle = (part: string) => {
    setInteriorPartsData((prev) => ({
      ...prev,
      [part]: {
        ...prev[part],
        checked: !prev[part].checked,
      },
    }))
  }

  const handleInteriorNumberChange = (part: string, value: string) => {
    // Remove any non-numeric characters (whole numbers only, no decimals)
    const cleaned = value.replace(/[^0-9]/g, '')
    
    const numValue = parseInt(cleaned) || 0
    const currentImages = interiorPartsData[part].images.length
    
    if (numValue > 0 && currentImages > numValue) {
      showNotification(
        `You have ${currentImages} image(s) for "${part}" but only ${numValue} is allowed. Please remove ${currentImages - numValue} image(s) first.`,
        "warning"
      )
    }
    
    setInteriorPartsData((prev) => ({
      ...prev,
      [part]: {
        ...prev[part],
        number: cleaned,
      },
    }))
  }

  const handleImageUpload = (
    part: string,
    files: FileList | null,
    isExterior: boolean
  ) => {
    if (!files || files.length === 0) {
      console.warn('No files selected or files array is empty')
      return
    }

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
      .filter((file) => {
        const isValid = file.type.startsWith("image/")
        if (!isValid) {
          console.warn(`File ${file.name} is not a valid image type: ${file.type}`)
        }
        return isValid
      })
      .map((file) => {
        try {
          const preview = URL.createObjectURL(file)
          return {
            file,
            preview,
          }
        } catch (error) {
          console.error('Error creating object URL for file:', file.name, error)
          return null
        }
      })
      .filter((item): item is ImageFile => item !== null)
    
    if (imageFiles.length === 0) {
      showNotification(
        "This file type isn't supported.\nTry uploading a JPG, PNG, or WebP image.",
        'error'
      )
      return
    }

    // Only count images from checked parts
    const exteriorTotal = Object.values(exteriorPartsData).reduce(
      (sum, partData) => sum + (partData.checked ? partData.images.length : 0),
      0
    )
    const interiorTotal = Object.values(interiorPartsData).reduce(
      (sum, partData) => sum + (partData.checked ? partData.images.length : 0),
      0
    )
    const currentTotal = exteriorTotal + interiorTotal
    
    const currentPartImages = isExterior
      ? exteriorPartsData[part]?.images.length || 0
      : interiorPartsData[part]?.images.length || 0

    if (currentTotal + imageFiles.length > 15) {
      const allowed = 15 - currentTotal
      if (allowed <= 0) {
        showNotification(
          "Maximum limit reached! You can only upload 15 images total across all parts.",
          "error"
        )
        return
      }
      showNotification(
        `You can only upload ${allowed} more image(s). Maximum limit is 15 images total.`,
        "warning"
      )
      imageFiles.splice(allowed)
    }

    if (isExterior) {
      // Allow multiple images for exterior parts, only limited by total 15-image limit
      setExteriorPartsData((prev) => ({
        ...prev,
        [part]: {
          ...prev[part],
          images: [...prev[part].images, ...imageFiles],
        },
      }))
    } else {
      const maxImages = parseInt(interiorPartsData[part].number) || 0
      if (maxImages === 0) {
        showNotification(
          `Please specify the number of images for "${part}" in the number input field first.`,
          "warning"
        )
        return
      }

      if (currentPartImages >= maxImages) {
        showNotification(
          `Interior part "${part}" already has ${currentPartImages} image(s), which is the maximum allowed (${maxImages}). Please remove existing images first or increase the number in the input field.`,
          "error"
        )
        return
      }

      const remaining = maxImages - currentPartImages
      if (imageFiles.length > remaining) {
        const currentCount = currentPartImages
        showNotification(
          `Interior part "${part}" can only have ${maxImages} image(s) total. You currently have ${currentCount} image(s), so you can only upload ${remaining} more image(s). Please reduce the number of images you're trying to upload.`,
          "warning"
        )
        imageFiles.splice(remaining)
      }

      setInteriorPartsData((prev) => ({
        ...prev,
        [part]: {
          ...prev[part],
          images: [...prev[part].images, ...imageFiles],
        },
      }))
    }

    if (imageFiles.length > 0) {
      const newExteriorTotal = isExterior
        ? exteriorTotal + imageFiles.length
        : exteriorTotal
      const newInteriorTotal = isExterior
        ? interiorTotal
        : interiorTotal + imageFiles.length
      const newTotal = newExteriorTotal + newInteriorTotal
      
      if (newTotal >= 15) {
        showNotification(
          "Maximum limit reached! You have uploaded 15 images total.",
          "info"
        )
      }
    }
  }

  const handleRemoveImage = (
    part: string,
    index: number,
    isExterior: boolean
  ) => {
    if (isExterior) {
      setExteriorPartsData((prev) => {
        const images = [...prev[part].images]
        URL.revokeObjectURL(images[index].preview)
        images.splice(index, 1)
        return {
          ...prev,
          [part]: {
            ...prev[part],
            images,
          },
        }
      })
    } else {
      setInteriorPartsData((prev) => {
        const images = [...prev[part].images]
        URL.revokeObjectURL(images[index].preview)
        images.splice(index, 1)
        return {
          ...prev,
          [part]: {
            ...prev[part],
            images,
          },
        }
      })
    }
  }

  const [dragActive, setDragActive] = useState<Record<string, boolean>>({})
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  // Only count images from checked parts
  const totalImages = Object.values(exteriorPartsData).reduce(
    (sum, partData) => sum + (partData.checked ? partData.images.length : 0),
    0
  ) + Object.values(interiorPartsData).reduce(
    (sum, partData) => sum + (partData.checked ? partData.images.length : 0),
    0
  )

  const handleDragEnter = (e: React.DragEvent, part: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive((prev) => ({ ...prev, [part]: true }))
  }

  const handleDragLeave = (e: React.DragEvent, part: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive((prev) => ({ ...prev, [part]: false }))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (
    e: React.DragEvent,
    part: string,
    isExterior: boolean
  ) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive((prev) => ({ ...prev, [part]: false }))
    handleImageUpload(part, e.dataTransfer.files, isExterior)
  }

  const onSubmit = async (data: ListingVideoFormData) => {
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

    // Check for validation errors and trigger validation for all fields
    const isValid = await trigger()
    if (!isValid) {
      // Find first error field and scroll to it
      const firstErrorField = Object.keys(errors)[0]
      if (firstErrorField) {
        const errorElement = document.querySelector(`[name="${firstErrorField}"]`) || 
                            document.querySelector(`[id="${firstErrorField}"]`)
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          ;(errorElement as HTMLElement).focus()
        }
      }
      showNotification('Please fill all required fields correctly', 'error')
      return
    }

    // Validate that at least one image is uploaded
    if (totalImages === 0) {
      showNotification(
        "Please upload at least one image. Select a part (exterior or interior) and upload images to continue.",
        "error"
      )
      return
    }

    // Validate image limit before submission
    if (totalImages > 15) {
      showNotification(
        `Cannot submit: You have ${totalImages} images. Please remove ${totalImages - 15} image(s) to meet the 15-image limit.`,
        "error"
      )
      return
    }

    // Validate avatar is selected (additional check since Zod validates the form field)
    if (!selectedAvatars.title) {
      showNotification("Please select an avatar", "error")
      return
    }

    // Validate voice is selected if gender is selected
    if (data.gender && !selectedVoice) {
      showNotification("Please select a voice", "error")
      return
    }
    
    // Validate useMusic is selected if gender is selected
    if (data.gender && !useMusic) {
      showNotification("Please select whether to use music", "error")
      return
    }
    
    // Validate music is selected only if useMusic is "yes"
    // Trigger music field validation to show red outline if invalid
    if (data.gender && useMusic === 'yes') {
      const musicValid = await trigger('music')
      if (!musicValid || !data.music || !selectedMusic) {
        // Validation will show the error state automatically
      return
      }
    }

    setIsGeneratingScript(true)
    try {
      // Prepare images array - exterior first, then interior
      const imagesArray: Array<{ image: File; type: string }> = []

      // Only include images from checked exterior parts
      Object.entries(exteriorPartsData).forEach(([part, partData]) => {
        if (partData.checked && partData.images.length > 0) {
          partData.images.forEach((imageFile) => {
            imagesArray.push({
              image: imageFile.file,
              type: part
            })
          })
        }
      })

      // Only include images from checked interior parts
      Object.entries(interiorPartsData).forEach(([part, partData]) => {
        if (partData.checked && partData.images.length > 0) {
          partData.images.forEach((imageFile) => {
            imagesArray.push({
              image: imageFile.file,
              type: part
            })
          })
        }
      })

      // Validate that we have at least one image before proceeding
      if (imagesArray.length === 0) {
        showNotification(
          "Please upload at least one image. Select a part (exterior or interior), check it, and upload images to continue.",
          "error"
        )
        setIsGeneratingScript(false)
        return
      }

      // Build payload for first API (property-images) as FormData with binaries
      // Match required format:
      // email, name, social_handles, propertyType, types: JSON array, images: repeated binary parts
      const scriptFormData = new FormData()
      const typesArray: string[] = []
      imagesArray.forEach((item) => {
        scriptFormData.append('images', item.image)
        typesArray.push(item.type)
      })
      scriptFormData.append('types', JSON.stringify(typesArray))
      scriptFormData.append('email', userEmail)
      scriptFormData.append('name', userName || userEmail)
      scriptFormData.append('title', data.title || '')
      scriptFormData.append('city', data.city || '')
      scriptFormData.append('address', data.address || '')
      scriptFormData.append('price', data.price || '')
      // Convert unit value to display format: square_feet -> "square feet", acre -> "acres"
      const unitValue = data.sizeUnit === 'square_feet' ? 'square feet' : data.sizeUnit === 'acre' ? 'acres' : data.sizeUnit || ''
      scriptFormData.append('unit', unitValue)
      // Convert size to number
      const sizeNumber = data.size ? parseFloat(data.size) : 0
      scriptFormData.append('size', sizeNumber.toString())
      // Convert lotSize to number (optional field)
      if (data.lotSize && data.lotSize.trim() !== '') {
        const lotSizeNumber = parseFloat(data.lotSize)
        scriptFormData.append('lotSize', lotSizeNumber.toString())
      }
      scriptFormData.append('bedroomCount', data.bedroomCount || '')
      // masterBedroomCount is optional - only append if provided
      if (data.masterBedroomCount && data.masterBedroomCount.trim() !== '') {
        scriptFormData.append('masterBedroomCount', data.masterBedroomCount)
      }
      // scriptFormData.append('livingRoomCount', data.livingRoomCount || '')
      scriptFormData.append('bathroomCount', data.bathroomCount || '')
      // Parse comma-separated mainSellingPoints into array and append each item separately
      const sellingPointsArray = data.mainSellingPoints
        ? data.mainSellingPoints.split(',').map(point => point.trim()).filter(point => point.length > 0)
        : []
      // Append each selling point separately so backend receives it as an array
      // Try with array notation first, if backend doesn't support it, try without brackets
      sellingPointsArray.forEach((point) => {
        scriptFormData.append('mainSellingPoints[]', point)
      })
      scriptFormData.append('social_handles', data.socialHandles || '')
      scriptFormData.append('propertyType', data.propertyType)
      scriptFormData.append('preferredTone', data.preferredTone || '')

      const scriptResponse = await apiService.generateListingScript(scriptFormData)
      if (!scriptResponse.success || !scriptResponse.data) {
        showNotification('Oops! We encountered an issue while generating your script. Please try submitting again in a moment.', 'error')
        setIsGeneratingScript(false)
        return
      }

      // API returns { success: true, data: { webhookResponse: [...], images: [...] } }
      // apiService wraps it, so scriptResponse.data is the full response
      const responseData = scriptResponse.data?.data || scriptResponse.data || {}
      const segments = Array.isArray(responseData.webhookResponse) ? responseData.webhookResponse : []
      const extracted = segments
        .map((item: any) => item?.text || (typeof item === 'string' ? item : ''))
        .filter((text: string) => text && text.trim().length > 0)
      if (extracted.length === 0) {
        showNotification('Oops! We couldn\'t generate your script at this time. Please try submitting again in a moment.', 'error')
        setIsGeneratingScript(false)
        return
      }
      const merged = extracted.join(' ')

      const returnedImages = Array.isArray(responseData.images) ? responseData.images : []
      const normalizedImages = returnedImages
        .map((img: { type?: string; imageUrl?: string; s3Key?: string }) => ({
          type: img?.type || '',
          imageUrl: img?.imageUrl || '',
          s3Key: img?.s3Key || ''
        }))
        .filter((img: { type: string; imageUrl: string; s3Key?: string }) => img.type && img.imageUrl)

      setWebhookTexts(extracted)
      setMergedScript(merged)
      setUploadedImages(normalizedImages)
      setPendingFormData(data)
      setIsScriptModalOpen(true)
    } catch (error: any) {
      console.error('Error submitting listing form:', error)
      // Show user-friendly message for script generation errors
      showNotification('Oops! Something went wrong while generating your script. Please try again in a moment.', 'error')
    } finally {
      setIsGeneratingScript(false)
    }
  }

  const handleConfirmScript = async () => {
    if (!pendingFormData) {
      throw new Error('No pending form data found. Please try submitting again.')
    }

    if (!selectedAvatars.title) {
      throw new Error('Please select an avatar')
    }

    if (!userEmail) {
      throw new Error('User email not found. Please sign in again.')
    }

    // Transform images to match required format: { type, imageurl }
    const formattedImages = uploadedImages.map((img) => ({
      type: img.type,
      imageurl: img.imageUrl
    }))

    // Transform webhookResponse to match required format: [{ text: "..." }]
    const formattedWebhookResponse = webhookTexts.map((text) => ({
      text: text
    }))

      const payload = {
        images: formattedImages,
        webhookResponse: formattedWebhookResponse,
        email: userEmail,
        timestamp: new Date().toISOString(),
        name: userName || userEmail,
        social_handles: pendingFormData.socialHandles || '',
        propertyType: pendingFormData.propertyType,
        avatar: selectedAvatars.title.avatar_id,
        useMusic: useMusic || null,
        music: useMusic === 'yes' ? (selectedMusic?.s3FullTrackUrl || '') : null,
        videoCaption: true,
        voiceId: selectedVoice?.id || pendingFormData.voice || '',
        preset: pendingFormData.preset || '',
        title: pendingFormData.title || '',
        // Convert unit value to display format: square_feet -> "square feet", acre -> "acres"
        unit: pendingFormData.sizeUnit === 'square_feet' ? 'square feet' : pendingFormData.sizeUnit === 'acre' ? 'acres' : pendingFormData.sizeUnit || '',
        // Convert size to number
        size: pendingFormData.size ? parseFloat(pendingFormData.size) : 0,
        // Convert lotSize to number (optional field - send null if empty)
        lotSize: pendingFormData.lotSize && pendingFormData.lotSize.trim() !== '' 
          ? parseFloat(pendingFormData.lotSize) 
          : null,
        preferredTone: pendingFormData.preferredTone || ''
      }

    const response = await apiService.createListingVideo(payload)

    if (response.success) {
      showNotification('Your listing video is being created. You will be notified when it\'s ready!', 'success')
      // Modal will handle closing and redirect
    } else {
      // Improve error messages for better user experience
      let errorMessage = response.message || 'Failed to create listing video'
      if (errorMessage.toLowerCase().includes('at least one image') || errorMessage.toLowerCase().includes('image file is required')) {
        errorMessage = 'Please upload at least one image. Select a part (exterior or interior) and upload images to continue.'
      }
      throw new Error(errorMessage)
    }
  }

  return (
    <>
      <CreateVideoModal
        isOpen={isScriptModalOpen}
        onClose={() => {
          setIsScriptModalOpen(false)
          setPendingFormData(null)
        }}
        videoTitle={pendingFormData?.title || 'Listing Video'}
        mode="listing"
        script={mergedScript}
        onConfirmListing={handleConfirmScript}
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
        {/* <Link href="/tour-video" className="group inline-flex items-center gap-2 text-[#5046E5] hover:text-[#5046E5] transition-colors duration-300 w-fit mb-7">
          <FaArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
          Tour Video
        </Link> */}
        <h2 className="text-2xl md:text-[32px] font-semibold text-[#282828] mb-6">
          Fill the Property Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Title - 1st Field */}
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

          {/* Property Type - 2nd Field (Dropdown) */}
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

          {/* Avatar - 3rd Field */}
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

          {/* Gender - Always visible */}
          <div className="relative" data-dropdown="gender">
            <label className="block text-base font-normal text-[#5F5F5F] mb-1">
              Gender <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setIsGenderDropdownOpen(!isGenderDropdownOpen)}
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
                  isGenderDropdownOpen ? "rotate-180" : ""
                }`}
                style={{ color: 'inherit' }}
              />
            </button>
            {errors.gender && (
              <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
            )}
            {isGenderDropdownOpen && (
              <div className="absolute z-[9999] top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-[8px] shadow-lg max-h-60 overflow-y-auto">
                {genderOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setValue("gender", option.value)
                      setIsGenderDropdownOpen(false)
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

          {/* Preset - Shows after gender is selected */}
          {watch("gender") && (
            <div className="relative" data-dropdown="preset">
              <label className="block text-base font-normal text-[#5F5F5F] mb-1">
                Preset <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsPresetDropdownOpen(!isPresetDropdownOpen)}
                className={`w-full px-4 py-3 bg-[#F5F5F5] border-0 rounded-[8px] text-left transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white flex items-center justify-between cursor-pointer text-gray-800 ${
                  errors.preset ? 'ring-2 ring-red-500' : ''
                }`}
              >
                <span>
                  {watch("preset")
                    ? presetOptions.find((opt) => opt.value === watch("preset"))?.label || "Select Preset"
                    : "Select Preset"}
                </span>
                <IoMdArrowDropdown
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isPresetDropdownOpen ? "rotate-180" : ""
                  }`}
                  style={{ color: 'inherit' }}
                />
              </button>
              {errors.preset && (
                <p className="text-red-500 text-sm mt-1">{errors.preset.message}</p>
              )}
              {isPresetDropdownOpen && (
                <div className="absolute z-[9999] top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-[8px] shadow-lg max-h-60 overflow-y-auto">
                  {presetOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setValue("preset", option.value)
                        setIsPresetDropdownOpen(false)
                        trigger("preset")
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-[#F5F5F5] transition-colors duration-200 text-[#282828] cursor-pointer"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
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

          {/* Preferred Tone */}
          <div>
            <label className="block text-base font-normal text-[#5F5F5F] mb-1">
              Preferred Tone <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("preferredTone", { required: true })}
              placeholder="e.g. Professional, friendly, etc."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                }
              }}
              className={`w-full px-4 py-3 bg-[#F5F5F5] border-0 rounded-[8px] text-[18px] font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white transition-all duration-300 ${
                errors.preferredTone ? 'ring-2 ring-red-500' : ''
              }`}
            />
            {errors.preferredTone && (
              <p className="text-red-500 text-sm mt-1">{errors.preferredTone.message}</p>
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

          {/* Use Music? - Shows after gender is selected */}
          {watch("gender") && (
            <div className="relative" data-dropdown="useMusic">
              <label className="block text-base font-normal text-[#5F5F5F] mb-1">
                Use Music? <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsUseMusicDropdownOpen(!isUseMusicDropdownOpen)}
                className={`w-full px-4 py-3 bg-[#F5F5F5] border-0 rounded-[8px] text-left transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white flex items-center justify-between cursor-pointer text-gray-800`}
              >
                <span>
                  {useMusic === 'yes' ? 'Yes' : useMusic === 'no' ? 'No' : 'Select Option'}
                </span>
                <IoMdArrowDropdown
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isUseMusicDropdownOpen ? "rotate-180" : ""
                  }`}
                  style={{ color: 'inherit' }}
                />
              </button>
              {isUseMusicDropdownOpen && (
                <div className="absolute z-[9999] top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-[8px] shadow-lg max-h-60 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setUseMusic('yes')
                      setIsUseMusicDropdownOpen(false)
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-[#F5F5F5] transition-colors duration-200 text-[#282828] cursor-pointer"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUseMusic('no')
                      setIsUseMusicDropdownOpen(false)
                      // Clear music when "No" is selected
                      setSelectedMusic(null)
                      setCurrentMusicType(null)
                      setValue('music', '', { shouldValidate: false, shouldDirty: false })
                      trigger('music')
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-[#F5F5F5] transition-colors duration-200 text-[#282828] cursor-pointer"
                  >
                    No
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Music - Shows after gender is selected and useMusic is "yes" */}
          {watch("gender") && useMusic === 'yes' && (
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
                initialMusicType={currentMusicType as 'low' | 'medium' | 'high' | null}
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
              Price <span className="text-[10px]">(USD)</span> <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...(() => {
                const { onChange: registerOnChange, ...registerProps } = register("price", { required: true })
                return {
                  ...registerProps,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = e.target.value
                    // Remove any non-numeric characters except decimal point
                    const cleaned = value.replace(/[^0-9.]/g, '')
                    // Ensure only one decimal point
                    const parts = cleaned.split('.')
                    const finalValue = parts.length > 2 
                      ? parts[0] + '.' + parts.slice(1).join('')
                      : cleaned
                    e.target.value = finalValue
                    registerOnChange(e)
                    setValue('price', finalValue, { shouldValidate: true })
                  }
                }
              })()}
              placeholder="e.g., 2000, 2000.50"
              inputMode="decimal"
              autoComplete="off"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                }
              }}
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
              onPaste={(e) => {
                e.preventDefault()
                const pastedText = e.clipboardData.getData('text')
                const numericOnly = pastedText.replace(/[^0-9.]/g, '')
                // Only allow one decimal point
                const parts = numericOnly.split('.')
                const cleaned = parts.length > 2 
                  ? parts[0] + '.' + parts.slice(1).join('')
                  : numericOnly
                const input = e.target as HTMLInputElement
                const start = input.selectionStart || 0
                const end = input.selectionEnd || 0
                const currentValue = input.value
                const newValue = currentValue.slice(0, start) + cleaned + currentValue.slice(end)
                input.value = newValue
                setValue('price', newValue, { shouldValidate: true })
                trigger('price')
              }}
              className={`w-full px-4 py-3 bg-[#F5F5F5] border-0 rounded-[8px] text-[18px] font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white transition-all duration-300 ${
                errors.price ? 'ring-2 ring-red-500' : ''
              }`}
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
            )}
          </div>

          {/* Size Unit - Dropdown to select unit type */}
          <div className="relative" data-dropdown="sizeUnit">
            <label className="block text-base font-normal text-[#5F5F5F] mb-1">
              Size & Lot Unit <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setIsSizeUnitDropdownOpen(!isSizeUnitDropdownOpen)}
              className={`w-full px-4 py-3 bg-[#F5F5F5] border-0 rounded-[8px] text-left transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white flex items-center justify-between cursor-pointer text-gray-800 ${
                errors.sizeUnit ? 'ring-2 ring-red-500' : ''
              }`}
            >
              <span>
                {watch("sizeUnit")
                  ? sizeUnitOptions.find((opt) => opt.value === watch("sizeUnit"))?.label || "Select Unit"
                  : "Select Unit"}
              </span>
              <IoMdArrowDropdown
                className={`w-4 h-4 transition-transform duration-300 ${
                  isSizeUnitDropdownOpen ? "rotate-180" : ""
                }`}
                style={{ color: 'inherit' }}
              />
            </button>
            {errors.sizeUnit && (
              <p className="text-red-500 text-sm mt-1">{errors.sizeUnit.message}</p>
            )}
            {isSizeUnitDropdownOpen && (
              <div className="absolute z-[9999] top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-[8px] shadow-lg max-h-60 overflow-y-auto">
                {sizeUnitOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setValue("sizeUnit", option.value)
                      setIsSizeUnitDropdownOpen(false)
                      trigger("sizeUnit")
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-[#F5F5F5] transition-colors duration-200 text-[#282828] cursor-pointer"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Size - Shows after unit is selected */}
          {watch("sizeUnit") && (
          <div>
            <label className="block text-base font-normal text-[#5F5F5F] mb-1">
                Size {watch("sizeUnit") === "square_feet" ? "(Sq. Ft)" : "(Acre)"} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
                {...(() => {
                  const { onChange: registerOnChange, ...registerProps } = register("size", { required: true })
                  return {
                    ...registerProps,
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                      const value = e.target.value
                      // Remove any non-numeric characters except decimal point
                      const cleaned = value.replace(/[^0-9.]/g, '')
                      // Ensure only one decimal point
                      const parts = cleaned.split('.')
                      const finalValue = parts.length > 2 
                        ? parts[0] + '.' + parts.slice(1).join('')
                        : cleaned
                      e.target.value = finalValue
                      registerOnChange(e)
                      setValue('size', finalValue, { shouldValidate: true })
                    }
                  }
                })()}
                placeholder={watch("sizeUnit") === "square_feet" ? "e.g., 1500" : "e.g., 0.5"}
                inputMode="decimal"
                autoComplete="off"
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
                onPaste={(e) => {
                  e.preventDefault()
                  const pastedText = e.clipboardData.getData('text')
                  const numericOnly = pastedText.replace(/[^0-9.]/g, '')
                  // Only allow one decimal point
                  const parts = numericOnly.split('.')
                  const cleaned = parts.length > 2 
                    ? parts[0] + '.' + parts.slice(1).join('')
                    : numericOnly
                  const input = e.target as HTMLInputElement
                  const start = input.selectionStart || 0
                  const end = input.selectionEnd || 0
                  const currentValue = input.value
                  const newValue = currentValue.slice(0, start) + cleaned + currentValue.slice(end)
                  input.value = newValue
                  setValue('size', newValue, { shouldValidate: true })
                  trigger('size')
                }}
              className={`w-full px-4 py-3 bg-[#F5F5F5] border-0 rounded-[8px] text-[18px] font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white transition-all duration-300 ${
                errors.size ? 'ring-2 ring-red-500' : ''
              }`}
            />
            {errors.size && (
              <p className="text-red-500 text-sm mt-1">{errors.size.message}</p>
            )}
          </div>
          )}

          {/* Lot Size - Shows after unit is selected */}
          {watch("sizeUnit") && (
          <div>
            <label className="block text-base font-normal text-[#5F5F5F] mb-1">
                Lot Size {watch("sizeUnit") === "square_feet" ? "(Sq. Ft)" : "(Acre)"}
            </label>
            <input
              type="text"
                {...(() => {
                  const { onChange: registerOnChange, ...registerProps } = register("lotSize")
                  return {
                    ...registerProps,
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                      const value = e.target.value
                      // Remove any non-numeric characters except decimal point
                      const cleaned = value.replace(/[^0-9.]/g, '')
                      // Ensure only one decimal point
                      const parts = cleaned.split('.')
                      const finalValue = parts.length > 2 
                        ? parts[0] + '.' + parts.slice(1).join('')
                        : cleaned
                      e.target.value = finalValue
                      registerOnChange(e)
                      setValue('lotSize', finalValue, { shouldValidate: true })
                    }
                  }
                })()}
                placeholder={watch("sizeUnit") === "square_feet" ? "e.g., 2000" : "e.g., 1.0"}
                inputMode="decimal"
                autoComplete="off"
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
                onPaste={(e) => {
                  e.preventDefault()
                  const pastedText = e.clipboardData.getData('text')
                  const numericOnly = pastedText.replace(/[^0-9.]/g, '')
                  // Only allow one decimal point
                  const parts = numericOnly.split('.')
                  const cleaned = parts.length > 2 
                    ? parts[0] + '.' + parts.slice(1).join('')
                    : numericOnly
                  const input = e.target as HTMLInputElement
                  const start = input.selectionStart || 0
                  const end = input.selectionEnd || 0
                  const currentValue = input.value
                  const newValue = currentValue.slice(0, start) + cleaned + currentValue.slice(end)
                  input.value = newValue
                  setValue('lotSize', newValue, { shouldValidate: true })
                  trigger('lotSize')
                }}
              className={`w-full px-4 py-3 bg-[#F5F5F5] border-0 rounded-[8px] text-[18px] font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white transition-all duration-300 ${
                errors.lotSize ? 'ring-2 ring-red-500' : ''
              }`}
            />
            {errors.lotSize && (
              <p className="text-red-500 text-sm mt-1">{errors.lotSize.message}</p>
            )}
          </div>
          )}

          {/* Primary Bedroom Count */}
          <div>
            <label className="block text-base font-normal text-[#5F5F5F] mb-1">
              Primary Bedroom Count <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...(() => {
                const { onChange: registerOnChange, ...registerProps } = register("bedroomCount", { required: true })
                return {
                  ...registerProps,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = e.target.value
                    // Remove any non-numeric characters (whole numbers only, no decimals)
                    let cleaned = value.replace(/[^0-9]/g, '')
                    // Prevent entering just "0" - if user types 0 and field is empty or only 0, clear it
                    if (cleaned === '0') {
                      cleaned = ''
                    }
                    e.target.value = cleaned
                    registerOnChange(e)
                    setValue('bedroomCount', cleaned, { shouldValidate: true })
                  }
                }
              })()}
              placeholder="e.g., 1, 2, 3"
              inputMode="numeric"
              autoComplete="off"
              onKeyPress={(e) => {
                const char = e.key
                const currentValue = (e.target as HTMLInputElement).value
                // Prevent typing "0" when field is empty
                if (char === '0' && currentValue === '') {
                  e.preventDefault()
                  return
                }
                if (!/[0-9]/.test(char)) {
                  e.preventDefault()
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                }
              }}
              onPaste={(e) => {
                e.preventDefault()
                const pastedText = e.clipboardData.getData('text')
                let numericOnly = pastedText.replace(/[^0-9]/g, '')
                // Prevent pasting just "0"
                if (numericOnly === '0') {
                  numericOnly = ''
                }
                const input = e.target as HTMLInputElement
                const start = input.selectionStart || 0
                const end = input.selectionEnd || 0
                const currentValue = input.value
                const newValue = currentValue.slice(0, start) + numericOnly + currentValue.slice(end)
                input.value = newValue
                setValue('bedroomCount', newValue, { shouldValidate: true })
                trigger('bedroomCount')
              }}
              className={`w-full px-4 py-3 bg-[#F5F5F5] border-0 rounded-[8px] text-[18px] font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white transition-all duration-300 ${
                errors.bedroomCount ? 'ring-2 ring-red-500' : ''
              }`}
            />
            {errors.bedroomCount && (
              <p className="text-red-500 text-sm mt-1">{errors.bedroomCount.message}</p>
            )}
          </div>

          {/* Master Bedroom Count */}
          <div>
            <label className="block text-base font-normal text-[#5F5F5F] mb-1">
              Master Bedroom Count
            </label>
            <input
              type="text"
              {...(() => {
                const { onChange: registerOnChange, ...registerProps } = register("masterBedroomCount")
                return {
                  ...registerProps,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = e.target.value
                    // Remove any non-numeric characters (whole numbers only, no decimals)
                    let cleaned = value.replace(/[^0-9]/g, '')
                    // Prevent entering just "0" - if user types 0 and field is empty or only 0, clear it
                    if (cleaned === '0') {
                      cleaned = ''
                    }
                    e.target.value = cleaned
                    registerOnChange(e)
                    setValue('masterBedroomCount', cleaned, { shouldValidate: true })
                  }
                }
              })()}
              placeholder="e.g., 1, 2, 3"
              inputMode="numeric"
              autoComplete="off"
              onKeyPress={(e) => {
                const char = e.key
                const currentValue = (e.target as HTMLInputElement).value
                // Prevent typing "0" when field is empty
                if (char === '0' && currentValue === '') {
                  e.preventDefault()
                  return
                }
                if (!/[0-9]/.test(char)) {
                  e.preventDefault()
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                }
              }}
              onPaste={(e) => {
                e.preventDefault()
                const pastedText = e.clipboardData.getData('text')
                let numericOnly = pastedText.replace(/[^0-9]/g, '')
                // Prevent pasting just "0"
                if (numericOnly === '0') {
                  numericOnly = ''
                }
                const input = e.target as HTMLInputElement
                const start = input.selectionStart || 0
                const end = input.selectionEnd || 0
                const currentValue = input.value
                const newValue = currentValue.slice(0, start) + numericOnly + currentValue.slice(end)
                input.value = newValue
                setValue('masterBedroomCount', newValue, { shouldValidate: true })
                trigger('masterBedroomCount')
              }}
              className={`w-full px-4 py-3 bg-[#F5F5F5] border-0 rounded-[8px] text-[18px] font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white transition-all duration-300 ${
                errors.masterBedroomCount ? 'ring-2 ring-red-500' : ''
              }`}
            />
            {errors.masterBedroomCount && (
              <p className="text-red-500 text-sm mt-1">{errors.masterBedroomCount.message}</p>
            )}
          </div>

          {/* Restroom Count */}
          <div>
            <label className="block text-base font-normal text-[#5F5F5F] mb-1">
              Restroom Count <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...(() => {
                const { onChange: registerOnChange, ...registerProps } = register("bathroomCount", { required: true })
                return {
                  ...registerProps,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = e.target.value
                    // Remove any non-numeric characters (whole numbers only, no decimals)
                    let cleaned = value.replace(/[^0-9]/g, '')
                    // Prevent entering just "0" - if user types 0 and field is empty or only 0, clear it
                    if (cleaned === '0') {
                      cleaned = ''
                    }
                    e.target.value = cleaned
                    registerOnChange(e)
                    setValue('bathroomCount', cleaned, { shouldValidate: true })
                  }
                }
              })()}
              placeholder="e.g., 1, 2, 3"
              inputMode="numeric"
              autoComplete="off"
              onKeyPress={(e) => {
                const char = e.key
                const currentValue = (e.target as HTMLInputElement).value
                // Prevent typing "0" when field is empty
                if (char === '0' && currentValue === '') {
                  e.preventDefault()
                  return
                }
                if (!/[0-9]/.test(char)) {
                  e.preventDefault()
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                }
              }}
              onPaste={(e) => {
                e.preventDefault()
                const pastedText = e.clipboardData.getData('text')
                let numericOnly = pastedText.replace(/[^0-9]/g, '')
                // Prevent pasting just "0"
                if (numericOnly === '0') {
                  numericOnly = ''
                }
                const input = e.target as HTMLInputElement
                const start = input.selectionStart || 0
                const end = input.selectionEnd || 0
                const currentValue = input.value
                const newValue = currentValue.slice(0, start) + numericOnly + currentValue.slice(end)
                input.value = newValue
                setValue('bathroomCount', newValue, { shouldValidate: true })
                trigger('bathroomCount')
              }}
              className={`w-full px-4 py-3 bg-[#F5F5F5] border-0 rounded-[8px] text-[18px] font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white transition-all duration-300 ${
                errors.bathroomCount ? 'ring-2 ring-red-500' : ''
              }`}
            />
            {errors.bathroomCount && (
              <p className="text-red-500 text-sm mt-1">{errors.bathroomCount.message}</p>
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
        </div>
      </div>

      {/* Image Count Notification */}
      <div className="bg-white p-2">
        <div className={`p-4 rounded-lg border-2 ${
          totalImages >= 15 
            ? 'bg-red-50 border-red-200 text-red-800' 
            : totalImages >= 12
            ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
            : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Your Images:</span>
              <span className={`font-bold ${totalImages >= 15 ? 'text-red-600' : totalImages >= 12 ? 'text-yellow-600' : 'text-blue-600'}`}>
                {totalImages} of 15 selected
              </span>
            </div>
            <div className="text-sm">
              {totalImages >= 15 ? (
                <span className="text-red-600 font-medium">Maximum limit reached</span>
              ) : totalImages >= 12 ? (
                <span className="text-yellow-600 font-medium">Approaching limit</span>
              ) : (
                <span className="text-blue-600">{15 - totalImages} more images allowed</span>
              )}
            </div>
          </div>
          <div className="mt-3 text-sm">
            <p className="text-sm font-medium mb-2">How it works:</p>
            <ul className="space-y-1.5 text-xs opacity-90">
              <li className="flex items-end gap-2">
                <span className="text-[#5046E5] mt-1">•</span>
                <span><strong>Exterior parts:</strong> Upload multiple images per part (e.g., multiple views of the front, back, etc.)</span>
              </li>
              <li className="flex items-end gap-2">
                <span className="text-[#5046E5] mt-1">•</span>
                <span><strong>Interior parts:</strong> Enter a number first, then upload that many images (e.g., enter "3" to upload 3 primary bedroom photos)</span>
              </li>
              <li className="flex items-end gap-2">
                <span className="text-[#5046E5] mt-1">•</span>
                <span><strong>Total limit:</strong> You can upload up to 15 images across all parts combined</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Exterior Parts Section */}
      <div className="bg-white p-2">
        <h2 className="text-2xl md:text-[32px] font-semibold text-[#171717] mb-6">
          Fill the Exterior Parts Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {exteriorParts.map((part) => (
            <div key={part} className={`space-y-3 ${exteriorPartsData[part]?.checked ? 'bg-[#F4F4F4] p-4 rounded-lg' : ''}`}>
              <label className={`flex items-center gap-2 cursor-pointer ${exteriorPartsData[part]?.checked ? '' : 'bg-[#F4F4F4] px-3 py-2 rounded-lg inline-block'}`}>
                <input
                  type="checkbox"
                  checked={exteriorPartsData[part]?.checked}
                  onChange={() => handleExteriorPartToggle(part)}
                  className="w-4 h-4 text-[#5046E5] bg-white border-gray-300 rounded focus:ring-[#5046E5] checked:bg-[#5046E5]"
                />
                <span className="text-base font-normal text-[#5F5F5F]">
                  {part}
                </span>
              </label>

              {exteriorPartsData[part]?.checked && (
                <div
                  className={`border-2 border-dashed rounded-lg p-4 min-h-[140px] flex flex-col items-center justify-center cursor-pointer transition-all duration-200 bg-white ${
                    dragActive[`exterior-${part}`]
                      ? "border-[#5046E5] bg-[#F5F7FC] ring-2 ring-[#5046E5] ring-offset-2"
                      : "border-gray-300"
                  }`}
                  onDragEnter={(e) => handleDragEnter(e, `exterior-${part}`)}
                  onDragLeave={(e) => handleDragLeave(e, `exterior-${part}`)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, part, true)}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => {
                      handleImageUpload(part, e.target.files, true)
                      // Reset input value to allow selecting the same file again
                      if (e.target) {
                        e.target.value = ''
                      }
                    }}
                    className="hidden"
                    id={`exterior-${part}`}
                    ref={(el) => {
                      fileInputRefs.current[`exterior-${part}`] = el
                    }}
                  />
                  {exteriorPartsData[part]?.images.length === 0 ? (
                    <div 
                      className="cursor-pointer text-center w-full"
                      onClick={() => {
                        fileInputRefs.current[`exterior-${part}`]?.click()
                      }}
                    >
                      <p className="text-base font-semibold text-[#5F5F5F] mb-2">
                        Upload {part} Image
                      </p>
                        <p className="text-xs text-gray-500 mb-3">
                          Supported formats: JPG, PNG, or WebP
                        </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          fileInputRefs.current[`exterior-${part}`]?.click()
                        }}
                        className="text-sm text-[#5046E5] px-4 py-2 rounded-full bg-[#5046E51A] hover:bg-[#5046E525] transition-colors font-medium"
                      >
                        Choose File
                      </button>
                    </div>
                  ) : (
                    <div className="w-full">
                      {(() => {
                        const canAddMore = totalImages < 15
                        
                        return (
                          <>
                            {canAddMore && (
                              <div className="text-center w-full block mb-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    fileInputRefs.current[`exterior-${part}`]?.click()
                                  }}
                                  className="text-sm text-[#5046E5] hover:underline cursor-pointer"
                                >
                                  Add more images
                                </button>
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-2 w-full">
                              {(exteriorPartsData[part]?.images || []).map((img, idx) => (
                                <div
                                  key={idx}
                                  className="relative group rounded overflow-hidden"
                                >
                                  <Image
                                    src={img.preview}
                                    alt={`${part} ${idx + 1}`}
                                    width={100}
                                    height={100}
                                    className="w-full h-24 object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveImage(part, idx, true)
                                    }
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Interior Parts Section */}
      <div className="bg-white p-2">
        <h2 className="text-2xl md:text-[32px] font-semibold text-[#171717] mb-6">
          Fill the Interior Parts Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {interiorParts.map((part) => (
            <div key={part} className={`space-y-3 ${interiorPartsData[part].checked ? 'bg-[#F4F4F4] p-4 rounded-lg' : ''}`}>
              <label className={`flex items-center gap-2 cursor-pointer ${interiorPartsData[part].checked ? '' : 'bg-[#F4F4F4] px-3 py-2 rounded-lg inline-block'}`}>
                <input
                  type="checkbox"
                  checked={interiorPartsData[part].checked}
                  onChange={() => handleInteriorPartToggle(part)}
                  className="w-4 h-4 text-[#5046E5] bg-white border-gray-300 rounded focus:ring-[#5046E5] checked:bg-[#5046E5]"
                />
                <span className="text-base font-normal text-[#5F5F5F]">
                  {part}
                </span>
              </label>

              {interiorPartsData[part].checked && (
                <>
                  <input
                    type="text"
                    value={interiorPartsData[part].number}
                    onChange={(e) =>
                      handleInteriorNumberChange(part, e.target.value)
                    }
                    placeholder="Specify number of images"
                    inputMode="numeric"
                    autoComplete="off"
                    onKeyPress={(e) => {
                      const char = e.key
                      if (!/[0-9]/.test(char)) {
                        e.preventDefault()
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault()
                      const pastedText = e.clipboardData.getData('text')
                      const numericOnly = pastedText.replace(/[^0-9]/g, '')
                      handleInteriorNumberChange(part, numericOnly)
                    }}
                    className="w-full px-4 py-3 bg-white border-0 rounded-[8px] text-[18px] font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white transition-all duration-300"
                  />

                  <div
                    className={`border-2 border-dashed rounded-lg p-4 min-h-[140px] flex flex-col items-center justify-center transition-all duration-200 ${
                      !interiorPartsData[part].number || parseInt(interiorPartsData[part].number) <= 0
                        ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                        : dragActive[`interior-${part}`]
                        ? "border-[#5046E5] bg-[#F5F7FC] cursor-pointer bg-white ring-2 ring-[#5046E5] ring-offset-2"
                        : "border-gray-300 cursor-pointer bg-white"
                    }`}
                    onDragEnter={(e) => {
                      if (interiorPartsData[part].number && parseInt(interiorPartsData[part].number) > 0) {
                        handleDragEnter(e, `interior-${part}`)
                      }
                    }}
                    onDragLeave={(e) => {
                      if (interiorPartsData[part].number && parseInt(interiorPartsData[part].number) > 0) {
                        handleDragLeave(e, `interior-${part}`)
                      }
                    }}
                    onDragOver={(e) => {
                      if (interiorPartsData[part].number && parseInt(interiorPartsData[part].number) > 0) {
                        handleDragOver(e)
                      }
                    }}
                    onDrop={(e) => {
                      if (interiorPartsData[part].number && parseInt(interiorPartsData[part].number) > 0) {
                        handleDrop(e, part, false)
                      }
                    }}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(e) => {
                        handleImageUpload(part, e.target.files, false)
                        // Reset input value to allow selecting the same file again
                        if (e.target) {
                          e.target.value = ''
                        }
                      }}
                      className="hidden"
                      id={`interior-${part}`}
                      disabled={!interiorPartsData[part].number || parseInt(interiorPartsData[part].number) <= 0}
                      ref={(el) => {
                        fileInputRefs.current[`interior-${part}`] = el
                      }}
                    />
                    {interiorPartsData[part].images.length === 0 ? (
                      <div 
                        className={`text-center w-full ${
                          !interiorPartsData[part].number || parseInt(interiorPartsData[part].number) <= 0
                            ? "cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                        onClick={() => {
                          if (interiorPartsData[part].number && parseInt(interiorPartsData[part].number) > 0) {
                            fileInputRefs.current[`interior-${part}`]?.click()
                          }
                        }}
                      >
                        {!interiorPartsData[part].number || parseInt(interiorPartsData[part].number) <= 0 ? (
                          <p className="text-base text-gray-400">
                            Specify how many images you want to upload for {part}
                          </p>
                        ) : (
                          <>
                            <p className="text-base font-semibold text-[#5F5F5F] mb-1">
                              Drag and drop Images
                            </p>
                        <p className="text-xs text-gray-400 mb-3">
                          JPG, PNG, or WebP
                        </p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (interiorPartsData[part].number && parseInt(interiorPartsData[part].number) > 0) {
                                  fileInputRefs.current[`interior-${part}`]?.click()
                                }
                              }}
                              className="text-sm text-[#5046E5] px-3 py-1 rounded-full bg-[#5046E51A]"
                            >
                              Browse local files
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="w-full">
                        {(() => {
                          const maxImages = parseInt(interiorPartsData[part].number) || 0
                          const currentImages = interiorPartsData[part].images.length
                          const canAddMore = currentImages < maxImages
                          
                          return (
                            <>
                              {canAddMore && (
                                <div className="text-center w-full block mb-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      fileInputRefs.current[`interior-${part}`]?.click()
                                    }}
                                    className="text-sm text-[#5046E5] hover:underline cursor-pointer"
                                  >
                                    Add more images
                                  </button>
                                </div>
                              )}
                              <div className="grid grid-cols-2 gap-2 w-full">
                                {interiorPartsData[part].images.map((img, idx) => (
                                  <div
                                    key={idx}
                                    className="relative group rounded overflow-hidden"
                                  >
                                    <Image
                                      src={img.preview}
                                      alt={`${part} ${idx + 1}`}
                                      width={100}
                                      height={100}
                                      className="w-full h-24 object-cover"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveImage(part, idx, false)
                                      }
                                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-6">
        {totalImages > 15 && (
          <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <p className="text-red-800 font-medium text-center">
              ⚠️ Cannot submit: You have {totalImages} images. Please remove {totalImages - 15} image(s) to meet the 15-image limit.
            </p>
          </div>
        )}
        <SubmitButton
          isLoading={isGeneratingScript}
          disabled={totalImages > 15}
          loadingText="Processing... This may take 30-50 seconds"
          buttonText="Submit"
        />
      </div>
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
