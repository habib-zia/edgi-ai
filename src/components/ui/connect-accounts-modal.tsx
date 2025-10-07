'use client'

import React, { useState } from 'react'
import { X, ExternalLink, Trash2 } from 'lucide-react'
import { useSocialAccounts } from '@/hooks/useSocialAccounts'
import { getAccountTypeIcon } from '@/utils/socialMediaIcons'
import { ConnectedAccount, VideoData } from '@/types/post-types'
import { API_CONFIG, getApiUrl, getAuthenticatedHeaders } from '@/lib/config'

interface ConnectAccountsModalProps {
  isOpen: boolean
  onClose: () => void
  onNext: () => void
  buttonText?: string
  video?: VideoData
  scheduleData?: any
  onCreatePost?: (accounts: ConnectedAccount[], video: VideoData) => void
}

export default function ConnectAccountsModal({ isOpen, onClose, onNext, video, scheduleData, onCreatePost, buttonText='Next' }: ConnectAccountsModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiResponse, setApiResponse] = useState<any>(null)
  
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

  const handleNext = async () => {
    // Get connected accounts
    const selectedAccounts = connectedAccounts.filter(account => account.active)
    
    if (selectedAccounts.length === 0) {
      alert('Please connect at least one account before proceeding')
      return
    }

    // If we have schedule data, call the schedule API
    if (scheduleData && scheduleData.posts && scheduleData.posts.length > 0) {
      setIsSubmitting(true)
      setApiResponse(null)
      
      try {
        // Transform schedule data to match API format
        const times = scheduleData.posts.map((post: any) => post.time)
        const days = scheduleData.posts.map((post: any) => post.day)
        const startDate = new Date().toISOString()
        
        // Map frequency to API format
        const getFrequencyMapping = (frequency: string) => {
          switch (frequency?.toLowerCase()) {
            case 'once a week':
              return 'once_week'
            case 'twice a week':
              return 'twice_week'
            case 'three times a week':
              return 'three_week'
            case 'daily':
              return 'daily'
            case 'custom':
              return 'custom'
            default:
              return 'daily'
          }
        }
        
        const requestBody = {
          frequency: getFrequencyMapping(scheduleData.frequency),
          schedule: {
            days: days,
            times: times
          },
          startDate: startDate
        }
        
        console.log('Sending schedule request:', requestBody)
        
        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.VIDEO_SCHEDULE.SCHEDULE), {
          method: 'POST',
          headers: getAuthenticatedHeaders(),
          body: JSON.stringify(requestBody)
        })
        
        const responseData = await response.json()
        setApiResponse(responseData)
        
        if (response.ok && responseData.success) {
          console.log('Schedule created successfully:', responseData)
          
          if ((window as any).showNotification) {
            (window as any).showNotification({
              type: 'success',
              title: 'Schedule Created Successfully',
              message: 'Your video schedule has been created successfully!',
              duration: 5000
            })
          }
          
          // Close modal after successful schedule creation
          onClose()
        } else {
          console.error('Schedule API Error:', responseData)
          const errorMessage = responseData.error || responseData.message || 'Failed to create schedule'
          
          if ((window as any).showNotification) {
            (window as any).showNotification({
              type: 'error',
              title: 'Schedule Failed',
              message: errorMessage,
              duration: 8000
            })
          }
        }
      } catch (error) {
        console.error('Error creating schedule:', error)
        const errorMessage = 'Failed to create schedule. Please try again.'
        
        setApiResponse({
          success: false,
          error: errorMessage,
          message: errorMessage
        })
        
        if ((window as any).showNotification) {
          (window as any).showNotification({
            type: 'error',
            title: 'Network Error',
            message: errorMessage,
            duration: 8000
          })
        }
      } finally {
        setIsSubmitting(false)
      }
    } else if (video && onCreatePost) {
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
            disabled={isSubmitting}
            className="w-full bg-[#5046E5] text-white py-3 px-6 font-semibold rounded-full text-lg hover:bg-[#4338CA] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Schedule...
              </>
            ) : (
              buttonText
            )}
          </button>
          
          {/* API Response Display */}
          {apiResponse && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${
              apiResponse.success 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              <div className="font-medium">
                {apiResponse.success ? 'Success!' : 'Error'}
              </div>
              <div className="text-xs mt-1">
                {apiResponse.message || apiResponse.error || 'Unknown response'}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
