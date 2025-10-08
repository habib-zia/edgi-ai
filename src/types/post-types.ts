export interface ConnectedAccount {
  id: number
  name: string
  type: string
  _type: string
  active: boolean
  image: string
  post_maxlength: number
  attachment_types: string[]
  max_attachments: number
  post_media_required: boolean
  video_dimensions: {
    min: [number, number | null]
    max: [number | null, number | null]
  }
  video_duration: {
    min: number
    max: number
  }
  user_id: number
  account_id: string
  public_id: string
  extra_data: any
}

export interface VideoData {
  id: string
  title: string
  status: string
  url?: string
  videoUrl?: string
  thumbnail?: string
  createdAt: string
  updatedAt: string
  socialMediaCaptions?: {
    instagram_caption?: string
    facebook_caption?: string
    linkedin_caption?: string
    twitter_caption?: string
    tiktok_caption?: string
    youtube_caption?: string
  }
}

export interface PostData {
  date: string
  time: string
  caption: string
  accounts: ConnectedAccount[]
  video: VideoData
}

export interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  onPost: (postData: PostData) => void
  selectedAccounts: ConnectedAccount[]
  video: VideoData
}

export interface ScheduleData {
  frequency: string
  posts: Array<{
    day: string
    date: string
    time: string
  }>
}

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}
