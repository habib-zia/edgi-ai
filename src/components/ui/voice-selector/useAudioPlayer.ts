import { useState, useRef, useEffect, useCallback } from 'react'
import { Voice } from './types'

export function useAudioPlayer() {
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null)
  const [voiceProgress, setVoiceProgress] = useState<Record<string, number>>({})
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map())

  const stopAllAudio = useCallback(() => {
    try {
      audioRefs.current.forEach((audio) => {
        try {
          if (audio && !audio.paused) {
            audio.pause()
            audio.currentTime = 0
          }
        } catch {
          
        }
      })
      setPlayingVoiceId(null)
      setVoiceProgress({})
    } catch { 
      setPlayingVoiceId(null)
      setVoiceProgress({})
    }
  }, [])

  const handlePlayPreview = useCallback((e: React.MouseEvent, voice: Voice) => {
    
    try {
      e.stopPropagation()
      e.preventDefault()
    } catch {
      
    }
    
    // Check both previewUrl and preview_url for compatibility
    const previewUrl = voice.previewUrl || voice.preview_url
    
    if (!previewUrl) {
      console.warn('No preview URL for voice/music:', voice.name)
      return
    }

    
    if (playingVoiceId === voice.id) {
      stopAllAudio()
      return
    }

    
    stopAllAudio()
    
    
    setPlayingVoiceId(voice.id)
    
    setVoiceProgress((prev) => ({ ...prev, [voice.id]: 0 }))

    let audio = audioRefs.current.get(voice.id)
    
    
    const voiceId = voice.id
    const voiceName = voice.name
    
    if (!audio) {
      audio = new Audio()
      // Don't set crossOrigin for S3 URLs - they often don't have CORS configured
      // Audio can still play without crossOrigin, but won't be accessible via Canvas API
      // Since we're just playing audio (not analyzing), we don't need crossOrigin
      audio.preload = 'metadata'
      
      const handlePlaying = () => {
        setPlayingVoiceId(voiceId)
      }
      
      const handlePause = () => {
        setPlayingVoiceId((current) => current === voiceId ? null : current)
      }
      
      const handleEnded = () => {
        setPlayingVoiceId((current) => current === voiceId ? null : current)
        setVoiceProgress((prev) => ({ ...prev, [voiceId]: 0 }))
      }
      
      const handleTimeUpdate = () => {
        try {
          const audioElement = audioRefs.current.get(voiceId)
          if (audioElement && audioElement.duration && !isNaN(audioElement.duration)) {
            const currentTime = audioElement.currentTime || 0
            const duration = audioElement.duration
            const progress = Math.min(100, Math.max(0, (currentTime / duration) * 100))
            
            if (!isNaN(progress) && isFinite(progress)) {
              setVoiceProgress((prev) => ({ ...prev, [voiceId]: progress }))
            }
          }
        } catch {
          
        }
      }
      
      const handleError = () => {
        
        try {
          const audioElement = audioRefs.current.get(voiceId)
          if (audioElement?.error) {
            const errorCode = audioElement.error.code
            const errorMessage = String(audioElement.error.message || 'Unknown error')
            
            // Check if it's a CORS error - try retrying without crossOrigin
            if (errorCode === 4 || errorMessage.includes('CORS') || errorMessage.includes('cross-origin')) {
              console.warn('CORS error detected, retrying without crossOrigin:', previewUrl)
              
              // Remove crossOrigin and try again
              try {
                audioElement.crossOrigin = null
                audioElement.load()
                audioElement.play().catch(() => {
                  // If it still fails, show the error
                  const errorDetails: Record<string, string | number> = {
                    error: String(errorCode || 'unknown'),
                    message: 'CORS error: Audio cannot be played due to CORS policy. Please configure S3 bucket CORS settings.',
                    voiceName: String(voiceName || ''),
                    url: String(previewUrl || '')
                  }
                  console.error('Audio CORS error:', errorDetails)
                  setPlayingVoiceId((current) => current === voiceId ? null : current)
                  setVoiceProgress((prev) => ({ ...prev, [voiceId]: 0 }))
                })
                return // Don't set error state yet, let it try to play
              } catch {
                // Fall through to normal error handling
              }
            }
            
            const errorDetails: Record<string, string | number> = {
              error: String(errorCode || 'unknown'),
              message: errorMessage,
              voiceName: String(voiceName || ''),
              url: String(previewUrl || '')
            }
            console.error('Audio error:', errorDetails)
          } else {
            console.error('Error loading voice preview:', String(voiceName || ''))
          }
        } catch {
          
          console.error('Audio error occurred for voice:', String(voiceName || ''))
        }
        setPlayingVoiceId((current) => current === voiceId ? null : current)
        setVoiceProgress((prev) => ({ ...prev, [voiceId]: 0 }))
      }
      
      audio.addEventListener('playing', handlePlaying)
      audio.addEventListener('pause', handlePause)
      audio.addEventListener('ended', handleEnded)
      audio.addEventListener('timeupdate', handleTimeUpdate)
      audio.addEventListener('error', handleError)
      
      
      audio.src = previewUrl
      audioRefs.current.set(voice.id, audio)
    } else {

      if (audio.ended || audio.currentTime > 0) {
        audio.currentTime = 0
        setVoiceProgress((prev) => ({ ...prev, [voiceId]: 0 }))
      }
    }

    const playAudio = async () => {
      try {
        if (audio.readyState >= 2) {
          await audio.play().catch((playError: unknown) => {
            try {
              const err = playError as Error
              const errorDetails: Record<string, string> = {
                message: String(err?.message || 'Play failed'),
                name: String(err?.name || 'Error'),
                voiceName: String(voiceName || ''),
                url: String(previewUrl || '')
              }
              console.error('Error playing audio:', errorDetails)
            } catch {
              console.error('Error playing audio for voice:', String(voiceName || ''))
            }
            setPlayingVoiceId((current) => current === voiceId ? null : current)
            setVoiceProgress((prev) => ({ ...prev, [voiceId]: 0 }))
            throw playError
          })
        } else {
          const handleCanPlayThrough = () => {
            audio.play().catch((error: unknown) => {
              try {
                const err = error as Error
                const errorDetails: Record<string, string> = {
                  message: String(err?.message || 'Unknown error'),
                  name: String(err?.name || 'Error'),
                  voiceName: String(voiceName || ''),
                  url: String(previewUrl || '')
                }
                console.error('Error playing audio:', errorDetails)
              } catch {
                console.error('Error playing audio for voice:', String(voiceName || ''))
              }
              setPlayingVoiceId((current) => current === voiceId ? null : current)
              setVoiceProgress((prev) => ({ ...prev, [voiceId]: 0 }))
            })
          }
          
          audio.addEventListener('canplaythrough', handleCanPlayThrough, { once: true })
          
          if (audio.readyState === 0) {
            audio.load()
          }
        }
      } catch (error: unknown) {
        try {
          const err = error as Error
          const errorDetails: Record<string, string> = {
            message: String(err?.message || 'Unknown error'),
            name: String(err?.name || 'Error'),
            voiceName: String(voiceName || ''),
            url: String(previewUrl || '')
          }
          console.error('Error playing audio:', errorDetails)
        } catch {
          console.error('Error playing audio for voice:', String(voiceName || ''))
        }
        setPlayingVoiceId((current) => current === voiceId ? null : current)
        setVoiceProgress((prev) => ({ ...prev, [voiceId]: 0 }))
      }
    }

    playAudio()
  }, [playingVoiceId, stopAllAudio])

  useEffect(() => {
    const currentAudioRefs = audioRefs.current
    return () => {
      try {
        stopAllAudio()
        currentAudioRefs.forEach((audio) => {
          try {
            if (audio) {
              audio.pause()
              audio.src = ''
              audio.load()
            }
          } catch {
          }
        })
        currentAudioRefs.clear()
      } catch {
        currentAudioRefs.clear()
      }
    }
  }, [stopAllAudio])

  return {
    playingVoiceId,
    voiceProgress,
    handlePlayPreview,
    stopAllAudio
  }
}

