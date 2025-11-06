'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { AlertCircle, CheckCircle } from 'lucide-react'

import { useModalScrollLock } from '@/hooks/useModalScrollLock'
import { useSignupForm } from '@/hooks/useSignupForm'
import { useGoogleAuth } from '@/hooks/useGoogleAuth'
import LoadingButton from './loading-button'
import AuthSwitchLink from '../auth-components/auth-switch-link'
import GoogleAuthButton from '../auth-components/google-auth-button'
import FormField from '../auth-components/FormField'
import PasswordField from '../auth-components/PasswordField'

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenSignin?: () => void
  onRegistrationSuccess?: (email: string) => void
}



export default function SignupModal({ isOpen, onClose, onOpenSignin, onRegistrationSuccess }: SignupModalProps) {
  // Use the custom scroll lock hook
  useModalScrollLock(isOpen)

  // Refs for focus management
  const modalRef = useRef<HTMLDivElement>(null)
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


  // Focus management and accessibility
  useEffect(() => {
    if (isOpen) {
      // Focus first input when modal opens
      setTimeout(() => {
        firstInputRef.current?.focus()
      }, 100)

      // Trap focus within modal
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleClose()
        }

        if (e.key === 'Tab' && modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
          const firstElement = focusableElements[0] as HTMLElement
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault()
              lastElement.focus()
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault()
              firstElement.focus()
            }
          }
        }
      }

      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isOpen, handleClose])

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

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div
          ref={modalRef}
          className="bg-white rounded-[12px] xl:h-fit h-full md:px-[55px] px-4 pt-10 pb-10 max-w-[820px] w-full max-h-[726px] flex flex-col relative"
          role="dialog"
          aria-modal="true"
          aria-labelledby="signup-modal-title"
          aria-describedby="signup-modal-description">
          <div
            ref={errorAnnouncementRef}
            className="sr-only"
            aria-live="polite"
            aria-atomic="true" />
          <button
            onClick={handleClose}
            className="cursor-pointer md:ml-4 md:absolute md:top-[30px] md:right-[30px] absolute top-[20px] right-[20px]"
            aria-label="Close signup modal">
            <svg width="24" height="24" className="md:w-6 md:h-6 w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.5 1.5L1.5 22.5M1.5 1.5L22.5 22.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {showSuccess && (
            <div className="absolute inset-0 bg-white rounded-[12px] flex items-center justify-center z-10">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">Account Created Successfully!</h3>
                <p className="text-gray-600">Welcome to EdgeAi. You can now start creating amazing videos.</p>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between flex-shrink-0">
            <div className="flex-1">
              <h3 id="signup-modal-title" className="md:text-[48px] text-[25px] font-semibold text-[#282828] text-center">
                Welcome to <span className="text-[#5046E5]">EdgeAi</span>
              </h3>
              <p id="signup-modal-description" className="text-[#667085] text-[16px] text-center mt-2">
                Please enter your details to create your <br className="hidden md:block" /> account and make videos seamlessly.
              </p>
            </div>
          </div>
          <div className="pt-7 overflow-y-auto flex-1 px-2">
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
                <FormField
                  ref={firstInputRef}
                  id="firstName"
                  label="First Name"
                  value={formData.firstName}
                  onChange={(value) => handleInputChange('firstName', value)}
                  onBlur={() => { }}
                  placeholder="Enter First Name"
                  error={errors.firstName}
                  required />
                <FormField
                  id="lastName"
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(value) => handleInputChange('lastName', value)}
                  onBlur={() => { }}
                  placeholder="Enter Last Name"
                  error={errors.lastName}
                  required />
                <FormField
                  id="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(value) => handleInputChange('email', value)}
                  onBlur={() => { }}
                  placeholder="Enter Email"
                  error={errors.email}
                  required />
                <FormField
                  id="phone"
                  label="Phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(value) => handleInputChange('phone', value)}
                  onBlur={() => { }}
                  placeholder="Enter Phone Number"
                  error={errors.phone}
                />
                <PasswordField
                  id="password"
                  label="Password"
                  value={formData.password}
                  onChange={(value) => handleInputChange('password', value)}
                  onBlur={() => { }}
                  placeholder="**********"
                  error={errors.password}
                  showStrengthIndicator
                  passwordStrength={passwordStrength}
                />
                <PasswordField
                  id="confirmPassword"
                  label="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(value) => handleInputChange('confirmPassword', value)}
                  onBlur={() => { }}
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
              <GoogleAuthButton
                onClick={handleGoogleAuth}
                isLoading={isGoogleLoading}
                buttonText="Sign up with Google"
                loadingText="Signing up..."
              />
              <AuthSwitchLink
                questionText="Already have an account?"
                linkText="Sign In"
                onClick={() => {
                  onClose()
                  onOpenSignin?.()
                }}/>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}