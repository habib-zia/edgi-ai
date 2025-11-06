'use client'

import { useState, useCallback } from 'react'
import { API_CONFIG, getAuthenticatedHeaders } from '@/lib/config'

interface UseVideoDownloadProps {
  videoData?: { title: string; youtubeUrl: string; thumbnail: string } | null
}

export function useVideoDownload({ videoData }: UseVideoDownloadProps = {}) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = useCallback(async () => {
    if (!videoData?.youtubeUrl) {
      return
    }

    try {
      // Set loading state
      setIsDownloading(true)

      // Use our proxy to avoid CORS issues
      if (!videoData?.youtubeUrl) {
        throw new Error('No video URL available for download')
      }
      const proxyUrl = `${API_CONFIG.BACKEND_URL}/api/video/download-proxy?url=${encodeURIComponent(videoData.youtubeUrl)}`

      const headers = getAuthenticatedHeaders()
      delete headers['Content-Type']
      const response = await fetch(proxyUrl, {
        headers: headers
      })

      if (!response.ok) {
        throw new Error(`Failed to download video: ${response.status} ${response.statusText}`)
      }

      // Convert response to blob
      const blob = await response.blob()

      // Create blob URL
      const blobUrl = window.URL.createObjectURL(blob)

      // Create download link
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `${videoData.title || 'video'}.mp4`

      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up blob URL
      window.URL.revokeObjectURL(blobUrl)
    } catch (err) {
      console.error('Download failed:', err)
      alert('Download failed. Please try again.')
    } finally {
      // Reset loading state
      setIsDownloading(false)
    }
  }, [videoData])

  return {
    isDownloading,
    handleDownload
  }
}

