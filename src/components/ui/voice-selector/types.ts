export interface Voice {
  id: string
  _id?: string // MongoDB _id for music tracks
  voice_id?: string // ElevenLabs voice_id
  name: string
  artist?: string
  type: 'low' | 'medium' | 'high' | 'custom' | 'trending'
  previewUrl?: string
  preview_url?: string // Alternative field name
  thumbnailUrl?: string
  s3FullTrackUrl?: string // Full track URL for music
  isCustom?: boolean
  gender?: string
  energy?: string
  description?: string
  userId?: string
}

export type VoiceType = 'low' | 'medium' | 'high' | 'custom' | 'trending'

