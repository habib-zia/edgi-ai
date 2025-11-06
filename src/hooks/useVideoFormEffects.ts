'use client'

import { useEffect, useRef } from 'react'
import { UseFormSetValue, UseFormWatch, UseFormTrigger } from 'react-hook-form'
import { CreateVideoFormData } from '@/components/ui/form-validation-schema'
import { Voice } from '@/components/ui/voice-selector/types'

interface UseVideoFormEffectsProps {
  watch: UseFormWatch<CreateVideoFormData>
  setValue: UseFormSetValue<CreateVideoFormData>
  trigger: UseFormTrigger<CreateVideoFormData>
  userEmail?: string
  preset: string | null | undefined
  gender: string | null | undefined
  allVoices: Voice[]
  allMusic: Voice[]
  selectedVoice: Voice | null
  selectedMusic: Voice | null
  currentVoiceType: string | null
  isVoiceManuallySelected: boolean
  setCurrentVoiceType: (type: 'low' | 'medium' | 'high' | null) => void
  setCurrentMusicType: (type: 'low' | 'medium' | 'high' | null) => void
  setSelectedVoice: (voice: Voice | null) => void
  setSelectedMusic: (music: Voice | null) => void
  showCustomTopicInput: boolean
}

export function useVideoFormEffects({
  watch,
  setValue,
  trigger,
  userEmail,
  preset,
  gender,
  allVoices,
  allMusic,
  selectedVoice,
  selectedMusic,
  currentVoiceType,
  isVoiceManuallySelected,
  setCurrentVoiceType,
  setCurrentMusicType,
  setSelectedVoice,
  setSelectedMusic,
  showCustomTopicInput
}: UseVideoFormEffectsProps) {
  const prevGenderRef = useRef<string | null>(null)

  // Set user email
  useEffect(() => {
    if (userEmail) {
      setValue('email', userEmail)
    }
  }, [userEmail, setValue])

  // Set default language
  useEffect(() => {
    const currentLanguage = watch('language')
    if (!currentLanguage || currentLanguage.trim() === '') {
      setValue('language', 'English', { shouldValidate: false, shouldDirty: false })
    }
  }, [watch, setValue])

  // Reset preset/voice/music when gender changes
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
  }, [gender, setValue, setCurrentVoiceType, setCurrentMusicType, setSelectedVoice, setSelectedMusic])

  // Auto-select voice/music based on preset
  useEffect(() => {
    if (preset && allVoices.length > 0 && allMusic.length > 0 && !isVoiceManuallySelected) {
      const currentVoice = watch('voice')
      const currentMusic = watch('music')
      
      const presetLower = preset.toLowerCase()
      const selectedVoiceType = selectedVoice?.type
      const selectedMusicType = selectedMusic?.type
      
      if (!currentVoiceType || currentVoiceType !== presetLower) {
        setCurrentVoiceType(presetLower as 'low' | 'medium' | 'high')
        setCurrentMusicType(presetLower as 'low' | 'medium' | 'high')
      }
      
      if (!currentVoice || (selectedVoiceType && selectedVoiceType !== presetLower)) {
        const matchingVoices = allVoices.filter(v => v.type === presetLower)
        if (matchingVoices.length > 0) {
          const randomVoice = matchingVoices[Math.floor(Math.random() * matchingVoices.length)]
          if (randomVoice) {
            setSelectedVoice(randomVoice)
            setValue('voice', randomVoice.id)
            trigger('voice')
          }
        }
      }
      
      if (!currentMusic || (selectedMusicType && selectedMusicType !== presetLower)) {
        const matchingMusic = allMusic.filter(m => m.type === presetLower)
        if (matchingMusic.length > 0) {
          const randomMusic = matchingMusic[Math.floor(Math.random() * matchingMusic.length)]
          if (randomMusic) {
            setSelectedMusic(randomMusic)
            setValue('music', randomMusic.id)
            trigger('music')
          }
        }
      }
    }
  }, [preset, allVoices, allMusic, watch, setValue, trigger, selectedVoice, selectedMusic, currentVoiceType, isVoiceManuallySelected, setCurrentVoiceType, setCurrentMusicType, setSelectedVoice, setSelectedMusic])

  // Focus custom topic input
  useEffect(() => {
    if (showCustomTopicInput) {
      setTimeout(() => {
        const customTopicInput = document.querySelector('input[placeholder="Enter your custom topic"]') as HTMLInputElement
        if (customTopicInput) {
          customTopicInput.focus()
        }
      }, 100)
    }
  }, [showCustomTopicInput])
}

