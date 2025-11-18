'use client'

import { useState, useEffect, useMemo } from 'react'
import { ArrowLeft } from 'lucide-react'
import { MIN_AUDIO_DURATION, MAX_AUDIO_DURATION } from './constants'
import { useAudioRecording } from './hooks/useAudioRecording'
import { useBlobUrls } from './hooks/useBlobUrls'
import { AvatarData } from '../AvatarCreationModal'
import VoiceRecordingSlot from './VoiceRecordingSlot'
import { ensureFilesArrayLength, updateFileInArray, getRecordedCount } from './utils/voiceRecordingUtils'

interface VoiceAudioUploadProps { 
  onNext: () => void
  onBack: () => void
  avatarData: AvatarData
  setAvatarData: (data: AvatarData) => void
}

export default function VoiceAudioUpload({ onNext, onBack, avatarData, setAvatarData }: VoiceAudioUploadProps) {
  const [error, setError] = useState<string | null>(null)
  const [activeRecordingSlot, setActiveRecordingSlot] = useState<number | null>(null)
  const SLOT_COUNT = 3
  const paddedFiles = useMemo(() => {
    const audioFiles = avatarData.audioFiles || []
    return ensureFilesArrayLength(audioFiles, SLOT_COUNT)
  }, [avatarData.audioFiles])

  const { blobUrls, revokeBlobUrl } = useBlobUrls(paddedFiles)
  const { isRecording, recordingTime, error: recordingError, startRecording, stopRecording, requestMicrophone, stopMicrophone, formatTime } = useAudioRecording()

  useEffect(() => {
    if (recordingError) {
      setError(recordingError)
      setActiveRecordingSlot(null)
    }
  }, [recordingError])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleRecordClick = async (slotIndex: number) => {
    setError(null)
    setActiveRecordingSlot(slotIndex)
    const hasAccess = await requestMicrophone()
    
    if (hasAccess) {
      startRecording(
        (file) => {
          const updatedFiles = updateFileInArray(paddedFiles, slotIndex, file)
          setAvatarData({ ...avatarData, audioFiles: updatedFiles.filter(f => f !== null) as File[] })
          setActiveRecordingSlot(null)
        },
        (err) => {
          setError(err)
          setActiveRecordingSlot(null)
        }
      )
    } else {
      setActiveRecordingSlot(null)
    }
  }

  const handleStopRecording = () => {
    if (activeRecordingSlot !== null) {
      stopRecording(recordingTime)
      setActiveRecordingSlot(null)
    }
  }

  const handleCancelRecording = () => {
    stopMicrophone()
    setActiveRecordingSlot(null)
  }

  const handleDeleteRecording = (slotIndex: number) => {
    revokeBlobUrl(slotIndex)
    const updatedFiles = updateFileInArray(paddedFiles, slotIndex, null)
    setAvatarData({ ...avatarData, audioFiles: updatedFiles.filter(f => f !== null) as File[] })
  }

  const recordedCount = getRecordedCount(paddedFiles)
  const hasMinimumRequired = recordedCount >= 1

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        <div className="text-left">
          <p className="text-[16px] text-[#5F5F5F] font-normal leading-[24px]">
          Record at least 1 voice sample (required) to create a high-quality voice clone. You can optionally record up to 2 additional samples for better quality. The speaking style in the samples you provide will be replicated in the output, so depending on what delivery you are looking for, the training data should correspond to that style (e.g. if you want a more engaging, up-beat vocalization, make sure your voice reflects the tones and inflections that reflect that style). It is better to just include one style in the uploaded samples for consistencies sake.
          </p>
          <p className="text-[14px] text-[#5F5F5F] font-normal leading-[18px] mt-2">
            Recording duration: minimum {MIN_AUDIO_DURATION} seconds, maximum {MAX_AUDIO_DURATION / 60} minutes per sample
          </p>
          {recordedCount > 0 && (
            <p className="text-[14px] text-[#5046E5] font-medium mt-2">
              Progress: {recordedCount}/{SLOT_COUNT} voice samples recorded (minimum 1 required)
            </p>
          )}
        </div>

        <div className="space-y-4">
          {Array.from({ length: SLOT_COUNT }, (_, index) => (
            <VoiceRecordingSlot
              key={index}
              slotIndex={index}
              file={paddedFiles[index]}
              blobUrl={blobUrls[index]}
              isRecording={activeRecordingSlot === index && isRecording}
              recordingTime={recordingTime}
              formatTime={formatTime}
              onRecord={() => handleRecordClick(index)}
              onStop={handleStopRecording}
              onCancel={handleCancelRecording}
              onDelete={() => handleDeleteRecording(index)}
              disabled={activeRecordingSlot !== null && activeRecordingSlot !== index}
            />
          ))}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 pt-4 mt-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-[#667085] hover:text-[#5046E5] transition-colors duration-300 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button 
          onClick={onNext} 
          disabled={!hasMinimumRequired}
          className={`px-8 py-[11.3px] font-semibold text-[20px] rounded-full transition-colors duration-300 w-full ${
            hasMinimumRequired 
              ? 'bg-[#5046E5] text-white hover:text-[#5046E5] hover:bg-transparent border-2 border-[#5046E5]' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {hasMinimumRequired 
            ? 'Continue' 
            : recordedCount === 0 
              ? 'Record at least 1 voice sample' 
              : `Record ${SLOT_COUNT - recordedCount} more sample${SLOT_COUNT - recordedCount !== 1 ? 's' : ''} (optional)`
          }
        </button>
      </div>
    </div>
  )
}
