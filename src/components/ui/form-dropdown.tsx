'use client'

import React from 'react'
import Image from 'next/image'
import { IoMdArrowDropdown } from "react-icons/io"
import { Check, AlertCircle, RefreshCw } from 'lucide-react'
import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Avatar } from '@/lib/api-service'

interface FormDropdownProps {
  field: string
  options: { value: string; label: string }[]
  placeholder: string
  currentValue: string
  isOpen: boolean
  hasError: any
  register: UseFormRegister<any>
  errors: FieldErrors<any>
  onToggle: (field: any) => void
  onSelect: (field: any, value: string) => void
  onBlur: (field: any) => void
  // Avatar-specific props
  isAvatarField?: boolean
  isFromDefaultAvatar?: boolean
  extendedAvatarOptions?: { value: string; label: string }[]
  avatars?: { custom: Avatar[]; default: Avatar[] }
  avatarsLoading?: boolean
  avatarsError?: string | null
  selectedAvatars?: { title: Avatar | null; body: Avatar | null; conclusion: Avatar | null }
  onFetchAvatars?: () => void
  onAvatarClick?: (avatar: Avatar) => void
  onDragStart?: (e: React.DragEvent, avatar: Avatar) => void
  onDragEnd?: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent) => void
  onDragLeave?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent, slot: 'title' | 'body' | 'conclusion') => void
  onRemoveAvatar?: (slot: 'title' | 'body' | 'conclusion') => void
  onClearAllAvatars?: () => void
  isAvatarSelected?: (avatar: Avatar) => boolean
  isAvatarTypeAllowed?: (avatar: Avatar) => boolean
  isAvatarPending?: (avatar: Avatar) => boolean
  getAvatarSelectionNumber?: (avatar: Avatar) => number | null
  getAvatarType?: (avatar: Avatar) => string
}

export default function FormDropdown({
  field,
  options,
  placeholder,
  currentValue,
  isOpen,
  hasError,
  register,
  errors,
  onToggle,
  onSelect,
  onBlur,
  // Avatar-specific props
  isAvatarField = false,
  isFromDefaultAvatar = false,
  extendedAvatarOptions = [],
  avatars = { custom: [], default: [] },
  avatarsLoading = false,
  avatarsError = null,
  selectedAvatars = { title: null, body: null, conclusion: null },
  onFetchAvatars,
  onAvatarClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemoveAvatar,
  onClearAllAvatars,
  isAvatarSelected,
  isAvatarTypeAllowed,
  isAvatarPending,
  getAvatarSelectionNumber,
  getAvatarType
}: FormDropdownProps) {
  // State for managing visible avatar count
  const [visibleDefaultCount, setVisibleDefaultCount] = React.useState(12)
  const [visibleImageAvatarCount, setVisibleImageAvatarCount] = React.useState(12)
  const [visibleVideoAvatarCount, setVisibleVideoAvatarCount] = React.useState(12)

  // Categorize custom avatars into image avatars and video avatars
  const imageAvatars = React.useMemo(() => {
    return avatars.custom.filter(avatar => avatar.gender && avatar.ethnicity)
  }, [avatars.custom])

  const videoAvatars = React.useMemo(() => {
    return avatars.custom.filter(avatar => !avatar.gender || !avatar.ethnicity || avatar.preview_video_url)
  }, [avatars.custom])

  // Handler functions for "See More" functionality
  const handleSeeMoreDefault = () => {
    setVisibleDefaultCount(prev => Math.min(prev + 12, avatars.default.length))
  }

  const handleSeeMoreImageAvatars = () => {
    setVisibleImageAvatarCount(prev => Math.min(prev + 12, imageAvatars.length))
  }

  const handleSeeMoreVideoAvatars = () => {
    setVisibleVideoAvatarCount(prev => Math.min(prev + 12, videoAvatars.length))
  }

  const handleSeeLessDefault = () => {
    setVisibleDefaultCount(12)
  }

  const handleSeeLessImageAvatars = () => {
    setVisibleImageAvatarCount(12)
  }

  const handleSeeLessVideoAvatars = () => {
    setVisibleVideoAvatarCount(12)
  }

  // Use extended options for avatar field when coming from Default Avatar
  const displayOptions = isAvatarField && isFromDefaultAvatar ? extendedAvatarOptions : options

  // For avatar field, try to find the selected avatar from API data first
  let selectedOption;
  if (isAvatarField && currentValue) {
    const customAvatar = avatars.custom.find(avatar => avatar.avatar_id === currentValue)
    const defaultAvatar = avatars.default.find(avatar => avatar.avatar_id === currentValue)
    if (customAvatar) {
      // Show avatar_id for custom avatars (same as default avatars)
      selectedOption = { value: customAvatar.avatar_id, label: customAvatar.avatar_id }
    } else if (defaultAvatar) {
      selectedOption = { value: defaultAvatar.avatar_id, label: defaultAvatar.avatar_id }
    } else {
      // Fallback to static options
      selectedOption = displayOptions.find(option => option.value === currentValue)
    }
  } else {
    selectedOption = displayOptions.find(option => option.value === currentValue)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onToggle(field)}
        onBlur={() => {
          setTimeout(() => {
            if ((!currentValue || currentValue.trim() === '') && isOpen) {
              onBlur(field)
            }
          }, 100)
        }}
        className={`w-full px-4 py-[10.5px] text-[18px] font-normal bg-[#EEEEEE] hover:bg-[#F5F5F5] border-0 rounded-[8px] text-left transition-all duration-300 focus:outline-none focus:ring focus:ring-[#5046E5] focus:bg-white flex items-center justify-between cursor-pointer overflow-hidden ${hasError ? 'ring-2 ring-red-500' : ''
          } ${selectedOption ? 'text-gray-800 bg-[#F5F5F5]' : 'text-[#11101066]'}`}
        aria-describedby={hasError ? `${field}-error` : undefined}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <IoMdArrowDropdown
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div>
          {isAvatarField ? (
            <div className="absolute z-50 lg:w-[900px] w-full mt-1 bg-white rounded-[12px] shadow-lg !overflow-hidden lg:-left-[190px]">
              {/* Avatar Dropdown Header with Refresh Button */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Select Avatar</h3>
                {/* <button
                  onClick={onFetchAvatars}
                  disabled={avatarsLoading}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-[#5046E5] hover:bg-gray-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh avatars"
                >
                  <RefreshCw className={`w-4 h-4 ${avatarsLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button> */}
              </div>

              {/* Main Content - Two Column Layout */}
              <div className="flex h-[500px]">
                {/* Left Side - Avatar Selection */}
                <div className="flex-1 py-4 px-6 overflow-y-auto border-r border-gray-200">
                  {avatarsLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5046E5]"></div>
                      <span className="ml-2 text-[#5F5F5F]">Loading avatars...</span>
                    </div>
                  ) : avatarsError ? (
                    <div className="text-center py-8">
                      <p className="text-red-500 mb-2">Failed to load avatars</p>
                      <p className="text-sm text-[#5F5F5F]">{avatarsError}</p>
                      <button
                        onClick={onFetchAvatars}
                        className="mt-3 px-4 py-2 bg-[#5046E5] text-white rounded-lg hover:bg-[#4338CA] transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Image Avatar Section */}
                      {imageAvatars.length > 0 && (
                        <div className="mb-6">
                          <h4 className="md:text-[20px] text-[16px] font-semibold text-[#5F5F5F] mb-3">Image Avatar</h4>
                          {/* Info bar */}
                          <div className="flex md:flex-row flex-col items-center justify-between md:mb-3 mb-5 px-3 py-2 bg-purple-100 rounded-lg gap-y-4">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-purple-600 md:block hidden" />
                              <span className="md:text-sm text-xs text-purple-700">
                                Click to select up to 3 avatars for your video
                              </span>
                            </div>
                            {(() => {
                              const totalSelected = [selectedAvatars.title, selectedAvatars.body, selectedAvatars.conclusion].filter(Boolean).length
                              return totalSelected > 0 && (
                                <button
                                  onClick={() => {
                                    onClearAllAvatars && onClearAllAvatars()
                                  }}
                                  className="text-xs text-purple-600 hover:text-purple-800 underline"
                                >
                                  Clear Selection
                                </button>
                              )
                            })()}
                          </div>
                          <div className="md:grid flex flex-wrap lg:grid-cols-4 md:grid-cols-2 grid-cols-1 justify-center items-center gap-2">
                            {imageAvatars.slice(0, visibleImageAvatarCount).map((avatar) => {
                              const selectionNumber = getAvatarSelectionNumber ? getAvatarSelectionNumber(avatar) : null
                              const isSelected = isAvatarSelected ? isAvatarSelected(avatar) : false
                              const isDisabled = (isAvatarPending ? isAvatarPending(avatar) : false)

                              return (
                                <div
                                  key={avatar._id}
                                  draggable={!isDisabled}
                                  onDragStart={(e) => !isDisabled && onDragStart && onDragStart(e, avatar)}
                                  onDragEnd={(e) => onDragEnd && onDragEnd(e)}
                                  onClick={(e) => {
                                    e.preventDefault()
                                    onAvatarClick && onAvatarClick(avatar)
                                  }}
                                  className={`flex flex-col items-center max-w-[80px] rounded-lg transition-all duration-200 relative ${isDisabled
                                      ? 'opacity-40 cursor-not-allowed'
                                      : isSelected
                                        ? 'cursor-pointer'
                                        : 'cursor-pointer hover:bg-gray-50 hover:ring-1 hover:ring-gray-300'
                                    }`}
                                >
                                  <div className="relative">
                                    <Image
                                      src={avatar?.preview_image_url || avatar?.imageUrl || '/images/avatars/avatargirl.png'}
                                      alt={avatar.avatar_name || avatar.name || 'Avatar'}
                                      width={80}
                                      height={80}
                                      className={`rounded-lg object-cover w-[80px] h-[80px] ${(isAvatarPending ? isAvatarPending(avatar) : false) ? 'opacity-50' : ''
                                        }`}
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/images/avatars/avatargirl.png';
                                      }}
                                    />

                                    {/* Selection number indicator */}
                                    {selectionNumber && (
                                      <div className="absolute -top-3 -right-2 w-5 h-5 bg-[#5046E5]/60 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg backdrop-blur-lg leading-0">
                                        {selectionNumber}
                                      </div>
                                    )}

                                    {/* Loading overlay for pending avatars */}
                                    {(isAvatarPending ? isAvatarPending(avatar) : false) && (
                                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-base text-[#11101066] font-normal mt-3 truncate w-full text-center">
                                    {avatar.avatar_name}
                                    {(isAvatarPending ? isAvatarPending(avatar) : false) && (
                                      <>
                                        <span className="block text-xs text-orange-500 mt-1">Processing...</span>
                                      </>
                                    )}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                          
                          {/* See More/Less buttons for Image Avatars */}
                          {imageAvatars.length > 12 && (
                            <div className="flex justify-center md:flex-row flex-col gap-y-4 gap-2 mt-4">
                              {visibleImageAvatarCount < imageAvatars.length && (
                                <button
                                  onClick={handleSeeMoreImageAvatars}
                                  className="px-4 py-2 text-sm text-[#5046E5] hover:text-[#4338CA] hover:bg-[#5046E5]/10 rounded-lg transition-colors duration-200 border border-[#5046E5]"
                                >
                                  See More ({imageAvatars.length - visibleImageAvatarCount} more)
                                </button>
                              )}
                              {visibleImageAvatarCount > 12 && (
                                <button
                                  onClick={handleSeeLessImageAvatars}
                                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200 border border-gray-300"
                                >
                                  See Less
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Separator between Image and Video Avatars */}
                      {imageAvatars.length > 0 && videoAvatars.length > 0 && (
                        <div className="bg-[#A0A3BD] h-[1px] mb-6"></div>
                      )}

                      {/* Video Avatar Section */}
                      {videoAvatars.length > 0 && (
                        <div className="mb-6">
                          <h4 className="md:text-[20px] text-[16px] font-semibold text-[#5F5F5F] mb-3">Video Avatar</h4>
                          {/* Info bar */}
                          <div className="flex md:flex-row flex-col items-center justify-between md:mb-3 mb-5 px-3 py-2 bg-purple-100 rounded-lg gap-y-4">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-purple-600 md:block hidden" />
                              <span className="md:text-sm text-xs text-purple-700">
                                Click to select up to 3 avatars for your video
                              </span>
                            </div>
                            {(() => {
                              const totalSelected = [selectedAvatars.title, selectedAvatars.body, selectedAvatars.conclusion].filter(Boolean).length
                              return totalSelected > 0 && (
                                <button
                                  onClick={() => {
                                    onClearAllAvatars && onClearAllAvatars()
                                  }}
                                  className="text-xs text-purple-600 hover:text-purple-800 underline"
                                >
                                  Clear Selection
                                </button>
                              )
                            })()}
                          </div>
                          <div className="md:grid flex flex-wrap lg:grid-cols-4 md:grid-cols-2 grid-cols-1 justify-center items-center gap-2">
                            {videoAvatars.slice(0, visibleVideoAvatarCount).map((avatar) => {
                              const selectionNumber = getAvatarSelectionNumber ? getAvatarSelectionNumber(avatar) : null
                              const isSelected = isAvatarSelected ? isAvatarSelected(avatar) : false
                              const isDisabled = (isAvatarPending ? isAvatarPending(avatar) : false)

                              return (
                                <div
                                  key={avatar._id}
                                  draggable={!isDisabled}
                                  onDragStart={(e) => !isDisabled && onDragStart && onDragStart(e, avatar)}
                                  onDragEnd={(e) => onDragEnd && onDragEnd(e)}
                                  onClick={(e) => {
                                    e.preventDefault()
                                    if (!isDisabled) {
                                      onAvatarClick && onAvatarClick(avatar)
                                    }
                                  }}
                                  className={`flex flex-col items-center max-w-[80px] rounded-lg transition-all duration-200 relative ${isDisabled
                                      ? 'opacity-40 cursor-not-allowed'
                                      : isSelected
                                        ? 'cursor-pointer'
                                        : 'cursor-pointer hover:bg-gray-50 hover:ring-1 hover:ring-gray-300'
                                    }`}
                                >
                                  <div className="relative">
                                    <Image
                                      src={avatar?.preview_image_url || avatar?.imageUrl || '/images/avatars/avatargirl.png'}
                                      alt={avatar.avatar_name || avatar.name || 'Avatar'}
                                      width={80}
                                      height={80}
                                      className={`rounded-lg object-cover w-[80px] h-[80px] ${(isAvatarPending ? isAvatarPending(avatar) : false) ? 'opacity-50' : ''
                                        }`}
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/images/avatars/avatargirl.png';
                                      }}
                                    />

                                    {/* Selection number indicator */}
                                    {selectionNumber && (
                                      <div className="absolute -top-3 -right-2 w-5 h-5 bg-[#5046E5]/60 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg backdrop-blur-lg leading-0">
                                        {selectionNumber}
                                      </div>
                                    )}

                                    {/* Loading overlay for pending avatars */}
                                    {(isAvatarPending ? isAvatarPending(avatar) : false) && (
                                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                      </div>
                                    )}

                                    {/* Video indicator badge */}
                                    {avatar.preview_video_url && (
                                      <div className="absolute bottom-0 right-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold mb-1 mr-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-base text-[#11101066] font-normal mt-3 truncate w-full text-center">
                                    {avatar.avatar_name}
                                    {(isAvatarPending ? isAvatarPending(avatar) : false) && (
                                      <>
                                        <span className="block text-xs text-orange-500 mt-1">Processing...</span>
                                      </>
                                    )}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                          
                          {/* See More/Less buttons for Video Avatars */}
                          {videoAvatars.length > 12 && (
                            <div className="flex justify-center md:flex-row flex-col gap-y-4 gap-2 mt-4">
                              {visibleVideoAvatarCount < videoAvatars.length && (
                                <button
                                  onClick={handleSeeMoreVideoAvatars}
                                  className="px-4 py-2 text-sm text-[#5046E5] hover:text-[#4338CA] hover:bg-[#5046E5]/10 rounded-lg transition-colors duration-200 border border-[#5046E5]"
                                >
                                  See More ({videoAvatars.length - visibleVideoAvatarCount} more)
                                </button>
                              )}
                              {visibleVideoAvatarCount > 12 && (
                                <button
                                  onClick={handleSeeLessVideoAvatars}
                                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200 border border-gray-300"
                                >
                                  See Less
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Separator between Custom Avatars and Default Avatars */}
                      {(imageAvatars.length > 0 || videoAvatars.length > 0) && avatars.default.length > 0 && (
                        <div className="bg-[#A0A3BD] h-[1px] mb-6"></div>
                      )}
                      {avatars.default.length > 0 && (
                        <div>
                          <h4 className="md:text-[20px] text-[16px] font-semibold text-[#5F5F5F] mb-3">Default Avatar</h4>
                          <div className="md:grid flex flex-wrap lg:grid-cols-4 md:grid-cols-2 grid-cols-1 justify-center items-center gap-2">
                            {avatars.default.slice(0, visibleDefaultCount).map((avatar) => {
                              const selectionNumber = getAvatarSelectionNumber ? getAvatarSelectionNumber(avatar) : null
                              const isSelected = isAvatarSelected ? isAvatarSelected(avatar) : false
                              const isDisabled = false

                              return (
                                <div
                                  key={avatar._id}
                                  draggable={!isDisabled}
                                  onDragStart={(e) => !isDisabled && onDragStart && onDragStart(e, avatar)}
                                  onDragEnd={(e) => onDragEnd && onDragEnd(e)}
                                  onClick={(e) => {
                                    e.preventDefault()
                                    if (!isDisabled) {
                                    onAvatarClick && onAvatarClick(avatar)
                                    }
                                  }}
                                  className={`flex flex-col items-center max-w-[80px] rounded-lg transition-all duration-200 relative ${isDisabled
                                      ? 'opacity-40 cursor-not-allowed'
                                      : isSelected
                                        ? 'cursor-pointer'
                                        : 'cursor-pointer hover:bg-gray-50 hover:ring-1 hover:ring-gray-300'
                                    }`}
                                >
                                  <div className="relative">
                                    <Image
                                      src={avatar?.preview_image_url || avatar?.imageUrl || '/images/avatars/avatargirl.png'}
                                      alt={avatar?.avatar_name || avatar?.name || 'Avatar'}
                                      width={80}
                                      height={80}
                                      className="rounded-lg object-cover w-[80px] h-[80px]"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/images/avatars/avatargirl.png';
                                      }}
                                    />

                                    {/* Selection number indicator */}
                                    {selectionNumber && (
                                      <div className="absolute -top-3 -right-2 w-5 h-5 bg-[#5046E5]/60 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg backdrop-blur-lg leading-0">
                                        {selectionNumber}
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-base text-[#11101066] font-normal mt-3 truncate w-full text-center">{avatar.avatar_name}</span>
                                </div>
                              )
                            })}
                          </div>
                          
                          {/* See More/Less buttons for Default Avatars */}
                          {avatars.default.length > 12 && (
                            <div className="flex justify-center md:flex-row flex-col gap-y-4 gap-2 mt-4">
                              {visibleDefaultCount < avatars.default.length && (
                                <button
                                  onClick={handleSeeMoreDefault}
                                  className="px-4 py-2 text-sm text-[#5046E5] hover:text-[#4338CA] hover:bg-[#5046E5]/10 rounded-lg transition-colors duration-200 border border-[#5046E5]"
                                >
                                  See More ({avatars.default.length - visibleDefaultCount} more)
                                </button>
                              )}
                              {visibleDefaultCount > 12 && (
                                <button
                                  onClick={handleSeeLessDefault}
                                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200 border border-gray-300"
                                >
                                  See Less
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      {imageAvatars.length === 0 && videoAvatars.length === 0 && avatars.default.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-[#5F5F5F]">No avatars available</p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Right Side - Drop Zones */}
                <div className="lg:max-w-80 max-w-[50%] py-4 px-6 bg-white">
                  <h4 className="md:text-[20px] text-[16px] font-semibold text-[#5F5F5F] mb-3">Sort Avatar</h4>
                  <p className="text-sm text-[#5F5F5F] mb-6">Drag and drop the selected Images</p>

                  {/* Drop Zones */}
                  <div className="space-y-4">
                    {/* Title Avatar Drop Zone */}
                    <div
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onDrop={(e) => onDrop && onDrop(e, 'title')}
                      className={`relative flex items-center py-3 transition-colors duration-200 hover:bg-gray-50 rounded-lg cursor-pointer`}
                    >
                      {selectedAvatars.title ? (
                        <div className="flex md:flex-row flex-col items-center gap-y-4 w-full">
                          <div className="w-[60px] h-[60px] bg-purple-100 rounded-lg flex items-center justify-center mr-3 shadow-sm relative">
                            <Image
                              src={selectedAvatars.title?.preview_image_url || selectedAvatars.title?.imageUrl || '/images/avatars/avatargirl.png'}
                              alt={selectedAvatars.title?.avatar_name || selectedAvatars.title?.name || 'Avatar'}
                              width={50}
                              height={50}
                              className="rounded-lg object-cover w-[50px] h-[50px]"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/images/avatars/avatargirl.png';
                              }}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onRemoveAvatar && onRemoveAvatar('title')
                              }}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                          <span className="text-sm text-gray-500">Title Avatar</span>
                        </div>
                      ) : (
                        <div className="flex md:flex-row flex-col items-center gap-y-4 w-full">
                          <div className="w-[60px] h-[60px] bg-purple-100 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-500">Title Avatar</span>
                        </div>
                      )}
                    </div>

                    {/* Body Avatar Drop Zone */}
                    <div
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onDrop={(e) => onDrop && onDrop(e, 'body')}
                      className={`relative flex items-center py-3 transition-colors duration-200 hover:bg-gray-50 rounded-lg cursor-pointer`}
                    >
                      {selectedAvatars.body ? (
                        <div className="flex md:flex-row flex-col items-center gap-y-4 w-full">
                          <div className="w-[60px] h-[60px] bg-purple-100 rounded-lg flex items-center justify-center mr-3 shadow-sm relative">
                            <Image
                              src={selectedAvatars.body?.preview_image_url || selectedAvatars.body?.imageUrl || '/images/avatars/avatargirl.png'}
                              alt={selectedAvatars.body?.avatar_name || selectedAvatars.body?.name || 'Avatar'}
                              width={50}
                              height={50}
                              className="rounded-lg object-cover w-[50px] h-[50px]"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/images/avatars/avatargirl.png';
                              }}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onRemoveAvatar && onRemoveAvatar('body')
                              }}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                          <span className="text-sm text-gray-500">Body Avatar</span>
                        </div>
                      ) : (
                        <div className="flex md:flex-row flex-col items-center gap-y-4 w-full">
                          <div className="w-[60px] h-[60px] bg-purple-100 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-500">Body Avatar</span>
                        </div>
                      )}
                    </div>

                    <div
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onDrop={(e) => onDrop && onDrop(e, 'conclusion')}
                      className={`relative flex items-center py-3 transition-colors duration-200 hover:bg-gray-50 rounded-lg cursor-pointer`}
                    >
                      {selectedAvatars.conclusion ? (
                        <div className="flex md:flex-row flex-col items-center gap-y-4 w-full">
                          <div className="w-[60px] h-[60px] bg-purple-100 rounded-lg flex items-center justify-center mr-3 shadow-sm relative">
                            <Image
                              src={selectedAvatars.conclusion?.preview_image_url || selectedAvatars.conclusion?.imageUrl || '/images/avatars/avatargirl.png'}
                              alt={selectedAvatars.conclusion?.avatar_name || selectedAvatars.conclusion?.name || 'Avatar'}
                              width={50}
                              height={50}
                              className="rounded-lg object-cover w-[50px] h-[50px]"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/images/avatars/avatargirl.png';
                              }}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onRemoveAvatar && onRemoveAvatar('conclusion')
                              }}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                          <span className="text-sm text-gray-500">Conclusion Avatar</span>
                        </div>
                      ) : (
                        <div className="flex md:flex-row flex-col items-center gap-y-4 w-full">
                          <div className="w-[60px] h-[60px] bg-purple-100 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-500">Conclusion Avatar</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Show regular dropdown options for normal users or fallback */
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-[8px] shadow-lg max-h-60 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onSelect(field, option.value)}
                  className="w-full px-4 py-3 text-left hover:bg-[#F5F5F5] transition-colors duration-200 flex items-center justify-between text-[#282828] cursor-pointer"
                >
                  <span>{option.label}</span>
                  {currentValue === option.value && (
                    <Check className="w-4 h-4 text-[#5046E5]" />
                  )}
                </button>
              ))}
            </div>
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
