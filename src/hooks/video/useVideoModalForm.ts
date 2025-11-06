'use client'

import { useState, useEffect, useCallback } from 'react'

export interface VideoFormData {
  prompt: string
  description: string
  conclusion: string
}

export interface VideoFormErrors {
  prompt: string
  description: string
  conclusion: string
}

interface UseVideoModalFormProps {
  webhookResponse?: {
    prompt?: string
    description?: string
    conclusion?: string
  } | null
}

export function useVideoModalForm({ webhookResponse }: UseVideoModalFormProps = {}) {
  const [formData, setFormData] = useState<VideoFormData>({
    prompt: webhookResponse?.prompt || '',
    description: webhookResponse?.description || '',
    conclusion: webhookResponse?.conclusion || ''
  })
  const [errors, setErrors] = useState<VideoFormErrors>({
    prompt: '',
    description: '',
    conclusion: ''
  })

  // Update form data when webhookResponse changes
  useEffect(() => {
    if (webhookResponse) {
      const newFormData = {
        prompt: webhookResponse.prompt || '',
        description: webhookResponse.description || '',
        conclusion: webhookResponse.conclusion || ''
      }
      setFormData(newFormData)
    }
  }, [webhookResponse])

  const handleInputChange = useCallback((field: keyof VideoFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }, [errors])

  const validateForm = useCallback((): boolean => {
    const newErrors: VideoFormErrors = {
      prompt: '',
      description: '',
      conclusion: ''
    }

    if (!formData.prompt.trim()) {
      newErrors.prompt = 'Prompt is required'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (!formData.conclusion.trim()) {
      newErrors.conclusion = 'Conclusion is required'
    }

    setErrors(newErrors)
    return !newErrors.prompt && !newErrors.description && !newErrors.conclusion
  }, [formData])

  const resetForm = useCallback(() => {
    setFormData({
      prompt: webhookResponse?.prompt || '',
      description: webhookResponse?.description || '',
      conclusion: webhookResponse?.conclusion || ''
    })
    setErrors({ prompt: '', description: '', conclusion: '' })
  }, [webhookResponse])

  return {
    formData,
    errors,
    handleInputChange,
    validateForm,
    resetForm
  }
}

