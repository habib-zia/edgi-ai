'use client'

import { useState } from 'react'
import { ArrowLeft, Check, AlertCircle } from 'lucide-react'
import { IoMdArrowDropdown } from "react-icons/io"
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { apiService } from '@/lib/api-service'
import { useUnifiedSocketContext } from '@/components/providers/UnifiedSocketProvider'
import Checkbox from '../../checkbox'

interface AvatarData {
  name: string
  age: string
  gender: string
  ethnicity: string
  videoFile: File | null
  consentVideoFile: File | null
  photoFiles: File[]
  avatarType: 'digital-twin' | 'photo-avatar' | null
}

interface VideoAvatarStep5Props {
  onBack: () => void
  avatarData: AvatarData
  setAvatarData: (data: AvatarData) => void
  onSkipBackToUpload?: () => void
  onClose?: () => void
  onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void
}

export default function VideoAvatarStep5({ onBack, avatarData, setAvatarData, onSkipBackToUpload, onClose, onShowToast }: VideoAvatarStep5Props) {
  const { user } = useSelector((state: RootState) => state.user)
  const { clearAvatarUpdates } = useUnifiedSocketContext()
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [errors, setErrors] = useState<Partial<Record<keyof AvatarData | 'terms' | 'general', string>>>({})
  const [showErrors, setShowErrors] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStatus, setGenerationStatus] = useState<string>('')

  const ageOptions = [
    { value: '18-24', label: '18-24' },
    { value: '25-34', label: '25-34' },
    { value: '35-44', label: '35-44' },
    { value: '45-54', label: '45-54' },
    { value: '55-64', label: '55-64' },
    { value: '65+', label: '65+' }
  ]

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Non-binary', label: 'Non-binary' },
    { value: 'Prefer not to say', label: 'Prefer not to say' }
  ]

  const ethnicityOptions = [
    { value: 'Asian', label: 'Asian' },
    { value: 'Black or African American', label: 'Black or African American' },
    { value: 'Hispanic or Latino', label: 'Hispanic or Latino' },
    { value: 'Native American or Alaska Native', label: 'Native American or Alaska Native' },
    { value: 'Native Hawaiian or Pacific Islander', label: 'Native Hawaiian or Pacific Islander' },
    { value: 'White', label: 'White' },
    { value: 'Middle Eastern or North African', label: 'Middle Eastern or North African' },
    { value: 'Mixed', label: 'Mixed' },
    { value: 'Prefer not to say', label: 'Prefer not to say' }
  ]

  const handleInputChange = (field: keyof AvatarData, value: string) => {
    setAvatarData({ ...avatarData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined })
    }
  }

  const handleDropdownSelect = (field: keyof AvatarData, value: string) => {
    setAvatarData({ ...avatarData, [field]: value })
    setOpenDropdown(null)
    // Clear error for this field when user selects a value
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined })
    }
  }

  const handleDropdownToggle = (field: keyof AvatarData) => {
    setOpenDropdown(openDropdown === field ? null : field)
  }

  const renderDropdown = (
    field: keyof AvatarData,
    options: { value: string; label: string }[],
    placeholder: string
  ) => {
    const currentValue = avatarData[field] as string
    const selectedOption = options.find(option => option.value === currentValue)
    const isOpen = openDropdown === field
    const hasError = showErrors && errors[field]

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => handleDropdownToggle(field)}
          className={`w-full px-4 py-[10.5px] text-[18px] font-normal bg-[#EEEEEE] hover:bg-[#F5F5F5] border-0 rounded-[8px] text-left transition-all duration-300 focus:outline-none focus:ring focus:ring-[#5046E5] focus:bg-white flex items-center justify-between cursor-pointer ${
            selectedOption ? 'text-gray-800 bg-[#F5F5F5]' : 'text-[#11101066]'
          } ${hasError ? 'ring-2 ring-red-500' : ''}`}
        >
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
          <IoMdArrowDropdown 
            className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>
        
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-[8px] shadow-lg max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleDropdownSelect(field, option.value)}
                className="w-full px-4 py-3 text-left hover:bg-[#F5F5F5] transition-colors duration-200 flex items-center justify-between text-[#282828] cursor-pointer"
              >
                <span>{option.label}</span>
                {currentValue === option.value && (
                  <Check className="w-4 h-4 text-[#5046E5]" />
                )}
              </button>
            ))}
          </div>
        )}
        
        {hasError && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1" role="alert">
            <AlertCircle className="w-4 h-4" />
            {errors[field]}
          </p>
        )}
      </div>
    )
  }

  const validateForm = () => {
    const newErrors: typeof errors = {}
    
    if (!avatarData.name || avatarData.name.trim() === '') {
      newErrors.name = 'Name is required'
    }
    
    if (!avatarData.age || avatarData.age.trim() === '') {
      newErrors.age = 'Age is required'
    }
    
    if (!avatarData.gender || avatarData.gender.trim() === '') {
      newErrors.gender = 'Gender is required'
    }
    
    if (!avatarData.ethnicity || avatarData.ethnicity.trim() === '') {
      newErrors.ethnicity = 'Ethnicity is required'
    }
    
    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreate = async () => {
    setShowErrors(true)
    const isValid = validateForm()
    
    if (isValid) {
      // Check if user is logged in
      if (!user?.id) {
        setErrors({ ...errors, general: 'Please log in to create an avatar' })
        return
      }

      // Check if both videos are uploaded
      if (!avatarData.videoFile) {
        setErrors({ ...errors, general: 'Please upload a training video first' })
        return
      }

      if (!avatarData.consentVideoFile) {
        setErrors({ ...errors, general: 'Please record a consent video first' })
        return
      }

      // Allow multiple avatar creation - removed global processing check
      // Each avatar creation is independent and can run simultaneously

      setIsCreating(true)
      clearAvatarUpdates() // Clear any previous notifications

      try {
        console.log('🎬 Creating video avatar with HeyGen API')
        console.log('📹 Training video file:', avatarData.videoFile)
        console.log('📹 Consent video file:', avatarData.consentVideoFile)
        console.log('👤 Avatar name:', avatarData.name)
        
        // Call HeyGen API with actual File objects
        const result = await apiService.createVideoAvatar(
          avatarData.videoFile,
          avatarData.consentVideoFile,
          avatarData.name
        )
        
        if (result.success) {
          // Store the avatar_id for status checking
          console.log('✅ Video avatar created successfully:', result.data)
          const avatarId = result.data?.avatar_id
          if (!avatarId) {
            setErrors({ ...errors, general: 'No avatar ID received from server' })
            return
          }
          console.log('🆔 Avatar ID:', avatarId)
          
          // Start polling for avatar status
          console.log('🔄 Starting status polling...')
          setIsGenerating(true)
          setGenerationStatus('Avatar generation started... This process may take 5-10 minutes. Please keep this page open.')
          
          const statusResult = await apiService.pollVideoAvatarStatus(
            avatarId,
            (status, data) => {
              console.log(`📊 Status update: ${status}`, data)
              // Update UI with status and show notifications for all statuses
              if (status === 'in_progress') {
                setGenerationStatus('Generating your avatar... This may take a few minutes.')
                // Show processing notification (non-dismissible)
                if (onShowToast) {
                  onShowToast('Avatar is being generated... Please wait', 'info')
                }
              } else if (status === 'completed') {
                setGenerationStatus('Avatar generation completed!')
                // Show success notification
                if (onShowToast) {
                  onShowToast('Avatar generated successfully!', 'success')
                }
              } else if (status === 'failed') {
                setGenerationStatus('Avatar generation failed.')
                // Show error notification
                if (onShowToast) {
                  onShowToast('Avatar generation failed. Please try again.', 'error')
                }
              }
            }
          )
          
          if (statusResult.success) {
            console.log('🎉 Avatar generation completed!', statusResult.data)
            // Close modal on success
            if (onClose) {
              onClose()
            }
          } else {
            console.error('❌ Avatar generation failed:', statusResult.message)
            setErrors({ ...errors, general: statusResult.message || 'Avatar generation failed' })
          }
        } else {
          setErrors({ ...errors, general: result.message || 'Failed to create video avatar' })
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create avatar'
        setErrors({ ...errors, general: errorMessage })
      } finally {
        setIsCreating(false)
        setIsGenerating(false)
      }
    } else {
      // Scroll to top to show errors
      const container = document.querySelector('.flex-1.overflow-y-auto')
      if (container) {
        container.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  const handleBack = () => {
    // Skip back to upload step (Step 3) instead of going through intermediate steps
    if (onSkipBackToUpload) {
      onSkipBackToUpload()
    } else {
      onBack()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-left px-2">
        <p className="text-[18px] font-normal text-[#5F5F5F]">
        Now, let&apos;s add some details to bring your avatar to life.
        </p>
        
      </div>

      {/* General Error Message */}
      {showErrors && errors.general && (
        <div className="px-2 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm">{errors.general}</p>
        </div>
      )}

      {/* Generation Status Message */}
      {isGenerating && generationStatus && (
        <div className="px-2 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
          <p className="text-blue-700 text-sm">{generationStatus}</p>
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-4 px-2">
        {/* Name */}
        <div>
          <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={avatarData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter avatar name"
            className={`w-full px-4 py-[10.5px] text-[18px] font-normal placeholder:text-[#11101066] bg-[#EEEEEE] hover:bg-[#F5F5F5] border-0 rounded-[8px] text-gray-800 transition-all duration-300 focus:outline-none focus:ring focus:ring-[#5046E5] focus:bg-white ${
              showErrors && errors.name ? 'ring-2 ring-red-500' : ''
            }`}
          />
          {showErrors && errors.name && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1" role="alert">
              <AlertCircle className="w-4 h-4" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Age */}
        <div>
          <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
            Age <span className="text-red-500">*</span>
          </label>
          {renderDropdown('age', ageOptions, 'Select age range')}
          {showErrors && errors.age && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1" role="alert">
              <AlertCircle className="w-4 h-4" />
              {errors.age}
            </p>
          )}
        </div>

        {/* Gender */}
        <div>
          <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
            Gender <span className="text-red-500">*</span>
          </label>
          {renderDropdown('gender', genderOptions, 'Select gender')}
          {showErrors && errors.gender && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1" role="alert">
              <AlertCircle className="w-4 h-4" />
              {errors.gender}
            </p>
          )}
        </div>

        {/* Ethnicity */}
        <div>
          <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
            Ethnicity <span className="text-red-500">*</span>
          </label>
          {renderDropdown('ethnicity', ethnicityOptions, 'Select ethnicity')}
          {showErrors && errors.ethnicity && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1" role="alert">
              <AlertCircle className="w-4 h-4" />
              {errors.ethnicity}
            </p>
          )}
        </div>
      </div>

      {/* Terms & Privacy */}
      <div>
        <div className="flex items-start gap-3 mt-5">
          <Checkbox 
            checked={agreedToTerms} 
            onChange={(e) => {
              const checked = e?.target?.checked || false
              setAgreedToTerms(checked)
              // Clear terms error when user checks the box
              if (checked && errors.terms) {
                setErrors({ ...errors, terms: undefined })
              }
            }} 
            label="By creating an avatar, I confirm that I am over 18 years of age (or the legal age in my country) and that the photos used belong to me or I have obtained explicit permission from the individual represented. I understand that I am solely responsible for the content I upload and that the use of these images must comply with all applicable laws and regulations. Additionally, I agree not to upload any photos that infringe on others rights or that I do not have permission to use. By proceeding, I accept the Terms of Service and Privacy Policy."
            id="terms-agreement"
          />
        </div>
        {showErrors && errors.terms && (
          <p className="text-red-500 text-sm mt-2 flex items-center gap-1" role="alert">
            <AlertCircle className="w-4 h-4" />
            {errors.terms}
          </p>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col gap-2 justify-between pt-0">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-[#667085] hover:text-[#5046E5] transition-colors duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleCreate}
          disabled={isCreating || isGenerating}
          className={`px-8 py-[11.3px] font-semibold text-[20px] rounded-full transition-colors duration-300 cursor-pointer w-full bg-[#5046E5] text-white hover:text-[#5046E5] hover:bg-transparent border-2 border-[#5046E5] ${(isCreating || isGenerating) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isCreating ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Creating Avatar...
            </div>
          ) : isGenerating ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Generating...
            </div>
          ) : (
            'Create'
          )}
        </button>
      </div>

      {/* Click outside to close dropdowns */}
      {openDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setOpenDropdown(null)}
        />
      )}
    </div>
  )
}
