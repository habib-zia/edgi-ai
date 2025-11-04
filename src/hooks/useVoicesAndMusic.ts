'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiService } from '@/lib/api-service'
import { Avatar } from '@/lib/api-service'
import { Voice } from '@/components/ui/voice-selector'

interface UseVoicesAndMusicProps {
  preset: string | null | undefined
  selectedAvatars: {
    title: Avatar | null
    body: Avatar | null
    conclusion: Avatar | null
  }
}

interface UseVoicesAndMusicReturn {
  voices: Voice[]  // Filtered voices based on preset/type
  voicesLoading: boolean
  voicesError: string | null
  musicList: Voice[]  // Filtered music based on preset/type
  musicLoading: boolean
  musicError: string | null
  allVoices: Voice[]  // All voices (low, medium, high)
  allMusic: Voice[]  // All music (low, medium, high)
}

export function useVoicesAndMusic({ preset, selectedAvatars }: UseVoicesAndMusicProps): UseVoicesAndMusicReturn {
  // Store ALL voices and music (low, medium, high combined)
  const [allVoices, setAllVoices] = useState<Voice[]>([])
  const [allMusic, setAllMusic] = useState<Voice[]>([])
  
  // Filtered voices and music based on preset/type
  const [voices, setVoices] = useState<Voice[]>([])
  const [musicList, setMusicList] = useState<Voice[]>([])
  
  const [voicesLoading, setVoicesLoading] = useState(false)
  const [voicesError, setVoicesError] = useState<string | null>(null)
  const [musicLoading, setMusicLoading] = useState(false)
  const [musicError, setMusicError] = useState<string | null>(null)

  // Helper function to get gender from selected avatar
  const getAvatarGender = useCallback((): string | null => {
    // Priority: body > title > conclusion
    const avatar = selectedAvatars.body || selectedAvatars.title || selectedAvatars.conclusion
    return avatar?.gender?.toLowerCase() || null
  }, [selectedAvatars])

  // Fetch ALL voices (low, medium, high) when avatars are selected - NO energyCategory parameter
  const fetchAllVoices = useCallback(async (gender: string | null) => {
    try {
      setVoicesLoading(true)
      setVoicesError(null)

      // Fetch ALL voices without energyCategory parameter (only gender)
      const response = await apiService.getVoices(undefined, gender)
      
      if (response.success && response.data) {
        // Transform API response to Voice[] format
        const apiVoices = Array.isArray(response.data) ? response.data : (response.data.voices || [])
        
        // Map API response to Voice interface
        // API returns 'energy' field (not energyCategory), use it to determine type
        // Check if voice is custom (has isCustom property or userId)
        const transformedVoices: Voice[] = apiVoices.map((voice: any) => {
          const isCustom = voice.isCustom === true || (voice.userId && voice.userId.trim() !== '')
          
          return {
            id: voice.voice_id || voice.id || voice._id || '',
            _id: voice._id || voice.id || undefined,
            voice_id: voice.voice_id || voice.id || undefined,
            name: voice.name || '',
            artist: voice.artist || undefined,
            type: isCustom ? 'custom' as const : ((voice.energy?.toLowerCase() || 'low') as 'low' | 'medium' | 'high'),
            previewUrl: voice.preview_url || voice.previewUrl || voice.preview || undefined,
            preview_url: voice.preview_url || voice.previewUrl || voice.preview || undefined,
            thumbnailUrl: voice.thumbnail_url || voice.thumbnailUrl || voice.thumbnail || undefined,
            isCustom: isCustom,
            gender: voice.gender || undefined,
            energy: voice.energy || undefined,
            description: voice.description || undefined,
            userId: voice.userId || voice.user_id || undefined
          }
        })
        
        setAllVoices(transformedVoices)
        setVoicesError(null)
      } else {
        setVoicesError(response.message || 'Failed to load voices')
        setAllVoices([])
      }
    } catch (error: any) {
      setVoicesError(error.message || 'Failed to load voices')
      setAllVoices([])
    } finally {
      setVoicesLoading(false)
    }
  }, [])

  // Fetch ALL music (low, medium, high) when avatars are selected - NO energyCategory parameter
  const fetchAllMusic = useCallback(async () => {
    try {
      setMusicLoading(true)
      setMusicError(null)

      // Fetch ALL music without energyCategory parameter
      const response = await apiService.getMusicTracks()
      
      if (response.success && response.data) {
        // Transform API response to Voice[] format
        const musicData = Array.isArray(response.data) ? response.data : (response.data.tracks || response.data.music || [])
        
        // Transform music data according to the API response structure
        // API should return energyCategory in the response, use it to determine type
        const transformedMusic: Voice[] = musicData.map((music: any) => {
          // Map s3PreviewUrl to preview_url and previewUrl for compatibility
          const previewUrl = music.s3PreviewUrl || music.s3_preview_url || music.preview_url || music.previewUrl || music.preview || undefined
          
          return {
            id: music.trackId || music.track_id || music.id || music._id || '',
            _id: music._id || '', // Store the MongoDB _id for saving
            name: music.name || '',
            artist: music.metadata?.artist || music.artist || undefined,
            type: (music.energyCategory?.toLowerCase() || 'low') as 'low' | 'medium' | 'high',
            previewUrl: previewUrl,
            preview_url: previewUrl, // Use s3PreviewUrl as preview_url
            thumbnailUrl: music.thumbnail_url || music.thumbnailUrl || music.thumbnail || undefined,
            s3FullTrackUrl: music.s3FullTrackUrl || music.s3_full_track_url || music.fullTrackUrl || undefined
          }
        })
        
        setAllMusic(transformedMusic)
        setMusicError(null)
      } else {
        setMusicError(response.message || 'Failed to load music')
        setAllMusic([])
      }
    } catch (error: any) {
      setMusicError(error.message || 'Failed to load music')
      setAllMusic([])
    } finally {
      setMusicLoading(false)
    }
  }, [])

  // Effect to fetch ALL voices and music when avatars are selected
  useEffect(() => {
    // Check if any avatar is selected
    const hasAvatar = selectedAvatars.body || selectedAvatars.title || selectedAvatars.conclusion
    
    if (hasAvatar) {
      const gender = getAvatarGender()
      // Fetch all voices and music in parallel
      fetchAllVoices(gender)
      fetchAllMusic()
    } else {
      // Clear data if no avatar is selected
      setAllVoices([])
      setAllMusic([])
      setVoices([])
      setMusicList([])
      setVoicesError(null)
      setMusicError(null)
    }
  }, [selectedAvatars.body, selectedAvatars.title, selectedAvatars.conclusion, getAvatarGender, fetchAllVoices, fetchAllMusic])

  // Effect to filter voices and music based on preset
  useEffect(() => {
    if (!preset || !preset.trim()) {
      // If no preset, show all voices and music
      setVoices(allVoices)
      setMusicList(allMusic)
      return
    }

    const energyCategory = preset.toLowerCase()
    
    // Filter voices and music based on preset
    const filteredVoices = allVoices.filter(v => v.type === energyCategory)
    const filteredMusic = allMusic.filter(m => m.type === energyCategory)
    
    setVoices(filteredVoices)
    setMusicList(filteredMusic)
  }, [preset, allVoices, allMusic])

  return {
    voices,  // Filtered based on preset
    voicesLoading,
    voicesError,
    musicList,  // Filtered based on preset
    musicLoading,
    musicError,
    allVoices,  // All voices (low, medium, high)
    allMusic  // All music (low, medium, high)
  }
}

