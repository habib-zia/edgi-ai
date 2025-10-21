'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { apiService } from '@/lib/api-service'
import { useModalScrollLock } from '@/hooks/useModalScrollLock'


interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenSignin?: () => void
}

interface FormData {
  email: string
}

interface FormErrors {
  email: string
  general?: string
}

export default function ForgotPasswordModal({ isOpen, onClose, onOpenSignin }: ForgotPasswordModalProps) {
  // Use the custom scroll lock hook
  useModalScrollLock(isOpen)
  
  const [formData, setFormData] = useState<FormData>({
    email: ''
  })
  const [errors, setErrors] = useState<FormErrors>({
    email: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Toast state
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')

  useEffect(() => {
    if (isOpen)
    {
      // Reset form when modal opens
      setFormData({ email: '' })
      setErrors({ email: '' })
      setShowSuccess(false)
    }
  }, [isOpen])

  // Refs for focus management
  const modalRef = useRef<HTMLDivElement>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)
  const errorAnnouncementRef = useRef<HTMLDivElement>(null)

  // Show toast function
  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)

    // Auto hide toast after 5 seconds
    setTimeout(() => {
      setShowToast(false)
    }, 5000)
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    // Simple input sanitization
    const sanitizedValue = value.trim();

    setFormData(prev => ({
      ...prev,
      [field]: sanitizedValue
    }))

    // Clear error when user starts typing
    if (errors[field])
    {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {
      email: ''
    }

    // Validate email
    if (!formData.email.trim())
    {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
    {
      newErrors.email = 'Please enter a valid email address'
    }

    // Set the errors
    setErrors(newErrors)

    // Return true if no errors, false if there are errors
    return !Object.values(newErrors).some(error => error !== '')
  }

  const handleSubmit = async () => {
    // Enhanced rate limiting check
    // const clientId = `forgot_password_${formData.email || 'anonymous'}`
    // if (rateLimiter.current.isRateLimited(clientId)) {
    //   const remaining = rateLimiter.current.getRemainingAttempts(clientId)
    //   const errorMessage = remaining === 0 
    //     ? 'Too many password reset attempts. Please wait 5 minutes before trying again.'
    //     : `Please wait before trying again. ${remaining} attempts remaining.`

    //   showToastMessage(errorMessage, 'error')
    //   return
    // }


    if (!validateForm())
    {
      // Announce errors to screen readers
      if (errorAnnouncementRef.current)
      {
        errorAnnouncementRef.current.textContent = 'Form has validation errors. Please check all fields.'
      }
      showToastMessage('Please fix the validation errors before submitting.', 'error')
      return
    }

    setIsSubmitting(true)

    try
    {
      const response = await apiService.forgotPassword(formData.email)

      if (response.success)
      {
        setShowSuccess(true)
        showToastMessage('Password reset email sent successfully! Please check your inbox.', 'success')
      } else
      {
        showToastMessage(response.message || 'Failed to send reset email. Please try again.', 'error')
      }

    } catch (error)
    {
      console.error('Forgot password error:', error)
      showToastMessage('Something went wrong. Please try again.', 'error')
    } finally
    {
      setIsSubmitting(false)
    }
  }

  const handleClose = useCallback(() => {
    setFormData({ email: '' })
    setErrors({ email: '' })
    setShowSuccess(false)
    setShowToast(false)
    onClose()
  }, [onClose])

  const handleBackToSignin = () => {
    handleClose()
    if (onOpenSignin)
    {
      onOpenSignin()
    }
  }

  // Focus management and accessibility
  useEffect(() => {
    if (isOpen)
    {
      // Focus first input when modal opens
      setTimeout(() => {
        firstInputRef.current?.focus()
      }, 100)

      // Trap focus within modal
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape')
        {
          handleClose()
        }

        if (e.key === 'Tab' && modalRef.current)
        {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
          const firstElement = focusableElements[0] as HTMLElement
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

          if (e.shiftKey)
          {
            if (document.activeElement === firstElement)
            {
              e.preventDefault()
              lastElement.focus()
            }
          } else
          {
            if (document.activeElement === lastElement)
            {
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

  if (!isOpen) return null

  return (
    <>
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-[60] animate-in slide-in-from-right-2">
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

      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div
          ref={modalRef}
          className="bg-white rounded-[12px] xl:h-fit h-full md:px-[55px] px-4 pt-10 pb-10 max-w-[820px] w-full md:max-h-[615px] max-h-[700px] flex flex-col relative"
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgot-password-modal-title"
          aria-describedby="forgot-password-modal-description"
        >
          {/* Screen reader announcements */}
          <div
            ref={errorAnnouncementRef}
            className="sr-only"
            aria-live="polite"
            aria-atomic="true"
          />

          <button
            onClick={handleClose}
            className="cursor-pointer ml-4 absolute top-[30px] right-[30px]"
            aria-label="Close forgot password modal"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.5 1.5L1.5 22.5M1.5 1.5L22.5 22.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Success Message */}
          {showSuccess && (
            <div className="absolute inset-0 bg-white px-4 rounded-[12px] flex items-center justify-center z-10">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">Email Sent Successfully!</h3>
                <p className="text-gray-600 mb-4">
                  If an account with <strong>{formData.email}</strong> exists, we&apos;ve sent instructions to reset your password.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  If you haven&apos;t received the email, please check your spam folder.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setShowSuccess(false)
                      setFormData({ email: '' })
                    }}
                    className="w-full py-[11.4px] px-6 rounded-full font-semibold text-[20px] border-2 bg-[#5046E5] text-white border-[#5046E5] hover:bg-transparent hover:text-[#5046E5] transition-colors duration-300 cursor-pointer"
                  >
                    Send Another Email
                  </button>
                  <button
                    onClick={handleBackToSignin}
                    className="w-full py-[11.4px] px-6 rounded-full font-semibold text-[20px] border-2 border-[#5046E5] text-[#5046E5] hover:bg-[#5046E5] hover:text-white transition-colors duration-300 cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Header */}
          <div className="flex items-center justify-between flex-shrink-0">
            <div className="flex-1">
              <h3 id="forgot-password-modal-title" className="md:text-[48px] text-[25px] font-semibold text-[#282828] text-center">
                Forgot Your <span className="text-[#5046E5]">Password?</span>
              </h3>
              <p id="forgot-password-modal-description" className="text-[#667085] text-[16px] text-center mt-2">
                No worries! Enter your email address and we&apos;ll send you <br /> a link to reset your password.
              </p>
            </div>
          </div>

          {/* Modal Content */}
          <div className="pt-7 overflow-y-auto flex-1 px-2">
            {/* General Error Message */}
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{errors.general}</p>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Email */}
                <div className="w-full mb-[10px]">
                  <label htmlFor="email" className="block text-base font-normal text-[#5F5F5F] mb-1">
                    Email Address
                  </label>
                  <input
                    ref={firstInputRef}
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email address"
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    aria-invalid={!!errors.email}
                    className={`w-full px-4 py-3 bg-[#EEEEEE] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white ${errors.email ? 'ring-2 ring-red-500' : ''
                      }`}
                  />
                  {errors.email && (
                    <p id="email-error" className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-[11.4px] px-6 rounded-full font-semibold text-[20px] border-2 transition-colors duration-300 cursor-pointer mb-6 flex items-center justify-center gap-2 ${isSubmitting
                  ? 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed'
                  : 'bg-[#5046E5] text-white border-[#5046E5] hover:bg-transparent hover:text-[#5046E5]'
                  }`}
                aria-describedby={isSubmitting ? 'submitting-status' : undefined}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending Reset Link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              {isSubmitting && (
                <div id="submitting-status" className="sr-only" aria-live="polite">
                  Sending reset link, please wait...
                </div>
              )}

              {/* Back to Sign In Link */}
              <div className="text-center mt-6">
                <p className="text-[#101828] text-base font-normal">
                  Remember your password?{' '}
                  <button
                    type="button"
                    className="text-[#5046E5] text-[14px] font-semibold hover:underline cursor-pointer"
                    onClick={handleBackToSignin}
                  >
                    Back to Sign In
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
