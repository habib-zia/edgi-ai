'use client'

import React from 'react'
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormTrigger } from 'react-hook-form'
import FormField from './form-field'
import FormDropdown from './form-dropdown'

interface FormFieldData {
  field: string
  label: string
  placeholder: string
  type?: string
  autoComplete?: string
  required?: boolean
  disabled?: boolean
  options?: { value: string; label: string }[]
}

interface FormFieldRowProps {
  fields: FormFieldData[]
  register: UseFormRegister<any>
  errors: FieldErrors<any>
  columns?: '1' | '2' | '3' | '4'
  onCityBlur?: (city: string) => void
  watch?: UseFormWatch<any>
  trigger?: UseFormTrigger<any>
  openDropdown?: string | null
  onDropdownToggle?: (field: string) => void
  onDropdownSelect?: (field: string, value: string) => void
}

export default function FormFieldRow({ 
  fields, 
  register, 
  errors, 
  columns = '4',
  onCityBlur,
  watch,
  trigger,
  openDropdown,
  onDropdownToggle,
  onDropdownSelect
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
      {fields.map((fieldData) => {
        // Render dropdown if field has options or type is 'dropdown'
        if (fieldData.type === 'dropdown' || fieldData.options) {
          if (!watch || !trigger || !onDropdownToggle || !onDropdownSelect) {
            console.warn(`Dropdown field "${fieldData.field}" requires watch, trigger, onDropdownToggle, and onDropdownSelect props`)
            return null
          }
          
          const currentValue = watch(fieldData.field) || ''
          const isOpen = openDropdown === fieldData.field
          const hasError = errors[fieldData.field]
          
          return (
            <div key={fieldData.field}>
              <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
                {fieldData.label} {fieldData.required && <span className="text-red-500">*</span>}
              </label>
              <FormDropdown
                field={fieldData.field}
                options={fieldData.options || []}
                placeholder={fieldData.placeholder}
                currentValue={currentValue}
                isOpen={isOpen}
                hasError={hasError}
                register={register}
                errors={errors}
                onToggle={(field) => onDropdownToggle?.(String(field))}
                onSelect={(field, value) => onDropdownSelect?.(String(field), value)}
                onBlur={() => {}}
              />
            </div>
          )
        }
        
        // Render regular input field
        return (
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
        )
      })}
    </div>
  )
}
