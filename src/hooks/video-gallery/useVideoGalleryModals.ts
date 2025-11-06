'use client'

import { useState, useCallback } from 'react'
import { VideoCard } from './useVideoGallery'

export type SelectedVideoData = {
  title: string
  youtubeUrl: string
  thumbnail: string
  videoUrl: string
  socialMediaCaptions: {
    instagram_caption?: string
    facebook_caption?: string
    linkedin_caption?: string
    twitter_caption?: string
    tiktok_caption?: string
    youtube_caption?: string
  }
}

export function useVideoGalleryModals() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isConnectAccountsModalOpen, setIsConnectAccountsModalOpen] = useState(false)
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false)
  const [selectedAccountsForPost, setSelectedAccountsForPost] = useState<any[]>([])
  const [selectedVideoForCreation, setSelectedVideoForCreation] = useState<string>('')
  const [selectedVideoData, setSelectedVideoData] = useState<SelectedVideoData | null>(null)

  const handleViewVideo = useCallback((video: VideoCard) => {
    console.log('handleViewVideo', video)
    if (video.status !== 'ready' || !video.downloadUrl) {
      return
    }

    setSelectedVideoForCreation(video.title)
    setSelectedVideoData({
      title: video.title,
      videoUrl: video.videoUrl || '',
      youtubeUrl: video.downloadUrl,
      thumbnail: '',
      socialMediaCaptions:
        typeof video.socialMediaCaptions === 'string'
          ? JSON.parse(video.socialMediaCaptions)
          : video.socialMediaCaptions || {}
    })
    setIsCreateModalOpen(true)
  }, [])

  const handlePostVideo = useCallback((video: VideoCard) => {
    console.log('handlePostVideo', video)
    if (video.status !== 'ready') {
      return
    }

    setSelectedVideoForCreation(video.title)
    setSelectedVideoData({
      title: video.title,
      videoUrl: video.videoUrl || '',
      youtubeUrl: video.downloadUrl || '',
      thumbnail: '',
      socialMediaCaptions:
        typeof video.socialMediaCaptions === 'string'
          ? JSON.parse(video.socialMediaCaptions)
          : video.socialMediaCaptions || {}
    })
    setIsConnectAccountsModalOpen(true)
  }, [])

  const handleCreatePost = useCallback((accounts: any[]) => {
    setSelectedAccountsForPost(accounts)
    setIsConnectAccountsModalOpen(false)
    setIsCreatePostModalOpen(true)
  }, [])

  const handlePostSubmit = useCallback((postData: {
    date: string
    time: string
    caption: string
    accounts: any[]
    video: any
  }) => {
    console.log('Post submitted:', postData)
    setIsCreatePostModalOpen(false)
    setSelectedAccountsForPost([])
  }, [])

  return {
    isCreateModalOpen,
    setIsCreateModalOpen,
    isConnectAccountsModalOpen,
    setIsConnectAccountsModalOpen,
    isCreatePostModalOpen,
    setIsCreatePostModalOpen,
    selectedAccountsForPost,
    selectedVideoForCreation,
    selectedVideoData,
    handleViewVideo,
    handlePostVideo,
    handleCreatePost,
    handlePostSubmit
  }
}

