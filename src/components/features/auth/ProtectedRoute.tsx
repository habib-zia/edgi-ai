'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/store/hooks'
import { useNotificationStore } from '@/components/ui/global-notification'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.user)
  const router = useRouter()
  const [authCheckComplete, setAuthCheckComplete] = useState(false)
  const { showNotification } = useNotificationStore()
  const hasShownToast = useRef(false)

  useEffect(() => {
    // Only mark auth check complete when loading is done AND we have a definitive auth status
    if (!isLoading) {
      setAuthCheckComplete(true)
    }
  }, [isLoading])

  useEffect(() => {
    // Only redirect after auth check is complete and user is not authenticated
    if (authCheckComplete && !isAuthenticated) {
      // Show toast notification before redirecting (only once per component instance)
      if (!hasShownToast.current) {
        showNotification('Please log in to access this page.', 'info')
        hasShownToast.current = true
      }
      router.push('/')
    }
  }, [authCheckComplete, isAuthenticated, router, showNotification])

  // Show loading state while checking authentication OR if auth check is complete but user is not authenticated
  // This prevents the protected content from rendering before redirect
  if (isLoading || !authCheckComplete || (authCheckComplete && !isAuthenticated)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, don't render children (will redirect)
  if (!isAuthenticated) {
    return null
  }

  // If authenticated, render children
  return <>{children}</>
}
