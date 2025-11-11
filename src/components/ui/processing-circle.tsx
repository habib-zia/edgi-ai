'use client'

import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'

interface ProcessingCircleProps {
  count: number
  onClick: () => void
  isPopoverOpen: boolean
}

const ProcessingCircle = forwardRef<HTMLButtonElement, ProcessingCircleProps>(
  ({ count, onClick, isPopoverOpen }, ref) => {
    if (count === 0) {
      return null
    }

    return (
      <motion.button
        ref={ref}
        onClick={onClick}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 17,
          scale: { duration: 0.2 }
        }}
        className={`
          fixed bottom-4 right-4 z-[60]
          w-14 h-14
          bg-gradient-to-br from-blue-500 to-blue-600
          rounded-full
          shadow-lg hover:shadow-xl
          flex items-center justify-center
          transition-shadow duration-300
          cursor-pointer
          ${isPopoverOpen ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
        `}
        title={`${count} minimized video${count > 1 ? 's' : ''}`}
      >
        {/* Clock icon */}
        <Clock className="w-6 h-6 text-white" />
        
        {/* Count badge */}
        {count > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white"
          >
            <span className="text-xs font-bold text-white">{count}</span>
          </motion.div>
        )}
        
        {/* Pulse animation ring */}
        {count > 0 && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-blue-400"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.button>
    )
  }
)

ProcessingCircle.displayName = 'ProcessingCircle'

export default ProcessingCircle

