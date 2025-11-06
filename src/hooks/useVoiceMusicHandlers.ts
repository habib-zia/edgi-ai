'use client'

import { useState, useCallback } from 'react'
import { Voice, VoiceType } from '@/components/ui/voice-selector/types'
import { UseFormSetValue, UseFormTrigger } from 'react-hook-form'
import { CreateVideoFormData } from '@/components/ui/form-validation-schema'

interface UseVoiceMusicHandlersProps {
  allVoices: Voice[]
  allMusic: Voice[]
  setValue: UseFormSetValue<CreateVideoFormData>
  trigger: UseFormTrigger<CreateVideoFormData>
}

interface UseVoiceMusicHandlersReturn {
  selectedVoice: Voice | null
  selectedMusic: Voice | null
  currentVoiceType: VoiceType | null
  currentMusicType: 'low' | 'medium' | 'high' | null
  isVoiceManuallySelected: boolean
  setSelectedVoice: React.Dispatch<React.SetStateAction<Voice | null>>
  setSelectedMusic: React.Dispatch<React.SetStateAction<Voice | null>>
  setCurrentVoiceType: React.Dispatch<React.SetStateAction<VoiceType | null>>
  setCurrentMusicType: React.Dispatch<React.SetStateAction<'low' | 'medium' | 'high' | null>>
  setIsVoiceManuallySelected: React.Dispatch<React.SetStateAction<boolean>>
  handleVoiceClick: (voice: Voice) => void
  handleMusicClick: (music: Voice) => void
  handleVoiceTypeChange: (type: VoiceType) => void
  handleMusicTypeChange: (type: VoiceType) => void
}

export function useVoiceMusicHandlers({
  allVoices,
  allMusic,
  setValue,
  trigger
}: UseVoiceMusicHandlersProps): UseVoiceMusicHandlersReturn {
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null)
  const [selectedMusic, setSelectedMusic] = useState<Voice | null>(null)
  const [currentVoiceType, setCurrentVoiceType] = useState<VoiceType | null>(null)
  const [currentMusicType, setCurrentMusicType] = useState<'low' | 'medium' | 'high' | null>(null)
  const [isVoiceManuallySelected, setIsVoiceManuallySelected] = useState(false)

  const handleVoiceClick = useCallback((voice: Voice) => {
    setIsVoiceManuallySelected(true)
    setSelectedVoice(voice)
    setValue('voice', voice.id as any, { shouldValidate: true, shouldDirty: true })
    trigger('voice' as any)
    setCurrentVoiceType(voice.type)

    if (voice.type !== 'custom') {
      setCurrentMusicType(voice.type as 'low' | 'medium' | 'high')
    }
    const filteredMusic = allMusic.filter(m => m.type === voice.type)
    if (filteredMusic.length > 0) {
      const randomMusic = filteredMusic[Math.floor(Math.random() * filteredMusic.length)]
      setSelectedMusic(randomMusic)
      setValue('music', randomMusic.id, { shouldValidate: true })
      trigger('music')
    }
  }, [allMusic, setValue, trigger])

  const handleMusicClick = useCallback((music: Voice) => {
    setSelectedMusic(music)
    setValue('music', music.id as any, { shouldValidate: true })
    trigger('music' as any)
  }, [setValue, trigger])

  const handleVoiceTypeChange = useCallback((type: VoiceType) => {
    setIsVoiceManuallySelected(true)
    setCurrentVoiceType(type)

    if (type === 'custom') {
      const filteredVoices = allVoices.filter(v => v.isCustom === true)
      if (filteredVoices.length > 0) {
        const randomVoice = filteredVoices[Math.floor(Math.random() * filteredVoices.length)]
        setSelectedVoice(randomVoice)
        setValue('voice', randomVoice.id as any, { shouldValidate: true })
        trigger('voice' as any)
      }
    } else {
      setCurrentMusicType(type)
      const filteredVoices = allVoices.filter(v => v.type === type)
      if (filteredVoices.length > 0) {
        const randomVoice = filteredVoices[Math.floor(Math.random() * filteredVoices.length)]
        setSelectedVoice(randomVoice)
        setValue('voice', randomVoice.id as any, { shouldValidate: true })
        trigger('voice' as any)
      }

      const filteredMusic = allMusic.filter(m => m.type === type)
      if (filteredMusic.length > 0) {
        const randomMusic = filteredMusic[Math.floor(Math.random() * filteredMusic.length)]
        setSelectedMusic(randomMusic)
        setValue('music', randomMusic.id as any, { shouldValidate: true })
        trigger('music' as any)
      }
    }
  }, [allVoices, allMusic, setValue, trigger])

  const handleMusicTypeChange = useCallback((type: VoiceType) => {
    if (type === 'custom') {
      return
    }
    setCurrentMusicType(type as 'low' | 'medium' | 'high')
    const filteredMusic = allMusic.filter(m => m.type === type)

    if (filteredMusic.length > 0) {
      const randomMusic = filteredMusic[Math.floor(Math.random() * filteredMusic.length)]
      setSelectedMusic(randomMusic)
      setValue('music', randomMusic.id, { shouldValidate: true })
      trigger('music')
    } else {
      setSelectedMusic(null)
      setValue('music', '' as any, { shouldValidate: true })
      trigger('music' as any)
    }
  }, [allMusic, setValue, trigger])

  return {
    selectedVoice,
    selectedMusic,
    currentVoiceType,
    currentMusicType,
    isVoiceManuallySelected,
    setSelectedVoice,
    setSelectedMusic,
    setCurrentVoiceType,
    setCurrentMusicType,
    setIsVoiceManuallySelected,
    handleVoiceClick,
    handleMusicClick,
    handleVoiceTypeChange,
    handleMusicTypeChange
  }
}

