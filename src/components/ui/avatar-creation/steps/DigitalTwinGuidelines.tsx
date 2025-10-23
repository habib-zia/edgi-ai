'use client'

import { useState } from 'react'
import { Play, Pause, Volume2, VolumeX, ArrowRight, CheckCircle } from 'lucide-react'

interface DigitalTwinGuidelinesProps {
  onNext: () => void
  onBack: () => void
}

export default function DigitalTwinGuidelines({ onNext, onBack }: DigitalTwinGuidelinesProps) {
  const [watchedVideos, setWatchedVideos] = useState<Set<number>>(new Set())
  const [videoStates, setVideoStates] = useState<{
    [key: number]: {
      isPlaying: boolean
      isMuted: boolean
      currentTime: number
      duration: number
    }
  }>({
    1: { isPlaying: false, isMuted: false, currentTime: 0, duration: 0 },
    2: { isPlaying: false, isMuted: false, currentTime: 0, duration: 0 }
  })

  const guidelineVideos = [
    {
      id: 1,
      title: "Avatar Training Video",
      description: "",
      videoUrl: "/videos/guidelines/recording-guide.mov",
      thumbnail: "/videos/guidelines/recording-guide.mov",
      duration: ""
    },
    {
      id: 2,
      title: "Consent Video Guidelines",
      description: "",
      videoUrl: "/videos/guidelines/lighting-guide.mov",
      thumbnail: "/videos/guidelines/lighting-guide.mov",
      duration: ""
    }
  ]

  const handleVideoPlay = (videoId: number) => {
    const videoElement = document.querySelector(`video[data-video-id="${videoId}"]`) as HTMLVideoElement
    if (videoElement) {
      if (videoStates[videoId].isPlaying) {
        videoElement.pause()
      } else {
        videoElement.play()
      }
    }
  }

  const handleVideoMute = (videoId: number) => {
    const videoElement = document.querySelector(`video[data-video-id="${videoId}"]`) as HTMLVideoElement
    if (videoElement) {
      videoElement.muted = !videoElement.muted
      setVideoStates(prev => ({
        ...prev,
        [videoId]: { ...prev[videoId], isMuted: videoElement.muted }
      }))
    }
  }

  const handleVideoTimeUpdate = (videoId: number, currentTime: number, duration: number) => {
    setVideoStates(prev => ({
      ...prev,
      [videoId]: { ...prev[videoId], currentTime, duration }
    }))

    if (currentTime / duration >= 0.8) {
      setWatchedVideos(prev => new Set([...prev, videoId]))
    }
  }

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const allVideosWatched = watchedVideos.size === guidelineVideos.length

  return (
    <div className="bg-white flex flex-col h-full">
      <div className="text-center mb-8 px-6">
        <h2 className="text-[28px] font-semibold text-[#101010] mb-4 tracking-[-2%] leading-[120%]">
          Digital Twin Guidelines
        </h2>
        <p className="text-[18px] text-[#5F5F5F] max-w-[600px] mx-auto leading-[24px]">
          Watch these short videos to learn how to create the best possible digital twin avatar. 
        </p>
      </div>
      <div className="flex-1 px-6 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {guidelineVideos.map((video) => {
            const videoState = videoStates[video.id]
            const isWatched = watchedVideos.has(video.id)
            const progress = videoState.duration > 0 ? (videoState.currentTime / videoState.duration) * 100 : 0

            return (
              <div key={video.id} className="bg-[#F8FAFC] rounded-[12px] p-6 border border-[#E2E8F0]">
                <div className="relative mb-4 rounded-[8px] overflow-hidden bg-black">
                  <video
                    data-video-id={video.id}
                    className="w-full h-[200px] object-cover"
                    poster={video.videoUrl}
                    preload="metadata"
                    controls={false}
                    muted={videoState.isMuted}
                    onTimeUpdate={(e) => {
                      const target = e.target as HTMLVideoElement
                      handleVideoTimeUpdate(video.id, target.currentTime, target.duration)
                    }}
                    onLoadedMetadata={(e) => {
                      const target = e.target as HTMLVideoElement
                      setVideoStates(prev => ({
                        ...prev,
                        [video.id]: { ...prev[video.id], duration: target.duration }
                      }))
                    }}
                    onPlay={() => {
                      setVideoStates(prev => ({
                        ...prev,
                        [video.id]: { ...prev[video.id], isPlaying: true }
                      }))
                    }}
                    onPause={() => {
                      setVideoStates(prev => ({
                        ...prev,
                        [video.id]: { ...prev[video.id], isPlaying: false }
                      }))
                    }}
                  >
                    <source src={video.videoUrl} type="video/quicktime" />
                    <source src={video.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <button
                      onClick={() => handleVideoPlay(video.id)}
                      className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all duration-200"
                    >
                      {videoState.isPlaying ? (
                        <Pause className="w-8 h-8 text-[#5046E5]" />
                      ) : (
                        <Play className="w-8 h-8 text-[#5046E5] ml-1" />
                      )}
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-30">
                    <div 
                      className="h-full bg-[#5046E5] transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {videoState.duration > 0 ? formatDuration(videoState.duration) : 'Loading...'}
                  </div>
                  {isWatched && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white p-1 rounded-full">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-[18px] font-semibold text-[#101010] mb-2">
                        {video.title}
                      </h3>
                      <p className="text-[14px] text-[#5F5F5F] leading-[20px]">
                        {video.description}
                      </p>
                    </div>
                    <button
                      onClick={() => handleVideoMute(video.id)}
                      className="p-2 hover:bg-[#E2E8F0] rounded-lg transition-colors duration-200 ml-3"
                    >
                      {videoState.isMuted ? (
                        <VolumeX className="w-5 h-5 text-[#5F5F5F]" />
                      ) : (
                        <Volume2 className="w-5 h-5 text-[#5F5F5F]" />
                      )}
                    </button>
                  </div>
                  <div className="text-[12px] text-[#5F5F5F]">
                    {isWatched ? (
                      <span className="text-green-600 font-medium">✓ Watched</span>
                    ) : (
                      <span>Progress: {Math.round(progress)}%</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="px-2 py-1">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <button
            onClick={onBack}
            className="px-6 py-3 text-[#5F5F5F] hover:text-[#101010] transition-colors duration-200"
          >
            Back
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[14px] text-[#5F5F5F]">
              <span>Guidelines: {watchedVideos.size}/{guidelineVideos.length}</span>
              <div className="w-20 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#5046E5] transition-all duration-300"
                  style={{ width: `${(watchedVideos.size / guidelineVideos.length) * 100}%` }}
                />
              </div>
            </div>

            <button
              onClick={onNext}
              disabled={!allVideosWatched}
              className={`px-8 py-3 font-semibold text-[16px] rounded-full transition-all duration-300 flex items-center gap-2 ${
                allVideosWatched
                  ? 'bg-[#5046E5] text-white hover:bg-[#4338CA] cursor-pointer'
                  : 'bg-[#D1D5DB] text-[#9CA3AF] cursor-not-allowed'
              }`}
            >
              Continue to Upload
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!allVideosWatched && (
          <div className="mt-1 text-center">
            <p className="text-[14px] text-[#5F5F5F]">
              Please watch both guideline videos to continue
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

