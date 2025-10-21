'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, AlertCircle, Mail, CheckCircle } from 'lucide-react'

import { useAppDispatch } from '@/store/hooks'
import { updateUser } from '@/store/slices/userSlice'
import { apiService } from '@/lib/api-service'

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
  isEmailVerified?: boolean
  onUpdateProfile?: () => void
  isUpdating?: boolean
}

export default function ProfileInfoSection({ data, errors, onChange, isEmailVerified = false, onUpdateProfile, isUpdating = false }: ProfileInfoSectionProps) {
  const dispatch = useAppDispatch()
  const [showPassword, setShowPassword] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    // const processedValue = value.trim() 
    onChange(field, value)
  }

  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)

    // Auto hide toast after 5 seconds
    setTimeout(() => {
      setShowToast(false)
    }, 5000)
  }

  const refreshUserData = async () => {
    try
    {
      const response = await apiService.getCurrentUser()
      if (response.success && response.data)
      {
        // Update user data in Redux store
        dispatch(updateUser(response.data.user))
      }
    } catch (error)
    {
      // Silently fail - this is a background refresh
      // User will see updated status on next manual action
    }
  }

  // Periodically refresh user data to check for email verification status updates
  useEffect(() => {
    if (!isEmailVerified)
    {
      const interval = setInterval(() => {
        refreshUserData()
      }, 10000) // Check every 10 seconds

      return () => clearInterval(interval)
    }
  }, [isEmailVerified])

  const handleResendVerification = async () => {
    try
    {
      const response = await apiService.resendVerification(data.email)

      if (response.success)
      {
        showToastMessage('Verification email sent successfully! Please check your inbox.', 'success')

        // Refresh user data to get the latest verification status
        setTimeout(() => {
          refreshUserData()
        }, 1000) // Wait a bit for the server to process
      } else
      {
        showToastMessage(response.message || 'Failed to send verification email. Please try again.', 'error')
      }
    } catch (error)
    {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      showToastMessage(errorMessage, 'error')
    }
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
          {/* Email Verification Status */}
          {!isEmailVerified && (
            <div className="mt-1 flex items-center gap-1">
              <Mail className="w-3 h-3 text-orange-500" />
              <span className="text-xs text-orange-600">Email not verified</span>
              <button
                type="button"
                onClick={handleResendVerification}
                className="text-xs text-[#5046E5] cursor-pointer hover:text-[#4338CA] underline font-medium transition-colors"
              >
                Resend verification
              </button>
            </div>
          )}
          {isEmailVerified && (
            <div className="mt-1 flex items-center gap-1">
              <span className="text-[10px] text-green-600 pl-1">Email verified</span>
            </div>
          )}
          {errors.email && (
            <p id="email-error" className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.email}
            </p>
          )}
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

      {/* Password - Read Only */}
      <div className="w-full mt-6">
        <label htmlFor="password" className="block text-base font-normal text-[#5F5F5F] mb-1">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value="••••••••••"
            readOnly
            disabled
            placeholder="**********"
            aria-describedby={errors.password ? 'password-error' : undefined}
            aria-invalid={!!errors.password}
            className="w-full px-4 py-3 bg-[#F3F4F6] border-0 rounded-[8px] text-gray-600 placeholder-[#11101066] cursor-not-allowed pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            disabled
          >
            {showPassword ? <EyeOff className="w-5 h-5 text-[#98A2B3]" /> : <Eye className="w-5 h-5 text-[#98A2B3]" />}
          </button>
        </div>
        <div className="mt-1">
          <span className="text-xs text-gray-500">Use &quot;Forgot Password&quot; to change your password</span>
        </div>
        {errors.password && (
          <p id="password-error" className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.password}
          </p>
        )}
      </div>

      {/* Update Profile Button */}
      {onUpdateProfile && (
        <div className="flex justify-center mt-8">
          <button
            type="button"
            onClick={onUpdateProfile}
            disabled={isUpdating}
              className={`px-4 py-[11.4px] rounded-full font-semibold text-[14px] hover:text-[#5046E5] text-white transition-colors duration-200 ${isUpdating
              ? 'bg-gray-400 cursor-not-allowed'
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

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-2">
          <div className={`px-4 py-3 rounded-lg shadow-lg max-w-sm ${toastType === 'success'
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
            }`}>
            <div className="flex items-center gap-2">
              {toastType === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <p className="text-sm font-medium">{toastMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
