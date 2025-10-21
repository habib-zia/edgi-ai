'use client'

import React, { useState, useEffect, useRef } from 'react'
import { IoMdArrowDropdown } from "react-icons/io"
import { Check, AlertCircle, Search } from 'lucide-react'
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
  onManualInput: (field: any, value: string) => void
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
  onManualInput
}: HybridTopicInputProps) {
  const [inputValue, setInputValue] = useState(currentValue || '')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isTyping, setIsTyping] = useState(false)
  const [filteredTrends, setFilteredTrends] = useState<Trend[]>([])
  const [showCustomOption, setShowCustomOption] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInputValue(currentValue || '')
  }, [currentValue])

  useEffect(() => {
    if (inputValue && inputValue.trim()) {
      const filtered = safeTrends.filter(trend => 
        trend.description.toLowerCase().includes(inputValue.toLowerCase())
      )
      setFilteredTrends(filtered)
      setShowCustomOption(true)
    } else {
      setFilteredTrends(safeTrends)
      setShowCustomOption(false)
    }
  }, [inputValue, safeTrends])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setIsTyping(true)
    
    if (value && value.trim()) {
      return
    }
  }

  const handleInputFocus = () => {
    setIsTyping(false)
    onToggle(field)
  }

  const handleInputBlur = () => {
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsTyping(false)
        onBlur(field)
      }
    }, 200)
  }

  const handleToggle = () => {
    setIsTyping(false)
    onToggle(field)
  }

  const handleTrendSelect = (trend: Trend) => {
    setInputValue(trend.description)
    setIsTyping(false)
    setShowCustomOption(false)
    onSelect(field, trend.description)
  }

  const handleCustomInput = () => {
    setIsTyping(false)
    setShowCustomOption(false)
    const trimmedValue = inputValue ? inputValue.trim() : ''
    if (trimmedValue) {
      onManualInput(field, trimmedValue)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (inputValue && inputValue.trim()) {
        handleCustomInput()
      }
    }
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
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className={`w-full px-4 py-[10.5px] text-[18px] font-normal bg-[#EEEEEE] hover:bg-[#F5F5F5] border-0 rounded-[8px] text-left transition-all duration-300 focus:outline-none focus:ring focus:ring-[#5046E5] focus:bg-white ${hasError ? 'ring-2 ring-red-500' : ''} ${hasValidSelection ? 'text-gray-800' : 'text-[#11101066]'} ${isCustomInput ? 'bg-[#F5F5F5]' : ''}`}
          aria-describedby={hasError ? `${field}-error` : undefined}
        />
        <button
          type="button"
          onClick={handleToggle}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <IoMdArrowDropdown 
            className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
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
                onClick={onRetry}
                className="mt-2 px-3 py-1 text-xs bg-[#5046E5] text-white rounded hover:bg-[#4338CA] transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Custom Input Option */}
              {showCustomOption && inputValue && inputValue.trim() && (
                <button
                  type="button"
                  onClick={handleCustomInput}
                  className="w-full px-4 py-3 text-left hover:bg-[#F5F5F5] transition-colors duration-200 flex items-start justify-between text-[#282828] cursor-pointer border-b border-gray-100 bg-blue-50"
                >
                  <div className="flex items-center flex-1">
                    <Search className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-blue-800 mb-1">
                        Use custom topic: &ldquo;{inputValue ? inputValue.trim() : ''}&rdquo;
                      </div>
                      <div className="text-xs text-blue-600">
                        Create your own topic (press Enter or click)
                      </div>
                    </div>
                  </div>
                  <Check className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                </button>
              )}

              {/* Filtered Trends */}
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
              ) : inputValue && inputValue.trim() ? (
                <div className="px-4 py-3 text-center text-gray-500">
                  <p className="text-sm">No matching trends found</p>
                  <button
                    type="button"
                    onClick={handleCustomInput}
                    className="mt-2 px-3 py-1 text-xs bg-[#5046E5] text-white rounded hover:bg-[#4338CA] transition-colors"
                  >
                    Use &ldquo;{inputValue ? inputValue.trim() : ''}&rdquo; as custom topic
                  </button>
                </div>
              ) : (
                <div className="px-4 py-3 text-center text-gray-500">
                  <p className="text-sm">Start typing to search or create a custom topic</p>
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
