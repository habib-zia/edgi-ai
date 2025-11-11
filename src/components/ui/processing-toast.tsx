'use client'

import type { ProcessingToast } from '@/hooks/useProcessingToasts'
import { motion } from 'framer-motion'
import { Clock, Minimize2 } from 'lucide-react'

interface ProcessingToastProps {
  toast: ProcessingToast
  onMinimize: (id: string) => void
}

export default function ProcessingToast({ toast, onMinimize }: ProcessingToastProps) {
  // Don't render if minimized
  if (toast.minimized) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="border rounded-lg shadow-lg p-4 transition-all duration-300 border-blue-200/60 bg-blue-50/70 backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-blue-500" />
            <h4 className="font-semibold text-gray-800 text-sm">
              Processing Video
            </h4>
          </div>
          
          <p className="text-xs text-gray-600 ml-7 font-medium">
            {toast.title}
          </p>
          <p className="text-xs text-gray-500 ml-7 mt-1">
            {toast.message}
          </p>
        </div>
        
        {/* Minimize button */}
        <button
          onClick={() => onMinimize(toast.id)}
          className="text-gray-400 hover:text-gray-600 transition-colors ml-2 flex-shrink-0"
          title="Minimize"
        >
          <Minimize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Processing indicator */}
      <div className="mb-2">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span className="text-xs text-gray-600">Processing your video...</span>
        </div>
      </div>
    </motion.div>
  )
}

