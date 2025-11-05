import { useRef, useState, useEffect } from 'react';
import { MIN_AUDIO_DURATION, MAX_AUDIO_DURATION } from '../constants';

export const useAudioRecording = () => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimeRef = useRef<number>(0); // Use ref to track current time for closures
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          recordingTimeRef.current = newTime; // Update ref with latest time
          if (newTime >= MAX_AUDIO_DURATION) {
            // Auto-stop at exactly 3 minutes - stop recording and save file
            stopRecording(newTime);
            return newTime; // Return newTime so it shows 3:00 before stopping
          }
          return newTime;
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

  const stopRecording = (currentTime?: number) => {
    // Use provided currentTime or get from state (may be stale due to closure)
    const durationToCheck = currentTime !== undefined ? currentTime : recordingTime;
    
    // Allow auto-stop at exactly 3 minutes (MAX_AUDIO_DURATION) without minimum check
    const isAutoStopAtMax = durationToCheck >= MAX_AUDIO_DURATION;
    
    // Check minimum duration before stopping (unless it's auto-stop at max duration)
    if (!isAutoStopAtMax && durationToCheck < MIN_AUDIO_DURATION) {
      setError(`Recording is too short (${durationToCheck}s). Minimum duration is ${MIN_AUDIO_DURATION} seconds. Please continue recording.`);
      return;
    }
    
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
      setError('')
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
      recordingTimeRef.current = 0; // Reset ref
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
        
        // Validate recording duration - use ref to get latest value (recordingTime state may be stale in closure)
        const currentDuration = recordingTimeRef.current;
        if (currentDuration < MIN_AUDIO_DURATION) {
          onError(`Recording is too short (${currentDuration}s). Minimum duration is ${MIN_AUDIO_DURATION} seconds.`);
          stopMicrophone();
          return;
        }
        // Allow exactly MAX_AUDIO_DURATION (3 minutes) - auto-stop saves the file
        if (currentDuration > MAX_AUDIO_DURATION) {
          onError(`Recording is too long (${currentDuration}s). Maximum duration is ${MAX_AUDIO_DURATION} seconds (3 minutes).`);
          stopMicrophone();
          return;
        }
        // If duration is exactly MAX_AUDIO_DURATION, it means auto-stop at 3 minutes - save the file
        
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
    recordingTimeRef.current = 0; // Reset ref
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
