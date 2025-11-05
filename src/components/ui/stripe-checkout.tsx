"use client";

import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Loader2, CreditCard, Shield, Lock } from 'lucide-react';
import { useNotificationStore } from './global-notification';
import { apiService } from '@/lib/api-service';

interface StripeCheckoutProps {
  planId: string;
  planName: string;
  planPrice: string;
  onSuccess?: (subscriptionData: any) => void;
  onCancel?: () => void;
}

export default function StripeCheckout({
  planName,
  planPrice,
  onSuccess,
  onCancel
}: StripeCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { showNotification } = useNotificationStore();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements)
    {
      return;
    }

    setIsProcessing(true);

    try
    {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/account?payment=success`,
        },
        redirect: 'if_required',
      });

      if (error)
      {
        showNotification(error.message || 'Payment failed. Please try again.', 'error');
        setIsProcessing(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded')
      {
        const paymentIntentId = paymentIntent.id;
        
        if (paymentIntentId && typeof paymentIntentId === 'string')
        {
          try
          {
            const syncResponse = await apiService.syncSubscriptionFromStripe(paymentIntentId);
            if (!syncResponse.success)
            {
              console.warn('Failed to sync subscription to backend:', syncResponse.message);
            }
          } catch (syncError)
          {
            console.error('Error syncing subscription to backend:', syncError);
          }
        } else
        {
          console.warn('No payment intent ID found');
        }
        showNotification('Payment successful! Your subscription is now active.', 'success');

        setTimeout(() => {
          window.location.href = '/create-video';
        }, 2000);

        onSuccess?.(paymentIntent);
      }
    } catch (error: any)
    {
      const errorMessage = error.message || 'Payment failed. Please try again.';
      showNotification(errorMessage, 'error');
    } finally
    {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Plan Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Summary</h3>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">{planName}</span>
          <span className="text-lg font-bold text-[#5046E5]">${Math.floor(Number(planPrice) / 100).toString()}</span>
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
          <Shield className="w-4 h-4" />
          <span>Secured by Stripe</span>
          <Lock className="w-4 h-4" />
        </div>

        {/* Payment Element */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Payment Details</span>
          </div>
          <PaymentElement
            options={{
              layout: 'tabs',
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={!stripe || isProcessing}
            className="flex-1 bg-[#5046E5] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#4338CA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay $${Math.floor(Number(planPrice) / 100).toString()}`
            )}
          </button>
        </div>

        {/* Terms */}
        <p className="text-xs text-gray-500 text-center">
          By confirming your payment, you agree to our Terms of Service and Privacy Policy.
          Your subscription will automatically renew until cancelled.
        </p>
      </form>
    </div>
  );
}
