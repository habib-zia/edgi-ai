'use client'

import { useState, useMemo, useEffect } from 'react'
import CreateVideoModal from './create-video-modal'
import { IoMdArrowDropdown } from "react-icons/io";
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

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
  const [stats, setStats] = useState({
    totalCount: 0,
    readyCount: 0,
    processingCount: 0,
    failedCount: 0
  })

  // Get access token from Redux store
  const accessToken = useSelector((state: RootState) => state.user.accessToken)

  // Fetch videos from API
  const fetchVideos = async () => {
    if (!accessToken) {
      setError('Authentication required')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/auth/video/gallery', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch videos')
      }

      if (result.success) {
        setVideos(result.data.videos)
        setStats({
          totalCount: result.data.totalCount,
          readyCount: result.data.readyCount,
          processingCount: result.data.processingCount,
          failedCount: result.data.failedCount
        })
      } else {
        throw new Error(result.message || 'Failed to fetch videos')
      }
    } catch (err: any) {
      console.error('Error fetching videos:', err)
      setError(err.message || 'Failed to fetch videos')
    } finally {
      setLoading(false)
    }
  }

  // Fetch videos on component mount and when access token changes
  useEffect(() => {
    fetchVideos()
  }, [accessToken])

  const handleViewVideo = (video: VideoCard) => {
    console.log('Video data for viewing:', {
      status: video.status,
      downloadUrl: video.downloadUrl,
      title: video.title,
      videoId: video.videoId
    })

    if (video.status !== 'ready') {
      console.log('Video not ready for viewing - status:', video.status)
      return
    }

    if (!video.downloadUrl) {
      console.log('Video not ready for viewing - no download URL')
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
    // Filter by search query
    const filtered = videos.filter(video =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Sort by creation date
    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      
      if (sortOrder === 'newest') {
        return dateB - dateA // Newest first
      } else {
        return dateA - dateB // Oldest first
      }
    })
  }, [videos, searchQuery, sortOrder])

  const handleSortChange = (newSortOrder: SortOrder) => {
    setSortOrder(newSortOrder)
    setIsSortDropdownOpen(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'text-green-600'
      case 'processing':
        return 'text-yellow-600'
      case 'failed':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Invalid Date'
      }
      return date.toLocaleDateString()
    } catch {
      return 'Invalid Date'
    }
  }

  if (loading) {
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

  if (error) {
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
            <path d="M9.5 16C7.68333 16 6.146 15.3707 4.888 14.112C3.63 12.8533 3.00067 11.316 3 9.5C2.99933 7.684 3.62867 6.14667 4.888 4.888C6.14733 3.62933 7.68467 3 9.5 3C11.3153 3 12.853 3.62933 14.113 4.888C15.373 6.14667 16.002 7.684 16 9.5C16 10.2333 15.8833 10.925 15.65 11.575C15.4167 12.225 15.1 12.8 14.7 13.3L20.3 18.9C20.4833 19.0833 20.575 19.3167 20.575 19.6C20.575 19.8833 20.4833 20.1167 20.3 20.3C20.1167 20.4833 19.8833 20.575 19.6 20.575C19.3167 20.575 19.0833 20.4833 18.9 20.3L13.3 14.7C12.8 15.1 12.225 15.4167 11.575 15.65C10.925 15.8833 10.2333 16 9.5 16ZM9.5 14C10.75 14 11.8127 13.5627 12.688 12.688C13.5633 11.8133 14.0007 10.7507 14 9.5C13.9993 8.24933 13.562 7.187 12.688 6.313C11.814 5.439 10.7513 5.00133 9.5 5C8.24867 4.99867 7.18633 5.43633 6.313 6.313C5.43967 7.18967 5.002 8.252 5 9.5C4.998 10.748 5.43567 11.8107 6.313 12.688C7.19033 13.5653 8.25267 14.0027 9.5 14Z" fill="#5F5F5F"/>
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
          {/* <button
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
          </button> */}

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
                className={`w-full px-4 py-3 text-left cursor-pointer hover:bg-[#F5F5F5] transition-colors duration-200 rounded-t-[8px] text-[18px] font-semibold ${
                  sortOrder === 'newest' ? 'bg-[#F5F5F5] text-[#5046E5]' : 'text-[#282828]'
                }`}
              >
                Newest
              </button>
              <button
                type="button"
                onClick={() => handleSortChange('oldest')}
                className={`w-full px-4 py-3 cursor-pointer text-left hover:bg-[#F5F5F5] transition-colors duration-200 rounded-b-[8px] text-[18px] font-semibold ${
                  sortOrder === 'oldest' ? 'bg-[#F5F5F5] text-[#5046E5]' : 'text-[#282828]'
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
              <h3 className="text-[18px] font-medium text-[#171717] my-3 line-clamp-2">
                {video.title}
              </h3>

              {/* View Video Button */}
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
