'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface MobileSidebarBackdropProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileSidebarBackdrop({ isOpen, onClose }: MobileSidebarBackdropProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 bg-black/60 backdrop-blur-md transition-all duration-500 ease-out lg:hidden',
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
      onClick={onClose}
      aria-hidden="true"
    />
  )
}

