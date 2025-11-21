'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import { CreatePostModalProps } from '@/types/post-types'
import { useCreatePost } from '@/hooks/useCreatePost'
import AccountSelection from './account-selection'
import DatePicker from '../scheduled-post/DatePicker'
import PostConfirmationModal from './post-confirmation-modal'
import { API_CONFIG, getApiUrl, getAuthenticatedHeaders } from '@/lib/config'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'

// Helper function to map account type to caption field name
const getCaptionFieldName = (accountType: string): 'instagram_caption' | 'facebook_caption' | 'linkedin_caption' | 'twitter_caption' | 'tiktok_caption' | 'youtube_caption' | null => {
  const typeMap: Record<string, 'instagram_caption' | 'facebook_caption' | 'linkedin_caption' | 'twitter_caption' | 'tiktok_caption' | 'youtube_caption'> = {
    'instagram.api': 'instagram_caption',
    'facebook.page': 'facebook_caption',
    'linkedin.profile': 'linkedin_caption',
    'twitter.profile': 'twitter_caption',
    'tiktok.profile': 'tiktok_caption',
    'google.youtube': 'youtube_caption'
  }
  return typeMap[accountType] || null
}

export default function CreatePostModal({ 
  isOpen, 
  onClose, 
  onPost, 
  selectedAccounts, 
  video 
}: CreatePostModalProps) {
  // State to manage captions per account (by account ID)
  const [accountCaptions, setAccountCaptions] = useState<Record<number, string>>({})
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [postNow, setPostNow] = useState(false)
  const [isPostingNow, setIsPostingNow] = useState(false) // Loading state for "Post now!" mode
  
  // Get user ID from Redux store for direct API call
  const userId = useSelector((state: RootState) => state.user.user?.id)

  // Initialize captions from video's socialMediaCaptions
  useEffect(() => {
    if (video?.socialMediaCaptions && selectedAccounts.length > 0) {
      const initialCaptions: Record<number, string> = {}
      
      selectedAccounts.forEach((account) => {
        const captionField = getCaptionFieldName(account.type)
        if (captionField && video.socialMediaCaptions?.[captionField]) {
          initialCaptions[account.id] = video.socialMediaCaptions[captionField] || ''
        }
      })
      
      setAccountCaptions(initialCaptions)
    }
  }, [video?.socialMediaCaptions, selectedAccounts])

  // Handle caption update
  const handleCaptionUpdate = useCallback((accountId: number, caption: string) => {
    setAccountCaptions((prev) => ({
      ...prev,
      [accountId]: caption
    }))

    // Also update the video's socialMediaCaptions if video prop is mutable
    if (video) {
      const account = selectedAccounts.find((acc) => acc.id === accountId)
      if (account) {
        const captionField = getCaptionFieldName(account.type)
        if (captionField && video.socialMediaCaptions) {
          // Update the caption in video's socialMediaCaptions
          (video.socialMediaCaptions as any)[captionField] = caption
        }
      }
    }
  }, [video, selectedAccounts])

  const {
    date,
    setDate,
    time,
    setTime,
    selectedAccountIds,
    matchedSelectedAccounts,
    isSubmitting,
    validationErrors,
    minDate,
    minTime,
    timeAdjustmentMessage,
    handleAccountToggle,
    handleSubmit,
    handleClose,
    validateForm
  } = useCreatePost({ isOpen, onClose, onPost, selectedAccounts, video })

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // If "Post now!" is enabled, skip validation and go directly to confirmation
    // Time will be calculated fresh when user clicks Confirm
    if (postNow) {
      setIsConfirmModalOpen(true)
      return
    }
    
    // Normal flow - check validation errors for manually selected date/time
    if (validationErrors.length > 0) {
      return
    }
    setIsConfirmModalOpen(true)
  }

  const handleConfirmPost = async () => {
    setIsConfirmModalOpen(false)
    
    // If "Post now!" is enabled, calculate fresh current time + 3 minutes and call API directly
    // This bypasses validation and ensures immediate posting with current time
    if (postNow) {
      // Set loading state
      setIsPostingNow(true)
      
      try {
        // Calculate fresh time at the moment of confirmation
        const now = new Date()
        const futureTime = new Date(now.getTime() + 3 * 60 * 1000) // Current time + 3 minutes
        
        // Format local date as YYYY-MM-DD
        const year = futureTime.getFullYear()
        const month = String(futureTime.getMonth() + 1).padStart(2, '0')
        const day = String(futureTime.getDate()).padStart(2, '0')
        const localDateString = `${year}-${month}-${day}`
        
        // Format local time as HH:mm
        const hours = String(futureTime.getHours()).padStart(2, '0')
        const minutes = String(futureTime.getMinutes()).padStart(2, '0')
        const localTimeString = `${hours}:${minutes}`
        
        // Create local date-time from calculated date and time
        const formattedTime = `${localTimeString}:00`
        const localDateTime = `${localDateString}T${formattedTime}`
        const localDate = new Date(localDateTime)
        
        // Convert to UTC ISO string
        const utcTime = localDate.toISOString()
        const utcDate = utcTime.split('T')[0] // YYYY-MM-DD format
        const timeOnly = utcTime.split('T')[1].split('.')[0]
        
        // Prepare request body with calculated UTC time
        const requestBody = {
          accountIds: selectedAccountIds,
          name: video?.title || '',
          videoUrl: video?.videoUrl || video?.url || '',
          date: utcDate,
          time: timeOnly,
          caption: 'Caption',
          userId: userId,
          selectedAccounts: selectedAccounts.filter(account => selectedAccountIds.includes(account.id)),
          instagram_caption: accountCaptions[selectedAccounts.find(acc => acc.type === 'instagram.api')?.id || 0] || video?.socialMediaCaptions?.instagram_caption || '',
          facebook_caption: accountCaptions[selectedAccounts.find(acc => acc.type === 'facebook.page')?.id || 0] || video?.socialMediaCaptions?.facebook_caption || '',
          linkedin_caption: accountCaptions[selectedAccounts.find(acc => acc.type === 'linkedin.profile')?.id || 0] || video?.socialMediaCaptions?.linkedin_caption || '',
          twitter_caption: accountCaptions[selectedAccounts.find(acc => acc.type === 'twitter.profile')?.id || 0] || video?.socialMediaCaptions?.twitter_caption || '',
          tiktok_caption: accountCaptions[selectedAccounts.find(acc => acc.type === 'tiktok.profile')?.id || 0] || video?.socialMediaCaptions?.tiktok_caption || '',
          youtube_caption: accountCaptions[selectedAccounts.find(acc => acc.type === 'google.youtube')?.id || 0] || video?.socialMediaCaptions?.youtube_caption || ''
        }
        
        // Call API directly, bypassing validation
        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SOCIALBU.MEDIA_CREATE_POST), {
          method: 'POST',
          headers: getAuthenticatedHeaders(),
          body: JSON.stringify(requestBody)
        })
        
        const responseData = await response.json()
        
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
          
          // Call the original onPost callback
          const selectedAccountsForPost = selectedAccounts.filter(account => 
            selectedAccountIds.includes(account.id)
          )
          const postData = {
            date: localDateString,
            time: localTimeString,
            caption: '',
            accounts: selectedAccountsForPost,
            video
          }
          onPost(postData)
          
          // Close modal
          handleClose()
        } else {
          // Handle API error
          const errorMessage = responseData.error || responseData.message || 'Failed to create post'
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
        if ((window as any).showNotification) {
          (window as any).showNotification({
            type: 'error',
            title: 'Network Error',
            message: errorMessage,
            duration: 8000
          })
        }
      } finally {
        // Always reset loading state
        setIsPostingNow(false)
      }
    } else {
      // MANUAL MODE - Original logic preserved exactly as before
      // Uses the hook's handleSubmit which includes all validation, time conversion, etc.
      // This flow is completely unchanged from the original implementation
      const syntheticEvent = {
        preventDefault: () => {}
      } as React.FormEvent
      handleSubmit(syntheticEvent)
    }
  }

  const handleCancelPost = () => {
    setIsConfirmModalOpen(false)
  }

  // Helper function to calculate and set current time + 3 minutes
  const calculateAndSetPostNowTime = useCallback(() => {
    // Get current local time
    const now = new Date()
    const futureTime = new Date(now.getTime() + 3 * 60 * 1000) // Add 3 minutes
    
    // Format local date as YYYY-MM-DD
    const year = futureTime.getFullYear()
    const month = String(futureTime.getMonth() + 1).padStart(2, '0')
    const day = String(futureTime.getDate()).padStart(2, '0')
    const localDateString = `${year}-${month}-${day}`
    
    // Format local time as HH:mm
    const hours = String(futureTime.getHours()).padStart(2, '0')
    const minutes = String(futureTime.getMinutes()).padStart(2, '0')
    const localTimeString = `${hours}:${minutes}`
    
    // Set the date and time (will be converted to UTC in handleSubmit)
    setDate(localDateString)
    setTime(localTimeString)
  }, [setDate, setTime])

  // Handle "Post now!" toggle
  const handlePostNowToggle = useCallback((enabled: boolean) => {
    setPostNow(enabled)
    
    // When toggled ON, set initial date/time for validation
    // This ensures validation passes, but we'll recalculate fresh time on Post click
    if (enabled) {
      calculateAndSetPostNowTime()
    }
  }, [calculateAndSetPostNowTime])

  // Reset postNow when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPostNow(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[600px] h-full overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-black">Create Post</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>
        <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
          {/* Post Now Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <span className="text-sm font-bold text-gray-700">Post now!</span>
            </label>
            <button
              type="button"
              onClick={() => handlePostNowToggle(!postNow)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:ring-offset-2 ${
                postNow ? 'bg-[#5046E5]' : 'bg-gray-300'
              }`}
              disabled={isSubmitting}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                  postNow ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Date and Time inputs - hidden when Post now! is enabled */}
          {!postNow && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  value={date}
                  onChange={setDate}
                  placeholder="Select Date"
                  disabled={isSubmitting}
                  minDate={minDate}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time <span className="text-red-500">*</span>
                </label>
                <div>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    onClick={(e) => e.currentTarget.showPicker && e.currentTarget.showPicker()}
                    min={date === minDate ? minTime : undefined}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border-none rounded-md focus:outline-none focus:ring-2 focus:ring-[#5046E5] bg-[#EEEEEE] text-black disabled:opacity-50 disabled:cursor-not-allowed text-md"
                    placeholder="Select Time"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Time Adjustment Message */}
          {!postNow && timeAdjustmentMessage && (
            <div className="w-full max-w-md p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0 mt-0.5"></div>
                <p className="text-sm text-blue-700">{timeAdjustmentMessage}</p>
              </div>
            </div>
          )}
          <AccountSelection
            selectedAccounts={selectedAccounts}
            selectedAccountIds={matchedSelectedAccounts?.map(account => account.id) || selectedAccountIds}
            isSubmitting={isSubmitting}
            onAccountToggle={handleAccountToggle}
            accountCaptions={accountCaptions}
            onCaptionUpdate={handleCaptionUpdate}
          />
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
          {/* Only show validation errors when postNow is disabled */}
          {!postNow && validationErrors.length > 0 && (
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
          <button
            type="submit"
            disabled={(isSubmitting || isPostingNow) || selectedAccountIds.length === 0 || (!postNow && validationErrors.length > 0)}
            className="w-full bg-[#5046E5] text-white py-3 px-6 rounded-full font-semibold text-lg hover:bg-[#4338CA] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {(isSubmitting || isPostingNow) ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                {postNow ? 'Posting...' : 'Scheduling...'}
              </>
            ) : (!postNow && validationErrors.length > 0) ? (
              'Continue'
            ) : (
              'Post'
            )}
          </button>
        </form>
      </div>

      <PostConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={handleCancelPost}
        onConfirm={handleConfirmPost}
        isSubmitting={isSubmitting}
        selectedAccountsCount={matchedSelectedAccounts?.length || selectedAccountIds.length}
        videoTitle={video?.title}
        date={date}
        time={time}
        postNow={postNow}
      />
    </div>
  )
}
