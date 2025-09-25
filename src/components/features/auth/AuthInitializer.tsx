'use client'

import { useEffect } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { setUser, setLoading } from '@/store/slices/userSlice'
import { apiService } from '@/lib/api-service'
import { validateAndHandleToken } from '@/lib/jwt-client'

export default function AuthInitializer() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const initializeAuth = async () => {
      const startTime = Date.now()
      dispatch(setLoading(true))

      try
      {
        // Check if access token exists in localStorage
        const accessToken = localStorage.getItem('accessToken')

        if (!accessToken)
        {
          console.log('🔐 AuthInitializer: No access token found')
          // Ensure minimum loading time to prevent flickering
          const elapsed = Date.now() - startTime
          if (elapsed < 1000)
          {
            await new Promise(resolve => setTimeout(resolve, 1000 - elapsed))
          }
          dispatch(setLoading(false))
          return
        }

        console.log('🔐 AuthInitializer: Found access token, validating...')

        // Validate JWT token
        if (!validateAndHandleToken(accessToken))
        {
          console.log('🔐 AuthInitializer: Token validation failed')
          // Token is invalid or expired, clear it
          localStorage.removeItem('accessToken')
          localStorage.removeItem('user')
          // Ensure minimum loading time to prevent flickering
          const elapsed = Date.now() - startTime
          if (elapsed < 1000)
          {
            await new Promise(resolve => setTimeout(resolve, 1000 - elapsed))
          }
          dispatch(setLoading(false))
          return
        }

        console.log('🔐 AuthInitializer: Client-side token validation passed')

        try
        {
          // Validate token using the new Express backend
          const response = await apiService.getCurrentUser()

          if (response.success && response.data && response.data.user)
          {
            // Set user data in Redux store with required fields
            const userData = {
              id: response.data.user.id,
              email: response.data.user.email,
              firstName: response.data.user.firstName,
              lastName: response.data.user.lastName,
              phone: response.data.user.phone || '',
              isEmailVerified: response.data.user.isEmailVerified,
              googleId: response.data.user.googleId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }

            dispatch(setUser({
              user: userData,
              accessToken: accessToken
            }))

            // Check pending workflows after socket connection is established
            const handleSocketConnected = () => {
              console.log('🔌 Socket connected event received, checking pending workflows')
              apiService.checkPendingWorkflows(userData.id)
                .catch(error => {
                  console.error('Failed to check pending workflows after socket connection:', error);
                  // Don't show error to user as this is background operation
                });
              // Remove the event listener after first use
              window.removeEventListener('socket-connected', handleSocketConnected as EventListener)
            }

            // Listen for socket connection event
            window.addEventListener('socket-connected', handleSocketConnected as EventListener)
            
            // Fallback: Check pending workflows after a delay if socket doesn't connect
            setTimeout(() => {
              console.log('🔌 Fallback: Checking pending workflows after delay')
              apiService.checkPendingWorkflows(userData.id)
                .catch(error => {
                  console.error('Failed to check pending workflows after fallback delay:', error);
                  // Don't show error to user as this is background operation
                });
              // Remove the event listener if fallback is used
              window.removeEventListener('socket-connected', handleSocketConnected as EventListener)
            }, 2000)
          } else
          {
            // Check if it's a 401 error (user deleted or token invalid)
            if (response.status === 401 || (response.error && response.error.includes('401'))) {
              console.log('🔐 AuthInitializer: 401 error - user deleted or token invalid, clearing auth')
              localStorage.removeItem('accessToken')
              localStorage.removeItem('user')
              dispatch(setLoading(false))
              return
            }
            
            // Don't remove token immediately - might be a temporary server issue
            // Set a minimal user state to prevent logout
            dispatch(setUser({
              user: {
                id: 'temp',
                email: 'loading...',
                firstName: 'Loading...',
                lastName: '',
                phone: '',
                isEmailVerified: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              accessToken: accessToken
            }))
          }
        } catch (error)
        {
          console.error('Token validation error:', error)
          
          // Check if it's a 401 error (user deleted or token invalid)
          if (error instanceof Error && error.message.includes('401')) {
            console.log('🔐 AuthInitializer: 401 error in catch - user deleted or token invalid, clearing auth')
            localStorage.removeItem('accessToken')
            localStorage.removeItem('user')
            dispatch(setLoading(false))
            return
          }
          
          // Don't remove token on network errors - might be temporary
          // Set a minimal user state to prevent logout
          dispatch(setUser({
            user: {
              id: 'temp',
              email: 'loading...',
              firstName: 'Loading...',
              lastName: '',
              phone: '',
              isEmailVerified: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            accessToken: accessToken
          }))
        }
      } catch (error)
      {
        console.error('Auth initialization error:', error)
      } finally
      {
        // Ensure minimum loading time to prevent flickering
        const elapsed = Date.now() - startTime
        if (elapsed < 1000)
        {
          await new Promise(resolve => setTimeout(resolve, 1000 - elapsed))
        }
        dispatch(setLoading(false))
      }
    }

    initializeAuth()
  }, [dispatch])

  return null
}
