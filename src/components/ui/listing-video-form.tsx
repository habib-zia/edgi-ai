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
import VoiceSelectorWrapper from './voice-selector-wrapper'
import MusicSelectorWrapper from './music-selector-wrapper'
import { Voice, VoiceType } from './voice-selector/types'
import { useVoicesAndMusic } from '@/hooks/useVoicesAndMusic'
import { listingVideoSchema, ListingVideoFormData } from './form-validation-schema'
import { useAppSelector } from '@/store/hooks'
import SubmitButton from './submit-button'

// Exterior parts options
const exteriorParts = [
  "Roof",
  "Chimney",
  "Walls",
  "Windows",
  "Doors",
  "Porch",
  "Balcony",
  "Garage",
  "Driveway",
  "Fence",
  "Garden / Yard",
]

// Interior parts options
const interiorParts = [
  "Living room",
  "Bedroom",
  "Kitchen",
  "Dining room",
  "Bathroom / Washroom",
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

// Property Type options
const propertyTypeOptions = [
  { value: 'Apartment / Condo', label: 'Apartment / Condo' },
  { value: 'Single-Family Home', label: 'Single-Family Home' },
  { value: 'Townhouse', label: 'Townhouse' },
  { value: 'Duplex / Multi-Family', label: 'Duplex / Multi-Family' },
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
      voice: '',
      music: '',
      city: '',
      address: '',
      price: '',
      socialHandles: '',
      preset: '',
    },
  })

  const user = useAppSelector((state) => state.user.user)
  const userName = user ? `${user.firstName} ${user.lastName}`.trim() : ''
  const userEmail = user?.email || ''

  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false)
  const [isPropertyTypeDropdownOpen, setIsPropertyTypeDropdownOpen] = useState(false)
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false)
  const [isGeneratingScript, setIsGeneratingScript] = useState(false)
  const [isFinalSubmitting, setIsFinalSubmitting] = useState(false)
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
      if (isPropertyTypeDropdownOpen && !target.closest('[data-dropdown="propertyType"]')) {
        setIsPropertyTypeDropdownOpen(false)
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
  }, [isGenderDropdownOpen, isPropertyTypeDropdownOpen, openDropdown])

  const handleExteriorPartToggle = (part: string) => {
    setExteriorPartsData((prev) => ({
      ...prev,
      [part]: {
        ...prev[part],
        checked: !prev[part].checked,
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
    const numValue = parseInt(value) || 0
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
        number: value,
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
      showNotification('No valid image files selected. Please select JPG, PNG, or AVG files.', 'error')
      return
    }

    const exteriorTotal = Object.values(exteriorPartsData).reduce(
      (sum, partData) => sum + partData.images.length,
      0
    )
    const interiorTotal = Object.values(interiorPartsData).reduce(
      (sum, partData) => sum + partData.images.length,
      0
    )
    const currentTotal = exteriorTotal + interiorTotal
    
    const currentPartImages = isExterior
      ? exteriorPartsData[part].images.length
      : interiorPartsData[part].images.length

    if (currentTotal + imageFiles.length > 10) {
      const allowed = 10 - currentTotal
      if (allowed <= 0) {
        showNotification(
          "Maximum limit reached! You can only upload 10 images total across all parts.",
          "error"
        )
        return
      }
      showNotification(
        `You can only upload ${allowed} more image(s). Maximum limit is 10 images total.`,
        "warning"
      )
      imageFiles.splice(allowed)
    }

    if (isExterior) {
      if (currentPartImages >= 1) {
        showNotification(
          `Exterior part "${part}" can only have 1 image. Please remove the existing image first.`,
          "error"
        )
        return
      }
      if (imageFiles.length > 1) {
        showNotification(
          `Exterior part "${part}" can only have 1 image. Only the first image will be uploaded.`,
          "warning"
        )
        imageFiles.splice(1)
      }

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
          `Interior part "${part}" can only have ${maxImages} image(s) as specified. Please remove existing images first.`,
          "error"
        )
        return
      }

      const remaining = maxImages - currentPartImages
      if (imageFiles.length > remaining) {
        showNotification(
          `Interior part "${part}" can only have ${maxImages} image(s). Only ${remaining} more image(s) can be uploaded.`,
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
      
      if (newTotal >= 10) {
        showNotification(
          "Maximum limit reached! You have uploaded 10 images total.",
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

  const totalImages = Object.values(exteriorPartsData).reduce(
    (sum, partData) => sum + partData.images.length,
    0
  ) + Object.values(interiorPartsData).reduce(
    (sum, partData) => sum + partData.images.length,
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

    // Check for validation errors
    const hasErrors = Object.keys(errors).length > 0
    if (hasErrors) {
      showNotification('Please fill all required fields below', 'error')
      return
    }

    // Validate image limit before submission
    if (totalImages > 10) {
      showNotification(
        `Cannot submit: You have ${totalImages} images. Please remove ${totalImages - 10} image(s) to meet the 10-image limit.`,
        "error"
      )
      return
    }

    // Validate avatar is selected (additional check since Zod validates the form field)
    if (!selectedAvatars.title) {
      showNotification("Please select an avatar", "error")
      return
    }

    // Validate voice and music are selected if gender is selected
    if (data.gender && !selectedVoice) {
      showNotification("Please select a voice", "error")
      return
    }
    
    if (data.gender && !selectedMusic) {
      showNotification("Please select music", "error")
      return
    }

    setIsGeneratingScript(true)
    try {
      // Prepare images array - exterior first, then interior
      const imagesArray: Array<{ image: File; type: string }> = []

      Object.entries(exteriorPartsData).forEach(([part, partData]) => {
        if (partData.images.length > 0) {
          partData.images.forEach((imageFile) => {
            imagesArray.push({
              image: imageFile.file,
              type: part
            })
          })
        }
      })

      Object.entries(interiorPartsData).forEach(([part, partData]) => {
        if (partData.images.length > 0) {
          partData.images.forEach((imageFile) => {
            imagesArray.push({
              image: imageFile.file,
              type: part
            })
          })
        }
      })

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
      scriptFormData.append('social_handles', data.socialHandles || '')
      scriptFormData.append('propertyType', data.propertyType)

      const scriptResponse = await apiService.generateListingScript(scriptFormData)
      if (!scriptResponse.success || !scriptResponse.data) {
        showNotification(scriptResponse.message || 'Failed to generate listing script', 'error')
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
        showNotification('No script returned from generator. Please try again.', 'error')
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
      showNotification(error.message || 'Failed to create listing video', 'error')
    } finally {
      setIsGeneratingScript(false)
    }
  }

  const handleConfirmScript = async () => {
    if (!pendingFormData) {
      showNotification('No pending form data found. Please try submitting again.', 'error')
      return
    }

    if (!selectedAvatars.title) {
      showNotification("Please select an avatar", "error")
      return
    }

    if (!userEmail) {
      showNotification('User email not found. Please sign in again.', 'error')
      return
    }

    setIsFinalSubmitting(true)
    try {
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
        music: selectedMusic?.s3FullTrackUrl || '',
        videoCaption: true,
        voiceId: selectedVoice?.id || pendingFormData.voice || '',
        title: pendingFormData.title || ''
      }

      const response = await apiService.createListingVideo(payload)

      if (response.success) {
        showNotification('Listing video created successfully!', 'success')
        setIsScriptModalOpen(false)
        setPendingFormData(null)
      } else {
        showNotification(response.message || 'Failed to create listing video', 'error')
      }
    } catch (error: any) {
      console.error('Error confirming listing submission:', error)
      showNotification(error.message || 'Failed to create listing video', 'error')
    } finally {
      setIsFinalSubmitting(false)
    }
  }

  return (
    <>
      {isScriptModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-x-hidden">
          <div className="bg-white rounded-[12px] max-w-[800px] w-full max-h-[70vh] flex flex-col relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-4 flex-shrink-0">
              <h3 className="md:text-[32px] text-[24px] font-semibold text-[#282828]">
                {isFinalSubmitting ? 'Creating listing video' : 'Generated Script Preview'}
              </h3>

              {/* Hide close button when submitting */}
              {!isFinalSubmitting && (
                <button
                  onClick={() => setIsScriptModalOpen(false)}
                  className="cursor-pointer"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.5 1.5L1.5 22.5M1.5 1.5L22.5 22.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>

            {/* Modal Content */}
            <div className="px-6 pt-2 pb-6 overflow-y-auto flex-1">
              {isFinalSubmitting ? (
                /* Loading State */
                <div className="flex flex-col items-center justify-center py-12">
                  <svg className="animate-spin h-12 w-12 text-[#5046E5] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-xl font-semibold text-gray-800 mb-2">Processing...</p>
                  <p className="text-sm text-[#5F5F5F]">This may take 30-50 seconds</p>
                </div>
              ) : (
                /* Script Preview */
                <>
                  <p className="text-base text-[#5F5F5F] mb-4">
                    Review the script generated from your images. Click confirm to create your listing video.
                  </p>
                  <div className="mb-6">
                    <label className="block text-base font-normal text-[#5F5F5F] mb-2">
                      Generated Script <span className="text-red-500">*</span>
                    </label>
                    <div className="w-full min-h-[300px] max-h-[400px] px-4 py-3 bg-[#EEEEEE] border-0 rounded-[8px] text-gray-800 whitespace-pre-line overflow-y-auto">
                      {mergedScript || 'No script generated.'}
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={handleConfirmScript}
                      className="px-6 py-3 rounded-lg bg-[#5046E5] text-white hover:bg-[#4037c0] font-medium disabled:opacity-60"
                      disabled={isFinalSubmitting}
                    >
                      Confirm & Create Video
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Property Details Section */}
      <div className="bg-white p-6 md:p-8">
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

          {/* Gender - 4th Field */}
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

          {/* City - Always visible */}
          <div>
            <label className="block text-base font-normal text-[#5F5F5F] mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("city", { required: true })}
              placeholder="Please Specify"
              className={`w-full px-4 py-3 bg-[#F5F5F5] border-0 rounded-[8px] text-[18px] font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white transition-all duration-300 ${
                errors.city ? 'ring-2 ring-red-500' : ''
              }`}
            />
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
            )}
          </div>

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
                musicList={allMusic.length > 0 ? allMusic : musicList}
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
              placeholder="Please Specify"
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
              placeholder="Please Specify"
              className={`w-full px-4 py-3 bg-[#F5F5F5] border-0 rounded-[8px] text-[18px] font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white transition-all duration-300 ${
                errors.price ? 'ring-2 ring-red-500' : ''
              }`}
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
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
              placeholder="Please Specify"
              className={`w-full px-4 py-3 bg-[#F5F5F5] border-0 rounded-[8px] text-[18px] font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white transition-all duration-300 ${
                errors.socialHandles ? 'ring-2 ring-red-500' : ''
              }`}
            />
            {errors.socialHandles && (
              <p className="text-red-500 text-sm mt-1">{errors.socialHandles.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Image Count Notification */}
      <div className="bg-white p-6 md:p-8">
        <div className={`p-4 rounded-lg border-2 ${
          totalImages >= 10 
            ? 'bg-red-50 border-red-200 text-red-800' 
            : totalImages >= 7
            ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
            : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Image Upload Status:</span>
              <span className={`font-bold ${totalImages >= 10 ? 'text-red-600' : totalImages >= 7 ? 'text-yellow-600' : 'text-blue-600'}`}>
                {totalImages} / 10 images
              </span>
            </div>
            <div className="text-sm">
              {totalImages >= 10 ? (
                <span className="text-red-600 font-medium">Maximum limit reached</span>
              ) : totalImages >= 7 ? (
                <span className="text-yellow-600 font-medium">Approaching limit</span>
              ) : (
                <span className="text-blue-600">{10 - totalImages} images remaining</span>
              )}
            </div>
          </div>
          <div className="mt-2 text-sm">
            <p className="text-xs opacity-80">
              • Exterior parts: 1 image per part maximum
              <br />
              • Interior parts: Based on number input (e.g., if you enter "3", you can upload 3 images for that part)
              <br />
              • Overall limit: 10 images total across all parts
            </p>
          </div>
        </div>
      </div>

      {/* Exterior Parts Section */}
      <div className="bg-white p-6 md:p-8">
        <h2 className="text-2xl md:text-[32px] font-semibold text-[#171717] mb-6">
          Fill the Exterior Parts Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {exteriorParts.map((part) => (
            <div key={part} className={`space-y-3 ${exteriorPartsData[part].checked ? 'bg-[#F4F4F4] p-4 rounded-lg' : ''}`}>
              <label className={`flex items-center gap-2 cursor-pointer ${exteriorPartsData[part].checked ? '' : 'bg-[#F4F4F4] px-3 py-2 rounded-lg inline-block'}`}>
                <input
                  type="checkbox"
                  checked={exteriorPartsData[part].checked}
                  onChange={() => handleExteriorPartToggle(part)}
                  className="w-4 h-4 text-[#5046E5] bg-white border-gray-300 rounded focus:ring-[#5046E5] checked:bg-[#5046E5]"
                />
                <span className="text-base font-normal text-[#5F5F5F]">
                  {part}
                </span>
              </label>

              {exteriorPartsData[part].checked && (
                <div
                  className={`border-2 border-dashed rounded-lg p-4 min-h-[140px] flex flex-col items-center justify-center cursor-pointer transition-colors bg-white ${
                    dragActive[`exterior-${part}`]
                      ? "border-[#5046E5] bg-[#F5F7FC]"
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
                    accept="image/jpeg,image/jpg,image/png,image/avg"
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
                  {exteriorPartsData[part].images.length === 0 ? (
                    <div 
                      className="cursor-pointer text-center w-full"
                      onClick={() => {
                        fileInputRefs.current[`exterior-${part}`]?.click()
                      }}
                    >
                      <p className="text-base font-semibold text-[#5F5F5F] mb-1">
                        Drag and drop Images
                      </p>
                      <p className="text-xs text-gray-400 mb-3">
                        JPG, PNG or AVG
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          fileInputRefs.current[`exterior-${part}`]?.click()
                        }}
                        className="text-sm text-[#5046E5] px-3 py-1 rounded-full bg-[#5046E51A]"
                      >
                        Browse local files
                      </button>
                    </div>
                  ) : (
                    <div className="w-full">
                      <div className="relative group rounded overflow-hidden">
                        <Image
                          src={exteriorPartsData[part].images[0].preview}
                          alt={part}
                          width={100}
                          height={100}
                          className="w-full h-24 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveImage(part, 0, true)
                          }
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Interior Parts Section */}
      <div className="bg-white p-6 md:p-8">
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
                    placeholder="Please Specify Numbers"
                    className="w-full px-4 py-3 bg-white border-0 rounded-[8px] text-[18px] font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white transition-all duration-300"
                  />

                  <div
                    className={`border-2 border-dashed rounded-lg p-4 min-h-[140px] flex flex-col items-center justify-center transition-colors ${
                      !interiorPartsData[part].number || parseInt(interiorPartsData[part].number) <= 0
                        ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                        : dragActive[`interior-${part}`]
                        ? "border-[#5046E5] bg-[#F5F7FC] cursor-pointer bg-white"
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
                      accept="image/jpeg,image/jpg,image/png,image/avg"
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
                          <>
                            <p className="text-base font-semibold text-gray-400 mb-1">
                              Enter number first
                            </p>
                            <p className="text-xs text-gray-400">
                              Please specify the number of images above
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-base font-semibold text-[#5F5F5F] mb-1">
                              Drag and drop Images
                            </p>
                            <p className="text-xs text-gray-400 mb-3">
                              JPG, PNG or AVG
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
        {totalImages > 10 && (
          <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <p className="text-red-800 font-medium text-center">
              ⚠️ Cannot submit: You have {totalImages} images. Please remove {totalImages - 10} image(s) to meet the 10-image limit.
            </p>
          </div>
        )}
        <SubmitButton
          isLoading={isGeneratingScript}
          disabled={totalImages > 10}
          loadingText="Processing... This may take 30-50 seconds"
          buttonText="Submit"
        />
      </div>
    </form>
    </>
  )
}
