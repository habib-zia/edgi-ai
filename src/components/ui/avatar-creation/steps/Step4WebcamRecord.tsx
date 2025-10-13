'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, ArrowLeft, Square, Play } from 'lucide-react'

interface AvatarData {
  name: string
  age: string
  gender: string
  ethnicity: string
  videoFile: File | null
  photoFiles: File[]
  avatarType: 'digital-twin' | 'photo-avatar' | null
}

interface Step4WebcamRecordProps {
  onNext: () => void
  onBack: () => void
  avatarData: AvatarData
  setAvatarData: (data: AvatarData) => void
}

export default function Step4WebcamRecord({ onNext, onBack, avatarData, setAvatarData }: Step4WebcamRecordProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      setStream(mediaStream)
      setHasPermission(true)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      setHasPermission(false)
    }
  }

  const startRecording = () => {
    if (!stream) return

    recordedChunksRef.current = []
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9'
    })

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
      const file = new File([blob], 'webcam-recording.webm', { type: 'video/webm' })
      setAvatarData({ ...avatarData, videoFile: file })
    }

    mediaRecorderRef.current = mediaRecorder
    mediaRecorder.start()
    setIsRecording(true)
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-[24px] font-semibold text-[#282828] mb-2">
          Record via webcam
        </h3>
        <p className="text-[16px] text-[#667085]">
          Record directly from your camera and microphone
        </p>
      </div>

      {/* Camera View */}
      <div className="flex justify-center">
        <div className="relative">
          {!hasPermission ? (
            <div className="w-96 h-64 bg-[#EEEEEE] rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-16 h-16 text-[#98A2B3] mx-auto mb-4" />
                <p className="text-[16px] text-[#667085] mb-4">
                  Camera not started
                </p>
                <button
                  onClick={startCamera}
                  className="bg-[#5046E5] text-white px-6 py-2 rounded-full font-medium hover:bg-[#4338CA] transition-colors duration-300"
                >
                  Turn on Cam & Mic
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-96 h-64 bg-black rounded-lg"
              />
              {isRecording && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  REC
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recording Controls */}
      {hasPermission && (
        <div className="flex justify-center gap-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 bg-[#5046E5] text-white px-6 py-2 rounded-full font-medium hover:bg-[#4338CA] transition-colors duration-300"
            >
              <Play className="w-4 h-4" />
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 bg-red-500 text-white px-6 py-2 rounded-full font-medium hover:bg-red-600 transition-colors duration-300"
            >
              <Square className="w-4 h-4" />
              Stop Recording
            </button>
          )}
        </div>
      )}

      {/* Permission Info */}
      <div className="text-center">
        <p className="text-[12px] text-[#98A2B3]">
          Your browser may ask for permission to use your camera and microphone.
        </p>
      </div>

      {/* Selected File */}
      {avatarData.videoFile && (
        <div className="bg-[#F0F0FF] border border-[#5046E5] rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Camera className="w-6 h-6 text-[#5046E5]" />
            <div className="flex-1">
              <p className="text-[14px] font-medium text-[#282828]">
                {avatarData.videoFile.name}
              </p>
              <p className="text-[12px] text-[#667085]">
                {(avatarData.videoFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#667085] hover:text-[#5046E5] transition-colors duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex gap-3">
          <button
            onClick={onNext}
            className="px-6 py-[11.4px] bg-[#5046E5] text-white rounded-full font-semibold text-[18px] hover:bg-[#4338CA] transition-colors duration-300"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  )
}
