'use client'

import React from 'react'
import { X } from 'lucide-react'
import { CreatePostModalProps } from '@/types/post-types'
import { useCreatePost } from '@/hooks/useCreatePost'
import AccountSelection from './account-selection'

export default function CreatePostModal({ 
  isOpen, 
  onClose, 
  onPost, 
  selectedAccounts, 
  video 
}: CreatePostModalProps) {
  const {
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
    handleClose
  } = useCreatePost({ isOpen, onClose, onPost, selectedAccounts, video })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[600px] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-black">Create Post</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
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
          <AccountSelection
            selectedAccounts={selectedAccounts}
            selectedAccountIds={matchedSelectedAccounts?.map(account => account.id) || selectedAccountIds}
            isSubmitting={isSubmitting}
            onAccountToggle={handleAccountToggle}
          />

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
              'Continue'
            ) : (
              'Post'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
