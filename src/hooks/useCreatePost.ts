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
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [caption] = useState('')
  const [selectedAccountIds, setSelectedAccountIds] = useState<number[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [showResponse, setShowResponse] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

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
    } else if (date === minDate && time < minTime) {
      errors.push('Cannot select a past time for today')
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
      const formattedTime = time.includes(':') && time.split(':').length === 2 
        ? `${time}:00` 
        : time

      const requestBody = {
        accountIds: selectedAccountIds,
        name: video.title || '',
        videoUrl: video.videoUrl || video.url || '',
        date: date,
        time: formattedTime,
        caption: 'Caption',
        userId: userId,
        selectedAccounts: selectedAccounts.filter(account => selectedAccountIds.includes(account.id)),
        instagram_caption: "Explore the booming suburbs 🏘️ #SuburbanLife #RealEstateTrends 🌳",
        facebook_caption: "The suburban home market is booming like never before. See why people are choosing suburbs over cities.",
        linkedin_caption: "Unprecedented growth in the suburban home market. A shift towards a balanced lifestyle and affordability.",
        twitter_caption: "Suburbs are the new cities. #SuburbanBoom #RealEstateTrends",
        tiktok_caption: "Ditch the city, join the suburbs! 🏡 #TikTokSuburbs",
        youtube_caption: "Discover why the suburban real estate market is experiencing rapid growth. Embrace the new American dream."
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
    setDate,
    time,
    setTime,
    selectedAccountIds,
    matchedSelectedAccounts,
    isSubmitting,
    apiResponse,
    showResponse,
    validationErrors,
    minDate,
    minTime,
    
    // Handlers
    handleAccountToggle,
    handleSubmit,
    handleClose,
    validateForm
  }
}
