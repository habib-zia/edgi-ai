import { useState, useEffect, useCallback, useRef } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { API_CONFIG, getApiUrl, getAuthenticatedHeaders } from '@/lib/config'

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

interface SocialBuResponse {
  success: boolean
  message: string
  data: {
    connected_accounts: ConnectedAccount[]
    user_account_ids: number[]
    total_connected: number
    socialbu_status: string
  }
}

interface SocialPlatform {
  id: string
  name: string
  type: string
  _type: string
  icon: string
}

export const useSocialAccounts = () => {
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState<number | null>(null)
  const refetchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Get access token from Redux store
  const accessToken = useSelector((state: RootState) => state.user.accessToken)
  const userId = useSelector((state: RootState) => state.user.user?.id)

  // Available social media platforms
  const availablePlatforms: SocialPlatform[] = [
    {
      id: 'instagram',
      name: 'Instagram',
      type: 'instagram.api',
      _type: 'Instagram Business',
      icon: 'instagram'
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      type: 'twitter.profile',
      _type: 'X (Twitter) Account',
      icon: 'twitter'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      type: 'google.youtube',
      _type: 'YouTube Channel',
      icon: 'youtube'
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      type: 'tiktok.profile',
      _type: 'TikTok Account',
      icon: 'tiktok'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      type: 'facebook.page',
      _type: 'Facebook Page',
      icon: 'facebook'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      type: 'linkedin.profile',
      _type: 'LinkedIn Profile',
      icon: 'linkedin'
    }
  ]

// Fetch connected accounts
const fetchConnectedAccounts = useCallback(async () => {
  if (!accessToken) {
    setError('Authentication required')
    setLoading(false)
    return
  }

  try {
    setLoading(true)
    setError(null)

    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SOCIALBU.ACCOUNTS_PUBLIC), {
      method: 'GET',
      headers: getAuthenticatedHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to fetch connected accounts')
    }

    const data: SocialBuResponse = await response.json()

    if (data.success) {
      setConnectedAccounts(data.data.connected_accounts)
    } else {
      throw new Error(data.message || 'Failed to fetch accounts')
    }
  } catch (err: any) {
    console.error('Error fetching connected accounts:', err)
    setError(err.message || 'Failed to fetch connected accounts')
  } finally {
    setLoading(false)
  }
}, [accessToken])

// Disconnect/Delete an account
const disconnectAccount = useCallback(async (accountId: number) => {
  if (!accessToken) {
    setError('Authentication required')
    return
  }

  try {
    setDisconnecting(accountId)
    setError(null)

    const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.SOCIALBU.ACCOUNT_DELETE}/${accountId}`), {
      method: 'DELETE',
      headers: getAuthenticatedHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to disconnect account')
    }

    const data = await response.json()

    if (data.success) {
      // Refetch connected accounts to get fresh data from server
      await fetchConnectedAccounts()
    } else {
      throw new Error(data.message || 'Failed to disconnect account')
    }
  } catch (err: any) {
    console.error('Error disconnecting account:', err)
    setError(err.message || 'Failed to disconnect account')
  } finally {
    setDisconnecting(null)
  }
}, [accessToken, fetchConnectedAccounts])

// Connect a new platform
const connectPlatform = useCallback(async (platformId: string) => {
  if (!accessToken) {
    setError('Authentication required')
    return
  }

  try {
    setLoading(true)
    setError(null)

    // Map platform IDs to provider names
    const providerMap: { [key: string]: string } = {
      'instagram': 'instagram',
      'twitter': 'twitter',
      'youtube': 'youtube',
      'tiktok': 'tiktok',
      'facebook': 'facebook',
        'linkedin': 'linkedin'
    }

    const provider = providerMap[platformId]
    if (!provider) {
      throw new Error('Invalid platform')
    }
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SOCIALBU.ACCOUNTS_CONNECT), {
      method: 'POST',
      headers: getAuthenticatedHeaders(),
      body: JSON.stringify({
        provider: provider,
        user_id: userId, // This should come from user data
        postback_url: "https://a0db020b7848.ngrok-free.app/api/webhook/socialbu"
      })
    })

    if (!response.ok) {
      throw new Error('Failed to initiate connection')
    }

    const data = await response.json()

    if (data.success && data.data?.connect_url) {
      // Open the connect URL in a new tab
      window.open(data.data.connect_url, '_blank')
    } else {
      throw new Error(data.message || 'Failed to get connection URL')
    }
  } catch (err: any) {
    console.error('Error connecting platform:', err)
    setError(err.message || 'Failed to connect platform')
  } finally {
    setLoading(false)
  }
}, [accessToken])

// Check if a platform is connected
const isPlatformConnected = useCallback((platformType: string) => {
  return connectedAccounts.some(account => account.type === platformType)
}, [connectedAccounts])

// Get connected account for a platform
const getConnectedAccount = useCallback((platformType: string) => {
  return connectedAccounts.find(account => account.type === platformType)
}, [connectedAccounts])

// Auto-fetch when access token is available
useEffect(() => {
  if (accessToken) {
    fetchConnectedAccounts()
  }
}, [accessToken, fetchConnectedAccounts])

// Auto-refetch when user returns to the website (handles webhook callbacks)
useEffect(() => {
  const debouncedRefetch = () => {
    if (refetchTimeoutRef.current) {
      clearTimeout(refetchTimeoutRef.current)
    }

    refetchTimeoutRef.current = setTimeout(() => {
      if (accessToken) {
        fetchConnectedAccounts()
      }
    }, 3000)
  }

  const handleVisibilityChange = () => {
    if (!document.hidden && accessToken) {
      debouncedRefetch()
    }
  }

  const handleFocus = () => {
    if (accessToken) {
      debouncedRefetch()
    }
  }

  // Listen for visibility changes (tab switching)
  document.addEventListener('visibilitychange', handleVisibilityChange)

  // Listen for window focus (returning from another app)
  window.addEventListener('focus', handleFocus)

  return () => {
    if (refetchTimeoutRef.current) {
      clearTimeout(refetchTimeoutRef.current)
    }
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    window.removeEventListener('focus', handleFocus)
  }
}, [accessToken, fetchConnectedAccounts])

return {
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
}
}
