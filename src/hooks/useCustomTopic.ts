'use client'

import { useState, useCallback, useEffect } from 'react'
import { apiService } from '@/lib/api-service'
import { UseFormSetValue, UseFormTrigger } from 'react-hook-form'
import { CreateVideoFormData } from '@/components/ui/form-validation-schema'

interface UseCustomTopicProps {
  setValue: UseFormSetValue<CreateVideoFormData>
  trigger: UseFormTrigger<CreateVideoFormData>
  formManuallyTouched: boolean
}

interface UseCustomTopicReturn {
  showCustomTopicInput: boolean
  customTopicValue: string
  keyPointsLoading: boolean
  keyPointsError: string | null
  setShowCustomTopicInput: React.Dispatch<React.SetStateAction<boolean>>
  setCustomTopicValue: React.Dispatch<React.SetStateAction<string>>
  handleCustomTopicClick: () => void
  handleCustomTopicChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleCustomTopicBlur: () => void
}

export function useCustomTopic({
  setValue,
  trigger,
  formManuallyTouched
}: UseCustomTopicProps): UseCustomTopicReturn {
  const [showCustomTopicInput, setShowCustomTopicInput] = useState(false)
  const [customTopicValue, setCustomTopicValue] = useState('')
  const [keyPointsLoading, setKeyPointsLoading] = useState(false)
  const [keyPointsError, setKeyPointsError] = useState<string | null>(null)

  const generateCustomTopicKeyPoints = useCallback(async (description: string) => {
    if (!description || description.trim() === '') {
      return
    }

    try {
      setKeyPointsLoading(true)
      setKeyPointsError(null)
      const response = await apiService.getDescriptionKeypoints(description.trim())

      if (response.success && response.data) {
        const keypoints = response.data.keypoints || ''
        if (keypoints.trim()) {
          setValue('topicKeyPoints', keypoints as any, { shouldValidate: true, shouldDirty: true })
          trigger('topicKeyPoints' as any)
        }

        setValue('videoTopic', description.trim() as any, { shouldValidate: true, shouldDirty: true })
      } else {
        setKeyPointsError(response.message || 'Failed to generate key points')
      }
    } catch (error: any) {
      setKeyPointsError(error.message || 'Failed to generate key points')
    } finally {
      setKeyPointsLoading(false)
    }
  }, [setValue, trigger])

  const handleCustomTopicClick = useCallback(() => {
    setShowCustomTopicInput(true)
    setCustomTopicValue('')
    setValue('videoTopic', '' as any, { shouldValidate: false, shouldDirty: true })
    setValue('topicKeyPoints', '' as any, { shouldValidate: false, shouldDirty: true })
  }, [setValue])

  const handleCustomTopicChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCustomTopicValue(value)
  }, [])

  const handleCustomTopicBlur = useCallback(() => {
    if (customTopicValue && customTopicValue.trim()) {
      generateCustomTopicKeyPoints(customTopicValue)
    }
  }, [customTopicValue, generateCustomTopicKeyPoints])

  useEffect(() => {
    if (showCustomTopicInput) {
      setTimeout(() => {
        const customTopicInput = document.querySelector('input[placeholder="Enter your custom topic"]') as HTMLInputElement
        if (customTopicInput) {
          customTopicInput.focus()
        }
      }, 100)
    }
  }, [showCustomTopicInput])

  return {
    showCustomTopicInput,
    customTopicValue,
    keyPointsLoading,
    keyPointsError,
    setShowCustomTopicInput,
    setCustomTopicValue,
    handleCustomTopicClick,
    handleCustomTopicChange,
    handleCustomTopicBlur
  }
}

