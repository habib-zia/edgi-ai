'use client'

import React from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConnectWarningModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  platformName: string
}

export default function ConnectWarningModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  platformName 
}: ConnectWarningModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg max-w-sm w-full shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-gray-800">Warning</h3>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors duration-200"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            
            <h4 className="text-base font-medium text-gray-800 mb-2">
              Account Connection Warning
            </h4>

            <p className="text-sm text-gray-600 leading-relaxed">
            <span className="font-medium text-gray-800">Important:</span> After you connect your <span className="font-medium text-gray-800">{platformName}</span> account, it cannot be removed later. Please double-check that you&apos;re comfortable with a permanent connection before proceeding.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#5046E5] hover:bg-[#4338CA] rounded-lg transition-colors duration-200"
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  )
}
