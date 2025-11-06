'use client'

import { useState, useCallback } from 'react'
import { apiService, PaymentMethod } from '@/lib/api-service'
import { useNotificationStore } from '@/components/ui/global-notification'

type Card = PaymentMethod

interface UseBulkOperationsProps {
  cards: Card[]
  onRefresh: () => void
  onSetAsDefault: (cardId: string) => Promise<void>
}

export function useBulkOperations({ cards, onRefresh, onSetAsDefault }: UseBulkOperationsProps) {
  const [selectedCards, setSelectedCards] = useState<string[]>([])
  const { showNotification } = useNotificationStore()

  // Handle card selection
  const handleCardSelection = useCallback((cardId: string) => {
    setSelectedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    )
  }, [])

  // Handle bulk delete
  const handleBulkDelete = useCallback(async (cardIds: string[]) => {
    try {
      for (const cardId of cardIds) {
        await apiService.deletePaymentMethod(cardId)
      }
      showNotification(`${cardIds.length} payment method(s) removed successfully!`, 'success')
      setSelectedCards([])
      onRefresh()
    } catch {
      showNotification('Failed to remove payment methods', 'error')
    }
  }, [onRefresh, showNotification])

  // Handle bulk set default
  const handleBulkSetDefault = useCallback(async (cardId: string) => {
    await onSetAsDefault(cardId)
    setSelectedCards([])
  }, [onSetAsDefault])

  // Handle bulk export
  const handleBulkExport = useCallback((cardIds: string[]) => {
    const selectedCardsData = cards.filter(card => cardIds.includes(card.id))
    const exportData = selectedCardsData.map(card => ({
      brand: card.brand,
      last4: card.last4,
      expMonth: card.expMonth,
      expYear: card.expYear,
      isDefault: card.isDefault,
      isExpired: card.isExpired
    }))
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payment-methods-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    showNotification('Payment methods exported successfully!', 'success')
    setSelectedCards([])
  }, [cards, showNotification])

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedCards([])
  }, [])

  return {
    selectedCards,
    handleCardSelection,
    handleBulkDelete,
    handleBulkSetDefault,
    handleBulkExport,
    clearSelection
  }
}

