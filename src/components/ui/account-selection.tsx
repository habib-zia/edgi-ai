'use client'

import React from 'react'
import { getAccountTypeIcon } from '@/utils/socialMediaIcons'
import { ConnectedAccount } from '@/types/post-types'

interface AccountSelectionProps {
  selectedAccounts: ConnectedAccount[]
  selectedAccountIds: number[]
  isSubmitting: boolean
  onAccountToggle: (accountId: number) => void
}

export default function AccountSelection({
  selectedAccounts,
  selectedAccountIds,
  isSubmitting,
  onAccountToggle
}: AccountSelectionProps) {
  if (selectedAccounts.length === 0) {
    return null
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select accounts to post to <span className="text-red-500">*</span> ({selectedAccountIds.length} selected)
      </label>
      <div className="space-y-2">
        {selectedAccounts.map((account) => (
          <div 
            key={account.id} 
            className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
              isSubmitting 
                ? 'cursor-not-allowed opacity-50'
                : 'cursor-pointer'
            } ${
              selectedAccountIds.includes(account.id)
                ? 'border-[#5046E5] bg-blue-50'
                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
            }`}
            onClick={() => !isSubmitting && onAccountToggle(account.id)}
          >
            {/* Social Media Icon */}
            {getAccountTypeIcon(account.type)}
            
            {/* Account Info */}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{account.name}</p>
              <p className="text-xs text-gray-500">{account._type}</p>
            </div>
            
            {/* Checkbox */}
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
              selectedAccountIds.includes(account.id)
                ? 'border-[#5046E5] bg-[#5046E5]'
                : 'border-gray-300'
            }`}>
              {selectedAccountIds.includes(account.id) && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
