'use client'

import { useCallback } from 'react'
import { UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/store'
import { setVideoLoading, setVideoError, createVideoRequest, clearVideoError, VideoRequest } from '@/store/slices/videoSlice'
import { apiService } from '@/lib/api-service'
import { useAvatarStorage, type SelectedAvatars } from '@/hooks/useAvatarStorage'
import { useSubscription } from '@/hooks/useSubscription'
import { useUserSettings } from '@/hooks/useUserSettings'
import { CreateVideoFormData } from '@/components/ui/form-validation-schema'
import { Voice } from '@/components/ui/voice-selector/types'
import { Avatar } from '@/lib/api-service'

interface UseVideoFormSubmissionProps {
  setValue: UseFormSetValue<CreateVideoFormData>
  watch: UseFormWatch<CreateVideoFormData>
  selectedAvatars: {
    title: Avatar | null
    body: Avatar | null
    conclusion: Avatar | null
  }
  selectedVoice: Voice | null
  selectedMusic: Voice | null
  customTopicValue: string
  showCustomTopicInput: boolean
  onShowUsageToast: (message: string) => void
  onShowPendingPayment: (message: string) => void
  onShowSubscriptionRequired: (message: string) => void
  onModalOpen: () => void
  onWebhookResponseSet: (response: any) => void
}

export function useVideoFormSubmission({
  setValue,
  watch,
  selectedAvatars,
  selectedVoice,
  selectedMusic,
  customTopicValue,
  showCustomTopicInput,
  onShowUsageToast,
  onShowPendingPayment,
  onShowSubscriptionRequired,
  onModalOpen,
  onWebhookResponseSet
}: UseVideoFormSubmissionProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { saveSelectedAvatars } = useAvatarStorage()
  const { checkVideoUsageLimit } = useSubscription()
  const { saveUserSettings } = useUserSettings({
    userEmail: undefined,
    avatars: { custom: [], default: [] },
    setSelectedAvatars: () => {},
    setValue
  })

  const onSubmit = useCallback(async (data: CreateVideoFormData) => {
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

    try {
      const usageCheck = await checkVideoUsageLimit()
      
      if (!usageCheck.canCreateVideo) {
        if (usageCheck.message?.includes('payment is still being processed')) {
          onShowPendingPayment(usageCheck.message)
        } else if (usageCheck.message?.includes('No active subscription found') || usageCheck.message?.includes('Please subscribe')) {
          onShowSubscriptionRequired(usageCheck.message)
        } else {
          onShowUsageToast(usageCheck.message || 'Video limit reached')
        }
        return
      }
    } catch (error) {
      console.error('Failed to check video usage:', error)
      dispatch(setVideoError('Unable to verify subscription status. Please try again.'))
      return
    }

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
    try {
      const result = await apiService.createVideo(data)

      if (!result.success) {
        throw new Error(result.message || 'Failed to create video')
      }

      const webhookData = result.data.webhookResponse

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
      onWebhookResponseSet(decodedResponse)

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

      dispatch(createVideoRequest(videoRequest))

      const userSettingsPayload = {
        prompt: data.prompt,
        avatar: [
          selectedAvatars.title?.avatar_id || '',
          selectedAvatars.body?.avatar_id || '',
          selectedAvatars.conclusion?.avatar_id || ''
        ].filter(id => id !== ''),
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

      onModalOpen()
      dispatch(clearVideoError())

    } catch (error: any) {
      dispatch(setVideoError(error.message || 'Failed to create video'))
    } finally {
      dispatch(setVideoLoading(false))
    }
  }, [
    selectedAvatars,
    selectedVoice,
    selectedMusic,
    customTopicValue,
    showCustomTopicInput,
    dispatch,
    saveSelectedAvatars,
    checkVideoUsageLimit,
    saveUserSettings,
    onShowUsageToast,
    onShowPendingPayment,
    onShowSubscriptionRequired,
    onModalOpen,
    onWebhookResponseSet
  ])

  return { onSubmit }
}

