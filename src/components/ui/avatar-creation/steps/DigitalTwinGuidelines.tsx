'use client'

import { useState } from 'react'
import { Play, Pause, Volume2, VolumeX, ArrowRight, CheckCircle, Mic, Camera, Grid3X3, Hand, ArrowLeft } from 'lucide-react'
import VideoCard from './VideoCard'

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

  const guidelines = [
    {
      icon: Mic,
      title: "Use the right equipment",
      description: "Submit 2-5 min of unedited footage with a professional camera or smartphone."
    },
    {
      icon: Camera,
      title: "Set the right environment",
      description: "Look straight ahead and keep your head level"
    },
    {
      icon: Mic,
      title: "Speak naturally and clearly",
      description: "Maintain a steady pace, pausing 1-2 seconds between sentences with lips closed."
    },
    {
      icon: Grid3X3,
      title: "Subtle movement, clear expression",
      description: "Sit, stand, or walk with subtle hand movements kept below the chest. Vary facial expressions and look into the camera."
    },
    {
      icon: Hand,
      title: "Want large or distinct gesture?",
      description: "You can include these after 30 seconds, spaced at least 2 seconds apart. They'll be excluded from your avatar's default behavior and only used when triggered."
    }
  ]

  const guidelineVideos = [
    {
      id: 1,
      title: "Avatar Training Video",
      description: "",
      videoUrl: "/videos/guidelines/heygen_lifestyle_instruction_rebrand_low.mp4",
      thumbnail: "/videos/guidelines/heygen_lifestyle_instruction_rebrand_low.mp4",
      duration: "",
      progress: 45
    },
    {
      id: 2,
      title: "Consent Video Guidelines",
      description: "",
      videoUrl: "/videos/guidelines/lighting-guide.mov",
      thumbnail: "/videos/guidelines/lighting-guide.mov",
      duration: "",
      progress: 45
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

  const handleVideoLoadedMetadata = (videoId: number, duration: number) => {
    setVideoStates(prev => ({
      ...prev,
      [videoId]: { ...prev[videoId], duration }
    }))
  }

  const handleVideoPlayStateChange = (videoId: number, isPlaying: boolean) => {
    setVideoStates(prev => ({
      ...prev,
      [videoId]: { ...prev[videoId], isPlaying }
    }))
  }

  const handleVideoTimeUpdate = (videoId: number, currentTime: number, duration: number) => {
    setVideoStates(prev => ({
      ...prev,
      [videoId]: { ...prev[videoId], currentTime, duration }
    }))

    // Mark video as watched when 90% complete
    if (currentTime / duration >= 0.9) {
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
    <div className="bg-white flex flex-col h-full max-w-7xl mx-auto w-full">
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto">
        <div className="w-full lg:w-1/2 p-4 lg:p-8 space-y-6 order-1 lg:order-2">
          {guidelineVideos.map((video) => {
            const videoState = videoStates[video.id]
            const isWatched = watchedVideos.has(video.id)
            const progress = videoState.duration > 0 ? (videoState.currentTime / videoState.duration) * 100 : video.progress

            return (
              <VideoCard
                key={video.id}
                video={video}
                videoState={videoState}
                isWatched={isWatched}
                progress={progress}
                onVideoPlay={handleVideoPlay}
                onVideoMute={handleVideoMute}
                onVideoTimeUpdate={handleVideoTimeUpdate}
                onVideoLoadedMetadata={handleVideoLoadedMetadata}
                onVideoPlayStateChange={handleVideoPlayStateChange}
                formatDuration={formatDuration}
              />
            )
          })}
        </div>
        <div className="w-full lg:w-1/2 order-2 lg:order-1">
          <div className="space-y-6">
            {guidelines.map((guideline, index) => {
              const IconComponent = guideline.icon
              return (
                <div key={index} className="space-y-3">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-gray-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="md:text-[24px] text-[18px] font-semibold text-[#101010] mb-2">
                        {guideline.title}
                      </h3>
                      <p className="md:text-[18px] max-w-[520px] text-[14px] text-[#5F5F5F] font-normal leading-[24px]">
                        {guideline.description}
                      </p>
                    </div>
                  </div>
                  {index === 3 && (
                    <div className="border-t border-gray-200 my-4"></div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div className="px-6 pt-4">
        <div className="flex flex-col gap-2 justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#667085] hover:text-[#5046E5] transition-colors duration-300 w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={onNext}
            // disabled={!allVideosWatched}
            className={`px-8 py-[11.3px] font-semibold text-[20px] rounded-full transition-colors duration-300 w-full bg-[#5046E5] text-white hover:bg-transparent hover:text-[#5046E5] border-2 border-[#5046E5] cursor-pointer
            `}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

