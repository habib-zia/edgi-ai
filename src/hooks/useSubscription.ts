'use client'

import { useState, useCallback } from 'react'
import { apiService, type SubscriptionData } from '@/lib/api-service'

export interface SubscriptionUsage {
  videoCount: number
  videoLimit: number
  isLimitReached: boolean
  remainingVideos: number
  usagePercentage: number
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSubscription = useCallback(async (): Promise<SubscriptionData | null> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiService.getCurrentSubscription()
      
      if (response.success && response.data?.subscription) {
        const subscriptionData = response.data.subscription
        setSubscription(subscriptionData)
        return subscriptionData
      } else {
        setError(response.message || 'Failed to fetch subscription details')
        return null
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load subscription details'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const getUsageInfo = useCallback((subscriptionData?: SubscriptionData): SubscriptionUsage => {
    const data = subscriptionData || subscription
    if (!data) {
      return {
        videoCount: 0,
        videoLimit: 0,
        isLimitReached: true,
        remainingVideos: 0,
        usagePercentage: 100
      }
    }

    const videoCount = data.videoCount || 0
    const videoLimit = data.videoLimit || 0
    const remainingVideos = Math.max(0, videoLimit - videoCount)
    const isLimitReached = videoCount >= videoLimit
    const usagePercentage = videoLimit > 0 ? (videoCount / videoLimit) * 100 : 0

    return {
      videoCount,
      videoLimit,
      isLimitReached,
      remainingVideos,
      usagePercentage
    }
  }, [subscription])

  const checkVideoUsageLimit = useCallback(async (): Promise<{
    canCreateVideo: boolean
    usageInfo: SubscriptionUsage
    message?: string
  }> => {
    const subscriptionData = await fetchSubscription()
    const usageInfo = getUsageInfo(subscriptionData || undefined)

    if (!subscriptionData) {
      return {
        canCreateVideo: false,
        usageInfo,
        message: 'No active subscription found. Please subscribe to create content.'
      }
    }

    // Check if subscription status is pending
    if (subscriptionData.status === 'pending') {
      return {
        canCreateVideo: false,
        usageInfo,
        message: 'Your payment is still being processed. Please wait for payment confirmation before creating videos.'
      }
    }

    if (usageInfo.isLimitReached) {
      return {
        canCreateVideo: false,
        usageInfo,
        message: `You've reached your video limit (${usageInfo.videoCount}/${usageInfo.videoLimit}). Upgrade your subscription to create more videos.`
      }
    }

    return {
      canCreateVideo: true,
      usageInfo,
      message: `You have ${usageInfo.remainingVideos} videos remaining this period.`
    }
  }, [fetchSubscription, getUsageInfo])

  return {
    subscription,
    loading,
    error,
    fetchSubscription,
    getUsageInfo,
    checkVideoUsageLimit
  }
}
