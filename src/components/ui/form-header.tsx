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
    <div className="flex items-center justify-between mb-10">
      <h2 className="text-2xl md:text-[32px] font-semibold text-[#282828]">
        {title}
      </h2>
      {hasUserSettings && onToggleScheduleMode && (
        <div className="flex items-center gap-3">
          <span className="text-[#5046E5] font-bold" style={{ fontSize: '20px' }}>Schedule Post</span>
          <button
            type="button"
            onClick={onToggleScheduleMode}
            className="relative inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:ring-offset-2"
            style={{
              height: '31px',
              width: '56px',
              background: isScheduleMode ? '#5046E5' : '#E5E7EB',
              boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
          >
            <span
              className={`inline-block rounded-full bg-white transition-transform duration-200 ease-in-out ${isScheduleMode ? 'translate-x-6.5' : 'translate-x-1'
                }`}
              style={{
                height: '27px',
                width: '27px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
              }}
            />
          </button>
        </div>
      )}
    </div>
  )
}
