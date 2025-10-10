'use client'

import { Camera, Play, Square } from "lucide-react"

interface CameraControlsProps {
  isCameraOpen: boolean
  isRecording: boolean
  recordingTime: number
  maxDuration: number
  onStartCamera: () => void
  onStartRecording: () => void
  onStopRecording: () => void
  onStopCamera: () => void
  videoPreviewRef: React.RefObject<HTMLVideoElement | null>
}

export default function CameraControls({
  isCameraOpen,
  isRecording,
  recordingTime,
  maxDuration,
  onStartCamera,
  onStartRecording,
  onStopRecording,
  onStopCamera,
  videoPreviewRef
}: CameraControlsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isCameraOpen) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 h-full">
        <button 
          onClick={onStartCamera}
          className="bg-[#5046E5] text-white px-8 py-3 rounded-full font-medium hover:bg-[#4338CA] transition-colors duration-300 flex items-center gap-2"
        >
          <Camera className="w-5 h-5" />
          Turn on Camera & Microphone
        </button>
        <p className="text-[16px] text-[#5F5F5F] text-center max-w-[400px]">
          Your browser may ask for permission to use your camera and microphone. 
          Please allow access to record your consent video.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Camera Preview */}
      <div className="relative bg-black rounded-lg overflow-hidden w-full max-w-[640px]">
        <video
          ref={videoPreviewRef}
          autoPlay
          muted
          playsInline
          className="w-full h-auto min-h-[300px]"
        />
        {isRecording && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            REC {formatTime(recordingTime)}
          </div>
        )}
        {isRecording && recordingTime >= maxDuration - 10 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm">
            Recording will stop in {maxDuration - recordingTime}s
          </div>
        )}
      </div>
      
      {/* Recording Controls */}
      <div className="flex items-center gap-4">
        {!isRecording ? (
          <button
            onClick={onStartRecording}
            className="bg-red-500 text-white px-6 py-2 rounded-full font-medium hover:bg-red-600 transition-colors duration-300 flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Start Recording
          </button>
        ) : (
          <button
            onClick={onStopRecording}
            className="bg-red-500 text-white px-6 py-2 rounded-full font-medium hover:bg-red-600 transition-colors duration-300 flex items-center gap-2"
          >
            <Square className="w-4 h-4" />
            Stop Recording
          </button>
        )}
        
        <button
          onClick={onStopCamera}
          disabled={isRecording}
          className="bg-gray-500 text-white px-6 py-2 rounded-full font-medium hover:bg-gray-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Close Camera
        </button>
      </div>
      
      <p className="text-[14px] text-[#5F5F5F] text-center max-w-[500px]">
        Ensure good lighting and speak clearly. Recording will automatically stop after {maxDuration} seconds.
      </p>
    </div>
  )
}
