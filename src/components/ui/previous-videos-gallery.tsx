'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import CreateVideoModal from './create-video-modal'
import { IoMdArrowDropdown } from "react-icons/io";
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { apiService } from '@/lib/api-service';
import { VideoRequest, updateVideoStatus } from '@/store/slices/videoSlice';
import { usePhotoAvatarNotificationContext } from '@/components/providers/PhotoAvatarNotificationProvider';
import Link from 'next/link';

type SortOrder = 'newest' | 'oldest'

type VideoCard = {
  id: string
  videoId: string
  title: string
  status: 'processing' | 'ready' | 'failed'
  createdAt: string
  updatedAt: string
  downloadUrl?: string | null
  metadata?: {
    duration?: number
    size?: number
    format?: string
  }
  error?: string
}

interface PreviousVideosGalleryProps {
  className?: string
}

export default function PreviousVideosGallery({ className }: PreviousVideosGalleryProps) {
  const dispatch = useDispatch<AppDispatch>()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedVideoForCreation, setSelectedVideoForCreation] = useState<string>('')
  const [selectedVideoData, setSelectedVideoData] = useState<{ title: string; youtubeUrl: string; thumbnail: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false)

  // State for API data
  const [videos, setVideos] = useState<VideoCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Processing card state
  const [processingVideo, setProcessingVideo] = useState<VideoRequest | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [progressStatus, setProgressStatus] = useState<'processing' | 'completed' | 'error'>('processing')
  const [socketResponse, setSocketResponse] = useState<any>(null)

  // Get access token and video state from Redux store
  const accessToken = useSelector((state: RootState) => state.user.accessToken)
  const { currentVideo } = useSelector((state: RootState) => state.video)
  
  // Get video notifications from notification context
  const { latestVideoNotification } = usePhotoAvatarNotificationContext()

  // localStorage functions
  const saveProgressToStorage = (video: VideoRequest, timeRemaining: number, status: 'processing' | 'completed' | 'error') => {
    const progressData = {
      video,
      timeRemaining,
      status,
      timestamp: Date.now()
    }
    localStorage.setItem('videoProgress', JSON.stringify(progressData))
  }

  const loadProgressFromStorage = () => {
    try {
      const stored = localStorage.getItem('videoProgress')
      if (stored) {
        const progressData = JSON.parse(stored)
        // Check if progress is not older than 20 minutes (1200 seconds)
        if (Date.now() - progressData.timestamp < 20 * 60 * 1000) {
          return progressData
        } else {
          // Clear old progress
          localStorage.removeItem('videoProgress')
        }
      }
    } catch (error) {
      console.error('Error loading progress from storage:', error)
      localStorage.removeItem('videoProgress')
    }
    return null
  }

  const clearProgressFromStorage = () => {
    localStorage.removeItem('videoProgress')
  }

  // Check if video generation was started via localStorage key
  const checkVideoGenerationStarted = () => {
    try {
      const stored = localStorage.getItem('videoGenerationStarted')
      if (stored) {
        const data = JSON.parse(stored)
        // Check if the key is not older than 20 minutes
        if (Date.now() - data.timestamp < 20 * 60 * 1000) {
          return data
        } else {
          // Clear old key
          localStorage.removeItem('videoGenerationStarted')
        }
      }
    } catch (error) {
      console.error('Error checking video generation key:', error)
      localStorage.removeItem('videoGenerationStarted')
    }
    return null
  }

  // Clear localStorage immediately if no current video (component initialization)
  if (!currentVideo) {
    clearProgressFromStorage()
    // Also clear the video generation started key if no current video
    localStorage.removeItem('videoGenerationStarted')
    console.log('🧹 Component init: Cleared all localStorage keys - no current video')
  }

  // Fetch videos from API
  const fetchVideos = useCallback(async () => {
    if (!accessToken)
    {
      setError('Authentication required')
      setLoading(false)
      return
    }

    try
    {
      setLoading(true)
      setError(null)

      const result = await apiService.getVideoGallery()

      if (result.success && result.data)
      {
        setVideos(result.data.videos)
      } else
      {
        throw new Error(result.message || 'Failed to fetch videos')
      }
    } catch (err: any)
    {
      const errorMessage = err.message || 'Failed to fetch videos'
      setError(errorMessage)
    } finally
    {
      setLoading(false)
    }
  }, [accessToken])

  // Clear videoGenerationStarted key on every component mount (safety net)
  useEffect(() => {
    // Always clear the key on component mount as a safety net
    // It will be set again if a new video generation actually starts
    localStorage.removeItem('videoGenerationStarted')
    clearProgressFromStorage()
    
    // Also clear any processing state to prevent skeleton from showing
    setProcessingVideo(null)
    setTimeRemaining(0)
    setProgressStatus('processing')
    
    console.log('🧹 Safety net: Cleared all localStorage keys and state on component mount')
  }, []) // Run only on mount

  // Clear localStorage immediately on component mount if no current video
  useEffect(() => {
    if (!currentVideo) {
      clearProgressFromStorage()
      localStorage.removeItem('videoGenerationStarted')
      console.log('🧹 Component mount: Cleared all localStorage keys - no current video')
    }
  }, [currentVideo]) // Include currentVideo dependency

  // Load progress from localStorage on component mount
  useEffect(() => {
    // First, clear localStorage if no current video
    if (!currentVideo) {
      clearProgressFromStorage()
      localStorage.removeItem('videoGenerationStarted')
      console.log('🧹 Cleared all localStorage keys - no current video on mount')
      return
    }

    const storedProgress = loadProgressFromStorage()
    if (storedProgress) {
      // Only load from localStorage if:
      // 1. We have a current video that is actually processing
      // 2. The stored progress matches the current video
      // 3. Status is 'processing' (not error or completed)
      if (currentVideo && 
          (currentVideo.status === 'pending' || currentVideo.status === 'processing') &&
          storedProgress.status === 'processing' &&
          storedProgress.video.requestId === currentVideo.requestId) {
        setProcessingVideo(storedProgress.video)
        setTimeRemaining(storedProgress.timeRemaining)
        setProgressStatus(storedProgress.status)
        console.log('📦 Loaded progress from localStorage:', storedProgress)
      } else {
        // Clear localStorage if conditions don't match
        console.log('🧹 Clearing localStorage - conditions not met for loading')
        clearProgressFromStorage()
      }
    }
  }, [currentVideo]) // Include currentVideo dependency

  // Fetch videos on component mount and when access token changes
  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

  // Handle processing video from Redux store
  useEffect(() => {
    // Check if video generation was started via localStorage key
    const generationStarted = checkVideoGenerationStarted()
    
    if (currentVideo && (currentVideo.status === 'pending' || currentVideo.status === 'processing')) {
      setProcessingVideo(currentVideo)
      setTimeRemaining(900) // 15 minutes
      setProgressStatus('processing')
      saveProgressToStorage(currentVideo, 900, 'processing')
      console.log('🎬 Video processing started:', currentVideo)
    } else if (generationStarted && !currentVideo) {
      // Only show skeleton if generation was started very recently (within 10 seconds)
      // This prevents showing skeleton when navigating back to the page after an error
      const timeSinceGeneration = Date.now() - generationStarted.timestamp
      if (timeSinceGeneration < 10000) { // 10 seconds - much shorter window
        // Show skeleton if generation was started but no current video yet
        // Create a temporary video object for the skeleton
        const tempVideo: VideoRequest = {
          requestId: `temp-${Date.now()}`,
          prompt: '',
          avatar: '',
          name: '',
          position: '',
          companyName: '',
          license: '',
          tailoredFit: '',
          socialHandles: '',
          videoTopic: generationStarted.videoTitle,
          topicKeyPoints: '',
          city: '',
          preferredTone: '',
          callToAction: '',
          email: '',
          timestamp: new Date().toISOString(),
          status: 'processing',
          webhookResponse: undefined,
          videoUrl: undefined
        }
        setProcessingVideo(tempVideo)
        setTimeRemaining(900) // 15 minutes
        setProgressStatus('processing')
        saveProgressToStorage(tempVideo, 900, 'processing')
        console.log('🎬 Showing skeleton - video generation started but no current video yet')
      } else {
        // Clear old generation key if it's been too long
        localStorage.removeItem('videoGenerationStarted')
        console.log('🧹 Cleared old videoGenerationStarted key - too old')
        setProcessingVideo(null)
        setTimeRemaining(0)
        setProgressStatus('processing')
        clearProgressFromStorage()
      }
    } else {
      setProcessingVideo(null)
      setTimeRemaining(0)
      setProgressStatus('completed')
      // Clear localStorage when no current video and no generation started
      clearProgressFromStorage()
      // Also clear the videoGenerationStarted key to prevent skeleton from showing
      localStorage.removeItem('videoGenerationStarted')
      console.log('🧹 Cleared localStorage - no current video processing')
    }
  }, [currentVideo])

  // Calculate progress percentage (0-100)
  const getProgressPercentage = useCallback((seconds: number): number => {
    const totalSeconds = 900 // 15 minutes
    const percentage = Math.max(0, Math.min(100, ((totalSeconds - seconds) / totalSeconds) * 100))
    
    // If we have a socket response and status is completed, show 100%
    if (socketResponse && progressStatus === 'completed') {
      return 100
    }
    
    // If we have an error, show current progress
    if (progressStatus === 'error') {
      return percentage
    }
    
    // If progress reaches 99% and no socket response, cap at 99%
    if (percentage >= 99 && !socketResponse && progressStatus === 'processing') {
      return 99
    }
    
    return percentage
  }, [socketResponse, progressStatus])

  // Countdown timer for processing video
  useEffect(() => {
    if (processingVideo && timeRemaining > 0 && progressStatus === 'processing') {
      const timer = setTimeout(() => {
        const newTimeRemaining = timeRemaining - 1
        setTimeRemaining(newTimeRemaining)
        
        // Only save progress to localStorage if status is 'processing' (not error)
        if (progressStatus === 'processing') {
          saveProgressToStorage(processingVideo, newTimeRemaining, progressStatus)
        }
        
        // If progress reaches 99% and no socket response, stop at 99%
        const progressPercentage = getProgressPercentage(newTimeRemaining)
        if (progressPercentage >= 99 && !socketResponse) {
          console.log('⏸️ Progress reached 99%, waiting for socket response...')
          return // Don't continue countdown
        }
      }, 1000)
      return () => clearTimeout(timer)
    } else if (processingVideo && timeRemaining === 0 && progressStatus === 'processing') {
      // Timeout reached without socket response
      setProgressStatus('error')
      setSocketResponse({ error: 'Processing timeout' })
      clearProgressFromStorage()
    }
  }, [processingVideo, timeRemaining, progressStatus, socketResponse, getProgressPercentage])

  // Handle video completion from socket or API updates
  useEffect(() => {
    if (currentVideo && (currentVideo.status === 'completed' || currentVideo.status === 'failed')) {
      // Video is done processing - remove from processing state and refresh the gallery
      setProcessingVideo(null)
      setTimeRemaining(0)
      
      // Refresh the video gallery to show the new video
      fetchVideos()
    }
  }, [currentVideo, fetchVideos])

  // Handle video completion from socket notifications
  useEffect(() => {
    // Debug: Log all notifications
    if (latestVideoNotification) {
      console.log('🔔 Latest video notification received in gallery:', latestVideoNotification)
      console.log('📊 Notification type:', latestVideoNotification.type)
      console.log('📊 Notification status:', latestVideoNotification.status)
      console.log('📊 Processing video exists:', !!processingVideo)
      console.log('📊 Current video exists:', !!currentVideo)
    }

    // Check if we have a processing video and a new video notification
    if (!processingVideo || !currentVideo || !latestVideoNotification) {
      return
    }
    
        // Handle success response
        if (latestVideoNotification.step === 'complete' && 
            latestVideoNotification.status === 'success' && 
            latestVideoNotification.data?.message?.includes('Video downloaded and uploaded successfully')) {
          
          console.log('✅ Video completion detected, updating status...')
          setSocketResponse(latestVideoNotification)
          setProgressStatus('completed')
          
          // Clear the video generation started key
          localStorage.removeItem('videoGenerationStarted')
          console.log('🧹 Cleared videoGenerationStarted key on success')
      
      // If progress is less than 100%, quickly complete it
      const currentProgress = getProgressPercentage(timeRemaining)
      if (currentProgress < 100) {
        // Quickly animate to 100%
        setTimeRemaining(0)
        setTimeout(() => {
          // Update the video status in Redux
          dispatch(updateVideoStatus({
            requestId: currentVideo.requestId,
            status: 'completed',
            videoUrl: latestVideoNotification.data?.videoId,
            webhookResponse: latestVideoNotification
          }))
        
          // Remove processing state
          setProcessingVideo(null)
          setTimeRemaining(0)
          setProgressStatus('completed')
          setSocketResponse(null)
          clearProgressFromStorage()
        
          // Refresh the gallery to show the new video
          setTimeout(() => {
            fetchVideos()
          }, 1000)
        }, 500) // Quick completion animation
      } else {
        // Already at 100%, complete immediately
        dispatch(updateVideoStatus({
          requestId: currentVideo.requestId,
          status: 'completed',
          videoUrl: latestVideoNotification.data?.videoId,
          webhookResponse: latestVideoNotification
        }))
      
        setProcessingVideo(null)
        setTimeRemaining(0)
        setProgressStatus('completed')
        setSocketResponse(null)
        clearProgressFromStorage()
      
        setTimeout(() => {
          fetchVideos()
        }, 1000)
      }
    }
    
    // Handle error response
    if (latestVideoNotification.status === 'error' || latestVideoNotification.type === 'error') {
      console.log('❌ Video processing error detected:', latestVideoNotification)
      setSocketResponse(latestVideoNotification)
      setProgressStatus('error')
      clearProgressFromStorage()
      
      // Clear the video generation started key
      localStorage.removeItem('videoGenerationStarted')
      console.log('🧹 Cleared videoGenerationStarted key on error')
      
    }
  }, [latestVideoNotification, processingVideo, currentVideo, dispatch, fetchVideos, timeRemaining, getProgressPercentage])

  // Handle error notifications even without processing video
  useEffect(() => {
    if (latestVideoNotification && (latestVideoNotification.status === 'error' || latestVideoNotification.type === 'error')) {
      console.log('❌ Error notification received (standalone):', latestVideoNotification)
      
      // If we have a processing video, update its status
      if (processingVideo) {
        setSocketResponse(latestVideoNotification)
        setProgressStatus('error')
        clearProgressFromStorage()
      }
      
      // Clear the video generation started key on any error
      localStorage.removeItem('videoGenerationStarted')
      console.log('🧹 Cleared videoGenerationStarted key on standalone error')
      
      // Also clear any processing state to prevent skeleton from showing
      setProcessingVideo(null)
      setTimeRemaining(0)
      setProgressStatus('completed')
      
    }
  }, [latestVideoNotification, processingVideo])

  // Handle completion animation when socket response is received
  useEffect(() => {
    if (socketResponse && progressStatus === 'completed') {
      // Animate to 100% and then disappear
      const currentProgress = getProgressPercentage(timeRemaining)
      if (currentProgress < 100) {
        // Quickly complete the progress bar
        setTimeRemaining(0)
        setTimeout(() => {
          // Complete the process
          setProcessingVideo(null)
          setTimeRemaining(0)
          setProgressStatus('completed')
          setSocketResponse(null)
          clearProgressFromStorage()
          
          // Clear the video generation started key
          localStorage.removeItem('videoGenerationStarted')
          console.log('🧹 Cleared videoGenerationStarted key on completion animation')
          
          // Refresh gallery
          setTimeout(() => {
            fetchVideos()
          }, 1000)
        }, 1000) // 1 second to show 100% completion
      }
    }
  }, [socketResponse, progressStatus, timeRemaining, fetchVideos, getProgressPercentage])

  // Clear localStorage when component unmounts
  useEffect(() => {
    return () => {
      // Always clear localStorage on component unmount to prevent stale state
      clearProgressFromStorage()
      localStorage.removeItem('videoGenerationStarted')
      console.log('🧹 Component unmount: Cleared all localStorage keys')
    }
  }, [])

  // Clear localStorage immediately when error occurs
  useEffect(() => {
    if (progressStatus === 'error') {
      clearProgressFromStorage()
      localStorage.removeItem('videoGenerationStarted')
      console.log('🧹 Cleared localStorage and videoGenerationStarted key due to error state')
    }
  }, [progressStatus])

  const handleViewVideo = (video: VideoCard) => {
    if (video.status !== 'ready')
    {
      return
    }

    if (!video.downloadUrl)
    {
      return
    }

    // console.log('Opening video in modal:', video.downloadUrl)

    setSelectedVideoForCreation(video.title)
    setSelectedVideoData({
      title: video.title,
      youtubeUrl: video.downloadUrl, // Use the S3 download URL
      thumbnail: '' // No thumbnail needed
    })
    setIsCreateModalOpen(true)
  }

  // Filter and sort videos based on search query and sort order
  const filteredAndSortedVideos = useMemo(() => {
    // Start with regular videos
    const allVideos = [...videos]

    // Add processing video if it exists and matches search query
    if (processingVideo) {
      const processingVideoCard: VideoCard = {
        id: `processing-${processingVideo.requestId}`,
        videoId: processingVideo.requestId,
        title: processingVideo.videoTopic || 'Processing Video...',
        status: 'processing',
        createdAt: processingVideo.timestamp,
        updatedAt: processingVideo.timestamp,
        downloadUrl: null,
        metadata: {
          duration: 0,
          size: 0,
          format: 'processing'
        }
      }

      // Add processing video at the beginning (newest position)
      allVideos.unshift(processingVideoCard)
    }

    // Filter by search query
    const filtered = allVideos.filter(video =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Sort by creation date
    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()

      if (sortOrder === 'newest')
      {
        return dateB - dateA // Newest first
      } else
      {
        return dateA - dateB // Oldest first
      }
    })
  }, [videos, processingVideo, searchQuery, sortOrder])

  const handleSortChange = (newSortOrder: SortOrder) => {
    setSortOrder(newSortOrder)
    setIsSortDropdownOpen(false)
  }


  const getStatusText = (status: string) => {
    switch (status)
    {
      case 'ready':
        return 'Ready'
      case 'processing':
        return 'Processing'
      case 'failed':
        return 'Failed'
      default:
        return 'Unknown'
    }
  }


  if (loading)
  {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5046E5] mx-auto mb-4"></div>
            <p className="text-gray-500 text-lg">Loading your videos...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error)
  {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-500 text-lg mb-4">{error}</p>
            <button
              onClick={fetchVideos}
              className="bg-[#5046E5] text-white px-6 py-2 rounded-full hover:bg-[#4338CA] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>

      {/* Search, Sort Controls and Create Button */}
      <div className="flex flex-col md:flex-row md:justify-between justify-end gap-4 mb-8">
        {/* Left side: Search Bar */}
        <div className="relative flex-1 md:max-w-[447px] max-w-full">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.5 16C7.68333 16 6.146 15.3707 4.888 14.112C3.63 12.8533 3.00067 11.316 3 9.5C2.99933 7.684 3.62867 6.14667 4.888 4.888C6.14733 3.62933 7.68467 3 9.5 3C11.3153 3 12.853 3.62933 14.113 4.888C15.373 6.14667 16.002 7.684 16 9.5C16 10.2333 15.8833 10.925 15.65 11.575C15.4167 12.225 15.1 12.8 14.7 13.3L20.3 18.9C20.4833 19.0833 20.575 19.3167 20.575 19.6C20.575 19.8833 20.4833 20.1167 20.3 20.3C20.1167 20.4833 19.8833 20.575 19.6 20.575C19.3167 20.575 19.0833 20.4833 18.9 20.3L13.3 14.7C12.8 15.1 12.225 15.4167 11.575 15.65C10.925 15.8833 10.2333 16 9.5 16ZM9.5 14C10.75 14 11.8127 13.5627 12.688 12.688C13.5633 11.8133 14.0007 10.7507 14 9.5C13.9993 8.24933 13.562 7.187 12.688 6.313C11.814 5.439 10.7513 5.00133 9.5 5C8.24867 4.99867 7.18633 5.43633 6.313 6.313C5.43967 7.18967 5.002 8.252 5 9.5C4.998 10.748 5.43567 11.8107 6.313 12.688C7.19033 13.5653 8.25267 14.0027 9.5 14Z" fill="#5F5F5F" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              boxShadow: "0px -1.5px 0px 0px #FFFFFF52 inset, 0px 0.5px 0px 0px #FFFFFF52 inset"
            }}
            className="w-full pr-10 pl-4 py-[7.4px] bg-transparent hover:bg-[#F5F5F5] rounded-[39px] text-[#5F5F5F] placeholder-[#5F5F5F] transition-all duration-300 focus:outline-none focus:ring focus:ring-[#5046E5] focus:bg-white border-2 border-[#5F5F5F] text-[20px] font-semibold"
          />
        </div>

        {/* Right side: Sort Dropdown, Refresh Button and Create Button */}
        <div className="flex gap-4 justify-end">
          {/* Refresh Button */}
          <button
            onClick={fetchVideos}
            disabled={loading}
            className="px-4 py-[7.4px] bg-[#5046E5] text-white rounded-[39px] transition-all duration-300 focus:outline-none focus:ring focus:ring-[#5046E5] flex items-center gap-2 min-w-[120px] justify-center text-[20px] font-semibold hover:bg-[#4338CA] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4V10H4.58152M19.9381 11C19.446 7.05369 16.0796 4 12 4C8.64262 4 5.76829 6.06817 4.58152 9M4.58152 9H10M20 20V14H19.4185M19.4185 14C18.2317 16.9318 15.3574 19 12 19C7.92038 19 4.55399 15.9463 4.06189 12M19.4185 14H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            Refresh
          </button>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              className="px-4 py-[7.4px] bg-transparent cursor-pointer border-2 border-[#5F5F5F] rounded-[39px] text-[#5F5F5F] transition-all duration-300 focus:outline-none focus:ring focus:ring-[#5046E5] focus:bg-white flex items-center gap-2 min-w-[154px] justify-center text-[20px] font-semibold"
              style={{
                boxShadow: "0px -1.5px 0px 0px #FFFFFF52 inset, 0px 0.5px 0px 0px #FFFFFF52 inset"
              }}
            >
              <span>
                {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
              </span>
              <IoMdArrowDropdown
                className={`w-7 h-7 transition-transform text-[#5F5F5F] duration-300 ${isSortDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isSortDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-[8px] shadow-lg">
                <button
                  type="button"
                  onClick={() => handleSortChange('newest')}
                  className={`w-full px-4 py-3 text-left cursor-pointer hover:bg-[#F5F5F5] transition-colors duration-200 rounded-t-[8px] text-[18px] font-semibold ${sortOrder === 'newest' ? 'bg-[#F5F5F5] text-[#5046E5]' : 'text-[#282828]'
                    }`}
                >
                  Newest
                </button>
                <button
                  type="button"
                  onClick={() => handleSortChange('oldest')}
                  className={`w-full px-4 py-3 cursor-pointer text-left hover:bg-[#F5F5F5] transition-colors duration-200 rounded-b-[8px] text-[18px] font-semibold ${sortOrder === 'oldest' ? 'bg-[#F5F5F5] text-[#5046E5]' : 'text-[#282828]'
                    }`}
                >
                  Oldest
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {filteredAndSortedVideos.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchQuery ? 'No videos found matching your search.' : 'No videos available.'}
            </p>
          </div>
        ) : (
          filteredAndSortedVideos.map((video) => (
            <div
              key={video.id}
              className="bg-[#EEEEEE] rounded-[12px] overflow-hidden transition-all duration-300 group min-h-[200px]"
            >
              {/* Video Player Container */}
              <div className="relative aspect-video max-h-[200px] w-full bg-[#EEEEEE] px-3 pt-3 rounded-[8px]">
                {/* Video Player */}
                {video.status === 'ready' && video.downloadUrl ? (
                  <video
                    src={video.downloadUrl}
                    className="w-full h-[200px] object-cover rounded-[6px]"
                    preload="metadata"
                    poster=""
                    onError={(e) => console.error('Video load error:', e)}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : video.id.startsWith('processing-') ? (
                  /* Professional Processing Video Card with Advanced Skeleton */
                  <div className="w-full h-[200px] bg-gradient-to-br from-slate-50 to-gray-100 rounded-[6px] relative overflow-hidden border border-gray-200/50">
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 opacity-30">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent animate-pulse"></div>
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-purple-500/5 to-transparent"></div>
                    </div>
                    
                    {/* Main Content Container */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                      
                      {/* Processing Text with Typing Animation */}
                      <div className="text-center mb-4">
                        {progressStatus === 'error' ? (
                          /* Error State */
                          <div>
                            <div className="text-sm font-semibold text-red-600 mb-2">
                              Processing Failed
                            </div>
                            <div className="text-xs text-red-500 max-w-48 mx-auto">
                              {socketResponse?.message || socketResponse?.data?.message || 'Video creation failed. Please try again or contact support if the issue persists.'}
                            </div>
                            <Link href="/create-video/new" className="text-xs text-blue-500">Try Again</Link>
                          </div>
                        ) : progressStatus === 'completed' ? (
                          /* Completed State */
                          <div>
                            <div className="text-sm font-semibold text-green-600 mb-2">
                              Video Completed!
                            </div>
                            <div className="text-xs text-green-500">
                              Your video is ready to view.
                            </div>
                          </div>
                        ) : (
                          /* Processing State */
                          <div>
                            <div className="text-sm font-semibold text-gray-700 mb-2">
                              <span className="inline-block animate-pulse">Processing</span>
                              <span className="inline-block animate-bounce ml-1">.</span>
                              <span className="inline-block animate-bounce ml-0.5" style={{ animationDelay: '0.1s' }}>.</span>
                              <span className="inline-block animate-bounce ml-0.5" style={{ animationDelay: '0.2s' }}>.</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              It usually takes 10–15 minutes to generate a video.
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Spinner - Hide on error */}
                      {progressStatus !== 'error' && (
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5046E5]"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-[200px] bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center rounded-[6px]">
                    <div className="text-center">
                      <div className="text-gray-400 text-sm mb-2">
                        {video.status === 'processing' ? 'Processing...' :
                          video.status === 'failed' ? 'Failed to load' :
                            video.status === 'ready' && !video.downloadUrl ? 'No download URL' : 'Video not ready'}
                      </div>
                      {video.status === 'processing' && (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#5046E5] mx-auto"></div>
                      )}
                      {video.status === 'ready' && !video.downloadUrl && (
                        <div className="text-red-400 text-xs">Missing download URL</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Video Title */}
                {video.id.startsWith('processing-') ? (
                  /* Professional Skeleton Title */
                  <div className="my-3">
                    <div className="w-3/4 h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse mb-2 shadow-sm"></div>
                    <div className="w-1/2 h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse shadow-sm"></div>
                  </div>
                ) : (
                  /* Regular Title */
                <h3 className="text-[18px] font-medium text-[#171717] my-3 line-clamp-2">
                  {video.title}
                </h3>
                )}

                {/* View Video Button or Skeleton */}
                {video.id.startsWith('processing-') ? (
                  /* Professional Skeleton Button */
                  <div className="w-full py-[3px] px-4 rounded-full">
                    <div className="w-full h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse shadow-sm border border-gray-200/50"></div>
                  </div>
                ) : (
                  /* Regular Button */
                <button
                  onClick={() => handleViewVideo(video)}
                  disabled={video.status !== 'ready'}
                    className={`w-full py-[3px] px-4 rounded-full font-semibold text-[16px] transition-colors duration-300 flex items-center justify-center gap-2 group/btn cursor-pointer ${
                      video.status === 'ready'
                    ? 'bg-[#5046E5] text-white hover:bg-transparent hover:text-[#5046E5] border-2 border-[#5046E5]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed border-2 border-gray-300'
                    }`}
                >
                  {video.status === 'ready' ? 'View Video' : getStatusText(video.status)}
                </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Click outside to close dropdown */}
      {isSortDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsSortDropdownOpen(false)}
        />
      )}

      {/* Create Video Modal */}
      <CreateVideoModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        videoTitle={selectedVideoForCreation}
        startAtComplete={true}
        videoData={selectedVideoData}
      />
    </div>
  )
}
