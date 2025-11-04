'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

import { validatePassword, getPasswordStrength, getPasswordStrengthColor, getPasswordStrengthBgColor } from '@/lib/password-validation'
import { useAppDispatch } from '@/store/hooks'
import { setUser } from '@/store/slices/userSlice'
import { validateAndHandleToken } from '@/lib/jwt-client'
import { apiService } from '@/lib/api-service'
import LoadingButton from './loading-button'
import { useModalScrollLock } from '@/hooks/useModalScrollLock'
import { useNotificationStore } from './global-notification'

// Google OAuth TypeScript declarations
declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (response: { access_token?: string; error?: string }) => void
          }) => {
            requestAccessToken: () => void
          }
        }
      }
    }
  }
}

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenSignin?: () => void
  onRegistrationSuccess?: (email: string) => void
}

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  general?: string
}

interface PasswordStrength {
  score: number
  feedback: string[]
}



export default function SignupModal({ isOpen, onClose, onOpenSignin, onRegistrationSuccess }: SignupModalProps) {
  const dispatch = useAppDispatch()
  const { showNotification } = useNotificationStore()
  
  // Use the custom scroll lock hook
  useModalScrollLock(isOpen)

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<FormErrors>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ score: 0, feedback: [] })
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  // Refs for focus management
  const modalRef = useRef<HTMLDivElement>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)
  const errorAnnouncementRef = useRef<HTMLDivElement>(null)

  // Password strength checker using centralized validation
  const checkPasswordStrength = (password: string): PasswordStrength => {
    const result = validatePassword(password)
    return {
      score: result.score,
      feedback: result.feedback
    }
  }

  // Phone number is now optional and accepts any format

  // Simple input sanitization
  const enhancedSanitizeInput = (value: string): string => {
    return value.trim();
  }


  // Legacy rate limiting check (now using RateLimiter class)
  // const checkRateLimit = (): boolean => {
  //   const now = Date.now()
  //   const timeSinceLastSubmission = now - lastSubmissionTime

  //   if (timeSinceLastSubmission < 2000) { // 2 seconds cooldown
  //     return false
  //   }

  //   if (submissionCount >= 5 && timeSinceLastSubmission < 60000) { // 5 attempts per minute
  //     return false
  //   }

  //   return true
  // }


  const handleInputChange = (field: keyof FormData, value: string) => {
    let processedValue = value

    // Apply field-specific processing with enhanced security
    if (field === 'phone') {
      // For phone, only allow digits and spaces
      processedValue = value.replace(/[^0-9\s]/g, '')
    } else if (field === 'firstName' || field === 'lastName') {
      // For names, allow any characters including spaces - no filtering
      processedValue = value
    } else {
      processedValue = enhancedSanitizeInput(value)
    }

    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }))

    // Real-time password strength check (keep this for better UX)
    if (field === 'password')
    {
      setPasswordStrength(checkPasswordStrength(processedValue))
    }

    // Clear error when user starts typing (keep this for better UX)
    if (errors[field])
    {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  // Remove blur validation - validation only happens on submit
  const handleInputBlur = () => {
    // No validation on blur - only on submit
  }

  const validateForm = () => {
    const newErrors = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    }

    // Validate each field and collect errors
    Object.entries(formData).forEach(([key, value]) => {
      const field = key as keyof FormData
      switch (field)
      {
        case 'firstName':
          if (!value.trim())
          {
            newErrors.firstName = 'First Name is required'
          }
          break
        case 'lastName':
          if (!value.trim())
          {
            newErrors.lastName = 'Last Name is required'
          }
          break
        case 'email':
          if (!value.trim())
          {
            newErrors.email = 'Email is required'
          } else if (!value.includes('@'))
          {
            newErrors.email = 'Email must contain @ symbol'
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          {
            newErrors.email = 'Please enter a valid email address'
          }
          break
        case 'phone':
          if (value.trim() && !/^[0-9]+$/.test(value.replace(/\s+/g, '')))
          {
            newErrors.phone = 'Phone number can only contain digits'
          }
          break
        case 'password':
          if (!value.trim())
          {
            newErrors.password = 'Password is required'
          } else
          {
            const passwordResult = validatePassword(value)
            if (!passwordResult.isValid)
            {
              newErrors.password = passwordResult.errors[0] || 'Password does not meet requirements'
            }
          }
          break
        case 'confirmPassword':
          if (!value.trim())
          {
            newErrors.confirmPassword = 'Confirm Password is required'
          } else if (value !== formData.password)
          {
            newErrors.confirmPassword = 'Passwords do not match'
          }
          break
      }
    })

    // Set the errors
    setErrors(newErrors)

    // Return true if no errors, false if there are errors
    return !Object.values(newErrors).some(error => error !== '')
  }

  const handleSignup = async () => {
    // Simple rate limiting check
    const now = Date.now();
    const lastAttempt = localStorage.getItem('lastSignupAttempt') || '0';
    const attemptCount = parseInt(localStorage.getItem('signupAttemptCount') || '0');

    if (now - parseInt(lastAttempt) < 60000 && attemptCount >= 5)
    {
      showNotification('Too many signup attempts. Please wait 1 minute before trying again.', 'error');
      return;
    }


    if (!validateForm())
    {
      // Announce errors to screen readers
      if (errorAnnouncementRef.current)
      {
        errorAnnouncementRef.current.textContent = 'Form has validation errors. Please check all fields.'
      }
      showNotification('Please fix the validation errors before submitting.', 'error')
      return
    }

    setIsSubmitting(true)

    try
    {
      // Call the registration API using new Express backend with global loading
      const response = await apiService.registerWithGlobalLoading({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      })

      const data = response

      if (data.success)
      {
        // Clear saved form data from localStorage after successful registration
        localStorage.removeItem('signupFormData')

        // Update rate limiting
        localStorage.setItem('lastSignupAttempt', now.toString());
        localStorage.setItem('signupAttemptCount', '0');

        // Show success message
        showNotification('Account created successfully! Please check your email for verification.', 'success')

        // Call the success callback with email
        onRegistrationSuccess?.(formData.email)

        // Close the signup modal immediately after successful registration
        handleSuccessfulClose()

      } else
      {
        // Increment rate limiting counter
        const newCount = attemptCount + 1;
        localStorage.setItem('signupAttemptCount', newCount.toString());

        // Handle specific error cases
        if (data.message.includes('already exists'))
        {
          showNotification('An account with this email already exists. Please sign in instead.', 'error')
        } else
        {
          showNotification(data.message || 'Registration failed. Please try again.', 'error')
        }
      }

    } catch (error)
    {
      const errorMessage = error instanceof Error ? error.message : String(error)
      showNotification(`${errorMessage}`, 'error')
    } finally
    {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true)
    
    try
    {
      // Initialize Google OAuth
      if (typeof window !== 'undefined' && window.google)
      {
        // Use Google Identity Services
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
          scope: 'openid email profile',
          callback: async (response: { access_token?: string; error?: string }) => {
            try {
              if (response.access_token)
              {
                await handleGoogleToken(response.access_token)
              } else if (response.error)
              {
                showNotification(`Google authentication failed: ${response.error}`, 'error')
              } else
              {
                showNotification('Google authentication was cancelled', 'error')
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : String(error)
              showNotification(`Google signup error: ${errorMessage}`, 'error')
            } finally {
              // Only reset loading state if handleGoogleToken wasn't called
              if (!response.access_token) {
                setIsGoogleLoading(false)
              }
            }
          },
        })

        client.requestAccessToken()
        
        // Set a timeout to reset loading state if callback doesn't fire
        setTimeout(() => {
          if (isGoogleLoading) {
            setIsGoogleLoading(false)
            showNotification('Google authentication timed out. Please try again.', 'error')
          }
        }, 30000) // 30 second timeout
      } else
      {
        // Fallback to traditional OAuth flow
        const authUrl = `https://accounts.google.com/o/oauth2/auth?` +
          `client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}&` +
          `redirect_uri=${encodeURIComponent(`${window.location.origin}/auth/google/callback`)}&` +
          `scope=${encodeURIComponent('openid email profile')}&` +
          `response_type=code&` +
          `access_type=offline`

        window.location.href = authUrl
      }
    } catch (error)
    {
      const errorMessage = error instanceof Error ? error.message : String(error)
      showNotification(`Google signup error: ${errorMessage}`, 'error')
      setIsGoogleLoading(false)
    }
  }

  const handleGoogleToken = async (accessToken: string) => {
    try
    {
      // Get user info from Google
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      if (!userInfoResponse.ok)
      {
        throw new Error('Failed to get user info from Google')
      }

      const userInfo = await userInfoResponse.json()

      // Call your backend API with Google user data using apiService
      const response = await apiService.googleLogin({
        googleId: userInfo.id,
        email: userInfo.email,
        firstName: userInfo.given_name || '',
        lastName: userInfo.family_name || ''
      })

      const data = response

      if (data.success && data.data)
      {
        // Validate JWT token before storing
        const accessToken = data.data.accessToken;
        if (!validateAndHandleToken(accessToken))
        {
          showNotification('Invalid token received. Please try again.', 'error');
          return;
        }

        // Store the access token
        localStorage.setItem('accessToken', accessToken)

        // Dispatch Redux action to set user data
        dispatch(setUser({
          user: {
            id: data.data.user.id,
            email: data.data.user.email,
            firstName: data.data.user.firstName,
            lastName: data.data.user.lastName,
            phone: data.data.user.phone || '',
            isEmailVerified: data.data.user.isEmailVerified,
            googleId: undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          accessToken: accessToken
        }))

        // Check pending workflows after socket connection is established
        if (data.data?.user?.id) {
          const userId = data.data.user.id
          // The unified socket system will automatically check pending workflows
          // No need for manual event listeners or fallbacks
          console.log('🔌 Pending workflows will be checked automatically by unified socket system')
        }

        // Clear saved form data from localStorage after successful registration
        localStorage.removeItem('signupFormData')

        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: ''
        })
        setErrors({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: ''
        })

        // Show success message
        const welcomeMessage = data.data.isNewUser
          ? `Welcome to EdgeAi, ${data.data.user.firstName}! Your account has been created successfully.`
          : `Welcome back to EdgeAi, ${data.data.user.firstName}!`
        showNotification(welcomeMessage, 'success')

        // Close modal immediately after successful registration
        handleSuccessfulClose()
      } else
      {
        showNotification(data.message || 'Google signup failed. Please try again.', 'error')
      }
    } catch (error)
    {
      const errorMessage = error instanceof Error ? error.message : String(error)
      showNotification(`Google token handling error: ${errorMessage}`, 'error')
    } finally
    {
      // Always reset loading state
      setIsGoogleLoading(false)
    }
  }

  const handleClose = useCallback(() => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    })
    setErrors({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    })
    setShowSuccess(false)
    setIsSubmitting(false)
    setPasswordStrength({ score: 0, feedback: [] })
    setShowPassword(false)
    setShowConfirmPassword(false)
    onClose()
  }, [onClose])

  const handleSuccessfulClose = useCallback(() => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    })
    setErrors({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    })
    setShowSuccess(false)
    setIsSubmitting(false)
    setPasswordStrength({ score: 0, feedback: [] })
    setShowPassword(false)
    setShowConfirmPassword(false)
    onClose()
  }, [onClose])

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

  // Load saved form data on mount and clear errors when modal opens
  useEffect(() => {
    if (isOpen)
    {
      // Clear all error states and form data when modal opens
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      })
      setErrors({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      })
      setPasswordStrength({ score: 0, feedback: [] })
      setIsSubmitting(false)
      setShowPassword(false)
      setShowConfirmPassword(false)
    } else
    {
      // Load saved form data when modal is closed (only if there's saved data)
      const savedData = localStorage.getItem('signupFormData')
      if (savedData)
      {
        try
        {
          const parsedData = JSON.parse(savedData)
          setFormData(prev => ({ ...prev, ...parsedData }))
        } catch (error)
        {
          const errorMessage = error instanceof Error ? error.message : String(error)
          showNotification(`${errorMessage}`, 'error')
        }
      }
    }
  }, [isOpen, showNotification])

  // Load Google OAuth script
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.google)
    {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  }, [])

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div
          ref={modalRef}
          className="bg-white rounded-[12px] xl:h-fit h-full md:px-[55px] px-4 pt-10 pb-10 max-w-[820px] w-full max-h-[600px] flex flex-col relative"
          role="dialog"
          aria-modal="true"
          aria-labelledby="signup-modal-title"
          aria-describedby="signup-modal-description"
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
            className="cursor-pointer md:ml-4 md:absolute md:top-[30px] md:right-[30px] absolute top-[20px] right-[20px]"
            aria-label="Close signup modal"
          >
            <svg width="24" height="24" className="md:w-6 md:h-6 w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.5 1.5L1.5 22.5M1.5 1.5L22.5 22.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Success Message */}
          {showSuccess && (
            <div className="absolute inset-0 bg-white rounded-[12px] flex items-center justify-center z-10">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">Account Created Successfully!</h3>
                <p className="text-gray-600">Welcome to EdgeAi. You can now start creating amazing videos.</p>
              </div>
            </div>
          )}

          {/* Modal Header */}
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

          {/* Modal Content */}
          <div className="pt-7 overflow-y-auto flex-1 px-2">
            {/* General Error Message */}
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{errors.general}</p>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleSignup(); }}>

              {/* Form Fields - Two Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 mb-4">
                {/* First Name */}
                <div className="w-full">
                  <label htmlFor="firstName" className="block text-base font-normal text-[#5F5F5F] mb-1">
                    First Name
                  </label>
                  <input
                    ref={firstInputRef}
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    onBlur={handleInputBlur}
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
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    onBlur={handleInputBlur}
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

                {/* Email */}
                <div className="w-full">
                  <label htmlFor="email" className="block text-base font-normal text-[#5F5F5F] mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={handleInputBlur}
                    placeholder="Enter Email"
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

                {/* Phone */}
                <div className="w-full">
                  <label htmlFor="phone" className="block text-base font-normal text-[#5F5F5F] mb-1">
                    Phone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    onBlur={handleInputBlur}
                    placeholder="Enter Phone Number"
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

                {/* Password */}
                <div className="w-full relative">
                  <label htmlFor="password" className="block text-base font-normal text-[#5F5F5F] mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      autoComplete="off"
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      onBlur={handleInputBlur}
                      placeholder="**********"
                      aria-describedby={errors.password ? 'password-error' : 'password-strength'}
                      aria-invalid={!!errors.password}
                      className={`w-full px-4 py-3 bg-[#EEEEEE] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white pr-12 ${errors.password ? 'ring-2 ring-red-500' : ''
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5 text-[#98A2B3]" /> : <Eye className="w-5 h-5 text-[#98A2B3]" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div id="password-strength" className="mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-gray-600">Password strength:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((level) => {
                            const strength = getPasswordStrength(passwordStrength.score)
                            return (
                              <div
                                key={level}
                                className={`w-2 h-2 rounded-full ${level <= passwordStrength.score
                                  ? getPasswordStrengthBgColor(strength)
                                  : 'bg-gray-300'
                                  }`}
                              />
                            )
                          })}
                        </div>
                        <span className={`text-xs font-medium ${getPasswordStrengthColor(getPasswordStrength(passwordStrength.score))}`}>
                          {getPasswordStrength(passwordStrength.score).replace('-', ' ')}
                        </span>
                      </div>
                      {passwordStrength.feedback.length > 0 && (
                        <ul className="text-xs text-gray-600 space-y-1">
                          {passwordStrength.feedback.map((feedback, index) => (
                            <li key={index} className="flex items-center gap-1">
                              <span className="w-1 h-1 bg-gray-400 rounded-full" />
                              {feedback}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {errors.password && (
                    <p id="password-error" className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="w-full relative">
                  <label className="block text-base font-normal text-[#5F5F5F] mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      onBlur={handleInputBlur}
                      autoComplete="off"
                      placeholder="**********"
                      className={`w-full px-4 py-3 bg-[#EEEEEE] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white pr-12 ${errors.confirmPassword ? 'ring-2 ring-red-500' : ''
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5 text-[#98A2B3]" /> : <Eye className="w-5 h-5 text-[#98A2B3]" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Sign Up Button */}
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

              {/* Google Sign Up Button */}
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={isGoogleLoading}
                className={`w-[220px] mx-auto bg-white text-[#344054] py-[9.2px] px-2 rounded-full font-normal text-[16px] border border-[#D0D5DD] hover:bg-[#D0D5DD] transition-colors duration-300 cursor-pointer flex items-center justify-center gap-x-3 ${isGoogleLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isGoogleLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-[#5046E5] rounded-full animate-spin" />
                    Signing up...
                  </>
                ) : (
                  <>
                    <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_7697_226)">
                        <path d="M24.2663 12.2764C24.2663 11.4607 24.2001 10.6406 24.059 9.83807H12.7402V14.4591H19.222C18.953 15.9494 18.0888 17.2678 16.8233 18.1056V21.1039H20.6903C22.9611 19.0139 24.2663 15.9274 24.2663 12.2764Z" fill="#4285F4" />
                        <path d="M12.7401 24.0008C15.9766 24.0008 18.7059 22.9382 20.6945 21.1039L16.8276 18.1055C15.7517 18.8375 14.3627 19.252 12.7445 19.252C9.61388 19.252 6.95946 17.1399 6.00705 14.3003H2.0166V17.3912C4.05371 21.4434 8.2029 24.0008 12.7401 24.0008Z" fill="#34A853" />
                        <path d="M6.00277 14.3003C5.50011 12.8099 5.50011 11.1961 6.00277 9.70575V6.61481H2.01674C0.314734 10.0056 0.314734 14.0004 2.01674 17.3912L6.00277 14.3003Z" fill="#FBBC04" />
                        <path d="M12.7401 4.74966C14.4509 4.7232 16.1044 5.36697 17.3434 6.54867L20.7695 3.12262C18.6001 1.0855 15.7208 -0.034466 12.7401 0.000808666C8.2029 0.000808666 4.05371 2.55822 2.0166 6.61481L6.00264 9.70575C6.95064 6.86173 9.60947 4.74966 12.7401 4.74966Z" fill="#EA4335" />
                      </g>
                      <defs>
                        <clipPath id="clip0_7697_226">
                          <rect width="24" height="24" fill="white" transform="translate(0.5)" />
                        </clipPath>
                      </defs>
                    </svg>
                    Sign up with Google
                  </>
                )}
              </button>

              {/* Footer Link */}
              <div className="text-center mt-6">
                <p className="text-[#101828] text-base font-normal">
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="text-[#5046E5] text-[14px] font-semibold hover:underline cursor-pointer"
                    onClick={() => {
                      // Close signup modal and open signin modal
                      onClose()
                      onOpenSignin?.()
                    }}
                  >
                    Sign In
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
