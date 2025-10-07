import React from 'react'
import { Clock } from 'lucide-react'

interface ScheduleInterfaceProps {
  onStartScheduling: () => void
}

export default function ScheduleInterface({ onStartScheduling }: ScheduleInterfaceProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="text-center">
        <div className="w-20 h-20 bg-[#5046E5] rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Schedule Your Posts</h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Create and schedule your social media posts to be published automatically at your preferred times.
        </p>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onStartScheduling}
            className="px-8 py-4 bg-[#5046E5] text-white rounded-full font-semibold text-lg hover:bg-[#4338CA] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#5046E5]/20 flex items-center justify-center gap-3 cursor-pointer"
          >
            <Clock className="w-5 h-5" />
            Start Scheduling
          </button>
        </div>
      </div>
    </div>
  )
}
