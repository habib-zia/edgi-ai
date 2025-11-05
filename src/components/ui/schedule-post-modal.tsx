'use client'

import React, { useState, useCallback } from 'react'
import { X, AlertCircle, Info } from 'lucide-react'
import { useScheduleValidation } from '@/hooks/useScheduleValidation'
import { type ScheduleData } from '@/types/post-types'
import ScheduleInfoBanner from './schedule-info-banner'
import SubmitButton from './submit-button'

interface SchedulePostModalProps {
  isOpen: boolean
  onClose: () => void
  onNext: (scheduleData: ScheduleData) => void
  title?: string
}

const frequencyOptions = [
  'Once a Week',
  'Twice a Week',
  'Three Times a Week',
  'Daily',
]

const dayOptions = [
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
]

export default function SchedulePostModal({ isOpen, onClose, onNext, title = "Schedule Post" }: SchedulePostModalProps) {
  const [frequency, setFrequency] = useState('Twice a Week')
  const [posts, setPosts] = useState([
    { day: '', date: '', time: '', _isNextWeek: false },
    { day: '', date: '', time: '', _isNextWeek: false }
  ])
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const hasSelectedDays = posts.some(post => post.day)
  
  const getEarliestDate = () => {
    const validPosts = posts.filter(post => post.date)
    if (validPosts.length === 0) return null
    
    const dates = validPosts.map(post => new Date(post.date))
    const earliestDate = new Date(Math.min(...dates.map(date => date.getTime())))
    
    const day = earliestDate.getDate().toString().padStart(2, '0')
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
        'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    const month = monthNames[earliestDate.getMonth()]
    const year = earliestDate.getFullYear()
    
    return `${day}-${month}-${year}`
  }
  
  const startDate = getEarliestDate()
  
  const { 
    validateScheduleData, 
    clearValidationErrors, 
    getFieldError, 
    isFormComplete,
    getValidationSummary,
    hasErrors 
  } = useScheduleValidation()

  const getPostCount = (frequency: string) => {
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
        return 1
    }
  }
  React.useEffect(() => {
    const newPostCount = getPostCount(frequency)
    
    if (frequency === 'Daily') {
      setPosts(prevPosts => {
        if (prevPosts.length !== 1) {
          const existingPost = prevPosts[0] || { day: '', date: '', time: '', _isNextWeek: false }
          return [{
            day: '',
            date: '',
            time: existingPost.time || '',
            _isNextWeek: false
          }]
        }
        return prevPosts
      })
    } else {
      setPosts(prevPosts => {
        const newPosts = Array.from({ length: newPostCount }, (_, index) => 
          prevPosts[index] || { day: '', date: '', time: '', _isNextWeek: false }
        )
        return newPosts
      })
    }
  }, [frequency])

  const handlePostChange = (index: number, field: 'day' | 'date' | 'time', value: string) => {
    const newPosts = [...posts]
    newPosts[index][field] = value
    
    if (field === 'day' && value) {
      const dayIndex = dayOptions.indexOf(value)
      if (dayIndex !== -1) {
        const today = new Date()
        const currentDay = today.getDay()
        const targetDay = dayIndex === 6 ? 0 : dayIndex + 1
        
        let daysUntilTarget = targetDay - currentDay
        
        // If the selected day is today or in the past, schedule for next week
        if (daysUntilTarget <= 0) {
          daysUntilTarget += 7
        }
        
        const targetDate = new Date(today)
        targetDate.setDate(today.getDate() + daysUntilTarget)
        
        newPosts[index].date = targetDate.toISOString().split('T')[0]
        
        // Check if this is next week (more than 7 days from today)
        const daysDifference = Math.floor((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        newPosts[index]._isNextWeek = daysDifference > 7
        
        if (newPosts[index].time) {
          const selectedDay = newPosts[index].day
          const currentDayName = dayOptions[today.getDay() === 0 ? 6 : today.getDay() - 1]
          
          if (selectedDay === currentDayName) {
            // Get current local time
            const currentTime = new Date()
            const currentHour = currentTime.getHours()
            const currentMinute = currentTime.getMinutes()
            
            // Parse selected time (local time)
            const [selectedHour, selectedMinute] = newPosts[index].time.split(':').map(Number)
            
            // Create Date objects for comparison using local time
            const selectedTime = new Date()
            selectedTime.setHours(selectedHour, selectedMinute, 0, 0)
            
            const currentTimeMs = new Date()
            currentTimeMs.setHours(currentHour, currentMinute, 0, 0)
            const minAllowedTime = new Date(currentTimeMs.getTime() + 40 * 60 * 1000)
            
            // Check if selected time is 40+ minutes from current local time
            if (selectedTime >= minAllowedTime) {
              // Use today's date if time is 40+ minutes away
              const todayDateStr = today.toISOString().split('T')[0]
              newPosts[index].date = todayDateStr
              newPosts[index]._isNextWeek = false
              console.log('✅ Setting date to today (day selected with existing time):', todayDateStr)
            } else {
              // Use next week's date if time is less than 40 minutes away
              newPosts[index]._isNextWeek = true
            }
          }
        }
      }
    }
    
    if (field === 'time' && value && newPosts[index].day) {
      const selectedDay = newPosts[index].day
      const today = new Date()
      const currentDayName = dayOptions[today.getDay() === 0 ? 6 : today.getDay() - 1]
      
      if (selectedDay === currentDayName) {
        // Get current local time
        const currentTime = new Date()
        const currentHour = currentTime.getHours()
        const currentMinute = currentTime.getMinutes()
        
        // Parse selected time (local time)
        const [selectedHour, selectedMinute] = value.split(':').map(Number)
        
        // Create Date objects for comparison using local time
        const selectedTime = new Date()
        selectedTime.setHours(selectedHour, selectedMinute, 0, 0)
        
        const currentTimeMs = new Date()
        currentTimeMs.setHours(currentHour, currentMinute, 0, 0)
        const minAllowedTime = new Date(currentTimeMs.getTime() + 40 * 60 * 1000)
        
        // Check if selected time is 40+ minutes from current local time
        if (selectedTime >= minAllowedTime) {
          // Use today's date if time is 40+ minutes away
          const todayDateStr = today.toISOString().split('T')[0]
          newPosts[index].date = todayDateStr
          newPosts[index]._isNextWeek = false
          console.log('✅ Setting date to today:', todayDateStr, 'for time:', value, '(40+ min away)')
        } else {
          // Use next week's date if time is less than 40 minutes away
          const currentDay = today.getDay()
          const targetDay = dayOptions.indexOf(selectedDay) === 6 ? 0 : dayOptions.indexOf(selectedDay) + 1
          let daysUntilTarget = targetDay - currentDay
          if (daysUntilTarget <= 0) {
            daysUntilTarget += 7
          }
          const targetDate = new Date(today)
          targetDate.setDate(today.getDate() + daysUntilTarget)
          newPosts[index].date = targetDate.toISOString().split('T')[0]
          newPosts[index]._isNextWeek = true
          console.log('⚠️ Setting date to next week:', targetDate.toISOString().split('T')[0], 'for time:', value, '(less than 40 min away)')
        }
      } else {
        newPosts[index]._isNextWeek = false
      }
    }
    
    if (frequency === 'Daily' && field === 'day') {
      newPosts.forEach((post, idx) => {
        if (post.day) {
          const dayIndex = dayOptions.indexOf(post.day)
          if (dayIndex !== -1) {
            const today = new Date()
            const currentDay = today.getDay()
            const targetDay = dayIndex === 6 ? 0 : dayIndex + 1
            let daysUntilTarget = targetDay - currentDay
            
            // If the selected day is today or in the past, schedule for next week
            if (daysUntilTarget <= 0) {
              daysUntilTarget += 7
            }
            
            const targetDate = new Date(today)
            targetDate.setDate(today.getDate() + daysUntilTarget)
            newPosts[idx].date = targetDate.toISOString().split('T')[0]
            
            // Check if this is next week (more than 7 days from today)
            const daysDifference = Math.floor((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            newPosts[idx]._isNextWeek = daysDifference > 7
          }
        }
      })
    }
    if (field === 'day' && !value) {
      newPosts[index].date = ''
      newPosts[index]._isNextWeek = false
    }
    
    setPosts(newPosts)
    
    if (value.trim() !== '') {
      clearValidationErrors()
    }
  }

  const handleClose = () => {
    setFrequency('Once a Week')
    setPosts([
      { day: '', date: '', time: '', _isNextWeek: false },
      { day: '', date: '', time: '', _isNextWeek: false }
    ])
    setShowFrequencyDropdown(false)
    setIsSubmitting(false)
    clearValidationErrors()
    onClose()
  }

  const handleNext = async () => {
    setIsSubmitting(true)
    clearValidationErrors()
    
    const scheduleData: ScheduleData = {
      frequency,
      posts: frequency === 'Daily' 
        ? posts.filter(post => post.time && post.time.trim() !== '')
        : posts.filter(post => (post.day || post.date) && post.time)
    }
    
    const validation = validateScheduleData(scheduleData)
    
    if (!validation.isValid) {
      setIsSubmitting(false)
      return
    }
    
    try {
      await onNext(scheduleData)
    } catch (error) {
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {hasSelectedDays && <ScheduleInfoBanner startDate={startDate} />}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Frequency of Posting
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFrequencyDropdown(!showFrequencyDropdown)}
                className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 border-0 rounded-lg text-left transition-colors duration-200 flex items-center justify-between cursor-pointer"
              >
                <span className="text-gray-800">{frequency}</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${showFrequencyDropdown ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showFrequencyDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                  {frequencyOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setFrequency(option)
                        setShowFrequencyDropdown(false)
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between text-gray-800 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <span>{option}</span>
                      {frequency === option && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                {frequency === 'Daily' 
                  ? `Select Time for Daily Posts`
                  : `Select Date & Time for each post (${posts.length} ${posts.length === 1 ? 'post' : 'posts'})`
                }
              </h3>
              <div className="w-full h-px bg-gray-200"></div>
            </div>

            {posts.map((post, index) => (
              <div key={index}>
              <div className={`grid gap-4 ${
                frequency === 'Daily' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                  : posts.length > 4 
                    ? 'grid-cols-1 lg:grid-cols-2' 
                    : 'grid-cols-1 sm:grid-cols-2'
              }`}>
                {frequency !== 'Daily' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Day {index + 1}
                    </label>
                    <div className="relative">
                      {(frequency === 'Once a Week' || frequency === 'Twice a Week' || frequency === 'Three Times a Week') ? (
                        <select
                          value={post.day}
                          onChange={(e) => handlePostChange(index, 'day', e.target.value)}
                          className={`w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 border-0 rounded-lg text-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 ${
                            getFieldError(`day_${index}`) ? 'focus:ring-red-500 border-red-300 ring-2 ring-red-200' : 'focus:ring-blue-500'
                          }`}
                        >
                          <option value="">Select Day</option>
                          {dayOptions.map((day) => {
                            const isDaySelected = posts.some((otherPost, otherIndex) => 
                              otherIndex !== index && otherPost.day === day
                            )
                            
                            return (
                              <option 
                                key={day} 
                                value={day}
                                disabled={isDaySelected}
                                style={{ 
                                  color: isDaySelected ? '#9CA3AF' : 'inherit',
                                  backgroundColor: isDaySelected ? '#F3F4F6' : 'inherit'
                                }}
                              >
                                {day} {isDaySelected ? '(Already selected)' : ''}
                              </option>
                            )
                          })}
                        </select>
                      ) : (
                        <input
                          type="date"
                          value={post.date}
                          onChange={(e) => handlePostChange(index, 'date', e.target.value)}
                          className={`w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 border-0 rounded-lg text-gray-800 placeholder-gray-500 transition-colors duration-200 focus:outline-none focus:ring-2 ${
                            getFieldError(`day_${index}`) ? 'focus:ring-red-500 border-red-300 ring-2 ring-red-200' : 'focus:ring-blue-500'
                          }`}
                          style={{
                            WebkitAppearance: 'none',
                            MozAppearance: 'textfield'
                          }}
                          placeholder="Select Date"
                        />
                      )}
                    </div>
                    {getFieldError(`day_${index}`) && (
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {getFieldError(`day_${index}`)}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {frequency === 'Daily' ? `Time for Day ${index + 1}` : `Time ${index + 1}`}
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={post.time}
                      onChange={(e) => handlePostChange(index, 'time', e.target.value)}
                      onClick={(e) => {
                        e.stopPropagation()
                        // Open time picker by focusing and clicking
                        e.currentTarget.showPicker?.()
                      }}
                      className={`w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 border-0 rounded-lg text-gray-800 placeholder-gray-500 transition-colors duration-200 focus:outline-none focus:ring-2 ${
                        getFieldError(`time_${index}`) ? 'focus:ring-red-500 border-red-300 ring-2 ring-red-200' : 'focus:ring-blue-500'
                      }`}
                      style={{
                        WebkitAppearance: 'none',
                        MozAppearance: 'textfield'
                      }}
                      placeholder="Select Time"
                    />
                  </div>
                  {getFieldError(`time_${index}`) && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {getFieldError(`time_${index}`)}
                    </p>
                  )}
                 
                </div>
              </div>
              {post._isNextWeek && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-800 text-sm">
                      <span className="font-bold">You have selected today</span> and this post will schedule to next week! If you want to schedule this today, you have to select a time at least 40 minutes from the current time.
                    </p>
                  </div>
                </div>
              )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          {hasErrors && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 text-sm mb-2">
                <AlertCircle className="w-4 h-4" />
                <span>Please fix the errors above before proceeding</span>
              </div>
              <div className="text-red-600 text-xs">
                {getValidationSummary().fieldErrors.slice(0, 3).map((error, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    <span>{error}</span>
                  </div>
                ))}
                {getValidationSummary().totalErrors > 3 && (
                  <div className="text-red-500 text-xs mt-1">
                    +{getValidationSummary().totalErrors - 3} more error{getValidationSummary().totalErrors - 3 > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          )}
          
          <SubmitButton
            isLoading={isSubmitting}
            disabled={!isFormComplete({ frequency, posts }) || hasErrors}
            loadingText="Validating..."
            buttonText="Next"
            onClick={handleNext}
          />
        </div>
      </div>
    </div>
  )
}
