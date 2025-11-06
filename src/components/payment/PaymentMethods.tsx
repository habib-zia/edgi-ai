'use client'

import React, { useState } from 'react'
import BulkCardOperations from '@/components/ui/bulk-card-operations'
import CardPreview from '@/components/ui/card-preview'
import CardUsageHistory from '@/components/ui/card-usage-history'
import { X, Star } from 'lucide-react'
import { usePaymentMethods } from '@/hooks/payment/usePaymentMethods'
import { usePaymentOperations } from '@/hooks/payment/usePaymentOperations'
import { useBulkOperations } from '@/hooks/payment/useBulkOperations'
import PaymentForm from './PaymentForm'
import ConfirmationModal from './ConfirmationModal'

interface PaymentMethodsProps {
  authToken?: string // Keep for backward compatibility but not used
}

export const PaymentMethods: React.FC<PaymentMethodsProps> = () => {
  const [showCardPreview, setShowCardPreview] = useState<string | null>(null)
  const [showUsageHistory, setShowUsageHistory] = useState<string | null>(null)

  // Use payment methods hook
  const {
    cards,
    loading,
    showAddCard,
    setupIntent,
    creatingIntent,
    hasActiveSubscription,
    fetchPaymentMethods,
    createSetupIntent,
    handleCardAdded,
    handleCancelAddCard
  } = usePaymentMethods()

  // Use payment operations hook
  const {
    showDeleteConfirm,
    cardToDelete,
    deletingCard,
    settingDefault,
    setAsDefault,
    showDeleteConfirmation,
    confirmDeleteCard,
    cancelDeleteCard
  } = usePaymentOperations({
    cards,
    onRefresh: fetchPaymentMethods
  })

  // Use bulk operations hook
  const {
    selectedCards,
    handleCardSelection,
    handleBulkDelete,
    handleBulkSetDefault,
    handleBulkExport,
    clearSelection
  } = useBulkOperations({
    cards,
    onRefresh: fetchPaymentMethods,
    onSetAsDefault: setAsDefault
  })

  // Show loading state while checking subscription
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-[#282828] mb-2">Payment Methods</h2>
            <p className="text-[#5F5F5F]">Manage your saved payment methods and billing information</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#5046E5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#5F5F5F]">Loading payment methods...</p>
          </div>
        </div>
      </div>
    )
  }

  // Don't show payment methods if user doesn't have active subscription
  if (!hasActiveSubscription) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-7 items-start sm:items-center mb-6 sm:mb-8">
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#282828] mb-2">Payment Methods</h2>
          <p className="text-sm sm:text-base text-[#5F5F5F]">Manage your saved payment methods and billing information</p>
        </div>
        <button
          onClick={createSetupIntent}
          disabled={creatingIntent}
          className="w-full sm:w-auto bg-[#5046E5] text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-[#4338CA] transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creatingIntent ? (
            <>
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-sm sm:text-base">Initializing...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm sm:text-base">Add New Card</span>
            </>
          )}
        </button>
      </div>

      {/* Bulk Operations */}
      <BulkCardOperations
        selectedCards={selectedCards}
        cards={cards}
        onBulkDelete={handleBulkDelete}
        onBulkSetDefault={handleBulkSetDefault}
        onBulkExport={handleBulkExport}
        onClearSelection={clearSelection}
      />

      {/* Saved Cards */}
      <div className="space-y-3 sm:space-y-4">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`border-2 rounded-xl p-4 sm:p-6 transition-all duration-200 ${
              selectedCards.includes(card.id)
                ? 'border-blue-300 bg-blue-50'
                : card.isExpired 
                  ? 'border-red-200 bg-red-50' 
                  : card.isDefault
                    ? 'border-[#5046E5] bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            {/* Mobile Layout */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              {/* Card Info Section */}
              <div className="flex items-center gap-3 flex-1">
                {/* Selection Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedCards.includes(card.id)}
                  onChange={() => handleCardSelection(card.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                />
                
                {/* Card Brand Icon */}
                <div className={`w-12 h-8 sm:w-14 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  card.brand.toLowerCase() === 'visa' ? 'bg-blue-600' :
                  card.brand.toLowerCase() === 'mastercard' ? 'bg-red-500' :
                  card.brand.toLowerCase() === 'amex' ? 'bg-green-600' :
                  'bg-gray-600'
                }`}>
                  <span className="text-white text-xs font-bold uppercase">
                    {card.brand === 'American Express' ? 'AMEX' : card.brand}
                  </span>
                </div>
                
                {/* Card Details */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[#282828] text-base sm:text-lg">
                    •••• •••• •••• {card.last4}
                  </div>
                  <div className="text-[#5F5F5F] text-sm">
                    Expires {card.expMonth.toString().padStart(2, '0')}/{card.expYear}
                  </div>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {card.isDefault && (
                  <span className="bg-[#5046E5] text-white px-2 sm:px-3 py-1 rounded-full text-xs font-medium">
                    Default
                  </span>
                )}
                {card.isExpired && (
                  <span className="bg-red-100 text-red-800 px-2 sm:px-3 py-1 rounded-full text-xs font-medium">
                    Expired
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
              {/* Mobile: Stack buttons vertically on small screens */}
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                {!card.isDefault && (
                  <button
                    onClick={() => setAsDefault(card.id)}
                    disabled={settingDefault === card.id}
                    className="flex-1 sm:flex-none text-[#5046E5] hover:text-[#4338CA] text-sm font-medium px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-0"
                  >
                    {settingDefault === card.id && (
                      <div className="w-3 h-3 border-2 border-[#5046E5] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    )}
                    <Star className="w-4 h-4 flex-shrink-0" />
                    <span className="inline">Set Default</span>
                  </button>
                )}
                
                <button
                  onClick={() => showDeleteConfirmation(card.id)}
                  disabled={cards.length === 1 || deletingCard}
                  className={`flex-1 sm:flex-none text-sm font-medium px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 min-w-0 ${
                    cards.length === 1 || deletingCard
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                  }`}
                  title={cards.length === 1 ? 'Cannot delete your last payment method' : 'Remove this payment method'}
                >
                  {deletingCard && cardToDelete === card.id && (
                    <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  )}
                  <X className="w-4 h-4 flex-shrink-0" />
                  <span className="inline">Remove</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {cards.length === 0 && (
        <div className="text-center py-8 sm:py-12 px-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-[#282828] mb-2">No Payment Methods</h3>
          <p className="text-sm sm:text-base text-[#5F5F5F] mb-4 sm:mb-6">Add a payment method to get started with your subscription.</p>
          <button
            onClick={createSetupIntent}
            className="w-full sm:w-auto bg-[#5046E5] text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-[#4338CA] transition-colors font-medium"
          >
            Add Your First Card
          </button>
        </div>
      )}

      {cards.length === 1 && (
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-blue-800 mb-1 text-sm sm:text-base">Important Notice</h4>
              <p className="text-xs sm:text-sm text-blue-700">
                You must keep at least one payment method. Add another card before removing this one.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Card Modal */}
      {showAddCard && setupIntent && (
        <PaymentForm
          setupIntent={setupIntent}
          onSuccess={handleCardAdded}
          onCancel={handleCancelAddCard}
          cards={cards}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onConfirm={confirmDeleteCard}
        onCancel={cancelDeleteCard}
        title="Delete Payment Method"
        message={
          cardToDelete && cards.find(c => c.id === cardToDelete)?.isDefault
            ? "This is your default payment method. Deleting it will set another card as default. Are you sure you want to continue?"
            : "Are you sure you want to remove this payment method? This action cannot be undone."
        }
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deletingCard}
      />

      {/* Card Preview Modal */}
      {showCardPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Card Preview</h2>
              <button
                onClick={() => setShowCardPreview(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              {(() => {
                const card = cards.find(c => c.id === showCardPreview)
                if (!card) return null
                
                return (
                  <CardPreview
                    cardNumber={`•••• •••• •••• ${card.last4}`}
                    expiryMonth={card.expMonth.toString().padStart(2, '0')}
                    expiryYear={card.expYear.toString()}
                    cardType={card.brand}
                  />
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Usage History Modal */}
      {showUsageHistory && (
        <CardUsageHistory
          card={cards.find(c => c.id === showUsageHistory)!}
          onClose={() => setShowUsageHistory(null)}
        />
      )}
    </div>
  )
}

