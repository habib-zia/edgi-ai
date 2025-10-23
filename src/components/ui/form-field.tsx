'use client'

import React from 'react'
import { UseFormRegister, FieldErrors } from 'react-hook-form'
import FormInput from './form-input'

interface FormFieldProps {
  field: string
  label: string
  placeholder: string
  type?: string
  autoComplete?: string
  required?: boolean
  register: UseFormRegister<any>
  errors: FieldErrors<any>
  disabled?: boolean
  onBlur?: (value: string) => void
}

export default function FormField({
  field,
  label,
  placeholder,
  type = 'text',
  autoComplete,
  required = false,
  register,
  errors,
  disabled = false,
  onBlur
}: FormFieldProps) {
  return (
    <div>
      <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <FormInput
        field={field}
        placeholder={placeholder}
        type={type}
        autoComplete={autoComplete}
        register={register}
        errors={errors}
        disabled={disabled}
        onBlur={onBlur}
      />
    </div>
  )
}
