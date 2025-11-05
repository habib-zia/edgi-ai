'use client'

import { ArrowLeft } from 'lucide-react'
import ConsentScript from "./components/ConsentScript";
import ErrorDisplay from "./components/ErrorDisplay";
import UploadArea from "./components/UploadArea";
import CameraControls from "./components/CameraControls";
import VideoPreview from "./components/VideoPreview";
import { useVideoConsent } from "./hooks/useVideoConsent";
import { MIN_VIDEO_DURATION, MAX_VIDEO_DURATION } from "./constants";

interface AvatarData {
  name: string
  age: string
  gender: string
  ethnicity: string
  videoFile: File | null
  consentVideoFile: File | null
  photoFiles: File[]
  avatarType: 'digital-twin' | 'photo-avatar' | null
}

interface VideoAvatarStep2Props {
  onNext: () => void
  onBack?: () => void
  avatarData: AvatarData
  setAvatarData: (data: AvatarData) => void
}

export default function VideoAvatarStep2({ onNext, onBack, avatarData, setAvatarData }: VideoAvatarStep2Props) {
  const {
    // Refs
    videoRef,
    videoPreviewRef,
    fileInputRef,
    
    // State
    videoPreview,
    error,
    cameraError,
    isDragging,
    isProcessing,
    isRecording,
    isCameraOpen,
    recordingTime,
    videoDuration,
    isVideoMetadataLoading,
    
    // Actions
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleInputChange,
    startCamera,
    startRecording,
    stopRecording,
    stopCamera,
    clearSelection,
    handleContinue,
    setError,
    setCameraError,
    setIsVideoMetadataLoading,
    
    // Computed
    canProceed
  } = useVideoConsent(avatarData, setAvatarData);

  return (
    <div className="bg-white flex flex-col h-full">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Title Section */}
        <div className="text-center mb-10">
          <h2 className="text-[24px] font-semibold text-[#101010] mb-6">
            Record your consent video
          </h2>
          <p className="text-[18px] text-[#5F5F5F] max-w-[710px] mx-auto leading-[24px] mb-6">
            Please record a video where you clearly read the consent statement below.
          </p>
          
          <ConsentScript 
            minDuration={MIN_VIDEO_DURATION} 
            maxDuration={MAX_VIDEO_DURATION} 
          />
        </div>

        {/* Error Display */}
        <ErrorDisplay 
          error={error}
          cameraError={cameraError}
          onClear={() => {
                  setError(null);
                  setCameraError(null);
                }}
        />

        {/* Camera/Recording Area */}
        <div 
          className={`border-[2px] rounded-[8px] p-8 max-w-full w-full border-dashed transition-all min-h-[400px] duration-300 ${
            isDragging 
              ? 'border-[#6366F1] bg-[#6366F1]/5 border-2' 
              : 'border-[#D1D5DB]'
          } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {!avatarData.consentVideoFile ? (
            <div className="flex flex-col items-center justify-center gap-6 h-full">
              {!isCameraOpen ? (
                <>
                  <CameraControls
                    isCameraOpen={isCameraOpen}
                    isRecording={isRecording}
                    recordingTime={recordingTime}
                    maxDuration={MAX_VIDEO_DURATION}
                    onStartCamera={startCamera}
                    onStartRecording={startRecording}
                    onStopRecording={stopRecording}
                    onStopCamera={stopCamera}
                    videoPreviewRef={videoPreviewRef}
                  />
                  
                  <div className="flex items-center gap-4 w-full max-w-[400px]">
                    <div className="flex-1 h-px bg-[#D1D5DB]"></div>
                    <span className="text-[14px] text-[#9CA3AF]">OR</span>
                    <div className="flex-1 h-px bg-[#D1D5DB]"></div>
                  </div>
                  
                  <UploadArea
                    isDragging={isDragging}
                    isProcessing={isProcessing}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onFileSelect={() => fileInputRef.current?.click()}
                    fileInputRef={fileInputRef}
                    onInputChange={handleInputChange}
                  />
                </>
              ) : (
                <CameraControls
                  isCameraOpen={isCameraOpen}
                  isRecording={isRecording}
                  recordingTime={recordingTime}
                  maxDuration={MAX_VIDEO_DURATION}
                  onStartCamera={startCamera}
                  onStartRecording={startRecording}
                  onStopRecording={stopRecording}
                  onStopCamera={stopCamera}
                  videoPreviewRef={videoPreviewRef}
                />
              )}
            </div>
          ) : (
            <VideoPreview
              videoPreview={videoPreview}
              videoFile={avatarData.consentVideoFile}
              videoDuration={videoDuration}
              isVideoMetadataLoading={isVideoMetadataLoading}
              onClear={clearSelection}
              onReRecord={() => {
                clearSelection();
                startCamera();
              }}
              videoRef={videoRef}
              onLoadStart={() => setIsVideoMetadataLoading(true)}
              onLoadedMetadata={(duration) => {
                      setIsVideoMetadataLoading(false);
                        console.log('Video metadata loaded, duration:', duration);
                        if (isFinite(duration) && duration > 0) {
                  // This will be handled by the hook
                }
              }}
              onError={() => setError('Failed to load video preview. The file may be corrupted.')}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col gap-2 mt-12 w-full">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-[#667085] hover:text-[#5046E5] transition-colors duration-300 w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}
          <button
            onClick={() => handleContinue(onNext)}
            disabled={!canProceed}
            className={`px-8 py-[11.3px] font-semibold text-[20px] rounded-full transition-all duration-300 w-full border-2 ${
              canProceed
                ? 'bg-[#5046E5] text-white hover:text-[#5046E5] hover:bg-transparent border-[#5046E5] cursor-pointer'
                : 'bg-[#D1D5DB] text-[#9CA3AF] border-[#D1D5DB] cursor-not-allowed'
            }`}
          >
            {isProcessing ? 'Processing...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}