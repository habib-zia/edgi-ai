'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { IoMdArrowDropdown } from 'react-icons/io'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { apiService } from '@/lib/api-service'
import { useUnifiedSocketContext } from '@/components/providers/UnifiedSocketProvider'
import Checkbox from '../../checkbox'
import { AvatarData } from '../AvatarCreationModal'
import { useNotificationStore } from '../../global-notification'

interface VoiceAvatarDetailsProps {
  onBack: () => void
  avatarData: AvatarData
  setAvatarData: (data: AvatarData) => void
  onClose?: () => void
  onHideCloseButton?: () => void
}

export default function VoiceAvatarDetails({ onBack, avatarData, setAvatarData, onClose, onHideCloseButton }: VoiceAvatarDetailsProps) {
  const { user } = useSelector((state: RootState) => state.user)
  const { clearAvatarUpdates } = useUnifiedSocketContext()
  const { showNotification } = useNotificationStore()
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [errors, setErrors] = useState<Partial<Record<keyof AvatarData | 'terms' | 'general', string>>>({})
  const [showErrors, setShowErrors] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const genderOptions = [{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }]
  const languageOptions = [{ value: 'en', label: 'English' }]

  useEffect(() => {
    if (errors.general) {
      const timer = setTimeout(() => {
        setErrors(prev => ({ ...prev, general: undefined }))
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [errors.general])

  const handleInputChange = (field: keyof AvatarData, value: string) => {
    setAvatarData({ ...avatarData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
  }

  const handleDropdownSelect = (field: keyof AvatarData, value: string) => {
    setAvatarData({ ...avatarData, [field]: value });
    setOpenDropdown(null);
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
  }

  const validateForm = () => {
    const newErrors: Partial<Record<keyof AvatarData | 'terms' | 'general', string>> = {}
    if (!avatarData.name.trim()) newErrors.name = 'Name is required'
    if (!avatarData.description.trim()) newErrors.description = 'Description is required'
    if (!avatarData.gender) newErrors.gender = 'Gender is required'
    if (!avatarData.language) newErrors.language = 'Language is required'
    if (!agreedToTerms) newErrors.terms = 'You must agree to the terms'
    if (!avatarData.audioFiles || avatarData.audioFiles.length < 1) {
      newErrors.general = 'Please record at least 1 voice sample (first sample is required)'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreate = async () => {
    setShowErrors(true)
    if (!validateForm() || !avatarData.audioFiles || avatarData.audioFiles.length < 1) return

    setIsCreating(true)
    if (onHideCloseButton) onHideCloseButton()
    clearAvatarUpdates()

    const formData = new FormData()
    avatarData.audioFiles.forEach(file => {
      if (file !== null) {
        formData.append('files', file)
      }
    })
    formData.append('name', avatarData.name)
    formData.append('description', avatarData.description)
    formData.append('gender', avatarData.gender.toLowerCase())
    formData.append('language', avatarData.language)

    try {
      const result = await apiService.createVoiceAvatar(formData)
      if (result.success) {
        showNotification(result.message || 'Custom voice added successfully', 'success')
        if (onClose) onClose()
      } else {
        const errorMessage = result.message || 'Failed to create voice avatar'
        showNotification(errorMessage, 'error')
        setErrors({ ...errors, general: errorMessage })
        setIsCreating(false)
      }
    } catch (error) {
      console.error('Error creating voice avatar:', error)
      const errorMessage = 'Failed to create voice avatar'
      showNotification(errorMessage, 'error')
      setErrors({ ...errors, general: errorMessage })
      setIsCreating(false)
    }
  }

  const renderDropdown = (field: keyof AvatarData, options: { value: string; label: string }[], placeholder: string) => {
    const currentValue = avatarData[field] as string
    const selectedOption = options.find(option => option.value === currentValue)
    const isOpen = openDropdown === field
    const hasError = showErrors && errors[field]

    return (
      <div className="relative">
        <button type="button" onClick={() => setOpenDropdown(isOpen ? null : field)}
          className={`w-full px-4 py-[10.5px] text-[18px] font-normal bg-[#EEEEEE] hover:bg-[#F5F5F5] border-0 rounded-[8px] text-left transition-all duration-300 focus:outline-none focus:ring focus:ring-[#5046E5] focus:bg-white flex items-center justify-between cursor-pointer ${selectedOption ? 'text-gray-800 bg-[#F5F5F5]' : 'text-[#11101066]'} ${hasError ? 'ring-2 ring-red-500' : ''}`}>
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
          <IoMdArrowDropdown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-[8px] shadow-lg max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button key={option.value} type="button" onClick={() => handleDropdownSelect(field, option.value)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-800">
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-left px-2">
        <p className="text-[18px] font-normal text-[#5F5F5F]">Now, let&apos;s add some details to bring your avatar to life.</p>
      </div>

      {showErrors && errors.general && (
        <div className="px-2 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm">{errors.general}</p>
        </div>
      )}

      <div className="space-y-4 px-2">
        <div>
          <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">Name <span className="text-red-500">*</span></label>
          <input type="text" value={avatarData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Enter Name" className={`w-full px-4 py-[10.5px] text-[18px] font-normal placeholder:text-[#11101066] bg-[#EEEEEE] hover:bg-[#F5F5F5] border-0 rounded-[8px] text-gray-800 transition-all duration-300 focus:outline-none focus:ring focus:ring-[#5046E5] focus:bg-white ${showErrors && errors.name ? 'ring-2 ring-red-500' : ''}`} />
          {showErrors && errors.name && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.name}</p>}
        </div>
        <div>
          <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">Description <span className="text-red-500">*</span></label>
          <textarea value={avatarData.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Enter Description" rows={4} className={`w-full px-4 py-[10.5px] text-[18px] font-normal placeholder:text-[#11101066] bg-[#EEEEEE] hover:bg-[#F5F5F5] border-0 rounded-[8px] text-gray-800 transition-all duration-300 focus:outline-none focus:ring focus:ring-[#5046E5] focus:bg-white resize-none ${showErrors && errors.description ? 'ring-2 ring-red-500' : ''}`} />
          {showErrors && errors.description && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.description}</p>}
        </div>
        <div>
          <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">Gender <span className="text-red-500">*</span></label>
          {renderDropdown('gender', genderOptions, 'Select Gender')}
          {showErrors && errors.gender && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.gender}</p>}
        </div>
        <div>
          <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">Language <span className="text-red-500">*</span></label>
          {renderDropdown('language', languageOptions, 'Select')}
          {showErrors && errors.language && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.language}</p>}
        </div>
      </div>

      <div className="flex items-start gap-3 mt-5">
        <Checkbox checked={agreedToTerms} onChange={(e) => {
          const checked = e?.target?.checked || false
          setAgreedToTerms(checked)
          if (checked && errors.terms) setErrors({ ...errors, terms: undefined })
        }} label="By creating an avatar, I confirm that I am over 18 years of age (or the legal age in my country) and that the audio files used belong to me or I have obtained explicit permission from the individual represented. I understand that I am solely responsible for the content I upload and that the use of these audio files must comply with all applicable laws and regulations. Additionally, I agree not to upload any audio that infringes on others rights or that I do not have permission to use. By proceeding, I accept the Terms of Service and Privacy Policy." id="voice-terms-agreement" />
      </div>
      {showErrors && errors.terms && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.terms}</p>}

      <div className="flex flex-col gap-2 pt-0">
        {!isCreating && <button onClick={onBack} className="flex items-center gap-2 text-[#667085] hover:text-[#5046E5] transition-colors duration-300 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>}
        <button onClick={handleCreate} disabled={isCreating}
          className={`px-8 py-[11.3px] font-semibold text-[20px] rounded-full transition-colors duration-300 cursor-pointer w-full bg-[#5046E5] text-white hover:text-[#5046E5] hover:bg-transparent border-2 border-[#5046E5] ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {isCreating ? 'Creating...' : 'Create'}
        </button>
      </div>

      {openDropdown && <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />}
    </div>
  )
}
