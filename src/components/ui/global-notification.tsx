'use client'

import { AlertCircle } from 'lucide-react'
import { create } from 'zustand'

interface NotificationState {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  isVisible: boolean
  showNotification: (message: string, type?: 'success' | 'error' | 'warning' | 'info', duration?: number) => void
  hideNotification: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  message: '',
  type: 'info',
  isVisible: false,
  showNotification: (message, type = 'info', duration?: number) => {
    set({ message, type, isVisible: true })
    // Auto hide after duration (default: 10 seconds, error: 15 seconds)
    const hideDelay = duration ?? (type === 'error' ? 15000 : 10000)
    setTimeout(() => {
      set({ isVisible: false })
    }, hideDelay)
  },
  hideNotification: () => set({ isVisible: false })
}))

export default function GlobalNotification() {
  const { message, type, isVisible, hideNotification } = useNotificationStore()

  if (!isVisible) return null

  const getIcon = () => {
    switch (type)
    {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      case 'error':
        return (
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
        )
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  const getBackgroundColor = () => {
    switch (type)
    {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  return (
    <div className="px-2">
    <div className="fixed top-4 md:right-4 right-0 z-[9999] md:max-w-sm max-w-full w-full">
      <div className={`flex items-start p-4 border rounded-lg shadow-lg ${getBackgroundColor()}`}>
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={hideNotification}
          className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
    </div>
  )
}
