'use client'

import React from 'react'
import { X, Trash2 } from 'lucide-react'
import { useModalScrollLock } from '@/hooks/useModalScrollLock'

interface DeleteVideoConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  videoTitle?: string
  isDeleting?: boolean
}

export default function DeleteVideoConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  videoTitle,
  isDeleting = false 
}: DeleteVideoConfirmationModalProps) {
  useModalScrollLock(isOpen)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 text-black hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>

          <h2 className="text-xl font-semibold text-[#282828] mb-2">Delete Video</h2>

          <div className="text-[#5F5F5F] mb-6 space-y-2">
            {videoTitle && (
              <p className="font-medium text-[#282828]">
                &quot;{videoTitle}&quot;
              </p>
            )}
            <p>Are you sure you want to delete this video?</p>
            <p className="text-sm">This action cannot be undone.</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 border-2 border-[#5F5F5F] text-[#5F5F5F] rounded-full font-semibold text-base transition-all duration-300 hover:bg-[#F5F5F5] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-full font-semibold text-base transition-all duration-300 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isDeleting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

