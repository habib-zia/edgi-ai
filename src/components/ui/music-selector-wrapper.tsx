'use client'

import { UseFormWatch, UseFormRegister, FieldErrors, UseFormTrigger } from 'react-hook-form'
import VoiceSelector from './voice-selector/VoiceSelector'
import { Voice, VoiceType } from './voice-selector/types'
import { CreateVideoFormData } from './form-validation-schema'

interface MusicSelectorWrapperProps {
  field: keyof CreateVideoFormData
  placeholder: string
  watch: UseFormWatch<CreateVideoFormData>
  register: UseFormRegister<CreateVideoFormData>
  errors: FieldErrors<CreateVideoFormData>
  trigger: UseFormTrigger<CreateVideoFormData>
  openDropdown: string | null
  selectedMusic: Voice | null
  musicList: Voice[]
  musicLoading: boolean
  musicError: string | null
  preset?: string | null
  initialMusicType?: 'low' | 'medium' | 'high' | 'custom' | null // Override preset-based initialization
  onToggle: (field: any) => void
  onSelect: (field: any, value: string) => void
  onMusicClick: (music: Voice) => void
  onMusicTypeChange?: (type: VoiceType) => void
  onDragStart: (e: React.DragEvent, music: Voice) => void
  onDragEnd: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onCustomMusicUpload?: (music: Voice) => void
}

export default function MusicSelectorWrapper({
  field,
  placeholder,
  watch,
  register,
  errors,
  trigger,
  openDropdown,
  selectedMusic,
  musicList,
  musicLoading,
  musicError,
  preset,
  initialMusicType,
  onToggle,
  onSelect,
  onMusicClick,
  onMusicTypeChange,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onCustomMusicUpload
}: MusicSelectorWrapperProps) {
  const currentValue = watch(field) || ''
  const isOpen = openDropdown === field
  const hasError = errors[field]
  
  // Find selected music from state or by ID
  // Only use currentValue if selectedMusic is null and currentValue exists in the current musicList
  // Check both id and _id to handle different music object formats
  const displayedMusic = selectedMusic || (currentValue ? musicList.find(m => 
    m.id === currentValue || m._id === currentValue
  ) : null)

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
      voices={musicList}
      voicesLoading={musicLoading}
      voicesError={musicError}
      selectedVoice={displayedMusic || null}
      preset={preset}
      initialVoiceType={initialMusicType as VoiceType | null}
      onVoiceClick={onMusicClick}
      onVoiceTypeChange={onMusicTypeChange}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      typeSelectorTitle="Music"
      typeSelectorDescription="Select the level of music and search the best music for your video"
      typeSelectorLowLabel="Low Music"
      typeSelectorMediumLabel="Medium Music"
      typeSelectorHighLabel="High Music"
      typeSelectorCustomLabel="Custom Music"
      hasCustomVoices={true}
      listTitle="Recommended Music"
      listLoadingText="Loading music..."
      listEmptyText="No music available"
      onCustomMusicUpload={onCustomMusicUpload}
    />
  )
}

