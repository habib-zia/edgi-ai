'use client'

import React from 'react'
import Link from 'next/link'
import { BRAND_NAME } from '@/lib/constants'
import { handleAnchorClick } from '@/lib/utils'
import { useAnalytics } from '@/hooks/use-analytics'
import { usePathname } from 'next/navigation'

interface MobileSidebarHeaderProps {
  onClose: () => void
}

export default function MobileSidebarHeader({ onClose }: MobileSidebarHeaderProps) {
  const pathname = usePathname()
  const { trackNavigation, trackButtonClick } = useAnalytics()

  return (
    <div className="relative p-8 bg-gradient-to-r from-blue-50/80 via-purple-50/60 to-blue-50/80 border-b border-gray-200/40 flex-shrink-0">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-transparent to-purple-100/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
      
      <div className="relative flex items-center justify-between">
        <Link 
          href="#home" 
          className="group flex items-center space-x-3 rounded-lg p-1 text-[#5046E5] text-2xl font-bold"
          onClick={(e) => {
            if (handleAnchorClick('#home', onClose)) {
              e.preventDefault()
              trackNavigation(pathname, '#home', 'click')
            } else {
              onClose()
              trackNavigation(pathname, '/', 'click')
            }
          }}
          aria-label={`${BRAND_NAME} - Go to homepage`}
        >
          EdgeAI<span className="text-[#E54B46] font-bold">Realty</span>
        </Link>
        
        <button
          onClick={() => {
            onClose()
            trackButtonClick('mobile_menu', 'sidebar', 'close_button')
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onClose()
              trackButtonClick('mobile_menu', 'sidebar', 'close_button')
            }
          }}
          className="group relative p-3 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 border border-gray-200/50 cursor-pointer focus:outline-none"
          aria-label="Close mobile menu"
          type="button"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <svg
            className="relative w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

