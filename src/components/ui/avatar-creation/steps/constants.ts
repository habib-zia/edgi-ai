export const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB
export const MIN_VIDEO_DURATION = 3; // 3 seconds minimum
export const MAX_VIDEO_DURATION = 120; // 2 minutes maximum
export const SUPPORTED_FORMATS = [
  'video/mp4', 
  'video/webm', 
  'video/webm;codecs=vp8',
  'video/webm;codecs=vp9',
  'video/quicktime', 
  'video/x-msvideo'
];

// Audio constants for voice avatar
export const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_AUDIO_DURATION = 180; // 3 minutes maximum (for recording)
export const SUPPORTED_AUDIO_FORMATS = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/webm',
  'audio/ogg',
  'audio/m4a',
  'audio/aac'
];
