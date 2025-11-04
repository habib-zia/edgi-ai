'use client'

import { useEffect } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { clearUser } from '@/store/slices/userSlice'
import { isTokenExpired } from '@/lib/jwt-client'
import { useNotificationStore } from '@/components/ui/global-notification'

export function useAuthErrorHandler() {
  const dispatch = useAppDispatch()
  const { showNotification } = useNotificationStore()

  useEffect(() => {
    // Create a global fetch interceptor
    const originalFetch = window.fetch

    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args)
        
        // Check if response is 401 (Unauthorized)
        if (response.status === 401) {
          const responseData = await response.clone().json().catch(() => ({}))
          
          // Check if it's a token-related error
          if (responseData.message?.includes('token') || 
              responseData.message?.includes('unauthorized') ||
              responseData.message?.includes('expired')) {
            // Safeguard: only force logout if the client-side token is missing or actually expired
            const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
            const shouldLogout = !token || isTokenExpired(token)

            if (shouldLogout) {
              console.log('🔐 Auth Error Handler: Token expired or invalid, logging out user')
              dispatch(clearUser())
              
              // Check if we're on a protected page - if so, don't show toast (ProtectedRoute will handle it)
              const currentPath = window.location.pathname
              const isProtectedPage = currentPath.includes('/create-video') || 
                                   currentPath.includes('/account') || 
                                   currentPath.includes('/gallery') || 
                                   currentPath.includes('/report-analytics') || 
                                   currentPath.includes('/scheduled-post')
              
              // Never show toast for protected pages - ProtectedRoute handles it
              if (!isProtectedPage) {
                // Only show toast for API calls on non-protected pages
                showNotification('Unauthorized access', 'error')
              }
              
              return new Response(JSON.stringify({ 
                success: false, 
                message: 'Authentication failed' 
              }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
              })
            }
            
            // If token exists and is not expired client-side, don't auto-logout; let the caller handle the 401
            console.log('🔐 Auth Error Handler: 401 received but token appears valid client-side; not logging out')
            return response
          }
        }
        
        // Check for network errors (status 0 or failed fetch)
        if (response.status === 0 || !response.ok) {
          console.log('🔐 Auth Error Handler: Network error detected, not clearing user data')
          // Don't clear user data on network errors - might be temporary
          return response
        }
        
        return response
      } catch (error) {
        console.error('Fetch interceptor error:', error)
        return originalFetch(...args)
      }
    }

    // Cleanup function
    return () => {
      window.fetch = originalFetch
    }
  }, [dispatch, showNotification])
}
