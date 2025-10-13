'use client'

import React from 'react'
import { IoMdArrowDropdown } from "react-icons/io"
import { Check, AlertCircle } from 'lucide-react'
import { Trend } from '@/lib/api-service'

interface TrendsDropdownProps {
  field: string
  placeholder: string
  currentValue: string
  selectedTrend: Trend | undefined
  isOpen: boolean
  hasError: any
  trendsLoading: boolean
  trendsError: string | null
  safeTrends: Trend[]
  onToggle: (field: any) => void
  onSelect: (field: any, value: string) => void
  onBlur: (field: any) => void
  onRetry: () => void
}

export default function TrendsDropdown({
  field,
  placeholder,
  currentValue,
  selectedTrend,
  isOpen,
  hasError,
  trendsLoading,
  trendsError,
  safeTrends,
  onToggle,
  onSelect,
  onBlur,
  onRetry
}: TrendsDropdownProps) {
  const [isSelecting, setIsSelecting] = React.useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
        }}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onToggle(field)
        }}
        onBlur={(e) => {
          // Only trigger blur if the focus is moving outside the dropdown
          setTimeout(() => {
            if (!e.currentTarget.contains(document.activeElement) && isOpen) {
              onBlur(field)
            }
          }, 200)
        }}
        className={`w-full px-4 py-[10.5px] text-[18px] font-normal bg-[#EEEEEE] hover:bg-[#F5F5F5] border-0 rounded-[8px] text-left transition-all duration-300 focus:outline-none focus:ring focus:ring-[#5046E5] focus:bg-white flex items-center justify-between cursor-pointer overflow-hidden ${hasError ? 'ring-2 ring-red-500' : ''
          } ${selectedTrend ? 'text-gray-800 bg-[#F5F5F5]' : 'text-[#11101066]'}`}
        aria-describedby={hasError ? `${field}-error` : undefined}
      >
        <span className="truncate">
          {selectedTrend ? selectedTrend.description : placeholder}
        </span>
        <IoMdArrowDropdown
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-[8px] shadow-lg max-h-60 overflow-y-auto">
          {trendsLoading ? (
            <div className="px-4 py-3 text-center text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#5046E5] mx-auto mb-2"></div>
              Loading trends...
            </div>
          ) : trendsError && safeTrends.length === 0 ? (
            <div className="px-4 py-3 text-center text-red-500">
              <p className="text-sm">{trendsError}</p>
              <button
                onClick={onRetry}
                className="mt-2 px-3 py-1 text-xs bg-[#5046E5] text-white rounded hover:bg-[#4338CA] transition-colors"
              >
                Retry
              </button>
            </div>
          ) : safeTrends.length === 0 ? (
            <div className="px-4 py-3 text-center text-red-500">
            <p className="text-sm">{trendsError}</p>
            <button
              onClick={onRetry}
              className="mt-2 px-3 py-1 text-xs bg-[#5046E5] text-white rounded hover:bg-[#4338CA] transition-colors"
            >
              Retry
            </button>
          </div>
          ) : (
            safeTrends.map((trend, index) => (
              <button
                key={index}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('🎯 Trend option mousedown:', trend.description)
                }}
                onMouseUp={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('🎯 Trend option mouseup:', trend.description)
                }}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('🎯 Trend option clicked:', trend.description)
                  
                  if (isSelecting) {
                    console.log('🎯 Already selecting, ignoring click')
                    return
                  }
                  
                  setIsSelecting(true)
                  onSelect(field, trend.description)
                  
                  // Reset selecting state after a delay
                  setTimeout(() => {
                    setIsSelecting(false)
                  }, 100)
                }}
                className="w-full px-4 py-3 text-left hover:bg-[#F5F5F5] transition-colors duration-200 flex items-start justify-between text-[#282828] cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800 mb-1">
                    {trend.description}
                  </div>
                  <div className="text-xs text-gray-500">
                    Key Points: {trend.keypoints}
                  </div>
                </div>
                {currentValue === trend.description && (
                  <Check className="w-4 h-4 text-[#5046E5] mt-1 flex-shrink-0" />
                )}
              </button>
            ))
          )}
        </div>
      )}

      {hasError && (
        <p id={`${field}-error`} className="text-red-500 text-sm mt-1 flex items-center gap-1" role="alert">
          <AlertCircle className="w-4 h-4" />
          {hasError.message}
        </p>
      )}
    </div>
  )
}
