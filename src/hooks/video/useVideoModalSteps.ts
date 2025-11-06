'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useUnifiedSocketContext } from '@/components/providers/UnifiedSocketProvider'
import { useModalScrollLock } from '@/components/providers/ModalScrollLockProvider'

export type ModalStep = 'form' | 'loading' | 'complete'

interface UseVideoModalStepsProps {
  isOpen: boolean
  startAtComplete?: boolean
  videoData?: { title: string; youtubeUrl: string; thumbnail: string } | null
  onClose: () => void
  onFailed?: () => void // Callback when video generation fails
}

const REDIRECT_KEY = 'videoModalRedirectExecuted'

function redirectToCreateVideoOnce() {
  if (typeof window === 'undefined') return
  // Avoid duplicate redirects within the same session and if already on target page
  if (sessionStorage.getItem(REDIRECT_KEY)) return
  if (window.location.pathname === '/create-video') return
  sessionStorage.setItem(REDIRECT_KEY, 'true')
  window.location.href = '/create-video'
}

export function useVideoModalSteps({
  isOpen,
  startAtComplete = false,
  videoData,
  onClose,
  onFailed
}: UseVideoModalStepsProps) {
  const [currentStep, setCurrentStep] = useState<ModalStep>(startAtComplete ? 'complete' : 'form')
  const [countdown, setCountdown] = useState(20)
  const [videoGenerationRedirected, setVideoGenerationRedirected] = useState(false)
  const isNewSubmissionRef = useRef(false)

  const {
    latestVideoUpdate,
    clearVideoUpdates,
    clearCompletedVideoUpdates
  } = useUnifiedSocketContext()

  const { openModal, closeModal } = useModalScrollLock()

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      openModal()
      // Reset modal step to 'form' when modal opens for new submission
      // Only reset if not viewing completed video and not starting at complete
      if (!startAtComplete && !videoData) {
        setCurrentStep('form')
        // Mark as new submission to prevent socket updates from overriding
        isNewSubmissionRef.current = true
      }
    } else {
      closeModal()
      // Reset new submission flag when modal closes
      isNewSubmissionRef.current = false
    }

    // Cleanup function to close modal when component unmounts
    return () => {
      closeModal()
    }
  }, [isOpen, openModal, closeModal, startAtComplete, videoData])

  // Listen for video processing updates from socket
  // But ignore updates when viewing a completed video (modal opened with videoData)
  useEffect(() => {
    if (!latestVideoUpdate) return

    // Don't respond to socket updates when viewing a completed video
    // The modal should stay in 'complete' state when opened for viewing
    if (startAtComplete || videoData) {
      return
    }

    // Ignore socket updates if this is a new submission and we're still on form step
    // This prevents existing video progress from skipping the form step
    if (isNewSubmissionRef.current && currentStep === 'form') {
      return
    }

    const { status, message } = latestVideoUpdate

    console.log('🎥 Create Video Modal received update:', { status, message })

    if (status === 'processing' || status === 'pending') {
      // Video is being processed - ensure we're in loading state
      if (currentStep !== 'loading') {
        setCurrentStep('loading')
      }
    } else if (status === 'completed' || status === 'success') {
      // Video is completed - move to complete state
      setCurrentStep('complete')
    } else if (status === 'failed') {
      // Video failed - go back to form with error
      setCurrentStep('form')
      // Call onFailed callback to set avatar error
      if (onFailed) {
        onFailed()
      }
    }
  }, [latestVideoUpdate, currentStep, startAtComplete, videoData, onFailed])

  // Auto close modal with countdown when in loading state
  useEffect(() => {
    let countdownTimer: NodeJS.Timeout

    if (currentStep === 'loading') {
      // Start countdown
      countdownTimer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownTimer!)
            // Close modal and navigate to /create-video when countdown reaches 0
            setTimeout(() => {
              // Close the modal first
              onClose()
              setTimeout(() => {
                if (window.location.pathname !== '/create-video' && videoGenerationRedirected) {
                  setVideoGenerationRedirected(false)
                  window.location.href = '/create-video'
                }
              }, 100)
            }, 1000)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      // Reset countdown when not in loading state
      setCountdown(20)
    }

    return () => {
      if (countdownTimer) {
        clearInterval(countdownTimer)
      }
    }
  }, [currentStep, onClose, videoGenerationRedirected])

  const handleClose = useCallback(() => {
    const wasLoading = currentStep === 'loading'
    // Check if we're viewing a completed video (not creating a new one)
    const isViewingVideo = startAtComplete || !!videoData

    setCurrentStep(startAtComplete ? 'complete' : 'form')

    // Only clear localStorage keys and completed updates when closing after creating a new video
    // Don't clear these when just viewing a completed video
    if (!isViewingVideo) {
      clearCompletedVideoUpdates()
      localStorage.removeItem('videoGenerationStarted')
      localStorage.removeItem('videoProgress')
    }

    onClose()

    // Only redirect if modal was visible, was in loading state, and we're creating a new video (not viewing)
    if (isOpen && wasLoading && !isViewingVideo) {
      setTimeout(redirectToCreateVideoOnce, 100)
    }
  }, [currentStep, startAtComplete, onClose, clearCompletedVideoUpdates, isOpen, videoData])

  const setStep = useCallback((step: ModalStep) => {
    setCurrentStep(step)
  }, [])

  const markSubmissionComplete = useCallback(() => {
    isNewSubmissionRef.current = false
  }, [])

  const updateVideoGenerationRedirected = useCallback((value: boolean) => {
    setVideoGenerationRedirected(value)
  }, [])

  return {
    currentStep,
    countdown,
    videoGenerationRedirected,
    setStep,
    handleClose,
    markSubmissionComplete,
    setVideoGenerationRedirected: updateVideoGenerationRedirected,
    clearVideoUpdates
  }
}

