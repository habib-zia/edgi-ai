'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { AlertCircle, CheckCircle } from 'lucide-react'

import { useModalScrollLock } from '@/hooks/useModalScrollLock'
import { useSignupForm } from '@/hooks/useSignupForm'
import { useGoogleAuth } from '@/hooks/useGoogleAuth'
import LoadingButton from './loading-button'
import AuthModalWrapper from './auth-modal-wrapper'
import AuthFormInput from './auth-form-input'
import AuthPasswordInput from './auth-password-input'
import AuthGoogleButton from './auth-google-button'

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenSignin?: () => void
  onRegistrationSuccess?: (email: string) => void
}



export default function SignupModal({ isOpen, onClose, onOpenSignin, onRegistrationSuccess }: SignupModalProps) {
  // Use the custom scroll lock hook
  useModalScrollLock(isOpen)

  const firstInputRef = useRef<HTMLInputElement>(null)
  const errorAnnouncementRef = useRef<HTMLDivElement>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  
  // Use refs to store callbacks that can be updated
  const handleSuccessfulCloseRef = useRef<(() => void) | null>(null)
  const resetFormRef = useRef<(() => void) | null>(null)
  const cleanupGoogleRef = useRef<(() => void) | null>(null)

  // Use signup form hook (need resetForm for handleSuccessfulClose)
  const {
    formData,
    errors,
    isSubmitting,
    passwordStrength,
    handleInputChange,
    handleSignup,
    resetForm,
    loadFormData
  } = useSignupForm(onRegistrationSuccess, () => {
    // Call handleSuccessfulClose when signup is successful
    handleSuccessfulCloseRef.current?.()
  })

  // Store resetForm in ref
  useEffect(() => {
    resetFormRef.current = resetForm
  }, [resetForm])

  // Use Google auth hook (need cleanupGoogle for handleSuccessfulClose)
  const { isGoogleLoading, handleGoogleAuth, cleanup: cleanupGoogle } = useGoogleAuth({
    onSuccess: () => {
      // Call handleSuccessfulClose when Google auth is successful
      handleSuccessfulCloseRef.current?.()
    },
    onClose: () => {
      // Call handleSuccessfulClose when Google auth closes
      handleSuccessfulCloseRef.current?.()
    },
    isSignup: true
  })

  // Store cleanupGoogle in ref
  useEffect(() => {
    cleanupGoogleRef.current = cleanupGoogle
  }, [cleanupGoogle])

  // Define handleSuccessfulClose after hooks so it can use resetForm and cleanupGoogle
  const handleSuccessfulClose = useCallback(() => {
    cleanupGoogle()
    resetForm()
    setShowSuccess(false)
    onClose()
  }, [onClose, resetForm, cleanupGoogle])

  // Store handleSuccessfulClose in ref so hooks can use it
  useEffect(() => {
    handleSuccessfulCloseRef.current = handleSuccessfulClose
  }, [handleSuccessfulClose])

  const handleClose = useCallback(() => {
    cleanupGoogle()
    resetForm()
    setShowSuccess(false)
    onClose()
  }, [onClose, resetForm, cleanupGoogle])

  // Load saved form data on mount and clear errors when modal opens
  useEffect(() => {
    if (isOpen) {
      // Clear all error states and form data when modal opens
      resetForm()
      setShowSuccess(false)

      // Clear Google timeout if exists
      cleanupGoogle()
    } else {
      // Load saved form data when modal is closed (only if there's saved data)
      const savedData = localStorage.getItem('signupFormData')
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData)
          loadFormData(parsedData)
        } catch (error) {
          // Silently fail if data is corrupted
        }
      }
    }
  }, [isOpen, resetForm, cleanupGoogle, loadFormData])

  return (
    <AuthModalWrapper
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <>
          Welcome to <span className="text-[#5046E5]">EdgeAi</span>
        </>
      }
      description={
        <>
          Please enter your details to create your <br className="hidden md:block" /> account and make videos seamlessly.
        </>
      }
      modalId="signup-modal"
    >
      {showSuccess && (
        <div className="absolute inset-0 bg-white rounded-[12px] flex items-center justify-center z-10">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">Account Created Successfully!</h3>
            <p className="text-gray-600">Welcome to EdgeAi. You can now start creating amazing videos.</p>
          </div>
        </div>
      )}

      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm">{errors.general}</p>
        </div>
      )}

      <form onSubmit={(e) => {
        e.preventDefault();
        handleSignup(errorAnnouncementRef as { current: HTMLDivElement | null });
      }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 mb-4">
          <AuthFormInput
            ref={firstInputRef}
            id="firstName"
            label="First Name"
            value={formData.firstName}
            onChange={(value) => handleInputChange('firstName', value)}
            onBlur={() => {}}
            placeholder="Enter First Name"
            error={errors.firstName}
            required
          />
          <AuthFormInput
            id="lastName"
            label="Last Name"
            value={formData.lastName}
            onChange={(value) => handleInputChange('lastName', value)}
            onBlur={() => {}}
            placeholder="Enter Last Name"
            error={errors.lastName}
            required
          />
          <AuthFormInput
            id="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={(value) => handleInputChange('email', value)}
            onBlur={() => {}}
            placeholder="Enter Email"
            error={errors.email}
            required
          />
          <AuthFormInput
            id="phone"
            label="Phone"
            type="tel"
            value={formData.phone}
            onChange={(value) => handleInputChange('phone', value)}
            onBlur={() => {}}
            placeholder="Enter Phone Number"
            error={errors.phone}
          />
          <AuthPasswordInput
            id="password"
            label="Password"
            value={formData.password}
            onChange={(value) => handleInputChange('password', value)}
            onBlur={() => {}}
            placeholder="**********"
            error={errors.password}
            showStrengthIndicator
            passwordStrength={passwordStrength}
          />
          <AuthPasswordInput
            id="confirmPassword"
            label="Confirm Password"
            value={formData.confirmPassword}
            onChange={(value) => handleInputChange('confirmPassword', value)}
            onBlur={() => {}}
            placeholder="**********"
            error={errors.confirmPassword}
            showStrengthIndicator={false}
          />
        </div>

        <LoadingButton
          type="submit"
          loading={isSubmitting}
          disabled={isSubmitting}
          loadingText="Creating Account..."
          variant="primary"
          size="lg"
          fullWidth
          className="mb-6 py-[11.4px] px-6 rounded-full text-[20px]"
        >
          Sign Up
        </LoadingButton>

        <AuthGoogleButton
          onClick={handleGoogleAuth}
          isLoading={isGoogleLoading}
          text="Sign up with Google"
          loadingText="Signing up..."
        />

        <div className="text-center mt-6">
          <p className="text-[#101828] text-base font-normal">
            Already have an account?{' '}
            <button
              type="button"
              className="text-[#5046E5] text-[14px] font-semibold hover:underline cursor-pointer"
              onClick={() => {
                onClose()
                onOpenSignin?.()
              }}
            >
              Sign In
            </button>
          </p>
        </div>
      </form>
    </AuthModalWrapper>
  )
}