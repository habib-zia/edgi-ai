'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Mic, X } from 'lucide-react'
import { MIN_AUDIO_DURATION, MAX_AUDIO_DURATION } from './constants'
import { useAudioRecording } from './hooks/useAudioRecording'
import { AvatarData } from '../AvatarCreationModal'

interface VoiceAudioUploadProps {
  onNext: () => void
  onBack: () => void
  avatarData: AvatarData
  setAvatarData: (data: AvatarData) => void
}

export default function VoiceAudioUpload({ onNext, onBack, avatarData, setAvatarData }: VoiceAudioUploadProps) {
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const { isRecording, recordingTime, error: recordingError, startRecording, stopRecording, requestMicrophone, stopMicrophone, formatTime } = useAudioRecording()

  const handleRecordClick = async () => {
    setError(null)
    const hasAccess = await requestMicrophone();
    if (hasAccess) {
      startRecording(
        (file) => setAvatarData({ ...avatarData, audioFile: file }),
        (err) => setError(err)
      );
    }
  }

  useEffect(() => {
    if (recordingError) setError(recordingError);
  }, [recordingError]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        <div className="text-left">
          <p className="text-[18px] text-[#5F5F5F] font-normal leading-[24px]">
            Record audio to create your voice avatar
          </p>
          <p className="text-[14px] text-[#5F5F5F] font-normal leading-[18px] mt-2">
            Recording duration: minimum {MIN_AUDIO_DURATION} seconds, maximum {MAX_AUDIO_DURATION / 60} minutes
          </p>
        </div>

        {!avatarData.audioFile && !isRecording && (
          <div className="flex flex-col items-center justify-center py-8">
            <button onClick={handleRecordClick} className="bg-[#5046E5] text-white px-12 py-4 rounded-full font-medium hover:bg-[#4338CA] transition-colors duration-300 flex items-center gap-3 justify-center text-lg">
              <Mic className="w-6 h-6" />
              Start Recording
            </button>
          </div>
        )}

        {isRecording && (
          <div className="flex flex-col items-center gap-4 p-6">
            <p className="text-[18px] font-semibold text-[#101010]">
              {isRecording ? `Recording •` : 'Start Recording'} {formatTime(recordingTime)}
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
              <button onClick={stopMicrophone} className="bg-gray-500 text-white px-4 py-2 rounded-full">
                <X className="w-4 h-4" />
              </button>
              {isRecording ? (
                <button 
                  onClick={() => stopRecording(recordingTime)} 
                  disabled={recordingTime < MIN_AUDIO_DURATION}
                  className={`px-6 py-2 rounded-full transition-colors ${
                    recordingTime >= MIN_AUDIO_DURATION 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </button>
              ) : (
                <button onClick={handleRecordClick} className="bg-[#5046E5] text-white px-6 py-2 rounded-full">
                  <Mic className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {avatarData.audioFile && !isRecording && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#F5F7FC] rounded-lg">
              <div>
                <p className="font-semibold text-[#101010]">{avatarData.audioFile.name}</p>
                <p className="text-sm text-[#5F5F5F]">{(avatarData.audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button onClick={() => setAvatarData({ ...avatarData, audioFile: null })} className="text-red-500 hover:text-red-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <audio ref={audioRef} src={avatarData.audioFile ? URL.createObjectURL(avatarData.audioFile) : ''} controls className="w-full" />
          </div>
        )}

        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg"><p className="text-red-600 text-sm">{error}</p></div>}
      </div>

      <div className="flex flex-col gap-2 pt-4 mt-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-[#667085] hover:text-[#5046E5] transition-colors duration-300 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button onClick={() => avatarData.audioFile && onNext()} disabled={!avatarData.audioFile}
          className={`px-8 py-[11.3px] font-semibold text-[20px] rounded-full transition-colors duration-300 w-full ${avatarData.audioFile ? 'bg-[#5046E5] text-white hover:text-[#5046E5] hover:bg-transparent border-2 border-[#5046E5]' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
          {isRecording ? 'Submit' : 'Upload'}
        </button>
      </div>
    </div>
  )
}
