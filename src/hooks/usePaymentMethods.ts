'use client'

import { useState, useCallback, useEffect } from 'react'
import { apiService, PaymentMethod } from '@/lib/api-service'
import { useNotificationStore } from '@/components/ui/global-notification'
import { useSubscription } from '@/hooks/useSubscription'

type Card = PaymentMethod

export function usePaymentMethods() {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddCard, setShowAddCard] = useState(false)
  const [setupIntent, setSetupIntent] = useState<any>(null)
  const [creatingIntent, setCreatingIntent] = useState(false)
  const { showNotification } = useNotificationStore()
  const { subscription, loading: subscriptionLoading, fetchSubscription } = useSubscription()

  // Fetch saved payment methods
  const fetchPaymentMethods = useCallback(async () => {
    try {
      const response = await apiService.getPaymentMethods()
      
      if (response.success && response.data) {
        setCards(response.data.paymentMethods)
      } else {
        const errorMessage = response.message || 'Failed to fetch payment methods'
        showNotification(errorMessage, 'error')
        console.error('Failed to fetch payment methods:', errorMessage)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      showNotification(`Error loading payment methods: ${errorMessage}`, 'error')
      console.error('Error fetching payment methods:', error)
    } finally {
      setLoading(false)
    }
  }, [showNotification])

  // Create setup intent for new card
  const createSetupIntent = useCallback(async () => {
    setCreatingIntent(true)
    try {
      const response = await apiService.createSetupIntent()
      
      if (response.success && response.data) {
        setSetupIntent(response.data)
        setShowAddCard(true)
        showNotification('Payment form initialized successfully', 'success')
      } else {
        const errorMessage = response.message || 'Failed to initialize payment form'
        showNotification(errorMessage, 'error')
        console.error('Failed to create setup intent:', errorMessage)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      showNotification(`Error initializing payment form: ${errorMessage}`, 'error')
      console.error('Error creating setup intent:', error)
    } finally {
      setCreatingIntent(false)
    }
  }, [showNotification])

  // Handle successful card addition
  const handleCardAdded = useCallback(() => {
    setShowAddCard(false)
    setSetupIntent(null)
    fetchPaymentMethods() // Refresh the list
  }, [fetchPaymentMethods])

  // Handle cancel card addition
  const handleCancelAddCard = useCallback(() => {
    setShowAddCard(false)
    setSetupIntent(null)
  }, [])

  // Check if user has active subscription
  const hasActiveSubscription = subscription && subscription.status === 'active'

  // Initialize subscription
  useEffect(() => {
    const initializeData = async () => {
      try {
        await fetchSubscription()
      } catch (error) {
        console.error('Failed to fetch subscription:', error)
      }
    }

    initializeData()
  }, [fetchSubscription])

  // Fetch payment methods if user has active subscription
  useEffect(() => {
    if (hasActiveSubscription) {
      fetchPaymentMethods()
    } else {
      setLoading(false)
    }
  }, [hasActiveSubscription, fetchPaymentMethods])

  return {
    cards,
    loading: subscriptionLoading || loading,
    showAddCard,
    setupIntent,
    creatingIntent,
    hasActiveSubscription,
    fetchPaymentMethods,
    createSetupIntent,
    handleCardAdded,
    handleCancelAddCard
  }
}

