'use client'

import { useRef, useState } from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";

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

interface VideoAvatarStep1Props {
  onNext: () => void
  avatarData: AvatarData
  setAvatarData: (data: AvatarData) => void
}

interface ValidationError {
  type: string;
  message: string;
}

export default function VideoAvatarStep1({ onNext, avatarData, setAvatarData }: VideoAvatarStep1Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const validateVideo = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const errors: ValidationError[] = [];
      
      // Check file format
      if (file.type !== 'video/mp4') {
        errors.push({
          type: 'format',
          message: 'Only MP4 format is supported'
        });
      }

      // Create video element to check duration and resolution
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        
        // Check duration (minimum 2 minutes = 120 seconds)
        if (video.duration < 120) {
          errors.push({
            type: 'duration',
            message: `Video is too short (${Math.round(video.duration)}s). Minimum duration is 2 minutes`
          });
        }

        // Check resolution (minimum 720p)
        if (video.videoHeight < 720) {
          errors.push({
            type: 'quality',
            message: `Video quality is too low (${video.videoWidth}x${video.videoHeight}). Minimum height is 720px`
          });
        }

        setValidationErrors(errors);
        
        if (errors.length === 0) {
          setIsValid(true);
          resolve(true);
        } else {
          setIsValid(false);
          resolve(false);
        }
        
        setIsValidating(false);
      };

      video.onerror = () => {
        errors.push({
          type: 'error',
          message: 'Failed to load video file'
        });
        setValidationErrors(errors);
        setIsValid(false);
        setIsValidating(false);
        resolve(false);
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    setIsValidating(true);
    setValidationErrors([]);
    setIsValid(false);
    
    // Create preview
    const preview = URL.createObjectURL(file);
    setVideoPreview(preview);
    setAvatarData({ ...avatarData, videoFile: file });

    // Validate video
    await validateVideo(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const clearSelection = () => {
    setAvatarData({ ...avatarData, videoFile: null });
    setVideoPreview(null);
    setValidationErrors([]);
    setIsValid(false);
    setIsValidating(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const canProceed = avatarData.videoFile && isValid && !isValidating;

  return (
    <div className="bg-white flex flex-col h-full">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Title Section */}
        <div className="text-center mb-10">
          <h2 className="text-[24px] font-semibold text-[#101010] mb-6 tracking-[-2%] leading-[120%]">
            Upload your footage
          </h2>
          <p className="text-[18px] text-[#5F5F5F] max-w-[710px] mx-auto leading-[24px]">
          For optimal, most test realistic results, we recommend uploading a 2min video recorded with a high-resolution camera or smartphone.If you&apos;re just testing the product, feel free to submit a 30s recording using your webcam.
          </p>
        </div>

        {/* Upload Area */}
        <div 
          className={`border-[2px] rounded-[8px] p-8 max-w-full w-full border-dashed transition-all min-h-[240px] duration-300 ${
            isDragging 
              ? 'border-[#6366F1] bg-[#6366F1]/5 border-2' 
              : validationErrors.length > 0 && !isValidating
              ? 'border-red-500'
              : isValid && !isValidating
              ? 'border-green-500'
              : 'border-[#D1D5DB]'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {!avatarData.videoFile ? (
            <div className="flex flex-col items-center justify-between gap-4 h-full">
              <h1 className="text-[20px] font-semibold text-[#101010] leading-[120%]">
                Drag and drop video, or click to upload
              </h1>
              <p className="text-[14px] text-[#5F5F5F] max-w-[432px] mx-auto text-center leading-[18px]">
                MP4 format only, minimum 720p resolution, minimum 2 minutes duration
              </p>
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="text-[#6366F1] font-normal transition-colors duration-300 hover:text-[#5046E5] text-[14px]"
              >
                Browse local files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4"
                onChange={handleInputChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Video Preview */}
              {videoPreview && (
                <div className="relative rounded-lg overflow-hidden bg-black">
                  <video
                    ref={videoRef}
                    src={videoPreview}
                    controls
                    className="w-full max-h-[300px] object-contain"
                  />
                </div>
              )}

              {/* File Info and Status */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-[16px] font-medium text-[#101010]">
                      {avatarData.videoFile.name}
                    </p>
                    {isValidating && (
                      <span className="text-[12px] text-[#6366F1]">Validating...</span>
                    )}
                    {isValid && !isValidating && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {validationErrors.length > 0 && !isValidating && (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <p className="text-[14px] text-[#5F5F5F]">
                    {(avatarData.videoFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>

                  {/* Validation Errors */}
                  {validationErrors.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {validationErrors.map((error, index) => (
                        <div key={index} className="flex items-start gap-2 text-red-600 text-[14px]">
                          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{error.message}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Success Message */}
                  {isValid && !isValidating && (
                    <div className="mt-3 flex items-start gap-2 text-green-600 text-[14px]">
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>Video meets all requirements</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={clearSelection}
                  className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors duration-300"
                  title="Clear selection"
                >
                  <X className="w-5 h-5 text-[#5F5F5F]" />
                </button>
              </div>

              {/* Change File Button */}
              <button 
                onClick={() => {
                  clearSelection();
                  setTimeout(() => fileInputRef.current?.click(), 100);
                }} 
                className="text-[#6366F1] font-normal transition-colors duration-300 hover:text-[#5046E5] text-[14px] text-left"
              >
                Choose a different file
              </button>
            </div>
          )}
        </div>

        {/* Create Button */}
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`px-8 py-[11.3px] font-semibold text-[20px] mt-12 rounded-full transition-all duration-300 w-full border-2 ${
            canProceed
              ? 'bg-[#5046E5] text-white hover:text-[#5046E5] hover:bg-transparent border-[#5046E5] cursor-pointer'
              : 'bg-[#D1D5DB] text-[#9CA3AF] border-[#D1D5DB] cursor-not-allowed'
          }`}
        >
          {isValidating ? 'Validating...' : 'Create'}
        </button>
      </div>
    </div>
  );
}