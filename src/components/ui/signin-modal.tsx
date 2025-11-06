'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { useModalScrollLock } from '@/hooks/useModalScrollLock'
import { useSigninForm } from '@/hooks/auth/useSigninForm'
import { useGoogleAuth } from '@/hooks/auth/useGoogleAuth'
import LoadingButton from './loading-button'
import AuthModalWrapper from './auth-modal-wrapper'
import FormField from '@/components/auth-components/FormField'
import PasswordField from '@/components/auth-components/PasswordField'
import GoogleAuthButton from '@/components/auth-components/google-auth-button'
import AuthSwitchLink from '@/components/auth-components/auth-switch-link'
import RememberMeCheckbox from '@/components/auth-components/RememberMeCheckbox'
import EmailVerificationMessage from '@/components/auth-components/EmailVerificationMessage'

interface SigninModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenSignup?: () => void
  onOpenForgotPassword?: () => void
}

export default function SigninModal({ isOpen, onClose, onOpenSignup, onOpenForgotPassword }: SigninModalProps) {
  // Use the custom scroll lock hook
  useModalScrollLock(isOpen)

  const firstInputRef = useRef<HTMLInputElement>(null)
  const errorAnnouncementRef = useRef<HTMLDivElement>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  // Use refs to store callbacks that can be updated
  const handleSuccessfulCloseRef = useRef<(() => void) | null>(null)
  const resetFormRef = useRef<(() => void) | null>(null)
  const cleanupGoogleRef = useRef<(() => void) | null>(null)

  // Use signin form hook
  const {
    formData,
    errors,
    isSubmitting,
    rememberMe,
    setRememberMe,
    emailVerificationStatus,
    showVerificationMessage,
    isResendingVerification,
    handleInputChange,
    handleSignin,
    handleResendVerification,
    handleCloseVerificationMessage,
    resetForm
  } = useSigninForm({
    onSuccess: () => {
      handleSuccessfulCloseRef.current?.()
    }
  })

  // Store resetForm in ref
  useEffect(() => {
    resetFormRef.current = resetForm
  }, [resetForm])

  // Use Google auth hook
  const { isGoogleLoading, handleGoogleAuth, cleanup: cleanupGoogle } = useGoogleAuth({
    onSuccess: () => {
      handleSuccessfulCloseRef.current?.()
    },
    onClose: () => {
      handleSuccessfulCloseRef.current?.()
    },
    isSignup: false
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

  const handleForgotPassword = useCallback(() => {
    onClose()
    onOpenForgotPassword?.()
  }, [onClose, onOpenForgotPassword])

  // Clear errors when modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens (but keep saved email if remember me was checked)
      const savedEmail = localStorage.getItem('signinEmail')
      if (!savedEmail) {
        resetForm()
      }
      setShowSuccess(false)
      cleanupGoogle()
    }
  }, [isOpen, resetForm, cleanupGoogle])

  return (
    <AuthModalWrapper
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <>
          Welcome Back to <span className="text-[#5046E5]">EdgeAi</span>
        </>
      }
      description={
        <>
          Please enter your credentials to access your <br className='hidden md:block' /> account and create videos seamlessly.
        </>
      }
      modalId="signin-modal"
      maxHeight="md:max-h-[615px] max-h-[700px]"
        >
          {/* Screen reader announcements */}
          <div
            ref={errorAnnouncementRef}
            className="sr-only"
            aria-live="polite"
            aria-atomic="true"
          />

          {/* Success Message */}
          {showSuccess && (
            <div className="absolute inset-0 bg-white rounded-[12px] flex items-center justify-center z-10">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">Login Successful!</h3>
                <p className="text-gray-600">
                  Welcome back to EdgeAi. You can now start creating amazing videos.
                </p>
              </div>
            </div>
          )}

            {/* General Error Message */}
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Email Verification Message */}
            {showVerificationMessage && emailVerificationStatus && (
        <EmailVerificationMessage
          email={emailVerificationStatus.email}
          isResending={isResendingVerification}
          onResend={handleResendVerification}
          onClose={handleCloseVerificationMessage}
        />
      )}

      <form onSubmit={(e) => {
        e.preventDefault()
        handleSignin(errorAnnouncementRef as { current: HTMLDivElement | null })
      }}>
              {/* Form Fields */}
              <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-baseline">
          <FormField
                    ref={firstInputRef}
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

          <PasswordField
                      id="password"
            label="Password"
                      value={formData.password}
            onChange={(value) => handleInputChange('password', value)}
            onBlur={() => {}}
                      placeholder="**********"
            error={errors.password}
            showStrengthIndicator={false}
          />
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between mb-6 mt-3">
          <RememberMeCheckbox
                      checked={rememberMe}
            onChange={setRememberMe}
          />
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[#577FB9] text-sm font-semibold hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In Button */}
              <LoadingButton
                type="submit"
                loading={isSubmitting}
                disabled={isSubmitting}
                loadingText="Signing In..."
                variant="primary"
                size="lg"
                fullWidth
                className="mb-6 py-[11.4px] px-6 rounded-full text-[20px]"
              >
                Log in
              </LoadingButton>

              {/* Google Sign In Button */}
        <GoogleAuthButton
          onClick={handleGoogleAuth}
          isLoading={isGoogleLoading}
          buttonText="Sign in with Google"
          loadingText="Signing in..."
        />

              {/* Footer Link */}
        <AuthSwitchLink
          questionText="No account yet?"
          linkText="Sign up"
                    onClick={() => {
                      onClose()
                      onOpenSignup?.()
                    }}
        />
            </form>
    </AuthModalWrapper>
  )
}
