'use client'

import { useState, useEffect } from 'react'
import { CreditCard, TrendingUp, Calendar, DollarSign, Activity } from 'lucide-react'
import { PaymentMethod } from '@/lib/api-service'

interface UsageRecord {
  id: string
  cardId: string
  amount: number
  currency: string
  description: string
  date: string
  status: 'completed' | 'pending' | 'failed'
  type: 'subscription' | 'one_time' | 'refund'
}

interface CardUsageHistoryProps {
  card: PaymentMethod
  onClose: () => void
}

export default function CardUsageHistory({ card, onClose }: CardUsageHistoryProps) {
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchUsageHistory = async () => {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockData: UsageRecord[] = [
        {
          id: '1',
          cardId: card.id,
          amount: 29.99,
          currency: 'USD',
          description: 'Monthly Subscription',
          date: '2024-01-15T10:30:00Z',
          status: 'completed',
          type: 'subscription'
        },
        {
          id: '2',
          cardId: card.id,
          amount: 15.00,
          currency: 'USD',
          description: 'Video Generation Credits',
          date: '2024-01-10T14:20:00Z',
          status: 'completed',
          type: 'one_time'
        },
        {
          id: '3',
          cardId: card.id,
          amount: -5.00,
          currency: 'USD',
          description: 'Refund - Unused Credits',
          date: '2024-01-05T09:15:00Z',
          status: 'completed',
          type: 'refund'
        }
      ]
      
      setUsageRecords(mockData)
      setLoading(false)
    }

    fetchUsageHistory()
  }, [card.id])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'subscription':
        return <Calendar className="w-4 h-4" />
      case 'one_time':
        return <DollarSign className="w-4 h-4" />
      case 'refund':
        return <TrendingUp className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    const sign = amount < 0 ? '-' : '+'
    return `${sign}$${Math.abs(amount).toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const totalSpent = usageRecords
    .filter(record => record.status === 'completed')
    .reduce((sum, record) => sum + record.amount, 0)

  const totalTransactions = usageRecords.length
  const successfulTransactions = usageRecords.filter(record => record.status === 'completed').length

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-6 rounded flex items-center justify-center ${
              card.brand.toLowerCase() === 'visa' ? 'bg-blue-600' :
              card.brand.toLowerCase() === 'mastercard' ? 'bg-red-500' :
              card.brand.toLowerCase() === 'amex' ? 'bg-green-600' :
              'bg-gray-600'
            }`}>
              <span className="text-white text-xs font-bold">
                {card.brand === 'American Express' ? 'AMEX' : card.brand}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                •••• {card.last4} Usage History
              </h2>
              <p className="text-sm text-gray-500">
                Expires {card.expMonth.toString().padStart(2, '0')}/{card.expYear}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Total Spent</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                ${totalSpent.toFixed(2)}
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Transactions</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {totalTransactions}
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Success Rate</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {totalTransactions > 0 ? Math.round((successfulTransactions / totalTransactions) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Time Range Filter */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-medium text-gray-700">Time Range:</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>

          {/* Usage Records */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">Loading usage history...</p>
              </div>
            </div>
          ) : usageRecords.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Usage History</h3>
              <p className="text-gray-500">This card hasn&apos;t been used for any transactions yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {usageRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      {getTypeIcon(record.type)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{record.description}</div>
                      <div className="text-sm text-gray-500">{formatDate(record.date)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`font-semibold ${record.amount < 0 ? 'text-green-600' : 'text-gray-900'}`}>
                        {formatAmount(record.amount, record.currency)}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(record.status)}`}>
                        {record.status}
                      </div>
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
