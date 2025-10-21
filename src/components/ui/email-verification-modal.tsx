'use client'

import { useRef, useEffect, useCallback } from 'react'
import { CheckCircle, Mail } from 'lucide-react'
import Link from 'next/link'
import { useModalScrollLock } from '@/hooks/useModalScrollLock'

interface EmailVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
}

export default function EmailVerificationModal({ isOpen, onClose, email }: EmailVerificationModalProps) {
  // Use the custom scroll lock hook
  useModalScrollLock(isOpen)
  
  // Refs for focus management
  const modalRef = useRef<HTMLDivElement>(null)

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  // Focus management and accessibility
  useEffect(() => {
    if (isOpen) {
      // Trap focus within modal
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleClose()
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
  }, [isOpen, handleClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-[12px] h-full md:px-[55px] px-4 pt-10 pb-10 max-w-[820px] w-full max-h-[726px] flex flex-col relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-verification-modal-title"
        aria-describedby="email-verification-modal-description"
      >
        <button
          onClick={handleClose}
          className="cursor-pointer md:ml-4 md:absolute md:top-[30px] md:right-[30px] absolute top-[20px] right-[20px]"
          aria-label="Close email verification modal"
        >
          <svg width="24" height="24" className="md:w-6 md:h-6 w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.5 1.5L1.5 22.5M1.5 1.5L22.5 22.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-center flex-shrink-0 mb-8">
          <div className="flex-1 text-center">
            <h3 id="email-verification-modal-title" className="md:text-[48px] text-[25px] font-semibold text-[#282828]">
              Check Your <span className="text-[#5046E5]">Email</span>
            </h3>
            <p id="email-verification-modal-description" className="text-[#667085] text-[16px] mt-2">
              We&apos;ve sent a verification link to your email address
            </p>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Main Message */}
          <div className="max-w-md mb-8">
            <h4 className="text-2xl font-semibold text-[#282828] mb-4">
              Account Created Successfully!
            </h4>
            <p className="text-[#667085] text-[16px] leading-relaxed mb-6">
              Welcome to <Link href={"/"} className="text-[#5046E5] font-semibold hover:underline">EdgeAi</Link>! We&apos;ve sent a verification email to:
            </p>
            
            {/* Email Display */}
            <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2">
                <Mail className="w-5 h-5 text-[#5046E5]" />
                <span className="text-[#282828] font-medium">{email}</span>
              </div>
            </div>

            <p className="text-[#667085] text-[16px] leading-relaxed">
              Please check your email and click the verification link to complete your registration and start creating amazing videos.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
