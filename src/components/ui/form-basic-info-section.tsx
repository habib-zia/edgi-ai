'use client'

import { CreateVideoFormData } from './form-validation-schema'
import { UseFormRegister, UseFormWatch, UseFormTrigger, FieldErrors } from 'react-hook-form'
import FormInput from './form-input'
import FormDropdown from './form-dropdown'
import { Avatar } from '@/lib/api-service'

interface FormBasicInfoSectionProps {
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
  // Avatar-specific props
  avatarOptions: { value: string; label: string }[]
  positionOptions: { value: string; label: string }[]
  isFromDefaultAvatar: boolean
  extendedAvatarOptions: { value: string; label: string }[]
  avatars: {
    custom: Avatar[]
    default: Avatar[]
  }
  avatarsLoading: boolean
  avatarsError: string | null
  selectedAvatars: {
    title: Avatar | null
    body: Avatar | null
    conclusion: Avatar | null
  }
  onFetchAvatars: () => Promise<void>
  onAvatarClick: (avatar: Avatar) => void
  onDragStart: (e: React.DragEvent, avatar: Avatar) => void
  onDragEnd: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, slot: 'title' | 'body' | 'conclusion') => void
  onRemoveAvatar: (slot: 'title' | 'body' | 'conclusion') => void
  onClearAllAvatars: () => void
  isAvatarSelected: (avatar: Avatar) => boolean
  isAvatarTypeAllowed: (avatar: Avatar) => boolean
  isAvatarPending: (avatar: Avatar) => boolean
  getAvatarSelectionNumber: (avatar: Avatar) => number | null
  getAvatarType: (avatar: Avatar) => 'default' | 'custom' | 'video_avatar' | 'voice_avatar'
}

export default function FormBasicInfoSection({
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
  avatarOptions,
  positionOptions,
  isFromDefaultAvatar,
  extendedAvatarOptions,
  avatars,
  avatarsLoading,
  avatarsError,
  selectedAvatars,
  onFetchAvatars,
  onAvatarClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemoveAvatar,
  onClearAllAvatars,
  isAvatarSelected,
  isAvatarTypeAllowed,
  isAvatarPending,
  getAvatarSelectionNumber,
  getAvatarType
}: FormBasicInfoSectionProps) {
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
        // Avatar-specific props
        isAvatarField={field === 'avatar'}
        isFromDefaultAvatar={isFromDefaultAvatar}
        extendedAvatarOptions={extendedAvatarOptions}
        avatars={avatars}
        avatarsLoading={avatarsLoading}
        avatarsError={avatarsError}
        selectedAvatars={selectedAvatars}
        onFetchAvatars={onFetchAvatars}
        onAvatarClick={onAvatarClick}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onRemoveAvatar={onRemoveAvatar}
        onClearAllAvatars={onClearAllAvatars}
        isAvatarSelected={isAvatarSelected}
        isAvatarTypeAllowed={isAvatarTypeAllowed}
        isAvatarPending={isAvatarPending}
        getAvatarSelectionNumber={getAvatarSelectionNumber}
        getAvatarType={getAvatarType}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div>
        <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        {renderInput('name', 'e.g. John Smith', 'text', 'name')}
      </div>
      <div>
        <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
          Avatar <span className="text-red-500">*</span>
        </label>
        {renderDropdown('avatar', avatarOptions, 'Select Option')}
      </div>
      <div>
        <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
          Position <span className="text-red-500">*</span>
        </label>
        {renderDropdown('position', positionOptions, 'Select Option')}
      </div>
      <div>
        <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
          Company Name <span className="text-red-500">*</span>
        </label>
        {renderInput('companyName', 'e.g. Keller Williams', 'text', 'organization')}
      </div>
    </div>
  )
}

