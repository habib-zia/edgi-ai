'use client'

import { useState, useEffect } from 'react'
import { X, AlertCircle, CreditCard, AlertTriangle } from 'lucide-react'
import { apiService, SubscriptionData } from '@/lib/api-service'
import { useNotificationStore } from './global-notification'
import LoadingButton from './loading-button'
import { useModalScrollLock } from '@/hooks/useModalScrollLock'

interface SubscriptionManagementModalProps {
    isOpen: boolean
    onClose: () => void
    currentSubscription: SubscriptionData | null
    onSubscriptionUpdated?: () => void
}

export default function SubscriptionManagementModal({
    isOpen,
    onClose,
    currentSubscription,
    onSubscriptionUpdated
}: SubscriptionManagementModalProps) {
    useModalScrollLock(isOpen)
    
    const [error, setError] = useState<string | null>(null)
    const [showCancelConfirm, setShowCancelConfirm] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)
    const { showNotification } = useNotificationStore()

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown)
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, onClose])

    const handleCancelSubscription = async () => {
        try
        {
            setActionLoading(true)
            setError(null)
            const response = await apiService.cancelSubscriptionWithGlobalLoading()

            if (response.success)
            {
                setError(null)
                showNotification('Subscription cancelled successfully!', 'success')
                if (onSubscriptionUpdated && typeof onSubscriptionUpdated === 'function')
                {
                    try
                    {
                        onSubscriptionUpdated()
                    } catch (callbackError)
                    {
                        const errorMessage = callbackError instanceof Error ? callbackError.message : 'Failed to refresh data'
                        showNotification(`Subscription cancelled but ${errorMessage}`, 'warning')
                    }
                }
                onClose()
            } else
            {
                const errorMsg = response.message || 'Failed to cancel subscription'
                setError(errorMsg)
                showNotification(errorMsg, 'error')
            }
        } catch (err)
        {
            const errorMsg = err instanceof Error ? err.message : 'Failed to cancel subscription'
            showNotification(`${errorMsg}`, 'error')
            setError(errorMsg)
        } finally
        {
            setActionLoading(false)
        }
    }

    const getPlanDisplayName = (planId: string) => {
        switch (planId)
        {
            case 'basic':
                return 'Basic Plan'
            case 'growth':
                return 'Growth Plan'
            case 'enterprise':
                return 'Enterprise Plan'
            default:
                return planId.charAt(0).toUpperCase() + planId.slice(1) + ' Plan'
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-[#282828] flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Cancel Subscription
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            <span className="text-red-700">{error}</span>
                        </div>
                    )}

                    {currentSubscription && (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-medium text-blue-800 mb-2">Current Subscription</h4>
                            <p className="text-blue-700">
                                {getPlanDisplayName(currentSubscription.planId)} •
                                Status: <span className="font-medium capitalize">{currentSubscription.status}</span>
                            </p>
                        </div>
                    )}

                    <div>
                        <h4 className="text-lg font-semibold text-[#282828] mb-4">Are you sure you want to cancel your subscription?</h4>

                        {currentSubscription?.cancelAtPeriodEnd ? (
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                    <div>
                                        <h5 className="font-medium text-yellow-800 mb-1">Subscription Already Cancelled</h5>
                                        <p className="text-yellow-700 text-sm">
                                            Your subscription will end on {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}. You&apos;ll continue to have access until then.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : !showCancelConfirm ? (
                            <button
                                onClick={() => setShowCancelConfirm(true)}
                                className="px-6 py-3 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
                            >
                                Cancel Subscription
                            </button>
                        ) : (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-start gap-3 mb-4">
                                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                                    <div>
                                        <h5 className="font-medium text-red-800 mb-1">Are you sure?</h5>
                                        <p className="text-red-700 text-sm">
                                            Cancelling your subscription will end your access at the end of the current billing period.
                                            You can reactivate anytime.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <LoadingButton
                                        onClick={handleCancelSubscription}
                                        loading={actionLoading}
                                        disabled={actionLoading}
                                        loadingText="Cancelling..."
                                        variant="danger"
                                        size="sm"
                                        className="px-4 py-2 rounded-lg"
                                    >
                                        Yes, Cancel Subscription
                                    </LoadingButton>
                                    <button
                                        onClick={() => setShowCancelConfirm(false)}
                                        disabled={actionLoading}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Keep Subscription
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
