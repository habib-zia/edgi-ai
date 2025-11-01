'use client'

import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { ConnectedAccount } from '@/types/post-types'

interface EditCaptionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (caption: string) => void
  account: ConnectedAccount | null
  initialCaption: string
}

export default function EditCaptionModal({
  isOpen,
  onClose,
  onSave,
  account,
  initialCaption
}: EditCaptionModalProps) {
  const [caption, setCaption] = useState(initialCaption)

  useEffect(() => {
    if (isOpen) {
      setCaption(initialCaption)
    }
  }, [isOpen, initialCaption])

  if (!isOpen || !account) return null

  const handleSave = () => {
    onSave(caption)
    onClose()
  }

  const handleCancel = () => {
    setCaption(initialCaption)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-black">Edit Caption</h2>
          <button
            onClick={handleCancel}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account: <span className="font-semibold">{account.name}</span>
            </label>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Caption <span className="text-red-500">*</span>
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Enter caption for this account..."
              rows={6}
              maxLength={account.post_maxlength || 2200}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5046E5] resize-none text-sm text-black"
            />
            <p className="text-xs text-gray-500 mt-1">
              {caption.length} / {account.post_maxlength || 2200} characters
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-[#5046E5] text-white rounded-lg hover:bg-[#4338CA] transition-colors duration-200 font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

