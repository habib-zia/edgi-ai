"use client";

import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import StripeProvider from '@/components/providers/StripeProvider';
import StripeCheckout from './stripe-checkout';
import { apiService } from '@/lib/api-service';
import { useNotificationStore } from './global-notification';
import { PricingPlan } from './pricing-section';


interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PricingPlan;
  onSuccess?: (subscriptionData: any) => void;
}

export default function PaymentModal({ isOpen, onClose, plan, onSuccess }: PaymentModalProps) {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotificationStore();

  const handleCreatePaymentIntent = async () => {
    // Prevent multiple calls if already loading or have client secret
    if (isLoading || clientSecret) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.createPaymentIntentWithGlobalLoading(plan.id);
      
      if (response.success && response.data?.paymentIntent?.client_secret) {
        setClientSecret(response.data.paymentIntent.client_secret);
      } else {
        // Check if user already has an active subscription
        if (response.message?.toLowerCase().includes('active subscription')) {
          showNotification('You already have an active subscription!', 'info');
          onClose();
          return;
        }
        
        // Show API response error message or fallback
        const errorMessage = response.message || 'Failed to initialize payment. Please try again.';
        showNotification(errorMessage, 'error');
        onClose();
      }
    } catch (error: any) {
      
      // Check if error is about active subscription
      const errorMessage = error.message || '';
      if (errorMessage.toLowerCase().includes('active subscription')) {
        showNotification('You already have an active subscription!', 'info');
        onClose();
        return;
      }
      
      showNotification(errorMessage || 'Failed to initialize payment. Please try again.', 'error');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };



  const handleSuccess = (subscriptionData: any) => {
    onSuccess?.(subscriptionData);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Subscribe to {plan.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-300"
          >
            <X className="w-5 h-5 text-gray-900" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#5046E5] mb-4" />
              <p className="text-gray-600">Initializing payment...</p>
            </div>
          ) : clientSecret ? (
            <StripeProvider clientSecret={clientSecret}>
              <StripeCheckout
                planId={plan.id}
                planName={plan.name}
                planPrice={plan.price}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            </StripeProvider>
          ) : (
            <div className="text-center py-12">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Subscribe?</h3>
                <p className="text-gray-600">Click the button below to initialize your payment.</p>
              </div>
              <button
                onClick={handleCreatePaymentIntent}
                className="px-6 py-3 bg-[#5046E5] text-white rounded-lg hover:bg-[#4338CA] transition-colors font-medium"
              >
                Initialize Payment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
