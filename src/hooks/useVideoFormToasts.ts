'use client'

import { useState, useCallback } from 'react'

interface UseVideoFormToastsReturn {
  showUsageToast: boolean
  usageToastMessage: string
  showPendingPaymentToast: boolean
  pendingPaymentMessage: string
  showSubscriptionRequiredToast: boolean
  subscriptionRequiredMessage: string
  showUsageToastWithMessage: (message: string) => void
  showPendingPaymentWithMessage: (message: string) => void
  showSubscriptionRequiredWithMessage: (message: string) => void
  closeUsageToast: () => void
  closePendingPaymentToast: () => void
  closeSubscriptionRequiredToast: () => void
}

export function useVideoFormToasts(): UseVideoFormToastsReturn {
  const [showUsageToast, setShowUsageToast] = useState(false)
  const [usageToastMessage, setUsageToastMessage] = useState('')
  const [showPendingPaymentToast, setShowPendingPaymentToast] = useState(false)
  const [pendingPaymentMessage, setPendingPaymentMessage] = useState('')
  const [showSubscriptionRequiredToast, setShowSubscriptionRequiredToast] = useState(false)
  const [subscriptionRequiredMessage, setSubscriptionRequiredMessage] = useState('')

  const showUsageToastWithMessage = useCallback((message: string) => {
    setUsageToastMessage(message)
    setShowUsageToast(true)
  }, [])

  const showPendingPaymentWithMessage = useCallback((message: string) => {
    setPendingPaymentMessage(message)
    setShowPendingPaymentToast(true)
  }, [])

  const showSubscriptionRequiredWithMessage = useCallback((message: string) => {
    setSubscriptionRequiredMessage(message)
    setShowSubscriptionRequiredToast(true)
  }, [])

  return {
    showUsageToast,
    usageToastMessage,
    showPendingPaymentToast,
    pendingPaymentMessage,
    showSubscriptionRequiredToast,
    subscriptionRequiredMessage,
    showUsageToastWithMessage,
    showPendingPaymentWithMessage,
    showSubscriptionRequiredWithMessage,
    closeUsageToast: () => setShowUsageToast(false),
    closePendingPaymentToast: () => setShowPendingPaymentToast(false),
    closeSubscriptionRequiredToast: () => setShowSubscriptionRequiredToast(false)
  }
}

