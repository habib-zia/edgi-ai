'use client'

import { useRef } from 'react'
import { Mic, X, CheckCircle2 } from 'lucide-react'
import { MIN_AUDIO_DURATION, MAX_AUDIO_DURATION } from './constants'
import { formatFileSize } from './utils/voiceRecordingUtils'

interface VoiceRecordingSlotProps {
  slotIndex: number
  file: File | null
  blobUrl: string | undefined
  isRecording: boolean
  recordingTime: number
  formatTime: (seconds: number) => string
  onRecord: () => void
  onStop: () => void
  onCancel: () => void
  onDelete: () => void
  disabled?: boolean
}

export default function VoiceRecordingSlot({
  slotIndex,
  file,
  blobUrl,
  isRecording,
  recordingTime,
  formatTime,
  onRecord,
  onStop,
  onCancel,
  onDelete,
  disabled = false
}: VoiceRecordingSlotProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const isRecorded = file !== null && !isRecording

  return (
    <div className={`border transition-all duration-300 ${isRecorded ? 'border-green-500' : 'border-gray-200'} rounded-lg p-4 space-y-4 ${isRecorded ? 'bg-green-50/50' : 'hover:bg-gray-50'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-[16px] font-semibold text-[#101010]">
            Voice Sample {slotIndex + 1}
            {slotIndex === 0 && <span className="text-red-500 ml-1">*</span>}
            {slotIndex > 0 && <span className="text-[#5F5F5F] text-sm font-normal ml-2">(Optional)</span>}
          </h3>
          {isRecorded && <CheckCircle2 className="w-5 h-5 text-green-500" />}
        </div>
        {isRecorded && (
          <button 
            onClick={onDelete} 
            className="text-red-500 hover:text-red-700 transition-colors"
            aria-label="Delete recording"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {!file && !isRecording && (
        <div className="flex flex-col items-center justify-center py-6">
          <button 
            onClick={onRecord} 
            disabled={disabled}
            className="bg-[#5046E5] hover:bg-transparent hover:text-[#5046E5] text-white px-8 py-3 rounded-full font-medium hover:bg-[#4338CA] transition-colors duration-300 flex items-center gap-3 justify-center text-base disabled:opacity-50 disabled:cursor-not-allowed border-2 border-[#5046E5]"
          >
            <Mic className="w-5 h-5" />
            Start Recording
          </button>
        </div>
      )}

      {isRecording && (
        <div className="flex flex-col items-center gap-4 p-4">
          <p className="text-[16px] font-semibold text-[#101010]">
            Recording Voice {slotIndex + 1} • {formatTime(recordingTime)}
          </p>
          {recordingTime < MIN_AUDIO_DURATION && recordingTime < MAX_AUDIO_DURATION && (
            <p className="text-[14px] text-orange-600 font-normal">
              Continue recording... Minimum {MIN_AUDIO_DURATION} seconds required ({recordingTime}s)
            </p>
          )}
          {recordingTime >= MAX_AUDIO_DURATION && (
            <p className="text-[14px] text-green-600 font-normal">
              Recording complete! Saving audio file...
            </p>
          )}
          <div className="flex items-center gap-4">
            <button 
              onClick={onCancel} 
              className="bg-gray-500 text-white px-4 py-2 rounded-full hover:bg-gray-600 transition-colors"
              aria-label="Cancel recording"
            >
              <X className="w-4 h-4" />
            </button>
            <button 
              onClick={onStop} 
              disabled={recordingTime < MIN_AUDIO_DURATION}
              className={`px-6 py-2 rounded-full transition-colors ${
                recordingTime >= MIN_AUDIO_DURATION 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              aria-label="Stop recording"
            >
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </button>
          </div>
        </div>
      )}

      {isRecorded && file && (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50/50 rounded-lg">
            <div>
              <p className="font-semibold text-[#101010] text-sm">{file.name}</p>
              <p className="text-xs text-[#5F5F5F]">{formatFileSize(file.size)}</p>
            </div>
          </div>
          {blobUrl && (
            <audio 
              ref={audioRef} 
              src={blobUrl} 
              controls 
              className="w-full"
              preload="metadata"
            />
          )}
        </div>
      )}
    </div>
  )
}

