'use client'

import { useState, useEffect, useRef } from 'react'

export default function VideoCard() {
    const [youtubeError, setYoutubeError] = useState(true)
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        timeoutRef.current = setTimeout(() => {
            if (iframeRef.current) {
                try {
                    const iframe = iframeRef.current
                    if (!iframe.contentWindow) {
                        setYoutubeError(true)
                    }
                } catch (err) {
                    setYoutubeError(true)
                }
            }
        }, 5000)

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    const handleIframeLoad = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
    }

    const handleIframeError = () => {
        setYoutubeError(true)
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
    }

    return (
        <div className="w-full h-full flex justify-center items-center relative z-0">
            <div className="w-full h-full">
                {!youtubeError ? (
                    <iframe 
                        ref={iframeRef}
                        src="https://www.youtube.com/embed/sQss9BltrwE?si=mUBc7ENbzbS1jcN4&modestbranding=1&rel=0&showinfo=0&controls=1&iv_load_policy=3&cc_load_policy=0&fs=1&disablekb=0&autoplay=0&mute=0" 
                        title="YouTube video player" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        allowFullScreen
                        className="w-full h-full max-w-[780px] min-h-[434px] rounded-[16px] mx-auto"
                        onLoad={handleIframeLoad}
                        onError={handleIframeError}
                    />
                ) : (
                    <video
                        src="/videos/Edge AI Realty.mp4"
                        controls
                        className="w-full h-full max-w-[780px] min-h-[434px] rounded-[16px] mx-auto border-2 border-gray-200/60 shadow-xl"
                        style={{ objectFit: 'contain' }}
                    >
                        Your browser does not support the video tag.
                    </video>
                )}
            </div>
        </div>
    )
}