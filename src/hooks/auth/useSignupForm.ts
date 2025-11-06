import { useState, useCallback } from 'react'
import { validatePassword } from '@/lib/password-validation'
import { apiService } from '@/lib/api-service'
import { useNotificationStore } from '@/components/ui/global-notification'

export interface SignupFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

export interface SignupFormErrors {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  general?: string
}

export interface PasswordStrength {
  score: number
  feedback: string[]
}

const initialFormData: SignupFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
}

const initialErrors: SignupFormErrors = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
}

export function useSignupForm(onSuccess?: (email: string) => void, onClose?: () => void) {
  const { showNotification } = useNotificationStore()
  const [formData, setFormData] = useState<SignupFormData>(initialFormData)
  const [errors, setErrors] = useState<SignupFormErrors>(initialErrors)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ score: 0, feedback: [] })

  const enhancedSanitizeInput = (value: string): string => {
    return value.trim()
  }

  const checkPasswordStrength = (password: string): PasswordStrength => {
    const result = validatePassword(password)
    return {
      score: result.score,
      feedback: result.feedback
    }
  }

  const handleInputChange = useCallback((field: keyof SignupFormData, value: string) => {
    let processedValue = value

    // Apply field-specific processing
    if (field === 'phone') {
      // For phone, only allow digits and spaces
      processedValue = value.replace(/[^0-9\s]/g, '')
    } else if (field === 'firstName' || field === 'lastName') {
      // For names, allow any characters including spaces
      processedValue = value
    } else {
      processedValue = enhancedSanitizeInput(value)
    }

    setFormData((prev) => ({
      ...prev,
      [field]: processedValue
    }))

    // Real-time password strength check
    if (field === 'password') {
      setPasswordStrength(checkPasswordStrength(processedValue))
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: ''
      }))
    }
  }, [errors])

  const validateForm = useCallback((): boolean => {
    const newErrors: SignupFormErrors = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    }

    // Validate each field
    Object.entries(formData).forEach(([key, value]) => {
      const field = key as keyof SignupFormData
      switch (field) {
        case 'firstName':
          if (!value.trim()) {
            newErrors.firstName = 'First Name is required'
          }
          break
        case 'lastName':
          if (!value.trim()) {
            newErrors.lastName = 'Last Name is required'
          }
          break
        case 'email':
          if (!value.trim()) {
            newErrors.email = 'Email is required'
          } else if (!value.includes('@')) {
            newErrors.email = 'Email must contain @ symbol'
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            newErrors.email = 'Please enter a valid email address'
          }
          break
        case 'phone':
          if (value.trim() && !/^[0-9]+$/.test(value.replace(/\s+/g, ''))) {
            newErrors.phone = 'Phone number can only contain digits'
          }
          break
        case 'password':
          if (!value.trim()) {
            newErrors.password = 'Password is required'
          } else {
            const passwordResult = validatePassword(value)
            if (!passwordResult.isValid) {
              newErrors.password = passwordResult.errors[0] || 'Password does not meet requirements'
            }
          }
          break
        case 'confirmPassword':
          if (!value.trim()) {
            newErrors.confirmPassword = 'Confirm Password is required'
          } else if (value !== formData.password) {
            newErrors.confirmPassword = 'Passwords do not match'
          }
          break
      }
    })

    setErrors(newErrors)
    return !Object.values(newErrors).some((error) => error !== '')
  }, [formData])

  const handleSignup = useCallback(async (errorAnnouncementRef?: { current: HTMLDivElement | null }) => {
    // Rate limiting check
    const now = Date.now()
    const lastAttempt = localStorage.getItem('lastSignupAttempt') || '0'
    const attemptCount = parseInt(localStorage.getItem('signupAttemptCount') || '0')

    if (now - parseInt(lastAttempt) < 60000 && attemptCount >= 5) {
      showNotification('Too many signup attempts. Please wait 1 minute before trying again.', 'error')
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
      const response = await apiService.registerWithGlobalLoading({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      })

      const data = response

      if (data.success) {
        // Clear saved form data from localStorage after successful registration
        localStorage.removeItem('signupFormData')
        localStorage.setItem('lastSignupAttempt', now.toString())
        localStorage.setItem('signupAttemptCount', '0')

        // Show success message
        showNotification('Account created successfully! Please check your email for verification.', 'success')

        // Call the success callback with email
        onSuccess?.(formData.email)

        // Close the signup modal immediately after successful registration
        onClose?.()
      } else {
        const newCount = attemptCount + 1
        localStorage.setItem('signupAttemptCount', newCount.toString())

        if (data.message.includes('already exists')) {
          showNotification('An account with this email already exists. Please sign in instead.', 'error')
        } else {
          showNotification(data.message || 'Registration failed. Please try again.', 'error')
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      showNotification(`${errorMessage}`, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, validateForm, showNotification, onSuccess, onClose])

  const resetForm = useCallback(() => {
    setFormData(initialFormData)
    setErrors(initialErrors)
    setPasswordStrength({ score: 0, feedback: [] })
    setIsSubmitting(false)
  }, [])

  const loadFormData = useCallback((data: Partial<SignupFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }, [])

  return {
    formData,
    errors,
    isSubmitting,
    passwordStrength,
    handleInputChange,
    handleSignup,
    resetForm,
    loadFormData,
    validateForm
  }
}

