'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAppSelector } from '@/store/hooks'
import { useFocusTrap } from '@/hooks/layout/useFocusTrap'
import { useMobileSidebar } from '@/hooks/layout/useMobileSidebar'
import { useMobileSidebarModals } from '@/hooks/layout/useMobileSidebarModals'
import { useAnalytics } from '@/hooks/use-analytics'
import MobileSidebarBackdrop from './mobile-sidebar/MobileSidebarBackdrop'
import MobileSidebarHeader from './mobile-sidebar/MobileSidebarHeader'
import MobileSidebarNavigation from './mobile-sidebar/MobileSidebarNavigation'
import MobileSidebarActions from './mobile-sidebar/MobileSidebarActions'
import MobileSidebarModals from './mobile-sidebar/MobileSidebarModals'

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname()
  const containerRef = useFocusTrap(isOpen)
  const { trackNavigation, trackButtonClick } = useAnalytics()
  const { isAuthenticated, user: currentUser, isLoading } = useAppSelector((state) => state.user)

  useMobileSidebar({ isOpen, onClose })

  const {
    isSignupModalOpen,
    setIsSignupModalOpen,
    isSigninModalOpen,
    setIsSigninModalOpen,
    isForgotPasswordModalOpen,
    setIsForgotPasswordModalOpen,
    isEmailVerificationModalOpen,
    setIsEmailVerificationModalOpen,
    verificationEmail,
    handleOpenSignup,
    handleOpenSignin,
    handleOpenForgotPassword,
    handleRegistrationSuccess
  } = useMobileSidebarModals()

  return (
    <>
      {/* Backdrop with enhanced blur */}
      <MobileSidebarBackdrop isOpen={isOpen} onClose={onClose} />

      {/* Sidebar Container */}
      <div
        ref={containerRef}
        id="mobile-sidebar"
        style={{ borderTopLeftRadius: '25px', borderBottomLeftRadius: '25px' }}
        className={cn(
          'overflow-hidden fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-gradient-to-b from-white via-gray-50/95 to-white/98 backdrop-blur-2xl border-l border-gray-200/30 shadow-2xl transition-all duration-500 ease-out lg:hidden flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        {/* Header Section */}
        <MobileSidebarHeader onClose={onClose} />

        {/* Navigation Section - Scrollable */}
        <MobileSidebarNavigation
          isAuthenticated={isAuthenticated}
          onClose={onClose}
          onTrackNavigation={trackNavigation}
        />

        {/* Action Buttons Section - Fixed at Bottom */}
        <div className="flex-shrink-0 p-6 border-t border-gray-200/50 bg-gradient-to-t from-gray-50/80 to-transparent">
          <MobileSidebarActions
            isLoading={isLoading}
            isAuthenticated={isAuthenticated}
            currentUser={currentUser}
            pathname={pathname}
            onClose={onClose}
            onOpenSignin={handleOpenSignin}
            onOpenSignup={handleOpenSignup}
            onTrackNavigation={trackNavigation}
            onTrackButtonClick={trackButtonClick}
          />
        </div>
      </div>

      {/* Modals */}
      <MobileSidebarModals
        isSignupModalOpen={isSignupModalOpen}
        setIsSignupModalOpen={setIsSignupModalOpen}
        isSigninModalOpen={isSigninModalOpen}
        setIsSigninModalOpen={setIsSigninModalOpen}
        isForgotPasswordModalOpen={isForgotPasswordModalOpen}
        setIsForgotPasswordModalOpen={setIsForgotPasswordModalOpen}
        isEmailVerificationModalOpen={isEmailVerificationModalOpen}
        setIsEmailVerificationModalOpen={setIsEmailVerificationModalOpen}
        verificationEmail={verificationEmail}
        onOpenSignin={handleOpenSignin}
        onOpenSignup={handleOpenSignup}
        onOpenForgotPassword={handleOpenForgotPassword}
        onRegistrationSuccess={handleRegistrationSuccess}
      />
    </>
  )
}
