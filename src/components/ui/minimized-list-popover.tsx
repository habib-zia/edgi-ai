'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Maximize2 } from 'lucide-react'
import { ProcessingToast } from '@/hooks/useProcessingToasts'

interface MinimizedListPopoverProps {
  toasts: ProcessingToast[]
  onRestore: (id: string) => void
  onClose: () => void
  isOpen: boolean
  anchorRef: React.RefObject<HTMLButtonElement>
}

export default function MinimizedListPopover({
  toasts,
  onRestore,
  onClose,
  isOpen,
  anchorRef
}: MinimizedListPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      
      // Check if click is outside popover and anchor
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        anchorRef.current &&
        !anchorRef.current.contains(target)
      ) {
        onClose()
      }
    }

    // Add event listener with a small delay to avoid immediate close
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose, anchorRef])

  if (!isOpen || toasts.length === 0) {
    return null
  }

  // Calculate position above the circle
  const getPosition = () => {
    if (!anchorRef.current) {
      return { bottom: '5rem', right: '1rem' }
    }
    
    const rect = anchorRef.current.getBoundingClientRect()
    // Position above the circle with some spacing
    const spacing = 8
    return {
      bottom: `${window.innerHeight - rect.top + spacing}px`,
      right: `${window.innerWidth - rect.right}px`,
      transform: 'translateX(0)' // Align right edge with circle
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ duration: 0.2 }}
          className="fixed z-[70] max-w-xs w-80"
          style={getPosition()}
        >
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800 text-sm">
                Minimized Videos ({toasts.length})
              </h3>
            </div>

            {/* List */}
            <div className="max-h-64 overflow-y-auto">
              {toasts.map((toast, index) => (
                  <motion.div
                    key={toast.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onRestore(toast.id)}
                  >
                    <div className="flex items-center gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Clock className="w-4 h-4 text-blue-600" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {toast.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {toast.message}
                        </p>
                      </div>

                      {/* Restore button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onRestore(toast.id)
                        }}
                        className="flex-shrink-0 p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Restore"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

