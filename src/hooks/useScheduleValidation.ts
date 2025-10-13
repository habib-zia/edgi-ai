'use client'

import { useState, useCallback } from 'react'
import { ScheduleData, ValidationError, ValidationResult } from '@/types/post-types'

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

    let validPosts
    if (scheduleData.frequency === 'Daily') {
      validPosts = scheduleData.posts.filter(post => post.time && post.time.trim() !== '')
    } else {
      validPosts = scheduleData.posts.filter(post => (post.day || post.date) && post.time)
    }

    if (validPosts.length === 0) {
      if (scheduleData.frequency === 'Daily') {
        errors.push({
          field: 'posts',
          message: 'Please select at least one time'
        })
      } else {
        errors.push({
          field: 'posts',
          message: 'Please select at least one day/date and time'
        })
      }
    } else if (scheduleData.frequency !== 'Custom' && validPosts.length < expectedPostCount) {
      errors.push({
        field: 'posts',
        message: `Please select ${expectedPostCount} ${scheduleData.frequency.toLowerCase()} as specified`
      })
    }

    // Enhanced validation for individual posts
    scheduleData.posts.forEach((post, index) => {
      const postNumber = index + 1
      
      // For Daily frequency, only validate time
      if (scheduleData.frequency === 'Daily') {
        if (!post.time || post.time.trim() === '') {
          errors.push({
            field: `time_${index}`,
            message: `Please select a time for Day ${postNumber}`
          })
        }
      } else {
        // For non-Daily frequencies, validate both day/date and time
        if ((post.day || post.date) && (!post.time || post.time.trim() === '')) {
          errors.push({
            field: `time_${index}`,
            message: `Please select a time for Day ${postNumber}`
          })
        }
        
        if (post.time && post.time.trim() !== '' && !post.day && !post.date) {
          errors.push({
            field: `day_${index}`,
            message: `Please select a day or date for Time ${postNumber}`
          })
        }
      }
      
      // For non-Daily frequencies, check if day is missing
      if (scheduleData.frequency !== 'Daily' && scheduleData.frequency !== 'Custom' && (!post.day || post.day.trim() === '')) {
        errors.push({
          field: `day_${index}`,
          message: `Please select a day for Day ${postNumber}`
        })
      }
    })

    // Date validation removed - allow past dates to hit the API

    // Enhanced time validation
    validPosts.forEach((post, index) => {
      if (post.time && post.time.trim() !== '') {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
        if (!timeRegex.test(post.time)) {
          errors.push({
            field: `time_${index}`,
            message: `Invalid time format for Time ${index + 1}. Use HH:MM format`
          })
        } else {
          const [hours, minutes] = post.time.split(':').map(Number)
          if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            errors.push({
              field: `time_${index}`,
              message: `Invalid time for Time ${index + 1}. Hours must be 0-23, minutes 0-59`
            })
          }
        }
      }
    })

    // Check for duplicate days (for day-based frequencies)
    if (scheduleData.frequency !== 'Daily' && scheduleData.frequency !== 'Custom') {
      const selectedDays = scheduleData.posts
        .filter(post => post.day && post.day.trim() !== '')
        .map(post => post.day)
      
      const duplicateDays = selectedDays.filter((day, index) => 
        selectedDays.indexOf(day) !== index
      )
      
      if (duplicateDays.length > 0) {
        errors.push({
          field: 'posts',
          message: `Duplicate days selected: ${duplicateDays.join(', ')}. Please select different days.`
        })
      }
    }

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
        return 1
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

  // Validate individual field in real-time
  const validateField = useCallback((field: string, value: string, postIndex?: number): string | null => {
    if (!value || value.trim() === '') {
      if (field === 'frequency') {
        return 'Please select a posting frequency'
      } else if (field === 'day' && postIndex !== undefined) {
        return `Please select a day for Day ${postIndex + 1}`
      } else if (field === 'time' && postIndex !== undefined) {
        return `Please select a time for Time ${postIndex + 1}`
      }
      return 'This field is required'
    }

    // Time format validation
    if (field === 'time' && value.trim() !== '') {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (!timeRegex.test(value)) {
        return 'Invalid time format. Use HH:MM format'
      }
    }

    return null
  }, [])

  // Check if all required fields are filled
  const isFormComplete = useCallback((scheduleData: ScheduleData): boolean => {
    if (!scheduleData.frequency || scheduleData.frequency.trim() === '') {
      return false
    }

    const expectedPostCount = getExpectedPostCount(scheduleData.frequency)
    const validPosts = scheduleData.posts.filter(post => {
      if (scheduleData.frequency === 'Daily') {
        return post.time && post.time.trim() !== ''
      } else {
        return (post.day || post.date) && post.time && post.time.trim() !== ''
      }
    })

    return validPosts.length >= expectedPostCount
  }, [])

  // Get validation summary
  const getValidationSummary = useCallback((): { totalErrors: number; fieldErrors: string[] } => {
    const fieldErrors = validationErrors.map(error => error.message)
    return {
      totalErrors: validationErrors.length,
      fieldErrors
    }
  }, [validationErrors])

  return {
    validateScheduleData,
    clearValidationErrors,
    getFieldError,
    validateField,
    isFormComplete,
    getValidationSummary,
    validationErrors,
    hasErrors: validationErrors.length > 0
  }
}

