import { useRef, useState, useEffect } from 'react';
import { useVideoValidation } from './useVideoValidation';
import { useCameraRecording } from './useCameraRecording';
import { useFileHandling } from './useFileHandling';
import { MIN_VIDEO_DURATION } from '../constants';

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

export const useVideoConsent = (avatarData: AvatarData, setAvatarData: (data: AvatarData) => void) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    videoDuration,
    setVideoDuration,
    isVideoMetadataLoading,
    setIsVideoMetadataLoading,
    validateVideoFile
  } = useVideoValidation();

  const {
    videoPreviewRef,
    isRecording,
    isCameraOpen,
    recordingTime,
    cameraError,
    startCamera,
    startRecording: startCameraRecording,
    stopRecording,
    stopCamera,
    setCameraError
  } = useCameraRecording();

  const {
    fileInputRef,
    isDragging,
    isProcessing,
    setIsProcessing,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleInputChange,
    clearFileInput
  } = useFileHandling();

  // Cleanup video preview URL when component unmounts or video changes
  useEffect(() => {
    return () => {
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, [videoPreview]);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Validate the file
      const validationError = await validateVideoFile(file);
      if (validationError) {
        setError(validationError);
        setIsProcessing(false);
        return;
      }

      // Revoke previous preview URL if exists
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }

      // Create preview
      const preview = URL.createObjectURL(file);
      setVideoPreview(preview);
      setAvatarData({ ...avatarData, consentVideoFile: file });
    } catch (error) {
      console.error('Error processing file:', error);
      setError('Failed to process the video file. Please try another file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCameraRecording = () => {
    startCameraRecording(
      (file) => {
        // Validate the recorded video
        validateVideoFile(file).then((validationError) => {
          if (validationError) {
            setError(validationError);
            return;
          }

          // Create preview URL and save file
          const url = URL.createObjectURL(file);
          setVideoPreview(url);
          setAvatarData({ ...avatarData, consentVideoFile: file });
        });
      },
      (error) => setError(error)
    );
  };

  const clearSelection = () => {
    // Revoke the object URL to free memory
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    
    setAvatarData({ ...avatarData, consentVideoFile: null });
    setVideoPreview(null);
    setVideoDuration(null);
    setError(null);
    stopCamera();
    clearFileInput();
  };

  const handleContinue = (onNext: () => void) => {
    if (!avatarData.consentVideoFile) {
      setError('Please record or upload a consent video before continuing.');
      return;
    }
    
    // Additional validation before proceeding
    if (videoDuration && videoDuration < MIN_VIDEO_DURATION) {
      setError(`Video is too short. Please ensure it's at least ${MIN_VIDEO_DURATION} seconds long.`);
      return;
    }
    
    onNext();
  };

  const canProceed = avatarData.consentVideoFile && !isProcessing && !error;

  return {
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
    handleDrop: (e: React.DragEvent) => handleDrop(e, handleFileSelect, setError),
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, handleFileSelect),
    handleFileSelect,
    startCamera,
    startRecording: handleCameraRecording,
    stopRecording,
    stopCamera,
    clearSelection,
    handleContinue,
    setError,
    setCameraError,
    setIsVideoMetadataLoading,
    
    // Computed
    canProceed
  };
};
