'use client'

import { Voice, VoiceType } from './types'
import VoiceItem from './VoiceItem'

interface VoiceListProps {
  voices: Voice[]
  voiceType: VoiceType
  voicesLoading: boolean
  voicesError: string | null
  selectedVoiceId: string | null
  playingVoiceId: string | null
  voiceProgress: Record<string, number>
  onVoiceSelect: (voice: Voice) => void
  onVoicePlay: (e: React.MouseEvent, voice: Voice) => void
  onDragStart?: (e: React.DragEvent, voice: Voice) => void
  onDragEnd?: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent) => void
  onDragLeave?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
  title?: string
  loadingText?: string
  emptyText?: string
}

export default function VoiceList({
  voices,
  voiceType,
  voicesLoading,
  voicesError,
  selectedVoiceId,
  playingVoiceId,
  voiceProgress,
  onVoiceSelect,
  onVoicePlay,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  title = 'Recommended Voice',
  loadingText = 'Loading voices...',
  emptyText
}: VoiceListProps) {
  // Filter voices by the selected voiceType
  // For trending, show all voices passed (they're already filtered)
  const filteredVoices = voiceType === 'trending' 
    ? voices 
    : voices.filter(voice => {
    const matches = voice.type === voiceType
    return matches
  })


  const handleDragOverInner = (e: React.DragEvent) => {
    try {
      e.preventDefault()
      e.stopPropagation()
      if (onDragOver) {
        onDragOver(e)
      }
      const target = e.currentTarget as HTMLElement
      if (target && target.classList) {
        target.classList.add('drag-over')
      }
    } catch {
    }
  }

  const handleDragLeaveInner = (e: React.DragEvent) => {
    try {
      e.stopPropagation()
      if (onDragLeave) {
        onDragLeave(e)
      }
      const target = e.currentTarget as HTMLElement
      if (target && target.classList) {
        target.classList.remove('drag-over')
      }
    } catch {
    }
  }

  const handleDropInner = (e: React.DragEvent) => {
    try {
      e.preventDefault()
      e.stopPropagation()
      
      const target = e.currentTarget as HTMLElement
      if (target && target.classList) {
        target.classList.remove('drag-over')
      }
      
      if (onDrop) {
        onDrop(e)
      }
    } catch {
    }
  }

  return (
    <div 
      className="flex-1 bg-white px-3 overflow-y-auto min-h-0"
      style={{ 
        maxHeight: '100%',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        height: '100%'
      }}
      onDragOver={handleDragOverInner}
      onDragLeave={handleDragLeaveInner}
      onDrop={handleDropInner}
    >
      <h4 className="text-[20px] font-semibold text-[#5F5F5F] mb-5 lg:mt-0 mt-6">{title}</h4>

      {voicesLoading ? (
        <div className="flex flex-col justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-[#5046E5] border-t-transparent"></div>
          <span className="mt-4 text-base text-[#5F5F5F]">{loadingText}</span>
        </div>
      ) : voicesError ? (
        <div className="text-center py-20">
          <p className="text-red-500 text-base font-medium mb-2">Failed to load voices</p>
          <p className="text-base text-[#5F5F5F]">{voicesError}</p>
        </div>
      ) : filteredVoices.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[#A0AEC0] text-base">{emptyText || `No ${voiceType} voices available`}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredVoices.map((voice) => (
            <VoiceItem
              key={voice.id}
              voice={voice}
              isSelected={selectedVoiceId === voice.id}
              isPlaying={playingVoiceId === voice.id}
              progress={voiceProgress[voice.id] || 0}
              onSelect={onVoiceSelect}
              onPlay={onVoicePlay}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ))}
        </div>
      )}
    </div>
  )
}

