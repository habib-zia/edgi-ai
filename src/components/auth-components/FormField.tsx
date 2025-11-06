'use client'

import { AlertCircle } from 'lucide-react'
import { forwardRef } from 'react'

interface FormFieldProps {
  id: string
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  error?: string
  required?: boolean
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ id, label, type = 'text', value, onChange, onBlur, placeholder, error, required }, ref) => {
    return (
      <div className="w-full">
        <label htmlFor={id} className="block text-base font-normal text-[#5F5F5F] mb-1">
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={!!error}
          required={required}
          className={`w-full px-4 py-3 bg-[#EEEEEE] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white ${
            error ? 'ring-2 ring-red-500' : ''
          }`}
        />
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

FormField.displayName = 'FormField'

export default FormField

