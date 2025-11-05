'use client'

import React, { useState } from 'react'
import { Edit2 } from 'lucide-react'
import { getAccountTypeIcon } from '@/utils/socialMediaIcons'
import { ConnectedAccount } from '@/types/post-types'
import EditCaptionModal from './edit-caption-modal'

interface AccountSelectionProps {
  selectedAccounts: ConnectedAccount[]
  selectedAccountIds: number[]
  isSubmitting: boolean
  onAccountToggle: (accountId: number) => void
  accountCaptions?: Record<number, string>
  onCaptionUpdate?: (accountId: number, caption: string) => void
}

export default function AccountSelection({
  selectedAccounts,
  selectedAccountIds,
  isSubmitting,
  onAccountToggle,
  accountCaptions = {},
  onCaptionUpdate
}: AccountSelectionProps) {
  const [editingAccount, setEditingAccount] = useState<ConnectedAccount | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (selectedAccounts.length === 0) {
    return null
  }

  const handleEditClick = (e: React.MouseEvent, account: ConnectedAccount) => {
    e.stopPropagation()
    if (!isSubmitting) {
      setEditingAccount(account)
      setIsModalOpen(true)
    }
  }

  const handleSaveCaption = (caption: string) => {
    if (editingAccount && onCaptionUpdate) {
      onCaptionUpdate(editingAccount.id, caption)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingAccount(null)
  }

  const getAccountCaption = (account: ConnectedAccount): string => {
    return accountCaptions[account.id] || ''
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select accounts to post to <span className="text-red-500">*</span> ({selectedAccountIds.length} selected)
      </label>
      <div className="space-y-2">
        {selectedAccounts.map((account) => {
          const caption = getAccountCaption(account)
          const isSelected = selectedAccountIds.includes(account.id)
          
          return (
            <div key={account.id}>
              <div 
                className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-colors ${
                  isSubmitting 
                    ? 'cursor-not-allowed opacity-50'
                    : 'cursor-pointer'
                } ${
                  isSelected
                    ? 'border-[#5046E5] bg-blue-50'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
                onClick={() => !isSubmitting && onAccountToggle(account.id)}
              >
                {/* Social Media Icon */}
                {getAccountTypeIcon(account.type)}
                
                {/* Account Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-800">{account.name}</p>
                    {isSelected && onCaptionUpdate && (
                      <button
                        type="button"
                        onClick={(e) => handleEditClick(e, account)}
                        className="flex-shrink-0 p-1 hover:bg-blue-100 rounded transition-colors"
                        title="Edit caption"
                      >
                        <Edit2 className="w-4 h-4 text-[#5046E5]" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{account._type}</p>
                  {isSelected && caption && (
                    <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                      <p className="text-xs text-gray-600 line-clamp-2">{caption}</p>
                    </div>
                  )}
                  {isSelected && !caption && (
                    <p className="text-xs text-gray-400 italic mt-1">No caption set</p>
                  )}
                </div>
                
                {/* Checkbox */}
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                  isSelected
                    ? 'border-[#5046E5] bg-[#5046E5]'
                    : 'border-gray-300'
                }`}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit Caption Modal */}
      {editingAccount && (
        <EditCaptionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveCaption}
          account={editingAccount}
          initialCaption={getAccountCaption(editingAccount)}
        />
      )}
    </div>
  )
}
