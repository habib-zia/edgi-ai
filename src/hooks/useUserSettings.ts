'use client'

import { useState, useCallback } from 'react'
import { API_CONFIG, getApiUrl, getAuthenticatedHeaders } from '@/lib/config'

interface UserSettings {
  prompt: string
  avatar: string | string[]
  titleAvatar?: string | { avatar_id: string; avatarType?: 'video_avatar' | 'photo_avatar' }
  bodyAvatar?: string | { avatar_id: string; avatarType?: 'video_avatar' | 'photo_avatar' }
  conclusionAvatar?: string | { avatar_id: string; avatarType?: 'video_avatar' | 'photo_avatar' }
  name: string
  position: string
  language?: string
  companyName: string
  license: string
  tailoredFit: string
  socialHandles: string
  city: string
  preferredTone: string
  callToAction: string
  email: string
  gender?: string
  preset?: string
  selectedVoiceId?: string
  selectedMusicTrackId?: string
  selectedVoicePreset?: string
  selectedMusicPreset?: string
}

interface UserSettingsResponse {
  success: boolean
  data: UserSettings
  message?: string
}

interface UseUserSettingsProps {
  userEmail?: string
  avatars: { custom: any[], default: any[] }
  setSelectedAvatars: (avatars: { title: any, body: any, conclusion: any }) => void
  setValue: (name: any, value: any) => void
}

export const useUserSettings = ({ userEmail, avatars, setSelectedAvatars, setValue }: UseUserSettingsProps) => {
  const [loadingUserSettings, setLoadingUserSettings] = useState(false)
  const [savingUserSettings, setSavingUserSettings] = useState(false)

  const fetchUserSettings = useCallback(async () => {
    setLoadingUserSettings(true)
    try {
      if (!userEmail) {
        console.error('User email is required to fetch settings')
        return { success: false, data: null }
      }

      const response = await fetch(
        `${getApiUrl(API_CONFIG.ENDPOINTS.USER_SETTINGS)}?email=${userEmail}`,
        {
          method: 'GET',
          headers: getAuthenticatedHeaders()
        }
      )

      if (!response.ok) {
        // console.error('Failed to fetch user settings:', await response.text())
        return { success: false, data: null }
      }

      const userSettings: UserSettingsResponse = await response.json()
      console.log('Fetched user settings:', userSettings)

      if (userSettings.success && userSettings.data) {
        const settings = userSettings.data
        setValue('prompt', settings.prompt || '')
        // Set avatar field to first avatar ID for form validation
        if (Array.isArray(settings.avatar) && settings.avatar.length > 0) {
          setValue('avatar', settings.avatar[0])
        } else if (typeof settings.avatar === 'string') {
          setValue('avatar', settings.avatar)
        } else {
          setValue('avatar', '')
        }
        setValue('name', settings.name || '')
        setValue('position', settings.position || '')
        setValue('language', settings.language || '')
        setValue('companyName', settings.companyName || '')
        setValue('license', settings.license || '')
        setValue('tailoredFit', settings.tailoredFit || '')
        setValue('socialHandles', settings.socialHandles || '')
        setValue('city', settings.city || '')
        setValue('preferredTone', settings.preferredTone || '')
        setValue('callToAction', settings.callToAction || '')
        setValue('email', settings.email || '')
        // Convert gender from lowercase (API format) to capitalized (form format)
        const genderValue = settings.gender || ''
        const capitalizedGender = genderValue ? genderValue.charAt(0).toUpperCase() + genderValue.slice(1).toLowerCase() : ''
        setValue('gender', capitalizedGender)
        setValue('preset', settings.preset || '')

            // Handle avatar loading - prioritize avatar array from API response
            if (settings.avatar && Array.isArray(settings.avatar)) {
              // New format: avatar is an array of IDs from API response
              const avatarIds = settings.avatar.filter(id => id && id.trim() !== '')
              console.log('🔍 Loading avatars from API response array:', avatarIds)
              
              if (avatarIds.length > 0) {
                const foundAvatars = avatarIds.map(id => 
                  [...avatars.custom, ...avatars.default].find(avatar => avatar.avatar_id === id)
                ).filter(Boolean)
                
                if (foundAvatars.length > 0) {
                  setSelectedAvatars({
                    title: foundAvatars[0] || null,
                    body: foundAvatars[1] || null,
                    conclusion: foundAvatars[2] || null
                  })
                  
                  // Update the form's avatar field to show the first avatar in the dropdown
                  setValue('avatar', foundAvatars[0].avatar_id)
                  
                  console.log('🎯 Avatars loaded from API response array:', {
                    avatar_ids: avatarIds,
                    loaded_avatars: foundAvatars.map(avatar => ({
                      avatar_id: avatar.avatar_id,
                      avatar_name: avatar.avatar_name || avatar.name,
                      avatar_type: avatars.custom.some(customAvatar => customAvatar.avatar_id === avatar.avatar_id) ? 'custom' : 'default'
                    })),
                    assigned_to_slots: ['title', 'body', 'conclusion'],
                    form_avatar_field_updated: foundAvatars[0].avatar_id
                  })
                }
              }
            } else if (settings.titleAvatar || settings.bodyAvatar || settings.conclusionAvatar) {
              // Fallback: individual avatar IDs (legacy support) or new structure with avatar_id and avatarType
              const getAvatarId = (avatar: string | { avatar_id: string; avatarType?: 'video_avatar' | 'photo_avatar' } | undefined): string => {
                if (!avatar) return ''
                if (typeof avatar === 'string') return avatar
                return avatar.avatar_id || ''
              }
              
              const titleAvatarId = getAvatarId(settings.titleAvatar)
              const bodyAvatarId = getAvatarId(settings.bodyAvatar)
              const conclusionAvatarId = getAvatarId(settings.conclusionAvatar)
              
              const titleAvatar = titleAvatarId ? 
                [...avatars.custom, ...avatars.default].find(avatar => avatar.avatar_id === titleAvatarId) : null
              const bodyAvatar = bodyAvatarId ? 
                [...avatars.custom, ...avatars.default].find(avatar => avatar.avatar_id === bodyAvatarId) : null
              const conclusionAvatar = conclusionAvatarId ? 
                [...avatars.custom, ...avatars.default].find(avatar => avatar.avatar_id === conclusionAvatarId) : null

              setSelectedAvatars({
                title: titleAvatar,
                body: bodyAvatar,
                conclusion: conclusionAvatar
              })
              
              // Update the form's avatar field to show the first avatar in the dropdown
              if (titleAvatar) {
                setValue('avatar', titleAvatar.avatar_id)
              }
              
              console.log('🎯 Individual avatars loaded from user settings (legacy):', {
                title: titleAvatar ? {
                  avatar_id: titleAvatar.avatar_id,
                  avatar_name: titleAvatar.avatar_name || titleAvatar.name,
                  avatar_type: avatars.custom.some(customAvatar => customAvatar.avatar_id === titleAvatar.avatar_id) ? 'custom' : 'default'
                } : null,
                body: bodyAvatar ? {
                  avatar_id: bodyAvatar.avatar_id,
                  avatar_name: bodyAvatar.avatar_name || bodyAvatar.name,
                  avatar_type: avatars.custom.some(customAvatar => customAvatar.avatar_id === bodyAvatar.avatar_id) ? 'custom' : 'default'
                } : null,
                conclusion: conclusionAvatar ? {
                  avatar_id: conclusionAvatar.avatar_id,
                  avatar_name: conclusionAvatar.avatar_name || conclusionAvatar.name,
                  avatar_type: avatars.custom.some(customAvatar => customAvatar.avatar_id === conclusionAvatar.avatar_id) ? 'custom' : 'default'
                } : null,
                form_avatar_field_updated: titleAvatar?.avatar_id || 'none'
              })
            } else if (settings.avatar && typeof settings.avatar === 'string') {
              // Legacy format: avatar is a single string
              const foundAvatar = [...avatars.custom, ...avatars.default].find(avatar =>
                avatar.avatar_id === settings.avatar
              )
              if (foundAvatar) {
                setSelectedAvatars({
                  title: foundAvatar,
                  body: foundAvatar,
                  conclusion: foundAvatar
                })
                
                // Update the form's avatar field to show the avatar in the dropdown
                setValue('avatar', foundAvatar.avatar_id)
                
                console.log('🎯 Single avatar loaded from user settings (legacy):', {
                  avatar_id: foundAvatar.avatar_id,
                  avatar_name: foundAvatar.avatar_name || foundAvatar.name,
                  avatar_type: avatars.custom.some(customAvatar => customAvatar.avatar_id === foundAvatar.avatar_id) ? 'custom' : 'default',
                  assigned_to_slots: ['title', 'body', 'conclusion'],
                  form_avatar_field_updated: foundAvatar.avatar_id
                })
              } else {
                console.log('❌ Avatar not found in available avatars:', {
                  requested_avatar_id: settings.avatar,
                  available_custom_avatars: avatars.custom.map(a => a.avatar_id),
                  available_default_avatars: avatars.default.map(a => a.avatar_id)
                })
              }
            }
        console.log('Form populated with user settings')
        // Note: Removed automatic validation trigger to prevent validation errors on empty fields
        return { success: true, data: userSettings.data }
      }
      return { success: false, data: null }
    } catch (error) {
      console.error('Error fetching user settings:', error)
      return { success: false, data: null }
    } finally {
      setLoadingUserSettings(false)
    }
  }, [userEmail, avatars, setSelectedAvatars, setValue])

  const saveUserSettings = useCallback(async (userSettingsData: UserSettings) => {
    setSavingUserSettings(true)
    try {
      // Create a clean payload with proper array (matching curl request format)
      // Handle new structure: avatar fields can be objects with avatar_id and avatarType
      const getAvatarId = (avatar: string | { avatar_id: string; avatarType?: 'video_avatar' | 'photo_avatar' } | undefined): string => {
        if (!avatar) return ''
        if (typeof avatar === 'string') return avatar
        return avatar.avatar_id || ''
      }
      const cleanPayload = {
        prompt: userSettingsData.prompt,
        avatar: Array.isArray(userSettingsData.avatar) ? userSettingsData.avatar : [],
        titleAvatar: typeof userSettingsData.titleAvatar === 'object' && userSettingsData.titleAvatar !== null
          ? userSettingsData.titleAvatar
          : getAvatarId(userSettingsData.titleAvatar),
        bodyAvatar: typeof userSettingsData.bodyAvatar === 'object' && userSettingsData.bodyAvatar !== null
          ? userSettingsData.bodyAvatar
          : getAvatarId(userSettingsData.bodyAvatar),
        conclusionAvatar: typeof userSettingsData.conclusionAvatar === 'object' && userSettingsData.conclusionAvatar !== null
          ? userSettingsData.conclusionAvatar
          : getAvatarId(userSettingsData.conclusionAvatar),
        name: userSettingsData.name,
        position: userSettingsData.position,
        language: userSettingsData.language || '',
        companyName: userSettingsData.companyName,
        license: userSettingsData.license,
        tailoredFit: userSettingsData.tailoredFit,
        socialHandles: userSettingsData.socialHandles,
        city: userSettingsData.city,
        preferredTone: userSettingsData.preferredTone,
        callToAction: userSettingsData.callToAction,
        email: userSettingsData.email,
        gender: userSettingsData.gender ? userSettingsData.gender.toLowerCase() : '',
        preset: userSettingsData.preset || '',
        selectedVoiceId: userSettingsData.selectedVoiceId || '',
        selectedMusicTrackId: userSettingsData.selectedMusicTrackId || '',
        selectedVoicePreset: userSettingsData.selectedVoicePreset || '',
        selectedMusicPreset: userSettingsData.selectedMusicPreset || ''
      }
      
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.USER_SETTINGS), {
        method: 'POST',
        headers: getAuthenticatedHeaders(),
        body: JSON.stringify(cleanPayload)
      })

      if (!response.ok) {
        console.error('Failed to store user settings:', await response.text())
        return { success: false, error: 'Failed to store user settings' }
      }

      const result = await response.json()
      console.log('User settings stored successfully:', result)
      return { success: true, data: result }
    } catch (error) {
      console.error('Error storing user settings:', error)
      return { success: false, error: 'Error storing user settings' }
    } finally {
      setSavingUserSettings(false)
    }
  }, [])

  return {
    loadingUserSettings,
    savingUserSettings,
    fetchUserSettings,
    saveUserSettings
  }
}