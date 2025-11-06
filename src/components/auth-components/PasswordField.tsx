'use client'

import { useState } from 'react'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import PasswordStrengthIndicator from './PasswordStrengthIndicator'

interface PasswordFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  error?: string
  showStrengthIndicator?: boolean
  passwordStrength?: { score: number; feedback: string[] }
}

export default function PasswordField({
  id,
  label,
  value,
  onChange,
  onBlur,
  placeholder = '**********',
  error,
  showStrengthIndicator = false,
  passwordStrength
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="w-full relative">
      <label htmlFor={id} className="block text-base font-normal text-[#5F5F5F] mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          autoComplete="off"
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          aria-describedby={error ? `${id}-error` : showStrengthIndicator ? 'password-strength' : undefined}
          aria-invalid={!!error}
          className={`w-full px-4 py-3 bg-[#EEEEEE] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white pr-12 ${
            error ? 'ring-2 ring-red-500' : ''
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

      {showStrengthIndicator && value && passwordStrength && (
        <PasswordStrengthIndicator passwordStrength={passwordStrength} />
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

