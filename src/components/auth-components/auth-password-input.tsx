'use client'

import { useState, forwardRef } from 'react'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { getPasswordStrength, getPasswordStrengthColor, getPasswordStrengthBgColor } from '@/lib/password-validation'

interface AuthPasswordInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  error?: string
  passwordStrength?: {
    score: number
    feedback: string[]
  }
  showStrengthIndicator?: boolean
  autoComplete?: string
  required?: boolean
  className?: string
}

const AuthPasswordInput = forwardRef<HTMLInputElement, AuthPasswordInputProps>(
  ({ id, label, value, onChange, onBlur, placeholder = '**********', error, passwordStrength, showStrengthIndicator = false, autoComplete = 'off', required, className = '' }, ref) => {
    const [showPassword, setShowPassword] = useState(false)

    return (
      <div className="w-full relative">
        <label htmlFor={id} className="block text-base font-normal text-[#5F5F5F] mb-1">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={showPassword ? 'text' : 'password'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            autoComplete={autoComplete}
            placeholder={placeholder}
            aria-describedby={error ? `${id}-error` : showStrengthIndicator && passwordStrength ? `${id}-strength` : undefined}
            aria-invalid={!!error}
            required={required}
            className={`w-full px-4 py-3 bg-[#EEEEEE] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white pr-12 ${error ? 'ring-2 ring-red-500' : ''} ${className}`}
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
        {showStrengthIndicator && value && passwordStrength && (
          <div id={`${id}-strength`} className="mt-2">
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

        {error && (
          <p id={`${id}-error`} className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}
      </div>
    )
  }
)

AuthPasswordInput.displayName = 'AuthPasswordInput'

export default AuthPasswordInput

