'use client'

import React, { useState } from 'react'
import { PaymentElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { apiService, PaymentMethod } from '@/lib/api-service'
import { useNotificationStore } from '@/components/ui/global-notification'

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51S0FwKB2p93NE0UDmno6UgFck98LzeVeFkxWZnJiXDMYKnSpy8WMFrS9fcjSC3G1tovRnMAfUCz24C6DMCxCSdZr00T0OcEjk5')

type Card = PaymentMethod

interface PaymentFormProps {
  setupIntent: any
  onSuccess: () => void
  onCancel: () => void
  cards: Card[]
}

const PaymentFormContent: React.FC<PaymentFormProps> = ({ setupIntent, onSuccess, onCancel, cards }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [addingCard, setAddingCard] = useState(false)
  const { showNotification } = useNotificationStore()

  const handleAddCard = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!stripe || !elements || !setupIntent) return

    setAddingCard(true)

    try {
      // Confirm the setup intent using PaymentElement
      const { error, setupIntent: confirmedSetupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: 'if_required',
      })

      if (error) {
        console.error('Error confirming setup intent:', error)
        showNotification(`Payment failed: ${error.message}`, 'error')
        setAddingCard(false)
        return
      }

      // Send confirmation to backend
      const response = await apiService.updatePaymentMethod({
        setupIntentId: confirmedSetupIntent?.id || '',
        setAsDefault: cards.length === 0,
      })

      if (response.success) {
        showNotification('Payment method added successfully!', 'success')
        onSuccess()
      } else {
        const errorMessage = response.message || 'Failed to add payment method'
        showNotification(errorMessage, 'error')
        console.error('Failed to update payment method:', errorMessage)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      showNotification(`Error adding payment method: ${errorMessage}`, 'error')
      console.error('Error updating payment method:', error)
    } finally {
      setAddingCard(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#282828] flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Add New Payment Method
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-[#5F5F5F] text-sm">
              Add a new payment method to your account. Your payment information is secure and encrypted.
            </p>
          </div>

          <form onSubmit={handleAddCard}>
            <div className="mb-6">
              <PaymentElement
                options={{
                  layout: 'tabs',
                  defaultValues: {
                    billingDetails: {
                      name: '',
                      email: '',
                    },
                  },
                }}
              />
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={!stripe || addingCard}
                className="flex-1 bg-[#5046E5] text-white py-3 px-6 rounded-lg hover:bg-[#4338CA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
              >
                {addingCard ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding Card...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Add Payment Method
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function PaymentForm(props: PaymentFormProps) {
  if (!props.setupIntent) return null

  return (
    <Elements 
      stripe={stripePromise} 
      options={{
        clientSecret: props.setupIntent.setupIntent.client_secret,
        appearance: {
          theme: 'stripe' as const,
          variables: {
            colorPrimary: '#5046E5',
            colorBackground: '#ffffff',
            colorText: '#30313d',
            colorDanger: '#df1b41',
            borderRadius: '8px',
            fontFamily: 'Inter, system-ui, sans-serif',
          },
        },
      }}
    >
      <PaymentFormContent {...props} />
    </Elements>
  )
}

