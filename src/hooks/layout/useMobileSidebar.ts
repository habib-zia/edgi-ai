'use client'

import { useEffect } from 'react'
import { useAnalytics } from '@/hooks/use-analytics'

interface UseMobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function useMobileSidebar({ isOpen, onClose }: UseMobileSidebarProps) {
  const { trackButtonClick } = useAnalytics()

  // Close sidebar when clicking outside
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
        trackButtonClick('mobile_menu', 'sidebar', 'close_escape')
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose, trackButtonClick])
}

