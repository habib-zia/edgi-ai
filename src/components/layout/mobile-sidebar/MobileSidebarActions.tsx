'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch } from '@/store/hooks'
import { clearUser } from '@/store/slices/userSlice'
import { useAnalytics } from '@/hooks/use-analytics'
import AccountNavigationItem from './AccountNavigationItem'

interface MobileSidebarActionsProps {
  isLoading: boolean
  isAuthenticated: boolean
  currentUser: {
    firstName?: string
    lastName?: string
    email?: string
  } | null
  pathname: string
  onClose: () => void
  onOpenSignin: () => void
  onOpenSignup: () => void
  onTrackNavigation: (from: string, to: string, method?: 'click' | 'keyboard' | 'programmatic') => void
  onTrackButtonClick: (action: string, location: string, label: string) => void
}

export default function MobileSidebarActions({
  isLoading,
  isAuthenticated,
  currentUser,
  pathname,
  onClose,
  onOpenSignin,
  onOpenSignup,
  onTrackNavigation,
  onTrackButtonClick
}: MobileSidebarActionsProps) {
  const dispatch = useAppDispatch()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="px-2">
          <div className="text-xs font-semibold text-[#5F5F5F] uppercase tracking-wider mb-2">
            Loading...
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 h-12 bg-gray-200 rounded-2xl animate-pulse"></div>
          <div className="flex-1 h-12 bg-gray-200 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <div className="space-y-4">
        {/* User Info */}
        <div className="px-2">
          <div className="text-xs font-semibold text-[#5F5F5F] uppercase tracking-wider mb-2">
            Signed in as
          </div>
          <div className="text-sm font-medium text-gray-700">
            {currentUser?.firstName} {currentUser?.lastName}
          </div>
          <div className="text-xs text-gray-500">
            {currentUser?.email}
          </div>
        </div>

        {/* Account Navigation Items */}
        <div className="space-y-2">
          <AccountNavigationItem
            href="/account"
            label="Account"
            pathname={pathname}
            onClose={onClose}
            onTrackNavigation={onTrackNavigation}
          />
          <AccountNavigationItem
            href="/create-video"
            label="My Videos"
            pathname={pathname}
            onClose={onClose}
            onTrackNavigation={onTrackNavigation}
          />
        </div>
        
        {/* Logout Button */}
        <button
          onClick={() => {
            dispatch(clearUser())
            onClose()
            onTrackButtonClick('logout', 'mobile_sidebar', 'logout')
            router.push('/')
          }}
          className="w-full inline-flex items-center justify-center px-6 py-4 text-base font-medium text-red-600 border-2 border-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all duration-300 focus:outline-none"
          aria-label="Log out of your account"
        >
          Logout
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-xs font-semibold text-[#5F5F5F] uppercase tracking-wider mb-4 px-2">
        Account
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => {
            onClose()
            onOpenSignin()
            onTrackButtonClick('login', 'mobile_sidebar', 'open_modal')
          }}
          className="flex-1 inline-flex items-center justify-center px-6 py-4 text-base font-medium text-[#5046E5] border-2 border-[#5046E5] rounded-2xl hover:bg-[#5046E5] hover:text-white transition-all duration-300 focus:outline-none"
          aria-label="Log in to your account"
        >
          Log In
        </button>
        <button
          onClick={() => {
            onClose()
            onOpenSignup()
            onTrackButtonClick('register', 'mobile_sidebar', 'open_modal')
          }}
          className="flex-1 inline-flex items-center justify-center px-6 py-4 text-base font-medium bg-gradient-to-r from-[#5046E5] to-[#3A2DFD] text-white rounded-2xl hover:from-[#3A2DFD] hover:to-[#5046E5] transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none"
          aria-label="Create a new account"
        >
          Sign Up
        </button>
      </div>
    </div>
  )
}

