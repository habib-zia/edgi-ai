'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import CreateVideoModal from './create-video-modal'
import { IoMdArrowDropdown } from "react-icons/io";

// Mock data for video cards with YouTube URLs and creation dates
const videoCards = [
  {
    id: 1,
    title: 'Property Listing Video',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    title: 'Neighborhood Tour',
    youtubeUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
    thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/hqdefault.jpg',
    createdAt: '2024-01-20',
  },
  {
    id: 3,
    title: 'Agent Introduction',
    youtubeUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/hqdefault.jpg',
    createdAt: '2024-01-10',
  },
  {
    id: 4,
    title: 'Video Production Guide',
    youtubeUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
    createdAt: '2024-01-25',
  },
  {
    id: 5,
    title: 'Property Showcase',
    youtubeUrl: 'https://www.youtube.com/watch?v=ZZ5LpwO-An4',
    thumbnail: 'https://img.youtube.com/vi/ZZ5LpwO-An4/hqdefault.jpg',
    createdAt: '2024-01-05',
  },
  {
    id: 6,
    title: 'Mobile App Demo',
    youtubeUrl: 'https://www.youtube.com/watch?v=YQHsXMglC9A',
    thumbnail: 'https://img.youtube.com/vi/YQHsXMglC9A/hqdefault.jpg',
    createdAt: '2024-01-30',
  },
  {
    id: 7,
    title: 'Sold Property Highlight',
    youtubeUrl: 'https://www.youtube.com/watch?v=JGwWNGJdvx8',
    thumbnail: 'https://img.youtube.com/vi/JGwWNGJdvx8/hqdefault.jpg',
    createdAt: '2024-01-12',
  },
  {
    id: 8,
    title: 'Digital Marketing',
    youtubeUrl: 'https://www.youtube.com/watch?v=OPf0YbXqDm0',
    thumbnail: 'https://img.youtube.com/vi/OPf0YbXqDm0/hqdefault.jpg',
    createdAt: '2024-01-18',
  },
  {
    id: 9,
    title: 'Client Testimonial',
    youtubeUrl: 'https://www.youtube.com/watch?v=U9t-slLl30E',
    thumbnail: 'https://img.youtube.com/vi/U9t-slLl30E/hqdefault.jpg',
    createdAt: '2024-01-22',
  }
]

type SortOrder = 'newest' | 'oldest'

type VideoCard = {
  id: number
  title: string
  youtubeUrl: string
  thumbnail: string
  createdAt: string
}

interface PreviousVideosGalleryProps {
  className?: string
}

export default function PreviousVideosGallery({ className }: PreviousVideosGalleryProps) {
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedVideoForCreation, setSelectedVideoForCreation] = useState<string>('')
  const [selectedVideoData, setSelectedVideoData] = useState<{ title: string; youtubeUrl: string; thumbnail: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false)

  const handleViewVideo = (video: VideoCard) => {
    setSelectedVideoForCreation(video.title)
    setSelectedVideoData({
      title: video.title,
      youtubeUrl: video.youtubeUrl,
      thumbnail: video.thumbnail
    })
    setIsCreateModalOpen(true)
  }

  const handleImageError = (videoId: number) => {
    setImageErrors(prev => new Set(prev).add(videoId))
  }

  // Filter and sort videos based on search query and sort order
  const filteredAndSortedVideos = useMemo(() => {
    // Filter by search query
    const filtered = videoCards.filter(video =>
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
  }, [searchQuery, sortOrder])

  const handleSortChange = (newSortOrder: SortOrder) => {
    setSortOrder(newSortOrder)
    setIsSortDropdownOpen(false)
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

        {/* Right side: Sort Dropdown and Create Button */}
        <div className="flex gap-4 justify-end">
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
            className="bg-[#EEEEEE] rounded-[12px] overflow-hidden transition-all duration-300 group min-h-[275px]"
          >
            {/* Thumbnail Container */}
             <div className="relative aspect-video max-h-[165px] w-full bg-[#EEEEEE] overflow-visible px-3 pt-3 rounded-[8px]">              
               {/* YouTube Thumbnail */}
                {imageErrors.has(video.id) ? (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center rounded-[6px]">
                    <div className="text-gray-400 text-sm">Video Thumbnail</div>
                  </div>
                ) : (
                  <Image 
                    src={video.thumbnail} 
                    alt={video.title}
                    width={400}
                    height={250}
                    className="w-full h-[165px] object-cover rounded-[6px]"
                    onError={() => handleImageError(video.id)}
                  />
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
                   className="w-full bg-[#5046E5] text-white py-[3px] px-4 rounded-full font-semibold text-[16px] hover:bg-transparent hover:text-[#5046E5] border-2 border-[#5046E5] transition-colors duration-300 flex items-center justify-center gap-2 group/btn cursor-pointer"
                 >
                   View Video
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
