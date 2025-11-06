'use client'

import { useState, useCallback, useEffect } from 'react'
import { Trend } from '@/lib/api-service'
import { apiService } from '@/lib/api-service'
import { UseFormWatch, UseFormSetValue, UseFormTrigger } from 'react-hook-form'
import { CreateVideoFormData } from '@/components/ui/form-validation-schema'

interface UseCityTrendsProps {
  watch: UseFormWatch<CreateVideoFormData>
  setValue: UseFormSetValue<CreateVideoFormData>
  trigger: UseFormTrigger<CreateVideoFormData>
  savedVideoTopic: string | null
}

interface UseCityTrendsReturn {
  cityTrends: Trend[]
  cityTrendsLoading: boolean
  cityTrendsError: string | null
  missingFieldsError: string | null
  realEstateValidationError: string | null
  allTrends: Trend[]
  fetchCityTrends: (city: string, position?: string) => Promise<void>
}

export function useCityTrends({
  watch,
  setValue,
  trigger,
  savedVideoTopic
}: UseCityTrendsProps): UseCityTrendsReturn {
  const [cityTrends, setCityTrends] = useState<Trend[]>([])
  const [cityTrendsLoading, setCityTrendsLoading] = useState(false)
  const [cityTrendsError, setCityTrendsError] = useState<string | null>(null)
  const [lastFetchedCity, setLastFetchedCity] = useState<string | null>(null)
  const [lastFetchedPosition, setLastFetchedPosition] = useState<string | null>(null)
  const [missingFieldsError, setMissingFieldsError] = useState<string | null>(null)
  const [realEstateValidationError, setRealEstateValidationError] = useState<string | null>(null)

  const safeCityTrends = Array.isArray(cityTrends) ? cityTrends : []
  const allTrends = safeCityTrends

  const fetchCityTrends = useCallback(async (city: string, position?: string) => {
    const cityValue = city?.trim() || ''
    const positionValue = position?.trim() || watch('position')?.trim() || ''

    if (!cityValue || !positionValue) {
      setCityTrends([])
      setLastFetchedCity(null)
      setLastFetchedPosition(null)
      setMissingFieldsError('Please select the position and city first')
      setCityTrendsError(null)
      return
    }

    setMissingFieldsError(null)
    const cacheKey = `${cityValue}|${positionValue}`
    const lastCacheKey = lastFetchedCity && lastFetchedPosition
      ? `${lastFetchedCity}|${lastFetchedPosition}`
      : null

    if (cacheKey === lastCacheKey) {
      return
    }

    try {
      setCityTrendsLoading(true)
      setCityTrendsError(null)
      setMissingFieldsError(null)
      const response = await apiService.getCityTrends(cityValue, positionValue)

      if (response.success && response.data) {
        const trendsData = response.data.trends || []

        if (Array.isArray(trendsData)) {
          setCityTrends(trendsData)
          setCityTrendsError(null)
          setMissingFieldsError(null)
          setRealEstateValidationError(null)
          setLastFetchedCity(cityValue)
          setLastFetchedPosition(positionValue)

          if (savedVideoTopic && savedVideoTopic.trim()) {
            const matchingTrend = trendsData.find(trend => trend.description === savedVideoTopic)
            if (matchingTrend) {
              setValue('videoTopic', savedVideoTopic as any)
              setValue('topicKeyPoints', matchingTrend.keypoints as any)
              trigger('videoTopic' as any)
            }
          }
        } else {
          setCityTrendsError('Invalid city trends data format')
          setCityTrends([])
        }
      } else {
        const errorMessage = response.message || response.error || 'Failed to fetch city trends'
        const isRealEstateValidationError = errorMessage.includes('must be related to real estate topics') ||
          errorMessage.includes('Required categories:') ||
          errorMessage.includes('Real Estate') ||
          errorMessage.includes('Examples include')

        if (isRealEstateValidationError) {
          setRealEstateValidationError(errorMessage)
          setCityTrendsError(null)
        } else {
          setCityTrendsError(errorMessage)
          setRealEstateValidationError(null)
        }
        setCityTrends([])
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load city trends'
      const isRealEstateValidationError = errorMessage.includes('must be related to real estate topics') ||
        errorMessage.includes('Required categories:') ||
        errorMessage.includes('Real Estate') ||
        errorMessage.includes('Examples include')

      if (isRealEstateValidationError) {
        setRealEstateValidationError(errorMessage)
        setCityTrendsError(null)
      } else {
        setCityTrendsError(errorMessage)
        setRealEstateValidationError(null)
      }
      setCityTrends([])
    } finally {
      setCityTrendsLoading(false)
    }
  }, [lastFetchedCity, lastFetchedPosition, savedVideoTopic, setValue, trigger, watch])

  const watchedPosition = watch('position')
  useEffect(() => {
    const cityValue = watch('city')
    if (watchedPosition && watchedPosition.trim() && cityValue && cityValue.trim()) {
      fetchCityTrends(cityValue, watchedPosition)
    } else if (watchedPosition && watchedPosition.trim()) {
      setMissingFieldsError('Please select the position and city first')
    }
  }, [watchedPosition, fetchCityTrends, watch])

  return {
    cityTrends,
    cityTrendsLoading,
    cityTrendsError,
    missingFieldsError,
    realEstateValidationError,
    allTrends,
    fetchCityTrends
  }
}

