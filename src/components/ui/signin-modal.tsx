'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

import { isPasswordValidForLogin } from '@/lib/password-validation'
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

interface SigninModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenSignup?: () => void
  onOpenForgotPassword?: () => void
}

interface FormData {
  email: string
  password: string
}

interface FormErrors {
  email: string
  password: string
  general?: string
}

interface EmailVerificationStatus {
  isVerified: boolean
  email: string
}

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''
const GOOGLE_REDIRECT_URI = typeof window !== 'undefined' ? `${window.location.origin}/auth/google/callback` : ''

export default function SigninModal({ isOpen, onClose, onOpenSignup, onOpenForgotPassword }: SigninModalProps) {
  const dispatch = useAppDispatch()
  const { showNotification } = useNotificationStore()
  
  // Use the custom scroll lock hook
  useModalScrollLock(isOpen)

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<FormErrors>({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [emailVerificationStatus, setEmailVerificationStatus] = useState<EmailVerificationStatus | null>(null)
  const [showVerificationMessage, setShowVerificationMessage] = useState(false)
  const [isResendingVerification, setIsResendingVerification] = useState(false)

  // Ref to track Google OAuth timeout
  const googleTimeoutRef = useRef<NodeJS.Timeout | null>(null)


  // Refs for focus management
  const modalRef = useRef<HTMLDivElement>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)
  const errorAnnouncementRef = useRef<HTMLDivElement>(null)


  const handleInputChange = (field: keyof FormData, value: string) => {
    // Simple input sanitization
    const sanitizedValue = value.trim();

    setFormData(prev => ({
      ...prev,
      [field]: sanitizedValue
    }))

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
      email: '',
      password: ''
    }

    // Validate each field and collect errors
    Object.entries(formData).forEach(([key, value]) => {
      const field = key as keyof FormData
      switch (field)
      {
        case 'email':
          if (!value.trim())
          {
            newErrors.email = 'Email is required'
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          {
            newErrors.email = 'Please enter a valid email address'
          }
          break
        case 'password':
          if (!value.trim())
          {
            newErrors.password = 'Password is required'
          } else if (!isPasswordValidForLogin(value))
          {
            newErrors.password = 'Please enter a valid password'
          }
          break
      }
    })

    // Set the errors
    setErrors(newErrors)

    // Return true if no errors, false if there are errors
    return !Object.values(newErrors).some(error => error !== '')
  }

  const handleSignin = async () => {
    // Simple rate limiting check
    const now = Date.now();
    const lastAttempt = localStorage.getItem('lastSigninAttempt') || '0';
    const attemptCount = parseInt(localStorage.getItem('signinAttemptCount') || '0');

    if (now - parseInt(lastAttempt) < 60000 && attemptCount >= 5)
    {
      showNotification('Too many signin attempts. Please wait 1 minute before trying again.', 'error');
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
      // First, check if user exists and email verification status 
      const checkResponse = await apiService.checkEmail(formData.email)
      const checkData = checkResponse

      if (checkData.success && checkData.data && checkData.data.exists)
      {
        // User exists, now check email verification status
        const verificationResponse = await apiService.checkEmailVerification(formData.email)
        const verificationData = verificationResponse

        if (verificationData.success && verificationData.data && !verificationData.data.isVerified)
        {
          // Email not verified, show verification message
          setEmailVerificationStatus({
            isVerified: false,
            email: formData.email
          })
          setShowVerificationMessage(true)
          setIsSubmitting(false)
          return
        }
      }

      // Call the login API using new Express backend with global loading
      const response = await apiService.loginWithGlobalLoading({
        email: formData.email,
        password: formData.password,
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
            googleId: data.data.user.googleId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          accessToken: accessToken
        }))

        // Check pending workflows after socket connection is established
        if (data.data?.user?.id) {
          const userId = data.data.user.id
          const handleSocketConnected = () => {
            console.log('🔌 Socket connected event received after login, checking pending workflows')
            apiService.checkPendingWorkflows(userId)
              .catch(error => {
                console.error('Failed to check pending workflows after login socket connection:', error);
                // Don't show error to user as this is background operation
              });
            // Remove the event listener after first use
            window.removeEventListener('socket-connected', handleSocketConnected as EventListener)
          }

          // Listen for socket connection event
          window.addEventListener('socket-connected', handleSocketConnected as EventListener)
          
          // Fallback: Check pending workflows after a delay if socket doesn't connect
          setTimeout(() => {
            console.log('🔌 Fallback: Checking pending workflows after login delay')
            apiService.checkPendingWorkflows(userId)
              .catch(error => {
                console.error('Failed to check pending workflows after login fallback delay:', error);
                // Don't show error to user as this is background operation
              });
            // Remove the event listener if fallback is used
            window.removeEventListener('socket-connected', handleSocketConnected as EventListener)
          }, 2000)
        }

        // Update rate limiting
        localStorage.setItem('lastSigninAttempt', now.toString());
        localStorage.setItem('signinAttemptCount', '0');

        // Show success message
        const welcomeMessage = data.data.user
          ? `Login successful! Welcome back, ${data.data.user.firstName} ${data.data.user.lastName}!`
          : 'Login successful! Welcome back to EdgeAi.'
        showNotification(welcomeMessage, 'success')

        // Save email if "remember me" is checked
        if (rememberMe)
        {
          localStorage.setItem('signinEmail', formData.email)
        } else
        {
          localStorage.removeItem('signinEmail')
        }

        // Close modal immediately after successful login
        handleSuccessfulClose()
      } else
      {
        // Check if the error is due to email verification
        if (data.data && (data.data as any).requiresVerification)
        {
          setEmailVerificationStatus({
            isVerified: false,
            email: formData.email
          })
          setShowVerificationMessage(true)
        } else
        {
          // Increment rate limiting counter
          const newCount = attemptCount + 1;
          localStorage.setItem('signinAttemptCount', newCount.toString());
          showNotification(data.message || 'Login failed. Please try again.', 'error')
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

  const handleGoogleSignin = async () => {
    setIsGoogleLoading(true)

    try
    {
      // Initialize Google OAuth
      if (typeof window !== 'undefined' && window.google)
      {
        // Use Google Identity Services
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
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
              showNotification(`Google signin error: ${errorMessage}`, 'error')
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
          `client_id=${GOOGLE_CLIENT_ID}&` +
          `redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&` +
          `scope=${encodeURIComponent('openid email profile')}&` +
          `response_type=code&` +
          `access_type=offline`

        window.location.href = authUrl
      }
    } catch (error)
    {
      const errorMessage = error instanceof Error ? error.message : String(error)
      showNotification(`Google signin error: ${errorMessage}`, 'error')
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

      // Call your backend API with Google user data using new Express backend
      const response = await apiService.googleLogin({
        googleId: userInfo.id,
        email: userInfo.email,
        firstName: userInfo.given_name || userInfo.firstName || '',
        lastName: userInfo.family_name || userInfo.lastName || ''
      })
      const data = response

      if (data.success && data.data)
      {
        // Store the access token
        localStorage.setItem('accessToken', data.data.accessToken)

        // Dispatch Redux action to set user data
        dispatch(setUser({
          user: {
            id: data.data.user.id,
            email: data.data.user.email,
            firstName: data.data.user.firstName,
            lastName: data.data.user.lastName,
            phone: data.data.user.phone || '',
            isEmailVerified: data.data.user.isEmailVerified,
            googleId: data.data.user.googleId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          accessToken: data.data.accessToken
        }))

        // Check pending workflows after socket connection is established
        if (data.data?.user?.id) {
          const userId = data.data.user.id
          const handleSocketConnected = () => {
            console.log('🔌 Socket connected event received after Google signin, checking pending workflows')
            apiService.checkPendingWorkflows(userId)
              .catch(error => {
                console.error('Failed to check pending workflows after Google signin socket connection:', error);
                // Don't show error to user as this is background operation
              });
            // Remove the event listener after first use
            window.removeEventListener('socket-connected', handleSocketConnected as EventListener)
          }

          // Listen for socket connection event
          window.addEventListener('socket-connected', handleSocketConnected as EventListener)
          
          // Fallback: Check pending workflows after a delay if socket doesn't connect
          setTimeout(() => {
            console.log('🔌 Fallback: Checking pending workflows after Google signin delay')
            apiService.checkPendingWorkflows(userId)
              .catch(error => {
                console.error('Failed to check pending workflows after Google signin fallback delay:', error);
                // Don't show error to user as this is background operation
              });
            // Remove the event listener if fallback is used
            window.removeEventListener('socket-connected', handleSocketConnected as EventListener)
          }, 2000)
        }

        // Show success message
        const welcomeMessage = data.data.user
          ? `Welcome back to EdgeAi, ${data.data.user.firstName} ${data.data.user.lastName}!`
          : 'Welcome to EdgeAi!'
        showNotification(welcomeMessage, 'success')

        // Close modal immediately after successful login
        handleSuccessfulClose()
      } else
      {
        // Check if the error is due to email verification
        if (data.data && (data.data as any).requiresVerification)
        {
          setEmailVerificationStatus({
            isVerified: false,
            email: (data.data as any).email || userInfo.email
          })
          setShowVerificationMessage(true)
        } else
        {
          showNotification(data.message || 'Google login failed. Please try again.', 'error')
        }
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

  const handleForgotPassword = () => {
    onClose()
    onOpenForgotPassword?.()
  }

  const handleResendVerification = async () => {
    if (!emailVerificationStatus || isResendingVerification) return

    setIsResendingVerification(true)

    try
    {
      const response = await apiService.resendVerification(emailVerificationStatus.email)
      const data = response

      if (data.success)
      {
        showNotification('Verification email sent successfully! Please check your inbox.', 'success')
        setShowVerificationMessage(false)
        setEmailVerificationStatus(null)
      } else
      {
        showNotification(data.message || 'Failed to send verification email. Please try again.', 'error')
      }
    } catch (error)
    {
      const errorMessage = error instanceof Error ? error.message : String(error)
      showNotification(`Error sending verification email: ${errorMessage}`, 'error')
    } finally
    {
      setIsResendingVerification(false)
    }
  }

  const handleCloseVerificationMessage = () => {
    setShowVerificationMessage(false)
    setEmailVerificationStatus(null)
    setIsResendingVerification(false)
  }

  const handleClose = useCallback(() => {
    // Clear Google OAuth timeout if exists
    if (googleTimeoutRef.current)
    {
      clearTimeout(googleTimeoutRef.current)
      googleTimeoutRef.current = null
    }

    setFormData({
      email: '',
      password: ''
    })
    setErrors({
      email: '',
      password: ''
    })
    setShowSuccess(false)
    setIsSubmitting(false)
    setRememberMe(false)
    setIsGoogleLoading(false)
    setEmailVerificationStatus(null)
    setShowVerificationMessage(false)
    setIsResendingVerification(false)
    setShowPassword(false)
    onClose()
  }, [onClose])

  const handleSuccessfulClose = useCallback(() => {
    // Clear Google OAuth timeout if exists
    if (googleTimeoutRef.current)
    {
      clearTimeout(googleTimeoutRef.current)
      googleTimeoutRef.current = null
    }

    setFormData({
      email: '',
      password: ''
    })
    setErrors({
      email: '',
      password: ''
    })
    setShowSuccess(false)
    setIsSubmitting(false)
    setRememberMe(false)
    setIsGoogleLoading(false)
    setEmailVerificationStatus(null)
    setShowVerificationMessage(false)
    setIsResendingVerification(false)
    setShowPassword(false)
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

  // Load saved email on mount and clear errors when modal opens
  useEffect(() => {
    if (isOpen)
    {
      // Load saved email when modal opens
      const savedEmail = localStorage.getItem('signinEmail')
      if (savedEmail)
      {
        setFormData({
          email: savedEmail,
          password: ''
        })
        setRememberMe(true)
      } else
      {
        // Clear form data and error states when modal opens (only if no saved email)
        setFormData({
          email: '',
          password: ''
        })
        setRememberMe(false)
      }
      
      setErrors({
        email: '',
        password: ''
      })
      setEmailVerificationStatus(null)
      setShowVerificationMessage(false)
      setIsResendingVerification(false)
      setIsGoogleLoading(false)
      setShowPassword(false)

      // Clear any existing timeout
      if (googleTimeoutRef.current)
      {
        clearTimeout(googleTimeoutRef.current)
        googleTimeoutRef.current = null
      }
    }
  }, [isOpen])

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
          className="bg-white rounded-[12px] xl:h-fit h-full md:px-[55px] px-4 pt-10 pb-10 max-w-[820px] w-full md:max-h-[615px] max-h-[700px] flex flex-col relative"
          role="dialog"
          aria-modal="true"
          aria-labelledby="signin-modal-title"
          aria-describedby="signin-modal-description"
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
            className="cursor-pointer ml-4 absolute md:top-[30px] md:right-[30px] top-[20px] right-[20px]"
            aria-label="Close signin modal"
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
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">Login Successful!</h3>
                <p className="text-gray-600">
                  Welcome back to EdgeAi. You can now start creating amazing videos.
                </p>
              </div>
            </div>
          )}

          {/* Modal Header */}
          <div className="flex items-center justify-between flex-shrink-0">
            <div className="flex-1">
              <h3 id="signin-modal-title" className="md:text-[48px] text-[25px] font-semibold text-[#282828] text-center">
                Welcome Back to <span className="text-[#5046E5]">EdgeAi</span>
              </h3>
              <p id="signin-modal-description" className="text-[#667085] text-[16px] text-center mt-2">
                Please enter your credentials to access your <br className='hidden md:block' /> account and create videos seamlessly.
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

            {/* Email Verification Message */}
            {showVerificationMessage && emailVerificationStatus && (
              <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-orange-800 font-medium mb-1">Email Verification Required</h4>
                    <p className="text-orange-700 text-sm mb-3">
                      Please verify your email address before logging in. Check your inbox for the verification link.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={handleResendVerification}
                        disabled={isResendingVerification}
                        className={`text-sm font-medium underline flex items-center gap-2 ${
                          isResendingVerification 
                            ? 'text-orange-400 cursor-not-allowed' 
                            : 'text-orange-600 hover:text-orange-800'
                        }`}
                      >
                        {isResendingVerification && (
                          <div className="w-4 h-4 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin" />
                        )}
                        {isResendingVerification ? 'Sending...' : 'Resend verification email'}
                      </button>
                      <button
                        onClick={handleCloseVerificationMessage}
                        disabled={isResendingVerification}
                        className={`text-sm font-medium underline ${
                          isResendingVerification 
                            ? 'text-orange-400 cursor-not-allowed' 
                            : 'text-orange-600 hover:text-orange-800'
                        }`}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleSignin(); }}>

              {/* Form Fields */}
              <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-baseline">
                {/* Email */}
                <div className="w-full mb-[10px]">
                  <label htmlFor="email" className="block text-base font-normal text-[#5F5F5F] mb-1">
                    Email
                  </label>
                  <input
                    ref={firstInputRef}
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
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      onBlur={handleInputBlur}
                      autoComplete="off"
                      placeholder="**********"
                      aria-describedby={errors.password ? 'password-error' : undefined}
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
                  {errors.password && (
                    <p id="password-error" className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between mb-6 mt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-[16px] h-[16px] border rounded-[6px] transition-all duration-200 ${rememberMe
                      ? 'bg-[#5046E5] border-[#5046E5]'
                      : 'bg-transparent border-[#D0D5DD]'
                      }`}>
                      {rememberMe && (
                        <svg
                          className="w-3 h-3 text-white absolute top-0.5 left-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-[#5F5F5F] text-base">Remember me</span>
                </label>
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
              <button
                type="button"
                onClick={handleGoogleSignin}
                disabled={isGoogleLoading}
                className={`w-[220px] mx-auto bg-white text-[#344054] py-[9.2px] px-2 rounded-full font-normal text-[16px] border border-[#D0D5DD] transition-colors duration-300 cursor-pointer flex items-center justify-center gap-x-3 ${isGoogleLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isGoogleLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-[#5046E5] rounded-full animate-spin" />
                    Signing in...
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
                    Sign in with Google
                  </>
                )}
              </button>

              {/* Footer Link */}
              <div className="text-center mt-6">
                <p className="text-[#101828] text-base font-normal">
                  No account yet?{' '}
                  <button
                    type="button"
                    className="text-[#5046E5] text-[14px] font-semibold hover:underline cursor-pointer"
                    onClick={() => {
                      // Close signin modal and open signup modal
                      onClose()
                      onOpenSignup?.()
                    }}
                  >
                    Sign up
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
