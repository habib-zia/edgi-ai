'use client'

import React from 'react'
import { AlertCircle } from 'lucide-react'
import { UseFormRegister, FieldErrors } from 'react-hook-form'

interface FormInputProps {
  field: string
  placeholder: string
  type?: string
  autoComplete?: string
  register: UseFormRegister<any>
  errors: FieldErrors<any>
  disabled?: boolean
}

export default function FormInput({
  field,
  placeholder,
  type = 'text',
  autoComplete,
  register,
  errors,
  disabled = false
}: FormInputProps) {
  const hasError = errors[field]

  return (
    <div className="relative">
      <input
        {...register(field)}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        aria-describedby={hasError ? `${field}-error` : undefined}
        aria-invalid={hasError ? 'true' : 'false'}
        className={`w-full px-4 py-[10.5px] text-[18px] font-normal placeholder:text-[#11101066] border-0 rounded-[8px] text-gray-800 transition-all duration-300 focus:outline-none focus:ring focus:ring-[#5046E5] focus:bg-white bg-[#EEEEEE] hover:bg-[#F5F5F5]
        ${hasError ? 'ring-2 ring-red-500' : ''}     ${disabled
            ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
            : 'bg-[#EEEEEE] hover:bg-[#F5F5F5]'
          } `}
      />
      {hasError && (
        <p id={`${field}-error`} className="text-red-500 text-sm mt-1 flex items-center gap-1" role="alert">
          <AlertCircle className="w-4 h-4" />
          {hasError.message}
        </p>
      )}
    </div>
  )
}
