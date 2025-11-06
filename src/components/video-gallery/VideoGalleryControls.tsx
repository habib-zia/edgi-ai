'use client'

import React from 'react'
import { IoMdArrowDropdown } from 'react-icons/io'
import { SortOrder } from '@/hooks/video-gallery/useVideoFiltering'

interface VideoGalleryControlsProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  sortOrder: SortOrder
  isSortDropdownOpen: boolean
  onSortDropdownToggle: () => void
  onSortChange: (order: SortOrder) => void
  onRefresh: () => void
  isLoading: boolean
}

export default function VideoGalleryControls({
  searchQuery,
  onSearchChange,
  sortOrder,
  isSortDropdownOpen,
  onSortDropdownToggle,
  onSortChange,
  onRefresh,
  isLoading
}: VideoGalleryControlsProps) {
  return (
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
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            boxShadow: "0px -1.5px 0px 0px #FFFFFF52 inset, 0px 0.5px 0px 0px #FFFFFF52 inset"
          }}
          className="w-full pr-10 pl-4 py-[7.4px] bg-transparent hover:bg-[#F5F5F5] rounded-[39px] text-[#5F5F5F] placeholder-[#5F5F5F] transition-all duration-300 focus:outline-none focus:ring focus:ring-[#5046E5] focus:bg-white border-2 border-[#5F5F5F] text-[20px] font-semibold"
        />
      </div>

      {/* Right side: Sort Dropdown and Refresh Button */}
      <div className="flex gap-4 justify-end">
        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="px-4 py-[7.4px] bg-[#5046E5] text-white rounded-[39px] transition-all duration-300 focus:outline-none focus:ring focus:ring-[#5046E5] flex items-center gap-2 min-w-[120px] justify-center text-[20px] font-semibold hover:bg-[#4338CA] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4V10H4.58152M19.9381 11C19.446 7.05369 16.0796 4 12 4C8.64262 4 5.76829 6.06817 4.58152 9M4.58152 9H10M20 20V14H19.4185M19.4185 14C18.2317 16.9318 15.3574 19 12 19C7.92038 19 4.55399 15.9463 4.06189 12M19.4185 14H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          Refresh
        </button>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={onSortDropdownToggle}
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
                onClick={() => onSortChange('newest')}
                className={`w-full px-4 py-3 text-left cursor-pointer hover:bg-[#F5F5F5] transition-colors duration-200 rounded-t-[8px] text-[18px] font-semibold ${
                  sortOrder === 'newest' ? 'bg-[#F5F5F5] text-[#5046E5]' : 'text-[#282828]'
                }`}
              >
                Newest
              </button>
              <button
                type="button"
                onClick={() => onSortChange('oldest')}
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
  )
}

