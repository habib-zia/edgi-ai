'use client'

import { useRef, useEffect, ReactNode } from 'react'

interface AuthModalWrapperProps {
  isOpen: boolean
  onClose: () => void
  title: ReactNode
  description: ReactNode
  children: ReactNode
  modalId: string
  maxHeight?: string
}

export default function AuthModalWrapper({
  isOpen,
  onClose,
  title,
  description,
  children,
  modalId,
  maxHeight = 'max-h-[726px]'
}: AuthModalWrapperProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)
  const errorAnnouncementRef = useRef<HTMLDivElement>(null)

  // Focus management and accessibility
  useEffect(() => {
    if (isOpen) {
      // Focus first input when modal opens
      setTimeout(() => {
        firstInputRef.current?.focus()
      }, 100)

      // Trap focus within modal
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }

        if (e.key === 'Tab' && modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
          const firstElement = focusableElements[0] as HTMLElement
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault()
              lastElement.focus()
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault()
              firstElement.focus()
            }
          }
        }
      }

      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className={`bg-white rounded-[12px] xl:h-fit h-full md:px-[55px] px-4 pt-10 pb-10 max-w-[820px] w-full ${maxHeight} flex flex-col relative`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${modalId}-title`}
        aria-describedby={`${modalId}-description`}
      >
        {/* Screen reader announcements */}
        <div
          ref={errorAnnouncementRef}
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
        />
        
        <button
          onClick={onClose}
          className="cursor-pointer md:ml-4 md:absolute md:top-[30px] md:right-[30px] absolute top-[20px] right-[20px]"
          aria-label={`Close ${modalId} modal`}
        >
          <svg width="24" height="24" className="md:w-6 md:h-6 w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.5 1.5L1.5 22.5M1.5 1.5L22.5 22.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="flex-1">
            <h3 id={`${modalId}-title`} className="md:text-[48px] text-[25px] font-semibold text-[#282828] text-center">
              {title}
            </h3>
            <p id={`${modalId}-description`} className="text-[#667085] text-[16px] text-center mt-2">
              {description}
            </p>
          </div>
        </div>

        {/* Modal Content */}
        <div className="pt-7 overflow-y-auto flex-1 px-2">
          {children}
        </div>
      </div>
    </div>
  )
}

export { AuthModalWrapper }

