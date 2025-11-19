'use client'

import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { updateUser } from '@/store/slices/userSlice'
import { ProfileInfoSection } from '@/components/ui'
import SubscriptionDetailsSection from '@/components/ui/subscription-details-section'
import ProtectedRoute from '@/components/features/auth/ProtectedRoute'
import { apiService } from '@/lib/api-service'
import StripeProvider from '@/components/providers/StripeProvider'
import { PaymentMethods } from '@/components/PaymentMethods'
import { useNotificationStore } from '@/components/ui/global-notification'

interface ProfileFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
}

interface FormErrors {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
}

export default function AccountPage() {
  const { user: currentUser, accessToken } = useAppSelector((state) => state.user)
  const dispatch = useAppDispatch()
  const { showNotification } = useNotificationStore()

  const [profileData, setProfileData] = useState<ProfileFormData>({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    password: ''
  })

  const [errors, setErrors] = useState<FormErrors>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: ''
  })

  const [isUpdating, setIsUpdating] = useState(false)
  useEffect(() => {
    if (currentUser && currentUser.id !== 'temp')
    {
      setProfileData(prev => ({
        ...prev,
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
        phone: currentUser.phone || ''
      }))
    }
  }, [currentUser])

  const handleProfileInputChange = (field: keyof ProfileFormData, value: string) => {
    if (field === 'email' || field === 'password')
    {
      return
    }

    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
    if (errors[field])
    {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleUpdateProfile = async () => {
    try
    {
      setIsUpdating(true)
      setErrors({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: ''
      })

      const newErrors: FormErrors = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: ''
      }

      if (!profileData.firstName.trim())
      {
        newErrors.firstName = 'First name is required'
      }

      if (!profileData.lastName.trim())
      {
        newErrors.lastName = 'Last name is required'
      }

      if (Object.values(newErrors).some(error => error !== ''))
      {
        setErrors(newErrors)
        return
      }

      const response = await apiService.updateProfile({
        firstName: profileData.firstName.trim(),
        lastName: profileData.lastName.trim(),
        phone: profileData.phone.trim()
      })

      if (response.success && response.data)
      {
        dispatch(updateUser({
          firstName: response.data!.user.firstName,
          lastName: response.data!.user.lastName,
          phone: response.data!.user.phone
        }))
        setProfileData(prev => ({
          ...prev,
          firstName: response.data!.user.firstName || '',
          lastName: response.data!.user.lastName || '',
          phone: response.data!.user.phone || ''
        }))

        showNotification('Profile updated successfully!', 'success')
      } else
      {
        showNotification(response.message || 'Failed to update profile. Please try again.', 'error')
      }
    } catch (error)
    {
      console.error('Error updating profile:', error)
      showNotification('Something went wrong. Please try again.', 'error')
    } finally
    {
      setIsUpdating(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="bg-white py-8 xl:px-0 px-3">
        <div className="max-w-[870px] mx-auto">
          <div className="space-y-8">
            {/* Profile Info Section */}
            <ProfileInfoSection
              data={profileData}
              errors={{
                firstName: errors.firstName,
                lastName: errors.lastName,
                email: errors.email,
                phone: errors.phone,
                password: errors.password
              }}
              onChange={handleProfileInputChange}
              onUpdateProfile={handleUpdateProfile}
              isUpdating={isUpdating}
            />

            {/* Subscription Details Section */}
            <SubscriptionDetailsSection />
            <StripeProvider>
            <PaymentMethods authToken={accessToken || ''} />
            </StripeProvider>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}