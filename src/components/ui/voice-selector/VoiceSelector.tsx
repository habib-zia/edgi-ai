'use client'

import React, { useState, useMemo, useTransition } from 'react'
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
  listTitle?: string
  listLoadingText?: string
  listEmptyText?: string
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
  listTitle,
  listLoadingText,
  listEmptyText
}: VoiceSelectorProps) {
  const [voiceType, setVoiceType] = useState<VoiceType>('low')
  const [draggedVoice, setDraggedVoice] = useState<Voice | null>(null)
  const [, startTransition] = useTransition()
  
  const { playingVoiceId, voiceProgress, handlePlayPreview, stopAllAudio } = useAudioPlayer()

  const displayValue = selectedVoice?.name || currentValue || placeholder

  const handleVoiceTypeChange = (type: VoiceType) => {
    try {
      stopAllAudio()
    } catch {
    }
    
    startTransition(() => {
      try {
        setVoiceType(type)
      } catch {
        setVoiceType(type)
      }
    })
  }

  const handleVoiceSelection = (voice: Voice) => {
    if (onVoiceClick) {
      onVoiceClick(voice)
    }
    onSelect(field, voice.id)
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
    return selectedVoice?.id || currentValue || null
  }, [selectedVoice, currentValue])

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
        className={`w-full px-4 py-[10.5px] text-[18px] font-normal bg-[#EEEEEE] hover:bg-[#F5F5F5] border-0 rounded-[8px] text-left transition-all duration-300 focus:outline-none focus:ring focus:ring-[#5046E5] focus:bg-white flex items-center justify-between cursor-pointer overflow-hidden ${
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
        <div className="absolute z-50 w-full lg:w-[685px] mt-2 bg-white rounded-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden lg:left-0">
          <div className="flex divide-x divide-[#E0E0E0] py-7 lg:flex-row flex-col lg:h-[500px] h-[700px]">
            <VoiceTypeSelector
              currentType={voiceType}
              onTypeChange={handleVoiceTypeChange}
              title={typeSelectorTitle}
              description={typeSelectorDescription}
              lowLabel={typeSelectorLowLabel}
              mediumLabel={typeSelectorMediumLabel}
              highLabel={typeSelectorHighLabel}
            />

            <VoiceList
              voices={voices}
              voiceType={voiceType}
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

