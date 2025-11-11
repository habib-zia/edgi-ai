'use client'

import React, { useState, useEffect, useRef } from 'react'
import { IoMdArrowDropdown } from "react-icons/io"
import { Check, AlertCircle } from 'lucide-react'
import { Trend } from '@/lib/api-service'

interface HybridTopicInputProps {
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
  onCustomTopicClick?: () => void
}

export default function HybridTopicInput({
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
  onRetry,
  onCustomTopicClick
}: HybridTopicInputProps) {
  const [inputValue, setInputValue] = useState(currentValue || '')
  const [filteredTrends, setFilteredTrends] = useState<Trend[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInputValue(currentValue || '')
  }, [currentValue])

  useEffect(() => {
    // Always show all trends - no filtering based on input
    setFilteredTrends(safeTrends)
  }, [safeTrends])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Disable manual input - only allow dropdown selection
    e.preventDefault()
    return
  }

  const handleInputFocus = () => {
    onToggle(field)
  }

  const handleInputBlur = () => {
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        onBlur(field)
      }
    }, 200)
  }

  const handleToggle = () => {
    onToggle(field)
  }

  const handleTrendSelect = (trend: Trend) => {
    setInputValue(trend.description)
    onSelect(field, trend.description)
  }


  const isCustomInput = selectedTrend === undefined && currentValue && currentValue.trim()
  
  const hasValidSelection = currentValue && currentValue.trim()

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          readOnly
          className={`w-full px-4 py-[10.5px] text-[18px] font-normal bg-[#EEEEEE] hover:bg-[#F5F5F5] border-0 rounded-[8px] text-left transition-all duration-300 focus:outline-none focus:ring focus:ring-[#5046E5] focus:bg-white cursor-pointer ${hasError ? 'ring-2 ring-red-500' : ''} ${hasValidSelection ? 'text-gray-800' : 'text-[#11101066]'} ${isCustomInput ? 'bg-[#F5F5F5]' : ''}`}
          aria-describedby={hasError ? `${field}-error` : undefined}
        />
        <button
          type="button"
          onClick={handleToggle}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <IoMdArrowDropdown 
            className={`w-4 h-4 transition-transform text-black duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>
      </div>

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
                type="button"
                onClick={onRetry}
                className="mt-2 px-3 py-1 text-xs bg-[#5046E5] text-white rounded hover:bg-[#4338CA] transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Custom Topic Button */}
              {onCustomTopicClick && (
                <button
                  type="button"
                  onClick={onCustomTopicClick}
                  className="w-full px-4 py-3 text-left hover:bg-[#F5F5F5] transition-colors duration-200 flex items-center justify-between text-[#282828] cursor-pointer border-b border-gray-100 bg-green-50"
                >
                  <div className="flex items-normal flex-1">
                    <span className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 text-lg font-bold">+</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-green-800 mb-1">
                        Add Custom Topic
                      </div>
                      <div className="text-xs text-green-600">
                        Create your own topic field
                      </div>
                    </div>
                  </div>
                  <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                </button>
              )}

              {/* All Trends - Always show all options */}
              {filteredTrends.length > 0 ? (
                filteredTrends.map((trend, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleTrendSelect(trend)}
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
              ) : (
                <div className="px-4 py-3 text-center text-gray-500">
                  <p className="text-sm">No trends available</p>
                </div>
              )}
            </>
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
