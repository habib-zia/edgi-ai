'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, Calendar, CreditCard, Video, Users, Receipt } from 'lucide-react'
import { apiService, SubscriptionData } from '@/lib/api-service'
import BillingHistoryModal from './billing-history-modal'
import SubscriptionManagementModal from './subscription-management-modal'

interface SubscriptionDetailsSectionProps {
    className?: string
}

export default function SubscriptionDetailsSection({ className = '' }: SubscriptionDetailsSectionProps) {
    const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showBillingModal, setShowBillingModal] = useState(false)
    const [showManagementModal, setShowManagementModal] = useState(false)

    useEffect(() => {
        const fetchSubscription = async () => {
            try
            {
                setLoading(true)
                setError(null)
                const response = await apiService.getCurrentSubscription()

                if (response.success && response.data)
                {
                    setSubscription(response.data.subscription)
                } else
                {
                    setError(response.message || 'Failed to fetch subscription details')
                }
            } catch (err)
            {
                const errorMessage = err instanceof Error ? err.message : 'Failed to load subscription details'
                setError(errorMessage)
            } finally
            {
                setLoading(false)
            }
        }

        fetchSubscription()
    }, [])

    const handleViewBillingHistory = () => {
        setShowBillingModal(true)
    }

    const handleCloseBillingModal = () => {
        setShowBillingModal(false)
    }

    const handleManageSubscription = () => {
        setShowManagementModal(true)
    }

    const handleCloseManagementModal = () => {
        setShowManagementModal(false)
    }

    const handleSubscriptionUpdated = () => {
        // Refresh subscription data when it's updated
        const fetchSubscription = async () => {
            try
            {
                setLoading(true)
                setError(null)
                const response = await apiService.getCurrentSubscription()

                if (response.success && response.data && response.data.subscription)
                {
                    // Ensure subscription data is valid before setting
                    const subscriptionData = response.data.subscription
                    if (subscriptionData && typeof subscriptionData === 'object')
                    {
                        setSubscription(subscriptionData)
                    } else
                    {
                        setError('Invalid subscription data received')
                    }
                } else
                {
                    setError(response.message || 'Failed to fetch subscription details')
                }
            } catch (err)
            {
                const errorMessage = err instanceof Error ? err.message : 'Failed to load subscription details'
                setError(errorMessage)
            } finally
            {
                setLoading(false)
            }
        }
        fetchSubscription()
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getStatusColor = (status: string) => {
        switch (status)
        {
            case 'active':
                return 'text-green-600 bg-green-100'
            case 'pending':
                return 'text-blue-600 bg-blue-100'
            case 'past_due':
                return 'text-yellow-600 bg-yellow-100'
            case 'cancelled':
                return 'text-red-600 bg-red-100'
            default:
                return 'text-gray-600 bg-gray-100'
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


    if (loading)
    {
        return (
            <div className={`${className}`}>
                <h2 className="text-[32px] font-semibold text-[#282828] text-center mb-8">Subscription Details</h2>
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5046E5]"></div>
                    <span className="ml-3 text-[#5F5F5F]">Loading subscription details...</span>
                </div>
            </div>
        )
    }

    if (error)
    {
        return (
            <div className={`${className}`}>
                <h2 className="text-[32px] font-semibold text-[#282828] text-center mb-8">Subscription Details</h2>
                <div className="flex items-center justify-center py-8">
                    <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
                    <span className="text-red-600">{error}</span>
                </div>
            </div>
        )
    }

    if (!subscription)
    {
        return (
            <div className={`${className}`}>
                <h2 className="text-[32px] font-semibold text-[#282828] text-center mb-8">Subscription Details</h2>
                <div className="flex items-center justify-center py-8">
                    <AlertCircle className="h-8 w-8 text-[#5F5F5F] mr-3" />
                    <span className="text-[#5F5F5F]">No subscription found</span>
                </div>
            </div>
        )
    }

    return (
        <div className={`${className}`}>
            {/* Header */}
            <div className="flex md:flex-row flex-col gap-y-4 items-center justify-between mb-8">
                <h2 className="text-[32px] font-semibold text-[#282828] text-center flex-1">Subscription Details</h2>
                <span className={`px-3 py-1 rounded-full text-sm ml-auto font-medium ${getStatusColor(subscription.status)}`}>
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </span>
            </div>

            {/* Plan Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-[#EEEEEE] rounded-[8px] p-4">
                    <div className="flex items-center mb-3">
                        <CreditCard className="h-5 w-5 text-[#5046E5] mr-2" />
                        <h4 className="font-medium text-[#282828]">Current Plan</h4>
                    </div>
                    <p className="text-2xl font-bold text-[#282828]">{getPlanDisplayName(subscription.planId)}</p>
                    <p className="text-sm text-[#5F5F5F] mt-1">Plan ID: {subscription.planId}</p>
                </div>

                <div className="bg-[#EEEEEE] rounded-[8px] p-4">
                    <div className="flex items-center mb-3">
                        <Video className="h-5 w-5 text-[#5046E5] mr-2" />
                        <h4 className="font-medium text-[#282828]">Video Usage</h4>
                    </div>
                    <p className="text-2xl font-bold text-[#282828]">
                        {subscription.videoCount} / {subscription.videoLimit}
                    </p>
                    <p className="text-sm text-[#5F5F5F] mt-1">Videos generated this period</p>
                </div>
            </div>

            {/* Billing Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-[#EEEEEE] rounded-[8px] p-4">
                    <div className="flex items-center mb-3">
                        <Calendar className="h-5 w-5 text-[#5046E5] mr-2" />
                        <h4 className="font-medium text-[#282828]">Current Period</h4>
                    </div>
                    <p className="text-sm text-[#5F5F5F]">
                        <span className="font-medium">Started:</span> {formatDate(subscription.currentPeriodStart)}
                    </p>
                    <p className="text-sm text-[#5F5F5F] mt-1">
                        <span className="font-medium">Ends:</span> {formatDate(subscription.currentPeriodEnd)}
                    </p>
                </div>

                <div className="bg-[#EEEEEE] rounded-[8px] p-4">
                    <div className="flex items-center mb-3">
                        <Users className="h-5 w-5 text-[#5046E5] mr-2" />
                        <h4 className="font-medium text-[#282828]">Account Status</h4>
                    </div>
                    <p className="text-sm text-[#5F5F5F]">
                        <span className="font-medium">Member since:</span> {formatDate(subscription.createdAt)}
                    </p>
                    <p className="text-sm text-[#5F5F5F] mt-1">
                        <span className="font-medium">Last updated:</span> {formatDate(subscription.updatedAt)}
                    </p>
                </div>
            </div>

            {/* Cancellation Status */}
            {subscription.cancelAtPeriodEnd && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                        <div>
                            <h4 className="font-medium text-yellow-800">Subscription Cancelled</h4>
                            <p className="text-sm text-yellow-700 mt-1">
                                Your subscription will end on {formatDate(subscription.currentPeriodEnd)}.
                                You&apos;ll continue to have access until then.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
                {!subscription.cancelAtPeriodEnd && (
                <button
                    onClick={handleManageSubscription}
                    className="flex-1 bg-[#5046E5] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#4338CA] transition-colors"
                >
                    Manage Subscription
                </button>
                )}
                {subscription.status === 'active' && (
                    <button
                        onClick={handleViewBillingHistory}
                        className="flex-1 bg-[#EEEEEE] text-[#282828] px-8 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                        <Receipt className="h-4 w-4" />
                        View Billing History
                    </button>
                )}
            </div>

            {/* Billing History Modal */}
            <BillingHistoryModal
                isOpen={showBillingModal}
                onClose={handleCloseBillingModal}
            />

            {/* Subscription Management Modal */}
            <SubscriptionManagementModal
                isOpen={showManagementModal}
                onClose={handleCloseManagementModal}
                currentSubscription={subscription}
                onSubscriptionUpdated={handleSubscriptionUpdated}
            />
        </div>
    )
}
