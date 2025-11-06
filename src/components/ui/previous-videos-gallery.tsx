'use client'

import React from 'react'
import CreateVideoModal from '../video-modal/CreateVideoModal'
import ConnectAccountsModal from './connect-accounts-modal'
import CreatePostModal from './create-post-modal'
import { useVideoGallery } from '@/hooks/video-gallery/useVideoGallery'
import { useVideoFiltering } from '@/hooks/video-gallery/useVideoFiltering'
import { useVideoGalleryModals } from '@/hooks/video-gallery/useVideoGalleryModals'
import VideoCard from '../video-gallery/VideoCard'
import VideoGalleryControls from '../video-gallery/VideoGalleryControls'
import LoadingState from '../video-gallery/LoadingState'
import ErrorState from '../video-gallery/ErrorState'
import EmptyState from '../video-gallery/EmptyState'

interface PreviousVideosGalleryProps {
  className?: string
}

export default function PreviousVideosGallery({ className }: PreviousVideosGalleryProps) {
  const {
    videos,
    loading,
    error,
    fetchVideos,
    isVideoProcessing
  } = useVideoGallery()

  const {
    searchQuery,
    setSearchQuery,
    sortOrder,
    isSortDropdownOpen,
    setIsSortDropdownOpen,
    handleSortChange,
    filteredAndSortedVideos
  } = useVideoFiltering(videos, !!isVideoProcessing)

  const {
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
  } = useVideoGalleryModals()


  if (loading) {
    return <LoadingState className={className} />
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchVideos} className={className} />
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Search, Sort Controls */}
      <VideoGalleryControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortOrder={sortOrder}
        isSortDropdownOpen={isSortDropdownOpen}
        onSortDropdownToggle={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
        onSortChange={handleSortChange}
        onRefresh={fetchVideos}
        isLoading={loading}
      />

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {filteredAndSortedVideos.length === 0 ? (
          <EmptyState searchQuery={searchQuery} />
        ) : (
          filteredAndSortedVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onViewVideo={handleViewVideo}
              onPostVideo={handlePostVideo}
            />
          ))
        )}
      </div>

      {/* Click outside to close dropdown */}
      {isSortDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsSortDropdownOpen(false)}
        />
      )}

      {/* Create Video Modal */}
      <CreateVideoModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        videoTitle={selectedVideoForCreation}
        startAtComplete={true}
        videoData={selectedVideoData}
      />

      {/* Connect Accounts Modal */}
      <ConnectAccountsModal
        isOpen={isConnectAccountsModalOpen}
        onClose={() => setIsConnectAccountsModalOpen(false)}
        onNext={() => {
          setIsConnectAccountsModalOpen(false)
          console.log('Accounts connected, proceeding to next step')
        }}
        video={selectedVideoData ? {
          id: selectedVideoData.title,
          title: selectedVideoData.title,
          status: 'ready',
          url: selectedVideoData.youtubeUrl,
          thumbnail: selectedVideoData.thumbnail,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } : undefined}
        onCreatePost={handleCreatePost}
      />

      {/* Create Post Modal */}
      {selectedVideoData && (
        <CreatePostModal
          isOpen={isCreatePostModalOpen}
          onClose={() => setIsCreatePostModalOpen(false)}
          onPost={handlePostSubmit}
          selectedAccounts={selectedAccountsForPost}
          video={{
            id: selectedVideoData.title,
            title: selectedVideoData.title,
            status: 'ready',
            videoUrl: selectedVideoData.videoUrl,
            url: selectedVideoData.youtubeUrl,
            thumbnail: selectedVideoData.thumbnail,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            socialMediaCaptions: selectedVideoData.socialMediaCaptions,
          }}
        />
      )}
    </div>
  )
}
