import { useState, useRef, useCallback, useEffect } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { setUser } from '@/store/slices/userSlice'
import { validateAndHandleToken } from '@/lib/jwt-client'
import { apiService } from '@/lib/api-service'
import { useNotificationStore } from '@/components/ui/global-notification'

// Google OAuth TypeScript declarations
declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (response: { access_token?: string; error?: string }) => void
          }) => {
            requestAccessToken: () => void
          }
        }
      }
    }
  }
}

interface UseGoogleAuthOptions {
  onSuccess?: () => void
  onClose?: () => void
  isSignup?: boolean
}

export function useGoogleAuth({ onSuccess, onClose, isSignup = false }: UseGoogleAuthOptions = {}) {
  const dispatch = useAppDispatch()
  const { showNotification } = useNotificationStore()
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const googleTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleGoogleToken = useCallback(
    async (accessToken: string) => {
      try {
        // Get user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })

        if (!userInfoResponse.ok) {
          throw new Error('Failed to get user info from Google')
        }

        const userInfo = await userInfoResponse.json()

        // Call backend API with Google user data
        const response = await apiService.googleLogin({
          googleId: userInfo.id,
          email: userInfo.email,
          firstName: userInfo.given_name || '',
          lastName: userInfo.family_name || ''
        })

        const data = response

        if (data.success && data.data) {
          // Validate JWT token before storing
          const token = data.data.accessToken
          if (!validateAndHandleToken(token)) {
            showNotification('Invalid token received. Please try again.', 'error')
            return
          }

          // Store the access token
          localStorage.setItem('accessToken', token)

          // Dispatch Redux action to set user data
          dispatch(
            setUser({
              user: {
                id: data.data.user.id,
                email: data.data.user.email,
                firstName: data.data.user.firstName,
                lastName: data.data.user.lastName,
                phone: data.data.user.phone || '',
                isEmailVerified: data.data.user.isEmailVerified,
                googleId: data.data.user.googleId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              accessToken: token
            })
          )

          // Check pending workflows after socket connection is established
          if (data.data?.user?.id) {
            const userId = data.data.user.id
            const handleSocketConnected = () => {
              console.log('🔌 Socket connected event received after Google signin, checking pending workflows')
              apiService.checkPendingWorkflows(userId)
                .catch(error => {
                  console.error('Failed to check pending workflows after Google signin socket connection:', error)
                })
              window.removeEventListener('socket-connected', handleSocketConnected as EventListener)
            }

            // Listen for socket connection event
            window.addEventListener('socket-connected', handleSocketConnected as EventListener)
            
            // Fallback: Check pending workflows after a delay if socket doesn't connect
            setTimeout(() => {
              console.log('🔌 Fallback: Checking pending workflows after Google signin delay')
              apiService.checkPendingWorkflows(userId)
                .catch(error => {
                  console.error('Failed to check pending workflows after Google signin fallback delay:', error)
                })
              // Remove the event listener if fallback is used
              window.removeEventListener('socket-connected', handleSocketConnected as EventListener)
            }, 2000)
          }

          // Clear saved form data from localStorage after successful registration
          localStorage.removeItem('signupFormData')

          // Show success message
          const welcomeMessage = data.data.isNewUser
            ? `Welcome to EdgeAi, ${data.data.user.firstName}! Your account has been created successfully.`
            : `Welcome back to EdgeAi, ${data.data.user.firstName}!`
          showNotification(welcomeMessage, 'success')

          onSuccess?.()
          onClose?.()
        } else {
          showNotification(data.message || 'Google authentication failed. Please try again.', 'error')
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        showNotification(`Google token handling error: ${errorMessage}`, 'error')
      } finally {
        if (googleTimeoutRef.current) {
          clearTimeout(googleTimeoutRef.current)
          googleTimeoutRef.current = null
        }
        setIsGoogleLoading(false)
      }
    },
    [dispatch, showNotification, onSuccess, onClose]
  )

  const handleGoogleAuth = useCallback(async () => {
    setIsGoogleLoading(true)

    try {
      // Initialize Google OAuth
      if (typeof window !== 'undefined' && window.google) {
        // Use Google Identity Services
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
          scope: 'openid email profile',
          callback: async (response: { access_token?: string; error?: string }) => {
            try {
              if (response.access_token) {
                await handleGoogleToken(response.access_token)
              } else if (response.error) {
                showNotification(`Google authentication failed: ${response.error}`, 'error')
              } else {
                showNotification('Google authentication was cancelled', 'error')
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : String(error)
              showNotification(`Google authentication error: ${errorMessage}`, 'error')
            } finally {
              if (googleTimeoutRef.current) {
                clearTimeout(googleTimeoutRef.current)
                googleTimeoutRef.current = null
              }
              // Only reset loading state if handleGoogleToken wasn't called
              if (!response.access_token) {
                setIsGoogleLoading(false)
              }
            }
          }
        })

        client.requestAccessToken()

        // Set a timeout to reset loading state if callback doesn't fire
        googleTimeoutRef.current = setTimeout(() => {
          setIsGoogleLoading(false)
          showNotification('Google authentication timed out. Please try again.', 'error')
          googleTimeoutRef.current = null
        }, 30000) // 30 second timeout
      } else {
        // Fallback to traditional OAuth flow
        const authUrl =
          `https://accounts.google.com/o/oauth2/auth?` +
          `client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}&` +
          `redirect_uri=${encodeURIComponent(`${window.location.origin}/auth/google/callback`)}&` +
          `scope=${encodeURIComponent('openid email profile')}&` +
          `response_type=code&` +
          `access_type=offline`

        window.location.href = authUrl
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      showNotification(`Google authentication error: ${errorMessage}`, 'error')
      setIsGoogleLoading(false)
    }
  }, [handleGoogleToken, showNotification])

  // Load Google OAuth script
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.google) {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  }, [])

  const cleanup = useCallback(() => {
    if (googleTimeoutRef.current) {
      clearTimeout(googleTimeoutRef.current)
      googleTimeoutRef.current = null
    }
    setIsGoogleLoading(false)
  }, [])

  return {
    isGoogleLoading,
    handleGoogleAuth,
    cleanup
  }
}

