'use client'

import React, { useState, useMemo, useTransition, useEffect, useRef } from 'react'
import { IoMdArrowDropdown } from "react-icons/io"
import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Voice, VoiceType } from './types'
import { useAudioPlayer } from './useAudioPlayer'
import VoiceTypeSelector from './VoiceTypeSelector'
import VoiceList from './VoiceList'
import { apiService } from '@/lib/api-service'
import { useNotificationStore } from '@/components/ui/global-notification'
import { Upload } from 'lucide-react'

interface VoiceSelectorProps {
  field: string
  placeholder: string
  currentValue: string
  isOpen: boolean
  hasError: any
  register: UseFormRegister<any>
  errors: FieldErrors<any>
  onToggle: (field: any) => void
  onSelect: (field: any, value: string) => void
  onBlur: (field: any) => void
  voices?: Voice[]
  voicesLoading?: boolean
  voicesError?: string | null
  selectedVoice?: Voice | null
  preset?: string | null
  initialVoiceType?: VoiceType | null // Override preset-based initialization
  onVoiceClick?: (voice: Voice) => void
  onDragStart?: (e: React.DragEvent, voice: Voice) => void
  onDragEnd?: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent) => void
  onDragLeave?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
  typeSelectorTitle?: string
  typeSelectorDescription?: string
  typeSelectorLowLabel?: string
  typeSelectorMediumLabel?: string
  typeSelectorHighLabel?: string
  typeSelectorCustomLabel?: string
  hasCustomVoices?: boolean
  hasTrending?: boolean
  trendingLabel?: string
  listTitle?: string
  listLoadingText?: string
  listEmptyText?: string
  onVoiceTypeChange?: (type: VoiceType) => void
  onCustomMusicUpload?: (music: Voice) => void
  onTrendingMusicFetch?: () => Promise<Voice[]>
}

export default function VoiceSelector({
  field,
  placeholder,
  currentValue,
  isOpen,
  hasError,
  register: _register, // eslint-disable-line @typescript-eslint/no-unused-vars
  errors: _errors, // eslint-disable-line @typescript-eslint/no-unused-vars
  onToggle,
  onSelect,
  onBlur,
  voices = [],
  voicesLoading = false,
  voicesError = null,
  selectedVoice = null,
  preset = null,
  initialVoiceType = null,
  onVoiceClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  typeSelectorTitle,
  typeSelectorDescription,
  typeSelectorLowLabel,
  typeSelectorMediumLabel,
  typeSelectorHighLabel,
  typeSelectorCustomLabel,
  hasCustomVoices = false,
  hasTrending = false,
  trendingLabel = 'Trending Music',
  listTitle,
  listLoadingText,
  listEmptyText,
  onVoiceTypeChange,
  onCustomMusicUpload,
  onTrendingMusicFetch
}: VoiceSelectorProps) {
  // Initialize voiceType based on initialVoiceType (from user-settings) or preset, default to 'low'
  const getInitialVoiceType = (): VoiceType => {
    // Priority: initialVoiceType (user-settings) > preset > default
    if (initialVoiceType && (initialVoiceType === 'low' || initialVoiceType === 'medium' || initialVoiceType === 'high' || initialVoiceType === 'custom' || initialVoiceType === 'trending')) {
      return initialVoiceType
    }
    if (preset) {
      const presetLower = preset.toLowerCase()
      if (presetLower === 'medium') return 'medium'
      if (presetLower === 'high') return 'high'
      return 'low'
    }
    return 'low'
  }
  
  const [voiceType, setVoiceType] = useState<VoiceType>(getInitialVoiceType())
  const [draggedVoice, setDraggedVoice] = useState<Voice | null>(null)
  const [, startTransition] = useTransition()
  const [isUploadingMusic, setIsUploadingMusic] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showNotification } = useNotificationStore()
  
  // Check if this is for music (field === 'music')
  const isMusicSelector = field === 'music'
  
  // Check if custom music exists
  const hasCustomMusic = voices.filter(v => v.type === 'custom').length > 0
  
  // Trending music state
  const [trendingMusic, setTrendingMusic] = useState<Voice[]>([])
  const [isLoadingTrending, setIsLoadingTrending] = useState(false)
  
  const { playingVoiceId, voiceProgress, handlePlayPreview, stopAllAudio } = useAudioPlayer()

  // Get preset from parent if available
  const presetValue = preset || null
  // ALWAYS prioritize selectedVoice - it's the source of truth
  // Only use currentValue if selectedVoice is null
  const displayValue = selectedVoice?.name || (currentValue ? voices.find(v => v.id === currentValue)?.name : null) || presetValue || placeholder
  
  // Update voiceType when initialVoiceType or preset changes
  // Priority: initialVoiceType (user-settings) > preset
  useEffect(() => {
    if (initialVoiceType && (initialVoiceType === 'low' || initialVoiceType === 'medium' || initialVoiceType === 'high' || initialVoiceType === 'custom' || initialVoiceType === 'trending')) {
      // Use user-settings voice type (don't override with preset)
      setVoiceType(initialVoiceType)
    } else if (preset) {
      // Fall back to preset if no initialVoiceType
      const presetLower = preset.toLowerCase()
      let newType: VoiceType = 'low'
      if (presetLower === 'medium') newType = 'medium'
      else if (presetLower === 'high') newType = 'high'
      setVoiceType(newType)
    }
  }, [preset, initialVoiceType])

  const handleVoiceTypeChange = async (type: VoiceType) => {
    console.log('🎤 VoiceSelector - handleVoiceTypeChange called with type:', type)
    console.log('🎤 VoiceSelector - Current voiceType:', voiceType, 'Current selectedVoice:', selectedVoice?.name, 'selectedVoiceType:', selectedVoice?.type)
    
    // Don't auto-select if user is manually changing type - let them select manually
    // Only update the type filter, don't trigger auto-selection
    try {
      stopAllAudio()
    } catch {
    }
    
    // If trending is selected and we have a fetch function, fetch trending music
    if (type === 'trending' && onTrendingMusicFetch && trendingMusic.length === 0) {
      setIsLoadingTrending(true)
      try {
        const fetchedMusic = await onTrendingMusicFetch()
        setTrendingMusic(fetchedMusic)
      } catch (error) {
        console.error('Failed to fetch trending music:', error)
        showNotification('Failed to load trending music', 'error')
      } finally {
        setIsLoadingTrending(false)
      }
    }
    
    startTransition(() => {
      try {
        console.log('🎤 VoiceSelector - Setting voiceType to:', type)
        setVoiceType(type)
        // Call the callback - but this will now check if current voice matches type before auto-selecting
        if (onVoiceTypeChange) {
          console.log('🎤 VoiceSelector - Calling onVoiceTypeChange callback with type:', type)
          onVoiceTypeChange(type)
        }
      } catch {
        setVoiceType(type)
        if (onVoiceTypeChange) {
          onVoiceTypeChange(type)
        }
      }
    })
  }

  const handleVoiceSelection = (voice: Voice) => {
    console.log('🎤 VoiceSelector - handleVoiceSelection called:', {
      voiceName: voice.name,
      voiceId: voice.id,
      voiceType: voice.type,
      field: field,
      currentValue: currentValue,
      selectedVoiceId: selectedVoice?.id
    })
    // Ensure we're using the correct voice object from the filtered list
    if (onVoiceClick) {
      console.log('🎤 VoiceSelector - Calling onVoiceClick with voice:', voice.name, voice.id)
      onVoiceClick(voice)
    }
    console.log('🎤 VoiceSelector - Calling onSelect with field:', field, 'voiceId:', voice.id)
    onSelect(field, voice.id)
    // Close dropdown after selection
    onToggle(field)
  }

  const handleDragStart = (e: React.DragEvent, voice: Voice) => {
    try {
      setDraggedVoice(voice)
      if (onDragStart) {
        onDragStart(e, voice)
      }
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', voice.id)
      const target = e.target as HTMLElement
      if (target && target.classList) {
        target.classList.add('dragging')
      }
    } catch {
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    try {
      if (onDragEnd) {
        onDragEnd(e)
      }
      const target = e.target as HTMLElement
      if (target && target.classList) {
        target.classList.remove('dragging')
      }
    } catch {
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    try {
      if (draggedVoice) {
        handleVoiceSelection(draggedVoice)
        setDraggedVoice(null)
      }
      if (onDrop) {
        onDrop(e)
      }
    } catch {
    }
  }

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audio = document.createElement('audio')
      audio.preload = 'metadata'
      
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(audio.src)
        const duration = audio.duration
        
        if (isNaN(duration) || !isFinite(duration) || duration === 0) {
          reject(new Error('Unable to read audio duration. The file may be corrupted.'))
          return
        }
        
        resolve(duration)
      }
      
      audio.onerror = () => {
        URL.revokeObjectURL(audio.src)
        reject(new Error('Unable to load audio file.'))
      }
      
      audio.src = URL.createObjectURL(file)
    })
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.includes('mp3') && !file.name.toLowerCase().endsWith('.mp3')) {
      showNotification('Please upload an MP3 file only', 'error')
      return
    }

    const fileName = file.name.replace(/\.[^/.]+$/, '')

    setIsUploadingMusic(true)
    
    try {
      let duration: number
      try {
        duration = await getAudioDuration(file)
        duration = Math.round(duration)
      } catch (error) {
        console.error('Error extracting audio duration:', error)
        const errorMessage = error instanceof Error ? error.message : undefined
        if (errorMessage) {
          showNotification(errorMessage, 'error')
        }
        setIsUploadingMusic(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        return
      }

      const formData = new FormData()
      formData.append('audioFile', file)
      formData.append('name', fileName)
      formData.append('duration', duration.toString())

      const response = await apiService.uploadCustomMusic(formData)
      
      if (response.success && response.data) {
        if (response.message) {
          showNotification(response.message, 'success')
        }

        const apiData = response.data.data || response.data
        
        const previewUrlValue = apiData.s3PreviewUrl || apiData.previewUrl || apiData.preview_url || ''
      
        const customMusic: Voice = {
          id: apiData.id || apiData._id || '',
          _id: apiData._id || apiData.id || '',
          name: apiData.name || fileName,
          type: 'custom',
          isCustom: true,
          s3FullTrackUrl: apiData.s3FullTrackUrl || apiData.url || '',
          previewUrl: previewUrlValue,
          preview_url: previewUrlValue,
        }

        if (onCustomMusicUpload) {
          onCustomMusicUpload(customMusic)
        }
      } else {
        if (response.message) {
          showNotification(response.message, 'error')
        }
        throw new Error(response.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Error uploading custom music:', error)
      const errorMessage = error instanceof Error ? error.message : undefined
      if (errorMessage) {
        showNotification(errorMessage, 'error')
      }
    } finally {
      setIsUploadingMusic(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Only set dragging to false if we're leaving the drop zone entirely
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      e.dataTransfer.dropEffect = 'copy'
    }
  }

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      // Validate file type
      if (!file.type.includes('mp3') && !file.name.toLowerCase().endsWith('.mp3')) {
        showNotification('Please upload an MP3 file only', 'error')
        return
      }
      
      // Create a synthetic change event to reuse handleFileSelect
      const syntheticEvent = {
        target: {
          files: files
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>
      
      await handleFileSelect(syntheticEvent)
    }
  }

  const selectedVoiceId = useMemo(() => {
    console.log('🎤 VoiceSelector - Calculating selectedVoiceId:', {
      selectedVoiceId: selectedVoice?.id,
      selectedVoiceName: selectedVoice?.name,
      currentValue: currentValue,
      voicesCount: voices.length,
      voicesTypes: voices.map(v => ({ name: v.name, type: v.type }))
    })
    
    if (selectedVoice?.id) {
      console.log('🎤 VoiceSelector - Using selectedVoice.id (source of truth):', selectedVoice.id, selectedVoice.name)
      return selectedVoice.id
    }

    if (currentValue && voices.some(v => v.id === currentValue)) {
      const foundVoice = voices.find(v => v.id === currentValue)
      console.log('🎤 VoiceSelector - Using currentValue from voices list (fallback):', currentValue, foundVoice?.name)
      return currentValue
    }
    
    console.log('🎤 VoiceSelector - No valid selectedVoiceId, returning null')
    return null
  }, [selectedVoice, currentValue, voices])

  const displayedName = selectedVoice?.name || (currentValue ? voices.find(v => v.id === currentValue)?.name : null) || ''
  const wordCount = (displayedName || '').trim().split(/\s+/).filter(Boolean).length
  const isShortContent = wordCount <= 4

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
        className={`w-full px-4 py-[10.5px] ${isShortContent ? 'text-[18px]' : 'text-[14px]'} font-normal bg-[#EEEEEE] hover:bg-[#F5F5F5] border-0 rounded-[8px] text-left transition-all duration-300 focus:outline-none focus:ring focus:ring-[#5046E5] focus:bg-white flex items-center justify-between cursor-pointer overflow-hidden ${
          hasError ? 'ring-2 ring-red-500' : ''
        } ${selectedVoice || currentValue ? 'text-gray-800 bg-[#F5F5F5]' : 'text-[#11101066]'}`}
        aria-describedby={hasError ? `${field}-error` : undefined}
      >
        <span>{displayValue}</span>
        <IoMdArrowDropdown
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-[9999] w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)] max-w-[685px] mt-2 bg-white rounded-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden md:right-auto -right-[28] lg:right-auto lg:left-0 xl:-left-16">
          <div className="flex divide-x divide-[#E0E0E0] py-7 lg:flex-row flex-col lg:h-[500px] h-[700px] overflow-hidden max-h-[calc(100vh-200px)]">
            <VoiceTypeSelector
              currentType={voiceType}
              onTypeChange={handleVoiceTypeChange}
              disabled={false}
              title={typeSelectorTitle}
              description={typeSelectorDescription}
              lowLabel={typeSelectorLowLabel}
              mediumLabel={typeSelectorMediumLabel}
              highLabel={typeSelectorHighLabel}
              customLabel={typeSelectorCustomLabel}
              hasCustomVoices={hasCustomVoices}
              hasTrending={hasTrending}
              trendingLabel={trendingLabel}
            />

            {isMusicSelector && voiceType === 'custom' ? (
              <div className="flex-1 bg-white px-0 overflow-y-auto">
                <h4 className="text-[20px] font-semibold text-[#5F5F5F] mb-5 lg:mt-0 mt-6 px-3">{listTitle}</h4>
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp3,audio/mpeg"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Professional Upload Area */}
                {isUploadingMusic ? (
                  <div className={`flex flex-col items-center justify-center ${hasCustomMusic ? 'py-4' : 'py-12'}`}>
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-[#5046E5] border-t-transparent mb-4"></div>
                      <span className="text-base text-[#5F5F5F]">Uploading music...</span>
                    </div>
                  </div>
                ) : hasCustomMusic ? (
                  // Compact design when music exists
                  <div
                    className={`border mx-3 border-dashed rounded-[8px] transition-all duration-300 mb-4 ${
                      isDragging
                        ? 'border-[#5046E5] bg-[#5046E51A]'
                        : 'border-[#D1D5DB] hover:border-[#5046E5] bg-[#F9FAFB]'
                    }`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleFileDrop}
                    onClick={handleUploadClick}
                  >
                    <div className="flex items-center justify-center gap-2 px-4 py-3 cursor-pointer">
                      <Upload className="w-4 h-4 text-[#5046E5]" />
                      <span className="text-sm font-medium text-[#5046E5]">Upload MP3 File</span>
                    </div>
                  </div>
                ) : (
                  // Full size design when no music
                  <div
                    className={`border-2 border-dashed rounded-[12px] transition-all mx-3 duration-300 ${
                      isDragging
                        ? 'border-[#5046E5] bg-[#5046E51A]'
                        : 'border-[#D1D5DB] hover:border-[#5046E5] bg-[#F9FAFB]'
                    }`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleFileDrop}
                    onClick={handleUploadClick}
                  >
                    <div className="flex flex-col items-center justify-center py-12 px-6 cursor-pointer">
                      <Upload className="w-10 h-10 text-[#5046E5] mb-4" />
                      <h5 className="text-[16px] font-semibold text-[#101010] mb-2 text-center">
                        Drag and drop MP3 file, or click to upload
                      </h5>
                      <p className="text-[14px] text-[#5F5F5F] mb-4 text-center">
                        MP3 format only
                      </p>
                      <button
                        type="button"
                        className="px-5 py-2 bg-[#5046E5] text-white rounded-[8px] font-medium hover:bg-[#4338CA] transition-colors duration-200"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleUploadClick()
                        }}
                      >
                        Browse files
                      </button>
                    </div>
                  </div>
                )}

                {/* Show custom music list if available */}
                {hasCustomMusic && (
                  <div className="mt-6 px-3">
                    <h5 className="text-base font-semibold text-[#5F5F5F] mb-4">Your Uploaded Music</h5>
                    <VoiceList
                      key={`custom-music-${voices.filter(v => v.type === 'custom').length}-${voices.filter(v => v.type === 'custom').map(v => v.id).join('-')}`}
                      voices={voices}
                      voiceType="custom"
                      voicesLoading={false}
                      voicesError={null}
                      selectedVoiceId={selectedVoiceId}
                      playingVoiceId={playingVoiceId}
                      voiceProgress={voiceProgress}
                      onVoiceSelect={handleVoiceSelection}
                      onVoicePlay={handlePlayPreview}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onDrop={handleDrop}
                      title=""
                      loadingText={listLoadingText}
                      emptyText={listEmptyText}
                    />
                  </div>
                )}
              </div>
            ) : voiceType === 'trending' ? (
              <VoiceList
                voices={trendingMusic}  // Show trending music
                voiceType="trending"  // Used for filtering in VoiceList
                voicesLoading={isLoadingTrending}
                voicesError={null}
                selectedVoiceId={selectedVoiceId}
                playingVoiceId={playingVoiceId}
                voiceProgress={voiceProgress}
                onVoiceSelect={handleVoiceSelection}
                onVoicePlay={handlePlayPreview}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={handleDrop}
                title={listTitle || 'Trending Music'}
                loadingText={listLoadingText || 'Loading trending music...'}
                emptyText={listEmptyText || 'No trending music available'}
              />
            ) : (
              <VoiceList
                voices={voices}  // Already filtered by parent component
                voiceType={voiceType}  // Used for filtering in VoiceList
                voicesLoading={voicesLoading}
                voicesError={voicesError}
                selectedVoiceId={selectedVoiceId}
                playingVoiceId={playingVoiceId}
                voiceProgress={voiceProgress}
                onVoiceSelect={handleVoiceSelection}
                onVoicePlay={handlePlayPreview}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={handleDrop}
                title={listTitle}
                loadingText={listLoadingText}
                emptyText={listEmptyText}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

