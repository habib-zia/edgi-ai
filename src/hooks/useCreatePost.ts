'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { API_CONFIG, getApiUrl, getAuthenticatedHeaders } from '@/lib/config'
import { CreatePostModalProps, PostData } from '@/types/post-types'

export const useCreatePost = ({ 
  isOpen, 
  onClose, 
  onPost, 
  selectedAccounts, 
  video 
}: CreatePostModalProps) => {
  console.log("video", JSON?.stringify(video))
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [caption] = useState('')
  const [selectedAccountIds, setSelectedAccountIds] = useState<number[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [showResponse, setShowResponse] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [timeAdjustmentMessage, setTimeAdjustmentMessage] = useState<string | null>(null)

  // Get user ID from Redux store
  const userId = useSelector((state: RootState) => state.user.user?.id)

  // Get current date and time for restrictions
  const getCurrentDateTime = useCallback(() => {
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
  }, [])

  const { date: minDate, time: minTime } = getCurrentDateTime()

  // Get minimum time for today (current time + 20 minutes)
  const getMinTimeForToday = useCallback(() => {
    const now = new Date()
    const minTime = new Date(now.getTime() + 20 * 60 * 1000) // Add 20 minutes
    return minTime.toTimeString().slice(0, 5)
  }, [])

  const minTimeForToday = getMinTimeForToday()

  // Initialize selected accounts when modal opens
  useEffect(() => {
    if (isOpen && selectedAccounts.length > 0) {
      setSelectedAccountIds(selectedAccounts.map(account => account.id))
    }
  }, [isOpen, selectedAccounts])

  // Match selectedAccountIds with selectedAccounts and get complete account objects
  const matchedSelectedAccounts = selectedAccounts.filter(account => 
    selectedAccountIds.includes(account.id)
  )

  const handleAccountToggle = useCallback((accountId: number) => {
    setSelectedAccountIds(prev => 
      prev.includes(accountId) 
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    )
  }, [])

  // Handle date change with automatic time adjustment
  const handleDateChange = useCallback((newDate: string) => {
    const selectedDate = new Date(newDate)
    const today = new Date()
    const isToday = selectedDate.toDateString() === today.toDateString()
    
    if (isToday && time) {
      const currentTime = new Date()
      const minTime = new Date(currentTime.getTime() + 20 * 60 * 1000) // Add 20 minutes
      const selectedTime = new Date(`${newDate}T${time}:00`)
      const minTimeForToday = new Date(`${newDate}T${minTime.toTimeString().slice(0, 5)}:00`)
      
      if (selectedTime < minTimeForToday) {
        const adjustedTime = minTime.toTimeString().slice(0, 5)
        setTimeAdjustmentMessage(`Time automatically adjusted to ${adjustedTime} (20 minutes from now)`)
        setTime(adjustedTime)
        setTimeout(() => setTimeAdjustmentMessage(null), 5000)
      }
    }
    
    setDate(newDate)
  }, [time])

  // Handle time change with validation
  const handleTimeChange = useCallback((newTime: string) => {
    const selectedDate = new Date(date)
    const today = new Date()
    const isToday = selectedDate.toDateString() === today.toDateString()
    
    if (isToday) {
      const currentTime = new Date()
      const minTime = new Date(currentTime.getTime() + 20 * 60 * 1000) // Add 20 minutes
      const selectedTime = new Date(`${date}T${newTime}:00`)
      const minTimeForToday = new Date(`${date}T${minTime.toTimeString().slice(0, 5)}:00`)
      
      if (selectedTime < minTimeForToday) {
        const adjustedTime = minTime.toTimeString().slice(0, 5)
        setTimeAdjustmentMessage(`Time automatically adjusted to ${adjustedTime} (20 minutes from now)`)
        setTime(adjustedTime)
        setTimeout(() => setTimeAdjustmentMessage(null), 5000)
        return
      }
    }
    
    setTime(newTime)
  }, [date])

  const validateForm = useCallback(() => {
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
    } else if (date === minDate && time < minTimeForToday) {
      errors.push('Cannot select a time less than 20 minutes from now for today')
    }

    // Caption validation removed - using empty string

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
  }, [date, time, selectedAccountIds, video, minDate, minTime])

  // Real-time validation
  useEffect(() => {
    const errors = validateForm()
    setValidationErrors(errors)
  }, [validateForm])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
      // const formattedTime = time.includes(':') && time.split(':').length === 2 
      //   ? `${time}:00` 
      //   : time
        const formattedTime = time.includes(':') && time.split(':').length === 2 
        ? `${time}:00` 
        : time;
      
      // Combine with today's date (local)
      const localDate = new Date();
      const [hours, minutes, seconds] = formattedTime.split(':').map(Number);
      localDate.setHours(hours, minutes, seconds || 0, 0);
      
      // Convert to UTC ISO string
      const utcTime = localDate.toISOString();
      
      const timeOnly = utcTime.split('T')[1].split('.')[0];
      const requestBody = {
        accountIds: selectedAccountIds,
        name: video.title || '',
        videoUrl: video.videoUrl || video.url || '',
        date: date,
        time: timeOnly,
        caption: 'Caption',
        userId: userId,
        selectedAccounts: selectedAccounts.filter(account => selectedAccountIds.includes(account.id)),
        instagram_caption: video.socialMediaCaptions?.instagram_caption || '',
        facebook_caption: video.socialMediaCaptions?.facebook_caption || '',
        linkedin_caption: video.socialMediaCaptions?.linkedin_caption || '',
        twitter_caption: video.socialMediaCaptions?.twitter_caption || '',
        tiktok_caption: video.socialMediaCaptions?.tiktok_caption || '',
        youtube_caption: video.socialMediaCaptions?.youtube_caption || ''
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
        const postData: PostData = {
          date,
          time,
          caption: '',
          accounts: selectedAccountsForPost,
          video
        }
        onPost(postData)

        // Clear form data after successful submission
        setDate('')
        setTime('')
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
  }, [validationErrors, time, selectedAccountIds, video, date, caption, userId, selectedAccounts, onPost])

  const handleClose = useCallback(() => {
    setDate('')
    setTime('')
    setSelectedAccountIds([])
    setIsSubmitting(false)
    setApiResponse(null)
    setShowResponse(false)
    setValidationErrors([])
    onClose()
  }, [onClose])

  return {
    // State
    date,
    setDate: handleDateChange,
    time,
    setTime: handleTimeChange,
    selectedAccountIds,
    matchedSelectedAccounts,
    isSubmitting,
    apiResponse,
    showResponse,
    validationErrors,
    minDate,
    minTime: minTimeForToday,
    timeAdjustmentMessage,
    
    // Handlers
    handleAccountToggle,
    handleSubmit,
    handleClose,
    validateForm
  }
}
