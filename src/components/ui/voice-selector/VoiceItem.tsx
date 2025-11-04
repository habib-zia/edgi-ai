'use client'

import { Volume2 } from 'lucide-react'
import Image from 'next/image'
import { Voice } from './types'
import CircularProgress from './CircularProgress'

interface VoiceItemProps {
  voice: Voice
  isSelected: boolean
  isPlaying: boolean
  progress: number
  onSelect: (voice: Voice) => void
  onPlay: (e: React.MouseEvent, voice: Voice) => void
  onDragStart?: (e: React.DragEvent, voice: Voice) => void
  onDragEnd?: (e: React.DragEvent) => void
}

export default function VoiceItem({
  voice,
  isSelected,
  isPlaying,
  progress,
  onSelect,
  onPlay,
  onDragStart,
  onDragEnd
}: VoiceItemProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, voice)}
      onDragEnd={onDragEnd}
      onClick={() => onSelect(voice)}
      className={`flex items-center gap-4 px-2 py-2 rounded-[4px] transition-all duration-300 cursor-pointer ${
        isSelected
          ? 'bg-[#5046E51A] border-2 border-[#5046E5]'
          : 'bg-white hover:bg-[#F0F1F3] border-2 border-transparent'
      }`}
    >
      {voice.thumbnailUrl ? (
        <Image
          src={voice.thumbnailUrl}
          alt={voice.name}
          width={56}
          height={56}
          className="w-[50px] h-[50px] rounded-[6px] object-cover flex-shrink-0"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = '/images/default-voice.png'
          }}
        />
      ) : (
        <div className="w-14 h-14 rounded-[10px] bg-[#E2E8F0] flex items-center justify-center flex-shrink-0">
          <Volume2 className="w-7 h-7 text-[#94A3B8]" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h5 className="text-[13px] font-bold text-[#212121] truncate mb-0.5">
          {voice.name}
        </h5>
        {voice.artist && (
          <p className="text-[11px] text-[#212121] font-medium truncate">
            {voice.artist}
          </p>
        )}
      </div>

      {voice.previewUrl && (
        <button
          onClick={(e) => {
            e.stopPropagation() // Prevent triggering the container's onClick
            onPlay(e, voice)
          }}
          className={`relative flex-shrink-0 w-[30px] h-[30px] rounded-full flex items-center justify-center transition-all duration-200 ${
            isPlaying
              ? 'bg-[#EBE9FE] hover:bg-[#E0DDFE]'
              : 'border-2 border-[#212121] bg-transparent hover:bg-[#212121] text-[#212121] hover:text-white'
          }`}
          aria-label={isPlaying ? `Pause preview for ${voice.name}` : `Play preview for ${voice.name}`}
        >
          {isPlaying ? (
            <>
              <CircularProgress progress={progress} size={37} />
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="10.6667" height="10.6667" rx="1.33333" fill="#5046E5"/></svg>
            </>
          ) : (
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          )}
        </button>
      )}
    </div>
  )
}

