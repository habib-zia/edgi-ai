'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Mic, X } from 'lucide-react'
import { MAX_AUDIO_SIZE, MAX_AUDIO_DURATION, SUPPORTED_AUDIO_FORMATS } from './constants'
import { useAudioRecording } from './hooks/useAudioRecording'
import { AvatarData } from '../AvatarCreationModal'

interface VoiceAudioUploadProps {
  onNext: () => void
  onBack: () => void
  avatarData: AvatarData
  setAvatarData: (data: AvatarData) => void
}

export default function VoiceAudioUpload({ onNext, onBack, avatarData, setAvatarData }: VoiceAudioUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const { isRecording, recordingTime, error: recordingError, startRecording, stopRecording, requestMicrophone, stopMicrophone, formatTime } = useAudioRecording()

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    if (file.size > MAX_AUDIO_SIZE) return { isValid: false, error: 'File size must be less than 10MB' };
    if (!SUPPORTED_AUDIO_FORMATS.includes(file.type)) return { isValid: false, error: 'Only MP3, WAV, WebM, OGG, M4A, and AAC files are supported' };
    return { isValid: true };
  };

  const validateAudioDuration = (file: File): Promise<{ isValid: boolean; error?: string }> => {
    return new Promise((resolve) => {
      const audio = document.createElement('audio');
      audio.preload = 'metadata';
      
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(audio.src);
        const duration = audio.duration;
        
        if (isNaN(duration) || duration === 0) {
          resolve({ isValid: false, error: 'Unable to read audio metadata. The file may be corrupted.' });
          return;
        }
        
        if (!isFinite(duration) || duration === Infinity) {
          // If duration is infinite (can happen with some formats), skip duration validation
          resolve({ isValid: true });
          return;
        }
        
        if (duration > MAX_AUDIO_DURATION) {
          const minutes = Math.floor(MAX_AUDIO_DURATION / 60);
          const seconds = MAX_AUDIO_DURATION % 60;
          resolve({ isValid: false, error: `Audio is too long (${Math.round(duration)}s). Maximum duration is ${minutes} minute${minutes !== 1 ? 's' : ''}${seconds > 0 ? ` and ${seconds} seconds` : ''}.` });
          return;
        }
        
        resolve({ isValid: true });
      };
      
      audio.onerror = () => {
        URL.revokeObjectURL(audio.src);
        resolve({ isValid: false, error: 'Unable to load audio. The file may be corrupted or in an unsupported format.' });
      };
      
      audio.src = URL.createObjectURL(file);
    });
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    
    // Validate file size and format
    const validation = validateFile(file);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file');
      setIsProcessing(false);
      return;
    }
    
    // Validate audio duration
    const durationValidation = await validateAudioDuration(file);
    if (!durationValidation.isValid) {
      setError(durationValidation.error || 'Invalid audio duration');
      setIsProcessing(false);
      return;
    }
    
    setAvatarData({ ...avatarData, audioFile: file });
    setIsProcessing(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('audio/'));
    if (file) processFile(file);
  }

  const handleRecordClick = async () => {
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
    <div className="space-y-6 pr-2">
      <div className="text-left">
        <p className="text-[18px] text-[#5F5F5F] font-normal leading-[24px]">
          Upload or record audio to create your voice avatar
        </p>
      </div>

      {!avatarData.audioFile && !isRecording && (
        <div className="flex flex-col gap-4">
          <div className={`rounded-[12px] md:p-8 p-4 border min-h-[280px] flex flex-col items-center justify-center text-center transition-colors duration-300 ${dragActive ? 'border-[#5046E5] bg-[#F5F7FC]' : 'border-[#F5F7FC] hover:border-[#5046E5] bg-[#F5F7FC]'}`}
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
            <button onClick={() => fileInputRef.current?.click()} className="bg-transparent text-[#7C6FFF] px-[27px] py-2 rounded-[6px] hover:bg-[#7C6FFF] transition-colors duration-300 border border-[#7C6FFF] hover:text-white flex items-center justify-center gap-x-3 text-base font-normal leading-[24px] mx-auto">
              <svg width="23" height="22" viewBox="0 0 23 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.6094 8.00195C18.7844 8.01395 19.9624 8.11095 20.7304 8.87895C21.6094 9.75795 21.6094 11.172 21.6094 14V15C21.6094 17.829 21.6094 19.243 20.7304 20.122C19.8524 21 18.4374 21 15.6094 21H7.60938C4.78137 21 3.36637 21 2.48837 20.122C1.60937 19.242 1.60938 17.829 1.60938 15V14C1.60938 11.172 1.60937 9.75795 2.48837 8.87895C3.25637 8.11095 4.43438 8.01395 6.60938 8.00195" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M11.6094 14V1M11.6094 1L14.6094 4.5M11.6094 1L8.60938 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Select File
            </button>
            <p className="text-[16px] font-normal leading-[24px] text-[#7C6FFF] pt-5">Drag and Drop Recording to upload</p>
            <p className="text-[14px] text-[#5F5F5F] font-normal leading-[18px] pt-3">Audio file up to 10MB</p>
            <input ref={fileInputRef} type="file" accept="audio/*" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} className="hidden" />
          </div>
          <button onClick={handleRecordClick} className="bg-[#5046E5] text-white px-8 py-3 rounded-full font-medium hover:bg-[#4338CA] transition-colors duration-300 flex items-center gap-2 justify-center">
            <Mic className="w-5 h-5" />
            Record Audio
          </button>
        </div>
      )}

      {isRecording && (
        <div className="flex flex-col items-center gap-4 p-8">
          <p className="text-[18px] font-semibold text-[#101010]">
            {isRecording ? `Recording •` : 'Start Recording'} {formatTime(recordingTime)}
          </p>
          <div className="flex items-center gap-4">
            <button onClick={stopMicrophone} className="bg-gray-500 text-white px-4 py-2 rounded-full">
              <X className="w-4 h-4" />
            </button>
            {isRecording ? (
              <button onClick={stopRecording} className="bg-red-500 text-white px-6 py-2 rounded-full">
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
      {isProcessing && <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg"><div className="flex items-center gap-2"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div><p className="text-blue-600 text-sm">Processing file...</p></div></div>}

      <div className="flex flex-col gap-2 pt-5">
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
