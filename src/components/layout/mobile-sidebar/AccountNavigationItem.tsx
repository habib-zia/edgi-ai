'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface AccountNavigationItemProps {
  href: string
  label: string
  pathname: string
  onClose: () => void
  onTrackNavigation: (from: string, to: string, method?: 'click' | 'keyboard' | 'programmatic') => void
}

export default function AccountNavigationItem({
  href,
  label,
  pathname,
  onClose,
  onTrackNavigation
}: AccountNavigationItemProps) {
  const isActive = pathname === href

  return (
    <Link
      href={href}
      onClick={() => {
        onClose()
        onTrackNavigation(pathname, href, 'click')
      }}
      className={cn(
        'group relative flex items-center px-4 py-4 text-base font-medium rounded-2xl transition-all duration-500 ease-out overflow-hidden focus:outline-none',
        isActive
          ? 'bg-gradient-to-r from-[#5046E5] to-[#3A2DFD] text-white'
          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100/90'
      )}
      aria-current={isActive ? 'page' : undefined}
      aria-label={`${label}${isActive ? ' (current page)' : ''}`}
    >
      {/* Background Effects */}
      <div className={cn(
        'absolute inset-0 transition-all duration-500 ease-out',
        isActive
          ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20'
          : 'bg-gradient-to-r from-gray-100/0 to-gray-100/0 group-hover:from-gray-100/50 group-hover:to-gray-100/30'
      )} />
      
      {/* Active Indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg" />
      )}
      
      {/* Icon Placeholder */}
      <div className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center mr-4 transition-all duration-300',
        isActive
          ? 'bg-white/20 text-white'
          : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
      )}>
        <div className="w-2 h-2 bg-current rounded-full" />
      </div>
      
      <span className="relative z-10 font-medium">
        {label}
      </span>
      
      {/* Hover Animation */}
      <div className={cn(
        'absolute right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0',
        isActive ? 'text-white' : 'text-gray-400'
      )}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}

