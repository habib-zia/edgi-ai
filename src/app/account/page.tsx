'use client'

import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { updateUser } from '@/store/slices/userSlice'
import { ProfileInfoSection } from '@/components/ui'
import SubscriptionDetailsSection from '@/components/ui/subscription-details-section'
import ProtectedRoute from '@/components/features/auth/ProtectedRoute'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { apiService } from '@/lib/api-service'
import StripeProvider from '@/components/providers/StripeProvider'
import { PaymentMethods } from '@/components/payment/PaymentMethods'

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
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')

  // Synchronize profile data with Redux store
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

  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)

    // Auto hide toast after 5 seconds
    setTimeout(() => {
      setShowToast(false)
    }, 5000)
  }

  const handleProfileInputChange = (field: keyof ProfileFormData, value: string) => {
    // Only allow changes to firstName, lastName, and phone
    if (field === 'email' || field === 'password')
    {
      return
    }

    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error when user starts typing
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

      // Validate required fields
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

      // Call the API to update profile
      const response = await apiService.updateProfile({
        firstName: profileData.firstName.trim(),
        lastName: profileData.lastName.trim(),
        phone: profileData.phone.trim()
      })

      if (response.success && response.data)
      {
        // Update user data in Redux store
        dispatch(updateUser({
          firstName: response.data!.user.firstName,
          lastName: response.data!.user.lastName,
          phone: response.data!.user.phone
        }))

        // Update local form state with the new data from the server
        setProfileData(prev => ({
          ...prev,
          firstName: response.data!.user.firstName || '',
          lastName: response.data!.user.lastName || '',
          phone: response.data!.user.phone || ''
        }))

        showToastMessage('Profile updated successfully!', 'success')
      } else
      {
        showToastMessage(response.message || 'Failed to update profile. Please try again.', 'error')
      }
    } catch (error)
    {
      console.error('Error updating profile:', error)
      showToastMessage('Something went wrong. Please try again.', 'error')
    } finally
    {
      setIsUpdating(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white py-8 xl:px-0 px-3">
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
              isEmailVerified={currentUser?.isEmailVerified || false}
              onUpdateProfile={handleUpdateProfile}
              isUpdating={isUpdating}
            />

            {/* Subscription Details Section */}
            <SubscriptionDetailsSection />


            <StripeProvider>
      <PaymentMethods authToken={accessToken || ''} />
    </StripeProvider>

          </div>

          {/* Toast Notification */}
          {showToast && (
            <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-2">
              <div className={`px-4 py-3 rounded-lg shadow-lg max-w-sm ${toastType === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
                }`}>
                <div className="flex items-center gap-2">
                  {toastType === 'success' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <p className="text-sm font-medium">{toastMessage}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}