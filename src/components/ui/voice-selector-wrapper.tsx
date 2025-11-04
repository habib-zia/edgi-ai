'use client'

import { UseFormWatch, UseFormRegister, FieldErrors, UseFormTrigger } from 'react-hook-form'
import VoiceSelector from './voice-selector/VoiceSelector'
import { Voice, VoiceType } from './voice-selector/types'
import { CreateVideoFormData } from './form-validation-schema'

interface VoiceSelectorWrapperProps {
  field: keyof CreateVideoFormData
  placeholder: string
  watch: UseFormWatch<CreateVideoFormData>
  register: UseFormRegister<CreateVideoFormData>
  errors: FieldErrors<CreateVideoFormData>
  trigger: UseFormTrigger<CreateVideoFormData>
  openDropdown: string | null
  selectedVoice: Voice | null
  voices: Voice[]
  voicesLoading: boolean
  voicesError: string | null
  preset: string | null | undefined
  onToggle: (field: any) => void
  onSelect: (field: any, value: string) => void
  onVoiceClick: (voice: Voice) => void
  onVoiceTypeChange?: (type: VoiceType) => void
  onDragStart: (e: React.DragEvent, voice: Voice) => void
  onDragEnd: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
}

export default function VoiceSelectorWrapper({
  field,
  placeholder,
  watch,
  register,
  errors,
  trigger,
  openDropdown,
  selectedVoice,
  voices,
  voicesLoading,
  voicesError,
  preset,
  onToggle,
  onSelect,
  onVoiceClick,
  onVoiceTypeChange,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop
}: VoiceSelectorWrapperProps) {
  const formValue = watch(field) || ''
  const isOpen = openDropdown === field
  const hasError = errors[field]
  
  // selectedVoice takes priority - it's the source of truth
  // Only use formValue if selectedVoice is null and formValue exists in the current voices list
  const displayedVoice = selectedVoice || (formValue ? voices.find(v => v.id === formValue) : null)
  
  // Pass selectedVoice.id as currentValue if it exists, otherwise use formValue
  // This ensures selectedVoice always takes priority over form state
  const currentValue = selectedVoice?.id || formValue
  
  // Check if there are any custom voices
  const hasCustomVoices = voices.some(voice => voice.isCustom === true)
  
  console.log('🎤 VoiceSelectorWrapper - Rendering:', {
    field: field,
    formValue: formValue,
    currentValue: currentValue,
    selectedVoiceName: selectedVoice?.name,
    selectedVoiceId: selectedVoice?.id,
    displayedVoiceName: displayedVoice?.name,
    displayedVoiceId: displayedVoice?.id,
    voicesCount: voices.length,
    hasCustomVoices: hasCustomVoices
  })

  return (
    <VoiceSelector
      field={field}
      placeholder={placeholder}
      currentValue={currentValue}
      isOpen={isOpen}
      hasError={hasError}
      register={register}
      errors={errors}
      onToggle={onToggle}
      onSelect={onSelect}
      onBlur={(field) => trigger(field)}
      voices={voices}
      voicesLoading={voicesLoading}
      voicesError={voicesError}
      selectedVoice={displayedVoice || null}
      preset={preset}
      onVoiceClick={onVoiceClick}
      onVoiceTypeChange={onVoiceTypeChange}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      hasCustomVoices={hasCustomVoices}
    />
  )
}

