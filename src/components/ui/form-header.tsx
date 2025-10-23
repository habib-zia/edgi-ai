'use client'

import React, { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { API_CONFIG, getApiUrl, getAuthenticatedHeaders } from '@/lib/config'

interface FormHeaderProps {
  title: string
  onSchedulePost?: () => void
  userEmail?: string
  isScheduleMode?: boolean
  onToggleScheduleMode?: () => void
}

export default function FormHeader({ title, onSchedulePost, userEmail, isScheduleMode, onToggleScheduleMode }: FormHeaderProps) {
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
    <div className="flex items-center md:flex-row flex-col gap-y-6 md:justify-between justify-start mb-10">
      <h2 className="text-2xl md:text-[32px] font-semibold text-[#282828]">
        {title}
      </h2>
      {hasUserSettings && onToggleScheduleMode && (
        <div className="flex items-center gap-3">
          <span className="text-[#5046E5] font-bold" style={{ fontSize: '20px' }}>Schedule Post</span>
          <label className='flex cursor-pointer select-none items-center'>
            <div className='relative'>
              <input
                type='checkbox'
                checked={isScheduleMode}
                onChange={onToggleScheduleMode}
                className='sr-only'
              />
              <div 
                className='block h-8 w-14 rounded-full transition-colors'
                style={{
                  backgroundColor: isScheduleMode ? '#5046E5' : '#E5E7EB'
                }}
              ></div>
              <div 
                className='dot absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition'
                style={{
                  transform: isScheduleMode ? 'translateX(24px)' : 'translateX(0px)'
                }}
              ></div>
            </div>
          </label>
        </div>
      )}
    </div>
  )
}
