'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/features/auth/ProtectedRoute'

export default function GalleryPage() {
  const router = useRouter()
  const { user } = useSelector((state: RootState) => state.user)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    if (!user)
    {
      router.push('/auth/login')
      return
    }
    setIsLoading(false)
  }, [user, router])

  if (isLoading)
  {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    )
  }

  if (!user)
  {
    return null // Will redirect to login
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Video Gallery</h1>
            <p className="mt-2 text-gray-600">
              View and manage all your created videos
            </p>
          </div>

          {/* <VideoGallery userId={user._id} /> */}
        </div>
      </div>
    </ProtectedRoute>
  )
}
