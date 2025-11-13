'use client'

import { useEffect, useRef } from 'react'
import { AlertCircle } from 'lucide-react'

interface ProfileFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
}

interface ProfileFormErrors {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
}

interface ProfileInfoSectionProps {
  data: ProfileFormData
  errors: ProfileFormErrors
  onChange: (field: keyof ProfileFormData, value: string) => void
  onUpdateProfile?: () => void
  isUpdating?: boolean
}

export default function ProfileInfoSection({ data, errors, onChange, onUpdateProfile, isUpdating = false }: ProfileInfoSectionProps) {
  const initialValuesRef = useRef<{ firstName: string; lastName: string; phone: string } | null>(null)

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    onChange(field, value)
  }

  useEffect(() => {
    if (!initialValuesRef.current && (data.firstName || data.lastName || data.phone || data.email)) {
      initialValuesRef.current = {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || ''
      }
    }
  }, [data.firstName, data.lastName, data.phone, data.email])

  const prevIsUpdatingRef = useRef(isUpdating)
  useEffect(() => {
    if (prevIsUpdatingRef.current && !isUpdating) {
      initialValuesRef.current = {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || ''
      }
    }
    prevIsUpdatingRef.current = isUpdating
  }, [isUpdating, data.firstName, data.lastName, data.phone])

  const hasChanges = (): boolean => {
    if (!initialValuesRef.current) {
      return false
    }
    
    const initial = initialValuesRef.current
    const current = {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      phone: data.phone || ''
    }
    
    return (
      initial.firstName !== current.firstName ||
      initial.lastName !== current.lastName ||
      initial.phone !== current.phone
    )
  }

  return (
    <div className="">
      <h1 className="text-[32px] font-semibold text-[#282828] text-center mb-8">
        Profile Info
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div className="w-full">
          <label htmlFor="firstName" className="block text-base font-normal text-[#5F5F5F] mb-1">
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            value={data.firstName || ''}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            placeholder="Enter First Name"
            aria-describedby={errors.firstName ? 'firstName-error' : undefined}
            aria-invalid={!!errors.firstName}
            className={`w-full px-4 py-3 bg-[#EEEEEE] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white ${errors.firstName ? 'ring-2 ring-red-500' : ''
              }`}
          />
          {errors.firstName && (
            <p id="firstName-error" className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.firstName}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div className="w-full">
          <label htmlFor="lastName" className="block text-base font-normal text-[#5F5F5F] mb-1">
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            value={data.lastName || ''}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            placeholder="Enter Last Name"
            aria-describedby={errors.lastName ? 'lastName-error' : undefined}
            aria-invalid={!!errors.lastName}
            className={`w-full px-4 py-3 bg-[#EEEEEE] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white ${errors.lastName ? 'ring-2 ring-red-500' : ''
              }`}
          />
          {errors.lastName && (
            <p id="lastName-error" className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.lastName}
            </p>
          )}
        </div>

        {/* Email - Read Only */}
        <div className="w-full">
          <label htmlFor="email" className="block text-base font-normal text-[#5F5F5F] mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={data.email || ''}
            readOnly
            disabled
            placeholder="Enter Email"
            aria-describedby={errors.email ? 'email-error' : undefined}
            aria-invalid={!!errors.email}
            className="w-full px-4 py-3 bg-[#F3F4F6] border-0 rounded-[8px] text-gray-600 placeholder-[#11101066] cursor-not-allowed"
          />
        </div>

        {/* Phone */}
        <div className="w-full">
          <label htmlFor="phone" className="block text-base font-normal text-[#5F5F5F] mb-1">
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            value={data.phone || ''}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Enter Phone"
            aria-describedby={errors.phone ? 'phone-error' : undefined}
            aria-invalid={!!errors.phone}
            className={`w-full px-4 py-3 bg-[#EEEEEE] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white ${errors.phone ? 'ring-2 ring-red-500' : ''
              }`}
          />
          {errors.phone && (
            <p id="phone-error" className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.phone}
            </p>
          )}
        </div>
      </div>

      {/* Update Profile Button */}
      {onUpdateProfile && (
        <div className="flex justify-center mt-8">
          <button
            type="button"
            onClick={onUpdateProfile}
            disabled={isUpdating || !hasChanges()}
              className={`px-4 py-[11.4px] rounded-full font-semibold text-[14px] hover:text-[#5046E5] text-white transition-colors duration-200 ${isUpdating || !hasChanges()
              ? 'bg-gray-400 cursor-not-allowed text-gray-400 hover:text-white'
              : 'hover:bg-transparent bg-[#5046E5] border border-[#5046E5]'
              }`}
          >
            {isUpdating ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Updating...
              </div>
            ) : (
              'Update Detail'
            )}
          </button>
        </div>
      )}

    </div>
  )
}
