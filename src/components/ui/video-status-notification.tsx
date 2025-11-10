'use client'

import { useState, useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { VideoInProgress } from '@/hooks/useUnifiedSocket'
import { useProcessingToasts } from '@/hooks/useProcessingToasts'
import ProcessingToast from './processing-toast'
import ProcessingCircle from './processing-circle'
import MinimizedListPopover from './minimized-list-popover'

interface VideoStatusNotificationProps {
  pendingVideos: VideoInProgress[]
  className?: string
}

export default function VideoStatusNotification({ 
  pendingVideos,
  className = '' 
}: VideoStatusNotificationProps) {
  const { toasts, minimizedCount, minimizeToast, restoreToast, updateToasts } = useProcessingToasts()
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const circleRef = useRef<HTMLButtonElement>(null)

  // Sync with pendingVideos
  useEffect(() => {
    updateToasts(pendingVideos)
  }, [pendingVideos, updateToasts])

  // Don't render if no pending videos and no minimized toasts
  if (pendingVideos.length === 0 && minimizedCount === 0) {
    return null
  }

  const visibleToasts = toasts.filter(t => !t.minimized)
  const minimizedToasts = toasts.filter(t => t.minimized)

  const handleRestore = (id: string) => {
    restoreToast(id)
    setIsPopoverOpen(false)
  }

  return (
    <>
      {/* Main toast list */}
      {visibleToasts.length > 0 && (
        <div className={`fixed top-24 right-4 z-10 max-w-xs w-full ${className}`}>
          <div className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {visibleToasts.map((toast) => (
                <ProcessingToast
                  key={toast.id}
                  toast={toast}
                  onMinimize={minimizeToast}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Processing Circle */}
      {minimizedCount > 0 && (
        <ProcessingCircle
          ref={circleRef}
          count={minimizedCount}
          onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          isPopoverOpen={isPopoverOpen}
        />
      )}

      {/* Minimized List Popover */}
      <AnimatePresence>
        {isPopoverOpen && minimizedToasts.length > 0 && (
          <MinimizedListPopover
            toasts={minimizedToasts}
            onRestore={handleRestore}
            onClose={() => setIsPopoverOpen(false)}
            isOpen={isPopoverOpen}
            anchorRef={circleRef}
          />
        )}
      </AnimatePresence>
    </>
  )
}
