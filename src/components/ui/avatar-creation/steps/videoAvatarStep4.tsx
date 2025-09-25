'use client'

import { ArrowUpRight } from 'lucide-react'

interface VideoAvatarStep4Props {
  onNext: () => void
}

export default function VideoAvatarStep4({ onNext }: VideoAvatarStep4Props) {
  return (
    <div className="bg-white flex flex-col h-full">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Title Section */}
        <div className="text-center mb-10">
          <h2 className="text-[32px] font-bold text-[#282828]">
            Get to Heygen
          </h2>
          <p className="text-[18px] text-[#667085]">
            Put these credentials on Hygen
          </p>
        </div>

        {/* Credentials Card */}
        <div className="w-full max-w-md mb-8">
          <div className="bg-[#E5E7EB] border border-[#E5E7EB] rounded-lg p-6">
            {/* Email Field */}
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/email.svg"
                alt="Email"
                className="w-5 h-5"
              />
              <p className="text-[14px] text-[#667085] mb-1">Email ID</p>
              <p className="text-[16px] font-medium text-[#282828]">hygen.ai.com</p>
            </div>

            {/* Password Field */}
            <div className="flex items-center gap-3">
              <img
                src="/password.svg"
                alt="Password"
                className="w-5 h-5"
              />
               <p className="text-[14px] text-[#667085] mb-1">Password</p>
               <p className="text-[16px] font-medium text-[#282828]">54dewfwf54883</p>
              
            </div>
          </div>
        </div>
        <button
          onClick={() => window.open('https://app.heygen.com/', '_blank')}
          className="w-full bg-[#5046E5] text-white px-5 py-3 mt-5 rounded-full font-semibold text-[18px] hover:bg-[#4338CA] transition-colors duration-300 flex items-center justify-center gap-2"
        >
          Visit Hygen
          <ArrowUpRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
