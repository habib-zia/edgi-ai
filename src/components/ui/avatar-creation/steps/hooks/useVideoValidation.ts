import { useState } from 'react';
import { MAX_VIDEO_SIZE, MIN_VIDEO_DURATION, MAX_VIDEO_DURATION, SUPPORTED_FORMATS } from '../constants';

export const useVideoValidation = () => {
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [isVideoMetadataLoading, setIsVideoMetadataLoading] = useState(false);

  const validateVideoFile = async (file: File): Promise<string | null> => {
    // Check file size
    if (file.size > MAX_VIDEO_SIZE) {
      return `Video file is too large. Maximum size is ${MAX_VIDEO_SIZE / (1024 * 1024)}MB.`;
    }

    if (file.size === 0) {
      return 'Video file is empty or corrupted.';
    }

    // Check file type
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      return `Unsupported video format. Please use MP4, WebM, MOV, or AVI.`;
    }

    // Check video duration
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        const duration = video.duration;
        
        // Debug logging
        console.log('Video duration:', duration, 'seconds');
        console.log('Video duration type:', typeof duration);
        console.log('Is duration finite:', isFinite(duration));
        
        if (isNaN(duration) || duration === 0) {
          resolve('Unable to read video metadata. The file may be corrupted.');
          return;
        }
        
        // Check for infinite duration (common with some WebM files)
        if (!isFinite(duration) || duration === Infinity) {
          console.warn('Video duration is infinite, skipping duration validation');
          setVideoDuration(null);
          resolve(null);
          return;
        }
        
        if (duration < MIN_VIDEO_DURATION) {
          resolve(`Video is too short. Minimum duration is ${MIN_VIDEO_DURATION} seconds.`);
          return;
        }
        
        if (duration > MAX_VIDEO_DURATION) {
          resolve(`Video is too long. Maximum duration is ${MAX_VIDEO_DURATION} seconds.`);
          return;
        }
        
        setVideoDuration(duration);
        resolve(null);
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        resolve('Unable to load video. The file may be corrupted or in an unsupported format.');
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  return {
    videoDuration,
    setVideoDuration,
    isVideoMetadataLoading,
    setIsVideoMetadataLoading,
    validateVideoFile
  };
};
