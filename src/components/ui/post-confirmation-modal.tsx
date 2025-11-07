'use client'

import React from 'react'
import { X, CheckCircle } from 'lucide-react'
import { useModalScrollLock } from '@/hooks/useModalScrollLock'

interface PostConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isSubmitting?: boolean
  selectedAccountsCount?: number
  videoTitle?: string
  date?: string
  time?: string
}

export default function PostConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isSubmitting = false,
  selectedAccountsCount,
  videoTitle,
  date,
  time
}: PostConfirmationModalProps) {
  useModalScrollLock(isOpen)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-black hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-blue-600" />
          </div>

          <h2 className="text-xl font-semibold text-[#282828] mb-2">Confirm Schedule</h2>

          <div className="text-[#5F5F5F] mb-6 space-y-2">
            <p>Are you sure you want to schedule this post?</p>
            {selectedAccountsCount !== undefined && selectedAccountsCount > 0 && (
              <p className="text-sm">
                This will published to {selectedAccountsCount} account{selectedAccountsCount > 1 ? 's' : ''}.
              </p>
            )}
            {videoTitle && (
              <p className="font-medium text-[#282828]">
                Video: &quot;{videoTitle}&quot;
              </p>
            )}
            {date && time && (
              <p className="text-sm">
                Scheduled for: {date} at {time}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border-2 border-[#5F5F5F] text-[#5F5F5F] rounded-full font-semibold text-base transition-all duration-300 hover:bg-[#F5F5F5] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-[#5046E5] text-white rounded-full font-semibold text-base transition-all duration-300 hover:bg-[#4338CA] focus:outline-none focus:ring-4 focus:ring-[#5046E5]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {isSubmitting ? 'Posting...' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

