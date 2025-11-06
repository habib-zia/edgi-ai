'use client'

import { useState, useEffect, useCallback } from 'react'
import { Avatar } from '@/lib/api-service'
import { apiService } from '@/lib/api-service'

import { UseFormSetValue, UseFormTrigger } from 'react-hook-form'
import { CreateVideoFormData } from '@/components/ui/form-validation-schema'

interface UseAvatarManagementProps {
  latestAvatarUpdate: any
  setValue: UseFormSetValue<CreateVideoFormData>
  trigger: UseFormTrigger<CreateVideoFormData>
}

interface UseAvatarManagementReturn {
  avatars: { custom: Avatar[]; default: Avatar[] }
  avatarsLoading: boolean
  avatarsError: string | null
  selectedAvatars: {
    title: Avatar | null
    body: Avatar | null
    conclusion: Avatar | null
  }
  draggedAvatar: Avatar | null
  fetchAvatars: () => Promise<void>
  setSelectedAvatars: React.Dispatch<React.SetStateAction<{
    title: Avatar | null
    body: Avatar | null
    conclusion: Avatar | null
  }>>
  setDraggedAvatar: React.Dispatch<React.SetStateAction<Avatar | null>>
  handleDragStart: (e: React.DragEvent, avatar: Avatar) => void
  handleDragEnd: (e: React.DragEvent) => void
  handleDragOver: (e: React.DragEvent) => void
  handleDragLeave: (e: React.DragEvent) => void
  handleDrop: (e: React.DragEvent, dropZone: 'title' | 'body' | 'conclusion') => void
  handleRemoveAvatar: (dropZone: 'title' | 'body' | 'conclusion') => void
  handleClearAllAvatars: () => void
  handleAvatarClick: (avatar: Avatar) => void
  isAvatarPending: (avatar: Avatar) => boolean
  getAvatarType: (avatar: Avatar) => 'custom' | 'default'
  isAvatarTypeAllowed: (avatar: Avatar) => boolean
  isAvatarSelected: (avatar: Avatar) => boolean
  getAvatarSelectionNumber: (avatar: Avatar) => number | null
}

export function useAvatarManagement({
  latestAvatarUpdate,
  setValue,
  trigger
}: UseAvatarManagementProps): UseAvatarManagementReturn {
  const [avatars, setAvatars] = useState<{ custom: Avatar[], default: Avatar[] }>({ custom: [], default: [] })
  const [avatarsLoading, setAvatarsLoading] = useState(false)
  const [avatarsError, setAvatarsError] = useState<string | null>(null)
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
          default: defaultAvatars
        })

        setAvatarsError(null)
      } else {
        setAvatarsError(response.message || 'Failed to fetch avatars')
      }
    } catch (error: any) {
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

  const isAvatarPending = (avatar: Avatar) => {
    const isCustomAvatar = avatars.custom.some(customAvatar => customAvatar.avatar_id === avatar.avatar_id)
    return isCustomAvatar && (avatar.status === 'pending' || avatar.status === 'processing' || avatar.status === 'creating')
  }

  const getAvatarType = (avatar: Avatar): 'custom' | 'default' => {
    return avatars.custom.some(customAvatar => customAvatar.avatar_id === avatar.avatar_id) ? 'custom' : 'default'
  }

  const isAvatarTypeAllowed = (_avatar: Avatar): boolean => {
    return true
  }

  const handleDragStart = (e: React.DragEvent, avatar: Avatar) => {
    e.stopPropagation()
    setDraggedAvatar(avatar)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', avatar.avatar_id)
    const target = e.target as HTMLElement
    target.classList.add('dragging')
  }

  const handleDragEnd = (e: React.DragEvent) => {
    e.stopPropagation()
    const target = e.target as HTMLElement
    target.classList.remove('dragging')
    setDraggedAvatar(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    const target = e.currentTarget as HTMLElement
    target.classList.add('drag-over')
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation()
    const target = e.currentTarget as HTMLElement
    target.classList.remove('drag-over')
  }

  const handleDrop = (e: React.DragEvent, dropZone: 'title' | 'body' | 'conclusion') => {
    e.preventDefault()
    e.stopPropagation()
    const target = e.currentTarget as HTMLElement
    target.classList.remove('drag-over')

    if (draggedAvatar) {
      if (!isAvatarTypeAllowed(draggedAvatar)) {
        setDraggedAvatar(null)
        return
      }

      setSelectedAvatars(prev => ({
        ...prev,
        [dropZone]: draggedAvatar
      }))

      setValue('avatar', draggedAvatar.avatar_id as any)
      trigger('avatar' as any)
    }
    setDraggedAvatar(null)
  }

  const handleRemoveAvatar = (dropZone: 'title' | 'body' | 'conclusion') => {
    setSelectedAvatars(prev => ({
      ...prev,
      [dropZone]: null
    }))

    const remainingAvatars = Object.values({
      ...selectedAvatars,
      [dropZone]: null
    }).filter(Boolean) as Avatar[]

    if (remainingAvatars.length > 0) {
      setValue('avatar', remainingAvatars[0].avatar_id as any)
    } else {
      setValue('avatar', '' as any)
    }
    trigger('avatar' as any)
  }

  const handleClearAllAvatars = () => {
    setSelectedAvatars({
      title: null,
      body: null,
      conclusion: null
    })
    setValue('avatar', '' as any)
    trigger('avatar' as any)
  }

  const isAvatarSelected = (avatar: Avatar) => {
    return selectedAvatars.title?.avatar_id === avatar.avatar_id ||
           selectedAvatars.body?.avatar_id === avatar.avatar_id ||
           selectedAvatars.conclusion?.avatar_id === avatar.avatar_id
  }

  const handleAvatarClick = (avatar: Avatar) => {
    if (isAvatarPending(avatar)) {
      return
    }

    const isSelected = isAvatarSelected(avatar)

    if (isSelected) {
      if (selectedAvatars.title?.avatar_id === avatar.avatar_id) {
        setSelectedAvatars(prev => ({ ...prev, title: null }))
      } else if (selectedAvatars.body?.avatar_id === avatar.avatar_id) {
        setSelectedAvatars(prev => ({ ...prev, body: null }))
      } else if (selectedAvatars.conclusion?.avatar_id === avatar.avatar_id) {
        setSelectedAvatars(prev => ({ ...prev, conclusion: null }))
      }

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
      if (!isAvatarTypeAllowed(avatar)) {
        return
      }

      const totalSelected = [selectedAvatars.title, selectedAvatars.body, selectedAvatars.conclusion].filter(Boolean).length

      if (totalSelected < 3) {
        if (!selectedAvatars.title) {
          setSelectedAvatars(prev => ({ ...prev, title: avatar }))
          setValue('avatar', avatar.avatar_id as any)
        } else if (!selectedAvatars.body) {
          setSelectedAvatars(prev => ({ ...prev, body: avatar }))
          setValue('avatar', avatar.avatar_id as any)
        } else if (!selectedAvatars.conclusion) {
          setSelectedAvatars(prev => ({ ...prev, conclusion: avatar }))
          setValue('avatar', avatar.avatar_id as any)
        }
        trigger('avatar' as any)
      }
    }
  }

  const getAvatarSelectionNumber = (avatar: Avatar) => {
    if (selectedAvatars.title?.avatar_id === avatar.avatar_id) return 1
    if (selectedAvatars.body?.avatar_id === avatar.avatar_id) return 2
    if (selectedAvatars.conclusion?.avatar_id === avatar.avatar_id) return 3
    return null
  }

  return {
    avatars,
    avatarsLoading,
    avatarsError,
    selectedAvatars,
    draggedAvatar,
    fetchAvatars,
    setSelectedAvatars,
    setDraggedAvatar,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleRemoveAvatar,
    handleClearAllAvatars,
    handleAvatarClick,
    isAvatarPending,
    getAvatarType,
    isAvatarTypeAllowed,
    isAvatarSelected,
    getAvatarSelectionNumber
  }
}

