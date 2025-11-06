'use client'

import { useState, useCallback } from 'react'
import { apiService } from '@/lib/api-service'
import { useAvatarStorage } from '@/hooks/useAvatarStorage'
import { VideoFormData } from './useVideoModalForm'

export interface VideoGenerationData {
  hook: string
  body: string
  conclusion: string
  company_name: string
  social_handles: string
  license: string
  email: string
  title: string
  avatar_title: string
  avatar_body: string
  avatar_conclusion: string
  music?: string
  text?: string
}

interface UseVideoGenerationProps {
  formData: VideoFormData
  videoTopic: string | null
  webhookResponse?: {
    company_name?: string
    social_handles?: string
    license?: string
    email?: string
    voice_id?: string
    music_url?: string
  } | null
  onSuccess: () => void
  onError: (error: string) => void
}

export function useVideoGeneration({
  formData,
  videoTopic,
  webhookResponse,
  onSuccess,
  onError
}: UseVideoGenerationProps) {
  const [avatarError, setAvatarError] = useState<string>('')
  const { getAvatarIds, validateAvatarSelection } = useAvatarStorage()

  const generateVideo = useCallback(async () => {
    // Clear previous avatar errors
    setAvatarError('')

    try {
      // Get and validate avatar IDs from localStorage
      const avatarIds = getAvatarIds()
      if (!avatarIds) {
        const errorMessage = 'Avatar selection not found. Please go back and select avatars.'
        setAvatarError(errorMessage)
        onError(errorMessage)
        return
      }

      // Validate that all required avatars are selected
      validateAvatarSelection(avatarIds)

      // Prepare data for video generation API with proper typing
      const videoGenerationData: VideoGenerationData = {
        hook: formData.prompt,
        body: formData.description,
        text: formData.description,
        conclusion: formData.conclusion,
        company_name: webhookResponse?.company_name || '',
        social_handles: webhookResponse?.social_handles || '',
        license: webhookResponse?.license || '',
        email: webhookResponse?.email || '',
        title: videoTopic || 'Custom Video',
        avatar_title: avatarIds.avatar_title,
        avatar_body: avatarIds.avatar_body,
        avatar_conclusion: avatarIds.avatar_conclusion,
        music: webhookResponse?.music_url || ''
      }

      console.log('videoGenerationData', videoGenerationData)

      // Call ElevenLabs text-to-speech API if voice_id is available
      if (webhookResponse?.voice_id) {
        try {
          console.log('🎙️ Calling ElevenLabs text-to-speech API with voice_id:', webhookResponse.voice_id)
          const textToSpeechData = {
            voice_id: webhookResponse.voice_id,
            hook: formData.prompt,
            body: formData.description,
            conclusion: formData.conclusion,
            output_format: 'mp3_44100_128'
          }
          console.log(JSON.stringify(textToSpeechData, null, 2))
          const textToSpeechResponse = await apiService.textToSpeech(textToSpeechData)
          console.log('🎙️ Text-to-speech API response:', textToSpeechResponse)

          // Update videoGenerationData with URLs from text-to-speech response
          if (textToSpeechResponse?.success && textToSpeechResponse?.data) {
            videoGenerationData.hook = textToSpeechResponse.data.hook_url || formData.prompt
            videoGenerationData.body = textToSpeechResponse.data.body_url || formData.description
            videoGenerationData.conclusion = textToSpeechResponse.data.conclusion_url || formData.conclusion
            console.log('🎙️ Updated videoGenerationData with text-to-speech URLs:', videoGenerationData)
          }
        } catch (error) {
          console.error('Text-to-speech API failed:', error)
          // Continue with video generation even if text-to-speech fails (use original text)
        }
      }

      // Call the video generation API using apiService
      await apiService.generateVideo(videoGenerationData)

      // Store a key in localStorage to indicate video generation has started
      localStorage.setItem('videoGenerationStarted', JSON.stringify({
        timestamp: Date.now(),
        videoTitle: videoTopic || 'Custom Video'
      }))
      console.log('🎬 Video generation API called - localStorage key set')
      onSuccess()
    } catch (error: any) {
      console.error('Video creation failed:', error)

      // Clear localStorage key on error
      localStorage.removeItem('videoGenerationStarted')
      console.log('🧹 Cleared localStorage key due to API error')

      // Set appropriate error message
      let errorMessage = 'Failed to create video. Please try again.'
      if (error.message?.includes('Missing avatar selection')) {
        errorMessage = error.message
      }
      setAvatarError(errorMessage)
      onError(errorMessage)
    }
  }, [formData, videoTopic, webhookResponse, getAvatarIds, validateAvatarSelection, onSuccess, onError])

  const setError = useCallback((error: string) => {
    setAvatarError(error)
  }, [])

  return {
    avatarError,
    generateVideo,
    setAvatarError: setError
  }
}

