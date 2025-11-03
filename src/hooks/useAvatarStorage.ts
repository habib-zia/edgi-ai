'use client'

import { useCallback } from 'react'

export interface SelectedAvatar {
  avatar_id: string
  avatar_name: string
  preview_image_url: string
  avatarType?: 'video_avatar' | 'photo_avatar'
}

export interface SelectedAvatars {
  title: SelectedAvatar
  body: SelectedAvatar
  conclusion: SelectedAvatar
}

export interface AvatarIds {
  avatar_title: string
  avatar_body: string
  avatar_conclusion: string
}

export const useAvatarStorage = () => {
  const getSelectedAvatars = useCallback((): SelectedAvatars | null => {
    try {
      const saved = localStorage.getItem('selectedAvatars')
      if (!saved) return null
      
      const parsed = JSON.parse(saved)
      
      // Validate the structure
      if (!parsed.title || !parsed.body || !parsed.conclusion) {
        console.warn('Invalid avatar data structure in localStorage')
        return null
      }
      
      return parsed
    } catch (error) {
      console.warn('Failed to parse avatar data from localStorage:', error)
      return null
    }
  }, [])

  const saveSelectedAvatars = useCallback((avatars: SelectedAvatars): void => {
    try {
      localStorage.setItem('selectedAvatars', JSON.stringify(avatars))
    } catch (error) {
      throw new Error('Failed to save avatar selection to localStorage')
    }
  }, [])

  const getAvatarIds = useCallback((): AvatarIds | null => {
    const avatars = getSelectedAvatars()
    if (!avatars) return null

    return {
      avatar_title: avatars.title.avatar_id,
      avatar_body: avatars.body.avatar_id,
      avatar_conclusion: avatars.conclusion.avatar_id
    }
  }, [getSelectedAvatars])

  const validateAvatarSelection = useCallback((avatarIds: AvatarIds): void => {
    const required = ['avatar_title', 'avatar_body', 'avatar_conclusion'] as const
    const missing = required.filter(key => !avatarIds[key] || avatarIds[key].trim() === '')
    
    if (missing.length > 0) {
      throw new Error(`Missing avatar selection: ${missing.join(', ')}`)
    }
  }, [])

  const clearSelectedAvatars = useCallback((): void => {
    try {
      localStorage.removeItem('selectedAvatars')
    } catch {
      console.warn('Failed to clear avatar data from localStorage')
    }
  }, [])

  return {
    getSelectedAvatars,
    saveSelectedAvatars,
    getAvatarIds,
    validateAvatarSelection,
    clearSelectedAvatars
  }
}
