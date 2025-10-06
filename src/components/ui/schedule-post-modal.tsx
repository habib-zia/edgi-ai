'use client'

import React, { useState } from 'react'
import { X, Info, AlertCircle } from 'lucide-react'
import { useScheduleValidation, type ScheduleData } from '@/hooks/useScheduleValidation'

interface SchedulePostModalProps {
  isOpen: boolean
  onClose: () => void
  onNext: (scheduleData: ScheduleData) => void
}

const frequencyOptions = [
  'Once a Week',
  'Twice a Week',
  'Three Times a Week',
  'Daily',
  'Custom'
]

export default function SchedulePostModal({ isOpen, onClose, onNext }: SchedulePostModalProps) {
  const [frequency, setFrequency] = useState('Twice a Week')
  const [posts, setPosts] = useState([
    { day: '', time: '' },
    { day: '', time: '' }
  ])
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { validateScheduleData, clearValidationErrors, getFieldError, hasErrors } = useScheduleValidation()

  // Calculate number of posts based on frequency
  const getPostCount = (frequency: string) => {
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
        return 2 // Default for custom
      default:
        return 2
    }
  }

  // Update posts array when frequency changes
  React.useEffect(() => {
    const newPostCount = getPostCount(frequency)
    const newPosts = Array.from({ length: newPostCount }, (_, index) => 
      posts[index] || { day: '', time: '' }
    )
    setPosts(newPosts)
  }, [frequency])

  const handlePostChange = (index: number, field: 'day' | 'time', value: string) => {
    const newPosts = [...posts]
    newPosts[index][field] = value
    setPosts(newPosts)
  }

  const handleNext = async () => {
    setIsSubmitting(true)
    clearValidationErrors()
    
    const scheduleData: ScheduleData = {
      frequency,
      posts: posts.filter(post => post.day && post.time)
    }
    
    const validation = validateScheduleData(scheduleData)
    
    if (!validation.isValid) {
      setIsSubmitting(false)
      return
    }
    
    try {
      await onNext(scheduleData)
    } catch (error) {
      console.error('Error submitting schedule:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Schedule Post</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Information Banner */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
            <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Info className="w-4 h-4 text-orange-600" />
            </div>
            <p className="text-orange-800 text-sm">
              These posts will be scheduled for whole month and You can reschedule the posts on 11-OCT-2025.
            </p>
          </div>

          {/* Frequency of Posting */}
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

          {/* Select Date & Time for each post */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                {frequency === 'Daily' 
                  ? `Select Time for each day of the week (${posts.length} days)`
                  : `Select Date & Time for each post (${posts.length} ${posts.length === 1 ? 'post' : 'posts'})`
                }
              </h3>
              <div className="w-full h-px bg-gray-200"></div>
            </div>

            {posts.map((post, index) => (
              <div key={index} className={`grid gap-4 ${
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
                      <input
                        type="date"
                        value={post.day}
                        onChange={(e) => handlePostChange(index, 'day', e.target.value)}
                        className={`w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 border-0 rounded-lg text-gray-800 placeholder-gray-500 transition-colors duration-200 focus:outline-none focus:ring-2 ${
                          getFieldError(`day_${index}`) ? 'focus:ring-red-500 border-red-300' : 'focus:ring-blue-500'
                        }`}
                        style={{
                          WebkitAppearance: 'none',
                          MozAppearance: 'textfield'
                        }}
                        placeholder="Select Day"
                      />
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
                      className={`w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 border-0 rounded-lg text-gray-800 placeholder-gray-500 transition-colors duration-200 focus:outline-none focus:ring-2 ${
                        getFieldError(`time_${index}`) ? 'focus:ring-red-500 border-red-300' : 'focus:ring-blue-500'
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
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          {hasErrors && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Please fix the errors above before proceeding</span>
              </div>
            </div>
          )}
          
          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-4 ${
              isSubmitting || hasErrors
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-[#5046E5] text-white hover:bg-[#4338CA] focus:ring-[#5046E5]/20'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Validating...
              </div>
            ) : (
              'Next'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
