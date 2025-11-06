'use client'

import { useState, useCallback } from 'react'
import { apiService, PaymentMethod } from '@/lib/api-service'
import { useNotificationStore } from '@/components/ui/global-notification'

type Card = PaymentMethod

interface UsePaymentOperationsProps {
  cards: Card[]
  onRefresh: () => void
}

export function usePaymentOperations({ cards, onRefresh }: UsePaymentOperationsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [cardToDelete, setCardToDelete] = useState<string | null>(null)
  const [deletingCard, setDeletingCard] = useState(false)
  const [settingDefault, setSettingDefault] = useState<string | null>(null)
  const { showNotification } = useNotificationStore()

  // Set card as default
  const setAsDefault = useCallback(async (cardId: string) => {
    setSettingDefault(cardId)
    try {
      const response = await apiService.setDefaultPaymentMethod(cardId)
      
      if (response.success) {
        showNotification('Default payment method updated successfully!', 'success')
        onRefresh()
      } else {
        const errorMessage = response.message || 'Failed to set default payment method'
        showNotification(errorMessage, 'error')
        console.error('Failed to set default card:', errorMessage)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      showNotification(`Error updating default payment method: ${errorMessage}`, 'error')
      console.error('Error setting default card:', error)
    } finally {
      setSettingDefault(null)
    }
  }, [onRefresh, showNotification])

  // Show delete confirmation modal
  const showDeleteConfirmation = useCallback((cardId: string) => {
    // Check if this is the last payment method
    if (cards.length === 1) {
      showNotification('You cannot delete your last payment method. Please add another payment method first.', 'warning')
      return
    }

    setCardToDelete(cardId)
    setShowDeleteConfirm(true)
  }, [cards.length, showNotification])

  // Confirm and delete card
  const confirmDeleteCard = useCallback(async () => {
    if (!cardToDelete) return

    setDeletingCard(true)
    try {
      const response = await apiService.deletePaymentMethod(cardToDelete)
      
      if (response.success) {
        showNotification('Payment method removed successfully!', 'success')
        onRefresh()
        setShowDeleteConfirm(false)
        setCardToDelete(null)
      } else {
        const errorMessage = response.message || 'Failed to remove payment method'
        showNotification(errorMessage, 'error')
        console.error('Failed to remove card:', errorMessage)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      showNotification(`Error removing payment method: ${errorMessage}`, 'error')
      console.error('Error removing card:', error)
    } finally {
      setDeletingCard(false)
    }
  }, [cardToDelete, onRefresh, showNotification])

  // Cancel delete confirmation
  const cancelDeleteCard = useCallback(() => {
    setShowDeleteConfirm(false)
    setCardToDelete(null)
  }, [])

  return {
    showDeleteConfirm,
    cardToDelete,
    deletingCard,
    settingDefault,
    setAsDefault,
    showDeleteConfirmation,
    confirmDeleteCard,
    cancelDeleteCard
  }
}

