'use client'

import React, { useState, useMemo, useTransition, useEffect } from 'react'
import { IoMdArrowDropdown } from "react-icons/io"
import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Voice, VoiceType } from './types'
import { useAudioPlayer } from './useAudioPlayer'
import VoiceTypeSelector from './VoiceTypeSelector'
import VoiceList from './VoiceList'

interface VoiceSelectorProps {
  field: string
  placeholder: string
  currentValue: string
  isOpen: boolean
  hasError: any
  register: UseFormRegister<any>
  errors: FieldErrors<any>
  onToggle: (field: any) => void
  onSelect: (field: any, value: string) => void
  onBlur: (field: any) => void
  voices?: Voice[]
  voicesLoading?: boolean
  voicesError?: string | null
  selectedVoice?: Voice | null
  preset?: string | null
  initialVoiceType?: VoiceType | null // Override preset-based initialization
  onVoiceClick?: (voice: Voice) => void
  onDragStart?: (e: React.DragEvent, voice: Voice) => void
  onDragEnd?: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent) => void
  onDragLeave?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
  typeSelectorTitle?: string
  typeSelectorDescription?: string
  typeSelectorLowLabel?: string
  typeSelectorMediumLabel?: string
  typeSelectorHighLabel?: string
  typeSelectorCustomLabel?: string
  hasCustomVoices?: boolean
  listTitle?: string
  listLoadingText?: string
  listEmptyText?: string
  onVoiceTypeChange?: (type: VoiceType) => void
}

export default function VoiceSelector({
  field,
  placeholder,
  currentValue,
  isOpen,
  hasError,
  register: _register, // eslint-disable-line @typescript-eslint/no-unused-vars
  errors: _errors, // eslint-disable-line @typescript-eslint/no-unused-vars
  onToggle,
  onSelect,
  onBlur,
  voices = [],
  voicesLoading = false,
  voicesError = null,
  selectedVoice = null,
  preset = null,
  initialVoiceType = null,
  onVoiceClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  typeSelectorTitle,
  typeSelectorDescription,
  typeSelectorLowLabel,
  typeSelectorMediumLabel,
  typeSelectorHighLabel,
  typeSelectorCustomLabel,
  hasCustomVoices = false,
  listTitle,
  listLoadingText,
  listEmptyText,
  onVoiceTypeChange
}: VoiceSelectorProps) {
  // Initialize voiceType based on initialVoiceType (from user-settings) or preset, default to 'low'
  const getInitialVoiceType = (): VoiceType => {
    // Priority: initialVoiceType (user-settings) > preset > default
    if (initialVoiceType && (initialVoiceType === 'low' || initialVoiceType === 'medium' || initialVoiceType === 'high' || initialVoiceType === 'custom')) {
      return initialVoiceType
    }
    if (preset) {
      const presetLower = preset.toLowerCase()
      if (presetLower === 'medium') return 'medium'
      if (presetLower === 'high') return 'high'
      return 'low'
    }
    return 'low'
  }
  
  const [voiceType, setVoiceType] = useState<VoiceType>(getInitialVoiceType())
  const [draggedVoice, setDraggedVoice] = useState<Voice | null>(null)
  const [, startTransition] = useTransition()
  
  const { playingVoiceId, voiceProgress, handlePlayPreview, stopAllAudio } = useAudioPlayer()

  // Get preset from parent if available
  const presetValue = preset || null
  // ALWAYS prioritize selectedVoice - it's the source of truth
  // Only use currentValue if selectedVoice is null
  const displayValue = selectedVoice?.name || (currentValue ? voices.find(v => v.id === currentValue)?.name : null) || presetValue || placeholder
  
  // Update voiceType when initialVoiceType or preset changes
  // Priority: initialVoiceType (user-settings) > preset
  useEffect(() => {
    if (initialVoiceType && (initialVoiceType === 'low' || initialVoiceType === 'medium' || initialVoiceType === 'high' || initialVoiceType === 'custom')) {
      // Use user-settings voice type (don't override with preset)
      setVoiceType(initialVoiceType)
    } else if (preset) {
      // Fall back to preset if no initialVoiceType
      const presetLower = preset.toLowerCase()
      let newType: VoiceType = 'low'
      if (presetLower === 'medium') newType = 'medium'
      else if (presetLower === 'high') newType = 'high'
      setVoiceType(newType)
    }
  }, [preset, initialVoiceType])

  const handleVoiceTypeChange = (type: VoiceType) => {
    console.log('🎤 VoiceSelector - handleVoiceTypeChange called with type:', type)
    console.log('🎤 VoiceSelector - Current voiceType:', voiceType, 'Current selectedVoice:', selectedVoice?.name, 'selectedVoiceType:', selectedVoice?.type)
    
    // Don't auto-select if user is manually changing type - let them select manually
    // Only update the type filter, don't trigger auto-selection
    try {
      stopAllAudio()
    } catch {
    }
    
    startTransition(() => {
      try {
        console.log('🎤 VoiceSelector - Setting voiceType to:', type)
        setVoiceType(type)
        // Call the callback - but this will now check if current voice matches type before auto-selecting
        if (onVoiceTypeChange) {
          console.log('🎤 VoiceSelector - Calling onVoiceTypeChange callback with type:', type)
          onVoiceTypeChange(type)
        }
      } catch {
        setVoiceType(type)
        if (onVoiceTypeChange) {
          onVoiceTypeChange(type)
        }
      }
    })
  }

  const handleVoiceSelection = (voice: Voice) => {
    console.log('🎤 VoiceSelector - handleVoiceSelection called:', {
      voiceName: voice.name,
      voiceId: voice.id,
      voiceType: voice.type,
      field: field,
      currentValue: currentValue,
      selectedVoiceId: selectedVoice?.id
    })
    // Ensure we're using the correct voice object from the filtered list
    if (onVoiceClick) {
      console.log('🎤 VoiceSelector - Calling onVoiceClick with voice:', voice.name, voice.id)
      onVoiceClick(voice)
    }
    console.log('🎤 VoiceSelector - Calling onSelect with field:', field, 'voiceId:', voice.id)
    onSelect(field, voice.id)
    // Close dropdown after selection
    onToggle(field)
  }

  const handleDragStart = (e: React.DragEvent, voice: Voice) => {
    try {
      setDraggedVoice(voice)
      if (onDragStart) {
        onDragStart(e, voice)
      }
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', voice.id)
      const target = e.target as HTMLElement
      if (target && target.classList) {
        target.classList.add('dragging')
      }
    } catch {
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    try {
      if (onDragEnd) {
        onDragEnd(e)
      }
      const target = e.target as HTMLElement
      if (target && target.classList) {
        target.classList.remove('dragging')
      }
    } catch {
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    try {
      if (draggedVoice) {
        handleVoiceSelection(draggedVoice)
        setDraggedVoice(null)
      }
      if (onDrop) {
        onDrop(e)
      }
    } catch {
    }
  }

  const selectedVoiceId = useMemo(() => {
    console.log('🎤 VoiceSelector - Calculating selectedVoiceId:', {
      selectedVoiceId: selectedVoice?.id,
      selectedVoiceName: selectedVoice?.name,
      currentValue: currentValue,
      voicesCount: voices.length,
      voicesTypes: voices.map(v => ({ name: v.name, type: v.type }))
    })
    
    if (selectedVoice?.id) {
      console.log('🎤 VoiceSelector - Using selectedVoice.id (source of truth):', selectedVoice.id, selectedVoice.name)
      return selectedVoice.id
    }

    if (currentValue && voices.some(v => v.id === currentValue)) {
      const foundVoice = voices.find(v => v.id === currentValue)
      console.log('🎤 VoiceSelector - Using currentValue from voices list (fallback):', currentValue, foundVoice?.name)
      return currentValue
    }
    
    console.log('🎤 VoiceSelector - No valid selectedVoiceId, returning null')
    return null
  }, [selectedVoice, currentValue, voices])

  const displayedName = selectedVoice?.name || (currentValue ? voices.find(v => v.id === currentValue)?.name : null) || ''
  const wordCount = (displayedName || '').trim().split(/\s+/).filter(Boolean).length
  const isShortContent = wordCount <= 4

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onToggle(field)}
        onBlur={() => {
          setTimeout(() => {
            if ((!currentValue || currentValue.trim() === '') && isOpen) {
              onBlur(field)
            }
          }, 100)
        }}
        className={`w-full px-4 py-[10.5px] ${isShortContent ? 'text-[18px]' : 'text-[14px]'} font-normal bg-[#EEEEEE] hover:bg-[#F5F5F5] border-0 rounded-[8px] text-left transition-all duration-300 focus:outline-none focus:ring focus:ring-[#5046E5] focus:bg-white flex items-center justify-between cursor-pointer overflow-hidden ${
          hasError ? 'ring-2 ring-red-500' : ''
        } ${selectedVoice || currentValue ? 'text-gray-800 bg-[#F5F5F5]' : 'text-[#11101066]'}`}
        aria-describedby={hasError ? `${field}-error` : undefined}
      >
        <span>{displayValue}</span>
        <IoMdArrowDropdown
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-[9999] w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)] max-w-[685px] mt-2 bg-white rounded-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden right-0 lg:right-auto lg:left-0 xl:-left-16">
          <div className="flex divide-x divide-[#E0E0E0] py-7 lg:flex-row flex-col lg:h-[500px] h-[700px] overflow-hidden max-h-[calc(100vh-200px)]">
            <VoiceTypeSelector
              currentType={voiceType}
              onTypeChange={handleVoiceTypeChange}
              disabled={false}
              title={typeSelectorTitle}
              description={typeSelectorDescription}
              lowLabel={typeSelectorLowLabel}
              mediumLabel={typeSelectorMediumLabel}
              highLabel={typeSelectorHighLabel}
              customLabel={typeSelectorCustomLabel}
              hasCustomVoices={hasCustomVoices}
            />

            <VoiceList
              voices={voices}  // Already filtered by parent component
              voiceType={voiceType}  // Used for filtering in VoiceList
              voicesLoading={voicesLoading}
              voicesError={voicesError}
              selectedVoiceId={selectedVoiceId}
              playingVoiceId={playingVoiceId}
              voiceProgress={voiceProgress}
              onVoiceSelect={handleVoiceSelection}
              onVoicePlay={handlePlayPreview}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={handleDrop}
              title={listTitle}
              loadingText={listLoadingText}
              emptyText={listEmptyText}
            />
          </div>
        </div>
      )}
    </div>
  )
}

