'use client'

import { AlertCircle } from 'lucide-react'
import { CreateVideoFormData } from './form-validation-schema'
import { UseFormRegister, UseFormWatch, UseFormTrigger, FieldErrors } from 'react-hook-form'
import FormInput from './form-input'
import FormDropdown from './form-dropdown'
import VoiceSelectorWrapper from './voice-selector-wrapper'
import MusicSelectorWrapper from './music-selector-wrapper'
import HybridTopicInput from './hybrid-topic-input'
import { Voice, VoiceType } from './voice-selector/types'
import { Trend } from '@/lib/api-service'

interface FormMediaSectionProps {
  register: UseFormRegister<CreateVideoFormData>
  errors: FieldErrors<CreateVideoFormData>
  watch: UseFormWatch<CreateVideoFormData>
  trigger: UseFormTrigger<CreateVideoFormData>
  openDropdown: string | null
  onDropdownToggle: (field: keyof CreateVideoFormData) => void
  onDropdownSelect: (field: keyof CreateVideoFormData, value: string) => void
  onFormFieldChange: () => void
  formManuallyTouched: boolean
  submitAttempted?: boolean
  // Options
  presetOptions: { value: string; label: string }[]
  languageOptions: { value: string; label: string }[]
  // Voice/Music state
  preset: string | null | undefined
  selectedVoice: Voice | null
  selectedMusic: Voice | null
  voices: Voice[]
  allVoices: Voice[]
  voicesLoading: boolean
  voicesError: string | null
  musicList: Voice[]
  allMusic: Voice[]
  musicLoading: boolean
  musicError: string | null
  // Voice/Music handlers
  onVoiceClick: (voice: Voice) => void
  onVoiceTypeChange: (type: VoiceType) => void
  onMusicClick: (music: Voice) => void
  onMusicTypeChange: (type: VoiceType) => void
  // Trends/Topic state
  allTrends: Trend[]
  cityTrendsLoading: boolean
  cityTrendsError: string | null
  missingFieldsError: string | null
  showCustomTopicInput: boolean
  customTopicValue: string
  keyPointsLoading: boolean
  keyPointsError: string | null
  // Trends/Topic handlers
  onCustomTopicClick: () => void
  onCustomTopicChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onCustomTopicBlur: () => void
  onFetchCityTrends: (city: string, position?: string) => void
}

export default function FormMediaSection({
  register,
  errors,
  watch,
  trigger,
  openDropdown,
  onDropdownToggle,
  onDropdownSelect,
  onFormFieldChange,
  formManuallyTouched,
  submitAttempted = false,
  presetOptions,
  languageOptions,
  preset,
  selectedVoice,
  selectedMusic,
  voices,
  allVoices,
  voicesLoading,
  voicesError,
  musicList,
  allMusic,
  musicLoading,
  musicError,
  onVoiceClick,
  onVoiceTypeChange,
  onMusicClick,
  onMusicTypeChange,
  allTrends,
  cityTrendsLoading,
  cityTrendsError,
  missingFieldsError,
  showCustomTopicInput,
  customTopicValue,
  keyPointsLoading,
  keyPointsError,
  onCustomTopicClick,
  onCustomTopicChange,
  onCustomTopicBlur,
  onFetchCityTrends
}: FormMediaSectionProps) {
  const renderInput = (
    field: keyof CreateVideoFormData,
    placeholder: string,
    type: string = 'text',
    autoComplete?: string
  ) => {
    // Filter errors for consistency - only show errors after manual interaction or submit attempt
    const shouldShowErrors = formManuallyTouched || submitAttempted
    const filteredErrors = shouldShowErrors ? errors : {}

    return (
      <FormInput
        field={field}
        placeholder={placeholder}
        type={type}
        autoComplete={autoComplete}
        register={register}
        errors={filteredErrors}
        disabled={field === 'email'}
        onChange={onFormFieldChange}
      />
    )
  }

  const renderDropdown = (
    field: keyof CreateVideoFormData,
    options: { value: string; label: string }[],
    placeholder: string
  ) => {
    const currentValue = watch(field) || ''
    const isOpen = openDropdown === field
    // Filter errors for consistency - only show errors after manual interaction or submit attempt
    const shouldShowErrors = formManuallyTouched || submitAttempted
    const filteredErrors = shouldShowErrors ? errors : {}
    const hasError = filteredErrors[field]

    return (
      <FormDropdown
        field={field}
        options={options}
        placeholder={placeholder}
        currentValue={currentValue}
        isOpen={isOpen}
        hasError={hasError}
        register={register}
        errors={filteredErrors}
        onToggle={onDropdownToggle}
        onSelect={onDropdownSelect}
        onBlur={(field) => trigger(field)}
      />
    )
  }

  const renderVoiceSelector = (
    field: keyof CreateVideoFormData,
    placeholder: string
  ) => {
    // Filter errors for consistency - only show errors after manual interaction or submit attempt
    const shouldShowErrors = formManuallyTouched || submitAttempted
    const filteredErrors = shouldShowErrors ? errors : {}
    return (
      <VoiceSelectorWrapper
        field={field}
        placeholder={placeholder}
        watch={watch}
        register={register}
        errors={filteredErrors}
        trigger={trigger}
        openDropdown={openDropdown}
        selectedVoice={selectedVoice}
        voices={allVoices.length > 0 ? allVoices : voices}
        voicesLoading={voicesLoading}
        voicesError={voicesError}
        preset={preset}
        onToggle={onDropdownToggle}
        onSelect={onDropdownSelect}
        onVoiceClick={onVoiceClick}
        onVoiceTypeChange={onVoiceTypeChange}
      />
    )
  }

  const renderMusicSelector = (
    field: keyof CreateVideoFormData,
    placeholder: string
  ) => {
    // Filter errors for consistency - only show errors after manual interaction or submit attempt
    const shouldShowErrors = formManuallyTouched || submitAttempted
    const filteredErrors = shouldShowErrors ? errors : {}
    return (
      <MusicSelectorWrapper
        field={field}
        placeholder={placeholder}
        watch={watch}
        register={register}
        errors={filteredErrors}
        trigger={trigger}
        openDropdown={openDropdown}
        selectedMusic={selectedMusic}
        musicList={allMusic.length > 0 ? allMusic : musicList}
        musicLoading={musicLoading}
        musicError={musicError}
        preset={preset}
        onToggle={onDropdownToggle}
        onSelect={onDropdownSelect}
        onMusicClick={onMusicClick}
        onMusicTypeChange={onMusicTypeChange}
      />
    )
  }

  const renderTrendsDropdown = (
    field: keyof CreateVideoFormData,
    placeholder: string
  ) => {
    const currentValue = watch(field)
    
    // Filter layer: Only show dropdown value if it exists in the options
    const isValidDropdownValue = allTrends.some(trend => trend.description === currentValue)
    const displayValue = isValidDropdownValue ? currentValue : ''
    
    const selectedTrend = allTrends.find(trend => trend.description === displayValue)
    const isOpen = openDropdown === field
    // Filter errors for consistency - only show errors after manual interaction or submit attempt
    const shouldShowErrors = formManuallyTouched || submitAttempted
    const filteredErrors = shouldShowErrors ? errors : {}
    // Hide error for videoTopic when custom topic input is shown
    const hasError = showCustomTopicInput && field === 'videoTopic' ? null : filteredErrors[field]
    
    // Use only city trends loading states
    const isLoading = cityTrendsLoading
    // Show missing fields error in videoTopic dropdown
    const combinedError = field === 'videoTopic' && missingFieldsError 
      ? missingFieldsError 
      : cityTrendsError

    return (
      <HybridTopicInput
        field={field}
        placeholder={placeholder}
        currentValue={displayValue || ''}
        selectedTrend={selectedTrend}
        isOpen={isOpen}
        hasError={hasError}
        trendsLoading={isLoading}
        trendsError={combinedError}
        safeTrends={allTrends}
        onToggle={onDropdownToggle}
        onSelect={onDropdownSelect}
        onBlur={(field) => trigger(field)}
        onRetry={() => {
          const cityValue = watch('city')
          const positionValue = watch('position')
          if (cityValue && cityValue.trim() && positionValue && positionValue.trim()) {
            onFetchCityTrends(cityValue, positionValue)
          }
        }}
        onCustomTopicClick={onCustomTopicClick}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div>
        <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
          Preset <span className="text-red-500">*</span>
        </label>
        {renderDropdown('preset', presetOptions, 'Select Preset')}
      </div>
      {/* Voice field - only shown when preset is selected */}
      {watch('preset') && (
        <div>
          <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
            Voice <span className="text-red-500">*</span>
          </label>
          {renderVoiceSelector('voice', 'Select Voice')}
        </div>
      )}
      {/* Music dropdown - only shown when a voice is selected */}
      {selectedVoice && (
        <div>
          <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
            Music
          </label>
          {renderMusicSelector('music', 'Select Music')}
        </div>
      )}
      <div>
        <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
          Language <span className="text-red-500">*</span>
        </label>
        {renderDropdown('language', languageOptions, 'Select Language')}
      </div>

      <div>
        <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
          Video Topic <span className="text-red-500">*</span>
        </label>
        {renderTrendsDropdown('videoTopic', 'Select a trend')}
      </div>

      {showCustomTopicInput && (
        <div>
          <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
            Custom Topic <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={customTopicValue}
            onChange={onCustomTopicChange}
            onBlur={onCustomTopicBlur}
            placeholder="Enter your custom topic"
            className={`w-full px-4 py-[10.5px] text-[18px] font-normal bg-[#EEEEEE] hover:bg-[#F5F5F5] border-0 rounded-[8px] text-left transition-all duration-300 focus:outline-none focus:ring focus:ring-[#5046E5] focus:bg-white text-gray-800 ${!customTopicValue.trim() && formManuallyTouched ? 'ring-2 ring-red-500' : ''}`}
          />
          {!customTopicValue.trim() && formManuallyTouched && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1" role="alert">
              <AlertCircle className="w-4 h-4" />
              Please enter a custom topic
            </p>
          )}
        </div>
      )}

      <div>
        <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
          Topic Key Points <span className="text-red-500">*</span>
          {keyPointsLoading && showCustomTopicInput && (
            <span className="text-blue-600 text-sm ml-2">Generating key points...</span>
          )}
        </label>
        {(() => {
          const isCustomTopic = showCustomTopicInput && customTopicValue && customTopicValue.trim()
          const placeholder = isCustomTopic ? 'Key points will auto-generate when you finish typing' : 'Key points will auto-fill when topic is selected'
          return renderInput('topicKeyPoints', placeholder, 'text')
        })()}
        {keyPointsError && showCustomTopicInput && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1" role="alert">
            <AlertCircle className="w-4 h-4" />
            {keyPointsError.length > 50 ? `${keyPointsError.substring(0, 50)}...` : keyPointsError}
          </p>
        )}
      </div>
    </div>
  )
}

