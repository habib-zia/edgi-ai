'use client'

import { useState, useCallback } from 'react'

export interface ScheduleData {
  frequency: string
  posts: Array<{
    day: string
    time: string
  }>
}

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export const useScheduleValidation = () => {
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])

  const validateScheduleData = useCallback((scheduleData: ScheduleData): ValidationResult => {
    const errors: ValidationError[] = []

    // Validate frequency
    if (!scheduleData.frequency || scheduleData.frequency.trim() === '') {
      errors.push({
        field: 'frequency',
        message: 'Please select a posting frequency'
      })
    }

    // Validate posts based on frequency
    const expectedPostCount = getExpectedPostCount(scheduleData.frequency)
    const validPosts = scheduleData.posts.filter(post => post.day && post.time)

    if (validPosts.length === 0) {
      errors.push({
        field: 'posts',
        message: 'Please select at least one date and time'
      })
    } else if (scheduleData.frequency !== 'Custom' && validPosts.length < expectedPostCount) {
      errors.push({
        field: 'posts',
        message: `Please select ${expectedPostCount} ${scheduleData.frequency.toLowerCase()} as specified`
      })
    }

    // Validate individual posts
    scheduleData.posts.forEach((post, index) => {
      if (post.day && !post.time) {
        errors.push({
          field: `time_${index}`,
          message: `Please select a time for Day ${index + 1}`
        })
      }
      if (post.time && !post.day && scheduleData.frequency !== 'Daily') {
        errors.push({
          field: `day_${index}`,
          message: `Please select a date for Time ${index + 1}`
        })
      }
    })

    // Validate date logic (dates should be in the future)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    validPosts.forEach((post, index) => {
      if (post.day) {
        const selectedDate = new Date(post.day)
        if (selectedDate < today) {
          errors.push({
            field: `day_${index}`,
            message: `Date for Day ${index + 1} must be in the future`
          })
        }
      }
    })

    // Validate time logic (should be reasonable)
    validPosts.forEach((post, index) => {
      if (post.time) {
        const [hours, minutes] = post.time.split(':').map(Number)
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
          errors.push({
            field: `time_${index}`,
            message: `Invalid time format for Time ${index + 1}`
          })
        }
      }
    })

    setValidationErrors(errors)
    return {
      isValid: errors.length === 0,
      errors
    }
  }, [])

  const getExpectedPostCount = (frequency: string): number => {
    switch (frequency) {
      case 'Once a Week':
        return 1
      case 'Twice a Week':
        return 2
      case 'Three Times a Week':
        return 3
      case 'Daily':
        return 7
      case 'Custom':
        return 1 // Minimum for custom
      default:
        return 2
    }
  }

  const clearValidationErrors = useCallback(() => {
    setValidationErrors([])
  }, [])

  const getFieldError = useCallback((field: string): string | null => {
    const error = validationErrors.find(err => err.field === field)
    return error ? error.message : null
  }, [validationErrors])

  return {
    validateScheduleData,
    clearValidationErrors,
    getFieldError,
    validationErrors,
    hasErrors: validationErrors.length > 0
  }
}

