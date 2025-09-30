'use client'

import React from 'react'
import { X, ExternalLink, Trash2 } from 'lucide-react'
import { useSocialAccounts } from '@/hooks/useSocialAccounts'
import { getAccountTypeIcon } from '@/utils/socialMediaIcons'

interface ConnectedAccount {
  id: number
  name: string
  type: string
  _type: string
  active: boolean
  image: string
  post_maxlength: number
  attachment_types: string[]
  max_attachments: number
  post_media_required: boolean
  video_dimensions: {
    min: [number, number | null]
    max: [number | null, number | null]
  }
  video_duration: {
    min: number
    max: number
  }
  user_id: number
  account_id: string
  public_id: string
  extra_data: any
}

interface VideoData {
  id: string
  title: string
  status: string
  url?: string
  thumbnail?: string
  createdAt: string
  updatedAt: string
}

interface ConnectAccountsModalProps {
  isOpen: boolean
  onClose: () => void
  onNext: () => void
  video?: VideoData
  onCreatePost?: (accounts: ConnectedAccount[], video: VideoData) => void
}

export default function ConnectAccountsModal({ isOpen, onClose, onNext, video, onCreatePost }: ConnectAccountsModalProps) {
  const {
    connectedAccounts,
    availablePlatforms,
    loading,
    error,
    disconnecting,
    fetchConnectedAccounts,
    disconnectAccount,
    connectPlatform,
    isPlatformConnected,
    getConnectedAccount
  } = useSocialAccounts()



  const handleDisconnectAccount = async (accountId: number, accountName: string) => {
    if (window.confirm(`Are you sure you want to disconnect ${accountName}?`)) {
      await disconnectAccount(accountId)
    }
  }

  const handleNext = () => {
    // Get connected accounts
    const selectedAccounts = connectedAccounts.filter(account => account.active)
    
    if (selectedAccounts.length === 0) {
      alert('Please connect at least one account before proceeding')
      return
    }

    if (video && onCreatePost) {
      onCreatePost(selectedAccounts, video)
    } else {
      onNext()
    }
  }


  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[600px] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-black">Connect accounts</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        {/* Social Media Accounts */}
        <div className="p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5046E5]"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={fetchConnectedAccounts}
                className="bg-[#5046E5] text-white px-4 py-2 rounded-lg hover:bg-[#4338CA] transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            availablePlatforms.map((platform) => {
              const isConnected = isPlatformConnected(platform.type)
              const connectedAccount = getConnectedAccount(platform.type)
              
              return (
                <div key={platform.id} className="flex items-center gap-4">
                  {/* Social Media Icon */}
                  {getAccountTypeIcon(platform.type)}
                  
                  {/* Account Info */}
                  <div className="flex-1">
                    {isConnected && connectedAccount ? (
                      // Show connected account info
                      <div className="px-3 py-2">
                        <p className="text-gray-800 font-medium">{connectedAccount.name}</p>
                        {/* <p className="text-sm text-gray-500">{connectedAccount._type}</p> */}
                      </div>
                    ) : (
                      // Show platform name for unconnected
                      <div className="px-3 py-2">
                        <p className="text-gray-800 font-medium">{platform.name}</p>
                        {/* <p className="text-sm text-gray-500">{platform._type}</p> */}
                      </div>
                    )}
                  </div>
                  
                  {/* Connect/Status Buttons */}
                  <div className="flex gap-2">
                    {isConnected ? (
                      <>
                        <button
                          onClick={() => connectedAccount && handleDisconnectAccount(connectedAccount.id, connectedAccount.name)}
                          disabled={disconnecting === connectedAccount?.id}
                          className="px-3 py-2 rounded-lg font-medium text-sm bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
                        >
                          {disconnecting === connectedAccount?.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700"></div>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4" />
                              Disconnect
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      /* Connect Button */
                      <button
                        onClick={() => connectPlatform(platform.id)}
                        className="px-4 py-2 rounded-lg font-medium text-sm bg-[#5046E5] text-white hover:bg-[#4338CA] cursor-pointer transition-colors duration-200 flex items-center gap-2"
                      >
                        Connect
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={handleNext}
            className="w-full bg-[#5046E5] text-white py-3 px-6 font-semibold rounded-full text-lg hover:bg-[#4338CA] transition-colors duration-300"
          >
            Next
          </button>
        </div>
      </div>

    </div>
  )
}
