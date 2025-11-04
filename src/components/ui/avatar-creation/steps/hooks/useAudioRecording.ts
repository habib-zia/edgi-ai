import { useRef, useState, useEffect } from 'react';
import { MAX_AUDIO_DURATION } from '../constants';

export const useAudioRecording = () => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= MAX_AUDIO_DURATION) {
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
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const startRecording = (onAudioRecorded: (file: File) => void, onError: (error: string) => void) => {
    if (!streamRef.current) {
      onError('Microphone access is not available.');
      return;
    }

    try {
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4'
        : MediaRecorder.isTypeSupported('audio/ogg') ? 'audio/ogg' : '';
      
      if (!mimeType) {
        onError('Your browser does not support audio recording. Please upload an audio file instead.');
        return;
      }

      const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      setRecordingTime(0);
      setError(null);

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data?.size > 0) chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        if (chunks.length === 0) {
          onError('Recording failed. No data was captured.');
          return;
        }
        const blob = new Blob(chunks, { type: mimeType });
        if (blob.size === 0) {
          onError('Recording failed. The audio file is empty.');
          return;
        }
        const file = new File([blob], `voice-recording-${Date.now()}.webm`, { type: mimeType });
        onAudioRecorded(file);
        stopMicrophone();
      };

      mediaRecorder.onerror = () => {
        onError('An error occurred during recording.');
        setIsRecording(false);
      };

      mediaRecorder.start(100);
      setIsRecording(true);
    } catch {
      onError('Failed to start recording. Please try again or upload an audio file instead.');
    }
  };

  const requestMicrophone = async () => {
    setError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Your browser does not support microphone access.');
        return false;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      return true;
    } catch (err: any) {
      const errorMessages: Record<string, string> = {
        'NotAllowedError': 'Microphone access was denied. Please allow permissions.',
        'PermissionDeniedError': 'Microphone access was denied. Please allow permissions.',
        'NotFoundError': 'No microphone found.',
        'NotReadableError': 'Microphone is already in use.'
      };
      setError(errorMessages[err.name] || 'Unable to access microphone.');
      return false;
    }
  };

  const stopMicrophone = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    setIsRecording(false);
    setRecordingTime(0);
    setError(null);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return { isRecording, recordingTime, error, startRecording, stopRecording, requestMicrophone, stopMicrophone, formatTime };
};
