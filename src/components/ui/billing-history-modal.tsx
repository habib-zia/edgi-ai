'use client'

import { useState, useEffect } from 'react'
import { X, Receipt, AlertCircle } from 'lucide-react'
import { apiService, BillingTransaction } from '@/lib/api-service'
import { useModalScrollLock } from '@/hooks/useModalScrollLock'

interface BillingHistoryModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function BillingHistoryModal({ isOpen, onClose }: BillingHistoryModalProps) {
    // Use the custom scroll lock hook
    useModalScrollLock(isOpen)
    
    const [billingHistory, setBillingHistory] = useState<BillingTransaction[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen)
        {
            fetchBillingHistory()
        }
    }, [isOpen])

    // Handle ESC key to close modal
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

    const fetchBillingHistory = async () => {
        try
        {
            setLoading(true)
            setError(null)
            const response = await apiService.getBillingHistory()

            if (response.success && response.data)
            {
                setBillingHistory(response.data.transactions)
            } else
            {
                setError(response.message || 'Failed to fetch billing history')
            }
        } catch (err)
        {
            console.error('Error fetching billing history:', err)
            setError('Failed to load billing history')
        } finally
        {
            setLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        if (!dateString || typeof dateString !== 'string') {
            return 'Unknown Date'
        }
        
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        } catch (error) {
            console.warn('Date formatting error:', error);
            return 'Invalid Date'
        }
    }

    const getPlanDisplayName = (planId: string) => {
        if (!planId || typeof planId !== 'string') {
            return 'Unknown Plan'
        }
        
        switch (planId.toLowerCase())
        {
            case 'monthly':
                return 'Monthly Plan'
            case 'basic':
                return 'Basic Plan'
            case 'growth':
                return 'Growth Plan'
            case 'professional':
                return 'Professional Plan'
            case 'enterprise':
                return 'Enterprise Plan'
            default:
                return planId.charAt(0).toUpperCase() + planId.slice(1) + ' Plan'
        }
    }

    const getTransactionStatusColor = (status: string) => {
        if (!status || typeof status !== 'string') {
            return 'text-gray-600 bg-gray-100'
        }
        
        switch (status.toLowerCase())
        {
            case 'succeeded':
            case 'paid':
                return 'text-green-600 bg-green-100'
            case 'pending':
            case 'processing':
                return 'text-yellow-600 bg-yellow-100'
            case 'failed':
            case 'cancelled':
                return 'text-red-600 bg-red-100'
            default:
                return 'text-gray-600 bg-gray-100'
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-[#282828] flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        Billing History
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5046E5]"></div>
                            <span className="ml-3 text-[#5F5F5F]">Loading billing history...</span>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center py-12">
                            <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
                            <span className="text-red-600">{error}</span>
                        </div>
                    ) : billingHistory.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                            <AlertCircle className="h-8 w-8 text-[#5F5F5F] mr-3" />
                            <span className="text-[#5F5F5F]">No billing history found</span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {billingHistory.map((transaction) => (
                                <div key={transaction.id} className="bg-[#EEEEEE] rounded-[8px] p-4">
                                    <div className="flex md:flex-row flex-col gap-y-4 items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-[#5046E5] rounded-full p-2">
                                                <Receipt className="h-4 w-4 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-[#282828]">{transaction.description || 'No Description'}</h4>
                                                <p className="text-sm text-[#5F5F5F]">
                                                    {getPlanDisplayName(transaction.planId)} • {formatDate(transaction.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-[#282828]">{transaction.formattedAmount || 'N/A'}</p>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTransactionStatusColor(transaction.status)}`}>
                                                {transaction.status ? transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1) : 'Unknown'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
