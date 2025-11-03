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
    
    if (!voice.previewUrl) {
      console.warn('No preview URL for voice:', voice.name)
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
    const previewUrl = voice.previewUrl
    
    if (!audio) {
      audio = new Audio()
      audio.crossOrigin = 'anonymous'
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
      
      
      audio.src = voice.previewUrl
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

