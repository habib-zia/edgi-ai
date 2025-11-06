'use client'

import React from 'react'
import { AlertCircle } from 'lucide-react'

interface EmailVerificationMessageProps {
  email: string
  isResending: boolean
  onResend: () => void
  onClose: () => void
}

export default function EmailVerificationMessage({
  email,
  isResending,
  onResend,
  onClose
}: EmailVerificationMessageProps) {
  return (
    <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-orange-800 font-medium mb-1">Email Verification Required</h4>
          <p className="text-orange-700 text-sm mb-3">
            Please verify your email address before logging in. Check your inbox for the verification link.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={onResend}
              disabled={isResending}
              className={`text-sm font-medium underline flex items-center gap-2 ${
                isResending 
                  ? 'text-orange-400 cursor-not-allowed' 
                  : 'text-orange-600 hover:text-orange-800'
              }`}
            >
              {isResending && (
                <div className="w-4 h-4 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin" />
              )}
              {isResending ? 'Sending...' : 'Resend verification email'}
            </button>
            <button
              onClick={onClose}
              disabled={isResending}
              className={`text-sm font-medium underline ${
                isResending 
                  ? 'text-orange-400 cursor-not-allowed' 
                  : 'text-orange-600 hover:text-orange-800'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

