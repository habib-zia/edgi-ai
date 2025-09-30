'use client'

import { useState } from 'react'
import { Trash2, Star, Download, AlertTriangle, CheckCircle } from 'lucide-react'
import { PaymentMethod } from '@/lib/api-service'

interface BulkCardOperationsProps {
  selectedCards: string[]
  cards: PaymentMethod[]
  onBulkDelete: (cardIds: string[]) => Promise<void>
  onBulkSetDefault: (cardId: string) => Promise<void>
  onBulkExport: (cardIds: string[]) => void
  onClearSelection: () => void
}

export default function BulkCardOperations({
  selectedCards,
  cards,
  onBulkDelete,
  onBulkSetDefault,
  onBulkExport,
  onClearSelection
}: BulkCardOperationsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const selectedCardsData = cards.filter(card => selectedCards.includes(card.id))
  const hasDefaultCard = selectedCardsData.some(card => card.isDefault)
  const hasExpiredCards = selectedCardsData.some(card => card.isExpired)

  const handleBulkDelete = async () => {
    setIsDeleting(true)
    try {
      await onBulkDelete(selectedCards)
      setShowDeleteConfirm(false)
      onClearSelection()
    } catch (error) {
      console.error('Bulk delete failed:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBulkSetDefault = async () => {
    if (selectedCards.length === 1) {
      await onBulkSetDefault(selectedCards[0])
      onClearSelection()
    }
  }

  const handleBulkExport = () => {
    onBulkExport(selectedCards)
    onClearSelection()
  }

  if (selectedCards.length === 0) return null

  return (
    <>
      {/* Bulk Operations Bar */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4 min-w-96">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-800">
                {selectedCards.length} card{selectedCards.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <button
              onClick={onClearSelection}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Set Default Button */}
            {selectedCards.length === 1 && !selectedCardsData[0]?.isDefault && (
              <button
                onClick={handleBulkSetDefault}
                className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
              >
                <Star className="w-4 h-4" />
                Set as Default
              </button>
            )}

            {/* Export Button */}
            <button
              onClick={handleBulkExport}
              className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Export
            </button>

            {/* Delete Button */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={selectedCards.length === cards.length}
              className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>

          {/* Warnings */}
          {(hasDefaultCard || hasExpiredCards) && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>
                  {hasDefaultCard && 'Contains default card. '}
                  {hasExpiredCards && 'Contains expired cards. '}
                  Review before proceeding.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Delete {selectedCards.length} Payment Method{selectedCards.length > 1 ? 's' : ''}
                  </h3>
                  <p className="text-gray-600 text-sm mb-6">
                    Are you sure you want to delete {selectedCards.length} payment method{selectedCards.length > 1 ? 's' : ''}? 
                    This action cannot be undone.
                  </p>
                  
                  {/* Selected Cards List */}
                  <div className="mb-4 max-h-32 overflow-y-auto">
                    {selectedCardsData.map(card => (
                      <div key={card.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-5 rounded text-xs font-bold text-white flex items-center justify-center ${
                            card.brand.toLowerCase() === 'visa' ? 'bg-blue-600' :
                            card.brand.toLowerCase() === 'mastercard' ? 'bg-red-500' :
                            card.brand.toLowerCase() === 'amex' ? 'bg-green-600' :
                            'bg-gray-600'
                          }`}>
                            {card.brand === 'American Express' ? 'AMEX' : card.brand}
                          </div>
                          <span className="text-sm font-mono">•••• {card.last4}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {card.isDefault && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Default</span>
                          )}
                          {card.isExpired && (
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Expired</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleBulkDelete}
                      disabled={isDeleting}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isDeleting && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      )}
                      Delete {selectedCards.length} Card{selectedCards.length > 1 ? 's' : ''}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isDeleting}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
