'use client'

import { Play, Pause, CheckCircle } from 'lucide-react'

interface VideoCardProps {
  video: {
    id: number
    title: string
    description: string
    videoUrl: string
    thumbnail: string
    duration: string
    progress: number
  }
  videoState: {
    isPlaying: boolean
    isMuted: boolean
    currentTime: number
    duration: number
  }
  isWatched: boolean
  progress: number
  onVideoPlay: (videoId: number) => void
  onVideoMute: (videoId: number) => void
  onVideoTimeUpdate: (videoId: number, currentTime: number, duration: number) => void
  onVideoLoadedMetadata: (videoId: number, duration: number) => void
  onVideoPlayStateChange: (videoId: number, isPlaying: boolean) => void
  formatDuration: (seconds: number) => string
}

export default function VideoCard({
  video,
  videoState,
  isWatched,
  progress,
  onVideoPlay,
  onVideoMute,
  onVideoTimeUpdate,
  onVideoLoadedMetadata,
  onVideoPlayStateChange,
  formatDuration
}: VideoCardProps) {
  return (
    <div className="bg-[#F2F2F2] rounded-[8px] overflow-hidden">
      <div className="p-4">
        <h3 className="text-[18px] font-semibold text-[#101010] mb-4">
          {video.title}
        </h3>
        
        <div className="relative rounded-[8px] overflow-hidden bg-black mb-4">
          <video
            data-video-id={video.id}
            className="w-full h-[230px] object-cover"
            poster={video.thumbnail}
            preload="metadata"
            controls={true}
            muted={videoState.isMuted}
            onTimeUpdate={(e) => {
              const target = e.target as HTMLVideoElement
              onVideoTimeUpdate(video.id, target.currentTime, target.duration)
            }}
            onLoadedMetadata={(e) => {
              const target = e.target as HTMLVideoElement
              onVideoLoadedMetadata(video.id, target.duration)
            }}
            onPlay={() => {
              onVideoPlayStateChange(video.id, true)
            }}
            onPause={() => {
              onVideoPlayStateChange(video.id, false)
            }}
          >
            <source src={video.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          {/* Play Button Overlay */}
          {/* <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <button
              onClick={() => onVideoPlay(video.id)}
              className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-all duration-200"
            >
              {videoState.isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white ml-1" />
              )}
            </button>
          </div> */}
          
          {/* Progress Bar at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-30">
            <div
              className="h-full bg-[#5046E5] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Progress Percentage */}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
            {Math.round(progress)}%
          </div>
          
          {/* Duration Display */}
          <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
            {videoState.duration > 0 ? formatDuration(videoState.duration) : 'Loading...'}
          </div>
          
          {/* Watched Indicator */}
          {isWatched && (
            <div className="absolute top-2 left-2 bg-green-500 text-white p-1 rounded-full">
              <CheckCircle className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
