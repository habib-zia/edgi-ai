'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { setUser } from '@/store/slices/userSlice'
import { validateAndHandleToken } from '@/lib/jwt-client'
import { apiService } from '@/lib/api-service'
import { isPasswordValidForLogin } from '@/lib/password-validation'
import { useNotificationStore } from '@/components/ui/global-notification'

export interface SigninFormData {
  email: string
  password: string
}

export interface SigninFormErrors {
  email: string
  password: string
  general?: string
}

interface EmailVerificationStatus {
  isVerified: boolean
  email: string
}

interface UseSigninFormProps {
  onSuccess?: () => void
}

export function useSigninForm({ onSuccess }: UseSigninFormProps = {}) {
  const dispatch = useAppDispatch()
  const { showNotification } = useNotificationStore()
  const [formData, setFormData] = useState<SigninFormData>({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<SigninFormErrors>({
    email: '',
    password: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [emailVerificationStatus, setEmailVerificationStatus] = useState<EmailVerificationStatus | null>(null)
  const [showVerificationMessage, setShowVerificationMessage] = useState(false)
  const [isResendingVerification, setIsResendingVerification] = useState(false)

  const handleInputChange = useCallback((field: keyof SigninFormData, value: string) => {
    const sanitizedValue = value.trim()
    setFormData(prev => ({
      ...prev,
      [field]: sanitizedValue
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }, [errors])

  const validateForm = useCallback((): boolean => {
    const newErrors: SigninFormErrors = {
      email: '',
      password: ''
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
    } else if (!isPasswordValidForLogin(formData.password)) {
      newErrors.password = 'Please enter a valid password'
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== '')
  }, [formData])

  const handleSignin = useCallback(async (errorAnnouncementRef?: { current: HTMLDivElement | null }) => {
    // Simple rate limiting check
    const now = Date.now()
    const lastAttempt = localStorage.getItem('lastSigninAttempt') || '0'
    const attemptCount = parseInt(localStorage.getItem('signinAttemptCount') || '0')

    if (now - parseInt(lastAttempt) < 60000 && attemptCount >= 5) {
      showNotification('Too many signin attempts. Please wait 1 minute before trying again.', 'error')
      return
    }

    if (!validateForm()) {
      // Announce errors to screen readers
      if (errorAnnouncementRef?.current) {
        errorAnnouncementRef.current.textContent = 'Form has validation errors. Please check all fields.'
      }
      showNotification('Please fix the validation errors before submitting.', 'error')
      return
    }

    setIsSubmitting(true)

    try {
      // First, check if user exists and email verification status
      const checkResponse = await apiService.checkEmail(formData.email)
      const checkData = checkResponse

      if (checkData.success && checkData.data && checkData.data.exists) {
        // User exists, now check email verification status
        const verificationResponse = await apiService.checkEmailVerification(formData.email)
        const verificationData = verificationResponse

        if (verificationData.success && verificationData.data && !verificationData.data.isVerified) {
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

      if (data.success && data.data) {
        // Validate JWT token before storing
        const accessToken = data.data.accessToken
        if (!validateAndHandleToken(accessToken)) {
          showNotification('Invalid token received. Please try again.', 'error')
          return
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
                console.error('Failed to check pending workflows after login socket connection:', error)
              })
            window.removeEventListener('socket-connected', handleSocketConnected as EventListener)
          }

          window.addEventListener('socket-connected', handleSocketConnected as EventListener)
          
          // Fallback: Check pending workflows after a delay if socket doesn't connect
          setTimeout(() => {
            console.log('🔌 Fallback: Checking pending workflows after login delay')
            apiService.checkPendingWorkflows(userId)
              .catch(error => {
                console.error('Failed to check pending workflows after login fallback delay:', error)
              })
            window.removeEventListener('socket-connected', handleSocketConnected as EventListener)
          }, 2000)
        }

        // Update rate limiting
        localStorage.setItem('lastSigninAttempt', now.toString())
        localStorage.setItem('signinAttemptCount', '0')

        // Show success message
        const welcomeMessage = data.data.user
          ? `Login successful! Welcome back, ${data.data.user.firstName} ${data.data.user.lastName}!`
          : 'Login successful! Welcome back to EdgeAi.'
        showNotification(welcomeMessage, 'success')

        // Save email if "remember me" is checked
        if (rememberMe) {
          localStorage.setItem('signinEmail', formData.email)
        } else {
          localStorage.removeItem('signinEmail')
        }

        // Call onSuccess callback
        onSuccess?.()
      } else {
        // Check if the error is due to email verification
        if (data.data && (data.data as any).requiresVerification) {
          setEmailVerificationStatus({
            isVerified: false,
            email: formData.email
          })
          setShowVerificationMessage(true)
        } else {
          // Increment rate limiting counter
          const newCount = attemptCount + 1
          localStorage.setItem('signinAttemptCount', newCount.toString())
          showNotification(data.message || 'Login failed. Please try again.', 'error')
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      showNotification(`${errorMessage}`, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, rememberMe, validateForm, dispatch, showNotification, onSuccess])

  const handleResendVerification = useCallback(async () => {
    if (!emailVerificationStatus || isResendingVerification) return

    setIsResendingVerification(true)

    try {
      const response = await apiService.resendVerification(emailVerificationStatus.email)
      const data = response

      if (data.success) {
        showNotification('Verification email sent successfully! Please check your inbox.', 'success')
        setShowVerificationMessage(false)
        setEmailVerificationStatus(null)
      } else {
        showNotification(data.message || 'Failed to send verification email. Please try again.', 'error')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      showNotification(`Error sending verification email: ${errorMessage}`, 'error')
    } finally {
      setIsResendingVerification(false)
    }
  }, [emailVerificationStatus, isResendingVerification, showNotification])

  const handleCloseVerificationMessage = useCallback(() => {
    setShowVerificationMessage(false)
    setEmailVerificationStatus(null)
    setIsResendingVerification(false)
  }, [])

  const resetForm = useCallback(() => {
    setFormData({
      email: '',
      password: ''
    })
    setErrors({
      email: '',
      password: ''
    })
    setRememberMe(false)
    setEmailVerificationStatus(null)
    setShowVerificationMessage(false)
    setIsResendingVerification(false)
  }, [])

  // Load saved email when component mounts
  useEffect(() => {
    const savedEmail = localStorage.getItem('signinEmail')
    if (savedEmail) {
      setFormData(prev => ({
        ...prev,
        email: savedEmail
      }))
      setRememberMe(true)
    }
  }, [])

  return {
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
  }
}

