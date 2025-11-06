'use client'

import { useState, useMemo, useCallback } from 'react'
import { VideoCard } from './useVideoGallery'
import { useUnifiedSocketContext } from '@/components/providers/UnifiedSocketProvider'

export type SortOrder = 'newest' | 'oldest'

export function useVideoFiltering(videos: VideoCard[], isVideoProcessing: boolean) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false)
  const { latestVideoUpdate } = useUnifiedSocketContext()

  const handleSortChange = useCallback((newSortOrder: SortOrder) => {
    setSortOrder(newSortOrder)
    setIsSortDropdownOpen(false)
  }, [])

  const filteredAndSortedVideos = useMemo(() => {
    const loadingCardData = isVideoProcessing ? {
      title: 'Processing Video...',
      message: latestVideoUpdate?.message || 'Your video creation is in progress'
    } : null

    console.log('🔄 Recalculating filteredAndSortedVideos:', {
      isVideoProcessing,
      loadingCardData
    })

    const allVideos = [...videos]

    if (isVideoProcessing && loadingCardData) {
      console.log('➕ Adding loading card to video list')
      const loadingCard: VideoCard = {
        id: `loading-${Date.now()}`,
        videoId: `loading-${Date.now()}`,
        title: loadingCardData.title,
        status: 'processing',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        downloadUrl: null,
        metadata: {
          duration: 0,
          size: 0,
          format: 'processing'
        }
      }
      allVideos.unshift(loadingCard)
    }

    const filtered = allVideos.filter(video =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()

      if (sortOrder === 'newest') {
        return dateB - dateA
      } else {
        return dateA - dateB
      }
    })
  }, [videos, isVideoProcessing, latestVideoUpdate, searchQuery, sortOrder])

  return {
    searchQuery,
    setSearchQuery,
    sortOrder,
    isSortDropdownOpen,
    setIsSortDropdownOpen,
    handleSortChange,
    filteredAndSortedVideos
  }
}

