'use client'

import React from 'react'

interface VideoLoadingStepProps {
  countdown: number
}

export default function VideoLoadingStep({ countdown }: VideoLoadingStepProps) {
  return (
    <div className="text-center py-12">
      <div className="mb-6">
        <h4 className="md:text-[32px] text-[24px] font-semibold text-[#282828] mb-4">
          Video Generation Started!
        </h4>
        <p className="text-[#5F5F5F] text-lg mb-6">
          Your video is being generated in the background. This typically takes 10-15 minutes.
        </p>
        <p className="text-[#5046E5] text-[18px] mb-4">
          You can close this window and explore the site. We will notify you when the video is ready.
        </p>

        {/* Countdown Message */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-[#5046E5] text-[16px] font-medium">
            Redirecting to gallery in <span className="font-bold text-lg">{countdown}</span> seconds...
          </p>
        </div>
      </div>
    </div>
  )
}

