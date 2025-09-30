import React, { useState, useEffect, useCallback } from 'react';
import { PaymentElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiService, PaymentMethod } from '@/lib/api-service';
import { useNotificationStore } from '@/components/ui/global-notification';
import { useSubscription } from '@/hooks/useSubscription';
import CardPreview from '@/components/ui/card-preview';
import BulkCardOperations from '@/components/ui/bulk-card-operations';
import CardUsageHistory from '@/components/ui/card-usage-history';
import { X, Eye, History, Star } from 'lucide-react';

// Use the PaymentMethod type from api-service instead of local Card interface
type Card = PaymentMethod;

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51S0FwKB2p93NE0UDmno6UgFck98LzeVeFkxWZnJiXDMYKnSpy8WMFrS9fcjSC3G1tovRnMAfUCz24C6DMCxCSdZr00T0OcEjk5');

interface PaymentMethodsProps {
  authToken?: string; // Keep for backward compatibility but not used
}

// Confirmation Modal Component
const ConfirmationModal: React.FC<{
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  type: 'danger' | 'warning' | 'info';
  loading?: boolean;
}> = ({ isOpen, onConfirm, onCancel, title, message, confirmText, cancelText, type, loading = false }) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'bg-red-100 text-red-600',
          button: 'bg-red-600 hover:bg-red-700 text-white',
          iconSvg: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )
        };
      case 'warning':
        return {
          icon: 'bg-yellow-100 text-yellow-600',
          button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          iconSvg: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )
        };
      default:
        return {
          icon: 'bg-blue-100 text-blue-600',
          button: 'bg-blue-600 hover:bg-blue-700 text-white',
          iconSvg: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${styles.icon}`}>
              {styles.iconSvg}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#282828] mb-2">{title}</h3>
              <p className="text-[#5F5F5F] text-sm mb-6">{message}</p>
              <div className="flex gap-3">
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${styles.button}`}
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {confirmText}
                </button>
                <button
                  onClick={onCancel}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {cancelText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Payment Form Component that uses Stripe Elements
const PaymentForm: React.FC<{
  setupIntent: any;
  onSuccess: () => void;
  onCancel: () => void;
  cards: Card[];
}> = ({ setupIntent, onSuccess, onCancel, cards }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [addingCard, setAddingCard] = useState(false);
  const { showNotification } = useNotificationStore();

  const handleAddCard = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements || !setupIntent) return;

    setAddingCard(true);

    try {
      // Confirm the setup intent using PaymentElement
      const { error, setupIntent: confirmedSetupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('Error confirming setup intent:', error);
        showNotification(`Payment failed: ${error.message}`, 'error');
        setAddingCard(false);
        return;
      }

      // Send confirmation to backend
      const response = await apiService.updatePaymentMethod({
        setupIntentId: confirmedSetupIntent?.id || '',
        setAsDefault: cards.length === 0,
      });

      if (response.success) {
        showNotification('Payment method added successfully!', 'success');
        onSuccess();
      } else {
        const errorMessage = response.message || 'Failed to add payment method';
        showNotification(errorMessage, 'error');
        console.error('Failed to update payment method:', errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      showNotification(`Error adding payment method: ${errorMessage}`, 'error');
      console.error('Error updating payment method:', error);
    } finally {
      setAddingCard(false);
    }
  };

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

            {/* Card Validation Component - Note: This would need to be connected to actual form inputs */}
            {/* <div className="mb-6">
              <CardValidation
                cardNumber={cardValidation.cardNumber}
                expiryMonth={cardValidation.expiryMonth}
                expiryYear={cardValidation.expiryYear}
                onValidationChange={handleCardValidationChange}
              />
            </div> */}

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
  );
};

export const PaymentMethods: React.FC<PaymentMethodsProps> = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCard, setShowAddCard] = useState(false);
  const [setupIntent, setSetupIntent] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  const [deletingCard, setDeletingCard] = useState(false);
  const [settingDefault, setSettingDefault] = useState<string | null>(null);
  const [creatingIntent, setCreatingIntent] = useState(false);
  const { showNotification } = useNotificationStore();
  
  // Enhanced features state
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [showCardPreview, setShowCardPreview] = useState<string | null>(null);
  const [showUsageHistory, setShowUsageHistory] = useState<string | null>(null);
  
  // Subscription checking
  const { subscription, loading: subscriptionLoading, fetchSubscription } = useSubscription();

  // Fetch saved payment methods
  const fetchPaymentMethods = useCallback(async () => {
    try {
      const response = await apiService.getPaymentMethods();
      
      if (response.success && response.data) {
        setCards(response.data.paymentMethods);
      } else {
        const errorMessage = response.message || 'Failed to fetch payment methods';
        showNotification(errorMessage, 'error');
        console.error('Failed to fetch payment methods:', errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      showNotification(`Error loading payment methods: ${errorMessage}`, 'error');
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Create setup intent for new card
  const createSetupIntent = async () => {
    setCreatingIntent(true);
    try {
      const response = await apiService.createSetupIntent();
      
      if (response.success && response.data) {
        setSetupIntent(response.data);
        setShowAddCard(true);
        showNotification('Payment form initialized successfully', 'success');
      } else {
        const errorMessage = response.message || 'Failed to initialize payment form';
        showNotification(errorMessage, 'error');
        console.error('Failed to create setup intent:', errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      showNotification(`Error initializing payment form: ${errorMessage}`, 'error');
      console.error('Error creating setup intent:', error);
    } finally {
      setCreatingIntent(false);
    }
  };

  // Handle successful card addition
  const handleCardAdded = () => {
        setShowAddCard(false);
        setSetupIntent(null);
        fetchPaymentMethods(); // Refresh the list
  };

  // Handle cancel card addition
  const handleCancelAddCard = () => {
    setShowAddCard(false);
    setSetupIntent(null);
  };

  // Set card as default
  const setAsDefault = async (cardId: string) => {
    setSettingDefault(cardId);
    try {
      const response = await apiService.setDefaultPaymentMethod(cardId);
      
      if (response.success) {
        showNotification('Default payment method updated successfully!', 'success');
        fetchPaymentMethods(); // Refresh the list
      } else {
        const errorMessage = response.message || 'Failed to set default payment method';
        showNotification(errorMessage, 'error');
        console.error('Failed to set default card:', errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      showNotification(`Error updating default payment method: ${errorMessage}`, 'error');
      console.error('Error setting default card:', error);
    } finally {
      setSettingDefault(null);
    }
  };

  // Show delete confirmation modal
  const showDeleteConfirmation = (cardId: string) => {
    // Check if this is the last payment method
    if (cards.length === 1) {
      showNotification('You cannot delete your last payment method. Please add another payment method first.', 'warning');
      return;
    }

    setCardToDelete(cardId);
    setShowDeleteConfirm(true);
  };

  // Confirm and delete card
  const confirmDeleteCard = async () => {
    if (!cardToDelete) return;

    setDeletingCard(true);
    try {
      const response = await apiService.deletePaymentMethod(cardToDelete);
      
      if (response.success) {
        showNotification('Payment method removed successfully!', 'success');
        fetchPaymentMethods(); // Refresh the list
        setShowDeleteConfirm(false);
        setCardToDelete(null);
      } else {
        const errorMessage = response.message || 'Failed to remove payment method';
        showNotification(errorMessage, 'error');
        console.error('Failed to remove card:', errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      showNotification(`Error removing payment method: ${errorMessage}`, 'error');
      console.error('Error removing card:', error);
    } finally {
      setDeletingCard(false);
    }
  };

  // Cancel delete confirmation
  const cancelDeleteCard = () => {
    setShowDeleteConfirm(false);
    setCardToDelete(null);
  };

  // Enhanced features handlers
  const handleCardSelection = (cardId: string) => {
    setSelectedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const handleBulkDelete = async (cardIds: string[]) => {
    try {
      for (const cardId of cardIds) {
        await apiService.deletePaymentMethod(cardId);
      }
      showNotification(`${cardIds.length} payment method(s) removed successfully!`, 'success');
      fetchPaymentMethods();
    } catch {
      showNotification('Failed to remove payment methods', 'error');
    }
  };

  const handleBulkSetDefault = async (cardId: string) => {
    await setAsDefault(cardId);
  };

  const handleBulkExport = (cardIds: string[]) => {
    const selectedCardsData = cards.filter(card => cardIds.includes(card.id));
    const exportData = selectedCardsData.map(card => ({
      brand: card.brand,
      last4: card.last4,
      expMonth: card.expMonth,
      expYear: card.expYear,
      isDefault: card.isDefault,
      isExpired: card.isExpired
    }));
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-methods-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Payment methods exported successfully!', 'success');
  };

  // Card validation handler (for future use)
  // const handleCardValidationChange = (isValid: boolean, cardType: string) => {
  //   setCardValidation(prev => ({
  //     ...prev,
  //     isValid,
  //     cardType
  //   }));
  // };

  // Check if user has active subscription
  const hasActiveSubscription = subscription && subscription.status === 'active';

  useEffect(() => {
    // First fetch subscription, then payment methods if user has subscription
    const initializeData = async () => {
      try {
        await fetchSubscription();
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
      }
    };

    initializeData();
  }, [fetchSubscription]);

  useEffect(() => {
    // Only fetch payment methods if user has active subscription
    if (hasActiveSubscription) {
      fetchPaymentMethods();
    } else {
      setLoading(false);
    }
  }, [hasActiveSubscription, fetchPaymentMethods]);

  // Show loading state while checking subscription
  if (subscriptionLoading || loading) {
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
    );
  }

  // Don't show payment methods if user doesn't have active subscription
  if (!hasActiveSubscription) {
    return null;
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
        onClearSelection={() => setSelectedCards([])}
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
                {/* Usage History Button */}
                <button
                  onClick={() => setShowUsageHistory(card.id)}
                  className="flex-1 sm:flex-none text-gray-600 hover:text-gray-800 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 min-w-0"
                  title="View usage history"
                >
                  <History className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">History</span>
                </button>

                {/* Card Preview Button */}
                <button
                  onClick={() => setShowCardPreview(card.id)}
                  className="flex-1 sm:flex-none text-gray-600 hover:text-gray-800 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 min-w-0"
                  title="Preview card"
                >
                  <Eye className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Preview</span>
                </button>

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
                    <span className="hidden sm:inline">Set Default</span>
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
                  <span className="hidden sm:inline">Remove</span>
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
        <Elements 
          stripe={stripePromise} 
                  options={{
            clientSecret: setupIntent.setupIntent.client_secret,
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
          <PaymentForm
            setupIntent={setupIntent}
            onSuccess={handleCardAdded}
            onCancel={handleCancelAddCard}
            cards={cards}
          />
        </Elements>
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
                const card = cards.find(c => c.id === showCardPreview);
                if (!card) return null;
                
                return (
                  <CardPreview
                    cardNumber={`•••• •••• •••• ${card.last4}`}
                    expiryMonth={card.expMonth.toString().padStart(2, '0')}
                    expiryYear={card.expYear.toString()}
                    cardType={card.brand}
                  />
                );
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
  );
};