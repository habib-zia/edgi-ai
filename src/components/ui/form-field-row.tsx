'use client'

import React from 'react'
import { UseFormRegister, FieldErrors } from 'react-hook-form'
import FormField from './form-field'

interface FormFieldData {
  field: string
  label: string
  placeholder: string
  type?: string
  autoComplete?: string
  required?: boolean
  disabled?: boolean
}

interface FormFieldRowProps {
  fields: FormFieldData[]
  register: UseFormRegister<any>
  errors: FieldErrors<any>
  columns?: '1' | '2' | '3' | '4'
  onCityBlur?: (city: string) => void
}

export default function FormFieldRow({ 
  fields, 
  register, 
  errors, 
  columns = '4',
  onCityBlur
}: FormFieldRowProps) {
  const getGridCols = () => {
    switch (columns) {
      case '1': return 'grid-cols-1'
      case '2': return 'grid-cols-1 sm:grid-cols-2'
      case '3': return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      case '4': return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      default: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
    }
  }

  return (
    <div className={`grid ${getGridCols()} gap-4`}>
      {fields.map((fieldData) => (
        <FormField
          key={fieldData.field}
          field={fieldData.field}
          label={fieldData.label}
          placeholder={fieldData.placeholder}
          type={fieldData.type}
          autoComplete={fieldData.autoComplete}
          required={fieldData.required}
          register={register}
          errors={errors}
          disabled={fieldData.disabled}
          onBlur={fieldData.field === 'city' ? onCityBlur : undefined}
        />
      ))}
    </div>
  )
}
