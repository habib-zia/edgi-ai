'use client'

import React, { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { API_CONFIG, getApiUrl, getAuthenticatedHeaders } from '@/lib/config'

interface FormHeaderProps {
  title: string
  onLoadSettings: () => void
  loadingUserSettings: boolean
  avatarsLoaded?: boolean
  onSchedulePost?: () => void
  userEmail?: string
}

export default function FormHeader({ title, onLoadSettings, loadingUserSettings, avatarsLoaded = true, onSchedulePost, userEmail }: FormHeaderProps) {
  const [hasUserSettings, setHasUserSettings] = useState(false)
  const [checkingSettings, setCheckingSettings] = useState(false)

  // Check if user has saved settings
  useEffect(() => {
    const checkUserSettings = async () => {
      if (!userEmail) return
      
      setCheckingSettings(true)
      try {
        const response = await fetch(
          `${getApiUrl(API_CONFIG.ENDPOINTS.USER_SETTINGS)}?email=${userEmail}`,
          {
            method: 'GET',
            headers: getAuthenticatedHeaders()
          }
        )

        if (response.ok) {
          const userSettings = await response.json()
          // Check if user has any meaningful settings data
          const hasData = userSettings.success && userSettings.data && (
            userSettings.data.name ||
            userSettings.data.position ||
            userSettings.data.companyName ||
            userSettings.data.avatar ||
            userSettings.data.prompt
          )
          setHasUserSettings(hasData)
        } else {
          setHasUserSettings(false)
        }
      } catch (error) {
        console.error('Error checking user settings:', error)
        setHasUserSettings(false)
      } finally {
        setCheckingSettings(false)
      }
    }

    checkUserSettings()
  }, [userEmail])

  return (
    <div className="flex items-center justify-between mb-10">
      <h2 className="text-2xl md:text-[32px] font-semibold text-[#282828]">
        {title}
      </h2>
      {hasUserSettings && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onLoadSettings}
            disabled={loadingUserSettings || !avatarsLoaded || checkingSettings}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-transparent text-[#5046E5] rounded-full font-semibold text-sm sm:text-base hover:bg-[#5046E5] hover:text-white border-2 border-[#5046E5] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#5046E5]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {loadingUserSettings || checkingSettings ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {checkingSettings ? 'Checking...' : 'Loading...'}
              </>
            ) : !avatarsLoaded ? (
              'Loading Avatars...'
            ) : (
              'Auto Fill'
            )}
          </button>
          
          {onSchedulePost && (
            <button
              type="button"
              onClick={onSchedulePost}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-transparent text-[#5046E5] rounded-full font-semibold text-sm sm:text-base hover:bg-[#5046E5] hover:text-white border-2 border-[#5046E5] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#5046E5]/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Clock className="h-4 w-4" />
              Schedule Post
            </button>
          )}
        </div>
      )}
    </div>
  )
}
