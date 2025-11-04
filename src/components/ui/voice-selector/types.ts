export interface Voice {
  id: string
  _id?: string // MongoDB _id for music tracks
  name: string
  artist?: string
  type: 'low' | 'medium' | 'high'
  previewUrl?: string
  thumbnailUrl?: string
  s3FullTrackUrl?: string // Full track URL for music
}

export type VoiceType = 'low' | 'medium' | 'high'

