import { useRef, useState, useEffect } from 'react';
import { MAX_VIDEO_DURATION } from '../constants';

export const useCameraRecording = () => {
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Timer for recording
  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          // Auto-stop at max duration
          if (prev >= MAX_VIDEO_DURATION) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
    
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupResources();
    };
  }, []);

  const cleanupResources = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    
    try {
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Your browser does not support camera access. Please use a modern browser or upload a video instead.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { min: 640, ideal: 1920, max: 1920 },
          height: { min: 480, ideal: 1080, max: 1080 },
          facingMode: 'user'
        },
        audio: true
      });
      
      streamRef.current = stream;
      setIsCameraOpen(true);
      
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      
      let errorMessage = 'Unable to access camera and microphone.';
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'Camera and microphone access was denied. Please allow permissions in your browser settings and try again.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = 'No camera or microphone found. Please connect a camera and microphone and try again.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = 'Camera or microphone is already in use by another application. Please close other apps and try again.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Camera does not support the required resolution. Please try uploading a video instead.';
      }
      
      setCameraError(errorMessage);
    }
  };

  const startRecording = (onVideoRecorded: (file: File) => void, onError: (error: string) => void) => {
    if (!streamRef.current) {
      onError('Camera stream is not available.');
      return;
    }

    try {
      // Check for supported MIME types
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : MediaRecorder.isTypeSupported('video/mp4')
        ? 'video/mp4'
        : '';

      if (!mimeType) {
        onError('Your browser does not support video recording. Please upload a pre-recorded video instead.');
        return;
      }

      const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      setRecordingTime(0);

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (chunks.length === 0) {
          onError('Recording failed. No data was captured. Please try again.');
          return;
        }

        const blob = new Blob(chunks, { type: mimeType });
        
        if (blob.size === 0) {
          onError('Recording failed. The video file is empty. Please try again.');
          return;
        }

        const file = new File([blob], `consent-video-${Date.now()}.webm`, { type: mimeType });
        onVideoRecorded(file);
        
        // Stop camera after recording is processed
        stopCamera();
      };

      mediaRecorder.onerror = (event: any) => {
        console.error('MediaRecorder error:', event);
        onError('An error occurred during recording. Please try again.');
        setIsRecording(false);
      };

      mediaRecorder.start(100); // Capture data every 100ms
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      onError('Failed to start recording. Please try again or upload a video instead.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    }
  };

  const stopCamera = () => {
    cleanupResources();
    setIsCameraOpen(false);
    setIsRecording(false);
    setRecordingTime(0);
    setCameraError(null);
  };

  return {
    videoPreviewRef,
    isRecording,
    isCameraOpen,
    recordingTime,
    cameraError,
    startCamera,
    startRecording,
    stopRecording,
    stopCamera,
    setCameraError
  };
};
