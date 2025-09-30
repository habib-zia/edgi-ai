'use client'

import { useState } from 'react'
import React from 'react'
import { X } from 'lucide-react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { API_CONFIG, getApiUrl, getAuthenticatedHeaders } from '@/lib/config'
import { getAccountTypeIcon } from '@/utils/socialMediaIcons'

interface ConnectedAccount {
  id: number
  name: string
  type: string
  _type: string
  active: boolean
  image: string
  post_maxlength: number
  attachment_types: string[]
  max_attachments: number
  post_media_required: boolean
  video_dimensions: {
    min: [number, number | null]
    max: [number | null, number | null]
  }
  video_duration: {
    min: number
    max: number
  }
  user_id: number
  account_id: string
  public_id: string
  extra_data: any
}

interface VideoData {
  id: string
  title: string
  status: string
  url?: string
  videoUrl?: string
  thumbnail?: string
  createdAt: string
  updatedAt: string
}

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  onPost: (postData: {
    date: string
    time: string
    caption: string
    accounts: ConnectedAccount[]
    video: VideoData
  }) => void
  selectedAccounts: ConnectedAccount[]
  video: VideoData
}

export default function CreatePostModal({ 
  isOpen, 
  onClose, 
  onPost, 
  selectedAccounts, 
  video 
}: CreatePostModalProps) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [caption, setCaption] = useState('')
  const [selectedAccountIds, setSelectedAccountIds] = useState<number[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [showResponse, setShowResponse] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Get user ID from Redux store
  const userId = useSelector((state: RootState) => state.user.user?.id)


  // Get current date and time for restrictions
  const getCurrentDateTime = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    
    return {
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}`
    }
  }

  const { date: minDate, time: minTime } = getCurrentDateTime()

  // Initialize selected accounts when modal opens
  React.useEffect(() => {
    if (isOpen && selectedAccounts.length > 0) {
      setSelectedAccountIds(selectedAccounts.map(account => account.id))
    }
  }, [isOpen, selectedAccounts])


  const handleAccountToggle = (accountId: number) => {
    setSelectedAccountIds(prev => 
      prev.includes(accountId) 
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    )
  }

  const validateForm = () => {
    const errors: string[] = []

    // Validate date
    if (!date || date.trim() === '') {
      errors.push('Date is required')
    } else if (date < minDate) {
      errors.push('Cannot select a past date')
    }

    // Validate time
    if (!time || time.trim() === '') {
      errors.push('Time is required')
    } else if (date === minDate && time < minTime) {
      errors.push('Cannot select a past time for today')
    }

    // Validate caption
    if (!caption || caption.trim() === '') {
      errors.push('Caption is required')
    } else if (caption.trim().length < 3) {
      errors.push('Caption must be at least 3 characters long')
    }

    // Validate video data
    if (!video || !video.title || video.title.trim() === '') {
      errors.push('Video title is required')
    }

    if (!video || (!video.url && !video.videoUrl) || (video.url && video.url.trim() === '') || (video.videoUrl && video.videoUrl.trim() === '')) {
      errors.push('Video URL is required')
    }

    // Validate account selection
    if (selectedAccountIds.length === 0) {
      errors.push('Please select at least one account to post to')
    }

    return errors
  }
  // Real-time validation
  React.useEffect(() => {
    const errors = validateForm()
    setValidationErrors(errors)
  }, [date, time, caption, selectedAccountIds, video])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if there are any validation errors
    if (validationErrors.length > 0) {
      return // Don't submit if there are validation errors
    }

    setIsSubmitting(true)
    setApiResponse(null)
    setShowResponse(false)

    try {
      // Format time to include seconds
      const formattedTime = time.includes(':') && time.split(':').length === 2 
        ? `${time}:00` 
        : time

      const requestBody = {
        accountIds: selectedAccountIds,
        name: video.title || '',
        videoUrl: video.videoUrl || video.url || '',
        date: date,
        time: formattedTime,
        caption: caption.trim(),
        userId: userId
      }


      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SOCIALBU.MEDIA_CREATE_POST), {
        method: 'POST',
        headers: getAuthenticatedHeaders(),
        body: JSON.stringify(requestBody)
      })

      const responseData = await response.json()
      
      setApiResponse(responseData)
      setShowResponse(true)

      if (response.ok && responseData.success) {
        // Show success notification
        if ((window as any).showNotification) {
          (window as any).showNotification({
            type: 'success',
            title: 'Post Created Successfully',
            message: 'Your post has been scheduled successfully!',
            duration: 5000
          })
        }

        // Call the original onPost callback for any additional handling
        const selectedAccountsForPost = selectedAccounts.filter(account => 
          selectedAccountIds.includes(account.id)
        )
        onPost({
          date,
          time,
          caption: caption.trim(),
          accounts: selectedAccountsForPost,
          video
        })

        // Clear form data after successful submission
        setDate('')
        setTime('')
        setCaption('')
        setSelectedAccountIds([])
        setValidationErrors([])
      } else {
        // Handle API error response
        console.error('API Error:', responseData)
        const errorMessage = responseData.error || responseData.message || 'Failed to create post'
        
        setApiResponse({
          success: false,
          error: errorMessage,
          message: responseData.message || 'An error occurred while creating the post'
        })
        setShowResponse(true)

        // Show notification
        if ((window as any).showNotification) {
          (window as any).showNotification({
            type: 'error',
            title: 'Post Failed',
            message: errorMessage,
            duration: 8000
          })
        }
      }
    } catch (error) {
      console.error('Error creating post:', error)
      const errorMessage = 'Failed to create post. Please try again.'
      
      setApiResponse({
        success: false,
        error: errorMessage,
        message: errorMessage
      })
      setShowResponse(true)

      // Show notification for network/other errors
      if ((window as any).showNotification) {
        (window as any).showNotification({
          type: 'error',
          title: 'Network Error',
          message: errorMessage,
          duration: 8000
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setDate('')
    setTime('')
    setCaption('')
    setSelectedAccountIds([])
    setIsSubmitting(false)
    setApiResponse(null)
    setShowResponse(false)
    setValidationErrors([])
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[600px] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-black">Create Post</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Date and Time Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Date Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <div>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={minDate}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:border-transparent bg-gray-50 text-black disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Select Date"
                />
              </div>
            </div>

            {/* Time Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time <span className="text-red-500">*</span>
              </label>
              <div>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  min={date === minDate ? minTime : undefined}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:border-transparent bg-gray-50 text-black disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Select Time"
                />
              </div>
            </div>
          </div>

          {/* Caption Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Caption <span className="text-red-500">*</span>
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:border-transparent bg-gray-50 resize-none text-black disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter Caption"
            />
          </div>

          {/* Select Accounts */}
          {selectedAccounts.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select accounts to post to <span className="text-red-500">*</span> ({selectedAccountIds.length} selected)
              </label>
              <div className="space-y-2">
                {selectedAccounts.map((account) => (
                  <div 
                    key={account.id} 
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                      isSubmitting 
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer'
                    } ${
                      selectedAccountIds.includes(account.id)
                        ? 'border-[#5046E5] bg-blue-50'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                    onClick={() => !isSubmitting && handleAccountToggle(account.id)}
                  >
                    {/* Social Media Icon */}
                    {getAccountTypeIcon(account.type)}
                    
                    {/* Account Info */}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{account.name}</p>
                      <p className="text-xs text-gray-500">{account._type}</p>
                    </div>
                    
                    {/* Checkbox */}
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedAccountIds.includes(account.id)
                        ? 'border-[#5046E5] bg-[#5046E5]'
                        : 'border-gray-300'
                    }`}>
                      {selectedAccountIds.includes(account.id) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video Info */}
          {video && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-800">{video.title}</p>
                <p className="text-xs text-gray-500">Status: {video.status}</p>
              </div>
            </div>
          )}

          {/* Validation Errors Display */}
          {validationErrors.length > 0 && (
            <div className="p-4 rounded-lg border-2 border-red-200 bg-red-50">
              <h3 className="font-semibold text-red-800 mb-2">Please fix the following errors:</h3>
              <ul className="text-sm text-red-700 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Post Button */}
          <button
            type="submit"
            disabled={isSubmitting || validationErrors.length > 0}
            className="w-full bg-[#5046E5] text-white py-3 px-6 rounded-full font-semibold text-lg hover:bg-[#4338CA] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Posting...
              </>
            ) : validationErrors.length > 0 ? (
              'Fix errors to continue'
            ) : (
              'Post'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
