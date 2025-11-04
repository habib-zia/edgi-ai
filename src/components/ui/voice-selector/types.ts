export interface Voice {
  id: string
  name: string
  artist?: string
  type: 'low' | 'medium' | 'high'
  previewUrl?: string
  thumbnailUrl?: string
}

export type VoiceType = 'low' | 'medium' | 'high'

