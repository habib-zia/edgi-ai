'use client'

import React from 'react'
import SignupModal from '@/components/ui/signup-modal'
import SigninModal from '@/components/ui/signin-modal'
import ForgotPasswordModal from '@/components/ui/forgot-password-modal'
import EmailVerificationModal from '@/components/ui/email-verification-modal'

interface MobileSidebarModalsProps {
  isSignupModalOpen: boolean
  setIsSignupModalOpen: (open: boolean) => void
  isSigninModalOpen: boolean
  setIsSigninModalOpen: (open: boolean) => void
  isForgotPasswordModalOpen: boolean
  setIsForgotPasswordModalOpen: (open: boolean) => void
  isEmailVerificationModalOpen: boolean
  setIsEmailVerificationModalOpen: (open: boolean) => void
  verificationEmail: string
  onOpenSignin: () => void
  onOpenSignup: () => void
  onOpenForgotPassword: () => void
  onRegistrationSuccess: (email: string) => void
}

export default function MobileSidebarModals({
  isSignupModalOpen,
  setIsSignupModalOpen,
  isSigninModalOpen,
  setIsSigninModalOpen,
  isForgotPasswordModalOpen,
  setIsForgotPasswordModalOpen,
  isEmailVerificationModalOpen,
  setIsEmailVerificationModalOpen,
  verificationEmail,
  onOpenSignin,
  onOpenSignup,
  onOpenForgotPassword,
  onRegistrationSuccess
}: MobileSidebarModalsProps) {
  return (
    <>
      {/* Signup Modal */}
      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onOpenSignin={onOpenSignin}
        onRegistrationSuccess={onRegistrationSuccess}
      />

      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={isEmailVerificationModalOpen}
        onClose={() => setIsEmailVerificationModalOpen(false)}
        email={verificationEmail}
      />

      {/* Signin Modal */}
      <SigninModal
        isOpen={isSigninModalOpen}
        onClose={() => setIsSigninModalOpen(false)}
        onOpenSignup={onOpenSignup}
        onOpenForgotPassword={onOpenForgotPassword}
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordModalOpen}
        onClose={() => setIsForgotPasswordModalOpen(false)}
        onOpenSignin={onOpenSignin}
      />
    </>
  )
}

