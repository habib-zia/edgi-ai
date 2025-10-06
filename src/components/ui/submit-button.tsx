'use client'

import React from 'react'

interface SubmitButtonProps {
  isLoading: boolean
  disabled?: boolean
  loadingText?: string
  buttonText?: string
  className?: string
}

export default function SubmitButton({
  isLoading,
  disabled = false,
  loadingText = 'Creating Video...',
  buttonText = 'Submit',
  className = ''
}: SubmitButtonProps) {
  return (
    <div className="flex justify-center pt-4">
      <button
        type="submit"
        disabled={isLoading || disabled}
        className={`w-full max-w-full px-8 py-[12.4px] bg-[#5046E5] text-white rounded-full font-semibold text-lg hover:bg-transparent hover:text-[#5046E5] border-2 border-[#5046E5] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#5046E5]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer ${className}`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {loadingText}
          </>
        ) : (
          buttonText
        )}
      </button>
    </div>
  )
}
