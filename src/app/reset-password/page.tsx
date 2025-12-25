'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'

import { validatePassword } from '@/lib/password-validation'
import { apiService } from '@/lib/api-service'
import { toast } from 'sonner'
import LoadingButton from '@/components/ui/loading-button'
import { useAppSelector } from '@/store/hooks'


interface FormData {
  password: string
  confirmPassword: string
}

interface FormErrors {
  password: string
  confirmPassword: string
  general?: string
}

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isAuthenticated } = useAppSelector((state) => state.user)
  const [formData, setFormData] = useState<FormData>({
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<FormErrors>({
    password: '',
    confirmPassword: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [token, setToken] = useState<string>('')
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)

  // Redirect authenticated users away from reset password page
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/')
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam)
    {
      setToken(tokenParam)
      // Validate token on page load
      validateToken(tokenParam)
    } else
    {
      setTokenValid(false)
    }
  }, [searchParams])

  const validateToken = async (token: string) => {
    try
    {
      // Check if token has already been used
      const usedTokens = JSON.parse(localStorage.getItem('usedResetTokens') || '[]')
      if (usedTokens.includes(token)) {
        setTokenValid(false)
        return
      }

      // Use apiService to validate reset token
      const response = await apiService.validateResetToken(token)
      setTokenValid(response.success)
    } catch (error)
    {
      const errorMessage = error instanceof Error ? error.message : String(error)
      toast.error(`Token validation error: ${errorMessage}`)
      setTokenValid(false)
    }
  } 

  const handleInputChange = (field: keyof FormData, value: string) => {
    // Enhanced input sanitization
    const sanitizedValue = value.trim()

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

  const validatePasswordField = (password: string): string => {
    if (!password)
    {
      return 'Password is required'
    }

    const result = validatePassword(password)
    if (!result.isValid)
    {
      return result.errors[0] || 'Password does not meet requirements'
    }

    return ''
  }

  const validateForm = () => {
    const newErrors = {
      password: '',
      confirmPassword: ''
    }

    // Validate password
    newErrors.password = validatePasswordField(formData.password)

    // Validate confirm password
    if (!formData.confirmPassword)
    {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword)
    {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)

    return !Object.values(newErrors).some(error => error !== '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm())
    {
      return
    }

    setIsSubmitting(true)

    try
    {
      // Use apiService to reset password with global loading
      const response = await apiService.resetPasswordWithGlobalLoading(token, formData.password)

      if (response.success)
      {
        // Mark token as used by storing it in localStorage
        const usedTokens = JSON.parse(localStorage.getItem('usedResetTokens') || '[]')
        usedTokens.push(token)
        localStorage.setItem('usedResetTokens', JSON.stringify(usedTokens))
        
        // Clear token from URL by replacing the route without query params
        router.replace('/reset-password')
        
        setShowSuccess(true)
      } else
      {
        setErrors(prev => ({
          ...prev,
          general: response.message || 'Failed to reset password. Please try again.'
        }))
      }
    } catch (error)
    {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      setErrors(prev => ({
        ...prev,
        general: errorMessage
      }))
    } finally
    {
      setIsSubmitting(false)
    }
  }

  const handleBackToSignin = () => {
    // Ensure we navigate to home without any query params
    router.replace('/')
  }

  // Loading state
  if (tokenValid === null)
  {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#5046E5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold text-[#282828]">Validating Reset Link</h2>
            <p className="text-[#667085] mt-2">Please wait while we verify your reset link...</p>
          </div>
        </div>
      </div>
    )
  }

  // Invalid token state
  if (tokenValid === false)
  {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-semibold text-[#282828]">Invalid Reset Link</h2>
            <p className="text-[#667085] mt-2 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <button
              onClick={handleBackToSignin}
              className="w-full py-[11.4px] px-6 rounded-full font-semibold text-[20px] border-2 border-[#5046E5] bg-[#5046E5] text-white hover:bg-transparent hover:text-[#5046E5] transition-colors duration-300 cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  if (showSuccess)
  {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-[#282828]">Password Reset Successfully</h2>
            <p className="text-[#667085] mt-2 mb-6">
              Your password has been updated. You can now sign in with your new password.
            </p>
            <button
              onClick={handleBackToSignin}
              className="w-full py-[11.4px] px-6 rounded-full font-semibold text-[20px] border-2 border-[#5046E5] bg-[#5046E5] text-white hover:bg-transparent hover:text-[#5046E5] transition-colors duration-300 cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Main form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-[12px] px-4 pt-10 pb-10 max-w-[500px] w-full">
        <div className="text-center mb-8">
          <h2 className="text-[32px] font-semibold text-[#282828] mb-2">
            Reset Your <span className="text-[#5046E5]">Password</span>
          </h2>
          <p className="text-[#667085] text-[16px]">
            Enter your new password below to complete the reset process.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{errors.general}</span>
            </div>
          )}

          {/* Password Field */}
          <div className="w-full">
            <label htmlFor="password" className="block text-base font-normal text-[#5F5F5F] mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                autoComplete='off'
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full px-4 py-3 bg-[#EEEEEE] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white pr-12 ${errors.password ? 'ring-2 ring-red-500' : ''
                  }`}
                placeholder="Enter your new password"
                disabled={isSubmitting}
                aria-describedby={errors.password ? 'password-error' : undefined}
                aria-invalid={!!errors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 cursor-pointer transform -translate-y-1/2 text-[#98A2B3] hover:text-gray-700"
                disabled={isSubmitting}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="w-full">
            <label htmlFor="confirmPassword" className="block text-base font-normal text-[#5F5F5F] mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                autoComplete='off'
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`w-full px-4 py-3 bg-[#EEEEEE] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white pr-12 ${errors.confirmPassword ? 'ring-2 ring-red-500' : ''
                  }`}
                placeholder="Confirm your new password"
                disabled={isSubmitting}
                aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                aria-invalid={!!errors.confirmPassword}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 cursor-pointer transform -translate-y-1/2 text-[#98A2B3] hover:text-gray-700"
                disabled={isSubmitting}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p id="confirmPassword-error" className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Password Requirements */}
          {(() => {
            const result = validatePassword(formData.password)
            if (result.isValid) return null
            return (
              <div className="bg-[#F9FAFB] p-4 rounded-[8px] border border-[#E5E7EB]">
                <h4 className="text-sm font-medium text-[#374151] mb-3">Password Requirements:</h4>
                <ul className="text-sm text-[#6B7280] space-y-2">
                  {result.feedback.map((requirement, index) => {
                    const isMet = !result.errors.some(error => error.includes(requirement.toLowerCase()))
                    return (
                      <li key={index} className={`flex items-center gap-2 ${isMet ? 'text-gray-600' : ''}`}>
                        <span className={isMet ? 'text-gray-600' : 'text-gray-600'}>✓</span>
                        {requirement}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })()}

          {/* Submit Button */}
          <LoadingButton
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
            loadingText="Resetting Password..."
            variant="primary"
            size="lg"
            fullWidth
            className="py-[11.4px] px-6 rounded-full text-[20px]"
          >
            Reset Password
          </LoadingButton>
        </form>

        {/* Back to Sign In */}
        <div className="text-center mt-6">
          <button
            onClick={handleBackToSignin}
            className="text-[#5046E5] hover:text-[#4338CA] font-medium transition-colors"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#5046E5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-[#282828]">Loading Reset Page</h2>
          <p className="text-[#667085] mt-2">Please wait...</p>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordContent />
    </Suspense>
  )
}
