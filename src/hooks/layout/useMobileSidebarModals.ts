'use client'

import { useState, useCallback } from 'react'

export function useMobileSidebarModals() {
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [isSigninModalOpen, setIsSigninModalOpen] = useState(false)
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false)
  const [isEmailVerificationModalOpen, setIsEmailVerificationModalOpen] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState('')

  const handleOpenSignup = useCallback(() => {
    setIsSignupModalOpen(true)
  }, [])

  const handleOpenSignin = useCallback(() => {
    setIsSigninModalOpen(true)
  }, [])

  const handleOpenForgotPassword = useCallback(() => {
    setIsForgotPasswordModalOpen(true)
  }, [])

  const handleRegistrationSuccess = useCallback((email: string) => {
    setVerificationEmail(email)
    setIsEmailVerificationModalOpen(true)
  }, [])

  return {
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
  }
}

