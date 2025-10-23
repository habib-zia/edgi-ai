import { useRef, useState } from 'react';

export interface ValidationError {
  type: string;
  message: string;
}

export interface VideoUploadState {
  file: File | null;
  preview: string | null;
  isValidating: boolean;
  isValid: boolean;
  errors: ValidationError[];
}

export const useVideoUpload = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<VideoUploadState>({
    file: null,
    preview: null,
    isValidating: false,
    isValid: false,
    errors: []
  });

  const validateVideo = (file: File, type: 'consent' | 'training'): Promise<boolean> => {
    return new Promise((resolve) => {
      const errors: ValidationError[] = [];

      if (file.type !== 'video/mp4' && file.type !== 'video/quicktime') {
        errors.push({
          type: 'format',
          message: 'Only MP4 or MOV format is supported'
        });
      }

      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);

        if (type === 'consent') {
          if (video.duration > 20) {
            errors.push({
              type: 'duration',
              message: `Consent video is too long (${Math.round(video.duration)}s). Maximum duration is 20 seconds`
            });
          }
        } else if (type === 'training') {
          if (video.duration < 120) {
            errors.push({
              type: 'duration',
              message: `Training video is too short (${Math.round(video.duration)}s). Minimum duration is 2 minutes`
            });
          }
          if (video.duration > 180) {
            errors.push({
              type: 'duration',
              message: `Training video is too long (${Math.round(video.duration)}s). Maximum duration is 3 minutes`
            });
          }
        }

        if (video.videoHeight < 720) {
          errors.push({
            type: 'quality',
            message: `Video quality is too low (${video.videoWidth}x${video.videoHeight}). Minimum height is 720px`
          });
        }

        setUploadState(prev => ({
          ...prev,
          isValidating: false,
          isValid: errors.length === 0,
          errors
        }));

        resolve(errors.length === 0);
      };

      video.onerror = () => {
        errors.push({
          type: 'error',
          message: 'Failed to load video file'
        });
        setUploadState(prev => ({
          ...prev,
          isValidating: false,
          isValid: false,
          errors
        }));
        resolve(false);
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (file: File, type: 'consent' | 'training') => {
    setUploadState(prev => ({
      ...prev,
      isValidating: true,
      isValid: false,
      errors: []
    }));

    const preview = URL.createObjectURL(file);
    setUploadState(prev => ({
      ...prev,
      file,
      preview
    }));

    await validateVideo(file, type);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'consent' | 'training') => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0], type);
    }
  };

  const handleDragEnter = (e: React.DragEvent, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(type);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent, type: 'consent' | 'training') => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(null);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0], type);
    }
  };

  const clearSelection = () => {
    setUploadState({
      file: null,
      preview: null,
      isValidating: false,
      isValid: false,
      errors: []
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getBorderClasses = (type: string) => {
    if (isDragging === type) {
      return 'border-[#6366F1] bg-[#6366F1]/5 border-2';
    }
    if (uploadState.errors.length > 0 && !uploadState.isValidating) {
      return 'border-red-500';
    }
    if (uploadState.isValid && !uploadState.isValidating) {
      return 'border-green-500';
    }
    return 'border-[#D1D5DB]';
  };

  return {
    fileInputRef,
    videoRef,
    uploadState,
    isDragging,
    handleFileSelect,
    handleInputChange,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    clearSelection,
    getBorderClasses
  };
};
